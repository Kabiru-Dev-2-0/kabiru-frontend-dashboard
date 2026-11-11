import type { CSSProperties, ReactNode } from "react";

export type BadgeColor =
  | "primary"
  | "primary-outline"
  | "accent"
  | "accent-outline"
  | "success"
  | "success-outline"
  | "error"
  | "error-outline"
  | "warning"
  | "warning-outline"
  | "disabled"
  | "disabled-outline";

export type BadgeSize = "sm" | "md" | "lg";

type BadgeProps = {
  children: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  borderRadius?: CSSProperties["borderRadius"];
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  borderWidth?: number;
  className?: string;
};

const badgeColors = {
  primary: "#277BC0",
  accent: "#3674B5",
  success: "#00BC7D",
  error: "#FB2C36",
  warning: "#FF6900",
  disabled: "#6A7282",
} as const;

const badgeSizes: Record<BadgeSize, { fontSize: number; paddingX: number; paddingY: number }> = {
  sm: { fontSize: 10, paddingX: 8, paddingY: 3 },
  md: { fontSize: 12, paddingX: 10, paddingY: 4 },
  lg: { fontSize: 14, paddingX: 12, paddingY: 6 },
};

export function Badge({
  children,
  color = "primary",
  size = "md",
  borderRadius = "9999px",
  backgroundColor,
  textColor,
  borderColor,
  fontSize,
  paddingX,
  paddingY,
  borderWidth = 1,
  className = "",
}: BadgeProps) {
  const isOutline = color.endsWith("-outline");
  const colorName = isOutline ? color.replace("-outline", "") : color;
  const baseColor = badgeColors[colorName as keyof typeof badgeColors];
  const dimensions = badgeSizes[size];

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    width: "fit-content",
    maxWidth: "100%",
    borderStyle: "solid",
    borderWidth,
    borderRadius,
    backgroundColor: backgroundColor ?? (isOutline ? "transparent" : baseColor),
    color: textColor ?? (isOutline ? baseColor : "#FFFFFF"),
    borderColor: borderColor ?? baseColor,
    fontSize: fontSize ?? dimensions.fontSize,
    padding: `${paddingY ?? dimensions.paddingY}px ${paddingX ?? dimensions.paddingX}px`,
    lineHeight: 1.5,
    fontWeight: 500,
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  };

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
