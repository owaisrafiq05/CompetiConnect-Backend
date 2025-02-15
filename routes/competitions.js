import express from 'express';
import {
  addCompType,
  getAllCompTypes,
} from '../controllers/competitions/compType.js';
import {
  getAllCompetitions,
  createCompetition,
  addParticipant,
  updateTotalPoints,
  addSubmission,
  getCompetitionById,
} from '../controllers/competitions/competitions.js';

const router = express.Router();

// Competition Type routes
router.post('/type', addCompType);
router.get('/type', getAllCompTypes);

// Competition routes
router.get('/', getAllCompetitions);
router.post('/', createCompetition);
router.get('/:competitionId', getCompetitionById);
router.patch('/:competitionId/participants/:userId', addParticipant);
router.patch('/:competitionId/points', updateTotalPoints);
router.patch('/:competitionId/submissions', addSubmission);

export default router;
