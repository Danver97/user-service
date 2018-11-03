const AWS = require('aws-sdk/global');
const IAM = require('aws-sdk/clients/iam');

const iamParams = { apiVersion: '2010-05-08' };

if (process.env.IAM_URL)
    iamParams.endpoint = new AWS.Endpoint(process.env.IAM_URL);

const iam = new IAM(iamParams);
const roleName = 'DDBS2SNSRole';

async function init(microserviceName) {
    console.log('iam init');
    try {
        const trustRelationshipPolicyDoc = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: {
                        Service: 'lambda.amazonaws.com',
                    },
                    Action: 'sts:AssumeRole',
                },
            ],
        };
        const roleParams = {
            AssumeRolePolicyDocument: JSON.stringify(trustRelationshipPolicyDoc), /* required */
            RoleName: roleName, /* required */
            Description: 'DDBStreamsToSNS lambda role.',
        };
        await iam.createRole(roleParams).promise();
    } catch (e) {
        if (e.code === 'EntityAlreadyExists')
            console.log('Role already created.');
        else {
            console.log(e);
            throw e;
        }
    }
    
    try {
        const policyDoc = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Action: [
                        'logs:CreateLogGroup',
                        'logs:CreateLogStream',
                        'logs:PutLogEvents',
                    ],
                    Resource: 'arn:aws:logs:*:*:*',
                },
                {
                    Effect: 'Allow',
                    Action: [
                        'dynamodb:DescribeStream',
                        'dynamodb:GetRecords',
                        'dynamodb:GetShardIterator',
                        'dynamodb:ListStreams',
                    ],
                    Resource: '*',
                },
                {
                    Effect: 'Allow',
                    Action: 'xray:PutTraceSegments',
                    Resource: '*',
                },
                {
                    Effect: 'Allow',
                    Action: [
                        'sns:Publish',
                        'sns:CreateTopic',
                    ],
                    Resource: 'arn:aws:sns:*:*:*',
                },
            ],
        };
        const putRoleParams = {
            PolicyName: 'DDBS2SNSRolePolicy', 
            RoleName: roleName,
            PolicyDocument: JSON.stringify(policyDoc),
        };
        await iam.putRolePolicy(putRoleParams).promise();
    } catch (e) {
        if (e.code === 'something')
            console.log('Policy already attached.');
        console.log(e);
        throw e;
    }
    return roleName;
}

async function getRoleArn() {
    const role = await iam.getRole({ RoleName: roleName }).promise();
    return role.Role.Arn;
}

module.exports = {
    iam,
    init,
    getRoleArn,
};
