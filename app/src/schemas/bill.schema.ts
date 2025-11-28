import { z } from "zod";

export const billSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  groupId: z.string().uuid("Invalid group ID"),
  description: z.string().optional(),
});

export type BillInput = z.infer<typeof billSchema>;
