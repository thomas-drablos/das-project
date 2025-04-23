import { Router, Request, Response, NextFunction } from 'express';
// import { Request } from 'express-session';
import User from './models/user';
import Chat from './models/chat';
import Invoice from './models/invoice';
import Login from './models/login';
import Message from './models/message';
import Review from './models/review';
import Vendor from './models/vendor';

import { requireAuth } from './auth';
import UserController from './userController';
import { randomUUID } from 'crypto';

const router: Router = Router();

router.use('/user/:id', UserController);

router.get('/userinfo', requireAuth, async (req: Request, res: Response) => {
    const id = req.auth!.payload.sub!;
    const user = await User.findOne({auth0Id: id}, 'userId name');
    res.send({
        exists: (user !== null),
        userId: user?.userId ?? '',
        name: user?.name ?? '',
    });
});

router.post('/register', requireAuth, async (req: Request, res: Response) => {
    const name = req.body.name;
    const email = req.body.email;
    const sub = req.auth!.payload.sub!;

    const preexisting = await User.exists({ auth0Id: sub }).exec();

    // Check provided user information against signed info from access token
    // We'll use the verified details from token as it's not untrusted user data
    // Only purpose for the user provided data is sanity check: prevents a client bug thinking the name is different
    const verifiedName = req.auth?.payload.appUsername;
    const verifiedEmail = req.auth?.payload.appEmail;
    if (!verifiedName || name !== verifiedName ||
        !verifiedEmail || email !== verifiedEmail) {
        res.status(400).send('Invalid user information');
        return;
    }

    let newUser = true;
    let userId: string;
    // If user hasn't already been created, enter to database
    if (preexisting === null) {
        // In astronomical chance a UUID collision occurs, throw opaque internal error
        const uuid = randomUUID();
        if ((await User.exists({ userId: uuid })) !== null) {
            res.status(500).send('Internal server error');
            return;
        }

        const user = new User({
            name: verifiedName,
            email: verifiedEmail,
            auth0Id: sub,
            userId: uuid,
        });

        user.save();
        userId = user.userId;
    }
    else {
        // If this is a duplicate registration, fetch userId from the database
        const user = await User.findOne({ auth0Id: sub }, 'userId');
        userId = user?.userId!;
        newUser = false;
    }

    res.json({
        name,
        userId,
        newUser,
    });
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
