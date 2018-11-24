// const ENV = require('../../../../src/env');
const AWSinit = require('../../../../lib/AWS');
const Promisify = require('../../../../lib/utils').promisify;

const sqsConfig = AWSinit.sqs;
const sqs = sqsConfig.sqs;
const snsConfig = sqsConfig.sns;

// Broker methods implementation

function get(cb) {
    return Promisify(async () => {
        const url = await sqsConfig.getQueueUrl();
        const message = await sqs.receiveMessage({
            QueueUrl: url,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
        }).promise();
        return message;
    }, cb);
}

function remove(e) {
    
}

function poll(eventHandler, ms) {
    setInterval(() => get(eventHandler), ms || 10000);
}

function subscribe(topic, cb) {
    return Promisify(async () => {
        const arns = await Promise.all([snsConfig.getTopicArn(topic), sqsConfig.getQueueArn()]);
        const topicArn = arns[0]; // await snsConfig.getTopicArn(topic);
        const sqsQueueArn = arns[1]; // await sqsConfig.getQueueArn();
        await snsConfig.subscribe(topicArn, { Endpoint: sqsQueueArn });
    }, cb);
}

module.exports = {
    sqs,
    get,
    remove,
    poll,
    subscribe,
};
