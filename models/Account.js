import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false  // Won't be returned in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Role and Status
  role: {
    type: String,
    enum: ['user', 'admin', 'recruiter'],  // Add any other roles you need
    default: 'user',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Profile Info
  profilePicture: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Account Recovery
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Last Login
  lastLogin: {
    type: Date,
    default: null
  }
});

// Update the updatedAt timestamp before saving
accountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add any useful instance methods
accountSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

// Add any useful static methods
accountSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Create indexes
accountSchema.index({ email: 1 });
accountSchema.index({ role: 1 });

const Account = mongoose.model('Account', accountSchema);

export default Account;