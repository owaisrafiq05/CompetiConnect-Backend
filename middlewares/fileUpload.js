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

export default upload;
