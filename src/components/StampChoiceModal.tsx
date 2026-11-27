import React from "react";
import { FiDownload, FiX } from "react-icons/fi";

interface StampChoiceModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  isLoading?: boolean;
  onWithStamp: () => void;
  onWithoutStamp: () => void;
  onClose: () => void;
}

const StampChoiceModal: React.FC<StampChoiceModalProps> = ({
  isOpen,
  title = "Download",
  itemName,
  isLoading = false,
  onWithStamp,
  onWithoutStamp,
  onClose,
}) => {
  if (!isOpen) return null;

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
            <span className="h-9 w-9 rounded-md bg-[#0b1622] text-white flex items-center justify-center shrink-0">
              <FiDownload size={16} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
              {itemName && (
                <p
                  className="text-xs text-muted truncate max-w-[260px]"
                  title={itemName}
                >
                  {itemName}
                </p>
              )}
            </div>
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

        <div className="px-5 py-4">
          <p className="text-sm text-ink">
            Choose whether to include stamps on this download.
          </p>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onWithoutStamp}
            className="h-9 px-4 rounded-md border border-rule text-[13px] font-medium text-ink hover:border-brand-dark disabled:opacity-50"
          >
            Without Stamp
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onWithStamp}
            className="h-9 px-4 rounded-md bg-[#0b1622] text-white text-[13px] font-medium hover:bg-ink-soft disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? "Downloading…" : "With Stamp"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StampChoiceModal;
