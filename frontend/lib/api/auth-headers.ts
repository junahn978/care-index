import createClient from "../supabase";

const supabase = createClient();

// every backend route needs the signed-in user's Supabase access token
export async function authHeaders() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error.message);
  }

  const token = session?.access_token;
  return { Authorization: `Bearer ${token}` };
}
