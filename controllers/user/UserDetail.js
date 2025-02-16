import User from '../../models/User.js';

// GET controller for retrieving myJoinComp
async function getMyJoinComp(request, response) {
  const { userId } = request.params; // Assuming user ID is available in request
  try {
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }
    return response.status(200).json({ myJoinComp: user.myJoinComp });
  } catch (error) {
    console.error('Error fetching myJoinComp:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}

// GET controller for retrieving myCreatedComp
async function getMyCreatedComp(request, response) {
    const { userId } = request.params; // Assuming user ID is available in request
  try {
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }
    return response.status(200).json({ myCreatedComp: user.myCreatedComp });
  } catch (error) {
    console.error('Error fetching myCreatedComp:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}

// POST controller for adding comp ID to myCreatedComp
async function addToMyCreatedComp(request, response) {
  const { userId } = request.params; // Assuming user ID is available in request
  const { compId } = request.params; // Get compId from query params
  try {
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }
    user.myCreatedComp.push(compId);
    await user.save();
    return response.status(200).json({ message: 'Company added to myCreatedComp', myCreatedComp: user.myCreatedComp });
  } catch (error) {
    console.error('Error adding to myCreatedComp:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}

// POST controller for adding comp ID to myJoinComp
async function addToMyJoinComp(request, response) {
  const { userId } = request.params; // Get userId from query params
  const { compId } = request.params; // Get compId from query params
  try {
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }
    user.myJoinComp.push(compId);
    await user.save();
    return response.status(200).json({ message: 'Company added to myJoinComp', myJoinComp: user.myJoinComp });
  } catch (error) {
    console.error('Error adding to myJoinComp:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}

// Exporting the controllers
export {
  getMyJoinComp,
  getMyCreatedComp,
  addToMyCreatedComp,
  addToMyJoinComp,
};
