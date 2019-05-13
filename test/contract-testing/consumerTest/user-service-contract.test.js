const repo = require('../../../infrastructure/repository/repositoryManager')('testdb');
const User = require('../../../domain/models/user');
const eventContent = require('./eventContent');
const Interactor = require('./utils');

const interactor = new Interactor({
    consumer: 'restaurant-service',  // TODO: parametrize
    provider: 'restaurant-service',
});

describe('Restaurant Service Contract Testing', function () {
    this.slow(5000);
    this.timeout(10000);
    const userId = '24071e32-263f-45cc-81b9-f4acac75fb1d';
    const u = new User('gino.paoli@gmail.com', 'ginogino56', 'Gino56', 'Gino', 'Paoli');
    u.id = userId;

    beforeEach(() => repo.reset());

    it('eventName is handled properly', () => {
        const state = 'a state';
        const eventName = 'eventName';
        // const content = eventContent.userCreatedEvent(restId, 'gino');
        // return interactor.defineAsyncInteraction(state, eventName, content);
    });

    after(() => interactor.publishPacts());
});
