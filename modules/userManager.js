const repo = require('./repositoryManager');
const User = require('../models/user');
const UserError = require('../errors/user_error');
const Promisify = require('../lib/utils').promisify;

function userCreated(user, cb) {
    return Promisify(async () => {
        user.created();
        await repo.userCreated(user);
        return user;
    }, cb);
}

function userConfirmed(user, cb) {
    return Promisify(async () => {
        user.confirmed();
        await repo.userConfirmed(user);
        return user;
    }, cb);
}

function userRemoved(user, cb) {
    return Promisify(async () => {
        user.removed();
        await repo.userRemoved(user);
        return user;
    }, cb);
}

function passwordChanged(user, password) {
    // create confirmation code;
    return Promisify(async () => {
        user.setPassword(password); // const confirmCode = user.setPassword(password);
        await repo.passwordChanged(user);
        return user; // , confirmCode
    });
}

function passwordConfirmed(user, confirmCode) {
    return Promisify(async () => {
        user.confirmPassword(confirmCode);
        await repo.passwordConfirmed(user);
        return user;
    });
}

function propertyChanged(user, properties) {
    return Promisify(async () => {
        user.setProperties(properties);
        await repo.propertyChanged(user);
        return user;
    });
}

function getUser(userId, cb) {
    return Promisify(async () => repo.getUser(userId), cb);
}

function getUserByEmail(mail, cb) {
    return Promisify(async () => repo.getUserByEmail(mail), cb);
}

function getUserByUsername(username, cb) {
    return Promisify(() => repo.getUserByUsername(username), cb);
}

function checkAuthentication(mail, password) {
    return Promisify(async () => {
        const user = await getUserByEmail(mail);
        const authenticated = User.checkPasswords(password, user.password);
        if (!authenticated)
            throw new UserError('Wrong password', 403);
        return user;
    });
}

module.exports = {
    userCreated,
    userConfirmed,
    userRemoved,
    passwordChanged,
    propertyChanged,
    getUser,
    getUserByEmail,
    getUserByUsername,
    checkAuthentication,
};
