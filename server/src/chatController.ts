import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Chat from './models/chat';
import User from './models/user';
import Vendor from './models/vendor';

// types/express/index.d.ts
import { IChat } from './models/chat';
import { IMessage } from './models/message';

declare global {
  namespace Express {
    interface Request {
      chat?: IChat;
    }
  }
}


const ChatController: Router = Router({ mergeParams: true });

ChatController.use(requireAuth);

// check user is part of the chat
const verifyChatAccess = async (req: Request, res: Response, next: NextFunction) => {
  const chatId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const chat = await Chat.findById(chatId)
    .populate('user', 'name email')
    .populate('vendor', 'name email');

  if (!chat) return res.status(404).send('Chat not found');

  if (chat.user.id !== auth0Id && chat.vendor.id !== auth0Id) {
    return res.status(403).send('Forbidden');
  }

  req.chat = chat;
  next();
};

// GET / - list all chats for current user
// Optional: ?vendor=<vendorId> filter
ChatController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const vendorFilter = req.query.vendor as string | undefined;

  const query: any = {
    $or: [
      { 'user.id': auth0Id },
      { 'vendor.id': auth0Id }
    ]
  };
  if (vendorFilter) query['vendor.id'] = vendorFilter;

  const chats = await Chat.find(query)
    .sort({ updatedAt: -1 })
    .populate('user', 'name')
    .populate('vendor', 'name');

  res.json(chats);
});

// GET /:id - get one chat by ID
ChatController.get('/:id', verifyChatAccess, async (req, res) => {
  res.json(req.chat);
});

// POST /create - basic create chat
ChatController.post('/create', async (req, res) => {
  const { user, vendor } = req.body;

  if (!user || !vendor) return res.status(400).send('Missing user or vendor');

  // Validate existence of user and vendor
  const userObj = await User.findOne({ userId: user.id });
  if (!userObj) return res.status(404).send('User not found');

  const vendorObj = await Vendor.findById(vendor.id);
  if (!vendorObj) return res.status(404).send('Vendor not found');

  // Prevent duplicate chat between same user and vendor
  const existingChat = await Chat.findOne({
    'user.id': user.id,
    'vendor.id': vendor.id
  });
  if (existingChat) {
    return res.status(409).json({ message: 'Chat already exists', chat: existingChat });
  }

  const chat = await Chat.create({
    user,
    vendor,
    time: new Date(),
    messages: [],
    invoices: [],
  });

  const returnChat = await Chat.findById(chat._id)
    .populate('user', 'name')
    .populate('vendor', 'name');

  res.status(201).json(returnChat);
});

ChatController.get('/:id/messages', verifyChatAccess, async (req, res) => {
  const chat = req.chat;
  if (!chat) return res.status(500).send('Chat not found');
  res.json(chat.messages.sort((a, b) => +new Date(a.time) - +new Date(b.time)));
});

ChatController.post('/:id/messages', verifyChatAccess, async (req, res) => {
  const chat = req.chat;
  const { text } = req.body;

  if (!text) return res.status(400).send('Missing message text');

  const newMessage: IMessage | any = {
    text,
    time: new Date(),
    sender: chat?.user.id === req.auth?.payload.sub ? 'user' : 'vendor',
    user: {
      id: chat?.user.id!,
      name: chat?.user.name,
      email: chat?.user.email,
    },
    vendor: {
      id: chat?.vendor.id!,
      name: chat?.vendor.name,
      email: chat?.vendor.email,
    }
  };
  
  if (!chat) return res.status(500).send('Chat not found');
  chat.messages.push(newMessage);
  await chat.save();
  
  res.status(201).json(newMessage);
});

export default ChatController;