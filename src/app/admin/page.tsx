import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: submissionCount },
    { count: pdfCount },
    { data: recent },
  ] = await Promise.all([
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("pdf_generations").select("*", { count: "exact", head: true }),
    supabase
      .from("submissions")
      .select("id, nom_entreprise, siret, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Soumissions", value: submissionCount ?? 0, icon: "📋" },
    { label: "PDFs générés", value: pdfCount ?? 0, icon: "📄" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        Dernières soumissions
      </h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Entreprise
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                SIRET
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(recent ?? []).map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {row.nom_entreprise}
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                  {row.siret}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(row.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {(!recent || recent.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Aucune soumission pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
