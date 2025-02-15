// User.js
import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    profile: {
      profilePictureURL: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user',
    },
    info: {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      name: {
        type: String,
        required: true,
      },
      language: {
        type: String,
        default: 'ENGLISH',
      },
    },

    password: {
      type: String,
      required: true,
    },

    subscription: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },

    apiKeys: {
      chatGPT: {
        type: String,
        default: '',
      },
      gemini: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

const modelName = 'User';

export default mongoose.model(modelName, instance);