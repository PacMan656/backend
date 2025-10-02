import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimit';

const router = Router();

// ===== signup =====
router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().optional(),
      password: z.string().min(6),
    });
    const data = schema.parse(req.body || {});

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, password: passwordHash },
      select: { id: true, email: true, name: true },
    });

    const access = signAccessToken(user);
    const refresh = signRefreshToken(user);

    // refresh em cookie httpOnly
    res.cookie('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user, access });
  } catch (err) { next(err); }
});

// ===== login =====
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email(), password: z.string() });
    const { email, password } = schema.parse(req.body || {});

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const access = signAccessToken(user);
    const refresh = signRefreshToken(user);

    res.cookie('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, access });
  } catch (err) { next(err); }
});

// ===== refresh =====
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
    if (!user) return res.status(401).json({ error: 'Invalid user' });

    const access = signAccessToken(user);
    res.json({ access });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ===== logout =====
router.post('/logout', (_req, res) => {
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  res.status(204).send();
});

 // ===== /me (protegido) =====
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(me);
  } catch (err) { next(err); }
});

export default router;
