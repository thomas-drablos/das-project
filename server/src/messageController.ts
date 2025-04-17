import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Message from './models/message';
import Chat from './models/chat';
import User from './models/user';
import Vendor from './models/vendor';

import { IMessage } from './models/message';

declare global {
  namespace Express {
    interface Request {
      message?: IMessage;
    }
  }
}

const MessageController: Router = Router({ mergeParams: true });
MessageController.use(requireAuth);

// verify access to a specific message
const verifyMessageAccess = async (req: Request, res: Response, next: NextFunction) => {
  const messageId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const message = await Message.findById(messageId)
  .populate('user') // get User's auth0Id
  .populate({
    path: 'vendor',
    populate: { path: 'user' } // get vendor.user.auth0Id
  });

  if (!message) return res.status(404).send('Message not found');

  const userAuth0Id = message.user?.auth0Id;
  const vendorOwnerAuth0Id = (message.vendor as any)?.user?.auth0Id;

  if (userAuth0Id !== auth0Id && vendorOwnerAuth0Id !== auth0Id) {
    return res.status(403).send('Forbidden');
  }


  req.message = message;
  next();
};


// GET / - list all messages (optional: ?chat=chatId)
MessageController.get('/', async (req, res) => {
  const chatFilter = req.query.chat as string | undefined;
  const auth0Id = req.auth?.payload.sub;

  // Lookup user document (we'll use its `_id`)
  const user = await User.findOne({ auth0Id });
  if (!user) return res.status(404).send("User not found");

  // Also lookup vendor(s) owned by this user
  const ownedVendors = await Vendor.find({ user: user._id }).select('_id');

  // Collect vendor ObjectIds
  const vendorIds = ownedVendors.map(v => v._id);

  // Now query messages/chats/invoices, etc.
  const query: any = {
    $or: [
      { user: user._id },         // documents where user is the current user
      { vendor: { $in: vendorIds } } // documents where vendor is owned by this user
    ]
  };

  const result = await Message.find(query)
    .sort({ time: -1 })
    .populate('user', 'name')
    .populate({
      path: 'vendor',
      populate: { path: 'user', select: 'auth0Id name email' }
  });


  if (chatFilter) query.chat = chatFilter;

  const messages = await Message.find(query)
    .sort({ time: -1 })
    .populate(['user', 'vendor']);

  res.json(messages);
});

// GET /:id - view one message
MessageController.get('/:id', verifyMessageAccess, async (req, res) => {
  try {
    res.json(req.message);
  } catch {
    res.status(500).send("Failed to fetch message");
  }
});

// POST /create - create a new message
MessageController.post('/create', async (req, res) => {
  try {
    const auth0Id = req.auth?.payload.sub;
  const { vendor, chat, text } = req.body;

  if (!vendor || !chat || !text) {
    return res.status(400).send('Missing required fields: vendor, chat, text');
  }

  const userObj = await User.findOne({ auth0Id });
  if (!userObj) return res.status(404).send('User not found');

  const chatObj = await Chat.findById(chat);
  if (!chatObj) return res.status(404).send('Chat not found');

  const message = await Message.create({
    user: {
      id: userObj.auth0Id,
      name: userObj.name,
      email: userObj.email,
    },
    vendor,
    chat,
    time: new Date(),
    text,
  });

  res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create message');
  }
});

export default MessageController;