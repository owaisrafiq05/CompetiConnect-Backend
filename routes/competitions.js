import express from 'express';
import {
  addCompType,
  getAllCompTypes,
} from '../controllers/competitions/compType.js';

const router = express.Router();

// Route for adding a competition type
router.post('/type', addCompType);

// Route for getting all competition types
router.get('/type', getAllCompTypes);

export default router;
