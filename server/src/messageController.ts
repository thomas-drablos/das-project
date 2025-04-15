import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Message from './models/message';
import Chat from './models/chat';
import User from './models/user';

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

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).send('Message not found');

  if (message.user?.id !== auth0Id && message.vendor?.id !== auth0Id) {
    return res.status(403).send('Forbidden');
  }

  req.message = message;
  next();
};


// GET / - list all messages (optional: ?chat=chatId)
MessageController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const chatFilter = req.query.chat as string | undefined;

  const user = await User.findOne({ auth0Id });
  if (!user) return res.status(404).send("User not found");

  const query: any = {
    $or: [{ 'user.id': auth0Id }, { 'vendor.id': auth0Id }],
  };
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
});

export default MessageController;