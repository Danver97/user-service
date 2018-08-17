const assert = require('assert');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const UserError = require('../errors/user_error');


describe('User class unit test', function() {
    const email = 'tizio.caio@gmail.com';
    const pw = 'mypassword';
    const username = 'tizio.caio';
    const name = 'tizio';
    const surname = 'caio';
    let user;
    
    it('check if user created with right attributes', function() {
        user = new User(email, pw, username, name, surname);
        assert.strictEqual(user.email, email);
        const match = bcrypt.compareSync(pw, user.password);
        assert.strictEqual(match, true);
        assert.strictEqual(user.username, username);
        assert.strictEqual(user.name, name);
        assert.strictEqual(user.surname, surname);
    });
    
    it('check if constructor throws UserError on missing params', function() {
        assert.throws(() => new User(email, null, username), UserError);
    });
    
    it('check if setProperties() works', function() {
        user.setProperties({name: 'ciao'});
        assert.strictEqual(user.name, 'ciao');
        user.setProperties({email: 'ciao'});
        assert.strictEqual(user.email, email);
    });
    
    it('check if setPassword() works', function() {
        let newPass = 'new';
        user.setPassword(newPass);
        const match = bcrypt.compareSync(newPass, user.password);
        assert.strictEqual(match, true);
        assert.throws(() => user.setPassword(), UserError);
    });
    
    it('check status changes', function() {
        user.created();
        assert.strictEqual(user.status, 'created');
        assert.throws(() => user.created(), UserError);
        user.confirmed();
        assert.strictEqual(user.status, 'confirmed');
        assert.throws(() => user.confirmed(), UserError);
        user.removed();
        assert.strictEqual(user.status, 'removed');
        assert.throws(() => user.removed(), UserError);
    });
});
