"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PdfConfigValues } from "@/lib/supabase/types";

interface FieldDef {
  key: keyof PdfConfigValues;
  label: string;
  description: string;
  type: "number" | "array";
  suffix?: string;
}

const FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Constantes de calcul",
    fields: [
      { key: "ajustement_salaire", label: "Ajustement salaire", description: "€/mois par salarié", type: "number", suffix: "€/mois" },
      { key: "participation_employeur", label: "Participation employeur", description: "€/an", type: "number", suffix: "€/an" },
      { key: "prevention_ergonomique", label: "Prévention ergonomique", description: "Montant forfaitaire", type: "number", suffix: "€" },
      { key: "commission_rate", label: "Taux de commission", description: "Ex: 0.10 = 10%", type: "number" },
      { key: "forfait_demarrage", label: "Forfait démarrage", description: "€ HT", type: "number", suffix: "€ HT" },
      { key: "base_scenario_amount", label: "Plafond scénario annuel", description: "€/an", type: "number", suffix: "€/an" },
      { key: "tuteur_monthly", label: "Scénario tuteur mensuel", description: "€/mois", type: "number", suffix: "€/mois" },
    ],
  },
  {
    title: "Taux de charges",
    fields: [
      { key: "charge_rate_standard", label: "Taux standard", description: "Multiplicateur (ex: 1.27)", type: "number" },
      { key: "charge_rate_optimized", label: "Taux optimisé", description: "Multiplicateur (ex: 1.19)", type: "number" },
    ],
  },
  {
    title: "Seuils DPE",
    fields: [
      { key: "cost_thresholds", label: "Seuils coûts (ascendants)", description: "6 valeurs séparées par des virgules", type: "array" },
      { key: "economy_thresholds", label: "Seuils économies (descendants)", description: "6 valeurs séparées par des virgules", type: "array" },
    ],
  },
  {
    title: "Éligibilité par âge",
    fields: [
      { key: "age_min_100", label: "Âge min scénario 100%", description: "Inclus", type: "number" },
      { key: "age_max_100", label: "Âge max scénario 100%", description: "Inclus", type: "number" },
    ],
  },
];

export function PdfConfigEditor({
  initialConfig,
}: {
  initialConfig: PdfConfigValues;
}) {
  const [config, setConfig] = useState<PdfConfigValues>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  function updateField(key: keyof PdfConfigValues, value: number | number[]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("pdf_config")
      .update({ config })
      .eq("id", 1);

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage("Configuration sauvegardée avec succès");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      {FIELD_GROUPS.map((group) => (
        <div
          key={group.title}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {group.title}
          </h2>
          <div className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key} className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.suffix && (
                      <span className="text-slate-400 font-normal ml-1">
                        ({field.suffix})
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-slate-400 mb-1.5">
                    {field.description}
                  </p>
                  {field.type === "number" ? (
                    <input
                      type="number"
                      step="any"
                      value={config[field.key] as number}
                      onChange={(e) =>
                        updateField(field.key, parseFloat(e.target.value) || 0)
                      }
                      className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      value={(config[field.key] as number[]).join(", ")}
                      onChange={(e) => {
                        const arr = e.target.value
                          .split(",")
                          .map((v) => parseFloat(v.trim()))
                          .filter((v) => !isNaN(v));
                        updateField(field.key, arr);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Sauvegarde..." : "Sauvegarder la configuration"}
      </button>
    </div>
  );
}
