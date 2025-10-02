import rateLimit from 'express-rate-limit';

// limita /api/auth/* (signup/login) a 5 req/min por IP
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
