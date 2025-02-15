import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    compSubmissionId: { 
      type: String,
      required: true,
      unique: true,
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    zipFile: { 
      type: String,
      required: true,
    },
    points: { 
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const modelName = 'CompSubmission';

export default mongoose.model(modelName, instance);
