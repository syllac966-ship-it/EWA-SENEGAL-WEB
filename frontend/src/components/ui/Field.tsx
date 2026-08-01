import { useId } from "react";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: string;
  hint?: string;
  id?: string;
  autoComplete?: string;
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  min,
  max,
  step,
  hint,
  id,
  autoComplete,
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}
