import { z } from "zod";

export const documentSchema = z.object({
  category_id: z.string().uuid("Catégorie requise"),
  title_fr: z.string().min(1, "Titre FR requis"),
  title_en: z.string().min(1, "Titre EN requis"),
  description_fr: z.string().optional(),
  description_en: z.string().optional(),
  is_published: z.boolean().optional(),
  ocr_text: z.string().nullable().optional(),
  ocr_status: z
    .enum(["pending", "processing", "completed", "failed"])
    .optional(),
  file_path: z.string().nullable().optional(),
  file_size: z.number().nullable().optional(),
  mime_type: z.string().optional(),
});

export type DocumentInput = z.infer<typeof documentSchema>;
