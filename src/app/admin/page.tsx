import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";

export default async function AdminIndexPage() {
  const admin = await getAdminContext();
  redirect(admin ? "/admin/dashboard" : "/admin/login");
}
