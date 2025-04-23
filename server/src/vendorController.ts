import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Vendor from './models/vendor';
import User from './models/user';
import Review, { reviewSchema } from './models/review';

const VendorController: Router = Router({ mergeParams: true });

// GET / - list all visible vendors
VendorController.get('/', async (req, res) => {
  try{
    const vendors = await Vendor.find({ hidden: false })
    .populate({ path: 'user', select: '-_id name'})
    .select('user name photos description tags reviews hidden');
  
    res.json(vendors); //only selected fields
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to fetch vendors");
  }
});

VendorController.use(requireAuth);

// GET /:id - get a vendor by ID 
VendorController.get('/:id', async (req, res) => { 
  try{
    const vendor = await Vendor.findById(req.params.id);
    const auth0Id = req.auth?.payload.sub;

    if(!vendor){
      res.status(404).json('Vendor not found.');
      return;
    }

    //check auth0Id, user doesn't need to be logged in most cases
      if(!auth0Id){ //not logged in, only access visible vendors
        if(vendor.hidden){
          res.status(403).json('Forbidden');
          return;
        }
        //return visible vendor
        res.json({
          name: vendor.name,
          photos: vendor.photos,
          description: vendor.description,
          tags: vendor.tags,
          reviews: vendor.reviews
        });

      } else { //if logged in 
        const userObj = await User.findOne({ auth0Id });
        if(!userObj){
          res.status(404).json("I hope you never see this one");
          return;
        }
        if(vendor.hidden){
          if(userObj.isAdmin){
            //show hidden vendor
            res.json({
              name: vendor.name,
              photos: vendor.photos,
              description: vendor.description,
              tags: vendor.tags,
              reviews: vendor.reviews
            });

          } else {
            res.status(403).json("Forbidden");
            return;
          }
        } else { //vendor is not hidden
          res.json({
            name: vendor.name,
            photos: vendor.photos,
            description: vendor.description,
            tags: vendor.tags,
            reviews: vendor.reviews
          });
        }
      }
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to fetch vendor");
  }
});

// GET /all - list all vendors (admin)
VendorController.get('/all', async (req, res) => {
  try{
    const auth0Id = req.auth?.payload.sub;
    //find user object
    const userObj = await User.findOne({ auth0Id });

    if(!userObj || !userObj.isAdmin){
      res.status(403).json("Forbidden");
      return;
    }
    const vendors = await Vendor.find()
    .populate({ path: 'user', select: '-_id name'}) //ensures db id is secure
    .select('user name photos description tags reviews hidden');
    res.json(vendors); //only selected fields
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to fetch vendors");
  }
});

// POST /create - create a new vendor
VendorController.post('/create', requireAuth, async (req, res) => {
  try{
    //make sure they have a user account + are logged in
    const auth0Id = req.auth?.payload.sub;
    const userObj = await User.findOne({ auth0Id });
    if(!userObj){
      res.status(401).json("Must be logged in to open a storefront.");
      return;
    }
    const { name, photos, description, tags } = req.body;

    //make sure they do not already have a vendor account
    const vendorObj = await Vendor.findOne({ user: userObj })
    if(vendorObj){
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

    //add to user 
    userObj.vendorId = String(vendor._id);
    await userObj.save();

    const returnVendor = await Vendor.findById(vendor._id)
    .populate({ path: 'user', select: '-_id name'})
    .select('user name photos description tags reviews hidden');
    res.status(201).json(returnVendor);
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to create vendor");
  }
});

//GET /:id/reviews - get all reviews for a vendor
VendorController.patch('/:id/reviews', async (req, res) => {
  try{
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor){
      res.status(404).json("Vendor not found.");
      return;
    }
    const reviews = await Review.find({ vendor: vendor._id })
    .sort({time: -1})
    .populate([{ path: 'user', select: '-_id name'}, { path: 'vendor', select: 'name'}])
    .select('user vendor text rating time');
    res.json(reviews); //only selected fields
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to fetch reviews");
  }
})

// PATCH /:id - update vendor details TODO: for all patch/:id, more input checking 
// PATCH /:id/name - update vendor name
VendorController.patch('/:id/name', requireAuth, async (req, res) => { 
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
    if(!userObj || (!userObj.isAdmin && vendorUserId !== requestingUserId)){ //allowing admin to change name as well
      res.status(403).json("Forbidden");
      return;
    }
    
    const id = req.params.id;
    const name = req.body;
    if (typeof name !== 'string') {
      res.status(400).json("Name must be a string.");
      return;
    }  
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    if(!updatedVendor){
      res.status(404).json("Vendor not found.");
      return;
    }
    res.status(200).json("Successfully updated name.");
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to change vendor name");
  }
})

