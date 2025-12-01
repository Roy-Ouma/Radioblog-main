import AccessLog from '../models/AccessLog.js';

// Records admin route access; call with `accessLog()` as express middleware
export const accessLog = (options = {}) => async (req, res, next) => {
  try {
    const start = Date.now();
    // attach a hook to run after response finishes
    res.on('finish', async () => {
      try {
        const entry = {
          userId: req.currentUser?._id || null,
          route: req.originalUrl || req.url,
          method: req.method,
          ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'] || '',
          success: res.statusCode < 400,
          meta: {
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
            ...options.meta,
          },
        };
        await AccessLog.create(entry);
      } catch (err) {
        console.error('Failed to write access log', err);
      }
    });
  } catch (err) {
    console.error('accessLog middleware error', err);
  }
  return next();
};

export default accessLog;
