import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    compOwnerUserId: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    compName: { 
      type: String,
      required: true,
    },
    compDescription: { 
      type: String,
      required: true,
    },
    compType: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'CompType',
    },
    isPrivate: { 
      type: Boolean,
      required: true,
    },
    passCode: { 
      type: String,
      default: null,
    },
    compRuleBook: { 
      type: String,
      required: true,
    },
    problemStatement: { 
      type: String,
      required: true,
    },
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    compSubmissionObjId: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompSubmission',
    }],
    totalPoints: { 
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const modelName = 'Competition';

export default mongoose.model(modelName, instance);
