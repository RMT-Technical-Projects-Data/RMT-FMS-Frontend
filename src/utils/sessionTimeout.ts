export const SESSION_TIMEOUT_KEY = "edms_session_timeout_mins";
export const DEFAULT_SESSION_TIMEOUT_MINS = 5;
export const SESSION_TIMEOUT_OPTIONS = [5, 10, 15, 30, 60, 120] as const;

export const getSessionTimeoutMins = (): number => {
  try {
    const raw = localStorage.getItem(SESSION_TIMEOUT_KEY);
    const n = parseInt(raw || "", 10);
    if (Number.isFinite(n) && n >= 1 && n <= 480) return n;
  } catch {
    /* ignore */
  }
  return DEFAULT_SESSION_TIMEOUT_MINS;
};

export const setSessionTimeoutMins = (mins: number) => {
  const clamped = Math.min(Math.max(Math.round(mins) || DEFAULT_SESSION_TIMEOUT_MINS, 1), 480);
  localStorage.setItem(SESSION_TIMEOUT_KEY, String(clamped));
  return clamped;
};
