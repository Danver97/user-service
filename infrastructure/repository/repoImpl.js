const User = require('../../domain/models/user');
const UserError = require('../../domain/errors/user_error');
const UserEvents = require('../../lib/user-events');
const Promisify = require('../../lib/utils').promisify;

function userCreated(user, cb) {
    return this.save(user.id, user._revisionId, UserEvents.userCreated, user, cb);
}

function userConfirmed(user, cb) {
    return this.save(user.id, user._revisionId, UserEvents.userConfirmed, { status: user.status, statusid: user.statusid }, cb);
}

function userRemoved(user, cb) {
    return this.save(user.id, user._revisionId, UserEvents.userRemoved, user, cb);
}

function passwordChanged(user, cb) {
    return this.save(
        user.id, 
        user._revisionId, 
        UserEvents.passwordChanged, 
        { password: user.password, confirmPasswordCode: user.confirmPasswordCode }, 
        cb,
    );
}

function passwordConfirmed(user, cb) {
    return this.save(user.id, user._revisionId, UserEvents.passwordConfirmed, { passwordstatus: user.passwordstatus }, cb);
}

function propertyChanged(user, cb) {
    return this.save(user.id, user._revisionId, UserEvents.propertyChanged, user, cb);
}

function getUser(userId, cb) {
    // return aggregateByField(userId, 'id', userId, cb);
    return Promisify(async () => {
        const stream = await this.getStream(userId);
        let user = null;
        if (stream.length === 0)
            throw new UserError('No user found', 404);
        else {
            user = {};
            stream.forEach(e => {
                user = Object.assign(user, e.payload);
            });
        }
        const result = User.fromObject(user);
        result._revisionId = stream.length;
        return result;
    }, cb);
}

function exportFunc(db) {
    return Object.assign(db, {
        userCreated: userCreated.bind(db),
        userConfirmed: userConfirmed.bind(db),
        userRemoved: userRemoved.bind(db),
        passwordChanged: passwordChanged.bind(db),
        passwordConfirmed: passwordConfirmed.bind(db),
        propertyChanged: propertyChanged.bind(db),
        getUser: getUser.bind(db),
    });
}

module.exports = exportFunc;
