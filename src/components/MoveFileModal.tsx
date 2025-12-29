import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FiFolder, FiX, FiChevronRight, FiChevronDown, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useFolderTree } from "../hooks/useFolders";
import { useMoveFile } from "../hooks/useFiles";
import type { Folder } from "../types";

interface MoveFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileId: number | null;
    fileName: string;
}

const FolderTreeItem: React.FC<{
    folder: Folder;
    selectedIds: number[];
    onToggle: (id: number) => void;
    level?: number;
}> = ({ folder, selectedIds, onToggle, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = folder.nested_folders && folder.nested_folders.length > 0;
    const isSelected = selectedIds.includes(folder.id);

    return (
        <div className="select-none">
            <div
                className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : ""
                    }`}
                style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                onClick={() => onToggle(folder.id)}
            >
                <div
                    className="p-1 mr-2 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    {hasChildren ? (
                        isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />
                    ) : (
                        <div className="w-4" />
                    )}
                </div>

                <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                    }`}>
                    {isSelected && <FiCheck size={12} className="text-white" />}
                </div>

                <FiFolder className={`mr-2 ${isSelected ? "text-blue-600" : "text-gray-400"}`} size={18} />
                <span className={`text-sm ${isSelected ? "text-blue-700 font-medium" : "text-gray-700"}`}>
                    {folder.name}
                </span>
            </div>

            {hasChildren && isExpanded && (
                <div className="ml-2 border-l border-gray-100">
                    {folder.nested_folders?.map((child) => (
                        <FolderTreeItem
                            key={child.id}
                            folder={child}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const MoveFileModal: React.FC<MoveFileModalProps> = ({
    isOpen,
    onClose,
    fileId,
    fileName,
}) => {
    console.log("🏗️ MoveFileModal rendered:", { isOpen, fileId, fileName });
    const { data: folderTree, isLoading } = useFolderTree();
    const moveFile = useMoveFile();
    const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setSelectedFolderIds([]);
            setError(null);
        }
    }, [isOpen]);

    const handleToggleFolder = (folderId: number) => {
        setError(null); // Clear error on interaction
        setSelectedFolderIds((prev) => {
            if (prev.includes(folderId)) {
                return prev.filter((id) => id !== folderId);
            } else {
                return [...prev, folderId];
            }
        });
    };

    const handleSubmit = () => {
        if (fileId && selectedFolderIds.length > 0) {
            setError(null);
            moveFile.mutate(
                { fileId, targetFolderIds: selectedFolderIds },
                {
                    onSuccess: () => {
                        setSelectedFolderIds([]);
                        setError(null);
                        onClose();
                    },
                    onError: (err: any) => {
                        setError(err.response?.data?.message || "Failed to move file");
                    }
                }
            );
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Move File</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Select destination folders for <span className="font-medium text-gray-900">"{fileName}"</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : folderTree && folderTree.length > 0 ? (
                        <div className="space-y-1">
                            {folderTree.map((folder) => (
                                <FolderTreeItem
                                    key={folder.id}
                                    folder={folder}
                                    selectedIds={selectedFolderIds}
                                    onToggle={handleToggleFolder}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No folders available
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex flex-col space-y-4">
                    {/* Error Message Display */}
                    {error && (
                        <div className="flex items-center p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                            <FiAlertCircle className="flex-shrink-0 mr-2" size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-gray-500">
                            {selectedFolderIds.length} folder{selectedFolderIds.length !== 1 ? "s" : ""} selected
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-all font-medium shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={selectedFolderIds.length === 0 || moveFile.isPending}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/20 flex items-center"
                            >
                                {moveFile.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Moving...
                                    </>
                                ) : (
                                    "Move File"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MoveFileModal;
