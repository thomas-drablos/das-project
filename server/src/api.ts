import { Router, Request, Response, NextFunction } from 'express';
// import { Request } from 'express-session';
import User from '../models/user';
import Chat from '../models/chat';
import Invoice from '../models/invoice';
import Login from '../models/login';
import Message from '../models/message';
import Review from '../models/review';
import Vendor from '../models/vendor';

import requireAuth from './auth';

const router: Router = Router();

router.get('/test', requireAuth, (req: Request, res: Response) => {
    res.send('Ping! ' + JSON.stringify(req.auth?.payload));
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
