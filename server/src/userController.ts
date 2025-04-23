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
        vendorId: user.vendorId,
        profilePic: user.profilePic,
    };
    next();
}

UserController.use(requireAuth);
UserController.use(enforceSameUser);

// GET / - get user info
UserController.get('/', (req: Request, res: Response) => {
    try{
        if (!req.userInfo) {
            res.status(500).json();
            return;
        }

        res.json(req.userInfo);
    } catch (err){
        console.error(err);
        res.status(500).json("Failed to fetch user info");
    }
});

// PATCH /name - set user name
UserController.patch('/name', async (req: Request, res: Response) => {
    try {
        if (!req.userInfo) {
          res.status(500).json();
          return;
        }
        const newName = req.query.name as string|undefined;
        if (newName === undefined) {
          res.status(400).json('Must specify name in query parameter');
          return;
        }
        if(newName.length > 50){
          res.status(400).json("Name must be 50 characters or less");
          return;
        }
        if (newName.length < 5) {
          res.status(400).json('Name must be at least 5 characters long');
          return;
        }

        // Update database
        await User.updateOne({userId: req.userInfo.id}, {name: newName});
        res.status(200).json('Successfully created name');
    } catch (err){
        console.error(err);
        res.status(500).json('Failed to create user name');
    }
});

export default UserController;
