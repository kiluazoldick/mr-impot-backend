import { NextRequest, NextResponse } from "next/server";
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from("videos")
      .select("*, category:category_id(id, name_fr, name_en)", {
        count: "exact",
      })
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

export async function POST(request: NextRequest) {
  try {
    await checkAdmin(request);
    const contentType = request.headers.get("content-type") || "";
    let body: any = {};
    let file_path: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const dataStr = formData.get("data") as string;
      const file = formData.get("file") as File | null;
      if (!dataStr) throw new Error("Données manquantes");
      body = JSON.parse(dataStr);

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;
        const { data: uploadData, error: uploadError } =
          await supabaseAdmin.storage
            .from("videos")
            .upload(fileName, buffer, {
              contentType: file.type || "video/mp4",
              upsert: false,
            });
        if (uploadError)
          throw new Error(`Erreur d'upload: ${uploadError.message}`);
        file_path = uploadData?.path || fileName;
      }
    } else {
      body = await request.json();
    }

    const { data, error } = await supabaseAdmin
      .from("videos")
      .insert({
        category_id: body.category_id,
        title_fr: body.title_fr,
        title_en: body.title_en,
        description_fr: body.description_fr || null,
        description_en: body.description_en || null,
        file_path,
        is_published: body.is_published ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(data, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
    console.error("Create video error:", error);
    return NextResponse.json(
      { error: error.message },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}
