import { supabaseAdmin } from "../supabase/admin";
import type { CategoryInput } from "../validations/category";

export class CategoryService {
  static async getAll(includeInactive = false) {
    let query = supabaseAdmin
      .from("categories")
      .select("*, parent:parent_id(id, name_fr, name_en)")
      .order("sort_order", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(
        "*, parent:parent_id(id, name_fr, name_en), subcategories:categories!parent_id(id, name_fr, name_en)",
      )
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async create(input: CategoryInput) {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        parent_id: input.parent_id || null,
        name_fr: input.name_fr,
        name_en: input.name_en,
        slug: input.slug,
        description_fr: input.description_fr || null,
        description_en: input.description_en || null,
        icon: input.icon || null,
        sort_order: input.sort_order || 0,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, input: Partial<CategoryInput>) {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({
        ...(input.parent_id !== undefined && { parent_id: input.parent_id }),
        ...(input.name_fr && { name_fr: input.name_fr }),
        ...(input.name_en && { name_en: input.name_en }),
        ...(input.slug && { slug: input.slug }),
        ...(input.description_fr !== undefined && {
          description_fr: input.description_fr,
        }),
        ...(input.description_en !== undefined && {
          description_en: input.description_en,
        }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  }
}
