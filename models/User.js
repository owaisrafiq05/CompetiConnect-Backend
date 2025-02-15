// User.js
import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    username: { 
      type: String,
      required: true,
      unique: true,
    },
    password: { 
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    myJoinComp: {
      type: [String],
      default: [],
    },
    myCreatedComp: { 
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const modelName = 'User';

export default mongoose.model(modelName, instance);