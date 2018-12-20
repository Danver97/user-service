# user-service
A simple and basic user microservice. Created using ExpressJs and tested using assert, mocha and supertest.

The target of this project was to get a deeper understanding of the microservice architecture as well as other concepts related to a distributed environment hosted in the cloud.

The microservice is implemented using the following patterns:
- Event Sourcing
- Command Query Responsibility Segregation
- Onion architecture

## Onion architecture

This pattern is used for maintain business logic from infrastructure logic as indipendent as possibile. This leads to having a big easiness in mocking injected dependencies in each module of the business and infrastructure logic and simplifies unit and integration testing code.

It allowed also to develop this project "infrastructure independent": changing the actual implementation of the event store and the event broker it's very easy to switch from an infrastructure to another (from cloud to local, from one cloud provider to another) while preserving each piece of the business and infrastructure logic intact.

## Event Store

As event-driven data management, Event sourcing was the best fit. It's atomicy of storing and publishing events and the possibility to implement temporal queries made it a good choice.

For testing purposes, the microservice relies on an in-memory mocked event store database (you can find it under `user-service/lib/eventSourcing/eventStore/db`).

For production purposes, it relies on Amazon DynamoDB or any other event store that implements the following [interface](https://github.com/Danver97/user-service/blob/master/lib/eventSourcing/eventStore/index.js).

On AWS the event are published using triggers on DynamoDB Streams which invokes an AWS Lambda function that publishes the event to an AWS SNS topic that is resposible to deliver the event to all the subscribed AWS SQS queues (tipically 1 queue for each microservice of the system).

Event sourcing leads to **CQRS** to implement queries.

## Setup

```
npm install
npm test
npm start
```

## News

**Update 03/11/2018: Introduced support for AWS**

Introduced support for AWS. Under `/lib/AWS` it's possible to find a module used for create the AWS infrastructure used as Event Store and Event Broker for an event sourcing platform. The purpose for this module is to ensure that every AWS service is configured properly before starting accepting requests.

A big part of the entire project is still under development. In particular everything about events replay and event aggregates' projections aren't implemented yet. For now, the main design is:
- Replay events from the event store (on AWS: DynamoDB) (this stage is optional if the projection is "up to date")
- Enqueue them in an event broker (on AWS: SQS)
- Poll the event broker and make events deduplication & idempotency checks before applying them on the projection.
