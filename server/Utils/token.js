import jwt from "jsonwebtoken";

export function generateToken(userId,type) {
  const token = jwt.sign(
    { userId: userId ,type:type}, 
    'zdhff3506235cqn47c5nq04t5q745q04545-454*45/R424', 
    { expiresIn: '1h' }
  );
  return token;
}


export function isTokenValid(token) {
  try {
    const decoded = jwt.verify(token, 'zdhff3506235cqn47c5nq04t5q745q04545-454*45/R424');
    return decoded; 
  } catch (error) {
    console.error('Invalid or expired token:', error);
    return false;
  }
}