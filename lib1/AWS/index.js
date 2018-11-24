// Require all aws services and init() all in the appropriate order and subscribe() everything in order.
const AWS = require('aws-sdk/global');
const ENV = require('../../src/env');

const configParams = {
    region: 'eu-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};
AWS.config.update(configParams);
// const creds = new AWS.Credentials('mykey', 'mysecret');

const ddb = require('./dynamodb');
const iam = require('./iam');
const lambda = require('./lambda');
const sns = require('./sns');
const sqs = require('./sqs');

function waitAsync (ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function init() {
    const microserviceName = process.env.MICROSERVICE_NAME;
    const ddbP = ddb.init(microserviceName);
    // const iamP = iam.init(microserviceName);
    const snsP = sns.init(microserviceName);
    const sqsP = sqs.init(microserviceName);
    const responses = await Promise.all([ddbP, Promise.resolve(),/*iamP,*/ snsP, sqsP]);
    
    const arns = await Promise.all([ddb.getTableStreamArn(), iam.getRoleArn(), sqs.getQueueArn()]);
    
    const ddbTableStreamArn = arns[0];
    const iamRoleArn = arns[1];
    const snsTopicArn = responses[2];
    const sqsQueueArn = arns[2];
    
    await sqs.addPermissionForSNS(snsTopicArn);
    await sns.subscribe(snsTopicArn, { Endpoint: sqsQueueArn });
    
    await lambda.init(microserviceName, snsTopicArn, iamRoleArn, ddbTableStreamArn, process.env.SNS_URL);
}

// init();

module.exports = {
    init,
    ddb,
    iam,
    lambda,
    sns,
    sqs,
};
