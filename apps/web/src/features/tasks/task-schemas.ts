import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  description: z.string().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assigneeMembershipId: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;
