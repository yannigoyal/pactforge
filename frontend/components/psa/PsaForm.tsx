import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { RIGHTS_IN_DELIVERABLES_OPTIONS, type PsaFormValues } from "@/lib/psa/schema";
import { FormField, inputClassName } from "@/components/shared/FormField";
import { PartyFields } from "@/components/shared/PartyFields";

interface PsaFormProps {
  register: UseFormRegister<PsaFormValues>;
  errors: FieldErrors<PsaFormValues>;
}

export function PsaForm({ register, errors }: PsaFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Key terms</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Effective date"
            htmlFor="effectiveDate"
            error={errors.effectiveDate?.message}
            required
          >
            <input
              id="effectiveDate"
              type="date"
              className={inputClassName}
              {...register("effectiveDate")}
            />
          </FormField>

          <FormField
            label="Rights in Deliverables"
            htmlFor="rightsInDeliverables"
            error={errors.rightsInDeliverables?.message}
            required
          >
            <select
              id="rightsInDeliverables"
              className={inputClassName}
              {...register("rightsInDeliverables")}
            >
              <option value="">Select…</option>
              {RIGHTS_IN_DELIVERABLES_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Governing law"
            htmlFor="governingLaw"
            error={errors.governingLaw?.message}
            required
          >
            <input
              id="governingLaw"
              placeholder="e.g. State of Delaware"
              className={inputClassName}
              {...register("governingLaw")}
            />
          </FormField>

          <FormField label="Courts" htmlFor="courts" error={errors.courts?.message} required>
            <input
              id="courts"
              placeholder="e.g. the state and federal courts located in Delaware"
              className={inputClassName}
              {...register("courts")}
            />
          </FormField>
        </div>

        <FormField label="Additional terms (optional)" htmlFor="additionalTerms">
          <textarea
            id="additionalTerms"
            rows={3}
            placeholder="Any additions to or modifications of the PSA agreed by the parties"
            className={inputClassName}
            {...register("additionalTerms")}
          />
        </FormField>
      </section>

      <PartyFields title="Customer" prefix="customer" register={register} errors={errors} />
      <PartyFields title="Provider" prefix="provider" register={register} errors={errors} />
    </div>
  );
}
