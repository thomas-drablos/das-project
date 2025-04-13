import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Chat from './models/chat';

const ChatController: Router = Router({ mergeParams: true });

ChatController.use(requireAuth);

// Middleware: check user is part of the chat
const verifyChatAccess = async (req: Request, res: Response, next: NextFunction) => {
  const chatId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).send('Chat not found');

  if (chat.user.id !== auth0Id && chat.vendor.id !== auth0Id) {
    return res.status(403).send('Forbidden');
  }

  req.chat = chat;
  next();
};

// GET / - list all chats for current user
ChatController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const chats = await Chat.find({
    $or: [
      { 'user.id': auth0Id },
      { 'vendor.id': auth0Id }
    ]
  });
  res.json(chats);
});

// GET /:id - get one chat
ChatController.get('/:id', verifyChatAccess, async (req, res) => {
  res.json(req.chat);
});

// POST /create - basic create chat
ChatController.post('/create', async (req, res) => {
  const { user, vendor } = req.body;

  if (!user || !vendor) return res.status(400).send('Missing user or vendor');

  const chat = await Chat.create({
    user,
    vendor,
    time: new Date(),
    messages: [],
    invoices: [],
  });

  res.status(201).json(chat);
});

export default ChatController;