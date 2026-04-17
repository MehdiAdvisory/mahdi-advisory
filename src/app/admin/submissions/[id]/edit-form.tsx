"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CONTRACT_TYPES } from "@/lib/schemas";
import type { Database } from "@/lib/supabase/types";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type Salary = Database["public"]["Tables"]["salaries"]["Row"];

interface SalaryDraft {
  id?: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  salaire_brut_mensuel: number;
  type_contrat: string;
  poste: string;
}

export function EditSubmissionForm({
  submission,
  salaries: initialSalaries,
}: {
  submission: Submission;
  salaries: Salary[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [nomEntreprise, setNomEntreprise] = useState(submission.nom_entreprise);
  const [siret, setSiret] = useState(submission.siret);
  const [salaries, setSalaries] = useState<SalaryDraft[]>(
    initialSalaries.map((s) => ({
      id: s.id,
      nom: s.nom,
      prenom: s.prenom,
      date_naissance: s.date_naissance,
      salaire_brut_mensuel: s.salaire_brut_mensuel,
      type_contrat: s.type_contrat,
      poste: s.poste,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function addSalary() {
    setSalaries([
      ...salaries,
      { nom: "", prenom: "", date_naissance: "", salaire_brut_mensuel: 0, type_contrat: "CDI", poste: "" },
    ]);
  }

  function removeSalary(idx: number) {
    setSalaries(salaries.filter((_, i) => i !== idx));
  }

  function updateSalary(idx: number, field: keyof SalaryDraft, value: string | number) {
    setSalaries(salaries.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    await supabase
      .from("submissions")
      .update({ nom_entreprise: nomEntreprise, siret })
      .eq("id", submission.id);

    // Delete existing salaries and re-insert
    await supabase.from("salaries").delete().eq("submission_id", submission.id);
    if (salaries.length > 0) {
      await supabase.from("salaries").insert(
        salaries.map((s) => ({
          submission_id: submission.id,
          nom: s.nom,
          prenom: s.prenom,
          date_naissance: s.date_naissance,
          salaire_brut_mensuel: s.salaire_brut_mensuel,
          type_contrat: s.type_contrat,
          poste: s.poste,
        })),
      );
    }

    setMessage("Sauvegardé avec succès");
    setSaving(false);
    router.refresh();
  }

  async function handleRegenerate() {
    setGenerating(true);
    setMessage(null);

    const body = {
      nom_entreprise: nomEntreprise,
      siret,
      salaries: salaries.map((s) => ({
        nom: s.nom,
        prenom: s.prenom,
        date_naissance: s.date_naissance,
        salaire_brut_mensuel: s.salaire_brut_mensuel,
        type_contrat: s.type_contrat,
        poste: s.poste,
      })),
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.headers.get("Content-Type")?.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Analyse_SSM_${nomEntreprise.replace(/\s+/g, "_")}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage("PDF régénéré et téléchargé");
      } else {
        const err = await res.json();
        setMessage(`Erreur: ${err.error}`);
      }
    } catch {
      setMessage("Erreur lors de la régénération");
    }

    setGenerating(false);
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      {/* Company fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Entreprise</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom de l&apos;entreprise
            </label>
            <input
              value={nomEntreprise}
              onChange={(e) => setNomEntreprise(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SIRET
            </label>
            <input
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Salaries */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Salariés ({salaries.length})
          </h2>
          <button
            onClick={addSalary}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Ajouter un salarié
          </button>
        </div>

        <div className="space-y-4">
          {salaries.map((sal, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Salarié {idx + 1}
                </span>
                <button
                  onClick={() => removeSalary(idx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  placeholder="Prénom"
                  value={sal.prenom}
                  onChange={(e) => updateSalary(idx, "prenom", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Nom"
                  value={sal.nom}
                  onChange={(e) => updateSalary(idx, "nom", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={sal.date_naissance}
                  onChange={(e) => updateSalary(idx, "date_naissance", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Salaire brut mensuel"
                  value={sal.salaire_brut_mensuel || ""}
                  onChange={(e) => updateSalary(idx, "salaire_brut_mensuel", parseFloat(e.target.value) || 0)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <select
                  value={sal.type_contrat}
                  onChange={(e) => updateSalary(idx, "type_contrat", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {CONTRACT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Poste"
                  value={sal.poste}
                  onChange={(e) => updateSalary(idx, "poste", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? "Génération..." : "Régénérer le PDF"}
        </button>
      </div>
    </div>
  );
}
