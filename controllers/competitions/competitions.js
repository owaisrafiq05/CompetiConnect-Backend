import Competition from '../../models/Comp.js';
import { StatusCodes } from 'http-status-codes';

// Get all competitions
export const getAllCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find()
      .populate('compOwnerUserId', 'username email')
      .populate('compType', 'name description')
      .populate('participants', 'username email')
      .populate('compSubmissionObjId');
    
    res.status(StatusCodes.OK).json({ competitions });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Create new competition
export const createCompetition = async (req, res) => {
  try {
    const {
      compOwnerUserId,
      compName,
      compDescription,
      compType,
      isPrivate,
      passCode,
      problemStatement,
      compRuleBook,
    } = req.body;

    const competition = await Competition.create({
      compOwnerUserId,
      compName,
      compDescription,
      compType,
      isPrivate,
      passCode,
      problemStatement,
      compRuleBook,
      participants: [], // Initialize empty array
      compSubmissionObjId: [], // Initialize empty array
    });

    res.status(StatusCodes.CREATED).json({ competition });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

// Add participant to competition
export const addParticipant = async (req, res) => {
  try {
    const { competitionId, userId } = req.params;
    
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    if (competition.participants.includes(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User already participating' });
    }

    competition.participants.push(userId);
    await competition.save();

    res.status(StatusCodes.OK).json({ competition });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Update total points
export const updateTotalPoints = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { totalPoints } = req.body;

    const competition = await Competition.findByIdAndUpdate(
      competitionId,
      { totalPoints },
      { new: true }
    );

    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    res.status(StatusCodes.OK).json({ competition });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Add submission to competition
export const addSubmission = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { submissionId } = req.body;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    if (competition.compSubmissionObjId.includes(submissionId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Submission already exists' });
    }

    competition.compSubmissionObjId.push(submissionId);
    await competition.save();

    res.status(StatusCodes.OK).json({ competition });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Get competition by ID
export const getCompetitionById = async (req, res) => {
  try {
    const { competitionId } = req.params;
    
    const competition = await Competition.findById(competitionId)
      .populate('compOwnerUserId', 'username email')
      .populate('compType', 'name description')
      .populate('participants', 'username email')
      .populate('compSubmissionObjId');

    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    res.status(StatusCodes.OK).json({ competition });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
