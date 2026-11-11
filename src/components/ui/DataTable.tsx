"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TableRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface DataTableColumn<T> {
  key: keyof T;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  rowHeader?: boolean;
  icon?: LucideIcon | null;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  background?: string;
  headingBackground?: string;
  rowBackground?: string;
  rowHoverBackground?: string;
  borderColor?: string;
  headingTextColor?: string;
  rowHeadingTextColor?: string;
  bodyTextColor?: string;
  borderRadius?: TableRadius;
  minWidth?: string | number;
  cellPaddingX?: number;
  cellPaddingY?: number;
  headingHeight?: number;
  rowHeight?: number;
  fontSize?: number;
  iconSize?: number;
  showHeaderIcons?: boolean;
  headerIcon?: LucideIcon;
  onSort?: (key: keyof T) => void;
  caption?: string;
  emptyMessage?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  headingClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
}

const radiusValues: Record<TableRadius, string> = {
  none: "0",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
};

export function DataTable<T extends object>({
  columns,
  data,
  background = "#FFFFFF",
  headingBackground = "#F0F1F3",
  rowBackground = "#FFFFFF",
  rowHoverBackground = "#F8FAFC",
  borderColor = "#E5E7EB",
  headingTextColor = "#606876",
  rowHeadingTextColor = "#3A3F48",
  bodyTextColor = "#606876",
  borderRadius = "lg",
  minWidth = "640px",
  cellPaddingX = 24,
  cellPaddingY = 12,
  headingHeight = 44,
  rowHeight = 44,
  fontSize = 12,
  iconSize = 15,
  showHeaderIcons = false,
  headerIcon: HeaderIcon = ArrowDown,
  onSort,
  caption,
  emptyMessage = "Tidak ada data.",
  className = "",
  tableClassName = "",
  headingClassName = "",
  rowClassName = "",
  cellClassName = "",
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  return (
    <div
      className={["w-full overflow-x-auto border border-[#BABEC6]", className].filter(Boolean).join(" ")}
      style={{
        backgroundColor: background,
        borderRadius: radiusValues[borderRadius],
      }}
    >
      <table
        className={["w-full border-collapse text-left", tableClassName].filter(Boolean).join(" ")}
        style={{
          minWidth,
          tableLayout: "fixed",
          fontSize,
          fontFamily: "var(--font-family-sans, Sora, system-ui, sans-serif)",
        }}
      >
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead>
          <tr>
            {columns.map((column) => {
              const Icon = column.icon === undefined ? HeaderIcon : column.icon;
              const showIcon = column.icon === null ? false : column.sortable ? true : showHeaderIcons && Boolean(Icon);

              return (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={["font-semibold leading-normal", headingClassName, column.className ?? ""].filter(Boolean).join(" ")}
                  style={{
                    height: headingHeight,
                    padding: `${cellPaddingY}px ${cellPaddingX}px`,
                    backgroundColor: headingBackground,
                    color: headingTextColor,
                    borderBottom: `1px solid ${borderColor}`,
                    textAlign: column.align ?? "left",
                    verticalAlign: "middle",
                    whiteSpace: "nowrap",
                    width: column.width,
                  }}
                >
                  {column.sortable && onSort ? (
                    <button type="button" onClick={() => onSort(column.key)} className="inline-flex cursor-pointer items-center gap-1 text-inherit">
                      <span>{column.header}</span>
                      {showIcon && Icon && <Icon aria-hidden="true" size={iconSize} className="shrink-0" />}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span>{column.header}</span>
                      {showIcon && Icon && <Icon aria-hidden="true" size={iconSize} className="shrink-0" />}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={Math.max(columns.length, 1)}
                className="text-center"
                style={{
                  padding: `${cellPaddingY * 2}px ${cellPaddingX}px`,
                  color: bodyTextColor,
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowClassName}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  backgroundColor: hoveredRow === rowIndex && rowHoverBackground ? rowHoverBackground : rowBackground,
                }}
              >
                {columns.map((column) => {
                  const content = column.render ? column.render(row, rowIndex) : (row[column.key] as React.ReactNode);
                  const isRowHeader = column.rowHeader ?? false;

                  const sharedStyle: React.CSSProperties = {
                    height: rowHeight,
                    padding: `${cellPaddingY}px ${cellPaddingX}px`,
                    borderBottom: rowIndex === data.length - 1 ? "none" : `1px solid ${borderColor}`,
                    textAlign: column.align ?? "left",
                    verticalAlign: "middle",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: isRowHeader ? rowHeadingTextColor : bodyTextColor,
                    fontWeight: isRowHeader ? 500 : 400,
                    lineHeight: isRowHeader ? "normal" : 1.5,
                    width: column.width,
                  };

                  return isRowHeader ? (
                    <th key={String(column.key)} scope="row" className={[cellClassName, column.className ?? ""].filter(Boolean).join(" ")} style={sharedStyle}>
                      {content}
                    </th>
                  ) : (
                    <td key={String(column.key)} className={[cellClassName, column.className ?? ""].filter(Boolean).join(" ")} style={sharedStyle}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
