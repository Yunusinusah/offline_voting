const db = require('../config/db');
const { models, sequelize } = db.orm;
const { emitToAdmins } = require("./socketService");

async function castVote({ voterId, electionId, votes }) {
  if (!models) throw new Error("ORM not initialized");
  return sequelize.transaction(async (trx) => {
    const voter = await models.Voter.findOne({
      where: { id: voterId, election_id: electionId },
      transaction: trx,
    });
    if (!voter)
      throw new Error("voter not found or not registered for this election");

    // const prev = await models.Log.findOne({
    //   where: { voter_id: voterId, action: "cast_vote" },
    //   transaction: trx,
    // });
    // if (prev) throw new Error("voter has already voted");

    const election = await models.Election.findByPk(electionId, {
      transaction: trx,
    });
    if (!election) throw new Error("election not found");
    const now = new Date();
    if (election.end_time && new Date(election.end_time) < now)
      throw new Error("election ended");
    for (const v of votes) {
      await models.Vote.create(
        {
          candidate_id: v.candidate || null,
          skip_vote: !!v.skip_vote,
          portfolio_id: v.portfolio,
          decision: v.decision || null,
          election_id: electionId,
        },
        { transaction: trx }
      );
    }

    await models.Log.create(
      {
        user_id: null,
        voter_id: voterId,
        action: "cast_vote",
        ip_address: null,
        details: JSON.stringify({ votesCount: votes.length }),
      },
      { transaction: trx }
    );

    await models.Voter.update(
      { has_voted: true },
      { where: { id: voterId }, transaction: trx }
    );

    try {
      emitToAdmins("vote_cast", { electionId });
    } catch (err) {
      console.error("Failed to emit vote_cast", err.message || err);
    }

    return { ok: true };
  });
}

module.exports = { castVote };
