import { createClient } from "@/lib/supabase/server";

/** Email gốc — luôn là admin, không gỡ được. */
export const OWNER_EMAIL = "lananh.laxi@gmail.com";
export const isOwner = (e?: string | null) => (e ?? "").toLowerCase() === OWNER_EMAIL;

/** Admin = email gốc hoặc có trong allowed_emails với role admin (server-side). */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (isOwner(user.email)) return true;
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}
