import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const NAME = "admin_session";
const token = () => createHmac("sha256", process.env.SESSION_SECRET ?? "").update("admin").digest("hex");

export function passwordOk(p: string) {
  const a = Buffer.from(p);
  const b = Buffer.from(process.env.ADMIN_PASSWORD ?? "");
  return b.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}
export async function setSession() {
  (await cookies()).set(NAME, token(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 24 * 7,
  });
}
export async function clearSession() {
  (await cookies()).delete(NAME);
}
export async function isAdmin() {
  if (!process.env.SESSION_SECRET) return false;
  const v = (await cookies()).get(NAME)?.value;
  const t = token();
  return !!v && v.length === t.length && timingSafeEqual(Buffer.from(v), Buffer.from(t));
}
