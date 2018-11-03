const path = require('path');
const Zip = require('node-native-zip');
const AWS = require('aws-sdk/global');
const Lambda = require('aws-sdk/clients/lambda');
const ENV = require('../../src/env');
// const Promisify = require('../../lib/utils').promisify;

const lambdaParams = { apiVersion: '2015-03-31' };

if (process.env.LAMBDA_URL)
    lambdaParams.endpoint = new AWS.Endpoint(process.env.LAMBDA_URL);

const lambda = new Lambda(lambdaParams);

let functionName = null;
let functionArn = null;

const archiveZip = new Zip();

function addFilesToZip(archive, name, file) {
    return new Promise((resolve, reject) => {
        archive.addFiles([{ name, path: path.resolve(__dirname, file) }], err => {
            if (err) reject(err);
            resolve();
        });
    });
}

async function init(microserviceName, topicArn, roleArn, eventSourceArn, snsurl) {
    console.log('lamda init');
    if (!microserviceName)
        throw new Error('Lambda: microservice name not specified on initialization.');
    functionName = `${microserviceName}DDBS2SNS`;
    try {
        await addFilesToZip(archiveZip, 'DDBStreamsToSNS.js', '../DDBStreamsToSNS.js');
        const data = await lambda.createFunction({
            Code: {
                ZipFile: archiveZip.toBuffer(),
            },
            FunctionName: functionName, // required
            Handler: 'DDBStreamsToSNS.toSNS', // required
            Role: roleArn, // required
            Runtime: 'nodejs8.10', // required
            Description: 'Send DDB Streams entries to SNS so that SNS can notify subscribers.',
            Environment: { Variables: { SNS_URL: snsurl, TOPIC_ARN: topicArn } },
            TracingConfig: { Mode: 'Active' },
        }).promise();
        functionArn = data.FunctionArn;
    } catch (e) {
        if (e.code === 'ResourceConflictException' && /^Function already exist/.test(e.message))
            console.log('Function already created.');
        else {
            console.log(e);
            throw e;
        }
    }
    try {
        await lambda.createEventSourceMapping({
            EventSourceArn: eventSourceArn, // DDB Stream Arn /* required */
            FunctionName: functionName, /* required */
            BatchSize: 100,
            StartingPosition: 'LATEST',
        }).promise();
    } catch (e) {
        if (e.code === 'ResourceConflictException')
            console.log('EventSource mapping already created.');
        else {
            console.log(e);
            throw e;
        }
    }
}

async function getFunctionArn() {
    if (!functionName)
        throw new Error('Lambda: module not initialized yet.');
    const data = await lambda.getFunction({ FunctionName: functionName }).promise();
    return data.Configuration.FunctionArn;
}

module.exports = {
    lambda,
    init,
    getFunctionArn,
};
