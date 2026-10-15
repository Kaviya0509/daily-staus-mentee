import { z } from "zod";
import { format } from "date-fns";

export const reportSchema = z.object({
  menteeName: z.string().min(2, "Full name is required").max(100),
  menteeEmail: z.string().optional().default(""),
  reportDate: z.string().default(() => format(new Date(), "yyyy-MM-dd")),
  currentTask: z.string().min(1, "Current task is required").max(200),
  status: z.enum(["Not Started", "In Progress", "Blocked", "Completed", "On Hold"], {
    required_error: "Status is required",
  }),
  shortDescription: z.string().min(1, "Description is required").max(2000),
  managerLead: z.string().optional().default(""),
  blockerDependency: z.string().max(2000).default(""),
  idleReasonWorkNeeded: z.string().max(2000).default(""),
  expectedCompletion: z.string().default(""),
  notes: z.string().max(2000).default(""),
});

export type ReportFormData = z.infer<typeof reportSchema>;
