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
  return db.createTable('recordings', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: {type: 'string', notNull: true},
    date: {type: 'date', notNull: true},
    duration: {type: 'real', notNull: true}
  })
};

exports.down = function(db) {
  return db.dropTable('recordings')
};

exports._meta = {
  "version": 1
};
