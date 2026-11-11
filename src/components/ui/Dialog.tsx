"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode, ChangeEvent } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;

  title?: string;
  description?: string;
  children?: ReactNode;

  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: "text" | "email" | "password" | "number";
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;

  cancelText?: string;
  confirmText?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;

  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  isLoading?: boolean;
  disabled?: boolean;

  className?: string;
  contentClassName?: string;
}

export default function Dialog({
  open,
  onClose,
  onConfirm,

  title = "Dialog",
  description,
  children,

  showInput = false,
  inputLabel = "Input Text",
  inputPlaceholder = "Input Text",
  inputType = "text",
  inputValue,
  defaultInputValue,
  onInputChange,

  cancelText = "Batal",
  confirmText = "Simpan",
  showCancelButton = true,
  showConfirmButton = true,

  closeOnOverlayClick = true,
  closeOnEscape = true,
  isLoading = false,
  disabled = false,

  className = "",
  contentClassName = "",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const focusFrame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeOnEscape, isLoading, onClose]);

  if (!open) return null;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(event.target.value);
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && !isLoading && event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (disabled || isLoading) return;
    onConfirm?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={handleOverlayClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={["my-auto box-border flex w-full max-w-[544px] flex-col gap-6 rounded-xl bg-white p-6 shadow-xl max-sm:gap-5 max-sm:p-4", className].join(" ")}
      >
        <div className={["flex flex-col gap-5", contentClassName].join(" ")}>
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="m-0 font-['Encode_Sans'] text-xl font-semibold leading-8 text-[#3A3F48]">
                {title}
              </h2>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                disabled={isLoading}
                aria-label="Tutup dialog"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-zinc-600 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277BC0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            {description && (
              <p id={descriptionId} className="m-0 text-sm font-normal leading-6 text-[#606876]">
                {description}
              </p>
            )}
          </div>

          {children}

          {showInput && (
            <div className="w-full">
              <label htmlFor={inputId} className="sr-only">
                {inputLabel}
              </label>

              <input
                id={inputId}
                type={inputType}
                placeholder={inputPlaceholder}
                value={inputValue}
                defaultValue={inputValue === undefined ? defaultInputValue : undefined}
                onChange={handleInputChange}
                className="box-border h-[42px] w-full rounded-lg border border-[#BABEC6] bg-white px-3 py-2 font-sans text-xs leading-[1.5] text-[#3A3F48] placeholder:text-[#888E9B] focus:border-[#277BC0] focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#277BC0]"
              />
            </div>
          )}
        </div>

        {(showCancelButton || showConfirmButton) && (
          <div className="flex items-center justify-end gap-4">
            {showCancelButton && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex h-[42px] min-w-[110px] cursor-pointer items-center justify-center rounded-lg border-[3px] border-[#277BC0] bg-[rgba(240,241,243,0.2)] px-4 py-2 font-sans text-xs font-semibold leading-normal text-[#277BC0] shadow-[0_6px_0_#2370AF] transition-transform duration-75 active:translate-y-1 active:shadow-[0_2px_0_#2370AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277BC0] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {cancelText}
              </button>
            )}

            {showConfirmButton && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={disabled || isLoading}
                className="flex h-[42px] min-w-[110px] cursor-pointer items-center justify-center rounded-lg border-[3px] border-[#2370AF] bg-[#277BC0] px-4 py-2 font-sans text-xs font-semibold leading-normal text-white shadow-[0_6px_0_#2370AF] transition-transform duration-75 active:translate-y-1 active:shadow-[0_2px_0_#2370AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277BC0] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? "Memproses..." : confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
