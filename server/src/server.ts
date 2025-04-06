import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import api from './api';

import { AuthResult } from 'express-oauth2-jwt-bearer';

declare module 'express-session' {
    interface SessionData {
        valid: boolean,
        expiresAt: number,
        auth: AuthResult,
    }
}

const port = 8000;

const app = express();

// app.use(
//     auth({
//         audience: 'http://api.cometcommerce.com',
//         issuerBaseURL: 'https://dev-olcmjrm1xuqtgb8o.us.auth0.com/',
//         tokenSigningAlg: 'RS256',
//     }
//   ));

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
// app.use(express.static(path.join(__dirname, '../dist')));

require("dotenv").config()
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_CONN_STRING || '')

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

