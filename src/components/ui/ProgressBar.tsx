"use client";

import * as React from "react";

export type ProgressBarSize = "sm" | "md" | "lg" | "xl";
export type ProgressBarVariant = "primary" | "success" | "error" | "warning" | "disabled" | "skeleton" | "progress";

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
  color?: string;
  value?: number;
  showPercentage?: boolean;
  percentageText?: string;
  percentage?: string;
  percentageClassName?: string;
  percentageStyle?: React.CSSProperties;
  detail?: string;
  showDetail?: boolean;
  width?: number | string;
  detailFontSize?: number;
  loading?: boolean;
}

const variantColors: Record<ProgressBarVariant, string> = {
  primary: "#277BC0",
  success: "#00BC7D",
  error: "#FB2C36",
  warning: "#FF6900",
  disabled: "#6A7282",
  skeleton: "#F0F1F3",
  progress: "#F5A524",
};

const sizeHeights: Record<ProgressBarSize, string> = {
  sm: "2px",
  md: "4px",
  lg: "6px",
  xl: "16px",
};

export function ProgressBar({
  size = "sm",
  variant = "primary",
  color,
  value = 80,
  showPercentage = true,
  percentageText,
  percentage,
  percentageClassName = "",
  percentageStyle,
  detail,
  showDetail = true,
  width = 128,
  detailFontSize = 12,
  loading = false,
  className = "",
  style,
  ...props
}: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const isSkeleton = loading || variant === "skeleton";
  const fillColor = color ?? variantColors[variant];
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const displayPercentage = percentage ?? percentageText ?? `${normalizedValue}%`;

  return (
    <div {...props} className={["flex flex-col gap-1", className].filter(Boolean).join(" ")} style={{ width: widthStyle, ...style }}>
      {showPercentage && !isSkeleton && (
        <div className="flex justify-end">
          <span className={percentageClassName} style={{ fontSize: "12px", fontWeight: 500, color: "#606876", ...percentageStyle }}>
            {displayPercentage}
          </span>
        </div>
      )}

      <div
        role={isSkeleton ? undefined : "progressbar"}
        aria-label={props["aria-label"] ?? (isSkeleton ? "Loading" : "Progress")}
        aria-valuemin={isSkeleton ? undefined : 0}
        aria-valuemax={isSkeleton ? undefined : 100}
        aria-valuenow={isSkeleton ? undefined : normalizedValue}
        aria-valuetext={isSkeleton ? undefined : percentage ? `${percentage}, ${normalizedValue}%` : `${normalizedValue}%`}
        aria-busy={isSkeleton ? true : undefined}
        className="w-full overflow-hidden rounded-xl"
        style={{
          height: sizeHeights[size],
          backgroundColor: isSkeleton ? "#F0F1F3" : "#D1D3D8",
        }}
      >
        <div
          className="h-full rounded-xl transition-[width] duration-300 ease-in-out"
          style={{
            width: `${isSkeleton ? 100 : normalizedValue}%`,
            backgroundColor: isSkeleton ? variantColors.skeleton : fillColor,
          }}
        />
      </div>

      {!isSkeleton && showDetail && detail && (
        <div className="font-normal leading-normal text-[#606876]" style={{ fontSize: `${detailFontSize}px` }}>
          {detail}
        </div>
      )}
    </div>
  );
}
