import { createClient } from "./server";

export type SessionUser = { id: string; email: string; name: string | null; avatarUrl: string | null };

/** Người dùng hiện tại (null nếu chưa đăng nhập), kèm tên và ảnh từ Google. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const m = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  return { id: user.id, email: user.email ?? "", name: m.full_name ?? m.name ?? null, avatarUrl: m.avatar_url ?? m.picture ?? null };
}
