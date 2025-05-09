import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Vendor from './models/vendor';
import User from './models/user';
import Review, { reviewSchema } from './models/review';
import EventLog from './models/eventLog';

const VendorController: Router = Router({ mergeParams: true });

// GET / - list all visible vendors
VendorController.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ hidden: false })
      .populate({ path: 'user', select: '-_id name' })
      .select('user name photos description tags reviews hidden');

    res.json(vendors); //only selected fields
  } catch (err) {
    console.log(`Failed to fetch vendors: ${err}`);
    console.error(err);
    res.status(500).json("Internal server error");
  }
});

// GET /:id - get a vendor by ID 
VendorController.get('/:id', async (req, res) => {
  try{
    const vendor = await Vendor.findById(req.params.id);

    if (vendor == null || vendor.hidden) return;

    res.json({
      name: vendor.name,
      photos: vendor.photos,
      description: vendor.description,
      tags: vendor.tags,
      reviews: vendor.reviews,
    hidden: vendor.hidden
    });
  } catch (err){
    console.log(`Failed to fetch vendor: ${err}`);
    console.log(err);
    res.status(500).json("Internal server error");
  }
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
  catch (err) {
    console.log(`Failed to fetch vendors: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
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
  catch (err) {
    console.log(`Failed to fetch vendors: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

VendorController.use(requireAuth);

// GET /all - list all vendors (admin)
VendorController.get('/:id/all', async (req, res) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    //find user object
    const userObj = await User.findOne({ auth0Id });

    if (!userObj || !userObj.isAdmin) {
      res.status(403).json("Forbidden");
      return;
    }
    const vendors = await Vendor.find()
      .populate({ path: 'user', select: '-_id name' }) //ensures db id is secure
      .select('user name photos description tags reviews hidden');
    res.json(vendors); //only selected fields
  } catch (err) {
    console.log(`Failed to fetch vendors: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /create - create a new vendor
VendorController.post('/create', requireAuth, async (req, res) => {
  try {
    //make sure they have a user account + are logged in
    const auth0Id = req.auth?.payload.sub;
    const userObj = await User.findOne({ auth0Id });
    if (!userObj) {
      res.status(401).json("Must be logged in to open a storefront.");
      return;
    }
    const { name, photos, description, tags } = req.body;

    //make sure they do not already have a vendor account
    const vendorObj = await Vendor.findOne({ user: userObj })
    if (vendorObj) {
      res.status(403).json('User already has a vendor page.');
      return;
    }

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

    const returnVendor = await Vendor.findById(vendor._id)
      .populate({ path: 'user', select: '-_id name' })
      .select('user name photos description tags reviews hidden');
    res.status(201).json(returnVendor);
  } catch (err) {
    console.log(`Failed to create vendor: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//GET /:id/reviews - get all reviews for a vendor
VendorController.patch('/:id/reviews', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404).json("Vendor not found.");
      return;
    }
    const reviews = await Review.find({ vendor: vendor._id })
      .sort({ time: -1 })
      .populate([{ path: 'user', select: '_id name' }, { path: 'vendor', select: 'name' }])
      .select('user vendor text rating time');
    res.json(reviews); //only selected fields
  } catch (err) {
    console.log(`Faield to fetch reviews: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// PATCH /:id - update vendor details
// PATCH /:id/name - update vendor name
VendorController.patch('/:id/name', requireAuth, async (req, res) => {
  try {
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
    const name = req.body.name;
    if (typeof name !== 'string') {
      res.status(400).json("Name must be a string.");
      return;
    }
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    await EventLog.create({
      event: 'Vendor changed name',
      activeUser: userObj._id,
      oldValue: vendorObj?.name,
      newName: name,
    });

    if (!updatedVendor) {
      res.status(404).json("Vendor not found.");
      return;
    }
    res.status(200).json("Successfully updated name.");
  } catch (err) {
    console.log(`Failed to update name: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// PATCH /:id/photos/add - add inputted photo
VendorController.patch('/:id/photos/add', requireAuth, async (req, res) => {
  try {
    //get photo url and id
    const url = req.body.photos;
    const id = req.params.id;

    //input validation - appropriate length, type, etc.
    if (!url) {
      res.status(400).json("Invalid image URL.");
      return
    }
    url.forEach((photo: any) => {
      if (typeof photo !== 'string' || !photo.startsWith('https://')) {
        res.status(400).json("Invalid image URL.")
        return
      }
    })

    //get vendor
    const vendorObj = await Vendor.findById(id)
      .populate({ path: 'user', select: '-_id name auth0Id' });
    if (!vendorObj) {
      res.status(404).json("Failed to fetch vendor");
      return;
    }

    //check permissions
    const auth0Id = req.auth?.payload.sub;
    if (vendorObj.user.auth0Id !== auth0Id && !vendorObj.user.isAdmin) {
      res.status(403).json("Forbidden");
      return;
    }

    //append to array
    var length = vendorObj.photos = url
    await vendorObj.save();

    res.status(200).json("Successfully added image");
  } catch (err) {
    console.log(`Failed to add image: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// PATCH /:id/photos/delete - delete photo at an index
VendorController.patch('/:id/photos/delete', requireAuth, async (req, res) => {
  try {
    // get photo index
    const index = req.body.index;
    const id = req.params.id;

    //input validation
    if (
      index == undefined ||
      typeof index !== 'number'
    ) {
      res.status(400).json("Invalid image index.");
      return;
    }

    //get vendor
    const vendorObj = await Vendor.findById(id)
      .populate({ path: 'user', select: '-_id name auth0Id' });
    if (!vendorObj) {
      res.status(404).json("Failed to fetch vendor");
      return;
    }

    //check permissions
    const auth0Id = req.auth?.payload.sub;
    if (vendorObj.user.auth0Id !== auth0Id && !vendorObj.user.isAdmin) {
      res.status(403).json("Forbidden");
      return;
    }

    //delete from array
    const oldPhoto = vendorObj.photos[index];
    if (index == 0) {
      vendorObj.photos[index] = 'https://'
    }
    else {
      vendorObj.photos.splice(index, 1);
    }
    await vendorObj.save();

    await EventLog.create({
      event: 'Removed image from vendor',
      oldValue: oldPhoto,
    });

    res.status(200).json("Successfully deleted image");
  } catch (err) {
    console.log(`Failed to delete image: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// PATCH /:id/description - update vendor description
VendorController.patch('/:id/description', requireAuth, async (req, res) => {
  try{
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
    const oldVendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: { description } },
      { new: false, runValidators: true }
    );

    if (!oldVendor) {
      res.status(404).json("Vendor not found.");
      return;
    }

    await EventLog.create({
      event: 'Changed vendor description',
      activeUser: userObj._id,
      vendorRef: oldVendor._id,
      oldValue: oldVendor.description,
      newValue: description,
    });

    res.status(200).json("Successfully updated description."); //success, no other returns
  } catch (err) {
    console.log(`Failed to update description: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// PATCH /:id/tags/add - adds inputted tag to array
VendorController.patch('/:id/tags/add', requireAuth, async (req, res) => {

  try {
    const tags = req.body.tags;
    const id = req.params.id;

    //get vendor
    const vendorObj = await Vendor.findById(id)
      .populate({ path: 'user', select: '-_id name auth0Id' });
    if (!vendorObj) {
      res.status(404).json("Failed to fetch vendor");
      return;
    }

    //check for permission
    const auth0Id = req.auth?.payload.sub;
    if (vendorObj.user.auth0Id != auth0Id && !vendorObj.user.isAdmin) {
      res.status(403).json("Forbidden");
      return;
    }

    // check if tags are valid typing
    tags.forEach((tag: any) => {
      if (typeof tag !== 'string') {
        res.status(400).json("Tags must be a string.")
      }
    })

    // update tags in vendor
    await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json("Successfully added tag.");
  } catch (err) {
    console.log(`Failed to add tag: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// PATCH /:id/tags/delete - remove tag at index
VendorController.patch('/:id/tags/delete', requireAuth, async (req, res) => {
  try {
    //store tag index
    const index = req.body;
    const id = req.params.id;

    //input validation
    if (
      !index ||
      typeof index !== 'number'
    ) {
      res.status(400).json("Invalid tag index.");
      return;
    }

    //get vendor
    const vendorObj = await Vendor.findById(id)
      .populate({ path: 'user', select: '-_id name auth0Id' });
    if (!vendorObj) {
      res.status(404).json("Failed to fetch vendor");
      return;
    }

    //check for permission
    const auth0Id = req.auth?.payload.sub;
    if (vendorObj.user.auth0Id !== auth0Id && !vendorObj.user.isAdmin) {
      res.status(403).json("Forbidden");
      return;
    }

    //delete at index
    vendorObj.tags.splice(index, 1);
    await vendorObj.save();

    res.status(200).json("Successfully deleted tag.");
  } catch (err) {
    console.log(`Failed to add tag: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// PATCH /:id/hide - toggle hidden status
VendorController.patch('/:id/hide', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404).json('Vendor not found');
      return;
    }

    vendor.hidden = !vendor.hidden;
    await vendor.save();

    res.status(200).json("Successfully toggled vendor's hidden status");
  } catch (err) {
    console.log(`Failed to toggle hidden status: ${err}`);
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default VendorController;