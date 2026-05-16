import { prisma } from "../../lib/prisma";

const getAllAdmin = async () => {
  const result = await prisma.admin.findMany({
    include: {
      user: true,
    },
  });
  return result;
};

const getAdminById = async (id: string) => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  return result;
};

const updateAdmin = async (payload: any, id: string) => {
  const result = await prisma.admin.update({
    where: {
      id,
    },
    data: payload,
    include: {
      user: true,
    },
  });
  return result;
};

export const adminServices = {
  getAllAdmin,
  getAdminById,
  updateAdmin,
};
