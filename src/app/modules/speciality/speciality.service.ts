import { Speciality } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpeciality = async (payload: Speciality) => {
  const speciality = await prisma.speciality.create({
    data: payload,
  });
  return speciality;
};

const getAllSpecialities = async () => {
  const specialities = await prisma.speciality.findMany();
  return specialities;
};

const deleteSpeciality = async (id: string) => {
  const speciality = await prisma.speciality.delete({
    where: { id },
  });
  return speciality;
};

export const specialityService = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciality,
};
