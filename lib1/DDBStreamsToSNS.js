const AWS = require('aws-sdk/global');
const SNS = require('aws-sdk/clients/sns');

const snsParams = { apiVersion: '2010-03-31' };
if (process.env.snsurl)
    snsParams.endpoint = new AWS.Endpoint(process.env.SNS_URL);
const sns = new SNS(snsParams);

/*
{
    "Records": [
        {
            "eventID": "1",
            "eventVersion": "1.0",
            "dynamodb": {
                "Keys": {
                    "Id": {
                        "N": "101"
                    }
                },
                "NewImage": {
                    "Message": {
                        "S": "New item!"
                    },
                    "Id": {
                        "N": "101"
                    }
                },
                "StreamViewType": "NEW_AND_OLD_IMAGES",
                "SequenceNumber": "111",
                "SizeBytes": 26
            },
            "awsRegion": "us-west-2",
            "eventName": "INSERT",
            "eventSourceARN": eventsourcearn,
            "eventSource": "aws:dynamodb"
        },
    ]
}
*/

/* Test event */
/*
{
    "Records": [
        {
            "eventID": "1",
            "eventVersion": "1.0",
            "dynamodb": {
                "Keys": {
                    "StreamId": {
                        "S": "1"
                    },
                    "EventId": {
                        "N": "1"
                    }
                },
                "NewImage": {
                    "Payload": {
                        "M": {
                            "Field": {
                                "S": "Field!"
                            }
                        }
                    },
                    "Message": {
                        "S": "New event!"
                    },
                    "StreamId": {
                        "S": "1"
                    },
                    "EventId": {
                        "N": "1"
                    }
                },
                "StreamViewType": "NEW_AND_OLD_IMAGES",
                "SequenceNumber": "111",
                "SizeBytes": 26
            },
            "awsRegion": "us-west-2",
            "eventName": "INSERT",
            "eventSourceARN": "eventsourcearn",
            "eventSource": "aws:dynamodb"
        }
    ]
}
*/

function unwrap(o) {
    if (typeof o !== 'object')
        return o;
    if (o.S)
        return o.S;
    if (o.M)
        return o.M;
    if (o.SS)
        return o.SS;
    if (o.N)
        return o.N;
    return o;
}

exports.toSNS = async function (event) {
    console.log('toSNS start');
    const records = event.Records.filter(r => r.eventName === 'INSERT').map(r => {
        const image = r.dynamodb.NewImage;
        image.SequenceNumber = r.dynamodb.SequenceNumber; // image._sequenceNumber = r.dynamodb.SequenceNumber;
        return image;
    });
    const promises = [];
    for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const params = {
            Message: JSON.stringify(r), /* required */
            MessageAttributes: {
                StreamId: {
                    DataType: 'String', /* required */
                    StringValue: unwrap(r.StreamId).toString(),
                },
                EventId: {
                    DataType: 'String', /* required */
                    StringValue: unwrap(r.EventId).toString(),
                },
                Message: {
                    DataType: 'String', /* required */
                    StringValue: unwrap(r.Message).toString(),
                },
                SequenceNumber: {
                    DataType: 'String',
                    StringValue: r.SequenceNumber.toString(),
                },
            },
            TopicArn: process.env.TOPIC_ARN,
        };
        promises.push(sns.publish(params).promise());
    }
    try {
        await Promise.all(promises);
    } catch (e) {
        console.log(e);
        throw e;
    }
    console.log(`SUCCESS -> Received: ${records.length}; Sent: ${promises.length}`);
    // return;
};
