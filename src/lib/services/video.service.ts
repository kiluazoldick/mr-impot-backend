import { supabaseAdmin } from "../supabase/admin";
import type { VideoInput } from "../validations/video";

export class VideoService {
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
      .from("videos")
      .select("*, category:category_id(id, name_fr, name_en)", {
        count: "exact",
      });

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.is_published !== undefined) {
      query = query.eq("is_published", filters.is_published);
    }

    if (filters?.search) {
      query = query.or(
        `title_fr.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%,description_fr.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%`,
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
      .from("videos")
      .select("*, category:category_id(id, name_fr, name_en)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("videos")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", id);

    return data;
  }

  static async create(input: VideoInput, file?: File) {
    let file_path: string | null = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage.from("videos").upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);
      file_path = fileName;
    }

    const { data, error } = await supabaseAdmin
      .from("videos")
      .insert({
        category_id: input.category_id,
        title_fr: input.title_fr,
        title_en: input.title_en,
        description_fr: input.description_fr || null,
        description_en: input.description_en || null,
        file_path,
        is_published: input.is_published ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, input: Partial<VideoInput>, file?: File) {
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
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage.from("videos").upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);
      updateData.file_path = fileName;
    }

    const { data, error } = await supabaseAdmin
      .from("videos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(id: string) {
    const { data: video } = await supabaseAdmin
      .from("videos")
      .select("file_path")
      .eq("id", id)
      .single();

    if (video?.file_path) {
      await supabaseAdmin.storage.from("videos").remove([video.file_path]);
    }

    const { error } = await supabaseAdmin.from("videos").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  }
}
