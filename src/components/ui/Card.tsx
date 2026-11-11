import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: number;
  color?: string;
  border?: boolean;
  shadow?: boolean;
}

export function Card({ padding = 20, color = "#FFFFFF", border = true, shadow = false, className = "", style, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      style={{
        padding,
        backgroundColor: color,
        ...style,
      }}
      className={["rounded-xl", border ? "border border-border-main" : "border-0", shadow ? "shadow-sm" : "shadow-none", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
