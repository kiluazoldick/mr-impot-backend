import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";

  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const result = await AuthService.register(
      validated.email,
      validated.password,
      validated.first_name,
      validated.last_name,
    );

    // Renvoyer le token si disponible (si confirmation email désactivée)
    return NextResponse.json(
      {
        user: result.user,
        session: result.session
          ? {
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
              expires_at: result.session.expires_at,
            }
          : null,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  } catch (error: any) {
    console.error("Register error:", error.message);
    return NextResponse.json(
      { error: error.message || "Erreur d'inscription" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}
