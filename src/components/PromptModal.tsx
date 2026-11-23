import React, { useEffect, useState } from "react";
import { FiEdit3, FiX } from "react-icons/fi";

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  label?: string;
  description?: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  inputType?: "text" | "date";
  isLoading?: boolean;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  title,
  label = "Value",
  description,
  initialValue = "",
  placeholder = "",
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  inputType = "text",
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

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
              <FiEdit3 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto min-h-0">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
            <input
              type={inputType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              autoFocus
              disabled={isLoading}
            />
          </div>

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
              type="submit"
              disabled={!value.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isLoading ? "Saving…" : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptModal;
