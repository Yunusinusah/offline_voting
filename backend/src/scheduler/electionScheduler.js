const cron = require('node-cron');
const { models } = require('../models');
const { Op } = require('sequelize');
const { emitToAdmins } = require('../services/socketService');


async function checkAndToggleElections(logger = console) {
  try {
    const now = new Date();

    // Activate elections that have started but are not active
    const toActivate = await models.Election.findAll({
      where: {
        is_active: false,
        start_time: { [Op.lte]: now },
        [Op.or]: [
          { end_time: null },
          { end_time: { [Op.gt]: now } }
        ]
      }
    });

    for (const election of toActivate) {
      try {
        election.is_active = true;
        await election.save();
        logger.info && logger.info(`Activated election id=${election.id} title="${election.title}"`);
        // notify admin UIs
        try { emitToAdmins('election_started', { electionId: election.id, title: election.title, start_time: election.start_time, end_time: election.end_time }); } catch (e) {}
      } catch (err) {
        logger.error && logger.error('Error activating election', err);
      }
    }

    // Deactivate elections that have ended but are still active
    const toDeactivate = await models.Election.findAll({
      where: {
        is_active: true,
        end_time: { [Op.lte]: now }
      }
    });

    for (const election of toDeactivate) {
      try {
        election.is_active = false;
        await election.save();
        logger.info && logger.info(`Deactivated election id=${election.id} title="${election.title}"`);
        try { emitToAdmins('election_ended', { electionId: election.id, title: election.title }); } catch (e) {}
      } catch (err) {
        logger.error && logger.error('Error deactivating election', err);
      }
    }

  } catch (err) {
    logger.error && logger.error('Election scheduler error', err);
  }
}

let task = null;

function startElectionScheduler(logger = console) {
  // Immediately run once, then schedule every 15 seconds
  checkAndToggleElections(logger);

  // Schedule with cron: every minute
  task = cron.schedule('*/15 * * * * *', () => {
    checkAndToggleElections(logger);
    // send periodic ticks to update countdowns (every schedule run)
    try {
      // fetch active elections and emit remaining time
      models.Election.findAll({ where: { is_active: true } }).then((active) => {
        active.forEach((e) => {
          const now = new Date();
          const end = e.end_time ? new Date(e.end_time) : null;
          const remainingMs = end ? Math.max(0, end.getTime() - now.getTime()) : null;
          emitToAdmins('election_tick', { electionId: e.id, remainingMs, end_time: e.end_time, server_time: now });
        });
      }).catch(() => {});
    } catch (err) {
      // ignore
    }
  });

  logger.info && logger.info('Election scheduler started (runs every 15 seconds)');
  return task;
}

function stopElectionScheduler() {
  if (task) task.stop();
}

module.exports = { startElectionScheduler, stopElectionScheduler, checkAndToggleElections };
