import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodObject: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parseResult = zodObject.safeParse(req.body);

    if (!parseResult.success) {
      next(parseResult.error);
    }

    // If validation is successful, proceed to the controller
    req.body = parseResult.data; // Use the parsed data
    next();
  };
};
