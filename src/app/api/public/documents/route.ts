import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const origin = "*";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const category_id = searchParams.get("category_id") || "";

    let query = supabaseAdmin
      .from("documents")
      .select("*, category:category_id(id, name_fr, name_en, slug)", {
        count: "exact",
      })
      .eq("is_published", true);

    // Recherche par catégorie
    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    // Recherche simple (titre + description)
    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(
        `title_fr.ilike.${term},title_en.ilike.${term},description_fr.ilike.${term},description_en.ilike.${term}`,
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return NextResponse.json(
      {
        data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}
