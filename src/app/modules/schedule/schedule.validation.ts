import z from "zod";

const createScheduleZodSchema = z.object({
  startDate: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
  endDate: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
  startTime: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
  endTime: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
});

export const scheduleValidation = {
  createScheduleZodSchema,
};
