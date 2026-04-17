import type { FormData, SalarieFormData } from "./schemas";
import { type PdfConfigValues, DEFAULT_PDF_CONFIG } from "./supabase/types";

export type { PdfConfigValues };
export { DEFAULT_PDF_CONFIG };

// ── Age calculation ──

export function calculateAge(dateNaissance: string): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ── Contract type helpers ──

function isCDIorCDD(contrat: string): boolean {
  return contrat === "CDI" || contrat === "CDD";
}

function isApprentissage(contrat: string): boolean {
  return contrat === "Contrat d'apprentissage";
}

function isAlternanceOrPro(contrat: string): boolean {
  return contrat === "Alternance" || contrat === "Contrat de professionnalisation";
}

// ── Per-employee enrichment ──

export interface EnrichedSalarie extends SalarieFormData {
  age: number;
  ajustement_salaire: number;
  ajustement_annuel: number;
  participation: number;
  scenario_100: number;
  scenario_derogation: number;
  scenario_tuteur: number;
  best_scenario: number;
}

export function enrichSalarie(s: SalarieFormData, cfg: PdfConfigValues): EnrichedSalarie {
  const age = calculateAge(s.date_naissance);
  const ajustement_salaire = cfg.ajustement_salaire;
  const ajustement_annuel = ajustement_salaire * 12;
  const participation = cfg.participation_employeur;

  const estCDIouCDD = isCDIorCDD(s.type_contrat);
  const estApprentissage = isApprentissage(s.type_contrat);
  const estAlternanceOuPro = isAlternanceOrPro(s.type_contrat);

  const scenario_100 =
    estCDIouCDD && age >= cfg.age_min_100 && age <= cfg.age_max_100
      ? Math.max(0, cfg.base_scenario_amount - participation - ajustement_annuel)
      : 0;

  const derogationPossible = age > cfg.age_max_100 || age < cfg.age_min_100;
  const scenario_derogation =
    estCDIouCDD && derogationPossible
      ? Math.max(0, cfg.base_scenario_amount - participation - ajustement_annuel)
      : 0;

  const scenario_tuteur =
    !estApprentissage && (estAlternanceOuPro || (estCDIouCDD && age > cfg.age_max_100))
      ? cfg.tuteur_monthly * 12
      : 0;

  const best_scenario = Math.max(scenario_100, scenario_derogation, scenario_tuteur);

  return {
    ...s,
    age,
    ajustement_salaire,
    ajustement_annuel,
    participation,
    scenario_100,
    scenario_derogation,
    scenario_tuteur,
    best_scenario,
  };
}

// ── Effectif counts ──

export interface EffectifCounts {
  cdi: number;
  cdd: number;
  alternance: number;
  apprentissage: number;
  professionnalisation: number;
  total: number;
}

export function countEffectifs(salaries: SalarieFormData[]): EffectifCounts {
  const counts: EffectifCounts = {
    cdi: 0,
    cdd: 0,
    alternance: 0,
    apprentissage: 0,
    professionnalisation: 0,
    total: salaries.length,
  };
  for (const s of salaries) {
    switch (s.type_contrat) {
      case "CDI": counts.cdi++; break;
      case "CDD": counts.cdd++; break;
      case "Alternance": counts.alternance++; break;
      case "Contrat d'apprentissage": counts.apprentissage++; break;
      case "Contrat de professionnalisation": counts.professionnalisation++; break;
    }
  }
  return counts;
}

// ── Aggregate calculations ──

export interface SimulationResult {
  entreprise: { nom: string; siret: string };
  effectifs: EffectifCounts;
  salaries: EnrichedSalarie[];
  coutActuel: number;
  coutOptimise: number;
  economie: number;
  economie100: number;
  economieNetteTotale: number;
  commission: number;
  economieNette: number;
  paiementMensuel: number;
  date: string;
  config: PdfConfigValues;
}

export function computeSimulation(
  data: FormData,
  cfg: PdfConfigValues = DEFAULT_PDF_CONFIG,
): SimulationResult {
  const enriched = data.salaries.map((s) => enrichSalarie(s, cfg));
  const effectifs = countEffectifs(data.salaries);

  const coutActuel = enriched.reduce(
    (sum, s) => sum + s.salaire_brut_mensuel * 12 * cfg.charge_rate_standard,
    0,
  );

  const coutOptimise = enriched.reduce((sum, s) => {
    const rate =
      isCDIorCDD(s.type_contrat) && s.age >= cfg.age_min_100 && s.age <= cfg.age_max_100
        ? cfg.charge_rate_optimized
        : cfg.charge_rate_standard;
    return sum + s.salaire_brut_mensuel * 12 * rate;
  }, 0);

  const economie = coutActuel - coutOptimise;

  const economie100 =
    enriched.reduce((sum, s) => sum + s.scenario_100, 0) +
    cfg.prevention_ergonomique;

  const economieNetteTotale =
    enriched.reduce((sum, s) => sum + s.best_scenario, 0) +
    cfg.prevention_ergonomique;

  const commission = economie100 * cfg.commission_rate;
  const economieNette = economie100 - commission;
  const paiementMensuel = (economie100 / 12) * cfg.commission_rate;

  return {
    entreprise: { nom: data.nom_entreprise, siret: data.siret },
    effectifs,
    salaries: enriched,
    coutActuel,
    coutOptimise,
    economie,
    economie100,
    economieNetteTotale,
    commission,
    economieNette,
    paiementMensuel,
    date: new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    config: cfg,
  };
}

// ── Formatting helpers ──

function sanitizeSpaces(str: string): string {
  return str.replace(/[\u00A0\u202F\u2009]/g, " ");
}

export function formatEuro(value: number): string {
  const raw = value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return sanitizeSpaces(raw) + " €";
}

export function formatEuroShort(value: number): string {
  const raw = value.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return sanitizeSpaces(raw) + " €";
}
