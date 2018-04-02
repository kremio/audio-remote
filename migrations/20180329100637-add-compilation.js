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
  return db.createTable('compilations', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    mbid: {type: 'string', notNull: false},
    title: {type: 'string', notNull: true},
    date: {type: 'date', notNull: true},
    cover: {type: 'string', notNull: false}
  })
};

exports.down = function(db) {
  return db.dropTable('compilations')
};

exports._meta = {
  "version": 1
};
