import { supabase } from './supabase';

const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REGISTRATION_ATTEMPTS = 3;
const MAX_LOGIN_ATTEMPTS = 10;
const API_KEY_RESET_COOLDOWN = 30 * 24 * 60 * 60 * 1000; // 30 days

interface RateLimit {
  attempts: number;
  firstAttempt: number;
}

const rateLimits = new Map<string, RateLimit>();
const bannedIPs = new Set<string>();

export const generateApiKey = (): string => {
  const generateSegment = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };
  
  return `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
};

export const canResetApiKey = (lastReset: string | null): { canReset: boolean; daysLeft: number } => {
  if (!lastReset) return { canReset: true, daysLeft: 0 };
  
  const lastResetDate = new Date(lastReset).getTime();
  const now = Date.now();
  const timeSinceReset = now - lastResetDate;
  const timeLeft = API_KEY_RESET_COOLDOWN - timeSinceReset;
  
  return {
    canReset: timeLeft <= 0,
    daysLeft: Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
  };
};

export const isIPBanned = (ip: string): boolean => {
  return bannedIPs.has(ip);
};

export const checkRateLimit = (
  ip: string,
  action: 'register' | 'login'
): boolean => {
  if (isIPBanned(ip)) return false;

  const now = Date.now();
  const limit = rateLimits.get(ip) || { attempts: 0, firstAttempt: now };

  // Reset if window has expired
  if (now - limit.firstAttempt > RATE_LIMIT_WINDOW) {
    limit.attempts = 0;
    limit.firstAttempt = now;
  }

  limit.attempts++;
  rateLimits.set(ip, limit);

  const maxAttempts =
    action === 'register' ? MAX_REGISTRATION_ATTEMPTS : MAX_LOGIN_ATTEMPTS;

  if (limit.attempts > maxAttempts) {
    bannedIPs.add(ip);
    return false;
  }

  return true;
};