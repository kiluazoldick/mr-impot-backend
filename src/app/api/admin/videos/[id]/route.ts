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

// GET - Détail d'une vidéo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin(request);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("*, category:category_id(id, name_fr, name_en)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    if (!data)
      return NextResponse.json({ error: "Vidéo non trouvée" }, { status: 404 });

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}

// PUT - Mettre à jour une vidéo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin(request);
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Ne pas envoyer file_path s'il est null
    if (updateData.file_path === null) delete updateData.file_path;

    const { data, error } = await supabaseAdmin
      .from("videos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
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

// DELETE - Supprimer une vidéo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin(request);
    const { id } = await params;

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

    return NextResponse.json(
      { success: true },
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
