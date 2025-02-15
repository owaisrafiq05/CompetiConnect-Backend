import express from 'express';
import { authorizeBearerToken } from '../middlewares/jsonwebtoken.js';
import register from '../controllers/auth/register.js';
import { login, refreshLogin, getUserDetails } from '../controllers/auth/login.js';

// initialize router
const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /auth/refresh
 * @desc    Refresh user session using JWT token
 * @access  Private
 */
router.get('/refresh', authorizeBearerToken, refreshLogin);

/**
 * @route   GET /auth/refresh
 * @desc    Refresh user session using JWT token
 * @access  Private
 */
router.get('/user/:uid', getUserDetails);

export default router;