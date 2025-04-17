import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Review from './models/review';
import User, { IUser } from './models/user';
import Vendor from './models/vendor';

const ReviewController: Router = Router({ mergeParams: true });

ReviewController.use(requireAuth);

// Middleware: check review access
const verifyReviewAccess = async (req: Request, res: Response, next: NextFunction) => {
  const reviewId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const review = await Review.findById(reviewId)
  .populate('user')
  .populate('vendor')
  .populate('vendor.user');
  if (!review) {
    res.status(404).send('Review not found');
    return;
  }

  if (review.user.auth0Id !== auth0Id && (review.populated('vendor')?.populated('user') as IUser).auth0Id !== auth0Id) {
    res.status(403).send('Forbidden');
    return;
  }

  req.review = review;
  next();
};

// GET / - get all reviews made by logged-in user
ReviewController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;

  //find user
  const user = await User.findOne({ auth0Id });
  if(!user){
    res.status(404).send("No user found");
    return
  }

  const reviews = await Review.find({ user: user._id})
  .sort({ time: -1 })
  .populate(['user', 'vendor'])
  .select('user.name vendor.name text rating time');

  res.json(reviews);
});

// GET /:id - get a single review by id
ReviewController.get('/:id', verifyReviewAccess, async (req, res) => {
  try {
    const review = req.review; //TODO: type error
  } catch (err) {
    res.status(500).send("Failed to fetch review");
  }
  res.json(review); //TODO
});

// POST /create - post a new review
ReviewController.post('/create', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const { vendor, text, rating } = req.body;

  if (!vendor || !text || rating == null) {
    res.status(400).send('Missing required field(s)');
    return;
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400).send('Rating must be a number between 1 and 5');
    return;
  }

 //find user object
 const userObj = await User.findOne({ auth0Id });
 if(!userObj){
   res.status(404).send("User not found.");
   return;
 }

 //find vendor object
 const vendorObj = await Vendor.findById(vendor);
 if(!vendorObj){
   res.status(404).send("Vendor not found.");
   return;
 }

 //create new review
  const review = await Review.create({
    user: userObj._id,
    vendor: vendorObj._id,
    text,
    rating,
    time: new Date()
  });
  await review.save();
  //TODO: add to vendor account

  //just to make sure 
  const returnReview = await Review.findById(review._id)
  .populate('user', 'name')   //returning only user and vendor name, may change
  .populate('vendor', 'name');

  //TODO status
  res.status(201).json(returnReview);
});

//TODO: additional functionality: update and delete reviews
export default ReviewController;
