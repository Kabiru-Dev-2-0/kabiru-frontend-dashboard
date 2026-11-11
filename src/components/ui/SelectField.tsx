"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  label?: string;
  requiredMark?: boolean;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  groupLabel?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  fullWidth?: boolean;
  selectSize?: "sm" | "md" | "lg";
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
}

export function SelectField({
  label,
  requiredMark = false,
  placeholder = "Pilih opsi",
  options,
  value,
  defaultValue = "",
  onChange,
  groupLabel,
  disabled = false,
  required = false,
  name,
  fullWidth = false,
  selectSize = "md",
  className = "",
  triggerClassName = "",
  labelClassName = "",
  id,
  ...props
}: SelectFieldProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const optionRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  const enabledIndexes = options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index !== -1);

  const sizeClasses = {
    sm: "py-1.5 px-2.5",
    md: "py-2 px-3",
    lg: "py-3 px-4",
  };

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  React.useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, activeIndex]);

  function openMenu() {
    if (disabled) return;
    const selectedIndex = options.findIndex((option) => option.value === selectedValue && !option.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1));
    setIsOpen(true);
  }

  function chooseOption(option: SelectOption) {
    if (disabled || option.disabled) return;
    if (!isControlled) {
      setInternalValue(option.value);
    }
    onChange?.(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      const currentPosition = enabledIndexes.indexOf(activeIndex);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextPosition = currentPosition < 0 ? 0 : (currentPosition + direction + enabledIndexes.length) % enabledIndexes.length;
      setActiveIndex(enabledIndexes[nextPosition]);
    }

    if (event.key === "Enter" || event.key === " ") {
      if (!isOpen) {
        event.preventDefault();
        openMenu();
      }
    }
  }

  return (
    <div {...props} ref={rootRef} className={["flex flex-col gap-2 text-xs font-normal", fullWidth ? "w-full" : "w-80", className].filter(Boolean).join(" ")}>
      {label && (
        <label id={`${selectId}-label`} className={["flex items-start gap-1 whitespace-nowrap font-medium leading-5 text-[#3A3F48]", labelClassName].filter(Boolean).join(" ")}>
          <span>{label}</span>
          {requiredMark && (
            <span className="font-semibold leading-normal text-[#FB2C36]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {name && <input type="hidden" name={name} value={selectedValue} disabled={disabled} required={required} />}

      <div className="relative w-full">
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-label={label ? undefined : placeholder}
          aria-required={required || undefined}
          onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
          onKeyDown={handleTriggerKeyDown}
          className={[
            "box-border flex w-full cursor-pointer items-center justify-between gap-2",
            "rounded-lg border border-[#BABEC6] bg-white",
            "text-left text-xs font-normal leading-5 text-[#3A3F48]",
            "focus-visible:outline-none focus-visible:border-[#277BC0] focus-visible:shadow-[inset_0_0_0_1px_#277BC0]",
            "disabled:cursor-not-allowed disabled:bg-[#F0F1F3] disabled:text-[#888E9B]",
            sizeClasses[selectSize],
            triggerClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="min-w-0 flex-1 truncate">{selectedOption?.label ?? placeholder}</span>
          <ChevronDown
            size={18}
            strokeWidth={1.8}
            className={["shrink-0 text-[#606876] transition-transform duration-200", isOpen ? "rotate-180" : "", disabled ? "opacity-60" : ""].join(" ")}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? `${selectId}-label` : undefined}
            aria-label={label ? undefined : placeholder}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            className="absolute left-0 top-full z-50 mt-2 box-border max-h-60 w-full list-none overflow-y-auto rounded-lg border border-[#BABEC6] bg-white p-0 shadow-md"
          >
            {groupLabel && (
              <li role="presentation" className="px-3 py-2 text-[10px] leading-4 text-[#888E9B]">
                {groupLabel}
              </li>
            )}

            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              const isActive = index === activeIndex;

              return (
                <li
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  tabIndex={-1}
                  onClick={() => chooseOption(option)}
                  onMouseEnter={() => {
                    if (!option.disabled) {
                      setActiveIndex(index);
                    }
                  }}
                  className={[
                    "flex items-center justify-between gap-2 whitespace-nowrap px-3 py-2 text-xs leading-5 text-[#3A3F48]",
                    option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                    !option.disabled && (isSelected || isActive) ? "bg-[#F0F1F3]" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  <Check size={16} strokeWidth={2} className={["shrink-0 text-[#277BC0]", isSelected ? "visible" : "invisible"].join(" ")} aria-hidden="true" />
                </li>
              );
            })}

            {options.length === 0 && <li className="px-3 py-2 text-xs text-[#888E9B]">Tidak ada pilihan</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
