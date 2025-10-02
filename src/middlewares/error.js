export default function errorHandler(err, _req, res, _next) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }
  // Prisma validation
  if (err?.name === 'PrismaClientValidationError') {
    return res.status(400).json({ error: 'Validation error', detail: String(err.message) });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
}
