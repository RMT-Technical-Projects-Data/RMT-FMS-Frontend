import React from "react";
import {
  FiArchive,
  FiArrowLeft,
  FiFolder,
  FiMoreVertical,
  FiDownload,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";
import FileList from "./FileList";
import ConfirmModal from "./ConfirmModal";
import StampChoiceModal from "./StampChoiceModal";
import { useArchivedFiles, useArchivedFolders, useDownloadFolder } from "../hooks/useFiles";
import {
  useUnarchiveFolder,
  useDeleteFolder,
} from "../hooks/useFolders";
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

  const unarchiveFolder = useUnarchiveFolder();
  const deleteFolder = useDeleteFolder();
  const downloadFolder = useDownloadFolder();

  const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(
    null
  );
  const [unarchiveTarget, setUnarchiveTarget] = React.useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: number;
    name: string;
  } | null>(null);
  const [downloadTarget, setDownloadTarget] = React.useState<{
    id: number;
    name: string;
  } | null>(null);

  const isLoading = filesLoading && !archivedFiles;
  const folders = foldersError ? [] : archivedFolders || [];
  const files = filesError ? [] : archivedFiles || [];
  const showFatalError = filesError && !archivedFiles;
  const isSuperAdmin = user.role === "super_admin";

  React.useEffect(() => {
    const close = () => setOpenDropdownId(null);
    if (openDropdownId == null) return;
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [openDropdownId]);

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
          <section className="border border-rule rounded-lg bg-white overflow-visible">
            <div className="px-4 py-2.5 border-b border-rule bg-[#f8f7f3] rounded-t-lg">
              <h3 className="text-[14px] font-semibold text-ink">Folders</h3>
            </div>
            <div className="p-4 overflow-visible">
              {folders.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {folders.map((folder, index) => (
                    <div
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className={`folder-card group relative inline-flex items-center gap-3 w-fit max-w-[280px] px-3.5 py-3 bg-white border border-rule rounded-lg cursor-pointer hover:border-[#b9b19f] hover:shadow-sm transition-all ${
                        openDropdownId === folder.id ? "z-50" : "z-0"
                      }`}
                    >
                      <span className="h-6 min-w-6 px-1.5 rounded-md bg-[#f3f1ea] border border-rule text-[12px] font-semibold tabular-nums text-ink flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="h-10 w-10 rounded-lg bg-[#0b1622] text-white flex items-center justify-center shrink-0">
                        <FiFolder size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[14px] text-ink truncate max-w-[140px]">
                          {folder.name}
                        </p>
                        <p className="text-[12px] text-muted">Archive path</p>
                      </div>
                      <div
                        className="relative shrink-0 ml-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === folder.id ? null : folder.id
                            );
                          }}
                          className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-[#f3f1ea]"
                          title="More options"
                        >
                          <FiMoreVertical size={16} />
                        </button>
                        {openDropdownId === folder.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-md shadow-xl border border-rule z-[60]">
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUnarchiveTarget({
                                    id: folder.id,
                                    name: folder.name,
                                  });
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-[13px] text-ink hover:bg-[#f8f7f3]"
                              >
                                <FiRotateCcw className="mr-2" size={14} />
                                Unarchive
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDownloadTarget({
                                    id: folder.id,
                                    name: folder.name,
                                  });
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-[13px] text-ink hover:bg-[#f8f7f3]"
                              >
                                <FiDownload className="mr-2" size={14} />
                                Download
                              </button>
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({
                                      id: folder.id,
                                      name: folder.name,
                                    });
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-[13px] text-[#b42318] hover:bg-[#fdecea]"
                                >
                                  <FiTrash2 className="mr-2" size={14} />
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
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
            <div>
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

      <ConfirmModal
        isOpen={!!unarchiveTarget}
        title="Unarchive Folder"
        message={
          <>
            Restore folder <strong>"{unarchiveTarget?.name}"</strong> and all
            archived files inside it back to the dashboard?
          </>
        }
        confirmLabel="Unarchive"
        tone="primary"
        isLoading={unarchiveFolder.isPending}
        onClose={() => {
          if (!unarchiveFolder.isPending) setUnarchiveTarget(null);
        }}
        onConfirm={() => {
          if (!unarchiveTarget) return;
          unarchiveFolder.mutate(unarchiveTarget.id, {
            onSettled: () => setUnarchiveTarget(null),
          });
        }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Folder"
        message={
          <>
            Move folder <strong>"{deleteTarget?.name}"</strong> and its
            contents to trash?
          </>
        }
        confirmLabel="Delete Folder"
        tone="danger"
        isLoading={deleteFolder.isPending}
        onClose={() => {
          if (!deleteFolder.isPending) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteFolder.mutate(deleteTarget.id, {
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />

      <StampChoiceModal
        isOpen={!!downloadTarget}
        title="Download Folder"
        itemName={downloadTarget?.name}
        isLoading={downloadFolder.isPending}
        onClose={() => {
          if (!downloadFolder.isPending) setDownloadTarget(null);
        }}
        onWithoutStamp={() => {
          if (!downloadTarget) return;
          downloadFolder.mutate(
            {
              id: downloadTarget.id,
              withStamp: false,
              includeArchived: true,
            },
            { onSettled: () => setDownloadTarget(null) }
          );
        }}
        onWithStamp={() => {
          if (!downloadTarget) return;
          downloadFolder.mutate(
            {
              id: downloadTarget.id,
              withStamp: true,
              includeArchived: true,
            },
            { onSettled: () => setDownloadTarget(null) }
          );
        }}
      />
    </div>
  );
};

export default ArchiveView;
