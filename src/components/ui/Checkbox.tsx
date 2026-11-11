"use client";

import * as React from "react";
import { Check, Minus, LoaderCircle } from "lucide-react";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxVariant = "primary" | "success" | "error" | "warning" | "disabled";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: CheckboxSize;
  variant?: CheckboxVariant;
}

const sizeStyles: Record<CheckboxSize, { size: number; border: number; radius: number; icon: number }> = {
  sm: { size: 12, border: 1, radius: 4, icon: 8 },
  md: { size: 16, border: 1.333, radius: 5.333, icon: 10 },
  lg: { size: 20, border: 1.667, radius: 6.667, icon: 12 },
};

const variantColors: Record<CheckboxVariant, { background: string; border: string }> = {
  primary: { background: "#277BC0", border: "#5295CD" },
  success: { background: "#00BC7D", border: "#33C997" },
  error: { background: "#FB2C36", border: "#FC565E" },
  warning: { background: "#FF6900", border: "#FF8733" },
  disabled: { background: "#6A7282", border: "#888E9B" },
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size = "md", variant = "primary", checked, defaultChecked, disabled = false, className = "", onChange, ...props }, ref) => {
    const dimensions = sizeStyles[size];
    const colors = variantColors[variant];
    const isDisabled = disabled || variant === "disabled";

    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isChecked = checked ?? internalChecked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setInternalChecked(event.target.checked);
      }
      onChange?.(event);
    };

    const Icon = variant === "error" || variant === "disabled" ? Minus : variant === "warning" ? LoaderCircle : Check;

    return (
      <label
        className={["relative inline-flex shrink-0 items-center justify-center", isDisabled ? "cursor-not-allowed" : "cursor-pointer", className].filter(Boolean).join(" ")}
        style={{ width: dimensions.size, height: dimensions.size }}
      >
        <input
          {...props}
          ref={ref}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-inherit opacity-0 disabled:cursor-not-allowed"
        />

        <span
          aria-hidden="true"
          className={[
            "box-border inline-flex shrink-0 items-center justify-center transition-colors duration-100",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#5295CD]",
            isDisabled ? "opacity-70" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            width: dimensions.size,
            height: dimensions.size,
            border: `${dimensions.border}px solid ${isChecked ? colors.border : "#BABEC6"}`,
            borderRadius: dimensions.radius,
            backgroundColor: isChecked ? colors.background : "#FFFFFF",
          }}
        >
          {isChecked && <Icon size={dimensions.icon} color="#FFFFFF" strokeWidth={2.5} />}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
