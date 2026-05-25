import z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

const updatePatientProfileZodSchema = {
  patientInfo: z.object({
    patientInfo: z
      .object({
        name: z
          .string("Name must be string")
          .min(1, "Name is required")
          .max(100, "Name must be less than 100 characters")
          .optional(),
        profilePhoto: z.string("Profile photo must be string").optional(),
        contactNumber: z
          .string("Contact number must be string")
          .min(1, "Contact number is required")
          .max(20, "Contact number must be less than 20 characters")
          .optional(),
        address: z
          .string("Address must be string")
          .min(1, "Address is required")
          .max(200, "Address must be less than 200 characters")
          .optional(),
      })
      .optional(),
    patientHealthData: z
      .object({
        gender: z
          .enum(
            [Gender.MALE, Gender.FEMALE],
            "Gender must be either 'MALE' or 'FEMALE'",
          )
          .optional(),
        dateOfBirth: z
          .string()
          .refine((data) => !isNaN(Date.parse(data)), "Invalid date of birth")
          .optional(),
        bloodGroup: z
          .enum(
            [
              BloodGroup.AB_NEGATIVE,
              BloodGroup.AB_POSITIVE,
              BloodGroup.A_NEGATIVE,
              BloodGroup.A_POSITIVE,
              BloodGroup.B_NEGATIVE,
              BloodGroup.B_POSITIVE,
              BloodGroup.O_NEGATIVE,
              BloodGroup.O_POSITIVE,
            ],
            "Invalid blood group",
          )
          .optional(),
        hasAllergies: z.boolean("Has allergies must be boolean").optional(),
        hasDiabetes: z.boolean("Has diabetes must be boolean").optional(),
        height: z.string("Height must be string").optional(),
        weight: z.string("Weight must be string").optional(),
        smokingStatus: z.boolean("Smoking status must be boolean").optional(),
        dietaryPreferences: z
          .string("Dietary preferences must be string")
          .optional(),
        pregnancyStatus: z
          .boolean("Pregnancy status must be boolean")
          .optional(),
        mentalHealthHistory: z
          .string("Mental health history must be string")
          .optional(),
        immunizationStatus: z
          .string("Immunization status must be string")
          .optional(),
        hasPastSurgeries: z
          .boolean("Has past surgeries must be boolean")
          .optional(),
        recentAnxiety: z.boolean("Recent anxiety must be boolean").optional(),
        recentDepression: z
          .boolean("Recent depression must be boolean")
          .optional(),
        maritalStatus: z.string("Marital status must be string").optional(),
      })
      .optional(),
    medicalReports: z
      .array(
        z.object({
          shouldDelete: z.boolean("Should delete must be boolean").optional(),
          reportId: z.uuid("Report ID must be UUID").optional(),
          reportName: z.string("Report name must be string").optional(),
          reportLink: z.url("Report link must be URL").optional(),
        }),
      )
      .optional()
      .refine((reports) => {
        if (!reports || reports.length === 0) return true; // If medicalReports is not provided, it's valid
        for (const report of reports) {
          if (report.shouldDelete === true && !report.reportId) return false;
          if (report.reportId && !report.shouldDelete) {
            return false;
          }
          if (report.reportName && !report.reportLink) {
            return false; // If report is marked for deletion, we don't need to validate name and link
          }
          if (report.reportLink && !report.reportName) {
            return false; // If report is marked for deletion, we don't need to validate name and link
          }
          return true;
        }
      }),
  }),
};

export const PatientValidation = {
  updatePatientProfileZodSchema,
};