// PATCH /:id/photos/add - add inputted photo
VendorController.patch('/:id/photos/add', requireAuth, async (req, res) => {
  try {
    //get photo url and id
    const url = req.body;
    const id = req.params.id;

    //input validation - appropriate length, type, etc.
    if (
      !url ||
      typeof url !== 'string' ||  
      !(url.startsWith('https://'))
    ) {
      res.status(400).json("Invalid image URL.");
      return
    }

    //get vendor
    const vendorObj = await Vendor.findById(id)
    .populate({ path: 'user', select: '-_id name auth0Id'});
    if(!vendorObj){
      res.status(404).json("Failed to fetch vendor");
      return;
    }

    //check permissions
    const auth0Id = req.auth?.payload.sub;
    if(vendorObj.user.auth0Id !== auth0Id && !vendorObj.user.isAdmin){
      res.status(403).json("Forbidden");
      return;
    }

    //append to array
    var length = vendorObj.photos.push(url);
    await vendorObj.save();

    res.status(200).json("Successfully added image");
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to add image");
  }
})

// PATCH /:id/photos/delete - delete photo at an index
VendorController.patch('/:id/photos/delete', requireAuth, async (req, res) => {
  try {
    // get photo index
    const index = req.body;
    const id = req.params.id;

    //input validation
    if (
      !index ||
      typeof index !== 'number'
    ) {
      res.status(400).json("Invalid image index.");
      return;
    }

    //get vendor
    const vendorObj = await Vendor.findById(id)
    .populate({ path: 'user', select: '-_id name auth0Id'});
    if(!vendorObj){
      res.status(404).json("Failed to fetch vendor");
      return;
    }

    //check permissions
    const auth0Id = req.auth?.payload.sub;
    if(vendorObj.user.auth0Id !== auth0Id && !vendorObj.user.isAdmin){
      res.status(403).json("Forbidden");
      return;
    }

    //delete from array
    vendorObj.photos.splice(index, 1);
    await vendorObj.save();

    res.status(200).json("Successfully deleted image");
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to delete image");
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
    if(!userObj || (!userObj.isAdmin && vendorUserId !== requestingUserId)){ //allowing admin to change name as well
      res.status(403).json("Forbidden");
      return;
    }
    const id = req.params;
    const description = req.body;
    if (typeof description !== 'string') {
      res.status(400).json("Description must be a string.");
    }
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { description },
      { new: true, runValidators: true }
    );

    if(!updatedVendor){
      res.status(404).json("Vendor not found.");
      return;
    }
    res.status(200).json("Successfully updated vendor's description."); //success, no other returns
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to update vendor's description");
  }
})

// PATCH /:id/tags/add - adds inputted tag to array
VendorController.patch('/:id/tags/add', requireAuth, async(req, res) => {
  try{
    //store tag string
    const tag = req.body;
    const id = req.params.id;

    //input validation
    if (
      !tag ||
      typeof tag !== 'string'
    ) {
      res.status(400).json("Invalid tag.");
      return;
    }

    //get vendor
    const vendorObj = await Vendor.findById(id)
    .populate({ path: 'user', select: '-_id name auth0Id'});
    if(!vendorObj){
      res.status(404).json("Failed to fetch vendor");
      return;
    }
    //check for permission
    const auth0Id = req.auth?.payload.sub;
    if(vendorObj.user.auth0Id !== auth0Id && !vendorObj.user.isAdmin){
      res.status(403).json("Forbidden");
      return;
    }

    //append to tag string
    var length = vendorObj.tags.push(tag);
    await vendorObj.save();

    res.status(200).json("Successfully added tag.");
  } catch (err){ 
    console.error(err);
    res.status(500).json("Failed to add tag");
  }
})

// PATCH /:id/tags/delete - remove tag at index
VendorController.patch('/:id/tags/delete', requireAuth, async(req, res) => {
  try{
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
    .populate({ path: 'user', select: '-_id name auth0Id'});
    if(!vendorObj){
      res.status(404).json("Failed to fetch vendor");
      return;
    }

    //check for permission
    const auth0Id = req.auth?.payload.sub;
    if(vendorObj.user.auth0Id !== auth0Id && !vendorObj.user.isAdmin){
      res.status(403).json("Forbidden");
      return;
    }

    //delete at index
    vendorObj.tags.splice(index, 1);
    await vendorObj.save();

    res.status(200).json("Successfully deleted tag.");
  } catch (err){ 
    console.error(err);
    res.status(500).json("Failed to delete tag");
  }
})

// PATCH /:id/hide - toggle hidden status
VendorController.patch('/:id/hide', async (req, res) => {
  try{ 
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor){ 
      res.status(404).json('Vendor not found');
      return;
    }

    vendor.hidden = !vendor.hidden;
    await vendor.save();
    res.status(200).json("Successfully toggled vendor's hidden status");
  } catch (err){
    console.error(err);
    res.status(500).json("Failed to toggle vendor's hidden status");
  }
});

export default VendorController;