type LoginAttempt = {
  count: number;
  resetAt: number;
};

const maxLoginAttempts = 5;
const loginAttemptWindowMs = 15 * 60 * 1000;

const globalForRateLimit = globalThis as unknown as {
  adminLoginAttempts?: Map<string, LoginAttempt>;
};

const loginAttempts =
  globalForRateLimit.adminLoginAttempts ?? new Map<string, LoginAttempt>();

globalForRateLimit.adminLoginAttempts = loginAttempts;

function getCurrentAttempt(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    const nextAttempt = {
      count: 0,
      resetAt: now + loginAttemptWindowMs,
    };
    loginAttempts.set(key, nextAttempt);
    return nextAttempt;
  }

  return attempt;
}

export function isAdminLoginRateLimited(key: string) {
  return getCurrentAttempt(key).count >= maxLoginAttempts;
}

export function recordFailedAdminLogin(key: string) {
  const attempt = getCurrentAttempt(key);
  attempt.count += 1;
  loginAttempts.set(key, attempt);
}

export function clearAdminLoginAttempts(key: string) {
  loginAttempts.delete(key);
}
