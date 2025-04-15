import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Review from './models/review';

const ReviewController: Router = Router({ mergeParams: true });

ReviewController.use(requireAuth);

// Middleware: check review access
const verifyReviewAccess = async (req: Request, res: Response, next: NextFunction) => {
  const reviewId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).send('Review not found');

  if (review.user.id !== auth0Id && review.vendor.id !== auth0Id) {
    return res.status(403).send('Forbidden');
  }

  req.review = review;
  next();
};

// GET / - get all reviews for logged-in user or vendor
ReviewController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;

  const reviews = await Review.find({
    $or: [
      { 'user.id': auth0Id },
      { 'vendor.id': auth0Id }
    ]
  }).sort({ time: -1 });

  res.json(reviews);
});

// GET /:id - get a single review
ReviewController.get('/:id', verifyReviewAccess, async (req, res) => {
  res.json(req.review);
});

// POST /create - post a new review
ReviewController.post('/create', async (req, res) => {
  const { user, vendor, text, rating } = req.body;

  if (!user || !vendor || !text || rating == null) {
    return res.status(400).send('Missing required fields');
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).send('Rating must be a number between 1 and 5');
  }

  const review = await Review.create({
    user,
    vendor,
    text,
    rating,
    time: new Date()
  });
  await review.save();
  
  //just to make sure 
  const returnReview = await Review.findById(review._id)
  .populate('user', 'name')   //returning only user and vendor name, may change
  .populate('vendor', 'name');

  res.status(201).json(review);
});

export default ReviewController;
