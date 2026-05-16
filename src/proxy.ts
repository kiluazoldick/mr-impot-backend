import { NextResponse, type NextRequest } from "next/server";

// Plus de supabase dans le middleware ! On utilise juste les cookies
// La vérification admin se fera dans chaque route API

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export async function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isPreflight = request.method === "OPTIONS";

  // Répondre aux requêtes OPTIONS (preflight CORS)
  if (isPreflight) {
    const response = new NextResponse(null, { status: 204 });
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Protéger les routes admin : juste vérifier que le cookie existe
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const accessToken =
      request.cookies.get("sb-access-token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401, headers: corsHeaders(origin) },
      );
    }
    // La vérification du rôle se fera dans la route API elle-même
  }

  // Pour toutes les autres requêtes, ajouter les headers CORS
  const response = NextResponse.next();
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
