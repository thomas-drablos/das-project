import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import api from './api';

import { AuthResult } from 'express-oauth2-jwt-bearer';
import { UserDetails } from './types';
import { IChat } from './models/chat';
import { IReview } from './models/review';
import { IMessage } from './models/message';


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
        chat?: IChat, 
        review?: IReview,
        message?: IMessage,
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

if (process.env.ENVIRONMENT !== 'DEV' || process.env.ENABLE_HTTPS === "true") {
    if (process.env.ENVIRONMENT === 'DEV' && process.env.ENABLE_HTTPS !== "true")
        console.log('HTTPS cannot be disabled outside of environment DEV, proceeding with HTTPS anyways');

    const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY || '').toString();
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE || '').toString();

    const credentials = {key: privateKey, cert: certificate};

    const server = https.createServer(credentials, app);

    server.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}
else {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port} with http`);
    });
}
