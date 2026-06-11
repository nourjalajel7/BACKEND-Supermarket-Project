const buckets = new Map();

const loginRateLimit = (req, res, next) => {
  const windowMs = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const maxAttempts = Number(process.env.LOGIN_RATE_LIMIT_MAX || 5);
  const now = Date.now();
  const key = `${req.ip}:${String(req.body.email || "").toLowerCase()}`;
  const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };

//هل انتهت مدة الـ 15 دقيقة？
  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count > maxAttempts) {
    return res.status(429).json({
      message: "Too many login attempts, please try again later",
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000)
    });
  }

  next();
};

module.exports = {
  loginRateLimit
};

// لكل IP + email:
// اسمح بـ 5 محاولات login خلال 15 دقيقة.
// إذا صاروا أكثر من 5، امنع الطلب وارجع 429.
// بعد انتهاء 15 دقيقة، صفر العداد واسمح بالمحاولات من جديد.