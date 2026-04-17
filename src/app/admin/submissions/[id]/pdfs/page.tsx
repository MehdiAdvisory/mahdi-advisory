import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DownloadPdfButton } from "./download-button";

export default async function PdfHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, nom_entreprise")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const { data: pdfs } = await supabase
    .from("pdf_generations")
    .select("id, filename, storage_path, created_at")
    .eq("submission_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/submissions/${id}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; Retour
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          PDFs : {submission.nom_entreprise}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Fichier
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Généré le
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(pdfs ?? []).map((pdf) => (
              <tr key={pdf.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {pdf.filename}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(pdf.created_at).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <DownloadPdfButton
                    storagePath={pdf.storage_path}
                    filename={pdf.filename}
                  />
                </td>
              </tr>
            ))}
            {(!pdfs || pdfs.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Aucun PDF généré pour cette soumission
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
