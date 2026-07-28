import type { FieldValues } from "react-hook-form";
import type { ZodType } from "zod";
import type { FieldDescriptor, NextField } from "./chat";

/**
 * Finds the next field the chat assistant should ask about: the first invalid field
 * per the template's own zod schema (so chat and form validation never disagree).
 * Optional fields pass validation even when blank, so after the schema validates the
 * caller gets one nudge for `optionalFieldPath`, tracked via `hasAskedOptional`.
 */
export function getNextField<T extends FieldValues>(
  schema: ZodType<T, T>,
  values: T,
  descriptors: FieldDescriptor[],
  optionalFieldPath: string | undefined,
  hasAskedOptional: boolean,
): NextField | null {
  const labels = Object.fromEntries(descriptors.map((d) => [d.path, d.label]));

  const result = schema.safeParse(values);
  if (!result.success) {
    const path = result.error.issues[0].path.join(".");
    return { path, label: labels[path] ?? path };
  }
  if (optionalFieldPath && !hasAskedOptional) {
    return { path: optionalFieldPath, label: labels[optionalFieldPath] ?? optionalFieldPath };
  }
  return null;
}
