import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
export async function session() {
  return getAuth().api.getSession({ headers: await headers() });
}
export async function requireUser() {
  const s = await session();
  if (!s) redirect("/login");
  return s;
}
