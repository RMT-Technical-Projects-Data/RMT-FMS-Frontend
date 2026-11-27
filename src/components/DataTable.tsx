import React, { useMemo, useState } from "react";

const ALL = 0;
const SIZE_OPTIONS = [10, 20, 30, 50, ALL];

export type DataColumn<T> = {
  key: string;
  title: React.ReactNode;
  width?: number | string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
  /** When no render, read this field from the row */
  dataIndex?: keyof T | string;
};

type ServerPage = {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  allSize?: number;
};

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});
const isEmpty = (v: unknown) =>
  v === null || v === undefined || v === "" || v === "—" || v === "-";

function compare(a: unknown, b: unknown) {
  if (isEmpty(a) && isEmpty(b)) return 0;
  if (isEmpty(a)) return 1;
  if (isEmpty(b)) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" || typeof b === "boolean")
    return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

function valueAt<T>(row: T, dataIndex?: keyof T | string) {
  if (dataIndex == null) return undefined;
  return (row as Record<string, unknown>)[dataIndex as string];
}

/** Show [10] entries · ‹ Page [3] of 26 › */
export function Pager({
  current,
  size,
  sizeValue,
  total,
  onPage,
  onSize,
}: {
  current: number;
  size: number;
  sizeValue: number;
  total: number;
  onPage: (page: number) => void;
  onSize: (sizeValue: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(size, 1)));
  const arrow =
    "h-8 w-8 rounded-md border border-rule bg-white flex items-center justify-center text-ink hover:border-brand-dark disabled:opacity-40 disabled:hover:border-rule";

  return (
    <div className="edms-pager flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[13px]">
      <span className="flex items-center gap-2 whitespace-nowrap text-muted">
        Show
        <select
          aria-label="Entries per page"
          value={sizeValue}
          onChange={(e) => onSize(Number(e.target.value))}
          className="h-8 w-[74px] rounded-md border border-rule bg-white px-2 text-ink"
        >
          {SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n === ALL ? "All" : n}
            </option>
          ))}
        </select>
        entries
      </span>
      <span className="flex items-center gap-2 whitespace-nowrap text-muted">
        <button
          type="button"
          className={arrow}
          disabled={current <= 1}
          onClick={() => onPage(current - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        Page
        <select
          aria-label="Page"
          value={current}
          onChange={(e) => onPage(Number(e.target.value))}
          className="h-8 min-w-[72px] rounded-md border border-rule bg-white px-2 text-ink"
        >
          {Array.from({ length: pages }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        of {pages}
        <button
          type="button"
          className={arrow}
          disabled={current >= pages}
          onClick={() => onPage(current + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </span>
    </div>
  );
}

export const ServerPager = ({ serverPage }: { serverPage: ServerPage }) => {
  const allSize = serverPage.allSize || Infinity;
  return (
    <div className="bg-white border border-rule rounded-lg overflow-clip">
      <Pager
        current={serverPage.current}
        size={serverPage.pageSize}
        sizeValue={
          serverPage.pageSize >= allSize ? ALL : serverPage.pageSize
        }
        total={serverPage.total}
        onPage={serverPage.onChange}
        onSize={(v) =>
          serverPage.onSizeChange?.(v === ALL ? allSize : v)
        }
      />
    </div>
  );
};

type DataTableProps<T> = {
  columns: DataColumn<T>[];
  dataSource: T[];
  rowKey: keyof T | ((row: T) => string | number);
  pageSize?: number;
  serverPage?: ServerPage;
  pagination?: boolean;
  serial?: boolean;
  loading?: boolean;
  bare?: boolean;
  className?: string;
  emptyText?: string;
};

/**
 * Panel table with Sr. No., sortable columns, and DL-style pager.
 * Fonts are inherited from EDMS (not overridden).
 */
export default function DataTable<T>({
  columns,
  dataSource,
  rowKey,
  pageSize = 10,
  serverPage,
  pagination = true,
  serial = true,
  loading,
  bare,
  className = "",
  emptyText = "Nothing to show.",
}: DataTableProps<T>) {
  const [page, setPage] = useState({ current: 1, pageSize });
  const [sort, setSort] = useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(null);

  const rowCount = dataSource.length;
  const current = serverPage?.current ?? page.current;
  const size =
    serverPage?.pageSize ??
    (page.pageSize === ALL ? Math.max(rowCount, 1) : page.pageSize);
  const paged = pagination !== false;

  const sorted = useMemo(() => {
    if (!sort || serverPage) return dataSource;
    const col = columns.find((c) => c.key === sort.key);
    if (!col || col.sortable === false) return dataSource;
    const get =
      col.sortValue ||
      ((row: T) => valueAt(row, col.dataIndex ?? (col.key as keyof T)));
    const copy = [...dataSource];
    copy.sort((a, b) => {
      const cmp = compare(get(a), get(b));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [columns, dataSource, sort, serverPage]);

  const pageRows = useMemo(() => {
    if (!paged || serverPage) return sorted;
    const start = (current - 1) * size;
    return sorted.slice(start, start + size);
  }, [sorted, paged, serverPage, current, size]);

  const getKey = (row: T, index: number) => {
    if (typeof rowKey === "function") return rowKey(row);
    const v = row[rowKey];
    return (v as string | number) ?? index;
  };

  const toggleSort = (col: DataColumn<T>) => {
    if (col.sortable === false || serverPage) return;
    const canSort = Boolean(
      col.sortValue || col.dataIndex !== undefined || col.key
    );
    if (!canSort) return;
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc") return { key: col.key, dir: "desc" };
      return null;
    });
    if (!serverPage) setPage((p) => ({ ...p, current: 1 }));
  };

  const pager = !paged ? null : serverPage ? (
    <Pager
      current={serverPage.current}
      size={serverPage.pageSize}
      sizeValue={
        serverPage.pageSize >= (serverPage.allSize || Infinity)
          ? ALL
          : serverPage.pageSize
      }
      total={serverPage.total}
      onPage={serverPage.onChange}
      onSize={(v) =>
        serverPage.onSizeChange?.(
          v === ALL ? serverPage.allSize || rowCount : v
        )
      }
    />
  ) : (
    <Pager
      current={current}
      size={size}
      sizeValue={page.pageSize}
      total={rowCount}
      onPage={(c) => setPage((p) => ({ ...p, current: c }))}
      onSize={(v) => setPage({ current: 1, pageSize: v })}
    />
  );

  const table = (
    <>
      <div className={bare ? "overflow-x-auto" : "edms-scroll"}>
        {loading && pageRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">Loading…</div>
        ) : pageRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{emptyText}</div>
        ) : (
          <table className="edms-table">
            <thead>
              <tr>
                {serial && (
                  <th style={{ width: 84 }} className="text-right">
                    Sr. No.
                  </th>
                )}
                {columns.map((col) => {
                  const active = sort?.key === col.key;
                  const canSort =
                    !serverPage &&
                    col.sortable !== false &&
                    (col.sortValue ||
                      col.dataIndex !== undefined ||
                      Boolean(col.title));
                  return (
                    <th
                      key={col.key}
                      style={{
                        width: col.width,
                        textAlign: col.align || "left",
                      }}
                      className={col.className}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col)}
                          className="inline-flex items-center gap-1 hover:text-ink"
                        >
                          {col.title}
                          <span className="text-[10px] text-muted">
                            {active ? (sort?.dir === "asc" ? "▲" : "▼") : "↕"}
                          </span>
                        </button>
                      ) : (
                        col.title
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr key={getKey(row, index)}>
                  {serial && (
                    <td className="text-right tabular-nums text-muted">
                      {(paged ? (current - 1) * size : 0) + index + 1}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align || "left" }}
                      className={col.className}
                    >
                      {col.render
                        ? col.render(row, index)
                        : String(
                            valueAt(row, col.dataIndex ?? (col.key as keyof T)) ??
                              "—"
                          )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {pager}
    </>
  );

  return bare ? (
    table
  ) : (
    <div
      className={`bg-white border border-rule rounded-lg overflow-clip ${className}`}
    >
      {table}
    </div>
  );
}
