/**
 * Client-side rate limiting utility
 * Prevents abuse of authentication and API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();

  /**
   * Check if request is within rate limit
   * @param key Unique identifier (e.g., email, IP, user ID)
   * @param limit Maximum requests allowed
   * @param windowMs Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now > entry.resetTime) {
      // No entry or window expired, create new entry
      this.storage.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= limit) {
      return false; // Rate limit exceeded
    }

    // Increment count
    entry.count++;
    this.storage.set(key, entry);
    return true;
  }

  /**
   * Get remaining time until rate limit resets
   * @param key Unique identifier
   * @returns milliseconds until reset, 0 if not rate limited
   */
  getTimeUntilReset(key: string): number {
    const entry = this.storage.get(key);
    if (!entry) return 0;

    const remaining = entry.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Clear rate limit for a specific key
   * @param key Unique identifier to reset
   */
  reset(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP_ATTEMPTS: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 resets per hour
  API_CALLS: { limit: 100, windowMs: 60 * 1000 }, // 100 calls per minute
  FILE_UPLOADS: { limit: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  MESSAGE_SENDING: { limit: 30, windowMs: 60 * 1000 } // 30 messages per minute
};

// Helper function to check authentication rate limits
export const checkAuthRateLimit = (email: string, action: 'login' | 'signup' | 'reset'): { allowed: boolean; timeUntilReset: number } => {
  const config = action === 'login' ? RATE_LIMITS.LOGIN_ATTEMPTS :
                 action === 'signup' ? RATE_LIMITS.SIGNUP_ATTEMPTS :
                 RATE_LIMITS.PASSWORD_RESET;

  const key = `auth_${action}_${email.toLowerCase()}`;
  const allowed = rateLimiter.isAllowed(key, config.limit, config.windowMs);
  const timeUntilReset = rateLimiter.getTimeUntilReset(key);

  return { allowed, timeUntilReset };
};

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);