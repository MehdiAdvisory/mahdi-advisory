import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { formSchema } from "@/lib/schemas";
import { computeSimulation } from "@/lib/calculations";
import { RapportDocument } from "@/lib/pdf/rapport-document";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_PDF_CONFIG } from "@/lib/supabase/types";
import type { PdfConfigValues } from "@/lib/supabase/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = formSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation échouée", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Fetch pdf_config (service role bypasses RLS)
    const { data: configRow } = await supabase
      .from("pdf_config")
      .select("config")
      .eq("id", 1)
      .single();

    const cfg: PdfConfigValues = configRow?.config ?? DEFAULT_PDF_CONFIG;

    // Insert submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        nom_entreprise: parsed.data.nom_entreprise,
        siret: parsed.data.siret,
      })
      .select("id")
      .single();

    if (subError || !submission) {
      console.error("Submission insert error:", subError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Insert salaries
    const salaryRows = parsed.data.salaries.map((s) => ({
      submission_id: submission.id,
      nom: s.nom,
      prenom: s.prenom,
      date_naissance: s.date_naissance,
      salaire_brut_mensuel: s.salaire_brut_mensuel,
      type_contrat: s.type_contrat,
      poste: s.poste,
    }));

    const { error: salError } = await supabase
      .from("salaries")
      .insert(salaryRows);

    if (salError) {
      console.error("Salaries insert error:", salError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Compute simulation with dynamic config
    const simulation = computeSimulation(parsed.data, cfg);

    // Render PDF
    const pdfBuffer = await renderToBuffer(
      RapportDocument({ data: simulation }),
    );

    // Upload PDF to Storage
    const safeName = parsed.data.nom_entreprise
      .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "")
      .replace(/\s+/g, "_");
    const filename = `Analyse_SSM_${safeName}.pdf`;
    const storagePath = `${submission.id}/${Date.now()}_${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(storagePath, new Uint8Array(pdfBuffer), {
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("PDF upload error:", uploadError);
    }

    // Save pdf_generations record
    await supabase.from("pdf_generations").insert({
      submission_id: submission.id,
      filename,
      storage_path: storagePath,
      simulation_snapshot: simulation as unknown as Record<string, unknown>,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
