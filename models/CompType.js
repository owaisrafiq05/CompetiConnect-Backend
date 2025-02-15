import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    compTypeId: { 
      type: String,
      required: true,
      unique: true,
    },
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
