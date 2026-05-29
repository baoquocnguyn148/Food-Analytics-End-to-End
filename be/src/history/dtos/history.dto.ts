import { z } from "zod";

// =====================================================================
// History query DTOs (Sprint 7)
// =====================================================================

export const HistoryPaginationDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type HistoryPagination = z.infer<typeof HistoryPaginationDto>;
