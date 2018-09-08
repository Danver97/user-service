const EventEmitter = require('events');
const bus = new EventEmitter();
// let events = [];
let eventStore = {};

let projections = [];

let userById = {};
let userByEmail = {};
let userByUsername = {};

function reset() {
    // events = [];
    eventStore = {};
    
    projections = [];
    userById = {};
    userByEmail = {};
    userByUsername = {};
}



function save(streamId, eventName, payload, cb) {
    return new Promise((resolve, reject) => {
        let err = null;
        if (!eventStore[streamId])
            eventStore[streamId] = {
                id: streamId,
                revision: 0,
                events: [],
            }
        const revision = eventStore[streamId].revision;
        const event = {
            id: eventStore[streamId].events.length,
            event: eventName,
            createdAt: new Date(),
            payload: JSON.parse(JSON.stringify(payload)),
        };
        if (revision === eventStore[streamId].revision)
            eventStore[streamId].events.push(event);
        else
            err = new Error('Wrong revision number!')
        if(cb && typeof cb === 'function')
            cb(err, event);
        if(err)
            reject(err);
        else
            resolve(event);
        bus.emit('eventSaved', event);
    });
}

function userCreated(user, cb) {
    return save(user.id, 'userCreated', user, cb);
}

function userConfirmed(user, cb) {
    return save(user.id, 'userConfirmed', user, cb);
}

function userRemoved(user, cb) {
    return save(user.id, 'userRemoved', user, cb);
}

function passwordChanged(user, cb) {
    return save(user.id, 'passwordChanged', user, cb);
}

function passwordConfirmed(user, cb) {
    return save(user.id, 'passwordConfirmed', user, cb);
}

function propertyChanged(user, cb) {
    return save(user.id, 'propertyChanged', user, cb);
}

function aggregateByField(streamId, fieldName, fieldValue, cb) {
    return new Promise((resolve, reject) => {
        let err = null;
        const userEvents = eventStore[streamId].events
            .filter(e => e.payload[fieldName] === fieldValue)
            .sort((e1, e2) => e1.createdAt.getTime() <= e2.createdAt.getTime() ? -1 : 1);
        let user;
        if(userEvents.length === 0)
            err = {message: 'No user found by ' + fieldName};
        else {
            user = {};
            for (let i = 0; i < userEvents.length; i++) {
                user = Object.assign(user, userEvents[i].payload);
            }
        }
        if(cb && typeof cb === 'function')
            cb(err, user);
        if(err)
            reject(err);
        else
            resolve(user);
    });
}

function getUser(userId, cb) {
    return aggregateByField(userId, 'id', userId, cb);
}

bus.on('eventSaved', function(event) {
    const payload = event.payload
    const aggregateId = payload.id;
    if (!userById[aggregateId]){
        userById[aggregateId] = payload;
        userByEmail[payload.email] = payload;
        userByUsername[payload.username] = payload;
        projections.push(payload);
    } else {
        for(let prop in payload) {
            userById[aggregateId][prop] = payload[prop];
        }
    }
});

async function getUserByEmail(mail, cb) {
    if (cb) {
        cb(null, userByEmail[mail]);
        return null;
    }
    return userByEmail[mail];
}

async function getUserByUsername(username, cb) {
    if (cb) {
        cb(null, userByUsername[username]);
        return null;
    }
    return userByUsername[username];
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
    reset,
}
