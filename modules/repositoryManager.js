const ENV = require('../src/env');
const testdb = require('./db/testdb');
const persistence = require('./eventSourcing/persistence');

let dbmanager;
// if (ENV.test === 'dynamodb') { dbmanager = require('./db/dynamodb'); }
if (ENV.test === 'true') dbmanager = testdb;
if (ENV.node_env === 'test_event_sourcing') dbmanager = persistence;

const implem = require('./implements');

const Property = implem.Property;

const interf = {
    userCreated: new Property('function', 2),
    userConfirmed: new Property('function', 2),
    userRemoved: new Property('function', 2),
    passwordChanged: new Property('function', 2),
    passwordConfirmed: new Property('function', 2),
    propertyChanged: new Property('function', 2),
    getUser: new Property('function', 2),
    getUserByEmail: new Property('function', 2),
    getUserByUsername: new Property('function', 2),
};

implem.checkImplementation(interf, dbmanager);

module.exports = dbmanager;
