const assert = require('assert');
const bcrypt = require('bcrypt');
const User = require('../domain/models/user');
const UserError = require('../domain/errors/user_error');
const repo = require('../infrastructure/repository/repositoryManager')('testdb');
const usrManager = require('../domain/logic/userManager')(repo);
const ENV = require('../src/env');

const waitAsync = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
const waitTimeout = 20;

describe('UserManager unit test', function () {
    const email = 'tizio.caio@gmail.com';
    const pw = 'mypassword';
    const newPass = 'newPass';
    const username = 'tizio.caio';
    const name = 'tizio';
    const surname = 'caio';
    const user = new User(email, pw, username, name, surname);
    const equalsUser = (actualUser, expectedUser) => {
        assert.strictEqual(actualUser.username, expectedUser.username);
        assert.strictEqual(actualUser.email, expectedUser.email);
        assert.strictEqual(actualUser.name, expectedUser.name);
        assert.strictEqual(actualUser.surname, expectedUser.surname);
    };
    
    before(() => {
        if (ENV.node_env === 'test')
            repo.reset();
        else if (ENV.node_env === 'test_event_sourcing')
            repo.reset();
    });
    
    it('check if userCreated() works', async function() {
        await usrManager.userCreated(user);
        assert.strictEqual(user.status, 'created');
        let err = null;
        try {
            await usrManager.userCreated(user);
        } catch (e) {
            err = e;
        }
        assert.throws(() => { throw err; }, UserError);
        await waitAsync(waitTimeout);
        const result = await usrManager.getUser(user.id);
        equalsUser(result, user);
    });
    
    it('check if userConfirmed() works', async function() {
        await usrManager.userConfirmed(user);
        assert.strictEqual(user.status, 'confirmed');
        let err = null;
        try {
            await usrManager.userCreated(user);
        } catch (e) {
            err = e;
        }
        assert.throws(() => { throw err; }, UserError);
        err = null;
        try {
            await usrManager.userConfirmed(user);
        } catch (e) {
            err = e;
        }
        assert.throws(() => { throw err; }, UserError);
        await waitAsync(waitTimeout);
        const result = await usrManager.getUser(user.id);
        equalsUser(result, user);
    });
    
    it('check if userRemoved() works', async function() {
        await usrManager.userRemoved(user);
        assert.strictEqual(user.status, 'removed');
        let err = null;
        try {
            await usrManager.userCreated(user);
        } catch (e) {
            err = e;
        }
        assert.throws(() => { throw err; }, UserError);
        err = null;
        try {
            await usrManager.userConfirmed(user);
        } catch (e) {
            err = e;
        }
        assert.throws(() => { throw err; }, UserError);
        err = null;
        try {
            await usrManager.userRemoved(user);
        } catch (e) {
            err = e;
        }
        assert.throws(() => { throw err; }, UserError);
        await waitAsync(waitTimeout);
        const result = await usrManager.getUser(user.id);
        equalsUser(result, user);
    });
    
    it('check if passwordChanged() works', async function() {
        await usrManager.passwordChanged(user, newPass);
        const match = bcrypt.compareSync(newPass, user.password);
        assert.strictEqual(match, true);
        await waitAsync(waitTimeout);
        const result = await usrManager.getUser(user.id);
        equalsUser(result, user, true);
    });
    
    it('check if propertyChanged() works', async function() {
        const newProps = { password: 'newPass2', email: 'email2', name: 'name2' };
        await usrManager.propertyChanged(user, newProps);
        assert.strictEqual(user.email, email);
        assert.strictEqual(user.name, newProps.name);
        const match = bcrypt.compareSync('newPass', user.password);
        assert.strictEqual(match, true);
        await waitAsync(waitTimeout);
        const result = await usrManager.getUser(user.id);
        equalsUser(result, user);
    });
    
    it('check if getUser() works', async function() {
        const result = await usrManager.getUser(user.id);
        equalsUser(result, user);
    });
    
    /*
    it('check if getUserByEmail() works', async function() {
        const result = await usrManager.getUserByEmail(user.email);
        equalsUser(result, user);
    });
    
    it('check if getUserByUsername() works', async function() {
        const result = await usrManager.getUserByUsername(user.username);
        equalsUser(result, user);
    });
    
    it('check if checkAuthentication() works', async function() {
        const result = await usrManager.checkAuthentication(user.email, newPass);
        equalsUser(result, user);
    });
    */
});
