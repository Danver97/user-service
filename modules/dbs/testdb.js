let events = [];

function reset() {
    events = [];
}

function save(eventName, payload, cb) {
    return new Promise((resolve, reject) => {
        const err = null;
        const event = {
            id: events.length,
            event: eventName,
            createdAt: new Date(),
            payload: JSON.parse(JSON.stringify(payload)),
        };
        events.push(event);
        if(cb && typeof cb === 'function')
            cb(err, event);
        /*if(err)
            reject(err);
        else*/
            resolve(event);
    });
}

function userCreated(user, cb) {
    return save('userCreated', user, cb);
}

function userConfirmed(user, cb) {
    return save('userConfirmed', user, cb);
}

function userRemoved(user, cb) {
    return save('userRemoved', user, cb);
}

function passwordChanged(user, cb) {
    return save('passwordChanged', user, cb);
}

function passwordConfirmed(user, cb) {
    return save('passwordConfirmed', user, cb);
}

function propertyChanged(user, cb) {
    return save('propertyChanged', user, cb);
}

function aggregateByField(fieldName, fieldValue, cb) {
    return new Promise((resolve, reject) => {
        let err = null;
        const userEvents = events
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
    return aggregateByField('id', userId, cb);
}

function getUserByEmail(mail, cb) {
    return aggregateByField('email', mail, cb);
}

function getUserByUsername(username, cb) {
    return aggregateByField('username', username, cb);
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
