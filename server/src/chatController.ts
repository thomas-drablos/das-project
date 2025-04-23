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
  const chatId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const chat = await Chat.findById(chatId)
    .populate({ path: 'vendor', populate: { path: 'user', select: '-_id auth0Id'}})
    .populate({ path: 'user', select: '-id name auth0Id email'});

  if (!chat) {
    res.status(404).json('Chat not found');
    return;
  }

  if (chat.user.auth0Id !== auth0Id && chat.vendor.user.auth0Id !== auth0Id)
    {
      res.status(403).json('Forbidden');
      return;
  }

  req.chat = chat;
  next();
};

// GET / - list all chats for current user
// Optional: ?vendor=<vendorId> filter
ChatController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const vendorFilter = req.query.vendor as string | undefined;

  const userObj = await User.findOne({ auth0Id });
  if(!userObj){
    res.status(404).json("User not found");
    return;
  }

  const query: any = {
    $or: [
      { 'user.id': userObj._id },
      { 'vendor.id': userObj.vendorId }
    ]
  };
  if (vendorFilter) query['vendor'] = vendorFilter;

  const chats = await Chat.find(query)
    .sort({ updatedAt: -1 })
    .populate('vendor', 'name')
    .populate({ path: 'user', select: '-_id name' });

  res.json(chats); //only selected fields returned
});

// GET /:id - get one chat by ID
ChatController.get('/:id', verifyChatAccess, async (req, res) => {
  //already verified chat access
  //find the chat 
  const inputId = req.params.id;
  const chatObj = await Chat.findById({ inputId })
  .populate([{ path: 'user', select: '-_id name'}, { path: 'vendor', select: 'name'}])
  .select('user vendor time messages invoices');
  res.json(chatObj);
});

// POST /create - basic create chat
ChatController.post('/create', async (req, res) => {
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
    'user.id': userObj.auth0Id,
    'vendor.id': vendor.id
  });
    
  if (existingChat) {
    res.status(409).json({ message: 'Chat already exists', chat: existingChat });
    return;
  }

  const chat = await Chat.create({
    user: userObj._id,
    vendor: vendor,
    time: new Date(),
    messages: [],
    invoices: [],
  });

  const returnChat = await Chat.findById(chat._id)
    .populate({ path: 'user', select: '-id name' })
    .populate({ path: 'vendor', select: 'name' });

  res.status(201).json(returnChat);
});

ChatController.get('/:id/messages', verifyChatAccess, async (req, res) => {
  const chat = req.params.id;

  const existingChat = await Chat.findById(chat);
  if (!existingChat) {
    res.status(404).json('Chat not found');
    return; 
  }
  res.json(existingChat.messages.sort((a, b) => +new Date(a.time) - +new Date(b.time)));});


ChatController.post('/:id/messages', verifyChatAccess, async (req, res) => {
  const chat = req.params.id;
  const chatObj = await Chat.findById(chat)
  .populate({path: 'vendor', populate: { path: 'user', select: '-_id'}})
  .populate({ path: 'user', select: '-_id'});

  if (chatObj == null || chatObj == undefined) {
    res.status(500).json('Chat not found')
    return;
  }
  const auth0Id = req.auth?.payload.sub;
  const userObj = await User.findOne({ auth0Id }); 
  if (!userObj) {
    res.status(404).json("User not found.");
    return;
  }
  // ensuring that the current user is a vendor
  let sender:any, receiver:any
  if (userObj.vendorId != chatObj.vendor._id) {
    sender = chatObj.vendor._id
    receiver = chatObj.user
  } else {
    sender = chatObj.user
    receiver = chatObj.vendor._id
  }
  const { text } = req.body;

  if (!text) {
    res.status(400).json('Missing message text');
    return;
  }

  const newMessage: IMessage | any = {
    text,
    time: new Date(),
    user: sender,
    vendor: receiver,
  };
   /*sender: chat?.user.id === req.auth?.payload.sub ? 'user' : 'vendor',
    user: {
     id: chat?.user.id!,
      name: chat?.user.name,
      email: chat?.user.email,
    },
    vendor: {
      id: chat?.vendor.id!,
      name: chat?.vendor.name,
      email: chat?.vendor.user.email, BHUVAN: where is this coming from?
    }
  }
  */
  chatObj.messages.push(newMessage);
  await chatObj.save();
  
  newMessage.populate({ path: 'vendor', select: 'name'})
  .populate({ path: 'user', select: '-_id name email'});
  res.status(201).json(newMessage);
});

export default ChatController;