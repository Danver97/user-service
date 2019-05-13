const uuid = require('uuid/v4');
const repo = require('../../../infrastructure/repository/repositoryManager')('testdb');
const User = require('../../../domain/models/user');
const Interactor = require('./utils');

function userCreated() {
    const u = new User('gino.paoli@gmail.com', 'ginogino56', 'Gino56', 'Gino', 'Paoli');
    return repo.restaurantCreated(r);
}

const p = new Interactor({
    messageProviders: {
        // userCreated,
    }
});

describe('Consumers contract test', function () {
    this.slow(5000);
    this.timeout(20000);
    it('verify that published events satisfy consumer contracts expectations', function () {
        return p.verify();
    });
});
