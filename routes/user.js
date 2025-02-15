import express from 'express';
import {
  getMyJoinComp,
  getMyCreatedComp,
  addToMyCreatedComp,
  addToMyJoinComp,
} from '../controllers/user/UserDetail.js';

const router = express.Router();

// Route for getting myJoinComp
router.get('/myJoinComp', getMyJoinComp);

// Route for getting myCreatedComp
router.get('/myCreatedComp', getMyCreatedComp);

// Route for adding comp ID to myCreatedComp
router.post('/myCreatedComp', addToMyCreatedComp);

// Route for adding comp ID to myJoinComp
router.post('/myJoinComp', addToMyJoinComp);

export default router;
