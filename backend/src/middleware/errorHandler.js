export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({
      error: 'Resource already exists',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      error: 'Invalid reference',
      detail: err.detail,
    });
  }

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
