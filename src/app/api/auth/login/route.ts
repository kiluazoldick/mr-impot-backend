import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";

  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const result = await AuthService.login(validated.email, validated.password);

    const response = NextResponse.json(
      {
        user: result.user,
        role: result.role,
        profile: result.profile,
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

    // Set cookies pour la session
    if (result.session) {
      response.cookies.set("sb-access-token", result.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set("sb-refresh-token", result.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json(
      { error: error.message || "Erreur de connexion" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}
