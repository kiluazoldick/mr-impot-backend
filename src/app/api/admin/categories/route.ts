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

export async function GET(request: NextRequest) {
  try {
    await checkAdmin(request);

    const includeInactive =
      request.nextUrl.searchParams.get("includeInactive") === "true";

    console.log("📦 Fetching categories, includeInactive:", includeInactive);

    const categories = await CategoryService.getAll(includeInactive);

    console.log("📦 Categories fetched:", categories?.length, "items");

    return NextResponse.json(categories, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
    console.error("❌ GET /api/admin/categories error:", error.message);

    const status =
      error.message === "Non autorisé"
        ? 403
        : error.message === "Non authentifié" ||
            error.message === "Token invalide"
          ? 401
          : 500;

    return NextResponse.json(
      { error: error.message || "Erreur inconnue" },
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
    const validated = categorySchema.parse(body);
    const category = await CategoryService.create(validated);

    return NextResponse.json(category, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
    const status = error.message === "Non autorisé" ? 403 : 400;
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
