import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../supabase/admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export class AuthService {
  static async login(email: string, password: string) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Récupérer le profil avec le client admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, first_name, last_name, preferred_language")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      // Créer le profil s'il n'existe pas
      const { data: newProfile } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email!,
          role: "user",
        })
        .select()
        .single();

      return {
        user: { id: data.user.id, email: data.user.email },
        session: data.session,
        role: "user",
        profile: newProfile,
      };
    }

    return {
      user: { id: data.user.id, email: data.user.email },
      session: data.session,
      role: profile?.role || "user",
      profile,
    };
  }

  static async register(
    email: string,
    password: string,
    first_name?: string,
    last_name?: string,
  ) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, last_name },
      },
    });

    if (error) {
      console.error("Register error:", error.message);
      throw new Error(error.message);
    }

    return data;
  }

  static async getCurrentUser(accessToken: string) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw new Error("Non authentifié");
    }

    return user;
  }
}
