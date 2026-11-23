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
    iconBg: "from-red-500 to-red-600",
    button:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
  },
  warning: {
    iconBg: "from-amber-500 to-amber-600",
    button:
      "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800",
  },
  primary: {
    iconBg: "from-blue-500 to-blue-600",
    button:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
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
        className="fixed inset-0 bg-transparent backdrop-blur-md cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={isLoading}
      />
      <div className="relative my-auto bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md max-h-[min(90vh,640px)] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${styles.iconBg} rounded-lg flex items-center justify-center`}
            >
              <FiAlertTriangle className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto min-h-0">
          <div className="text-gray-700 mb-6">{message}</div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-3 text-white rounded-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-medium ${styles.button}`}
            >
              {isLoading ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
