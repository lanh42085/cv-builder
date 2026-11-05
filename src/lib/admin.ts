export const ADMIN_EMAIL = "lananh.laxi@gmail.com";
export const isAdminEmail = (e?: string | null) => (e ?? "").toLowerCase() === ADMIN_EMAIL;
