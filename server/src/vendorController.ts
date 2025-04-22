import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Vendor from './models/vendor';
import User from './models/user';
import Review, { reviewSchema } from './models/review';

const VendorController: Router = Router({ mergeParams: true });

// GET / - list all visible vendors
VendorController.get('/', async (req, res) => {
  const vendors = await Vendor.find({ hidden: false })
    //.populate({ path: 'user', select: '-_id name'})
    .select('user.name name photos description tags reviews hidden');
  res.json(vendors);
});

// GET /:id - get a vendor by ID 
VendorController.get('/:id', async (req, res) => { 
  const vendor = await Vendor.findById(req.params.id);

  if (vendor == null) return
  res.json({
    name: vendor.name,
    photos: vendor.photos,
    description: vendor.description,
    tags: vendor.tags,
    reviews: vendor.reviews
  });
});

// GET /suggestions/:query/:type - list all visible vendors based on query and type (all/name/tags categories)
VendorController.get('/suggestions/:query/:type', async (req, res) => {
  const query = req.params.query.trim()
  const type = req.params.type

  if (!query || !type || typeof (query) != 'string' || typeof (type) != 'string') {
    res.status(400).json('Query and type are required and must be a string.')
  }

  try {
    let results = new Set()
    if (type == 'name' || type == 'all') {
      const nameResults = await Vendor.find({ name: { $regex: query, $options: 'i' }, hidden: false }).select('name')
      nameResults.forEach(result => results.add(result.name))
    }
    if (type == 'tags' || type == 'all') {
      const lastTag = query.split(" ").pop() || ""
      const tagResults = await Vendor.find({ tags: { $elemMatch: { $regex: lastTag, $options: 'i' } }, hidden: false }).select('tags')
      tagResults.forEach(result => {
        result.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lastTag.toLowerCase())) {
            results.add(tag)
          }
        }
        )
      })
    }
    res.json(Array.from(results))
  }
  catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /results/:query - list all visible vendors based on query
VendorController.get('/results/:query', async (req, res) => {
  const query = req.params.query.trim()
  if (typeof (query) != 'string') {
    res.status(400).json('Query is required and must be a string')
  }

  try {
    const parts = query.split(' ').filter(Boolean)
    const tagFilter = parts.map(word => ({ tags: { $regex: word, $options: 'i' } }))
    const vendors = await Vendor.find({
      hidden: false,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { $and: tagFilter }
      ]
    }).select('name tags description')
    if (vendors == null) {
      res.json(null)
    }
    res.json(vendors)
  }
  catch (error) {
    res.status(500).json('Server Error')
  }
})

VendorController.use(requireAuth);

// GET /all - list all vendors (admin)
VendorController.get('/:id/all', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  //find user object
  const userObj = await User.findOne({ auth0Id });

  if (!userObj || !userObj.isAdmin) {
    res.status(403).json("Forbidden");
    return;
  }
  const vendors = await Vendor.find()
    .populate({ path: 'user', select: '-_id name' })
    .select('user name photos description tags reviews hidden');
  res.json(vendors);
});

// POST /create - create a new vendor
//TODO: restrict to only one per user
VendorController.post('/create', requireAuth, async (req, res) => {
  //make sure they have an account
  const auth0Id = req.auth?.payload.sub;
  const userObj = await User.findOne({ auth0Id });
  if (!userObj) {
    res.status(401).json("Must be logged in to open a storefront.");
    return;
  }
  else if (userObj.vendorId != null) {
    res.status(200).json("This user already has a vendor page")
    return
  }
  const { name, photos, description, tags } = req.body;

  if (!name) {
    res.status(400).json('Name is required.');
    return;
  }

  const vendor = await Vendor.create({
    user: userObj,
    name,
    photos: photos || [],
    description: description || '',
    tags: tags || [],
    reviews: [reviewSchema],
    hidden: false,
  });
  await vendor.save();

  // Update User table w/ vendor ID
  await User.updateOne({ _id: userObj._id }, { vendorId: vendor._id });

  const returnVendor = await Vendor.findById(vendor._id);
  res.status(201).json(returnVendor);
});

