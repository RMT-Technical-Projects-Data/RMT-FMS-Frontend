import React from "react";
import { FiArchive } from "react-icons/fi";
import FileList from "./FileList";
import { useArchivedFiles } from "../hooks/useFiles";
import type { User } from "../types";

interface ArchiveViewProps {
  user: User;
  onAssignPermission: (resourceId: number, resourceType: "folder" | "file") => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({
  user,
  onAssignPermission,
}) => {
  const { data: archivedFiles, isLoading, isError } = useArchivedFiles();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
          <FiArchive size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Archive</h2>
          <p className="text-sm text-gray-500">
            Archived documents show an OBSOLETE stamp only.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading archived documents…
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-500">
          Failed to load archived documents.
        </div>
      ) : (
        <FileList
          files={archivedFiles || []}
          onAssignPermission={onAssignPermission}
          userRole={user.role}
          userId={user.id}
          isArchiveView={true}
        />
      )}
    </div>
  );
};

export default ArchiveView;
