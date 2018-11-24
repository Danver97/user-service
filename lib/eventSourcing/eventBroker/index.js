const redis = require('redis-event-broker');
const sqs = require('./sqs');
const testbroker = require('./testbroker');
const ENV = require('../../../../src/env');

const eventBrokers = {
    redis: ENV.node_env === 'test_event_sourcing' && ENV.event_broker === 'redis' ? redis({}) : undefined,
    sqs,
    testbroker,
};

const broker = eventBrokers[ENV.event_broker || 'redis'] || {};

function poll(eventHandler, ms) {
    setInterval(() => broker.get(eventHandler), ms || 10000);
}

module.exports = Object.assign({ poll }, broker);
