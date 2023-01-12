import { z } from "zod";

export const restraintObject = () =>
  z.object({
    start: z.number().optional(),
    end: z.number().optional(),
  });

export type restraintObject = z.infer<ReturnType<typeof restraintObject>>;
