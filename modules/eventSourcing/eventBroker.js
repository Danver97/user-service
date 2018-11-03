const redis = require('redis-event-broker');
const ENV = require('../../src/env');

const eventBrokers = {
    redis: ENV.node_env === 'test_event_sourcing' && ENV.event_broker === 'redis' ? redis({}) : undefined,
};

module.exports = eventBrokers[ENV.event_broker || 'redis'];
