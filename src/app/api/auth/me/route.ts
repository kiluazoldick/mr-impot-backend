import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis le cookie ou le header Authorization
    const accessToken =
      request.cookies.get("sb-access-token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier l'utilisateur avec le token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error("Auth error:", error);
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Récupérer le profil complet avec admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profile || null,
    });
  } catch (error: any) {
    console.error("Me error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
