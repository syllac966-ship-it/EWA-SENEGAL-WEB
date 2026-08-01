import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary:
    "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({ variant = "primary", fullWidth = false, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
        fullWidth ? "w-full" : ""
      } ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
