import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Competition',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure unique registration combinations
instance.index({ competitionId: 1, userId: 1 }, { unique: true });

const modelName = 'Register';

export default mongoose.model(modelName, instance);
