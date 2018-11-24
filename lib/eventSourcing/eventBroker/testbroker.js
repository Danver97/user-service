const Promisify = require('../../../../lib/utils').promisify;

const queue = [];

function log(silent) {
    if (!silent)
        console.log(queue);
    return queue;
}

function enqueueEvent(e) {
    queue.push(e);
}

function dequeueEvent(number) {
    if (!number)
        return queue.shift();
    const events = [];
    for (let i = 0; i < number; i++)
        events.push(queue.shift());
    return events;
}

// Broker methods implementation

function get(cb) {
    return Promisify(dequeueEvent, cb);
}

function remove(e) {
    
}

function poll(eventHandler, ms) {
    setInterval(() => get(eventHandler), ms || 10000);
}

function subscribe(topic, cb) {
    // process.on(topic, enqueueEvent);
}

module.exports = {
    get,
    remove,
    poll,
    subscribe,
    log,
};
