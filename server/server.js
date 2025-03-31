const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const api = require('./api.js');

const app = express();

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

app.use('/api', api);
app.use(express.static(path.join(__dirname, '../dist')));

app.listen(5173, () => {
    console.log('Server is running');
});
