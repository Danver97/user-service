# user-service
A simple and basic user microservice. Created using ExpressJs and tested using assert, mocha and supertest.
Right now it's under development so a big part of it it's mocked in order to get a reliable service before further expansions.
In particular it relies on an in-memory mocked event store database (you can find it under `user-service/modules/db`).

**Update 03/11/2018: Introduced support for AWS**

Introduced support for AWS. Under `/lib/AWS` it's possible to find a module used for create the AWS infrastructure used as Event Store and Event Broker for an event sourcing platform. The purpose for this module is to ensure that every AWS service is configured properly before starting accepting requests.

A big part of the entire project is still under development. In particular everything about events replay and event aggregates' projections aren't implemented yet. For now, the main design is:
- Replay events from the event store (on AWS: DynamoDB) (this stage is optional if the projection is "up to date")
- Enqueue them in an event broker (on AWS: SQS)
- Poll the event broker and make events deduplication & idempotency checks before applying them on the projection.

The main focus is now in having everything tested properly and ensure that the project is still "infrastructure independent": the goal is to define an interface for event store and event broker in order to easily move from the cloud to a local deployment (or from one cloud provider to another) just using new implementations for event store and event broker.

Secondary note: a big code cleaneage should be done. I'm in the middle of a code refactoring on every microservice repo here on github, so not everything is perfectly cleaned yet.

### Build
`npm install`

### Run
`npm start`

### Test
`npm test`
