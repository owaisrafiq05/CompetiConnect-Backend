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
      type: String,
      required: true,
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
    submissionRules: {
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
    announcements: [{
      type: String,
      required: false,
    }],
    
  },
  {
    timestamps: true,
  }
);

const modelName = 'Competition';

export default mongoose.model(modelName, instance);
