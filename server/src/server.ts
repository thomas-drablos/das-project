import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import api from './api';

import { AuthResult } from 'express-oauth2-jwt-bearer';
import { UserDetails } from './types';

declare module 'express-session' {
    interface SessionData {
        valid: boolean,
        expiresAt: number,
        auth?: AuthResult,
        // userInfo?: UserDetails,
    }
}

declare module 'express' {
    interface Request {
        userInfo?: UserDetails,
    }
}

console.log(dotenv.config({path: '../.env'}));
const port = process.env.PORT || 8000;

// Connect to database
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_CONN_STRING || '');

// Configure application
const app = express();

// Set CORS policy: only allow app origin
app.use(cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
