import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DuplicateButton, DeleteButton } from "./actions";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const q = params.q ?? "";
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const supabase = await createClient();

  let query = supabase
    .from("submissions")
    .select("id, nom_entreprise, siret, created_at, salaries(count)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (q) {
    query = query.ilike("nom_entreprise", `%${q}%`);
  }

  const { data: rows, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Soumissions</h1>
      </div>

      {/* Search */}
      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom d'entreprise..."
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

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
                Salariés
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Date
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(rows ?? []).map((row) => {
              const salaryCount =
                Array.isArray(row.salaries) && row.salaries.length > 0
                  ? (row.salaries[0] as { count: number }).count
                  : 0;
              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.nom_entreprise}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {row.siret}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{salaryCount}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(row.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/submissions/${row.id}`}
                      className="inline-block text-xs font-medium text-blue-600 hover:underline"
                    >
                      Éditer
                    </Link>
                    <Link
                      href={`/admin/submissions/${row.id}/pdfs`}
                      className="inline-block text-xs font-medium text-purple-600 hover:underline"
                    >
                      PDFs
                    </Link>
                    <DuplicateButton id={row.id} />
                    <DeleteButton id={row.id} />
                  </td>
                </tr>
              );
            })}
            {(!rows || rows.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Aucune soumission trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/submissions?page=${p}${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1 rounded text-sm ${
                p === page
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
