import React from "react";
import { FiAlignJustify, FiInfo, FiList, FiSearch, FiGrid } from "react-icons/fi";
import type { ViewMode } from "../types";

/** Page body: full width with even gutters. */
export const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 md:px-6 py-6 space-y-5">{children}</div>
);

/** Filters on the left, actions on the right. */
export const Toolbar = ({
  children,
  actions,
}: {
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">{children}</div>
    {actions && <div className="flex gap-2 items-center">{actions}</div>}
  </div>
);

/** A white ruled panel, optionally with a title row. */
export const Panel = ({
  title,
  extra,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`bg-white border border-rule rounded-lg overflow-hidden ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between gap-3 px-4 h-12 border-b border-rule">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {extra}
      </div>
    )}
    {children}
  </section>
);

export const SearchBox = ({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <div className={`relative ${className || "w-72 max-w-full"}`}>
    <FiSearch
      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9384] pointer-events-none"
      size={14}
    />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 pl-9 pr-3 rounded-md border border-rule bg-white text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand-dark"
    />
  </div>
);

/** "12 records" or "3 of 12 records" next to the filters. */
export const Count = ({
  shown,
  total,
  noun,
}: {
  shown: number;
  total: number;
  noun: string;
}) => {
  const word = total === 1 && noun.endsWith("s") ? noun.slice(0, -1) : noun;
  return (
    <span className="text-sm text-muted tabular-nums">
      {shown === total ? `${total} ${word}` : `${shown} of ${total} ${noun}`}
    </span>
  );
};

const VIEW_OPTIONS: {
  value: ViewMode;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { value: "list", label: "Table", icon: FiList },
  { value: "grid", label: "Grid", icon: FiGrid },
  { value: "compact", label: "Compact", icon: FiAlignJustify },
];

/** Table / Grid / Compact switch (DL-style). */
export const ViewSwitch = ({
  value,
  onChange,
  views = ["list", "grid", "compact"] as ViewMode[],
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  views?: ViewMode[];
}) => (
  <div
    role="radiogroup"
    aria-label="View"
    className="inline-flex rounded-md border border-rule bg-white p-0.5"
  >
    {VIEW_OPTIONS.filter((v) => views.includes(v.value)).map((v) => {
      const Icon = v.icon;
      const on = value === v.value;
      return (
        <button
          key={v.value}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(v.value)}
          className={`h-8 px-2.5 rounded flex items-center gap-1.5 text-[13px] ${
            on ? "bg-ink text-white" : "text-muted hover:text-ink"
          }`}
        >
          <Icon size={12} aria-hidden="true" />
          <span className="hidden sm:inline">{v.label}</span>
        </button>
      );
    })}
  </div>
);

/** Grid card: title, optional tag, then label/value lines. */
export const Card = ({
  index,
  title,
  subtitle,
  tag,
  lines = [],
  footer,
  onClick,
  size = "md",
}: {
  index?: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tag?: React.ReactNode;
  lines?: ([string, React.ReactNode] | false | null | undefined)[];
  footer?: React.ReactNode;
  onClick?: () => void;
  size?: "sm" | "md";
}) => (
  <article
    onClick={onClick}
    className={`h-full bg-white border border-rule rounded-lg flex flex-col min-w-0 ${
      size === "sm" ? "p-2.5 gap-2" : "p-4 gap-3"
    } ${onClick ? "cursor-pointer hover:border-[#b9b19f]" : ""}`}
  >
    <div className="flex items-start justify-between gap-2">
      {index !== undefined && (
        <span
          className={`shrink-0 rounded-md bg-[#eef3f8] text-brand-dark font-semibold tabular-nums flex items-center justify-center ${
            size === "sm"
              ? "min-w-6 h-6 px-1 text-[11px]"
              : "min-w-7 h-7 px-1.5 text-xs"
          }`}
          aria-label={`Number ${index}`}
        >
          {index}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p
          className={`font-medium truncate text-ink ${
            size === "sm" ? "text-[13px]" : ""
          }`}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted truncate">{subtitle}</p>
        )}
      </div>
      {tag}
    </div>
    {lines.filter(Boolean).length > 0 && (
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
        {lines.filter(Boolean).map((pair) => {
          const [label, value] = pair as [string, React.ReactNode];
          return (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="text-right truncate text-ink">{value}</dd>
            </div>
          );
        })}
      </dl>
    )}
    {footer && <div className="mt-auto pt-1 text-xs text-muted">{footer}</div>}
  </article>
);

/** Dense one-line row for compact view. */
export const CompactRow = ({
  index,
  title,
  subtitle,
  tag,
  lines = [],
  onClick,
}: {
  index?: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tag?: React.ReactNode;
  lines?: ([string, React.ReactNode] | false | null | undefined)[];
  onClick?: () => void;
}) => (
  <li
    onClick={onClick}
    className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 text-[13px] min-w-0 ${
      onClick ? "cursor-pointer hover:bg-[#f8f7f3]" : ""
    }`}
  >
    {index !== undefined && (
      <span className="w-6 sm:w-8 shrink-0 text-right tabular-nums text-muted">
        {index}
      </span>
    )}
    <span className="min-w-0 flex-1 md:flex-none md:w-56 md:shrink-0">
      <span className="block font-medium truncate text-ink">{title}</span>
      {subtitle && (
        <span className="block text-xs text-muted truncate">{subtitle}</span>
      )}
    </span>
    <span className="hidden md:flex flex-1 min-w-0 flex-wrap gap-x-5 gap-y-0.5 text-muted">
      {lines.filter(Boolean).map((pair) => {
        const [label, value] = pair as [string, React.ReactNode];
        return (
          <span key={label} className="truncate">
            {label} <span className="text-ink">{value}</span>
          </span>
        );
      })}
    </span>
    {tag && <span className="shrink-0">{tag}</span>}
  </li>
);

export const InfoTip = ({ text }: { text: string }) => (
  <span title={text} className="text-muted hover:text-ink align-middle inline-flex">
    <FiInfo size={13} />
  </span>
);
