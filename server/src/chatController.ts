import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Chat from './models/chat';
import User from './models/user';
import Vendor from './models/vendor';
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
  try {
    const chatId = req.params.id;
    const auth0Id = req.auth?.payload.sub;

    const chat = await Chat.findById(chatId)
      .populate('user', 'name email auth0Id')
      .populate({ path: 'vendor', populate: { path: 'user', select: 'auth0Id' } })

    if (!chat) {
      res.status(404).json('Chat not found');
      return;
    }

    if (chat.user.auth0Id !== auth0Id && chat.vendor.user.auth0Id !== auth0Id) {
      res.status(403).json('Forbidden');
      return;
    }

    req.chat = chat;
    next();
  } catch (err) {
    console.log(`Error in verifying chat access: {$err}`);
    console.log(err);
    res.status(500).json("Internal server error");
  }
};

// GET / - list all chats for current user
// Optional: ?vendor=<vendorId> filter
ChatController.get('/', async (req, res) => {
  try{
    const auth0Id = req.auth?.payload.sub;
    const vendorFilter = req.query.vendor as string | undefined;

    const userObj = await User.findOne({ auth0Id });
    if (!userObj) {
      res.status(404).json("User not found.");
      return;
    }

    const query: any = {
      $or: [
        { 'user': userObj._id },
        { 'vendor': userObj.vendorId }
      ]
    };
    if (vendorFilter) query['vendor'] = vendorFilter;

    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 })
      .populate('user', 'name')
      .populate('vendor', 'name');

    res.json(chats);
  } catch (err) {
    console.log(`Failed to fetch chat: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// GET /:id - get one chat by ID
ChatController.get('/:id', verifyChatAccess, async (req, res) => {
  try{
    //already verified chat access
    //find the chat 
    const inputId = req.params.id;
    const chatObj = await Chat.findById(inputId)
      .populate('user', 'name -_id')
      .populate('vendor', 'name')
      .select('user vendor time messages invoices');
    res.json(chatObj);
  } catch (err) {
    console.log(`Failed to fetch chat: {$err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// POST /create - basic create chat
ChatController.post('/create', async (req, res) => {
  try{
    const { vendor } = req.body;

    if (!vendor) {
      res.status(400).json('Missing vendor');
      return;
    }

    const auth0Id = req.auth?.payload.sub;
    const userObj = await User.findOne({ auth0Id });

    if (!userObj) {
      res.status(404).json('Authenticated user not found');
      return;
    }

    const vendorObj = await Vendor.findById(vendor);
    if (!vendorObj) {
      res.status(404).json('Vendor not found');
      return;
    }

    // Prevent duplicate chat between same user and vendor
    const existingChat = await Chat.findOne({
      'user': userObj._id,
      'vendor': vendorObj._id
    });

    if (existingChat) {
      res.status(409).json({ message: 'Chat already exists', chat: existingChat });
      return;
    }

    const chat = await Chat.create({
      vendor: vendor,
      user: userObj._id,
      time: new Date(),
      messages: [],
      invoices: [],
    });

    const returnChat = await Chat.findById(chat._id)
      .populate('user', 'name -_id')
      .populate('vendor', 'name');

    res.status(201).json(returnChat);
  } catch (err) {
    console.log(`Failed to create chat: {$err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

ChatController.get('/:id/messages', verifyChatAccess, async (req, res) => {
  try{
    const chat = req.params.id;

    // Find the chat
    const existingChat = await Chat.findById(chat)
      .populate('user', 'name -_id')
      .populate('vendor', 'name');

    if (!existingChat) {
      res.status(500).json('Chat not found');
      return;
    }

    res.json(existingChat.messages.sort((a, b) => +new Date(a.time) - +new Date(b.time)));
  } catch (err) {
    console.log(`Failed to fetch message: {$err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });  }
  });

ChatController.post('/:id/messages', verifyChatAccess, async (req, res) => {
  try {
    const chat = req.params.id;
    const chatObj = await Chat.findById(chat).populate('user vendor')
    if (chatObj == null || chatObj == undefined) {
      res.status(500).json('Chat not found')
      return
    }
    
    const auth0Id = req.auth?.payload.sub;
    const userObj = await User.findOne({ auth0Id });
    if (!userObj) {
      res.status(404).json("User not found.");
      return;
    }
    const text = req.body.text;

    if (!text) {
      res.status(400).json('Missing message text');
      return;
    }

    const newMessage: IMessage | any = {
      text: text,
      time: new Date(),
      user: chatObj.user,
      vendor: chatObj.vendor,
      sender: userObj.userId
    };

    chatObj.messages.push(newMessage);
    await chatObj.save();

    res.status(201).json(newMessage);
  } catch (err){
    console.log(`Failed to add message: {$err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default ChatController;