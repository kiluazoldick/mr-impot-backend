import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/lib/services/category.service";
import { categorySchema } from "@/lib/validations/category";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin(request);
    const { id } = await params;
    const category = await CategoryService.getById(id);
    return NextResponse.json(category, {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validated = categorySchema.partial().parse(body);
    const category = await CategoryService.update(id, validated);
    return NextResponse.json(category, {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin(request);
    const { id } = await params;
    await CategoryService.delete(id);
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
