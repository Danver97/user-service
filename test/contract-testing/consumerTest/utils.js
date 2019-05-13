const path = require('path');
const pact = require('@pact-foundation/pact');
const pactnode = require('@pact-foundation/pact-node');
const Event = require('@danver97/event-sourcing/event');
const repo = require('../../../infrastructure/repository/repositoryManager')('testdb');
const manager = require('../../../domain/logic/restaurantManager')(repo);
// const handler = require('../../../infrastructure/messaging/eventHandler/eventHandler')(manager);
const consumerVersion = require('../../../package.json').version;
const pactBroker = require('../pactBroker.config');

const {
    MessageConsumerPact,
    asynchronousBodyHandler,
} = pact;

async function commonMessageHandler (message, assertFunc) {
    const event = Event.fromObject(message);
    const handlerReturn = await handler(event);
    let assertReturn;
    if (assertFunc)
        assertReturn = assertFunc(event, handlerReturn);
    if (assertReturn instanceof Promise)
        await assertReturn;
};

class Interactor {
    constructor(options) {
        if (!options.consumer || !options.provider) {
            throw new Error(`Missing parameters in options:
                ${!options.consumer ? 'options.consumer' : ''}
                ${!options.provider ? 'options.provider' : ''}`);
        }
        this.pactDir = options.dir || path.resolve(process.cwd(), 'pacts')
        const opts = {
            consumer: options.consumer,
            dir: this.pactDir,
            pactfileWriteMode: options.pactfileWriteMode || 'update',
            provider: options.provider,
            logLevel: options.logLevel || 'warn',
        };
        this.messagePact = new MessageConsumerPact(opts);
        this.consumer = options.consumer;
        this.provider = options.provider;
    }

    defineAsyncInteraction (state, eventName, content, assertFunc) {
        return (
            this.messagePact
                .given(state)
                .expectsToReceive(eventName)
                .withContent(content)
                .withMetadata({ 'content-type': 'application/json' })
                .verify(asynchronousBodyHandler(message => commonMessageHandler(message, assertFunc)))
        );
    }

    async publishPacts(pactBrokerUrl) {
        const pactJsonFile = `${this.consumer}-${this.provider}.json`;
        const options = {
            pactBroker: pactBroker.url,
            pactFilesOrDirs: [path.resolve(this.pactDir, `./${pactJsonFile}`)],
            consumerVersion,
        };
        const publisher = new pactnode.Publisher(options);
        await publisher.publish();
        console.log(`\n\nPact ${pactJsonFile} published to PactBroker at ${options.pactBroker}`);
    }
}

module.exports = Interactor;
