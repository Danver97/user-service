const EventEmitter = require('events');
const UserEvents = require('../user-events');
const UserError = require('../../errors/user_error');
const User = require('../../models/user');
const Promisify = require('../../lib/utils').promisify;

const emitter = new EventEmitter();
// let events = [];
let eventStore = {};
let snapshots = {};

let projections = [];

let userById = {};
let userByEmail = {};
let userByUsername = {};


function save(streamId, topic, eventName, payload, cb) {
    return Promisify(() => {
        if (!eventStore[streamId]) {
            eventStore[streamId] = {
                id: streamId,
                revision: 0,
                events: [],
            };
        }
        const revision = eventStore[streamId].revision;
        const event = {
            id: eventStore[streamId].events.length,
            streamId,
            topic,
            message: eventName,
            createdAt: new Date(),
            payload: JSON.parse(JSON.stringify(payload)),
        };
        if (revision !== eventStore[streamId].revision)
            throw new Error('Wrong revision number!');
        eventStore[streamId].events.push(event);
        emitter.emit(UserEvents.topic, event);
        return event;
    }, cb);
}

function persist(event, cb) {
    // console.log(event);
    try {
        event.payload = User.fromObject(event.payload);
    } catch (e) {
        // Nothing
    }
    return save(event.streamId, event.topic, event.message, event.payload, cb);
}
    
function emit(message, payload) {
    emitter.emit(message, payload);
}
    
function on(message, cb) {
    emitter.on(message, cb);
}

function publishEvent(event) {
    const promise = persist(event);
    emit(`${event.topic}:${event.message}`, event);
    return promise;
}

function getStream(streamId, cb) {
    const result = new Promise(resolve => {
        if (cb)
            cb(eventStore[streamId]);
        resolve(eventStore[streamId]);
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

function userCreated(user, cb) {
    return save(user.id, UserEvents.topic, UserEvents.userCreated, user, cb);
}

function userConfirmed(user, cb) {
    return save(user.id, UserEvents.topic, UserEvents.userConfirmed, { status: user.status, statusid: user.statusid }, cb);
}

function userRemoved(user, cb) {
    return save(user.id, UserEvents.topic, UserEvents.userRemoved, user, cb);
}

function passwordChanged(user, cb) {
    return save(user.id, UserEvents.topic, UserEvents.passwordChanged, { password: user.password }, cb);
}

function passwordConfirmed(user, cb) {
    return save(user.id, UserEvents.topic, UserEvents.passwordConfirmed, { passwordstatus: user.passwordstatus }, cb);
}

function propertyChanged(user, cb) {
    return save(user.id, UserEvents.topic, UserEvents.propertyChanged, user, cb);
}

function aggregateByField(streamId, fieldName, fieldValue, cb) {
    return Promisify(() => {
        const userEvents = eventStore[streamId].events
            .filter(e => e.payload[fieldName] === fieldValue)
            .sort((e1, e2) => ((e1.createdAt.getTime() <= e2.createdAt.getTime()) ? -1 : 1));
        let user;
        if (userEvents.length === 0)
            throw new UserError(`No user found by ${fieldName}`, 404);
        else {
            user = {};
            for (let i = 0; i < userEvents.length; i++)
                user = Object.assign(user, userEvents[i].payload);
        }
        return user;
    }, cb);
}

function getUser(userId, cb) {
    return aggregateByField(userId, 'id', userId, cb);
}

emitter.on(UserEvents.topic, event => {
    const payload = event.payload;
    const aggregateId = event.streamId;
    if (!userById[aggregateId]) {
        userById[aggregateId] = payload;
        userByEmail[payload.email] = payload;
        userByUsername[payload.username] = payload;
        projections.push(payload);
    } else
        Object.keys(payload).forEach(k => { userById[aggregateId][k] = payload[k]; });
});

function getUserByEmail(mail, cb) {
    return Promisify(() => userByEmail[mail], cb);
}

function getUserByUsername(username, cb) {
    return Promisify(() => userByUsername[username], cb);
}

function reset() {
    // events = [];
    eventStore = {};
    snapshots = {};
    
    projections = [];
    userById = {};
    userByEmail = {};
    userByUsername = {};
}

function resetEmitter() {
    emitter.eventNames().forEach(e => emitter.removeAllListeners(e));
}

module.exports = {
    userCreated,
    userConfirmed,
    userRemoved,
    passwordChanged,
    passwordConfirmed,
    propertyChanged,
    getUser,
    getUserByEmail,
    getUserByUsername,
    persist,
    publishEvent,
    emit,
    on,
    getStream,
    getSnapshot,
    reset,
    resetEmitter,
};
