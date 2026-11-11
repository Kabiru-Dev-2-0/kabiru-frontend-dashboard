"use client";

import * as React from "react";

export type SwitchSize = "sm" | "md" | "lg";
export type SwitchVariant = "basic" | "dark" | "primary" | "error" | "success" | "warning";

export interface SwitchButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  size?: SwitchSize;
  variant?: SwitchVariant;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export function SwitchButton({
  size = "sm",
  variant = "primary",
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  className = "",
  ...props
}: SwitchButtonProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const sizeClasses: Record<SwitchSize, string> = {
    sm: "[--switch-thumb:12px]",
    md: "[--switch-thumb:16px]",
    lg: "[--switch-thumb:20px]",
  };

  const variantColors: Record<SwitchVariant, string> = {
    basic: "#D1D3D8",
    dark: "#3A3F48",
    primary: "#277BC0",
    error: "#FB2C36",
    success: "#00BC7D",
    warning: "#FF6900",
  };

  function handleToggle() {
    if (disabled) return;
    const nextChecked = !isChecked;
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }
    onChange?.(nextChecked);
  }

  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={props["aria-label"] ?? label}
      disabled={disabled}
      onClick={handleToggle}
      className={[
        "inline-flex shrink-0 cursor-pointer items-center rounded-full",
        "box-content border p-[2px] m-0",
        "transition-colors duration-150 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277BC0]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: `calc(var(--switch-thumb) * 2 + 4px)`,
        height: "var(--switch-thumb)",
        backgroundColor: isChecked ? variantColors[variant] : "#D1D3D8",
        borderColor: isChecked ? variantColors[variant] : "#D1D3D8",
        ...props.style,
      }}
    >
      <span
        aria-hidden="true"
        className="block shrink-0 rounded-full bg-white transition-transform duration-150 ease-in-out"
        style={{
          width: "var(--switch-thumb)",
          height: "var(--switch-thumb)",
          transform: isChecked ? "translateX(calc(var(--switch-thumb) + 4px))" : "translateX(0)",
        }}
      />
    </button>
  );
}
