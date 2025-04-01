// const express = require('express');
// const router = express.Router();
import { Router, Request, Response, NextFunction } from 'express';
// import { Request } from 'express-session';

const router: Router = Router();

router.post('/login', (req: Request, res: Response) => {
    console.log('login');
    const email = req.body.email;
    if (email === 'admin@email.com') {
        req.session.valid = true;
        req.session.expiresAt = Date.now() + (req.session.cookie.maxAge ?? 3600000);
        console.log('User authenticated');
        res.json({
            username: 'Admin',
            isAdmin: false,
            validUntil: req.session.expiresAt,
        });
        return;
    }

    console.log('user not authenticated');
    res.status(400).send('Invalid username or password');
});

// block unauthenticated requests
router.use((req: Request, res: Response, next: NextFunction) => {
    if (req.session.valid && (req.session.expiresAt ?? 0) >= Date.now()) {
        next();
        return;
    }

    res.status(401).send('Unauthenticated');
});

router.post('/logout', (req: Request, res: Response) => {
    if (!req.session.valid) {
        res.status(400).send('Not logged in');
        return;
    }

    req.session.destroy(err => console.log(err));
    res.send();
});

router.get('/test', (req: Request, res: Response) => {
    res.send('Ping!');
});

export default router;
