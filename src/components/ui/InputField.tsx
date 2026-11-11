"use client";

import * as React from "react";
import { Plus } from "lucide-react";

export type InputFieldState = "default" | "active" | "error" | "disabled";
export type InputIconPosition = "left" | "right" | "none";

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  requiredMark?: boolean;
  state?: InputFieldState;
  errorMessage?: string;
  icon?: React.ReactNode;
  iconPosition?: InputIconPosition;
  containerClassName?: string;
  labelClassName?: string;
  messageClassName?: string;
  fullWidth?: boolean;
  inputSize?: "sm" | "md" | "lg";
}

export function InputField({
  label,
  requiredMark = false,
  state = "default",
  errorMessage,
  icon,
  iconPosition = "none",
  containerClassName = "",
  labelClassName = "",
  messageClassName = "",
  fullWidth = false,
  inputSize = "md",
  disabled,
  className = "",
  id,
  placeholder,
  ...props
}: InputFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isDisabled = disabled || state === "disabled";
  const isError = state === "error";
  const actualState = isDisabled ? "disabled" : state;
  const messageId = `${inputId}-error`;

  const sizeClasses = {
    sm: "py-1.5 px-2.5",
    md: "py-2 px-3",
    lg: "py-3 px-4",
  };

  const fieldStateClasses = {
    default: "border-[#BABEC6] focus-within:border-[#277BC0] focus-within:shadow-[inset_0_0_0_1px_#277BC0]",
    active: "border-2 border-[#277BC0]",
    error: "border-2 border-[#FC565E]",
    disabled: "border-2 border-[#D1D3D8] bg-[#F0F1F3]",
  };

  const inputIcon = iconPosition === "none" ? null : (icon ?? <Plus size={18} strokeWidth={1.8} />);

  return (
    <div className={["flex flex-col items-start gap-2 text-xs font-normal", fullWidth ? "w-full" : "w-80", containerClassName].filter(Boolean).join(" ")}>
      {label && (
        <label htmlFor={inputId} className={["flex items-start gap-1 whitespace-nowrap font-medium leading-5 text-[#3A3F48]", labelClassName].filter(Boolean).join(" ")}>
          <span>{label}</span>
          {requiredMark && (
            <span className="font-semibold leading-normal text-[#FB2C36]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={[
          "box-border flex w-full items-center gap-2 rounded-lg border bg-white transition-colors",
          sizeClasses[inputSize],
          fieldStateClasses[actualState],
          isDisabled ? "cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {iconPosition === "left" && (
          <span className={["flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[#606876]", isDisabled ? "opacity-60" : ""].join(" ")} aria-hidden="true">
            {inputIcon}
          </span>
        )}

        <input
          {...props}
          id={inputId}
          disabled={isDisabled}
          placeholder={placeholder}
          aria-invalid={isError || undefined}
          aria-describedby={isError && errorMessage ? messageId : undefined}
          className={[
            "m-0 min-w-0 flex-1 border-0 bg-transparent p-0",
            "font-[inherit] text-xs font-normal leading-5",
            "text-[#3A3F48] outline-none",
            "placeholder:text-[#888E9B] placeholder:opacity-100",
            "disabled:cursor-not-allowed disabled:text-[#888E9B]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {iconPosition === "right" && (
          <span className={["flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[#606876]", isDisabled ? "opacity-60" : ""].join(" ")} aria-hidden="true">
            {inputIcon}
          </span>
        )}
      </div>

      {isError && errorMessage && (
        <p id={messageId} className={["m-0 w-full text-xs font-normal leading-5 text-[#FB2C36]", messageClassName].filter(Boolean).join(" ")}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
