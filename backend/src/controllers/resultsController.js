const db = require('../config/db');
const { orm,sequelize } = db;
const models = orm ? orm.models : null;
const { Op, fn, col } = require("sequelize");

exports.electionResults = async (req, res) => {
  try {
    if (!models) throw new Error('ORM not initialized');
    const electionId = req.full_user.election_id;

    const election = await models.Election.findByPk(electionId);

    const total = await models.Vote.count({ where: { election_id: electionId, skip_vote: false } });
    const skipped = await models.Vote.count({ where: { election_id: electionId, skip_vote: true } });

    // candidate-level results (total votes per candidate)
    const rows = await sequelize.query(`
      SELECT c.id, c.full_name, c.profile_picture, COUNT(v.id) as votes
      FROM candidates c
      LEFT JOIN votes v ON v.candidate_id = c.id AND v.election_id = :eid
      WHERE c.election_id = :eid
      GROUP BY c.id
      ORDER BY votes DESC
    `, { replacements: { eid: electionId }, type: sequelize.QueryTypes.SELECT });

    const rowsArr = Array.isArray(rows) ? rows : rows;
    const results = rowsArr.map((r) => ({ id: r.id, full_name: r.full_name, profile_picture: r.profile_picture, votes: parseInt(r.votes, 10) || 0, percentage: total > 0 ? Number(((parseInt(r.votes, 10) / total) * 100).toFixed(2)) : 0 }));

    // Reuse monitor-style aggregates: voters, participation, votingTrend, portfolios
    const totalVoters = await models.Voter.count({ where: { election_id: electionId } });
    const votesCast = await models.Voter.count({ where: { election_id: electionId, has_voted: true } });
    const participationRate = totalVoters > 0 ? Math.round((votesCast / totalVoters) * 100) : 0;

    const votingTrendRows = await models.Vote.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('vote_time'), '%H:%i'), 'time'],
        [fn('COUNT', col('id')), 'votes']
      ],
      where: { election_id: electionId },
      group: [fn('DATE_FORMAT', col('vote_time'), '%H:%i')],
      order: [[fn('DATE_FORMAT', col('vote_time'), '%H:%i'), 'ASC']],
      limit: 24,
      raw: true
    });

    const votingTrend = (votingTrendRows || []).map((r) => ({ time: r.time, votes: parseInt(r.votes || 0, 10) }));

    const portfolioData = await models.Portfolio.findAll({
      where: { election_id: electionId },
      include: [
        {
          model: models.Candidate,
          as: 'candidates',
          include: [{ model: models.Vote, as: 'votes', where: { election_id: electionId }, required: false }]
        }
      ],
      order: [['priority', 'ASC'], [{ model: models.Candidate, as: 'candidates' }, 'ballot_num', 'ASC']]
    });

    const portfolios = [];
    for (const portfolio of portfolioData) {
      const candidates = portfolio.candidates.map(candidate => {
        const votes = candidate.votes ? candidate.votes.length : 0;
        return { id: candidate.id, name: candidate.full_name, profile_picture: candidate.profile_picture || null, votes };
      });
      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
      if (candidates.length === 1) {
        try {
          // count YES/NO decisions for this portfolio in the votes table
          const decisionRows = await sequelize.query(
            `SELECT decision, COUNT(id) as cnt FROM votes WHERE election_id = :eid AND portfolio_id = :pid GROUP BY decision`,
            { replacements: { eid: electionId, pid: portfolio.id }, type: sequelize.QueryTypes.SELECT }
          );
          const yesRow = (decisionRows || []).find(r => r.decision === 'YES');
          const noRow = (decisionRows || []).find(r => r.decision === 'NO');
          const yesCount = yesRow ? parseInt(yesRow.cnt, 10) : 0;
          const noCount = noRow ? parseInt(noRow.cnt, 10) : 0;
          const tot = yesCount + noCount;
          const yesPct = tot > 0 ? Number(((yesCount / tot) * 100).toFixed(1)) : 0;
          const noPct = tot > 0 ? Number(((noCount / tot) * 100).toFixed(1)) : 0;
          portfolios.push({
            id: portfolio.id,
            name: portfolio.name,
            totalVotes: tot,
            // include decisionTarget so frontend can show who this YES/NO vote is about
            decisionTarget: { id: candidates[0].id, name: candidates[0].name },
            candidates: [
              { name: 'YES', votes: yesCount, percentage: yesPct },
              { name: 'NO', votes: noCount, percentage: noPct }
            ]
          });
          continue;
        } catch (err) {
          console.error('decision aggregation error', err);
          // fall through to default representation
        }
      }

      portfolios.push({ id: portfolio.id, name: portfolio.name, totalVotes, candidates: candidates.map(c => ({ name: c.name, votes: c.votes, percentage: totalVotes > 0 ? Number(((c.votes / totalVotes) * 100).toFixed(1)) : 0 })) });
    }
    const data = {
      electionId,
      election: election ? { id: election.id, title: election.title, is_active: election.is_active, start_time: election.start_time, end_time: election.end_time } : null,
      stats: { totalVoters, votesCast, participationRate },
      votingTrend,
      portfolios,
      total_votes: total,
      skipped_votes: skipped,
      results
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.monitor = async (req, res) => {
  try {
    if (!models) throw new Error('ORM not initialized');
    const electionId = req.full_user.election_id;

    // include basic election meta so admin UI knows if it's active
    const election = await models.Election.findByPk(electionId);

    // Overall stats
    const totalVoters = await models.Voter.count({
      where: { election_id: electionId }
    });

    const votesCast = await models.Voter.count({
      where: {
        election_id: electionId,
        has_voted: true
      }
    });


    const participationRate = totalVoters > 0 ? Math.round((votesCast / totalVoters) * 100) : 0;

    // Voting trend: group by 30-minute buckets (format HH:MM) ordered ascending
    const votingTrendRows = await models.Vote.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('vote_time'), '%H:%i'), 'time'],
        [fn('COUNT', col('id')), 'votes']
      ],
      where: {
        election_id: electionId
      },
      group: [fn('DATE_FORMAT', col('vote_time'), '%H:%i')],
      order: [[fn('DATE_FORMAT', col('vote_time'), '%H:%i'), 'ASC']],
      limit: 24,
      raw: true
    });

    const votingTrend = (votingTrendRows || []).map((r) => ({
      time: r.time,
      votes: parseInt(r.votes || 0, 10)
    }));

    // Portfolios with candidates and vote counts
    const portfolioData = await models.Portfolio.findAll({
      where: { election_id: electionId },
      include: [
        {
          model: models.Candidate,
          as: 'candidates', // adjust this alias based on your association
          include: [
            {
              model: models.Vote,
              as: 'votes', // adjust this alias based on your association
              where: { election_id: electionId },
              required: false
            }
          ]
        }
      ],
      order: [
        ['priority', 'ASC'],
        [{ model: models.Candidate, as: 'candidates' }, 'ballot_num', 'ASC']
      ]
    });

    // Process portfolios data (support YES/NO for single-candidate portfolios)
    const portfolios = [];
    for (const portfolio of portfolioData) {
      const candidates = portfolio.candidates.map(candidate => {
        const votes = candidate.votes ? candidate.votes.length : 0;
        return {
          id: candidate.id,
          name: candidate.full_name,
          profile_picture: candidate.profile_picture || null,
          votes: votes
        };
      });

      const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

      if (candidates.length === 1) {
        try {
          const decisionRows = await sequelize.query(
            `SELECT decision, COUNT(id) as cnt FROM votes WHERE election_id = :eid AND portfolio_id = :pid GROUP BY decision`,
            { replacements: { eid: electionId, pid: portfolio.id }, type: sequelize.QueryTypes.SELECT }
          );
          const yesRow = (decisionRows || []).find(r => r.decision === 'YES');
          const noRow = (decisionRows || []).find(r => r.decision === 'NO');
          const yesCount = yesRow ? parseInt(yesRow.cnt, 10) : 0;
          const noCount = noRow ? parseInt(noRow.cnt, 10) : 0;
          const tot = yesCount + noCount;
          const yesPct = tot > 0 ? Number(((yesCount / tot) * 100).toFixed(1)) : 0;
          const noPct = tot > 0 ? Number(((noCount / tot) * 100).toFixed(1)) : 0;
          portfolios.push({
              id: portfolio.id,
              name: portfolio.name,
              totalVotes: tot,
              decisionTarget: { id: candidates[0].id, name: candidates[0].name },
              candidates: [
                { name: 'YES', votes: yesCount, percentage: yesPct },
                { name: 'NO', votes: noCount, percentage: noPct }
              ]
          });
          continue;
        } catch (err) {
          console.error('decision aggregation error', err);
          // fall through to default representation
        }
      }

      portfolios.push({
        id: portfolio.id,
        name: portfolio.name,
        totalVotes: totalVotes,
        candidates: candidates.map(candidate => ({
          name: candidate.name,
          votes: candidate.votes,
          percentage: totalVotes > 0 ? Number(((candidate.votes / totalVotes) * 100).toFixed(1)) : 0
        }))
      });
    }
    const data = {
      electionId,
      election: election ? { id: election.id, title: election.title, is_active: election.is_active, start_time: election.start_time, end_time: election.end_time, server_time: new Date().toISOString() } : null,
      stats: { totalVoters, votesCast, participationRate },
      votingTrend,
      portfolios,
    }
    res.json(data);
  } catch (err) {
    console.error('monitor error', err);
    res.status(500).json({ error: err.message });
  }
};