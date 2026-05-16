import { z } from "zod";

export const videoSchema = z.object({
  category_id: z.string().uuid("Catégorie requise"),
  title_fr: z.string().min(1, "Titre FR requis"),
  title_en: z.string().min(1, "Titre EN requis"),
  description_fr: z.string().optional(),
  description_en: z.string().optional(),
  is_published: z.boolean().optional(),
});

export type VideoInput = z.infer<typeof videoSchema>;
