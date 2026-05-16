import { z } from "zod";

export const categorySchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  name_fr: z.string().min(1, "Nom FR requis"),
  name_en: z.string().min(1, "Nom EN requis"),
  slug: z.string().min(1, "Slug requis"),
  description_fr: z.string().optional(),
  description_en: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
