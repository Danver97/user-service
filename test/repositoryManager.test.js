const assert = require('assert');
const User = require('../models/user');
const repo = require('../modules/repositoryManager');
const UserEvents = require('../modules/user-events');
const ENV = require('../src/env');

const waitAsync = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
const waitTimeout = 150;

function wait(ms) {
    const start = Date.now();
    let now = Date.now();
    while (start + ms > now)
        now = Date.now();
}

describe('RepositoryManager unit test', function () {
    const email = 'tizio.caio@gmail.com';
    const pw = 'mypassword';
    const username = 'tizio.caio';
    const name = 'tizio';
    const surname = 'caio';
    let confirmationCode;
    const user = new User(email, pw, username, name, surname);
    const equalsUser = (actualUser, expectedUser) => {
        assert.strictEqual(actualUser.username, expectedUser.username);
        assert.strictEqual(actualUser.email, expectedUser.email);
        assert.strictEqual(actualUser.name, expectedUser.name);
        assert.strictEqual(actualUser.surname, expectedUser.surname);
    };
    
    const deepCopy = obj => JSON.parse(JSON.stringify(obj));
    
    const equalsPayload = (actualPayload, expectedPayload) => {
        Object.keys(expectedPayload).forEach(k => {
            if (k === 'password' || k === 'confirmPasswordCode')
                return;
            assert.strictEqual(actualPayload[k], expectedPayload[k]);
        });
    };
    
    const equalsEvent = (event, streamId, message, payload) => {
        assert.strictEqual(event.streamId, streamId);
        assert.strictEqual(event.topic, UserEvents.topic);
        assert.strictEqual(event.message, message);
        equalsPayload(event.payload, payload);
    };
    
    const getLastEventStored = async streamId => {
        const stream = await repo.getStream(streamId);
        return stream.events[stream.events.length - 1];
    };
    
    before(async () => {
        if (ENV.node_env === 'test')
            repo.reset();
        else if (ENV.node_env === 'test_event_sourcing')
            repo.store.reset();
        await repo.broker.subscribe('User');
    });
    
    it('check if userCreated() works', async function () {
        user.created();
        const event = await repo.userCreated(user);
        console.log('published ' + Date.now());
        assert.deepStrictEqual(event.message, UserEvents.userCreated);
        equalsPayload(event.payload, deepCopy(user));
        console.log('before await ' + Date.now());
        await waitAsync(waitTimeout);
        console.log('awaited ' + Date.now());
        const eventStored = await getLastEventStored(user.id);
        equalsEvent(eventStored, user.id, UserEvents.userCreated, user);
    });
    
    it('check if userConfirmed() works', async function () {
        user.confirmed();
        const event = await repo.userConfirmed(user);
        assert.deepStrictEqual(event.message, UserEvents.userConfirmed);
        equalsPayload(event.payload, { status: user.status, statusid: user.statusid });
        await waitAsync(waitTimeout);
        const stream = await repo.getStream(user.id)
        const eventStored = stream.events[stream.events.length - 1];
        equalsEvent(eventStored, user.id, UserEvents.userConfirmed, { status: user.status, statusid: user.statusid });
    });
    
    it('check if userRemoved() works', async function () {
        user.removed();
        const event = await repo.userRemoved(user);
        assert.deepStrictEqual(event.message, UserEvents.userRemoved);
        equalsPayload(event.payload, { status: user.status, statusid: user.statusid });
        await waitAsync(waitTimeout);
        const eventStored = await getLastEventStored(user.id);
        equalsEvent(eventStored, user.id, UserEvents.userRemoved, { status: user.status, statusid: user.statusid });
    });
    
    it('check if passwordChanged() works', async function () {
        confirmationCode = user.setPassword('newpass');
        const event = await repo.passwordChanged(user);
        assert.deepStrictEqual(event.message, UserEvents.passwordChanged);
        equalsPayload(event.payload, { password: user.password });
        await waitAsync(waitTimeout);
        const eventStored = await getLastEventStored(user.id);
        equalsEvent(eventStored, user.id, UserEvents.passwordChanged, { password: user.password });
    });
    
    it('check if passwordConfirmed() works', async function () {
        user.confirmPassword(confirmationCode);
        const event = await repo.passwordConfirmed(user);
        assert.deepStrictEqual(event.message, UserEvents.passwordConfirmed);
        equalsPayload(event.payload, { passwordstatus: user.passwordstatus });
        await waitAsync(waitTimeout);
        const eventStored = await getLastEventStored(user.id);
        equalsEvent(eventStored, user.id, UserEvents.passwordConfirmed, { passwordstatus: user.passwordstatus });
    });
    
    it('check if propertyChanged() works', async function () {
        user.setProperties({ name: 'New Name' });
        const event = await repo.propertyChanged(user);
        assert.deepStrictEqual(event.message, UserEvents.propertyChanged);
        equalsUser(event.payload, user);
        await waitAsync(waitTimeout);
        const eventStored = await getLastEventStored(user.id);
        equalsEvent(eventStored, user.id, UserEvents.propertyChanged, user);
    });
    
    it('check if getUser() works', async function () {
        await waitAsync(waitTimeout);
        const result = await repo.getUser(user.id);
        equalsUser(result, user);
    });
    
    it('check if getUserByEmail() works', async function () {
        const result = await repo.getUserByEmail(user.email);
        equalsUser(result, user);
    });
    
    it('check if getUserByEmail() works with cb', function (done) {
        repo.getUserByEmail(user.email, (err, result) => {
            equalsUser(result, user);
            done();
        });
    });
    
    it('check if getUserByUsername() works', async function () {
        const result = await repo.getUserByUsername(user.username);
        equalsUser(result, user);
    });
    
    it('check if getUserByUsername() works with cb', function (done) {
        repo.getUserByUsername(user.username, (err, result) => {
            if (err) throw err;
            equalsUser(result, user);
            done();
        });
    });
});

// ABCD
