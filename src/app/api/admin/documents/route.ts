import { NextRequest, NextResponse } from "next/server";
import { documentSchema } from "@/lib/validations/document";
import { supabaseAdmin } from "@/lib/supabase/admin";

const origin = "*";

async function checkAdmin(request: NextRequest) {
  const accessToken =
    request.cookies.get("sb-access-token")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!accessToken) throw new Error("Non authentifié");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) throw new Error("Token invalide");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Non autorisé");
}

export async function GET(request: NextRequest) {
  try {
    await checkAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      category_id: searchParams.get("category_id") || undefined,
      search: searchParams.get("search") || undefined,
      is_published: searchParams.has("is_published")
        ? searchParams.get("is_published") === "true"
        : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const page = filters.page;
    const limit = filters.limit;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("documents")
      .select("*, category:category_id(id, name_fr, name_en)", {
        count: "exact",
      });

    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters.is_published !== undefined) {
      query = query.eq("is_published", filters.is_published);
    }

    if (filters.search) {
      query = query.or(
        `title_fr.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`,
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
    const status =
      error.message === "Non autorisé"
        ? 403
        : error.message === "Non authentifié" ||
            error.message === "Token invalide"
          ? 401
          : 500;
    return NextResponse.json(
      { error: error.message },
      {
        status,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await checkAdmin(request);

    const body = await request.json();
    console.log("Creating document:", body);

    // Valider les champs obligatoires
    const validated = documentSchema.parse(body);

    // Créer le document AVEC ocr_text et ocr_status
    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        category_id: validated.category_id,
        title_fr: validated.title_fr,
        title_en: validated.title_en,
        description_fr: validated.description_fr || null,
        description_en: validated.description_en || null,
        file_path: body.file_path || null,
        file_size: body.file_size || null,
        mime_type: body.mime_type || "application/pdf",
        ocr_text: body.ocr_text || null,
        ocr_status: body.ocr_status || "pending",
        is_published: validated.is_published ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      throw new Error(error.message);
    }

    console.log("Document created:", data.id);

    return NextResponse.json(data, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
    console.error("Create document error:", error);
    const status =
      error.message === "Non autorisé"
        ? 403
        : error.message === "Non authentifié" ||
            error.message === "Token invalide"
          ? 401
          : 400;
    return NextResponse.json(
      { error: error.message },
      {
        status,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}
