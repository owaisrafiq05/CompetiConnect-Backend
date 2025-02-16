import Competition from '../../models/Comp.js';
import { StatusCodes } from 'http-status-codes';
import Register from '../../models/Register.js';
import User from '../../models/User.js';
import { sendEmail } from '../../utils/sendEmail.js';
import CompSubmission from '../../models/CompSubmission.js';
import axios from 'axios';

// Get all competitions
export const getAllCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find()
      .populate('compType', 'name description')
      .select('compName compDescription participants isPrivate price')
      .lean();
    
    const simplifiedCompetitions = competitions.map(comp => ({
      _id: comp._id,
      compName: comp.compName,
      compDescription: comp.compDescription,
      compType: comp.compType,
      participantCount: comp.participants.length,
      isPrivate: comp.isPrivate,
      price: comp.price
    }));
    
    res.status(StatusCodes.OK).json({ competitions: simplifiedCompetitions });
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
      submissionRules,
      price,
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
      submissionRules,
      price,
      participants: [], // Initialize empty array
      compSubmissionObjId: [], // Initialize empty array
    });

    // Hit the /myJoinComp POST API with query parameters
    try {
      const response = await axios.post(`http://localhost:5000/user/${compOwnerUserId}/${competition._id}/myCreatedComp`, null, {
      });

      if (response.status !== 200) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add to myJoinComp' });
      }
    } catch (apiError) {
      console.error('Error hitting /myJoinComp API:', apiError.response ? apiError.response.data : apiError.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add to myJoinComp', details: apiError.message });
    }

    res.status(StatusCodes.CREATED).json({ competition });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

// Add participant to competition
export const addParticipant = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { userId } = req.body;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    if (competition.participants.includes(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User already participating' });
    }

    competition.participants.push(userId);
    await competition.save();

    // Hit the /myJoinComp POST API with query parameters
    try {
      const response = await axios.post(`http://localhost:5000/user/${userId}/${competitionId}/myJoinComp`, null, {
      });

      if (response.status !== 200) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add to myJoinComp' });
      }
    } catch (apiError) {
      console.error('Error hitting /myJoinComp API:', apiError.response ? apiError.response.data : apiError.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add to myJoinComp', details: apiError.message });
    }

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
      .populate('compSubmissionObjId')
      .select('compName compDescription isPrivate passCode problemStatement compRuleBook submissionRules totalPoints price announcements createdAt updatedAt');

    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    res.status(StatusCodes.OK).json({ competition });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Get all registrations for a competition
export const getAllRegistrationsById = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const registrations = await Register.find({ competitionId })
      .populate('userId', 'username email')
      .populate('competitionId', 'compName compDescription');

    if (!registrations) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'No registrations found' });
    }

    res.status(StatusCodes.OK).json({ registrations });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Approve user registration
export const approveUser = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { userId } = req.body;

    // Add user to competition participants
    const competition = await Competition.findById(competitionId)
      .populate('compType', 'name description')
      .select('compName compDescription compType isPrivate passCode problemStatement compRuleBook submissionRules price');
    
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    if (competition.participants.includes(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User already a participant' });
    }

    competition.participants.push(userId);
    await competition.save();

    const registration = await Register.findOneAndDelete({ 
      competitionId, 
      userId 
    });

    if (!registration) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Registration not found' });
    }
    // Hit the /myJoinComp POST API with query parameters
    try {
      const response = await axios.post(`http://localhost:5000/user/${userId}/${competitionId}/myJoinComp`, null, {
      });

      if (response.status !== 200) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add to myJoinComp' });
      }
    } catch (apiError) {
      console.error('Error hitting /myJoinComp API:', apiError.response ? apiError.response.data : apiError.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add to myJoinComp', details: apiError.message });
    }

    // Get user email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
    }

    // Send email
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 10px;">
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px; word-wrap: break-word;">🎉 Registration Approved!</h2>
        
        <p style="color: #34495e; font-size: 16px; word-wrap: break-word;">Dear <strong>${user.username}</strong>,</p>
        
        <p style="color: #34495e; font-size: 16px; word-wrap: break-word;">Your registration for <strong>${competition.compName}</strong> has been approved!</p>

        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; word-wrap: break-word;">
            <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px;">Competition Details</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 8px 0;"><strong>Name:</strong> ${competition.compName}</li>
                <li style="margin: 8px 0;"><strong>Description:</strong> ${competition.compDescription}</li>
                <li style="margin: 8px 0;"><strong>Type:</strong> ${competition.compType.name}</li>
                <li style="margin: 8px 0;"><strong>Pass Code:</strong> ${competition.passCode || 'N/A'}</li>
                <li style="margin: 8px 0;"><strong>Price:</strong> ${competition.price || 'N/A'}</li>
            </ul>
        </div>

        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px;">Problem Statement</h3>
            <p style="color: #34495e; word-wrap: break-word;">${competition.problemStatement}</p>
        </div>

        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px;">Rule Book</h3>
            <p style="color: #34495e; word-wrap: break-word;">${competition.compRuleBook}</p>
        </div>

        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px;">Submission Rules</h3>
            <p style="color: #34495e; word-wrap: break-word;">${competition.submissionRules}</p>
        </div>

        <p style="color: #34495e; font-size: 16px; text-align: center; margin-top: 25px;">
            <strong>Best of luck! 🚀</strong>
        </p>
    </div>
