import React from "react";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { useDownloadAuditLogs } from "../hooks/useFiles";
import type { User } from "../types";

interface DownloadAuditViewProps {
  user: User;
}

const DownloadAuditView: React.FC<DownloadAuditViewProps> = ({ user }) => {
  const { data, isLoading, isError, refetch, isFetching } = useDownloadAuditLogs();

  if (user.role !== "super_admin") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Super Admin access required to view download activity logs.
      </div>
    );
  }

  const logs = data?.logs || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiDownload className="text-blue-600" />
            Download Activity Log
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Who downloaded which document, and when ({data?.total ?? 0} total)
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <FiRefreshCw className={isFetching ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs…</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Failed to load download activity logs.
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No download activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">
                    User Name
                  </th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">
                    Document Name
                  </th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">
                    Document Status
                  </th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">
                    Download Date
                  </th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">
                    Download Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const when = new Date(log.downloaded_at);
                  const isObsolete =
                    String(log.document_status || "").toLowerCase() ===
                    "obsolete";
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 hover:bg-gray-50/80"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {log.username}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {log.document_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            isObsolete
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isObsolete ? "Obsolete" : "Controlled"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {when.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {when.toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadAuditView;
