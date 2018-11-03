const ENV = require('../../src/env');
const EventBroker = require('./eventBroker');
const EventStore = require('./eventStore');
const Event = require('./event');
const UserEvents = require('../user-events');
const User = require('../../models/user');
const Promisify = require('../../lib/utils').promisify;

let broker;
let store;
let projections;

function wait(ms) {
    const start = Date.now();
    let now = Date.now();
    while (start + ms > now)
        now = Date.now();
}

if (ENV.node_env === 'test' || ENV.event_broker === ENV.event_store) {
    store = EventStore();
    broker = store;
    projections = store;
} else {
    broker = EventBroker;
    store = EventStore(EventBroker);
    projections = store;
    broker.subscribe(UserEvents.topic);
}

// Event publishers
// rst
function publishWithOptionalPromise(event, cb) {
    return Promisify(async () => {
        console.log('before publish ' + Date.now());
        await broker.publishEvent(event);
        console.log('published by broker ' + Date.now());
        return event;
    }, cb);
}

function userCreated(user, cb) {
    const event = new Event(user.id, UserEvents.topic, UserEvents.userCreated, user);
    return publishWithOptionalPromise(event, cb);
}

function userConfirmed(user, cb) {
    const event = new Event(user.id, UserEvents.topic, UserEvents.userConfirmed, { status: user.status, statusid: user.statusid });
    return publishWithOptionalPromise(event, cb);
}

function userRemoved(user, cb) {
    const event = new Event(user.id, UserEvents.topic, UserEvents.userRemoved, { status: user.status, statusid: user.statusid });
    return publishWithOptionalPromise(event, cb);
}

function passwordChanged(user, cb) {
    const event = new Event(user.id, UserEvents.topic, UserEvents.passwordChanged, { password: user.password });
    return publishWithOptionalPromise(event, cb);
}

function passwordConfirmed(user, cb) {
    const event = new Event(user.id, UserEvents.topic, UserEvents.passwordConfirmed, { passwordstatus: user.passwordstatus });
    return publishWithOptionalPromise(event, cb);
}

function propertyChanged(user, cb) {
    const event = new Event(user.id, UserEvents.topic, UserEvents.propertyChanged, user);
    return publishWithOptionalPromise(event, cb);
}

function getUser(userId, cb) {
    return Promisify(async () => {
        const aggregate = await store.getUser(userId);
        const user = User.fromObject(aggregate);
        return user;
    }, cb);
}

function getUserByEmail(mail, cb) {
    return Promisify(async () => {
        const aggregate = await projections.getUserByEmail(mail);
        const user = User.fromObject(aggregate);
        return user;
    }, cb);
}

function getUserByUsername(username, cb) {
    return Promisify(async () => {
        const aggregate = await projections.getUserByUsername(username);
        const user = User.fromObject(aggregate);
        return user;
    }, cb);
}

function getStream(streamId) {
    return store.getStream(streamId);
}
// rcl

const persistence = {
    broker,
    store,
    // db handlers
    userCreated,
    userConfirmed,
    userRemoved,
    passwordChanged,
    passwordConfirmed,
    propertyChanged,
    getUser,
    getUserByEmail,
    getUserByUsername,
    getStream,
};

module.exports = persistence;