//GET /:id/reviews - get all reviews for a vendor
VendorController.patch('/:id/reviews', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    res.status(404).json("Vendor not found.");
    return;
  }
  const reviews = await Review.find({ vendor: vendor._id })
    .sort({ time: -1 })
    .populate(['user', 'vendor'])
    .select('user.name vendor.name text rating time');
})

// PATCH /:id - update vendor details TODO: for all patch/:id, more input checking 
// PATCH /:id/name - update vendor name
VendorController.patch('/:id/name', requireAuth, async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const inputId = req.params.id;

  //get requesting user
  const userObj = await User.findOne({ auth0Id });
  const requestingUserId = userObj?._id;

  //find vendor to be updated 
  const vendorObj = await Vendor.findOne({ _id: inputId });
  const vendorUserId = vendorObj?.user;

  //confirm user is either admin or the vendor themselves
  if (userObj == null || (userObj.isAdmin = false && vendorUserId != requestingUserId)) { //allowing admin to change name as well
    res.status(403).json("Forbidden");
    return;
  }

  const id = req.params;
  const name = req.body.name;
  if (typeof name != 'string') {
    res.status(400).json("Name must be a string.");
  }
  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedVendor) {
    res.status(404).json("Vendor not found.");
    return;
  }
  res.status(200).json("Successfully updated name.");
})

// TODO: for photos, create separate add and deletes by index
VendorController.patch('/:id/photos/add', requireAuth, async (req, res) => {
  // coming soon i promise
  res.status(200).json("Successfully added image");
})
VendorController.patch('/:id/photos/delete', requireAuth, async (req, res) => {
  // 
  res.status(200).json("Successfully deleted image");
})

// PATCH /:id/description - update vendor description
VendorController.patch('/:id/description', requireAuth, async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const inputId = req.params.id;

  //get requesting user
  const userObj = await User.findOne({ auth0Id });
  const requestingUserId = userObj?._id;

  //find vendor to be updated 
  const vendorObj = await Vendor.findOne({ inputId });
  const vendorUserId = vendorObj?.user;

  //confirm user is either admin or the vendor themselves
  if (userObj == null || (userObj.isAdmin = false && vendorUserId != requestingUserId)) { //allowing admin to change name as well
    res.status(403).json("Forbidden");
    return;
  }
  const id = req.params.id;
  const description = req.body.description;
  if (typeof description !== 'string') {
    res.status(400).json("Description must be a string.");
  }
  const updatedVendor = await Vendor.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedVendor) {
    res.status(404).json("Vendor not found.");
    return;
  }
  res.status(200).json("Successfully updated description."); //success, no other returns
})

//TODO: tags array
VendorController.patch('/:id/tags/add', requireAuth, async (req, res) => {
  //input: index?
  const auth0Id = req.auth?.payload.sub;
  const inputId = req.params.id;

  //get requesting user
  const userObj = await User.findOne({ auth0Id });
  const requestingUserId = userObj?._id;

  //find vendor to be updated 
  const vendorObj = await Vendor.findOne({ inputId });
  const vendorUserId = vendorObj?.user;

  //confirm user is either admin or the vendor themselves
  if (userObj == null || (userObj.isAdmin = false && vendorUserId != requestingUserId)) { //allowing admin to change name as well
    res.status(403).json("Forbidden");
    return;
  }

  const tags = req.body.tags;
  tags.forEach((tag: any) => {
    if (typeof tag !== 'string') {
      res.status(400).json("Tags must be a string.")
    }
  })

  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedVendor) {
    res.status(404).json("Vendor not found.");
    return;
  }
  res.status(200).json("Successfully added tag.");
})


VendorController.patch('/:id/tags/delete', requireAuth, async (req, res) => {
  //
  res.status(200).json("Successfully deleted tag.");
})

// PATCH /:id/hide - toggle hidden status
VendorController.patch('/:id/hide', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    res.status(404).json('Vendor not found');
    return;
  }

  vendor.hidden = !vendor.hidden;
  await vendor.save();
  res.status(200).json("Successfully toggled vendor's hidden status");
});
//TODO: try/catches everywhere, add more functionality as we progress

export default VendorController;