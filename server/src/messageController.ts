import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Message from './models/message';

const MessageController: Router = Router({ mergeParams: true });

MessageController.use(requireAuth);

// Middleware: verify access to a specific message
const verifyMessageAccess = async (req: Request, res: Response, next: NextFunction) => {
  const messageId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).send('Message not found');

  if (message.user.id !== auth0Id && message.vendor.id !== auth0Id) {
    return res.status(403).send('Forbidden');
  }

  req.message = message;
  next();
};

// GET / - list all messages for the logged-in user/vendor
MessageController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;

  const messages = await Message.find({
    $or: [
      { 'user.id': auth0Id },
      { 'vendor.id': auth0Id }
    ]
  }).sort({ time: -1 });

  res.json(messages);
});

// GET /:id - view one message
MessageController.get('/:id', verifyMessageAccess, async (req, res) => {
  res.json(req.message);
});

// POST /create - create a new message
MessageController.post('/create', async (req, res) => {
  const { user, vendor, text } = req.body;

  if (!user || !vendor || !text) {
    return res.status(400).send('Missing required fields');
  }

  const message = await Message.create({
    user,
    vendor,
    time: new Date(),
    text
  });

  res.status(201).json(message);
});

export default MessageController;