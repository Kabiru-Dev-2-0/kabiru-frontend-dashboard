"use client";

import * as React from "react";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "success"
  | "error"
  | "warning"
  | "disabled"
  | "primary-outline"
  | "accent-outline"
  | "success-outline"
  | "error-outline"
  | "warning-outline"
  | "disabled-outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Solid variants
  primary: "bg-primary-default border-primary-hover text-white shadow-[0_6px_0_0_var(--color-primary-hover)] active:shadow-[0_2px_0_0_var(--color-primary-hover)]",
  accent: "bg-accent-default border-accent-hover text-white shadow-[0_6px_0_0_var(--color-accent-hover)] active:shadow-[0_2px_0_0_var(--color-accent-hover)]",
  success: "bg-success-default border-success-hover text-white shadow-[0_6px_0_0_var(--color-success-hover)] active:shadow-[0_2px_0_0_var(--color-success-hover)]",
  error: "bg-error-default border-error-hover text-white shadow-[0_6px_0_0_var(--color-error-hover)] active:shadow-[0_2px_0_0_var(--color-error-hover)]",
  warning: "bg-warning-default border-warning-hover text-white shadow-[0_6px_0_0_var(--color-warning-hover)] active:shadow-[0_2px_0_0_var(--color-warning-hover)]",
  disabled: "bg-disabled-default border-disabled-hover text-white shadow-[0_6px_0_0_var(--color-disabled-hover)] cursor-not-allowed opacity-70",

  // Transparent variants
  "primary-outline":
    "bg-[rgba(240,241,243,0.2)] border-primary-default shadow-[0_6px_0_0_var(--color-primary-hover)] text-primary-default active:shadow-[0_2px_0_0_var(--color-primary-hover)]",
  "accent-outline":
    "bg-[rgba(240,241,243,0.2)] border-accent-default shadow-[0_6px_0_0_var(--color-accent-hover)] text-accent-default active:shadow-[0_2px_0_0_var(--color-accent-hover)]",
  "success-outline":
    "bg-[rgba(240,241,243,0.2)] border-success-default shadow-[0_6px_0_0_var(--color-success-hover)] text-success-default active:shadow-[0_2px_0_0_var(--color-success-hover)]",
  "error-outline":
    "bg-[rgba(240,241,243,0.2)] border-error-default shadow-[0_6px_0_0_var(--color-error-hover)] text-error-default active:shadow-[0_2px_0_0_var(--color-error-hover)]",
  "warning-outline":
    "bg-[rgba(240,241,243,0.2)] border-warning-default shadow-[0_6px_0_0_var(--color-warning-hover)] text-warning-default active:shadow-[0_2px_0_0_var(--color-warning-hover)]",
  "disabled-outline":
    "bg-[rgba(240,241,243,0.2)] border-disabled-default shadow-[0_6px_0_0_var(--color-disabled-hover)] text-disabled-default cursor-not-allowed opacity-70",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", leftIcon, rightIcon, fullWidth = false, disabled = false, className = "", children, type = "button", ...props }, ref) => {
    const isDisabled = disabled || variant === "disabled" || variant === "disabled-outline";

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          "box-border inline-flex h-[42px] cursor-pointer items-center justify-center gap-2",
          "rounded-lg border-[3px] px-3 py-1",
          "font-sans text-small font-semibold leading-normal",
          "transition-transform duration-100 ease-out",
          "hover:scale-[0.96]",
          "active:translate-y-1 active:scale-[0.96]",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-primary-default",
          "disabled:pointer-events-none",
          "disabled:hover:scale-100 disabled:active:translate-y-0",
          "whitespace-nowrap",
          fullWidth ? "w-full" : "w-fit",
          variantStyles[variant],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {leftIcon && <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>}
        <span className="text-center">{children}</span>
        {rightIcon && <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
