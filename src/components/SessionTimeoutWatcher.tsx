import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getSessionTimeoutMins, SESSION_TIMEOUT_KEY } from "../utils/sessionTimeout";

/**
 * Logs the user out after a period of inactivity (default 5 minutes).
 * Timeout length is read from localStorage and can be changed in Settings.
 */
const SessionTimeoutWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearAuth = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("edms_dashboard_nav");
    };

    const logoutForIdle = () => {
      if (!localStorage.getItem("token")) return;
      clearAuth();
      toast.info("Session expired due to inactivity. Please sign in again.");
      navigate("/login", { replace: true });
    };

    const resetTimer = () => {
      if (!localStorage.getItem("token")) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      const mins = getSessionTimeoutMins();
      timerRef.current = window.setTimeout(logoutForIdle, mins * 60 * 1000);
    };

    const onActivity = () => resetTimer();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_TIMEOUT_KEY) resetTimer();
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    window.addEventListener("storage", onStorage);
    resetTimer();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate, location.pathname]);

  return null;
};

export default SessionTimeoutWatcher;
