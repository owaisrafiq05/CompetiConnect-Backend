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
  getAllRegistrationsById,
  approveUser,
  createRegistration,
  createSubmission,
  getAllSubmissionsByCompetitionId,
  updateSubmissionPoints,
  getAllParticipantsSortedByPoints,
} from '../controllers/competitions/competitions.js';
import { uploadSubmission } from '../middlewares/fileUpload.js';

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
router.get('/:competitionId/registrations', getAllRegistrationsById);
router.post('/:competitionId/approve/:userId', approveUser);

// New routes for registration and submissions
router.post('/:competitionId/register', createRegistration);
router.post(
  '/:competitionId/submissions',
  uploadSubmission.single('zipFile'),
  createSubmission
);
router.get('/:competitionId/submissions', getAllSubmissionsByCompetitionId);

// Add new route for updating submission points
router.patch('/:competitionId/submissions/points', updateSubmissionPoints);

// Add new route for getting sorted participants
router.get('/:competitionId/participants/leaderboard', getAllParticipantsSortedByPoints);

export default router;
