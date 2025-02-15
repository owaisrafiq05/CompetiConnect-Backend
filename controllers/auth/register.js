// register.js
import joi from 'joi';
import bcrypt from 'bcrypt';
import User from '../../models/User.js';
import { signToken } from '../../middlewares/jsonwebtoken.js';

const registerSchema = joi.object({
  info: joi.object({
    email: joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    name: joi.string()
      .required()
      .messages({
        'any.required': 'Name is required'
      }),
    language: joi.string()
      .default('ENGLISH')
  }).required(),
  password: joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  role: joi.string()
    .valid('user', 'admin')
    .default('user'),
  profile: joi.object({
    profilePictureURL: joi.string()
      .required()
      .messages({
        'any.required': 'Profile picture URL is required'
      })
  }).required(),
  subscription: joi.string()
    .valid('free', 'premium', 'enterprise')
    .default('free'),
  apiKeys: joi.object({
    chatGPT: joi.string().allow('').default(''),
    gemini: joi.string().allow('').default('')
  }).default({ chatGPT: '', gemini: '' })
});

async function register(request, response) {
  try {
    // Validate request body
    const validatedData = await registerSchema.validateAsync(request.body, { abortEarly: false });
    
    // Check if user already exists
    const existingUser = await User.findOne({ 'info.email': validatedData.info.email.toLowerCase() });
    if (existingUser) {
      return response.status(400).json({
        error: 'DuplicateEmail',
        message: 'An account already exists with this email address'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Create new user
    const newUser = new User({
      info: {
        email: validatedData.info.email.toLowerCase(),
        name: validatedData.info.name,
        language: validatedData.info.language
      },
      password: hashedPassword,
      role: validatedData.role,
      profile: {
        profilePictureURL: validatedData.profile.profilePictureURL
      },
      subscription: validatedData.subscription,
      apiKeys: validatedData.apiKeys
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = signToken({ 
      uid: newUser._id, 
      role: newUser.role 
    });

    // Prepare response (excluding password)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return response.status(201).json({
      message: 'Registration successful',
      data: userResponse,
      token
    });

  } catch (error) {
    // Handle validation errors
    if (error.isJoi) {
      return response.status(400).json({
        error: 'ValidationError',
        message: error.details.map(detail => detail.message)
      });
    }

    // Log unexpected errors
    console.error('Registration error:', error);
    
    // Handle other errors
    return response.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred during registration',
      details: error.message
    });
  }
}

export default register;