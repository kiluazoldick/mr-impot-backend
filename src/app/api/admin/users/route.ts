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

// GET - Lister tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    await checkAdmin(request);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

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
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}

// POST - Créer un admin
export async function POST(request: NextRequest) {
  try {
    await checkAdmin(request);

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      throw new Error("Email, mot de passe et nom requis");
    }

    // Créer l'utilisateur dans Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name,
            role: "admin",
          },
        },
      });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Échec création utilisateur");

    // Mettre à jour le profil avec le rôle admin
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Erreur mise à jour rôle:", updateError);
      throw new Error(updateError.message);
    }

    return NextResponse.json(
      {
        id: authData.user.id,
        email: authData.user.email,
        role: "admin",
        message: "Admin créé avec succès",
      },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  } catch (error: any) {
    console.error("Create admin error:", error);
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
