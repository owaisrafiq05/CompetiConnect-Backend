// login.js
import joi from 'joi';
import bcrypt from 'bcrypt';
import User from '../../models/User.js';
import { signToken } from '../../middlewares/jsonwebtoken.js';

const loginSchema = joi.object({
  email: joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

async function login(request, response) {
  try {
    // Validate request body
    const validatedData = await loginSchema.validateAsync(request.body, { abortEarly: false });

    // Find user by email
    const user = await User.findOne({ 'info.email': validatedData.email.toLowerCase() });
    
    // Check if user exists and verify password
    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return response.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = signToken({ 
      uid: user._id, 
      role: user.role 
    });

    // Prepare response (excluding password)
    const userResponse = user.toObject();
    delete userResponse.password;

    return response.status(200).json({
      message: 'Login successful',
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
    console.error('Login error:', error);
    
    // Handle other errors
    return response.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred during login'
    });
  }
}

// Token login controller (renamed from loginWithToken)
async function refreshLogin(request, response) {
  try {
    const { uid } = request.auth;

    // Find user by ID and exclude password
    const user = await User.findById(uid).select('-password');
    
    if (!user) {
      return response.status(404).json({
        error: 'UserNotFound',
        message: 'User account not found'
      });
    }

    // Generate new token
    const token = signToken({ 
      uid: user._id, 
      role: user.role 
    });

    return response.status(200).json({
      message: 'Account fetched',
      data: user,
      token
    });
    
  } catch (error) {
    console.error('Token login error:', error);
    return response.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while fetching account'
    });
  }
}

async function getUserDetails(request, response) {
  try {
    const { uid } = request.params; // Extract `uid` from the request parameters

    // Find user by ID and exclude sensitive information like the password
    const user = await User.findById(uid).select('-password');
    
    if (!user) {
      return response.status(404).json({
        error: 'UserNotFound',
        message: 'User account not found',
      });
    }

    return response.status(200).json({
      message: 'User details fetched successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);

    return response.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while fetching user details',
    });
  }
}

export { login, refreshLogin , getUserDetails };