import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth';
import Invoice from './models/invoice';

const InvoiceController: Router = Router({ mergeParams: true });

InvoiceController.use(requireAuth);

// Middleware: verify user access to a specific invoice
const verifyInvoiceAccess = async (req: Request, res: Response, next: NextFunction) => {
  const invoiceId = req.params.id;
  const auth0Id = req.auth?.payload.sub;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return res.status(404).send('Invoice not found');

  if (invoice.user.id !== auth0Id && invoice.vendor.id !== auth0Id) {
    return res.status(403).send('Forbidden');
  }

  req.invoice = invoice;
  next();
};

// GET / - get all invoices for the logged-in user
InvoiceController.get('/', async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const invoices = await Invoice.find({
    $or: [
      { 'user.id': auth0Id },
      { 'vendor.id': auth0Id }
    ]
  });
  res.json(invoices);
});

// GET /:id - get a single invoice if user/vendor matches
InvoiceController.get('/:id', verifyInvoiceAccess, async (req, res) => {
  res.json(req.invoice);
});

// POST /create - create a new invoice
InvoiceController.post('/create', async (req, res) => {
  const { user, vendor, price, specs } = req.body;

  if (!user || !vendor || price == null || !specs) {
    return res.status(400).send('Missing required fields');
  }

  const invoice = await Invoice.create({
    user,
    vendor,
    time: new Date(),
    price,
    paid: false,
    specs
  });

  res.status(201).json(invoice);
});

// PATCH /:id/pay - mark invoice as paid
InvoiceController.patch('/:id/pay', verifyInvoiceAccess, async (req, res) => {
  if (!req.invoice.paid) {
    req.invoice.paid = true;
    await req.invoice.save();
  }
  res.json(req.invoice);
});

export default InvoiceController;