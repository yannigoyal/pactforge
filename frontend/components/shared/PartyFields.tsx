import type { FieldErrors, FieldPath, FieldValues, UseFormRegister } from "react-hook-form";
import type { Party } from "@/lib/templates/party";
import { FormField, inputClassName } from "./FormField";

interface PartyFieldsProps<T extends FieldValues> {
  title: string;
  prefix: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

export function PartyFields<T extends FieldValues>({
  title,
  prefix,
  register,
  errors,
}: PartyFieldsProps<T>) {
  const partyErrors = (errors as Record<string, FieldErrors<Party> | undefined>)[prefix];
  const field = (name: keyof Party) => register(`${prefix}.${name}` as FieldPath<T>);

  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <legend className="px-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</legend>

      <FormField
        label="Company / party name"
        htmlFor={`${prefix}.companyName`}
        error={partyErrors?.companyName?.message}
        required
      >
        <input id={`${prefix}.companyName`} className={inputClassName} {...field("companyName")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Signatory name"
          htmlFor={`${prefix}.signatoryName`}
          error={partyErrors?.signatoryName?.message}
          required
        >
          <input id={`${prefix}.signatoryName`} className={inputClassName} {...field("signatoryName")} />
        </FormField>

        <FormField
          label="Signatory title"
          htmlFor={`${prefix}.signatoryTitle`}
          error={partyErrors?.signatoryTitle?.message}
          required
        >
          <input id={`${prefix}.signatoryTitle`} className={inputClassName} {...field("signatoryTitle")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Notice email"
          htmlFor={`${prefix}.noticeEmail`}
          error={partyErrors?.noticeEmail?.message}
        >
          <input id={`${prefix}.noticeEmail`} type="email" className={inputClassName} {...field("noticeEmail")} />
        </FormField>

        <FormField label="Notice postal address" htmlFor={`${prefix}.noticePostalAddress`}>
          <input
            id={`${prefix}.noticePostalAddress`}
            className={inputClassName}
            {...field("noticePostalAddress")}
          />
        </FormField>
      </div>

      <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
        At least one of notice email or postal address is required.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Signature (type full name)"
          htmlFor={`${prefix}.signature`}
          error={partyErrors?.signature?.message}
          required
        >
          <input
            id={`${prefix}.signature`}
            className={`${inputClassName} font-serif italic`}
            {...field("signature")}
          />
        </FormField>

        <FormField
          label="Date"
          htmlFor={`${prefix}.date`}
          error={partyErrors?.date?.message}
          required
        >
          <input id={`${prefix}.date`} type="date" className={inputClassName} {...field("date")} />
        </FormField>
      </div>
    </fieldset>
  );
}
