const { MessageProviderPact } = require('@pact-foundation/pact');
const packageJSON = require('../../../package.json');
const providerVersion = packageJSON.version;
const provider = packageJSON.name;
const pactBroker = require('../pactBroker.config');

class Interactor {
    constructor(options) {
        this.opts = {
            messageProviders: options.messageProviders,
            stateHandlers: options.stateHandlers,
            provider,
            providerVersion,
            pactBrokerUrl: pactBroker.url,
            logLevel: 'warn',
            publishVerificationResult: true,
            tags: ['alpha'],
        };
        this.messageProvider = new MessageProviderPact(this.opts);
    }

    async verify() {
        await this.messageProvider.verify();
        console.log(`\n\nPact verification results published to PactBroker at ${this.opts.pactBrokerUrl}`);
    }
}

module.exports = Interactor;
