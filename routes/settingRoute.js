import express from 'express';
import upload from '../middlewares/fileUpload.js'; // Multer upload middleware
import { uploadProfilePicture, updateUserNameAndLanguage, updatePassword, updateSubscriptionType, updateAPIKeys } from '../controllers/Setting.js';

const router = express.Router();

// Route for uploading profile picture
router.put('/profile-picture', upload.single('profilePicture'), uploadProfilePicture);
router.put('/update-user',updateUserNameAndLanguage);
router.put('/update-pass',updatePassword);
router.put('/update-subs',updateSubscriptionType);
router.put('/update-api-keys',updateAPIKeys);


export default router;
