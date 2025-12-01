//ERROR MIDDLEWARE

export default function errorMiddleware(err, req, res, next) {
  // Log full error (stack if available) for debugging
  console.error(err?.stack || err);

  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";

  // Avoid leaking internal details in production
  res.status(status).json({
    success: false,
    status,
    message,
  });
}