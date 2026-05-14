import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { adminServices } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllAdmin();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All Admin Data Retrieved",
    data: result,
  });
});

export const adminControllers = {
  getAllAdmin,
};
