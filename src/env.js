const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') { dotenv.load(); }

const ENV = {
    test: false,
    dburl: '',
    port: 3000,
    jwtSecret: 'secret',
};

ENV.port = process.env.PORT || 3000;
ENV.dburl = process.env.DB_URL || '';
ENV.test = process.env.TEST || 'true';
ENV.jwtSecret = process.env.JWT_SECRET || 'secret';

module.exports = ENV;
