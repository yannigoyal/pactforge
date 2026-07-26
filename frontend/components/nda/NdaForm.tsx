import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { NdaFormValues } from "@/lib/nda/schema";
import { FormField, inputClassName } from "./FormField";
import { PartyFields } from "./PartyFields";

interface NdaFormProps {
  register: UseFormRegister<NdaFormValues>;
  errors: FieldErrors<NdaFormValues>;
}

export function NdaForm({ register, errors }: NdaFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Key terms</h2>

        <FormField label="Purpose" htmlFor="purpose" error={errors.purpose?.message} required>
          <textarea
            id="purpose"
            rows={2}
            placeholder="How Confidential Information may be used"
            className={inputClassName}
            {...register("purpose")}
          />
        </FormField>

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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Term of NDA"
            htmlFor="termOfNda"
            error={errors.termOfNda?.message}
            required
          >
            <input
              id="termOfNda"
              placeholder="e.g. 2 years from the Effective Date"
              className={inputClassName}
              {...register("termOfNda")}
            />
          </FormField>

          <FormField
            label="Confidentiality period"
            htmlFor="confidentialityPeriod"
            error={errors.confidentialityPeriod?.message}
            required
          >
            <input
              id="confidentialityPeriod"
              placeholder="e.g. 3 years from disclosure"
              className={inputClassName}
              {...register("confidentialityPeriod")}
            />
          </FormField>
        </div>

        <FormField label="Courts" htmlFor="courts" error={errors.courts?.message} required>
          <input
            id="courts"
            placeholder="e.g. the state and federal courts located in Delaware"
            className={inputClassName}
            {...register("courts")}
          />
        </FormField>

        <FormField label="Additional terms (optional)" htmlFor="additionalTerms">
          <textarea
            id="additionalTerms"
            rows={3}
            placeholder="Any additions to or modifications of the NDA agreed by the parties"
            className={inputClassName}
            {...register("additionalTerms")}
          />
        </FormField>
      </section>

      <PartyFields title="Party 1" prefix="partyA" register={register} errors={errors} />
      <PartyFields title="Party 2" prefix="partyB" register={register} errors={errors} />
    </div>
  );
}
