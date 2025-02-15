import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-profile-pictures', // Customize the folder name
    format: async () => 'png', // Save images as PNG
    public_id: (req, file) => `${file.originalname}-${Date.now()}`,
  },
});

const upload = multer({ storage });

const submissionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'competition-submissions',
    resource_type: 'raw', // This allows for non-image files
    format: async () => 'zip',
    public_id: (req, file) => `submission-${Date.now()}-${file.originalname}`,
  },
});

export const uploadSubmission = multer({ 
  storage: submissionStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only zip files are allowed!'), false);
    }
  }
});

const paymentSlipStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'payment-slips',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => `payment-${Date.now()}-${file.originalname}`,
  },
});

export const uploadPaymentSlip = multer({ 
  storage: paymentSlipStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export default upload;
