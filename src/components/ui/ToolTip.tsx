"use client";

import type { CSSProperties, ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipTheme = "default" | "light";
export type TooltipSize = "big" | "small";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: TooltipPlacement;
  theme?: TooltipTheme;
  size?: TooltipSize;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 mb-0 -translate-x-1/2 flex-col",
  bottom: "top-full left-1/2 mt-0 -translate-x-1/2 flex-col",
  left: "right-full top-1/2 mr-0 -translate-y-1/2 flex-row",
  right: "left-full top-1/2 ml-0 -translate-y-1/2 flex-row",
};

const arrowStyles: Record<TooltipPlacement, CSSProperties> = {
  top: { borderWidth: "8px 8px 0", borderTopColor: "var(--tooltip-bg)" },
  bottom: { borderWidth: "0 8px 8px", borderBottomColor: "var(--tooltip-bg)" },
  left: { borderWidth: "8px 0 8px 8px", borderLeftColor: "var(--tooltip-bg)" },
  right: { borderWidth: "8px 8px 8px 0", borderRightColor: "var(--tooltip-bg)" },
};

const themeClasses: Record<TooltipTheme, string> = {
  default: "[--tooltip-bg:#277BC0] [--tooltip-fg:#FFFFFF]",
  light: "[--tooltip-bg:#FFFFFF] [--tooltip-fg:#277BC0] drop-shadow-[0_8px_8px_rgba(27,33,44,0.12)]",
};

const sizeClasses: Record<TooltipSize, string> = {
  big: "w-[320px] max-w-[calc(100vw-32px)]",
  small: "w-max max-w-[calc(100vw-32px)]",
};

export default function Tooltip({
  children,
  content,
  placement = "top",
  theme = "default",
  size = "small",
  className = "",
  contentClassName = "",
  disabled = false,
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <span className={`group/tooltip relative inline-flex w-fit align-middle ${className}`}>
      {children}

      <span
        role="tooltip"
        className={[
          "pointer-events-none absolute z-50 flex items-center",
          "invisible opacity-0 transition-opacity duration-150",
          "group-hover/tooltip:visible group-hover/tooltip:opacity-100",
          "group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100",
          placementClasses[placement],
          themeClasses[theme],
          sizeClasses[size],
        ].join(" ")}
      >
        {placement === "bottom" || placement === "right" ? (
          <span aria-hidden="true" className="h-0 w-0 shrink-0 border-solid border-transparent" style={arrowStyles[placement]} />
        ) : null}

        <span
          className={[
            "box-border rounded-lg bg-[var(--tooltip-bg)] px-3 py-2 text-center font-sans text-xs font-normal leading-[1.5] text-[var(--tooltip-fg)]",
            size === "big" && (placement === "top" || placement === "bottom") ? "w-full" : "",
            size === "big" && (placement === "left" || placement === "right") ? "min-w-0 flex-1" : "",
            size === "small" ? "whitespace-nowrap" : "",
            contentClassName,
          ].join(" ")}
        >
          {content}
        </span>

        {placement === "top" || placement === "left" ? (
          <span aria-hidden="true" className="h-0 w-0 shrink-0 border-solid border-transparent" style={arrowStyles[placement]} />
        ) : null}
      </span>
    </span>
  );
}
