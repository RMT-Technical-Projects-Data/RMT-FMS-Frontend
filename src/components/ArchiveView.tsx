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
  const { data: archivedFolders, isError: foldersError } =
    useArchivedFolders(selectedFolderId);

  const isLoading = filesLoading && !archivedFiles;
  const folders = foldersError ? [] : archivedFolders || [];
  const files = filesError ? [] : archivedFiles || [];
  const showFatalError = filesError && !archivedFiles;

  const handleBackClick = () => {
    if (onBackNavigation) onBackNavigation();
    else onFolderSelect(null);
  };

  const handleFolderClick = (folder: Folder) => {
    onFolderSelect(folder.id, folder.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {selectedFolderId && (
            <button
              type="button"
              onClick={handleBackClick}
              className="h-9 px-3 rounded-md border border-rule bg-white text-[13px] font-medium text-ink inline-flex items-center gap-1.5 hover:border-brand-dark"
            >
              <FiArrowLeft size={14} />
              Back
            </button>
          )}
          <p className="text-sm text-muted">
            Archived files keep their folder path.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-rule rounded-lg py-16 text-center text-sm text-muted">
          Loading archived documents…
        </div>
      ) : showFatalError ? (
        <div className="bg-white border border-rule rounded-lg py-16 text-center text-sm text-[#b42318]">
          Failed to load archived documents.
        </div>
      ) : (
        <>
          <section className="border border-rule rounded-lg overflow-hidden bg-white">
            <div className="px-4 py-2.5 border-b border-rule bg-[#f8f7f3]">
              <h3 className="text-[14px] font-semibold text-ink">Folders</h3>
            </div>
            <div className="p-4">
              {folders.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className="folder-card inline-flex items-center gap-3 w-fit max-w-[260px] px-3.5 py-3 bg-white border border-rule rounded-lg cursor-pointer hover:border-[#b9b19f] hover:shadow-sm transition-all"
                    >
                      <span className="h-10 w-10 rounded-lg bg-[#0b1622] text-white flex items-center justify-center shrink-0">
                        <FiFolder size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[14px] text-ink truncate max-w-[140px]">
                          {folder.name}
                        </p>
                        <p className="text-[12px] text-muted">Archive path</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted py-6 text-center">
                  No folders here.
                </p>
              )}
            </div>
          </section>

          <section className="border border-rule rounded-lg overflow-hidden bg-white">
            <div className="px-4 py-2.5 border-b border-rule bg-[#f8f7f3]">
              <h3 className="text-[14px] font-semibold text-ink">Files</h3>
            </div>
            <div className="p-4">
              {files.length > 0 ? (
                <FileList
                  files={files}
                  viewMode="list"
                  onAssignPermission={onAssignPermission}
                  userRole={user.role}
                  userId={user.id}
                  isArchiveView={true}
                />
              ) : (
                <div className="py-10 text-center">
                  <FiArchive className="mx-auto text-muted mb-2" size={22} />
                  <p className="text-sm text-muted">No archived files here.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ArchiveView;
