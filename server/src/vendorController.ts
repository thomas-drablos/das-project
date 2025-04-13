import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Vendor from './models/vendor';

const VendorController: Router = Router({ mergeParams: true });

VendorController.use(requireAuth);

// GET / - list all visible vendors
VendorController.get('/', async (req, res) => {
  const vendors = await Vendor.find({ hidden: false });
  res.json(vendors);
});

// GET /all - list all vendors (admin)
VendorController.get('/all', async (req, res) => {
  const isAdmin = req.auth?.payload?.['https://yourdomain.com/roles']?.includes('admin'); // or use your auth logic
  if (!isAdmin) return res.status(403).send('Forbidden');
  const vendors = await Vendor.find();
  res.json(vendors);
});

// GET /:id - get a vendor by ID
VendorController.get('/:id', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor || vendor.hidden) return res.status(404).send('Vendor not found');
  res.json(vendor);
});

// POST /create - create a new vendor
VendorController.post('/create', async (req, res) => {
  const { name, photos, description, tags } = req.body;

  if (!name) return res.status(400).send('Name is required');

  const vendor = await Vendor.create({
    name,
    photos: photos || [],
    description: description || '',
    tags: tags || [],
    hidden: false,
    reviews: []
  });

  res.status(201).json(vendor);
});

// PATCH /:id/hide - toggle hidden status
VendorController.patch('/:id/hide', async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return res.status(404).send('Vendor not found');

  vendor.hidden = !vendor.hidden;
  await vendor.save();
  res.json({ id: vendor._id, hidden: vendor.hidden });
});

export default VendorController;