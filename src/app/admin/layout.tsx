import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, role, approved")
    .eq("id", user.id)
    .single();

  if (!profile?.approved) redirect("/login?error=not_approved");

  return (
    <AdminShell email={profile.email} name={profile.full_name}>
      {children}
    </AdminShell>
  );
}
