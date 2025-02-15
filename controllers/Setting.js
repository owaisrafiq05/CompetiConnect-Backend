import User from '../models/User.js'; // Adjust path based on your project structure
import { v2 as cloudinary } from 'cloudinary'; // Ensure you configured Cloudinary properly
import bcrypt from 'bcrypt';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProfilePicture = async (req, res) => {
  const { userID } = req.body;

  try {
    // Validate userID
    if (!userID) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user-profile-pictures', // Optional: Cloudinary folder
    });

    // Update user's profilePictureURL in the database
    user.profile.profilePictureURL = result.secure_url;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePictureURL: user.profile.profilePictureURL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload profile picture', error });
  }
};


export const updateUserNameAndLanguage = async (req, res) => {
  const { userID, name, language } = req.body;

  try {
    // Validate userID
    if (!userID) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate the fields
    if (!name || !language) {
      return res.status(400).json({ message: 'Name and language are required' });
    }

    // Update name and language
    user.info.name = name;
    user.info.language = language;
    await user.save();

    res.status(200).json({
      message: 'User name and language updated successfully',
      user: {
        name: user.info.name,
        language: user.info.language,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user details', error });
  }
};

export const updatePassword = async (req, res) => {
  const { userID, currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!userID || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'User ID, current password, and new password are required' });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update password', error });
  }
};

export const updateSubscriptionType = async (req, res) => {
  const { userID, subscriptionType } = req.body;

  try {
    // Validate input
    if (!userID || !subscriptionType) {
      return res.status(400).json({ message: 'User ID and subscription type are required' });
    }

    // Validate subscription type
    const validSubscriptionTypes = ['free', 'premium', 'enterprise'];
    if (!validSubscriptionTypes.includes(subscriptionType.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid subscription type' });
    }

    // Find the user
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the subscription type
    user.subscription = subscriptionType.toLowerCase();
    await user.save();

    res.status(200).json({
      message: 'Subscription type updated successfully',
      subscriptionType: user.subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update subscription type', error });
  }
};

export const updateAPIKeys = async (req, res) => {
  const { userID, chatGPT, gemini } = req.body;

  try {
    // Validate input
    if (!userID) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!chatGPT && !gemini) {
      return res.status(400).json({ message: 'At least one API key (ChatGPT or Gemini) must be provided' });
    }

    // Find the user
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update API keys
    if (chatGPT) {
      user.apiKeys.chatGPT = chatGPT;
    }

    if (gemini) {
      user.apiKeys.gemini = gemini;
    }

    await user.save();

    res.status(200).json({
      message: 'API keys updated successfully',
      apiKeys: {
        chatGPT: user.apiKeys.chatGPT,
        gemini: user.apiKeys.gemini,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update API keys', error });
  }
};

