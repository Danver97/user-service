const AWS = require('aws-sdk/global');
const SQS = require('aws-sdk/clients/sqs');

const sqsParams = { apiVersion: '2012-11-05' };

if (process.env.SQS_URL)
    sqsParams.endpoint = new AWS.Endpoint(process.env.SQS_URL);

const sqs = new SQS(sqsParams);

let queueName = null;
let queueUrl = null;

async function init(microserviceName) {
    console.log('sqs init');
    if (!microserviceName)
        throw new Error('SQS: microservice name not specified on initialization.');
    queueName = `${microserviceName}Queue`;
    try {
        const data = await sqs.createQueue({
            QueueName: queueName,
            Attributes: {
                MessageRetentionPeriod: '1209600',
            },
        }).promise();
        queueUrl = data.QueueUrl;
    } catch (e) {
        if (e.code === 'AWS.SimpleQueueService.QueueDeletedRecently')
            console.log('Queue Deleted Recently.');
        else {
            console.log(e);
            throw e;
        }
    }
}

async function getQueueUrl() {
    if (!queueName)
        throw new Error('SQS: module not initialized yet.');
    const data = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    return data.QueueUrl;
}

async function getQueueArn() {
    if (!queueName)
        throw new Error('SQS: module not initialized yet.');
    const url = (await sqs.getQueueUrl({ QueueName: queueName }).promise()).QueueUrl;
    const data = await sqs.getQueueAttributes({ QueueUrl: url, AttributeNames: ['QueueArn'] }).promise();
    return data.Attributes.QueueArn;
}

async function addPermissionForSNS(snsTopicArn) {
    if (!queueName || !queueUrl)
        throw new Error('SQS: module not initialized yet.');
    const qUrl = await getQueueUrl();
    const qArn = await getQueueArn();
    const policyDoc = {
        Version: '2012-10-17',
        Id: 'SNS2SQSPolicy',
        Statement: [{
            Sid: 'SNSSendMessage',
            Effect: 'Allow',
            Principal: '*',
            Action: 'sqs:SendMessage',
            Resource: qArn,
            Condition: {
                ArnEquals: {
                    'aws:SourceArn': snsTopicArn,
                },
            },
        }],
    };
    const setAttrsParams = {
        Attributes: {
            Policy: JSON.stringify(policyDoc),
        },
        QueueUrl: qUrl,
    };
    const data = await sqs.setQueueAttributes(setAttrsParams).promise();
    return data;
}

module.exports = {
    sqs,
    init,
    addPermissionForSNS,
    getQueueArn,
    getQueueUrl,
};
