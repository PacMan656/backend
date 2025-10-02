import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // access curto
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function signAccessToken(user) {
  return jwt.sign({ email: user.email }, JWT_SECRET, {
    subject: String(user.id),
    expiresIn: EXPIRES_IN,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ email: user.email }, JWT_REFRESH_SECRET, {
    subject: String(user.id),
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}
