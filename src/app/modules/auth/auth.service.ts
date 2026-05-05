import { auth } from "../../lib/auth";

interface IRegisterPatient {
  name: string;
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
  //   const patient = await prisma.$transaction(async(tx)=>{
  //     await tx.patient
  //   })
  return data;
};

export const AuthService = {
  registerPatient,
};
