import { Request, Response } from "express";
import { specialityService } from "./speciality.service";

const createSpeciality = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const speciality = await specialityService.createSpeciality(payload);
    res.status(201).json({
      success: true,
      message: "Speciality created successfully",
      data: speciality,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
    console.log(error);
  }
};

const getAllSpecialities = async (req: Request, res: Response) => {
  try {
    const specialities = await specialityService.getAllSpecialities();
    res.status(200).json({
      success: true,
      message: "Specialities fetched successfully",
      data: specialities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
    console.log(error);
  }
};

const deleteSpeciality = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const speciality = await specialityService.deleteSpeciality(id as string);
    res.status(200).json({
      success: true,
      message: "Speciality deleted successfully",
      data: speciality,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
    console.log(error);
  }
};

export const specialityController = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciality,
};
