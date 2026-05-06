import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPatient {
  name: string;
  email: string;
  password: string;
}

interface ILoginUser {
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatient) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });
  if (!data.user) {
    throw new Error("Failed to register patient");
  }
  const patient = await prisma.$transaction(async (tx) => {
    try {
      return await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });
    } catch (error: any) {
      console.log("Transaction Error: ", error);
      //if the user is created but error to create patient model then we will delete the user data also
      await prisma.user.delete({
        where: {
          id: data.user.id,
        },
      });
      throw error;
    }
  });
  return {
    ...data,
    patient,
  };
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.Deleted) {
    throw new Error("User is deleted");
  }
  return data;
};

export const AuthService = {
  registerPatient,
  loginUser,
};
