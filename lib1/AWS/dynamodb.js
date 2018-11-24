const AWS = require('aws-sdk/global');
const DDB = require('aws-sdk/clients/dynamodb');

const dbparams = { apiVersion: '2012-08-10' };
if (process.env.DDB_URL)
    dbparams.endpoint = new AWS.Endpoint(process.env.DDB_URL);
console.log(dbparams);
const ddb = new DDB(dbparams);

let tableName = null;
let tableArn = null;

async function init(microserviceName) {
    console.log('ddb init');
    if (!microserviceName)
        throw new Error('DynamoDb: microservice name not specified on initialization.');
    tableName = `${microserviceName}EventStreamTable`;
    const tableParams = {
        AttributeDefinitions: [
            {
                AttributeName: 'StreamId',
                AttributeType: 'S',
            },
            {
                AttributeName: 'EventId',
                AttributeType: 'N',
            },
        ],
        KeySchema: [
            {
                AttributeName: 'StreamId',
                KeyType: 'HASH',
            },
            {
                AttributeName: 'EventId',
                KeyType: 'RANGE',
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        TableName: tableName,
        StreamSpecification: {
            StreamEnabled: true,
            StreamViewType: 'NEW_IMAGE', // 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY',
        },
    };
    try {
        const data = await ddb.createTable(tableParams).promise();
        tableArn = data.TableDescription.TableArn;
        return tableArn;
    } catch (e) {
        if (e.code === 'ResourceInUseException')
            console.log('DynamoDb table already created.');
        else {
            console.log(e);
            throw e;
        }
    }
    return null;
}

async function getTableArn() {
    if (!tableName)
        throw new Error('DynamoDb: module not initialized yet.');
    const data = await ddb.describeTable({ TableName: tableName }).promise();
    return data.Table.TableArn;
}

async function getTableStreamArn() {
    if (!tableName)
        throw new Error('DynamoDb: module not initialized yet.');
    const data = await ddb.describeTable({ TableName: tableName }).promise();
    return data.Table.LatestStreamArn;
}

module.exports = {
    ddb,
    init,
    getTableArn,
    getTableStreamArn,
};
