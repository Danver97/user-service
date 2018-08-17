# user-service
A simple and basic user microservice. Created using ExpressJs and tested using assert, mocha and supertest.
Right now it's under development so a big part of it it's mocked in order to get a reliable service before further expansions.
In particular it relies on an in-memory mocked event store database (you can find it under `user-service/modules/db`).

No events communication it's implemented yet.

### Build
`npm install`

### Run
`npm start`

### Test
`npm test`
