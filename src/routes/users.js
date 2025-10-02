import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// público (ex): lista de usuários sem dados sensíveis
router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(users);
  } catch (err) { next(err); }
});

// protegido
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) { next(err); }
});

export default router;
