import { NextFunction, Request, Response, Router } from "express";
import { requireAuth } from "./auth";
import User from "./models/user";

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
        vendorId: user.vendorId
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

    const newName = req.body.name as string|undefined;
    if (newName === undefined) {
        res.status(400).send('Must specify name in query parameter');
        return;
    }
    if (newName.length < 8) {
        res.status(400).send('Name must be at least 8 characters long');
        return;
    }

    // Update database
    await User.updateOne({userId: req.userInfo.id}, {name: newName});
    res.send();
    //TODO status message
});
//TODO more functionalities as needed

export default UserController;
