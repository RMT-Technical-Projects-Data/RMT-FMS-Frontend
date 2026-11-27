import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiSettings, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getSessionTimeoutMins,
  setSessionTimeoutMins,
  SESSION_TIMEOUT_OPTIONS,
} from "../utils/sessionTimeout";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [timeoutMins, setTimeoutMins] = useState(getSessionTimeoutMins());

  useEffect(() => {
    if (isOpen) setTimeoutMins(getSessionTimeoutMins());
  }, [isOpen]);

  const handleSave = () => {
    const saved = setSessionTimeoutMins(timeoutMins);
    // Notify same-tab idle watcher
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "edms_session_timeout_mins",
        newValue: String(saved),
      })
    );
    toast.success(
      `Session timeout set to ${saved} minute${saved === 1 ? "" : "s"}. It applies immediately for inactivity and on your next sign-in.`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl border border-rule w-full max-w-md my-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-md bg-[#0b1622] text-white flex items-center justify-center">
                <FiSettings size={16} />
              </span>
              <div>
                <Dialog.Title className="text-[15px] font-semibold text-ink">
                  Settings
                </Dialog.Title>
                <p className="text-xs text-muted">Session and account preferences</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#f3f1ea] rounded-md"
            >
              <FiX size={18} className="text-muted" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div>
              <label
                htmlFor="session-timeout"
                className="block text-[13px] font-medium text-ink mb-1.5"
              >
                Session timeout
              </label>
              <select
                id="session-timeout"
                value={timeoutMins}
                onChange={(e) => setTimeoutMins(Number(e.target.value))}
                className="w-full h-10 rounded-md border border-rule bg-white px-3 text-sm text-ink focus:outline-none focus:border-brand-dark"
              >
                {SESSION_TIMEOUT_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} minute{m === 1 ? "" : "s"}
                    {m === 5 ? " (default)" : ""}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[12px] text-muted leading-relaxed">
                You will be signed out automatically after this period of
                inactivity. The default is 5 minutes. Choose a longer interval
                if you need to remain signed in while working intermittently.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-4 rounded-md bg-[#0b1622] text-white text-[13px] font-medium hover:bg-ink-soft"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SettingsModal;
