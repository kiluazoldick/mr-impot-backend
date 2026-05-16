import { supabaseAdmin } from "../supabase/admin";
import type { DocumentInput } from "../validations/document";
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

export class DocumentService {
  static async getAll(filters?: {
    category_id?: string;
    search?: string;
    is_published?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("documents")
      .select("*, category:category_id(id, name_fr, name_en)", {
        count: "exact",
      });

    if (filters?.category_id)
      query = query.eq("category_id", filters.category_id);
    if (filters?.is_published !== undefined)
      query = query.eq("is_published", filters.is_published);

    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = query.or(
        `title_fr.ilike.${term},title_en.ilike.${term},description_fr.ilike.${term},description_en.ilike.${term},ocr_text.ilike.${term}`,
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  static async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*, category:category_id(id, name_fr, name_en)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("documents")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", id);

    return data;
  }

  static async download(id: string) {
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("file_path, download_count")
      .eq("id", id)
      .single();

    if (docError || !doc?.file_path) throw new Error("Fichier non trouvé");

    const { data, error } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 3600);

    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("documents")
      .update({ download_count: (doc.download_count || 0) + 1 })
      .eq("id", id);

    return data.signedUrl;
  }

  static async create(input: DocumentInput, file?: File) {
    let file_path: string | null = null;
    let file_size: number | null = null;
    let mime_type = "application/pdf";
    let ocr_text: string | null = null;
    let ocr_status = "pending";

    if (file) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}-${safeFileName}`;

        const { data: uploadData, error: uploadError } =
          await supabaseAdmin.storage
            .from("documents")
            .upload(fileName, buffer, {
              contentType: file.type || "application/pdf",
              upsert: false,
            });

        if (uploadError)
          throw new Error(`Erreur d'upload: ${uploadError.message}`);

        file_path = fileName;
        file_size = file.size;
        mime_type = file.type || "application/pdf";

        // Extraire le texte du PDF
        try {
          console.log("📄 Extraction du texte du PDF...");
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
          });
          const pdf = await loadingTask.promise;

          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }

          ocr_text = fullText.trim() || null;
          ocr_status = ocr_text ? "completed" : "failed";
          console.log(`✅ Texte extrait: ${ocr_text?.length || 0} caractères`);
        } catch (pdfError: any) {
          console.warn("⚠️ Échec extraction:", pdfError.message);
          ocr_status = "failed";
        }
      } catch (uploadError: any) {
        throw new Error(`Échec de l'upload: ${uploadError.message}`);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        category_id: input.category_id,
        title_fr: input.title_fr,
        title_en: input.title_en,
        description_fr: input.description_fr || null,
        description_en: input.description_en || null,
        file_path,
        file_size,
        mime_type,
        ocr_text,
        ocr_status,
        is_published: input.is_published ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  static async update(id: string, input: Partial<DocumentInput>, file?: File) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (input.category_id) updateData.category_id = input.category_id;
    if (input.title_fr) updateData.title_fr = input.title_fr;
    if (input.title_en) updateData.title_en = input.title_en;
    if (input.description_fr !== undefined)
      updateData.description_fr = input.description_fr;
    if (input.description_en !== undefined)
      updateData.description_en = input.description_en;
    if (input.is_published !== undefined)
      updateData.is_published = input.is_published;

    if (file) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}-${safeFileName}`;

        const { data: uploadData, error: uploadError } =
          await supabaseAdmin.storage
            .from("documents")
            .upload(fileName, buffer, {
              contentType: file.type || "application/pdf",
              upsert: false,
            });

        if (uploadError)
          throw new Error(`Erreur d'upload: ${uploadError.message}`);

        updateData.file_path = fileName;
        updateData.file_size = file.size;
        updateData.mime_type = file.type || "application/pdf";

        // Extraire le texte du nouveau PDF
        try {
          console.log("📄 Extraction du texte du PDF mis à jour...");
          const pdfData = await pdfParse(buffer);
          updateData.ocr_text = pdfData.text?.trim() || null;
          updateData.ocr_status = updateData.ocr_text ? "completed" : "failed";
          console.log(
            `✅ Texte extrait: ${updateData.ocr_text?.length || 0} caractères`,
          );
        } catch (pdfError: any) {
          console.warn("⚠️ Échec extraction texte:", pdfError.message);
          updateData.ocr_status = "failed";
        }
      } catch (uploadError: any) {
        throw new Error(`Échec de l'upload: ${uploadError.message}`);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(id: string) {
    const { data: doc } = await supabaseAdmin
      .from("documents")
      .select("file_path")
      .eq("id", id)
      .single();

    if (doc?.file_path) {
      await supabaseAdmin.storage.from("documents").remove([doc.file_path]);
    }

    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}
