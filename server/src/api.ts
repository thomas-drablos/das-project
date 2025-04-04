// const express = require('express');
// const router = express.Router();
import { Router, Request, Response, NextFunction } from 'express';
// import { Request } from 'express-session';
import User from '../models/user';
import Chat from '../models/chat';
import Invoice from '../models/invoice';
import Login from '../models/login';
import Message from '../models/message';
import Review from '../models/review';
import Vendor from '../models/vendor';


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

router.get('/user', async (req: Request, res: Response) => {
    const u = new User({
        name: "John Doe",
      });
    await u.save();
});

router.get('/chat', async (req: Request, res: Response) => {
    const c = new Chat({
        time: new Date()
      });
    await c.save();
});

router.get('/invoice', async (req: Request, res: Response) => {
    const i = new Invoice({
        specs: "Painting of my dog pls :P"
      });
    await i.save();
});

router.get('/login', async (req: Request, res: Response) => {
    const l = new Login({
        time: new Date(), 
        failed: true
      });
    await l.save();
});

router.get('/message', async (req: Request, res: Response) => {
    const m = new Message({
        text: "Hello!"
      });
    await m.save();
});

router.get('/review', async (req: Request, res: Response) => {
    const r = new Review({
        text: "This sucked", 
        rating: 0,
        time: new Date()
      });
    await r.save();
});

router.get('/vendor', async (req: Request, res: Response) => {
    const v = new Vendor({
        name: "Store owner", 
        description: "This is my store, which I own."
      });
    await v.save();
});

export default router;
