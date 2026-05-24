import { uuidv7 } from "zod";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";

const bookAppointmentWithPayLater = async (
  payload: IBookAppointmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: payload.doctorId,
        scheduleId: doctorSchedule.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    //TODO:Payment intergration will be here and payment status will be updated.

    return appointmentData;
  });

  return result;
};

const getMyAppointments = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
      isDeleted: false,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: user?.email,
      isDeleted: false,
    },
  });

  let appointments = [];
  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
        patient: true,
        review: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        doctor: true,
        schedule: true,
        patient: true,
        review: true,
      },
    });
  } else {
    throw new Error("User not found");
  }

  return appointments;
};

const getAllAppointments = async () => {
  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
      schedule: true,
      patient: true,
      review: true,
    },
  });
  return appointments;
};
const changeAppointmentStatus = async (
  appointmentId: string,
  appointmentStatus: AppointmentStatus,
  user: IRequestUser,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      patient: true,
      schedule: true,
      doctor: true,
    },
  });

  if (!appointmentData) {
    throw new Error("Appointment not found");
  }

  if (user?.role === Role.DOCTOR) {
    if (user?.email !== appointmentData?.doctor?.email) {
      throw new Error("You are not authorized to cancel this appointment");
    }

    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: appointmentStatus,
      },
    });
  }
};

const getMySingleAppointment = async (
  appointmentId: string,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  let appointment;
  if (patientData) {
    appointment = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
        schedule: true,
        doctor: true,
      },
    });
  } else if (doctorData) {
    appointment = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
        schedule: true,
        doctor: true,
      },
    });
  } else {
    throw new Error("User not found");
  }
  return appointment;
};

const initiatePayment = async (appointmentId: string, user: IRequestUser) => {};

const cancelUnpaidAppointments = async (
  appointmentId: string,
  appointmentStatus: AppointmentStatus,
  user: IRequestUser,
) => {};

export const AppointmentService = {
  changeAppointmentStatus,
  getMyAppointments,
  getMySingleAppointment,
  getAllAppointments,
  bookAppointmentWithPayLater,
  initiatePayment,
  cancelUnpaidAppointments,
};
