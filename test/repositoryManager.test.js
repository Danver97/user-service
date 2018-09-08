const assert = require('assert');
const User = require('../models/user');
const repo = require('../modules/repositoryManager');

describe('RepositoryManager unit test', function () {
    const email = 'tizio.caio@gmail.com';
    const pw = 'mypassword';
    const username = 'tizio.caio';
    const name = 'tizio';
    const surname = 'caio';
    const user = new User(email, pw, username, name, surname);
    const equals = (actualUser, expectedUser) => {
        assert.strictEqual(actualUser.username, expectedUser.username);
        assert.strictEqual(actualUser.password, expectedUser.password);
        assert.strictEqual(actualUser.email, expectedUser.email);
        assert.strictEqual(actualUser.name, expectedUser.name);
        assert.strictEqual(actualUser.surname, expectedUser.surname);
    }
    
    it('check if userCreated() works', async function () {
        user.created();
        const event = await repo.userCreated(user);
        assert.deepStrictEqual(event.event, 'userCreated');
        equals(event.payload, user);
    });
    
    it('check if userCreated() works with cb', async function () {
        // user.created();
        await repo.userCreated(user, (err, event) => {
            assert.deepStrictEqual(event.event, 'userCreated');
            equals(event.payload, user);
        });
    });
    
    it('check if userConfirmed() works', async function () {
        user.confirmed();
        const event = await repo.userConfirmed(user);
        assert.deepStrictEqual(event.event, 'userConfirmed');
        equals(event.payload, user);
    });
    
    it('check if userRemoved() works', async function () {
        user.removed();
        const event = await repo.userRemoved(user);
        assert.deepStrictEqual(event.event, 'userRemoved');
        equals(event.payload, user);
    });
    
    it('check if passwordChanged() works', async function () {
        user.setPassword('newpass');
        const event = await repo.passwordChanged(user);
        assert.deepStrictEqual(event.event, 'passwordChanged');
        equals(event.payload, user);
    });
    
    it('check if passwordConfirmed() works', async function () {
        const event = await repo.passwordConfirmed(user);
        assert.deepStrictEqual(event.event, 'passwordConfirmed');
        equals(event.payload, user);
    });
    
    it('check if propertyChanged() works', async function () {
        user.setProperties({name: 'New Name'});
        const event = await repo.propertyChanged(user);
        assert.deepStrictEqual(event.event, 'propertyChanged');
        equals(event.payload, user);
    });
    
    it('check if getUser() works', async function () {
        const result = await repo.getUser(user.id);
        equals(result, user);
    });
    
    it('check if getUser() works with cb', async function () {
        await repo.getUser(user.id, (err, result) => {
            equals(result, user);
        });
    });
    
    it('check if getUserByEmail() works', async function () {
        const result = await repo.getUserByEmail(user.email);
        equals(result, user);
    });
    
    it('check if getUserByEmail() works with cb', async function () {
        await repo.getUserByEmail(user.email, (err, result) => {
            equals(result, user);
        });
    });
    
    it('check if getUserByUsername() works', async function () {
        const result = await repo.getUserByUsername(user.username);
        equals(result, user);
    });
    
    it('check if getUserByUsername() works with cb', async function () {
        await repo.getUserByUsername(user.username, (err, result) => {
            equals(result, user);
        });
    });
});