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
  return db.createTable('compilation_recordings', {
    compilation_id: { type: 'int', primaryKey: true },
    recording_id: { type: 'int', primaryKey: true },
    position: {type: 'int', notNull: true}
  })
};

exports.down = function(db) {
  return db.dropTable('compilation_recordings')
}

exports._meta = {
  "version": 1
};
