import { z } from 'zod';

export const findingFormSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  description: z.string().optional(),
  ownerMembershipId: z.string().nullable().optional(),
  dueDate: z.string().optional(),
  impact: z.string().optional(),
  recommendation: z.string().optional(),
  rootCause: z.string().optional(),
  remediationPlan: z.string().optional(),
});
export type FindingFormValues = z.infer<typeof findingFormSchema>;
