import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/index.js';

export const signToken = (payload = {}, expiresIn = '12h') => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  return token;
};

export const authorizeBearerToken = (request, response, next) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.status(400).json({
        message: 'Token not provided',
      });
    }

    const auth = jwt.verify(token, JWT_SECRET);
    if (!auth) {
      return response.status(401).json({
        message: 'Unauthorized - invalid token',
      });
    }

    request.auth = auth;
    next();
  } catch (error) {
    console.error(error);
    return response.status(401).json({
      message: 'Unauthorized - invalid token',
    });
  }
};
