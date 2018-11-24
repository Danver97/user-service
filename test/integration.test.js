const request = require('supertest');
// const jwt = require('jsonwebtoken');
const ENV = require('../src/env');
const repo = require('../infrastructure/repository/repositoryManager')();
// const app = require('../');
const app = require('../src/app');

const req = request(app);
// const req = request('http://localhost:3000');

function getQueryURL(obj){
    let query = ''
    let first = false;
    for(p in obj){
        if(typeof p === 'function')
            continue;
        if(!first){
            query += '&';
            first = true;
        }
        query += p + '=' + obj[p];
    }
    return query;
}

describe('Integration test exaple', function() {
    const user = {
        username: 'pippo',
        email: 'pippo@gmail.com',
        password: 'pippopassword',
        name: 'pippo',
    };
    
    before(() => {
        if (ENV.node_env === 'test' && ENV.event_store === 'testdb')
            repo.reset();
        else if (ENV.node_env === 'test_event_sourcing' && ENV.event_store === 'testdb')
            repo.reset();
    });
    
    it('get /', function(done) {
        req
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify({ service: 'user-service' }))
            .expect(200, done);
    });
    
    it('post /login', async function() {
        await req
            .post('/login')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .type('form')
            .send({ email: 'email a cazzo che non verrà mai usata' })
            .send({ password: user.password })
            .expect(500);
    });
    
    context('Context user: ' + JSON.stringify(user), function() {
        it('post /signup', async function() {
            await req
                .post('/signup')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ email: user.email })
                .send({ password: user.password })
                .send({ username: user.username })
                .send({ name: user.name })
                .expect(200);
        });

        it('post /login', async function() {
            await req
                .post('/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .type('form')
                .send({ email: user.email })
                .send({ password: user.password })
                .expect(200)
                .expect(JSON.stringify({ success: true }))
                .expect('Authorization', /Bearer ./);
        });
        
    });//*/
    
    /*
    it('get /user', async function () {
        await req
            .get('/user?email=' + user.email)
            .expect(200)
            .expect(res => {
                const respose = res.body;
                const expected = JSON.parse(JSON.stringify(user));
                delete expected.password;
                assert.strictEqual(respose, expected);
            });
    });
    */
});
