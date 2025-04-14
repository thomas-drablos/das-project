import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Chat from './models/chat';
import User, { IUser } from './models/user';
import Vendor from './models/vendor';

const ChatController: Router = Router({ mergeParams: true });

ChatController.use(requireAuth);

// Middleware: check user is part of the chat
const verifyChatAccess = async (req: Request, res: Response, next: NextFunction) => {
  const chatId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const chat = await Chat.findById(chatId)
    .populate('user')
    .populate('vendor')
    .populate('vendor.user');
    // .select('time messages vendor.name user.name');

  if (!chat) {
    res.status(404).send('Chat not found');
    return;
  }

  if (chat.user.auth0Id !== auth0Id && chat.vendor.user.auth0Id !== auth0Id) {
    res.status(403).send('Forbidden');
    return;
  }

  req.chat = {
    time: chat.time,
    messages: chat.messages,
    user: {
      name: chat.user.name
    },
    vendor: {
      name: chat.vendor.name
    },
  };
  next();
};

// GET / - list all chats for current user
ChatController.get('/', requireAuth, async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const user = await User.findOne({auth0Id}, '_id');
  if (user === null) {
    throw new Error('Internal error');
  }

  //TODO this doesn't work, vendor is vendor type, we need to cross-check vendor.user, but can't do that i find
  const chats = await Chat.find({
    $or: [
      { 'user': user._id },
      { 'vendor': user._id }
    ],
  }).populate(['user', 'vendor'])
  .select('time messages vendor.name user.name');
  res.json(chats);
});

// GET /:id - get one chat
ChatController.get('/:id', requireAuth, verifyChatAccess, async (req, res) => {
  res.json(req.chat);
});

// POST /create - basic create chat
ChatController.post('/create', requireAuth, async (req, res) => {
  const { user, vendor } = req.body;

  if (!user || !vendor) {
    res.status(400).send('Missing user or vendor');
    return;
  }

  // This assumes that requestor matches the user ID, so only allows customers to open chats
  const auth0Id = req.auth?.payload.sub;
  const userObj = await User.findOne({auth0Id}, 'userId');
  if (!userObj || userObj.userId !== user) {
    res.status(400).send('Invalid user id');
    return;
  }

  const vendorObj = await Vendor.exists({_id: vendor});
  if (!vendorObj) {
    res.status(400).send('Invalid vendor id');
    return;
  }

  const chat = await Chat.create({
    user: userObj._id,
    vendor: vendorObj._id,
    time: new Date(),
    messages: [],
    invoices: [],
  });

  res.status(201).send();
});

ChatController.post('/:id/message', requireAuth, verifyChatAccess, async (req, res) => {
  const text: string = req.body.text;
  // Validate content?
  if (!text || text.length > 255) {
    res.status(400).send('Improperly formatted or too long message');
    return;
  }

});

export default ChatController;