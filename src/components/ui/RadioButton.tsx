"use client";

import * as React from "react";

export type RadioButtonSize = "sm" | "md" | "lg";
export type RadioButtonVariant = "primary" | "success" | "error" | "warning" | "disabled";

export interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: RadioButtonSize;
  variant?: RadioButtonVariant;
}

const sizeStyles: Record<RadioButtonSize, { size: number; border: number; dot: number }> = {
  sm: { size: 12, border: 1, dot: 6 },
  md: { size: 16, border: 1.333, dot: 8 },
  lg: { size: 20, border: 1.667, dot: 10 },
};

const variantColors: Record<RadioButtonVariant, { default: string; active: string }> = {
  primary: { default: "#277BC0", active: "#5295CD" },
  success: { default: "#00BC7D", active: "#33C997" },
  error: { default: "#FB2C36", active: "#FC565E" },
  warning: { default: "#FF6900", active: "#FF8733" },
  disabled: { default: "#6A7282", active: "#888E9B" },
};

export const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ size = "md", variant = "primary", checked, defaultChecked = false, disabled = false, className = "", onChange, ...props }, ref) => {
    const dimensions = sizeStyles[size];
    const colors = variantColors[variant];
    const isDisabled = disabled || variant === "disabled";

    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(event.target.checked);
      }
      onChange?.(event);
    };

    return (
      <label
        className={["relative inline-flex shrink-0 items-center justify-center", isDisabled ? "cursor-not-allowed" : "cursor-pointer", className].filter(Boolean).join(" ")}
        style={{ width: dimensions.size, height: dimensions.size }}
      >
        <input
          {...props}
          ref={ref}
          type="radio"
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className={["peer absolute inset-0 z-10 m-0 h-full w-full opacity-0", isDisabled ? "cursor-not-allowed" : "cursor-pointer"].join(" ")}
        />

        <span
          aria-hidden="true"
          className={[
            "box-border inline-flex shrink-0 items-center justify-center rounded-full bg-white transition-colors duration-100",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#5295CD]",
            isDisabled ? "opacity-70" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            width: dimensions.size,
            height: dimensions.size,
            border: `${dimensions.border}px solid ${isChecked ? colors.active : "#BABEC6"}`,
          }}
        >
          {isChecked && <span className="block rounded-full" style={{ width: dimensions.dot, height: dimensions.dot, backgroundColor: colors.default }} />}
        </span>
      </label>
    );
  },
);

RadioButton.displayName = "RadioButton";
