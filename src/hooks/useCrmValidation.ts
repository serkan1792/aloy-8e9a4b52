import { z } from 'zod';
import { Account, Company, Contact } from '@/types';

// Validation schemas
export const accountSchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name darf maximal 100 Zeichen haben')
    .trim(),
  planId: z.string().min(1, 'Bitte wählen Sie einen Plan'),
  firstResponseSlaHours: z.number()
    .min(1, 'SLA muss mindestens 1 Stunde sein')
    .max(168, 'SLA darf maximal 168 Stunden (1 Woche) sein'),
});

export const companySchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name darf maximal 100 Zeichen haben')
    .trim(),
  domain: z.string()
    .min(1, 'Domain ist erforderlich')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/,
      'Ungültiges Domain-Format (z.B. beispiel.de)'
    )
    .trim()
    .toLowerCase(),
  type: z.enum(['Kunde', 'Partner'], {
    errorMap: () => ({ message: 'Bitte wählen Sie einen Typ' })
  }),
  externalId: z.string().optional(),
  accountId: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .min(2, 'Name muss mindestens 2 Zeichen haben')
    .max(100, 'Name darf maximal 100 Zeichen haben')
    .trim(),
  email: z.string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Ungültiges E-Mail-Format')
    .max(255, 'E-Mail darf maximal 255 Zeichen haben')
    .trim()
    .toLowerCase(),
  phone: z.string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s\-()]{6,20}$/.test(val),
      'Ungültiges Telefonnummer-Format'
    ),
  companyId: z.string().min(1, 'Unternehmen ist erforderlich'),
  slackHandle: z.string().optional(),
});

// Validation types
export type AccountFormData = z.infer<typeof accountSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

// Validation error type
export interface ValidationErrors {
  [key: string]: string | undefined;
}

// Uniqueness check functions
export function checkAccountNameUnique(
  name: string, 
  accounts: Account[], 
  excludeId?: string
): string | null {
  const normalized = name.trim().toLowerCase();
  const duplicate = accounts.find(
    a => a.name.toLowerCase() === normalized && a.id !== excludeId
  );
  return duplicate ? 'Ein Account mit diesem Namen existiert bereits' : null;
}

export function checkCompanyNameUnique(
  name: string, 
  companies: Company[], 
  excludeId?: string
): string | null {
  const normalized = name.trim().toLowerCase();
  const duplicate = companies.find(
    c => c.name.toLowerCase() === normalized && c.id !== excludeId
  );
  return duplicate ? 'Ein Unternehmen mit diesem Namen existiert bereits' : null;
}

export function checkCompanyDomainUnique(
  domain: string, 
  companies: Company[], 
  excludeId?: string
): string | null {
  const normalized = domain.trim().toLowerCase();
  const duplicate = companies.find(
    c => c.domain.toLowerCase() === normalized && c.id !== excludeId
  );
  return duplicate ? 'Ein Unternehmen mit dieser Domain existiert bereits' : null;
}

export function checkContactEmailUnique(
  email: string, 
  contacts: Contact[], 
  excludeId?: string
): string | null {
  const normalized = email.trim().toLowerCase();
  const duplicate = contacts.find(
    c => c.email.toLowerCase() === normalized && c.id !== excludeId
  );
  return duplicate ? 'Ein Kontakt mit dieser E-Mail existiert bereits' : null;
}

// Validation result types
type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; errors: ValidationErrors };
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// Validate function with Zod
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: ValidationErrors = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}
