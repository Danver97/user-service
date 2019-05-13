const dbs = require('@danver97/event-sourcing/eventStore');
const implem = require('implemented');
const ENV = require('../../src/env');
const repoImpl = require('./repoImpl');


const Property = implem.Property;

const interf = {
    userCreated: new Property('function', 2),
    userConfirmed: new Property('function', 2),
    userRemoved: new Property('function', 2),
    passwordChanged: new Property('function', 2),
    passwordConfirmed: new Property('function', 2),
    propertyChanged: new Property('function', 2),
    getUser: new Property('function', 2),
};

function exportFunc(db) {
    let repo;
    if (!db)
        repo = repoImpl(dbs[ENV.event_store]);
    else
        repo = repoImpl(dbs[db]);
    implem.checkImplementation(interf, repo);
    return repo;
}

module.exports = exportFunc;
