import { NextFunction, Request, Response, Router } from "express";
import { requireAuth } from "./auth";
import User from "./models/user";
import EventLog from "./models/eventLog";

const UserController: Router = Router({mergeParams: true});

const enforceSameUser = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
        throw new Error('Unauthorized');
    }

    const targetId = req.params.id;
    const user = await User.findOne({auth0Id: req.auth.payload.sub}, '-auth0Id');
    if (user === null || user.userId !== targetId) {
        throw new Error('Unauthorized');
    }

    req.userInfo = {
        id: user.userId,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
    };
    next();
}

UserController.use(requireAuth);
UserController.use(enforceSameUser);

UserController.get('/', (req: Request, res: Response) => {
    if (!req.userInfo) {
        res.status(500).send();
        return;
    }

    res.json(req.userInfo);
});

UserController.post('/name', async (req: Request, res: Response) => {
    if (!req.userInfo) {
        res.status(500).send();
        return;
    }

    const newName = req.query.name as string|undefined;
    if (newName === undefined) {
        res.status(400).send('Must specify name in query parameter');
        return;
    }
    if (newName.length < 8 && newName.length > 20) {
        res.status(400).send('Name must be at least 8 and at most 20 characters long');
        return;
    }

    const nameRegex = /^[a-zA-Z'._ ]+$/
    if (!nameRegex.test(newName)) {
        res.status(400).send('Invalid name format');
        return;
    }

    // Update database
    await User.updateOne({userId: req.userInfo.id}, {name: newName});
    await EventLog.create({
        event: 'Changed username',
        activeUser: req.userInfo.id,
        oldValue: req.userInfo.name,
        newValue: newName,
    });

    res.send();
});

export default UserController;
