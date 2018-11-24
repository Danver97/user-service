const implem = require('../../../lib/implements');

const dynamodb = require('./dynamodb');
const testdb = require('./testdb');

const Property = implem.Property;

function checkImplementation(db) {
    const interf = {
        save: new Property('function', 5),
        getStream: new Property('function', 2),
    };
    implem.checkImplementation(interf, db);
    return db;
}

const dbs = {
    dynamodb: checkImplementation(dynamodb),
    testdb: checkImplementation(testdb),
};

module.exports = dbs;
