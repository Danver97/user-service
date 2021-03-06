const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const ENV = require('./env');
const repo = require('../infrastructure/repository/repositoryManager')();
const usrManager = require('../domain/logic/userManager')(repo);
const User = require('../domain/models/user');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const ensureToken = (req, res, next) => {
    const header = req.headers['Authorization'];
    if (header !== 'undefined') {
        req.token = header.split(' ')[1];
        next();
    } else
        res.sendStatus(403);
};

app.get('/', (req, res) => {
    res.json({
        service: 'user-service',
    });
});

app.get('/user', async (req, res) => {
    let user;
    const query = req.query;
    try {
        if (!query.userId && !query.email /* && !query.username */) {
            res.status(400);
            res.json({ error: 'No query parameter received. Please use one of these: userId, email, username' });
            return;
        }
        if (req.query.userId)
            user = await usrManager.getUser(req.query.userid);
        else if (req.query.email)
            user = await usrManager.getUserByEmail(req.query.email);
        else if (req.query.username)
            user = await usrManager.getUserByUsername(req.query.username);
        delete user.password;
        res.status(200);
        res.json(user);
    } catch (e) {
        res.status(e.code || 500);
        res.json(e);
    }
});


app.get('/protectedTest', ensureToken, (req, res) => {
    jwt.verify(req.token, ENV.jwtSecret, err => {
        if (err) res.sendStatus(403);
        res.redirect('/');
    });
});

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const pw = req.body.password;
    try {
        const user = await usrManager.checkAuthentication(email, pw);
        res.header('Authorization', `Bearer ${jwt.sign({ user }, ENV.jwtSecret)}`);
        res.json({ success: true });
    } catch (e) {
        // should check the error type;
        res.status(e.code || 500);
        res.json(e);
    }
});

app.post('/signup', async (req, res) => {
    const body = req.body;
    try {
        await usrManager.userCreated(new User(body.email, body.password, body.username, body.name, body.surname));
        res.statusCode = 200;
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.status(e.code || 500);
        res.json(e);
    }
});

module.exports = app;
