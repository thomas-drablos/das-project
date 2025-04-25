import { NextFunction, Request, Response, Router } from "express";
import { requireAuth } from "./auth";
import User from "./models/user";
import { auth } from "express-oauth2-jwt-bearer";
import EventLog from "./models/eventLog";

const UserController: Router = Router({ mergeParams: true });

const enforceSameUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth) {
      res.status(403).json("Forbidden");
      return;
    }

    const targetId = req.params.id;
    const user = await User.findOne({ auth0Id: req.auth.payload.sub }, '-auth0Id');
    if (user === null || user.userId !== targetId) {
      res.status(403).json("Forbidden");
      return;
    }

    req.userInfo = {
      id: user.userId,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      vendorId: user.vendorId,
      profilePic: user.profilePic,
      hidden: user.hidden
    };
    next();
  } catch (err) {
    console.log(`Error in /userinfo: {$err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });  }
}

UserController.use(requireAuth);
UserController.use(enforceSameUser);

// GET / - get user info
UserController.get('/', (req: Request, res: Response) => { //check permissions??
  try {
    if (!req.userInfo) {
      res.status(500).json();
      return;
    }

    // if the user is hidden no need to provide information
    if (req.userInfo.hidden) {
      res.json("User has been hidden")
      return
    }

    res.json(req.userInfo);
  } catch (err) {
    console.log(`Failed to fetch user info: {$err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

//GET /all - get all users (admin)
UserController.get('/all', async (req, res) => {
  try {
    //check permissions, must be admin
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      res.status(403).json("Forbidden");
      return;
    }

    //do not return db id, select attributes
    const users = await User.find()
      .select('name email profilePic hidden vendorId');

    res.json(users);
  } catch (err) {
    console.log(`Failed to fetch user info: {$err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// PATCH /name - set user name
UserController.patch('/name', async (req: Request, res: Response) => {
  try {
    if (!req.userInfo) {
      res.status(500).json();
      return;
    }

    const newName = req.body.name as string | undefined;
    if (newName === undefined) {
      res.status(400).json('Must specify name in query parameter');
      return;
    }
    if (newName.length > 50) {
      res.status(400).json("Name must be 50 characters or less");
      return;
    }
    if (newName.length < 5) {
      res.status(400).json('Name must be at least 5 characters long');
      return;
    }

    const nameRegex = /^[a-zA-Z'._ ]+$/
    if (!nameRegex.test(newName)) {
        res.status(400).send('Invalid name format');
        return;
    }

    // Update database
    await User.updateOne({ userId: req.userInfo.id }, { name: newName });
    await EventLog.create({
      event: 'Changed username',
      activeUser: req.userInfo.id,
      oldValue: req.userInfo.name,
      newValue: newName,
    });

    res.status(200).json('Successfully created name');
  } catch (err) {
    console.log(`Failed to set user name: ${err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// PATCH /:id/profile-pic - add or update profile picture
UserController.patch('/:id/profile-pic', requireAuth, async (req, res) => {
  try {
    const profilePic = req.body.profilePic;
    const id = req.params.id;

    if (
      !profilePic ||
      typeof profilePic !== 'string'
    ) {
      res.status(400).json({message: "Invalid profilePic URL."});
      return;
    }

    // Get user
    const userObj = await User.findOne({ userId: id });
    if (!userObj) {
      res.status(404).json("User not found");
      return;
    }

    // Check permissions
    const auth0Id = req.auth?.payload.sub;
    if (userObj.auth0Id !== auth0Id && !userObj.isAdmin) {
      res.status(403).json("Forbidden");
      return;
    }

    // Update profilePic
    userObj.profilePic = profilePic;
    await userObj.save();

    res.status(200).json("Successfully set profile picture");
  } catch (err) {
    console.log(`Failed to set profile picture: ${err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// PATCH /:id/profile-pic/delete - delete profile picture
UserController.patch('/:id/profile-pic/delete', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // Get user
    const userObj = await User.findOne({ userId: id });
    if (!userObj) {
      res.status(404).json("User not found");
      return;
    }

    // Check permissions
    const auth0Id = req.auth?.payload.sub;
    if (userObj.auth0Id !== auth0Id && !userObj.isAdmin) {
      res.status(403).json("Forbidden");
      return;
    }

    // Delete profilePic
    userObj.profilePic = "";
    await userObj.save();

    res.status(200).json("Successfully deleted profile picture");
  } catch (err) {
    console.log(`Failed to delete profile picture: ${err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// PATCH /hide - toggle hidden status
UserController.patch('/:userId/hide', async (req, res) => {
  try {
    const hideUser = req.params.userId
    //get user
    const user: any = await User.findById({_id: hideUser});
    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    //change hidden
    user.hidden = !user.hidden
    await user.save()
    res.status(200).json("Successfully toggled user's hidden status")
  } catch (err) {
    console.log(`Failed to toggle user's hidden status: ${err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
})

export default UserController;
