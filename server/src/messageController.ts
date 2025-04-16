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


export default MessageController;