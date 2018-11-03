const AWS = require('aws-sdk/global');
const SNS = require('aws-sdk/clients/sns');
const Promisify = require('../../lib/utils').promisify;

const snsParams = { apiVersion: '2010-03-31' };

if (process.env.SNS_URL)
    snsParams.endpoint = new AWS.Endpoint(process.env.SNS_URL);

const sns = new SNS(snsParams);

let mainTopicName = null;
let mainTopicArn = null;

async function init(microserviceName) {
    console.log('sns init');
    if (!microserviceName)
        throw new Error('SNS: microservice name not specified on initialization.');
    mainTopicName = `${microserviceName}Topic`;
    try {
        const data = await sns.createTopic({ Name: mainTopicName }).promise();
        mainTopicArn = data.TopicArn;
        return mainTopicArn;
    } catch (e) {
        console.log(e);
    }
    return null;
}

function subscribe(topicArn, options = {}) {
    return Promisify(async () => {
        try {
            const data = await sns.subscribe({
                Protocol: options.Protocol || 'sqs',
                TopicArn: topicArn,
                Endpoint: options.Endpoint,
            }).promise();
            return data.SubscriptionArn;
        } catch (e) {
            console.log(e);
        }
        return null;
    });
}

async function getTopicArn() {
    return mainTopicArn;
}

module.exports = {
    sns,
    init,
    getTopicArn,
    subscribe,
};
