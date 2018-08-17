const repo = require('./repositoryManager');
const User = require('../models/user');

function userCreated(user) {
    return new Promise(async (resolve, reject) => {
        try {
            user.created();
            await repo.userCreated(user);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function userConfirmed(user) {
    return new Promise(async (resolve, reject) => {
        try {
            user.confirmed();
            await repo.userConfirmed(user);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function userRemoved(user) {
    return new Promise(async (resolve, reject) => {
        try {
            user.removed();
            await repo.userRemoved(user);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function passwordChanged(user, password) {
    // create confirmation code;
    return new Promise(async (resolve, reject) => {
        try {
            user.setPassword(password);
            await repo.passwordChanged(user);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function passwordConfirmed(user, password/*, confirmCode*/) {
    return new Promise(async (resolve, reject) => {
        try {
            await repo.passwordConfirmed(user);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function propertyChanged(user, properties) {
    return new Promise(async (resolve, reject) => {
        try {
            user.setProperties(properties);
            await repo.propertyChanged(user);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function getUser(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await repo.getUser(userId);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function getUserByEmail(mail) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await repo.getUserByEmail(mail);
            resolve(user);
        } catch(e) {
            reject(e);
        }
    });
}

function checkAuthentication(mail, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await getUserByEmail(mail);
            const authenticated = User.checkPasswords(password, user.password);
            if (authenticated)
                resolve(user);
            else
                reject({error: 'Wrong password'});
        } catch(e) {
            reject(e);
        }
    });
}

module.exports = {
    userCreated: userCreated,
    userConfirmed: userConfirmed,
    userRemoved: userRemoved,
    passwordChanged: passwordChanged,
    propertyChanged,
    checkAuthentication,
    getUser: getUser,
    getUserByEmail,
}
