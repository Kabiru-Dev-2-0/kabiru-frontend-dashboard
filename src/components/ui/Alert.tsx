"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { CircleCheck, CircleX, TriangleAlert, CircleHelp, X } from "lucide-react";

export type AlertVariant = "success" | "fail" | "warning" | "help";

type AlertProps = {
  variant?: AlertVariant;
  title: string;
  description?: string;
  dismissible?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  width?: CSSProperties["width"];
  minHeight?: CSSProperties["minHeight"];
  padding?: CSSProperties["padding"];
  gap?: CSSProperties["gap"];
  iconSize?: number;
  titleSize?: number;
  descriptionSize?: number;
  borderWidth?: number;
  borderRadius?: CSSProperties["borderRadius"];
  className?: string;
};

const alertVariants = {
  success: {
    backgroundColor: "#E6F8F2",
    textColor: "#008559",
    borderColor: "#008559",
    role: "status" as const,
    Icon: CircleCheck,
  },
  fail: {
    backgroundColor: "#FFEAEB",
    textColor: "#B21F26",
    borderColor: "#B21F26",
    role: "alert" as const,
    Icon: CircleX,
  },
  warning: {
    backgroundColor: "#FFF7E6",
    textColor: "#B57E00",
    borderColor: "#B57E00",
    role: "alert" as const,
    Icon: TriangleAlert,
  },
  help: {
    backgroundColor: "#E9F2F9",
    textColor: "#1C5788",
    borderColor: "#1C5788",
    role: "status" as const,
    Icon: CircleHelp,
  },
};

export function Alert({
  variant = "success",
  title,
  description,
  dismissible = true,
  onClose,
  icon,
  backgroundColor,
  textColor,
  borderColor,
  width = "100%",
  minHeight = "62.118px",
  padding = "12px 16px",
  gap = "12px",
  iconSize = 28,
  titleSize = 15,
  descriptionSize = 12,
  borderWidth = 1,
  borderRadius = "12px",
  className = "",
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  const config = alertVariants[variant];
  const DefaultIcon = config.Icon;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) {
    return null;
  }

  const resolvedTextColor = textColor ?? config.textColor;

  const alertStyle: CSSProperties = {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    gap,
    width,
    minHeight,
    padding,
    backgroundColor: backgroundColor ?? config.backgroundColor,
    color: resolvedTextColor,
    border: `${borderWidth}px solid ${borderColor ?? config.borderColor}`,
    borderRadius,
    fontFamily: "inherit",
  };

  return (
    <div role={config.role} className={`max-w-full ${className}`} style={alertStyle}>
      <span className="flex shrink-0 items-center justify-center" style={{ width: iconSize, height: iconSize }} aria-hidden="true">
        {icon ?? <DefaultIcon size={iconSize} strokeWidth={1.8} />}
      </span>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center" style={{ gap: "2px", minHeight: iconSize }}>
        <p className="m-0 font-semibold" style={{ fontSize: titleSize, lineHeight: "normal", overflowWrap: "anywhere" }}>
          {title}
        </p>

        {description && (
          <p className="m-0 font-normal" style={{ fontSize: descriptionSize, lineHeight: 1.5, overflowWrap: "anywhere" }}>
            {description}
          </p>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Tutup peringatan"
          onClick={handleClose}
          className="mt-1 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: resolvedTextColor }}
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
