import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { FiClock, FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getSessionTimeoutMins,
  SESSION_TIMEOUT_KEY,
} from "../utils/sessionTimeout";

const WARNING_SECONDS = 30;

/**
 * Logs the user out after inactivity (default 5 minutes).
 * Shows a warning modal with a 30s countdown and Stay / Log out actions.
 */
const SessionTimeoutWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const warnTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const warningOpenRef = useRef(false);

  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) window.clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    warnTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("edms_dashboard_nav");
  }, []);

  const logoutForIdle = useCallback(
    (reason: "expired" | "manual" = "expired") => {
      if (!localStorage.getItem("token") && reason === "expired") return;
      clearTimers();
      warningOpenRef.current = false;
      setWarningOpen(false);
      clearAuth();
      if (reason === "expired") {
        toast.info("Session expired due to inactivity. Please sign in again.");
      }
      navigate("/login", { replace: true });
    },
    [clearAuth, clearTimers, navigate]
  );

  const openWarning = useCallback(() => {
    if (!localStorage.getItem("token")) return;
    warningOpenRef.current = true;
    setSecondsLeft(WARNING_SECONDS);
    setWarningOpen(true);

    if (countdownRef.current) window.clearInterval(countdownRef.current);
    countdownRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) window.clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = window.setTimeout(() => {
      logoutForIdle("expired");
    }, WARNING_SECONDS * 1000);
  }, [logoutForIdle]);

  const armTimers = useCallback(() => {
    if (!localStorage.getItem("token")) return;
    clearTimers();
    warningOpenRef.current = false;
    setWarningOpen(false);

    const totalMs = getSessionTimeoutMins() * 60 * 1000;
    const warnMs = Math.max(totalMs - WARNING_SECONDS * 1000, 0);

    if (warnMs <= 0) {
      openWarning();
      return;
    }

    warnTimerRef.current = window.setTimeout(() => {
      openWarning();
    }, warnMs);
  }, [clearTimers, openWarning]);

  const stayLoggedIn = useCallback(() => {
    clearTimers();
    warningOpenRef.current = false;
    setWarningOpen(false);
    armTimers();
  }, [armTimers, clearTimers]);

  useEffect(() => {
    const onActivity = () => {
      // While the warning is open, require an explicit Stay logged in click
      if (warningOpenRef.current) return;
      if (!localStorage.getItem("token")) return;
      armTimers();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_TIMEOUT_KEY) {
        if (warningOpenRef.current) return;
        armTimers();
      }
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((ev) =>
      window.addEventListener(ev, onActivity, { passive: true })
    );
    window.addEventListener("storage", onStorage);
    armTimers();

    return () => {
      clearTimers();
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener("storage", onStorage);
    };
  }, [armTimers, clearTimers, location.pathname]);

  // Safety: if countdown hits 0 and logout timer somehow missed
  useEffect(() => {
    if (warningOpen && secondsLeft <= 0) {
      logoutForIdle("expired");
    }
  }, [warningOpen, secondsLeft, logoutForIdle]);

  return (
    <Dialog
      open={warningOpen}
      onClose={() => {
        /* require explicit Stay or Log out */
      }}
      className="relative z-[100]"
    >
      <div className="fixed inset-0 bg-ink/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl border border-rule w-full max-w-md">
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-md bg-[#0b1622] text-white flex items-center justify-center shrink-0">
                <FiClock size={18} />
              </span>
              <div className="min-w-0">
                <Dialog.Title className="text-[15px] font-semibold text-ink">
                  Session expiring soon
                </Dialog.Title>
                <p className="mt-1 text-[13px] text-muted leading-relaxed">
                  You have been inactive. Choose to stay signed in, or you will
                  be signed out automatically when the timer ends.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div
                className="h-20 w-20 rounded-full border-2 border-rule flex items-center justify-center tabular-nums"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="text-3xl font-semibold text-ink">
                  {secondsLeft}
                </span>
              </div>
              <p className="mt-2 text-[12px] text-muted">
                second{secondsLeft === 1 ? "" : "s"} remaining
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule">
            <button
              type="button"
              onClick={() => logoutForIdle("manual")}
              className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink inline-flex items-center gap-1.5 hover:bg-[#f8f7f3]"
            >
              <FiLogOut size={14} />
              Log out
            </button>
            <button
              type="button"
              onClick={stayLoggedIn}
              className="h-9 px-4 rounded-md bg-[#0b1622] text-white text-[13px] font-medium hover:bg-ink-soft"
            >
              Stay logged in
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SessionTimeoutWatcher;
