const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

async function castVote({ voterId, electionId, votes, otpId = null }) {
  // votes: array of { portfolio_id, candidate_id or skip }
  // transactional to ensure atomicity
  if (!models) throw new Error('ORM not initialized');
  return models.sequelize.transaction(async (trx) => {
    const voter = await models.Voter.findOne({ where: { id: voterId, election_id: electionId }, transaction: trx });
    if (!voter) throw new Error('voter not found or not registered for this election');

    const prev = await models.Log.findOne({ where: { voter_id: voterId, action: 'cast_vote' }, transaction: trx });
    if (prev) throw new Error('voter has already voted');

    const election = await models.Election.findByPk(electionId, { transaction: trx });
    if (!election) throw new Error('election not found');
    const now = new Date();
    if (election.start_time && new Date(election.start_time) > now) throw new Error('election not started');
    if (election.end_time && new Date(election.end_time) < now) throw new Error('election ended');
    if (!election.is_active) throw new Error('election not active');

    const allowed = election.max_votes_per_voter || 1;
    const actualVotes = votes.filter((v) => !v.skip_vote).length;
    if (actualVotes > allowed) throw new Error('over-voting detected');
    if (actualVotes < allowed && !election.allow_under_voting) throw new Error('under-voting not allowed for this election');

    for (const v of votes) {
      await models.Vote.create({ candidate_id: v.candidate_id || null, skip_vote: !!v.skip_vote, portfolio_id: v.portfolio_id, election_id: electionId, voter_id: voterId }, { transaction: trx });
    }

    await models.Log.create({ user_id: null, voter_id: voterId, action: 'cast_vote', ip_address: null, details: JSON.stringify({ votesCount: votes.length }) }, { transaction: trx });

    // If an otpId was provided, mark that OTP as used as part of this transaction.
    if (otpId) {
      const otp = await models.Otp.findOne({ where: { id: otpId, voter_id: voterId }, transaction: trx, lock: trx.LOCK.UPDATE });
      if (!otp) throw new Error('OTP not found for voter');
      if (otp.used) throw new Error('OTP already used');
      const now = new Date();
      if (otp.expires_at && new Date(otp.expires_at) < now) throw new Error('OTP expired');
      await models.Otp.update({ used: true }, { where: { id: otpId }, transaction: trx });
      await models.Log.create({ voter_id: voterId, action: 'consume_otp', details: `OTP ${otpId} consumed on vote` }, { transaction: trx });
    }

    return { ok: true };
  });
}

module.exports = { castVote };
