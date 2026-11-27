import React, { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { useActivityAuditLogs } from "../hooks/useFiles";
import type { ActivityAuditLog, User } from "../types";
import DataTable, { type DataColumn } from "./DataTable";
import { Count, SearchBox, Toolbar } from "./ui";

interface AuditLogsViewProps {
  user: User;
}

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  login_failed: "Login Failed",
  logout: "Logout",
  download: "Download",
  delete_file: "Delete File",
  delete_folder: "Delete Folder",
  permanent_delete: "Permanent Delete",
  upload: "Upload",
  create_folder: "Create Folder",
  create_user: "Create User",
  archive: "Archive",
  restore: "Restore",
  rename: "Rename",
  edit: "Edit",
  move: "Move",
  open: "Open",
  permission: "Permission",
};

const ACTION_OPTIONS = [
  "login",
  "login_failed",
  "logout",
  "download",
  "upload",
  "open",
  "edit",
  "rename",
  "move",
  "create_folder",
  "delete_file",
  "delete_folder",
  "permanent_delete",
  "archive",
  "restore",
  "permission",
  "create_user",
];

const badgeClass = (action: string, status: string) => {
  if (status === "failed" || action.includes("failed")) {
    return "bg-[#fdecea] text-[#b42318] border-[#f5c2c0]";
  }
  if (action.includes("delete")) {
    return "bg-[#fff4e5] text-[#b54708] border-[#f9dbaf]";
  }
  if (action.includes("login")) {
    return "bg-[#e8f5ef] text-[#1f7a5a] border-[#b7e0cb]";
  }
  if (action.includes("download") || action.includes("open")) {
    return "bg-[#eaf2fb] text-brand-dark border-[#c5d9ef]";
  }
  return "bg-[#f3f1ea] text-ink border-rule";
};

const when = (iso: string) =>
  iso ? new Date(iso).toLocaleString() : "—";

const PAGE_SIZE = 10;
const ALL_ROWS = 2000;

const AuditLogsView: React.FC<AuditLogsViewProps> = ({ user }) => {
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const filters = useMemo(
    () => ({
      action: actionFilter || undefined,
      username: q || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [actionFilter, q, page, pageSize]
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useActivityAuditLogs(filters);

  if (user.role !== "super_admin") {
    return (
      <div className="bg-white border border-rule rounded-lg p-10 text-center text-muted">
        Super Admin access required to view audit logs.
      </div>
    );
  }

  const logs = data?.logs || [];
  const total = data?.total ?? 0;

  const actionLabel = (a: string) => ACTION_LABELS[a] || a.replace(/_/g, " ");

  const actionTag = (log: ActivityAuditLog) => (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border m-0 ${badgeClass(
        log.action,
        log.status
      )}`}
    >
      {actionLabel(log.action)}
    </span>
  );

  const recordOf = (log: ActivityAuditLog) => {
    if (!log.resource_type && !log.resource_name) return "—";
    const type = log.resource_type || "record";
    return `${type}${log.resource_id != null ? ` #${log.resource_id}` : ""}`;
  };

  const columns: DataColumn<ActivityAuditLog>[] = [
    {
      key: "created_at",
      title: "Date & time",
      width: 200,
      dataIndex: "created_at",
      render: (r) => (
        <span className="whitespace-nowrap">{when(r.created_at)}</span>
      ),
    },
    {
      key: "username",
      title: "Name",
      dataIndex: "username",
      render: (r) => <span className="font-medium">{r.username}</span>,
    },
    {
      key: "action",
      title: "Action",
      dataIndex: "action",
      sortValue: (r) => actionLabel(r.action),
      render: (r) => actionTag(r),
    },
    {
      key: "resource",
      title: "Record",
      sortValue: recordOf,
      render: (r) => (
        <span className="whitespace-nowrap" title={r.resource_name || ""}>
          {r.resource_name ? (
            <>
              <span className="font-medium">{r.resource_name}</span>
              <span className="text-muted text-xs ml-1">({recordOf(r)})</span>
            </>
          ) : (
            recordOf(r)
          )}
        </span>
      ),
    },
    {
      key: "details",
      title: "Details",
      width: 280,
      className: "wrap",
      dataIndex: "details",
      render: (r) => (
        <span className="text-muted text-[13px]" title={r.details || ""}>
          {r.details || "—"}
        </span>
      ),
    },
    {
      key: "ip_address",
      title: "Network IP",
      width: 130,
      dataIndex: "ip_address",
      render: (r) => (
        <span className="tabular-nums text-muted" title="Wi‑Fi / connection IP">
          {r.ip_address || "—"}
        </span>
      ),
    },
    {
      key: "device_ip",
      title: "Device IP",
      width: 130,
      sortValue: (r) => r.device_ip || "",
      render: (r) => (
        <span
          className="tabular-nums text-muted"
          title="Device LAN IP where the browser is running"
        >
          {r.device_ip || "—"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (r) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
            r.status === "failed"
              ? "bg-[#fdecea] text-[#b42318]"
              : "bg-[#e8f5ef] text-[#1f7a5a]"
          }`}
        >
          {r.status || "success"}
        </span>
      ),
    },
  ];

  const serverPage = {
    current: page,
    pageSize,
    total,
    onChange: setPage,
    allSize: ALL_ROWS,
    onSizeChange: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };

  let body: React.ReactNode;
  if (isLoading && !logs.length) {
    body = (
      <div className="bg-white border border-rule rounded-lg py-16 text-center text-sm text-muted">
        Loading audit logs…
      </div>
    );
  } else if (isError) {
    body = (
      <div className="bg-white border border-rule rounded-lg py-16 text-center text-red-600 flex flex-col items-center gap-2">
        <FiAlertCircle size={22} />
        Failed to load audit logs. Run migrations if this is a new table.
      </div>
    );
  } else {
    body = (
      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={logs}
        loading={isLoading || isFetching}
        serverPage={serverPage}
        emptyText="No activity recorded yet. New logins and actions will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 min-w-0">
      <Toolbar
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            className="h-8 px-3 rounded-md border border-rule bg-white text-[13px] text-ink inline-flex items-center gap-1.5 hover:border-brand-dark"
          >
            <FiRefreshCw
              size={13}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
      >
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search name, action or details"
        />
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 w-40 rounded-md border border-rule bg-white px-2 text-sm text-ink"
          aria-label="Filter by action"
        >
          <option value="">All actions</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] || a}
            </option>
          ))}
        </select>
        <Count shown={total} total={total} noun="records" />
      </Toolbar>
      {body}
    </div>
  );
};

export default AuditLogsView;
