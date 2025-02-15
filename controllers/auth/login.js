import joi from 'joi';
import bcrypt from 'bcrypt';
import User from '../../models/User.js';
import UserModel from '../../models/User.js';
import { signToken } from '../../middlewares/jsonwebtoken.js';

const loginSchema = joi.object({
  username: joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),
  password: joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

async function login(request, response) {
  try {
    const validatedData = await loginSchema.validateAsync(request.body, { abortEarly: false });

    
    const user = await UserModel.findOne({ username: validatedData.username });
    
    
    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return response.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid username or password'
      });
    }

    
    const token = signToken({ 
      uid: user._id, 
      role: user.role 
    });

    
    const userResponse = user.toObject();
    delete userResponse.password;

    return response.status(200).json({
      message: 'Login successful',
      data: userResponse,
      token
    });

  } catch (error) {
   
    if (error.isJoi) {
      return response.status(400).json({
        error: 'ValidationError',
        message: error.details.map(detail => detail.message)
      });
    }

   
    console.error('Login error:', error);
    
   
    return response.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred during login'
    });
  }
}


async function refreshLogin(request, response) {
  try {
    const { uid } = request.auth;

   
    const user = await UserModel.findById(uid).select('-password');
    
    if (!user) {
      return response.status(404).json({
        error: 'UserNotFound',
        message: 'User account not found'
      });
    }

   
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
    const { uid } = request.params; 

    
    const user = await UserModel.findById(uid).select('-password');
    
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