"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type BreadcrumbBackground = "transparent" | "white" | "primary" | "success" | "error" | "warning" | "disabled" | "gray-50" | "gray-100" | "gray-200";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface BreadcrumbsProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  items: BreadcrumbItem[];
  showIcons?: boolean;
  withBackground?: boolean;
  highlightCurrentBackground?: boolean;
  background?: BreadcrumbBackground;
  currentBackground?: BreadcrumbBackground;
}

const backgroundColors: Record<BreadcrumbBackground, string> = {
  transparent: "transparent",
  white: "#FFFFFF",
  primary: "#277BC0",
  success: "#00BC7D",
  error: "#FB2C36",
  warning: "#FF6900",
  disabled: "#6A7282",
  "gray-50": "#F0F1F3",
  "gray-100": "#D1D3D8",
  "gray-200": "#E5E5E5",
};

export function Breadcrumbs({
  items,
  showIcons = false,
  withBackground = false,
  highlightCurrentBackground = false,
  background = "white",
  currentBackground = "gray-200",
  className = "",
  ...props
}: BreadcrumbsProps) {
  return (
    <nav {...props} aria-label="Breadcrumb" className={className}>
      <ol className="m-0 flex list-none items-center gap-[6px] p-0">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const Icon = item.icon;

          const crumbClassName = [
            "inline-flex items-center gap-1 whitespace-nowrap rounded-lg",
            "font-sans text-xs font-medium leading-[1.5]",
            "no-underline outline-offset-2",
            "focus-visible:outline-2 focus-visible:outline-[#277BC0]",
            isCurrent ? "text-[#277BC0]" : "text-[#888E9B] hover:text-[#3A3F48]",
            withBackground ? "px-2.5 py-1" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const crumbStyle: React.CSSProperties = {
            backgroundColor: withBackground ? (highlightCurrentBackground && isCurrent ? backgroundColors[currentBackground] : backgroundColors[background]) : "transparent",
          };

          const content = (
            <>
              {showIcons && Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />}
              <span>{item.label}</span>
            </>
          );

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-[6px]">
              {index > 0 && (
                <span aria-hidden="true" className="text-xs font-medium leading-[1.5] text-[#888E9B]">
                  /
                </span>
              )}

              {item.href && !isCurrent ? (
                <Link href={item.href} className={crumbClassName} style={crumbStyle}>
                  {content}
                </Link>
              ) : (
                <span className={crumbClassName} style={crumbStyle} aria-current={isCurrent ? "page" : undefined}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
