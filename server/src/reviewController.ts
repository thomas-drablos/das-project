import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Review, { IReview } from './models/review';
import User, { IUser } from './models/user';
import Vendor from './models/vendor';

const ReviewController: Router = Router({ mergeParams: true });

ReviewController.use(requireAuth);

interface ReviewRequest extends Request {
  review: IReview;
}
// Middleware: check review access
const verifyReviewAccess = async (req: Request, res: Response, next: NextFunction) => {
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
    .populate([{ path: 'user', select: '-id name' }, { path: 'vendor', select: 'name' }])
    .select('user vendor text rating time');

    res.json(reviews); //only some values selected
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to fetch reviews");
  }
});

// GET /:id - get a single review by id
ReviewController.get('/:id', verifyReviewAccess, async (req, res) => {
  try {
    const reviewId = (req as ReviewRequest).review._id;
    const review = await Review.findById(reviewId)
    .populate([{ path: 'user', select: '-id name' }, { path: 'vendor', select: 'name'}])
    .select('user vendor.name text rating time');
    res.json(review); //only selected fields
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to fetch review");
  }
});

// POST /create - post a new review
//assumption: passing vendor id in body
ReviewController.post('/create', async (req, res) => {
  try{
    const auth0Id = req.auth?.payload.sub;
    const { vendor, text, rating } = req.body;

    if (!vendor || !text || rating == null) {
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

    //append to review array
    var length = vendorObj.reviews.push(review); //to capture length returned by push()
    await vendorObj.save();

  //just to make sure 
  const returnReview = await Review.findById(review._id)
    .populate('user', 'name')   //returning only user and vendor name, may change
    .populate('vendor', 'name');

    res.status(201).json("Review successfully created.");
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to create review");
  }
});

// PATCH /:id/hide - toggle hidden status
ReviewController.patch('/:id/hide/:index', async (req, res) => {
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

  vendorObj.set(`reviews.${reviewIndex}.hidden`, review.hidden)
  await vendorObj.save()
  
  res.status(200).json("Successfully toggled vendor's hidden status");
});

//TODO: additional functionality: update reviews
export default ReviewController;
