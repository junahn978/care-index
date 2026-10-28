import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Google -> Supabase redirects here with a one-time ?code= after the user consents
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          // includes the PKCE code verifier the browser client stored when the flow started
          getAll() {
            return cookieStore.getAll();
          },
          // writes the new session cookies onto the redirect response below
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    // trades the code (+ verifier) for a session; codes are single-use
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // no code, or the exchange failed (expired/reused code, user cancelled)
  return NextResponse.redirect(new URL("/login", request.url));
}
