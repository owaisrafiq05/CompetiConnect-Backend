import CompType from '../../models/CompType.js';

// Controller to add a competition type
async function addCompType(request, response) {
  const { compTypeName } = request.body; // Get compTypeName from request body
  try {
    const newCompType = new CompType({ compTypeName });
    await newCompType.save();
    return response.status(201).json({ message: 'Competition type added successfully', compType: newCompType });
  } catch (error) {
    console.error('Error adding competition type:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}

// Controller to get all competition types
async function getAllCompTypes(request, response) {
  try {
    const compTypes = await CompType.find();
    return response.status(200).json(compTypes);
  } catch (error) {
    console.error('Error fetching competition types:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}

// Exporting the controllers
export {
  addCompType,
  getAllCompTypes,
};