</body>
</html>
`;

    await sendEmail({
      to: user.email,
      subject: `Registration Approved - ${competition.compName}`,
      html: emailContent,
    });

    res.status(StatusCodes.OK).json({ 
      message: 'User approved and email sent successfully',
      competition 
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Create registration request
export const createRegistration = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { userId } = req.body;
    const paymentSlip = req.file?.path; // Cloudinary URL if file was uploaded

    // Check if competition exists
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    // Check if registration already exists
    const existingRegistration = await Register.findOne({ competitionId, userId });
    if (existingRegistration) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Registration already exists' });
    }

    // Create registration
    const registration = await Register.create({
      competitionId,
      userId,
      paymentSlip
    });

    res.status(StatusCodes.CREATED).json({ registration });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Create submission
export const createSubmission = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { userId } = req.body;
    const zipFile = req.file.path; // Cloudinary URL

    // Check if competition exists
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    // Check if user is a participant
    if (!competition.participants.includes(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'User is not a participant in this competition' 
      });
    }

    // Create submission
    const submission = await CompSubmission.create({
      userId,
      zipFile
    });

    // Add submission to competition
    competition.compSubmissionObjId.push(submission._id);
    await competition.save();

    res.status(StatusCodes.CREATED).json({ submission });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Get all submissions for a competition
export const getAllSubmissionsByCompetitionId = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId)
      .populate({
        path: 'compSubmissionObjId',
        populate: {
          path: 'userId',
          select: 'username email'
        }
      });

    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    res.status(StatusCodes.OK).json({ 
      submissions: competition.compSubmissionObjId 
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Update submission points
export const updateSubmissionPoints = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { userId, points } = req.body;

    // Find the competition and populate submissions
    const competition = await Competition.findById(competitionId)
      .populate('compSubmissionObjId');
    
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    // Find the submission for this user
    const submission = competition.compSubmissionObjId.find(
      sub => sub.userId.toString() === userId
    );

    if (!submission) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        error: 'No submission found for this user in this competition' 
      });
    }

    // Update the submission points
    const updatedSubmission = await CompSubmission.findByIdAndUpdate(
      submission._id,
      { points },
      { new: true }
    );

    res.status(StatusCodes.OK).json({ submission: updatedSubmission });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Get all participants sorted by points
export const getAllParticipantsSortedByPoints = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId)
      .populate('participants', 'username email')
      .populate('compSubmissionObjId');

    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    // Create array of participants with their points
    const participantsWithPoints = competition.participants.map(participant => {
      const submission = competition.compSubmissionObjId.find(
        sub => sub.userId.toString() === participant._id.toString()
      );
      
      return {
        participant: participant,
        points: submission ? submission.points : 0
      };
    });

    // Sort by points in descending order
    participantsWithPoints.sort((a, b) => b.points - a.points);

    res.status(StatusCodes.OK).json({ participants: participantsWithPoints });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Get all announcements for a competition
export const getAnnouncements = async (req, res) => {
  try {
    const { competitionId } = req.params;
    
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    res.status(StatusCodes.OK).json({ announcements: competition.announcements });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Add announcement to competition
export const addAnnouncement = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { announcement } = req.body;

    if (!announcement) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Announcement text is required' });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Competition not found' });
    }

    competition.announcements.push(announcement);
    await competition.save();

    res.status(StatusCodes.OK).json({ announcements: competition.announcements });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

// Get all competitions by user ID
export const getAllCompetitionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const competitions = await Competition.find({ compOwnerUserId: userId })
      .populate('compType', 'name description')
      .select('compName compDescription participants isPrivate price createdAt')
      .lean();
    
    const simplifiedCompetitions = competitions.map(comp => ({
      _id: comp._id,
      compName: comp.compName,
      compDescription: comp.compDescription,
      compType: comp.compType,
      participantCount: comp.participants.length,
      isPrivate: comp.isPrivate,
      price: comp.price,
      createdAt: comp.createdAt
    }));
    
    res.status(StatusCodes.OK).json({ competitions: simplifiedCompetitions });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
