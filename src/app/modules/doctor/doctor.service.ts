import { prisma } from "../../lib/prisma";
import { doctorSelect } from "../user/user.service";

const getAllDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      doctorSpecialities: true,
    },
  });
  return doctors;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      doctorSpecialities: true,
    },
  });
  return doctor;
};

const softDeleteDoctor = async (id: string) => {
  const doctor = await prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  return doctor;
};
export const doctorService = {
  getAllDoctors,
  getDoctorById,
  softDeleteDoctor
};
