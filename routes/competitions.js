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
  getAnnouncements,
  addAnnouncement,
  getAllCompetitionsByUserId,
  deleteParticipant
} from '../controllers/competitions/competitions.js';
import { uploadSubmission, uploadPaymentSlip } from '../middlewares/fileUpload.js';

const router = express.Router();

// Competition Type routes
router.post('/type', addCompType);
router.get('/type', getAllCompTypes);

// Competition routes
router.get('/', getAllCompetitions);
router.post('/', createCompetition);
router.get('/:competitionId', getCompetitionById);
router.patch('/:competitionId/participants', addParticipant);
router.patch('/:competitionId/points', updateTotalPoints);
router.patch('/:competitionId/submissions', addSubmission);
router.get('/:competitionId/registrations', getAllRegistrationsById);
router.post('/:competitionId/approve', approveUser);

// New routes for registration and submissions
router.post('/:competitionId/register', uploadPaymentSlip.single('paymentSlip'), createRegistration);
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

// Announcement routes
router.get('/:competitionId/announcements', getAnnouncements);
router.post('/:competitionId/announcements', addAnnouncement);

// Get all competitions by user ID
router.get('/user/:userId', getAllCompetitionsByUserId);

router.delete('/:competitionId/participants', deleteParticipant);

export default router;
