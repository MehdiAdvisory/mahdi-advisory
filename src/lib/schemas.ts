import { z } from "zod";

export const CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "Alternance",
  "Contrat d'apprentissage",
  "Contrat de professionnalisation",
] as const;

export const salarieSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  date_naissance: z.string().min(1, "La date de naissance est requise"),
  salaire_brut_mensuel: z
    .number({ message: "Le salaire doit être un nombre" })
    .positive("Le salaire doit être positif"),
  type_contrat: z.enum(CONTRACT_TYPES, {
    message: "Sélectionnez un type de contrat",
  }),
  poste: z.string().min(1, "Le poste est requis"),
});

export const formSchema = z.object({
  nom_entreprise: z.string().min(1, "Le nom de l'entreprise est requis"),
  siret: z
    .string()
    .length(14, "Le SIRET doit contenir exactement 14 chiffres")
    .regex(/^\d{14}$/, "Le SIRET ne doit contenir que des chiffres"),
  salaries: z
    .array(salarieSchema)
    .min(1, "Ajoutez au moins un salarié"),
});

export type SalarieFormData = z.infer<typeof salarieSchema>;
export type FormData = z.infer<typeof formSchema>;
