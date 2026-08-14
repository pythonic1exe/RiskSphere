import { z } from 'zod';
export const organizationFormSchema = z.object({ name: z.string().trim().min(2), slug: z.string().trim().min(2), timezone: z.string().nullable(), locale: z.string().nullable() });
export const invitationFormSchema = z.object({ email: z.string().trim().email(), roleCode: z.string().min(1) });
export const unitFormSchema = z.object({ name: z.string().trim().min(2), code: z.string().trim().nullable(), description: z.string().nullable(), parentId: z.string().uuid().nullable() });
export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;
export type InvitationFormValues = z.infer<typeof invitationFormSchema>;
export type UnitFormValues = z.infer<typeof unitFormSchema>;
