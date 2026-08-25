import { z } from 'zod'

/**
 * Tip submission validation (PRD Master §22, CLAUDE.md §66-§70).
 *
 * Pure. Given whatever arrived on the wire, it answers what may be stored.
 *
 * The transform is the important part. When the sender asks to stay anonymous,
 * the contact fields are dropped *here*, before anything reaches the database —
 * not hidden in the admin, not nulled by a later hook that someone could
 * reorder. A field that is never written cannot leak, cannot be subpoenaed and
 * cannot turn up in an export.
 */
export const MAX_TITLE = 200
export const MAX_DESCRIPTION = 10_000
export const MAX_LOCATION = 200
export const MAX_CONTACT = 200

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null))
    .nullish()

const optionalEmail = z
  .string()
  .trim()
  .max(MAX_CONTACT)
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine((value) => value === null || z.string().email().safeParse(value).success, {
    message: 'invalid-email',
  })

export const tipSubmissionSchema = z
  .object({
    title: z.string().trim().min(3).max(MAX_TITLE),
    description: z.string().trim().min(20).max(MAX_DESCRIPTION),
    location: optionalText(MAX_LOCATION),
    /*
     * An HTML checkbox posts the string "on"; a JSON client posts `true`. Both
     * mean the same thing, and reading only one of them would store the contact
     * details of someone who asked to be anonymous.
     */
    anonymous: z
      .unknown()
      .transform((value) => value === true || value === 'true' || value === 'on' || value === 1)
      .default(false),
    contactName: optionalText(MAX_CONTACT),
    contactEmail: optionalEmail,
    contactPhone: optionalText(MAX_CONTACT),
  })
  .transform((value) =>
    value.anonymous
      ? // Anonymity enforced in the data, not in the interface.
        { ...value, contactName: null, contactEmail: null, contactPhone: null }
      : value,
  )

export type TipSubmission = z.infer<typeof tipSubmissionSchema>

export type TipParseResult =
  | { ok: true; data: TipSubmission }
  | { ok: false; errors: Record<string, string> }

/**
 * Parses a submission, returning field errors the form can display.
 *
 * The messages are written for the person sending the tip, in their language,
 * and they never echo back what was received: an error message is not a place
 * to reflect user input.
 */
export function parseTipSubmission(input: unknown): TipParseResult {
  const result = tipSubmissionSchema.safeParse(input)

  if (result.success) return { ok: true, data: result.data }

  const errors: Record<string, string> = {}

  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (typeof field !== 'string' || errors[field]) continue

    errors[field] =
      field === 'title'
        ? 'Escribe un título de al menos tres caracteres.'
        : field === 'description'
          ? 'Cuéntanos qué ocurrió, con al menos veinte caracteres.'
          : field === 'contactEmail'
            ? 'Ese correo no parece válido. Puedes dejarlo vacío.'
            : 'Revisa este campo.'
  }

  return { ok: false, errors }
}
