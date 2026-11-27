import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export type ConfirmTone = "danger" | "warning" | "primary";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const toneStyles: Record<
  ConfirmTone,
  { iconBg: string; button: string }
> = {
  danger: {
    iconBg: "bg-[#b42318]",
    button: "bg-[#b42318] hover:bg-[#912018] text-white",
  },
  warning: {
    iconBg: "bg-[#0b1622]",
    button: "bg-[#0b1622] hover:bg-ink-soft text-white",
  },
  primary: {
    iconBg: "bg-[#0b1622]",
    button: "bg-[#0b1622] hover:bg-ink-soft text-white",
  },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const styles = toneStyles[tone];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <button
        type="button"
        className="fixed inset-0 bg-ink/40 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={isLoading}
      />
      <div className="relative my-auto bg-white rounded-lg shadow-xl border border-rule w-full max-w-md max-h-[min(90vh,640px)] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`h-9 w-9 rounded-md text-white flex items-center justify-center shrink-0 ${styles.iconBg}`}
            >
              <FiAlertTriangle size={16} />
            </span>
            <h2 className="text-[15px] font-semibold text-ink truncate">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-[#f3f1ea] rounded-md disabled:opacity-50"
          >
            <FiX size={18} className="text-muted" />
          </button>
        </div>

        <div className="px-5 py-4 text-sm text-ink leading-relaxed">
          {message}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-9 px-4 rounded-md text-[13px] font-medium disabled:opacity-50 inline-flex items-center gap-2 ${styles.button}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
