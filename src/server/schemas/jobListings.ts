import { z } from "zod";
import { 
  jobListingStatusEnum, 
  jobListingTypeEnum, 
  experienceLevelEnum, 
  locationRequirementEnum, 
  wageIntervalEnum 
} from "@/drizzle/schema";

export const jobListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  organizationId: z.string().min(1, "Organization is required"),
  wage: z.coerce.number().optional(),
  wageInterval: z.enum(wageIntervalEnum.enumValues),
  locationRequirement: z.enum(locationRequirementEnum.enumValues),
  experienceLevel: z.enum(experienceLevelEnum.enumValues),
  type: z.enum(jobListingTypeEnum.enumValues),
  stateAbbreviation: z.string().optional(),
  city: z.string().optional(),
});
