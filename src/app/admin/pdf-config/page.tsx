import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PDF_CONFIG } from "@/lib/supabase/types";
import { PdfConfigEditor } from "./editor";

export default async function PdfConfigPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pdf_config")
    .select("config, updated_at")
    .eq("id", 1)
    .single();

  const config = data?.config ?? DEFAULT_PDF_CONFIG;
  const updatedAt = data?.updated_at ?? null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Configuration PDF
          </h1>
          {updatedAt && (
            <p className="text-sm text-slate-500 mt-1">
              Dernière mise à jour :{" "}
              {new Date(updatedAt).toLocaleString("fr-FR")}
            </p>
          )}
        </div>
      </div>
      <PdfConfigEditor initialConfig={config} />
    </div>
  );
}
