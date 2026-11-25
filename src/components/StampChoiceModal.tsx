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
        className="fixed inset-0 bg-transparent backdrop-blur-md cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={isLoading}
      />
      <div className="relative my-auto bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md max-h-[min(90vh,640px)] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FiDownload className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {itemName && (
                <p className="text-sm text-gray-500 truncate max-w-[260px]" title={itemName}>
                  {itemName}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600">
            Choose whether to include stamps on this download.
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onWithoutStamp}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Without Stamp
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onWithStamp}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {isLoading ? "Downloading…" : "With Stamp"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StampChoiceModal;
