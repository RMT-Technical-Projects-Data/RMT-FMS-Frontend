import React from "react";
import { FiArchive, FiArrowLeft, FiFolder } from "react-icons/fi";
import FileList from "./FileList";
import { useArchivedFiles, useArchivedFolders } from "../hooks/useFiles";
import type { User, Folder } from "../types";

interface ArchiveViewProps {
  user: User;
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null, folderName?: string | null) => void;
  onBackNavigation?: () => void;
  onAssignPermission: (
    resourceId: number,
    resourceType: "folder" | "file"
  ) => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({
  user,
  selectedFolderId,
  onFolderSelect,
  onBackNavigation,
  onAssignPermission,
}) => {
  const {
    data: archivedFiles,
    isLoading: filesLoading,
    isError: filesError,
  } = useArchivedFiles(selectedFolderId);
  const {
    data: archivedFolders,
    isLoading: foldersLoading,
    isError: foldersError,
  } = useArchivedFolders(selectedFolderId);

  // Don't block forever if folders endpoint fails — still show archived files
  const isLoading = filesLoading && !archivedFiles;
  const folders = foldersError ? [] : archivedFolders || [];
  const files = filesError ? [] : archivedFiles || [];
  const totalItems = folders.length + files.length;
  const showFatalError = filesError && !archivedFiles;

  const handleBackClick = () => {
    if (onBackNavigation) onBackNavigation();
    else onFolderSelect(null);
  };

  const handleFolderClick = (folder: Folder) => {
    onFolderSelect(folder.id, folder.name);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedFolderId && (
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <FiArchive size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Archive</h2>
            <p className="text-sm text-gray-500">
              Archived files keep their folder path. Only the archived file is
              moved — other files stay active.
            </p>
            <p className="text-xs text-gray-400 mt-1">{totalItems} items</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading archived documents…
        </div>
      ) : showFatalError ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-500">
          Failed to load archived documents.
        </div>
      ) : totalItems === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiArchive className="text-amber-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No archived documents
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            When you archive a file, its folder structure appears here so you
            can open the same path.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Folders
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleFolderClick(folder)}
                    className="flex items-center p-4 bg-amber-50/60 rounded-xl border border-amber-100 hover:shadow-md transition-all text-left"
                  >
                    <div className="p-3 rounded-xl bg-amber-100 text-amber-700 mr-3">
                      <FiFolder size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {folder.name}
                      </div>
                      <div className="text-xs text-amber-700 mt-0.5">
                        Archive path
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {folders.length > 0 ? "Archived Files" : "Archived Items"}
              </h3>
              <FileList
                files={files}
                onAssignPermission={onAssignPermission}
                userRole={user.role}
                userId={user.id}
                isArchiveView={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchiveView;
