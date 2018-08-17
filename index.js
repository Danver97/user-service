const app = require('./src/app');
const ENV = require('./src/env');

const server = app.listen(3000, () => {
    console.log(`Server started on port ${ENV.port}`);
});

module.exports = server;