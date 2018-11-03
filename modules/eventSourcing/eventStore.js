const ENV = require('../../src/env');
const testdb = require('../db/testdb');

const eventStores = {
    testdb,
};

const store = eventStores[ENV.event_store];

module.exports = function (broker) {
    if (broker) {
        broker.pickOnNotification(async event => {
            console.log('before persist ' + Date.now());
            await store.persist(event);
            console.log('persisted ' + event.message + ' ' + Date.now());
            store.emit(`${event.topic}:${event.message}`, event);
        });
    }
    return store;
};
