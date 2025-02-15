import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    compTypeName: { 
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const modelName = 'CompType';

export default mongoose.model(modelName, instance);
