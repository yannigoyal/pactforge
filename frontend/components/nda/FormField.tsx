import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

export const inputClassName =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const field = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-invalid": Boolean(error),
        "aria-describedby": errorId,
        "aria-required": required,
      })
    : children;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {field}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
