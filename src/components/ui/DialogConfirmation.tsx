"use client";

import { useEffect, useId, useRef } from "react";

export type DialogConfirmationVariant = "primary" | "danger";

interface DialogConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;

  title?: string;
  description?: string;

  showCancelButton?: boolean;
  cancelText?: string;
  confirmText?: string;

  variant?: DialogConfirmationVariant;
  width?: number | string;

  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;

  isLoading?: boolean;
  disabled?: boolean;

  className?: string;
}

export default function DialogConfirmation({
  open,
  onClose,
  onConfirm,

  title = "Konfirmasi",
  description = "Apakah kamu yakin ingin melanjutkan tindakan ini?",

  showCancelButton = true,
  cancelText = "Batal",
  confirmText = "Ya",

  variant = "primary",
  width = 380,

  closeOnOverlayClick = false,
  closeOnEscape = true,

  isLoading = false,
  disabled = false,

  className = "",
}: DialogConfirmationProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

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
      confirmButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeOnEscape, isLoading, onClose]);

  if (!open) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && !isLoading && event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (disabled || isLoading) return;
    onConfirm();
  };

  const confirmButtonClasses =
    variant === "danger"
      ? "border-[#D92D20] bg-[#E5484D] shadow-[0_6px_0_#D92D20] active:shadow-[0_2px_0_#D92D20]"
      : "border-[#2370AF] bg-[#277BC0] shadow-[0_6px_0_#2370AF] active:shadow-[0_2px_0_#2370AF]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={handleOverlayClick}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={["my-auto box-border flex w-full flex-col gap-5 rounded-xl bg-white p-6 shadow-xl", className].join(" ")}
        style={{ maxWidth: width }}
      >
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="m-0 font-['Encode_Sans'] text-xl font-semibold leading-8 text-[#3A3F48]">
            {title}
          </h2>

          {description && (
            <p id={descriptionId} className="m-0 text-sm font-normal leading-6 text-[#606876]">
              {description}
            </p>
          )}
        </div>

        <div className={["flex items-center gap-4", !showCancelButton ? "gap-0" : ""].join(" ")}>
          {showCancelButton && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="box-border flex h-[42px] min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border-[3px] border-[#606876] bg-[rgba(240,241,243,0.2)] px-3 py-2 font-sans text-xs font-semibold leading-normal text-[#6A7282] shadow-[0_6px_0_#606876] transition-transform duration-75 active:translate-y-1 active:shadow-[0_2px_0_#606876] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277BC0] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {cancelText}
            </button>
          )}

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={disabled || isLoading}
            className={[
              "box-border flex h-[42px] min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border-[3px] px-3 py-2 font-sans text-xs font-semibold leading-normal text-white transition-transform duration-75 active:translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#277BC0] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
              confirmButtonClasses,
            ].join(" ")}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
