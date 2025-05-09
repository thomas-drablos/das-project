import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Review, { IReview, reviewSchema } from './models/review';
import User, { IUser } from './models/user';
import Vendor from './models/vendor';
import EventLog from './models/eventLog';

const ReviewController: Router = Router({ mergeParams: true });

ReviewController.use(requireAuth);

declare global {
  namespace Express {
    interface Request {
      review?: IReview;
    }
  }
}


// Middleware: check review access
const verifyReviewAccess = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const reviewId = req.params.id;
    const auth0Id = req.auth?.payload.sub;

    const review = await Review.findById(reviewId)
      .populate('user')
      .populate('vendor')
      .populate('vendor.user');
    if (!review) {
      res.status(404).json('Review not found');
      return;
    }

    if (review.user.auth0Id !== auth0Id && (review.populated('vendor')?.populated('user') as IUser).auth0Id !== auth0Id) {
      res.status(403).json('Forbidden');
      return;
    }

    req.review = review;
    next();
  } catch (err) {
    console.log(`Error in verfying review access: {$err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });  }
};

// GET / - get all reviews made by logged-in user
ReviewController.get('/', async (req, res) => {
  try{
    const auth0Id = req.auth?.payload.sub;

  //find user
  const user = await User.findOne({ auth0Id });
  if (!user) {
    res.status(404).json("No user found");
    return
  }

  const reviews = await Review.find({ user: user._id })
    .sort({ time: -1 })
    .populate([{ path: 'user', select: '-_id name' }, { path: 'vendor', select: 'name' }])
    .select('user vendor text rating time');

    res.json(reviews); //only some values selected
  } catch (err) {
    console.log(`Failed to fetch reviews: ${err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// GET /:id - get a single review by id
ReviewController.get('/:id', verifyReviewAccess, async (req, res) => {
  try {
    const reviewId = req.review?._id;
    if (!reviewId) {
      res.status(500).send('Internal server error');
      return;
    }
    const review = await Review.findById(reviewId)
    .populate([{ path: 'user', select: '-_id name' }, { path: 'vendor', select: 'name'}])
    .select('user vendor.name text rating time');
    res.json(review); //only selected fields
  } catch (err) {
    console.log(`Failed to fetch review: ${err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// POST /create - post a new review
//assumption: passing vendor id in body
ReviewController.post('/create', async (req, res) => {
  try{
    const auth0Id = req.auth?.payload.sub;
    const { vendor, text, rating } = req.body;

    if (!vendor || !text || !rating) {
      res.status(400).json('Missing required field(s)');
      return;
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json('Rating must be a number between 1 and 5');
      return;
    }

  //find user object
  const userObj = await User.findOne({ auth0Id });
  if(!userObj){
    res.status(404).json("User not found.");
    return;
  }

  //find vendor object
  const vendorObj = await Vendor.findById(vendor);
  if(!vendorObj){
    res.status(404).json("Vendor not found.");
    return;
  }

  //create new review
  const review = await Review.create({
    user: userObj._id,
    vendor: vendorObj._id,
    name: userObj.name,
    text,
    rating,
    time: new Date()
  });

  await review.save();

  await EventLog.create({
    event: 'Created review',
    activeUser: userObj._id,
    newValue: review._id,
  });

    //append to review array
    var length = vendorObj.reviews.push(review); //to capture length returned by push()
    await vendorObj.save();

    res.status(201).json("Review successfully created.");
  } catch (err){
    console.log(`Failed to create review: ${err}`);
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });  }
});

// PATCH /:id/hide - toggle hidden status
ReviewController.patch('/:id/hide/:index', async (req, res) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const user = await User.findOne({ auth0Id }, 'isAdmin');
    if (user === null || !user.isAdmin) {
      res.status(403).send('Not authorized');
      return;
    }

    const review = await Review.findById(req.params.id);
    const reviewIndex = req.params.index
    if (!review) {
      res.status(404).json('Review not found');
      return;
    }

    review.hidden = !review.hidden;
    await review.save();

    //also need to update the vendor review array
    //find vendor object
    const vendorObj = await Vendor.findById(review.vendor);
    if (!vendorObj) {
      res.status(404).json("Vendor not found.");
      return;
    }

    vendorObj.set(`reviews.${reviewIndex}.hidden`, review.hidden);
    await vendorObj.save();
    
    res.status(200).json("Successfully toggled vendor's hidden status");
  } catch (err) {
    console.log(`Failed to toggle vendor's hidden status: {$err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });  }
});
export default ReviewController;
