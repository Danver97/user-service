const EventEmitter = require('events');
const uuidv1 = require('uuid/v1');
const Event = require('../event');
const Promisify = require('../../../lib/utils').promisify;

let eventStore = {};
let snapshots = {};
const emitter = new EventEmitter();

function save(streamId, eventId, message, payload, cb) {
    return Promisify(() => {
        delete payload._revisionId;
        if (!streamId)
            streamId = uuidv1();
        if (!eventStore[streamId])
            eventStore[streamId] = { streamId, revision: 0, events: [] };
        const revision = eventStore[streamId].revision;
        /* const event = {
            streamId,
            eventId: eventId || eventStore[streamId].events.length,
            // created: new Date(),
            message,
            payload,
        }; */
        const event = new Event(streamId, eventId || eventStore[streamId].events.length, message, Object.assign({}, payload));
        if (revision === eventStore[streamId].revision) {
            eventStore[streamId].events.push(event);
            eventStore[streamId].revision++;
        } else
            throw new Error('Stream revision not syncronized.');
        emit(`${event.message}`, payload);
        return event;
    }, cb);
}
    
function emit(message, payload) {
    emitter.emit(message, payload);
}
    
function on(message, cb) {
    emitter.on(message, cb);
}

function getStream(streamId, cb) {
    const result = new Promise(resolve => {
        if (cb)
            cb(eventStore[streamId].events.map(e => Event.fromObject(e)));
        resolve(eventStore[streamId].events.map(e => Event.fromObject(e)));
    });
    if (cb)
        return null;
    return result;
}

function getSnapshot(aggregateId, cb) {
    const result = new Promise(resolve => {
        if (cb)
            cb(snapshots[aggregateId]);
        resolve(snapshots[aggregateId]);
    });
    if (cb)
        return null;
    return result;
}

function reset() {
    eventStore = {};
    snapshots = {};
}

function resetEmitter() {
    emitter.eventNames().forEach(e => emitter.removeAllListeners(e));
}

module.exports = {
    save,
    getStream,
    reset,
    // emit,
    // on,
    // getSnapshot,
    // resetEmitter,
};
