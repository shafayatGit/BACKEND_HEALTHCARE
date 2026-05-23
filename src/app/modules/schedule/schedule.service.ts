import { addHours, addMinutes, format } from "date-fns";
import { ICreateSchedulePayload } from "./schedule.interface";
import { convertDateTime } from "./schedule.utis";
import { prisma } from "../../lib/prisma";

const createSchedule = async (payload: ICreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const interval = 30;
  const currentDate = new Date(startDate); //today
  const lastDate = new Date(endDate);
  const schedules = [];

  while (currentDate <= lastDate) {
    const startDateTime = new Date( //!need date-fns package
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")} ,
        `,
          Number(startTime.split(":")[0]),
        ),
        Number(startTime.split(":")[1]),
      ),
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")} ,
        `,
          Number(endTime.split(":")[0]),
        ),
        Number(endTime.split(":")[1]),
      ),
    );

    //?Example
    // startTime = "09:00" → split(":") → ["09", "00"]
    // Builds: 2026-05-23 + 9 hours + 0 minutes = 2026-05-23 09:00

    // const startDateTime = new Date(
    //   addMinutes(addHours("2026-05-23", 9), 0)
    // ); // → 09:00

    // const endDateTime = new Date(
    //   addMinutes(addHours("2026-05-23", 10), 0)
    // ); // → 10:00

    while (startDateTime < endDateTime) {
      const s = convertDateTime(startDateTime);

      const e = convertDateTime(addMinutes(startDateTime, interval));

      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      startDateTime.setMinutes(startDateTime.getMinutes() + interval);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};
export const ScheduleServices = {
  createSchedule,
};
