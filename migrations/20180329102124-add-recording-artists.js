'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('recording_artists', {
    recording_id: { type: 'int', primaryKey: true },
    artist_id: { type: 'int', primaryKey: true },
  })
};

exports.down = function(db) {
  return db.dropTable('recording_artists')
};

exports._meta = {
  "version": 1
};
