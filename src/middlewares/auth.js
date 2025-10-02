import { verifyToken } from '../utils/jwt';

/**
 * @typedef {import('express').Request & { user?: { id: number; email: string } }} AuthRequest
 */

/**
 * @param {AuthRequest} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing bearer token' });

  const token = header.substring(7);
  try {
    const payload = verifyToken(token); // { sub, email }
    req.user = { id: Number(payload.sub), email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
