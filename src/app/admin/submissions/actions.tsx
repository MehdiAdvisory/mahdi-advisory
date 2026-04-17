"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DuplicateButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDuplicate() {
    const { data: original } = await supabase
      .from("submissions")
      .select("nom_entreprise, siret")
      .eq("id", id)
      .single();

    if (!original) return;

    const { data: newSub } = await supabase
      .from("submissions")
      .insert({
        nom_entreprise: `${original.nom_entreprise} (copie)`,
        siret: original.siret,
      })
      .select("id")
      .single();

    if (!newSub) return;

    const { data: salaries } = await supabase
      .from("salaries")
      .select("nom, prenom, date_naissance, salaire_brut_mensuel, type_contrat, poste")
      .eq("submission_id", id);

    if (salaries && salaries.length > 0) {
      await supabase.from("salaries").insert(
        salaries.map((s) => ({ ...s, submission_id: newSub.id })),
      );
    }

    router.push(`/admin/submissions/${newSub.id}`);
    router.refresh();
  }

  return (
    <button
      onClick={handleDuplicate}
      className="text-xs font-medium text-slate-500 hover:text-slate-800"
    >
      Dupliquer
    </button>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Supprimer cette soumission et tous ses PDFs ?")) return;
    await supabase.from("submissions").delete().eq("id", id);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs font-medium text-red-500 hover:text-red-700"
    >
      Supprimer
    </button>
  );
}
