import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Vendor from './models/vendor';
import User from './models/user';
import Review from './models/review';

const VendorController: Router = Router({ mergeParams: true });

VendorController.use(requireAuth);

// GET / - list all visible vendors
VendorController.get('/', async (req, res) => {
  const vendors = await Vendor.find({ hidden: false });
  res.json(vendors);
});

// GET /all - list all vendors (admin)
VendorController.get('/all', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  //find user object
  const userObj = await User.findOne({ auth0Id });

  if(!userObj || !userObj.isAdmin){
    res.status(403).send("Forbidden");
    return;
  }
  const vendors = await Vendor.find();
  res.json(vendors);
});

// GET /:id - get a vendor by ID
VendorController.get('/:id', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  const auth0Id = req.auth?.payload.sub;

  //find user
  const userObj = await User.findOne({ auth0Id });
  var isAdmin;
  if(!userObj){ //not logged in, can still access but obv has no admin privileges
    isAdmin = false;
  } else {
    isAdmin = userObj.isAdmin;
  }

  if (!vendor || (vendor.hidden && !isAdmin)){ 
    res.status(404).send('Vendor not found.');
    return;
  } 
  res.json({
    name: vendor.name,
    photos: vendor.photos,
    description: vendor.description,
    tags: vendor.tags,
    reviews: vendor.reviews
  });
});

// POST /create - create a new vendor
VendorController.post('/create', async (req, res) => {
  //make sure they have an account (prob overkill but whatever)
  const auth0Id = req.auth?.payload.sub;
  const userObj = await User.findOne({ auth0Id });
  if(!userObj){
    res.status(401).send("Must be logged in to open a storefront.");
    return;
  }
  const { name, photos, description, tags } = req.body;

  if (!name) {
    res.status(400).send('Name is required.');
    return;
  }

  const vendor = await Vendor.create({
    user: userObj,
    name,
    photos: photos || [],
    description: description || '',
    tags: tags || [],
    reviews: [],
    hidden: false,
  });
  await vendor.save();

  const returnVendor = await Vendor.findById(vendor._id);
  res.status(201).json(returnVendor);
});

// PATCH /:id/hide - toggle hidden status
VendorController.patch('/:id/hide', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor){ 
    res.status(404).send('Vendor not found');
    return;
  }

  vendor.hidden = !vendor.hidden;
  await vendor.save();
  res.json({ id: vendor._id, hidden: vendor.hidden });
});

//GET /:id/reviews - get all reviews for a vendor
VendorController.patch('/:id/reviews', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor){
    res.status(404).send("Vendor not found.");
    return;
  }
  const reviews = await Review.find({ vendor: vendor._id })
  .sort({time: -1})
  .populate(['user', 'vendor'])
  .select('user.name vendor.name text rating time');
})

// PATCH /:id - update vendor details
VendorController.patch('/:id', async (req, res) => {
  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if(!updatedVendor){
    res.status(404).send("Vendor not found.");
    return;
  }
  res.json(updatedVendor);
})

//TODO: try/catches everywhere, add more functionality as we progress
//DELETE /:id - delete a vendor  (should we have this?)

export default VendorController;