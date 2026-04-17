import { createClient } from "@/lib/supabase/server";
import { UserRow } from "./user-row";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, approved, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Utilisateurs</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Nom
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Rôle
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Statut
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Inscrit le
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(profiles ?? []).map((profile) => (
              <UserRow key={profile.id} profile={profile} />
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Aucun utilisateur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
