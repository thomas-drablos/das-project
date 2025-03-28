const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static(path.join(__dirname, '../dist')));
// app.use('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../index.html'));
// });
// app.use('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../dist', 'index.html'));
// });

app.use(bodyParser.json());

// TODO: Warning The default server-side session storage, MemoryStore, is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.
// see https://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
app.use(session({
    secret: 'key',
    cookie: {
        httpOnly: true,
        maxAge: 7200000, // 2 hours in millis
        // secure: true, // TODO once HTTPS set up
    }
}));

// block unauthenticated requests
app.use((req, res, next) => {
    if (req.path === '/api/login' || (req.session.valid && req.session.expiresAt >= Date.now()))
        return next();

    return res.status(401).send('Unauthenticated');
});

app.get('/', (req, res) => {
    res.send('Home page, should probably host front-end content here');
});

app.post('/api/login', (req, res) => {
    console.log('login');
    const email = req.body.email;
    if (email === 'admin@email.com') {
        req.session.valid = true;
        req.session.expiresAt = Date.now() + req.session.cookie.maxAge;
        console.log('User authenticated');
        return res.json({
            username: 'Admin',
            isAdmin: false,
            validUntil: req.session.expiresAt,
        });
    }

    console.log('user not authenticated');
    return res.status(400).send('Invalid username or password');
});

app.post('/api/logout', (req, res) => {
    if (req.session.valid)
        return res.status(400).send('Not logged in');

    req.session.destroy();
    return res.send();
});

app.get('/test', (req, res) => {
    res.send('Ping!');
});

app.listen(5173, () => {
    console.log('Server is running');
});
