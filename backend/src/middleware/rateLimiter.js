import rateLimit from 'express-rate-limit';

// ============================================
// LOGIN RATE LIMITER
// 5 attempts per 15 minutes per IP
// ============================================
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: '15 minutes'
    },
    keyGenerator: (req) => {
        // Rate limit by IP + email combo to prevent targeted attacks
        return `${req.ip}:${req.body?.email || 'unknown'}`;
    }
});

// ============================================
// PASSWORD RESET RATE LIMITER
// 3 attempts per 15 minutes per IP
// ============================================
export const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many password reset requests. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: '15 minutes'
    }
});
