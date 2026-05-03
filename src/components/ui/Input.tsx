"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, leadingIcon, trailingIcon, className, id, ...rest },
  ref
) {
  const reactId = id ?? `input-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={reactId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leadingIcon}
          </span>
        )}
        <input
          id={reactId}
          ref={ref}
          className={cn(
            "input",
            leadingIcon && "pl-11",
            trailingIcon && "pr-11",
            error && "border-red-300 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...rest}
        />
        {trailingIcon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {trailingIcon}
          </span>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
});
