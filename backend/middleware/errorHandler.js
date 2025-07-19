const errorHandler = (err, req, res, next) => {
  console.error("Error encountered:", err.name, err.message);
  // Log the stack trace for detailed debugging, but don't expose it in production
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = res.statusCode && res.statusCode > 299 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred.',
    // Only show stack trace in non-production environments for security reasons
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = errorHandler; 