"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type StepperProps = {
  totalSteps: number;
  value?: number;
  defaultValue?: number;
  onChange?: (step: number) => void;
  activeColor?: string;
  inactiveColor?: string;
  navSize?: number;
  trackHeight?: number;
  trackGap?: number;
  navGap?: number;
  trackRadius?: string;
  ariaLabel?: string;
  className?: string;
};

export function Stepper({
  totalSteps,
  value,
  defaultValue = 0,
  onChange,
  activeColor = "#3674B5",
  inactiveColor = "#E4E4E7",
  navSize = 32,
  trackHeight = 10,
  trackGap = 10,
  navGap = 32,
  trackRadius = "9999px",
  ariaLabel = "Progress steps",
  className = "",
}: StepperProps) {
  const [internalStep, setInternalStep] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentStep = Math.max(0, Math.min(totalSteps - 1, isControlled ? value : internalStep));

  const goToStep = (step: number) => {
    const nextStep = Math.max(0, Math.min(totalSteps - 1, step));
    if (!isControlled) {
      setInternalStep(nextStep);
    }
    onChange?.(nextStep);
  };

  if (totalSteps < 1) {
    return null;
  }

  return (
    <nav aria-label={ariaLabel} className={`flex w-full items-center ${className}`} style={{ gap: navGap }}>
      <button
        type="button"
        aria-label="Langkah sebelumnya"
        onClick={() => goToStep(currentStep - 1)}
        disabled={currentStep === 0}
        className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-opacity disabled:cursor-default disabled:opacity-40"
        style={{ width: navSize, height: navSize, color: activeColor }}
      >
        <ArrowLeft aria-hidden="true" size={navSize} strokeWidth={1.8} />
      </button>

      <div className="flex h-full min-w-0 flex-1 items-center" style={{ height: trackHeight, gap: trackGap }}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const isActive = index === currentStep;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Langkah ${index + 1}`}
              aria-current={isActive ? "step" : undefined}
              onClick={() => goToStep(index)}
              className="h-full min-w-0 flex-1 shrink-0 cursor-pointer border-0 p-0 transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: isActive ? activeColor : inactiveColor,
                borderRadius: trackRadius,
                outlineColor: activeColor,
              }}
            />
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Langkah berikutnya"
        onClick={() => goToStep(currentStep + 1)}
        disabled={currentStep === totalSteps - 1}
        className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-opacity disabled:cursor-default disabled:opacity-40"
        style={{ width: navSize, height: navSize, color: activeColor }}
      >
        <ArrowRight aria-hidden="true" size={navSize} strokeWidth={1.8} />
      </button>
    </nav>
  );
}
