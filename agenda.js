const agenda = require('agenda');

function init() {
  registerAgendaJob();
  removeStaleJobs((err, result) => {
    if (result) {
      console.log('Initiate agenda job.');
    } else {
      console.error('Unable to remove stale jobs. Starting anyways. Error: ', err);
    }
    agenda.every('1 minutes', global.STATUS.PREFS_AGENDA_JOB_GOLD_PRICE_UPDATER);
    agenda.start();
  });
}

function registerAgendaJob() {

}

function removeStaleJobs(callback) {
  agenda._collection.updateOne({
    lockedAt: {
      $exists: true
    }
  }, {
    $set: {
      lockedAt: null
    }
  }, {
    multi: true
  }, callback);
}
module.exports = init();