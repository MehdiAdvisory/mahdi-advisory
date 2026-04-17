export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: {
          id: string;
          nom_entreprise: string;
          siret: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nom_entreprise: string;
          siret: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nom_entreprise?: string;
          siret?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      salaries: {
        Row: {
          id: string;
          submission_id: string;
          nom: string;
          prenom: string;
          date_naissance: string;
          salaire_brut_mensuel: number;
          type_contrat: string;
          poste: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          nom: string;
          prenom: string;
          date_naissance: string;
          salaire_brut_mensuel: number;
          type_contrat: string;
          poste: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          nom?: string;
          prenom?: string;
          date_naissance?: string;
          salaire_brut_mensuel?: number;
          type_contrat?: string;
          poste?: string;
        };
        Relationships: [
          {
            foreignKeyName: "salaries_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      pdf_generations: {
        Row: {
          id: string;
          submission_id: string;
          filename: string;
          storage_path: string;
          simulation_snapshot: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          filename: string;
          storage_path: string;
          simulation_snapshot: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          filename?: string;
          storage_path?: string;
          simulation_snapshot?: Record<string, unknown>;
        };
        Relationships: [
          {
            foreignKeyName: "pdf_generations_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      pdf_config: {
        Row: {
          id: number;
          config: PdfConfigValues;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          config: PdfConfigValues;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          config?: PdfConfigValues;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          role?: string;
          approved?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface PdfConfigValues {
  ajustement_salaire: number;
  participation_employeur: number;
  prevention_ergonomique: number;
  commission_rate: number;
  forfait_demarrage: number;
  base_scenario_amount: number;
  tuteur_monthly: number;
  charge_rate_standard: number;
  charge_rate_optimized: number;
  cost_thresholds: number[];
  economy_thresholds: number[];
  age_min_100: number;
  age_max_100: number;
}

export const DEFAULT_PDF_CONFIG: PdfConfigValues = {
  ajustement_salaire: 150,
  participation_employeur: 0,
  prevention_ergonomique: 2735,
  commission_rate: 0.10,
  forfait_demarrage: 990,
  base_scenario_amount: 7300,
  tuteur_monthly: 230,
  charge_rate_standard: 1.27,
  charge_rate_optimized: 1.19,
  cost_thresholds: [50000, 100000, 200000, 400000, 700000, 1200000],
  economy_thresholds: [150000, 100000, 70000, 50000, 35000, 20000],
  age_min_100: 16,
  age_max_100: 29,
};
