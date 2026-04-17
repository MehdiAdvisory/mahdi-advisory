import Airtable from "airtable";
import type { FormData } from "./schemas";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!);

const entrepriseTable = base("Entreprise");
const salariesTable = base("Salaries");

export async function insertFormData(data: FormData) {
  const entrepriseRecord = await entrepriseTable.create({
    "Nom de l'entreprise": data.nom_entreprise,
    SIRET: data.siret,
  });

  const salariesRecords = await salariesTable.create(
    data.salaries.map((s) => ({
      fields: {
        Nom: s.nom,
        Prénom: s.prenom,
        "Date de naissance": s.date_naissance,
        "Salaire brut mensuel": s.salaire_brut_mensuel,
        "Type de contrat": s.type_contrat,
        Poste: s.poste,
        Entreprise: [entrepriseRecord.getId()],
      },
    }))
  );

  return {
    entrepriseId: entrepriseRecord.getId(),
    salariesIds: salariesRecords.map((r) => r.getId()),
  };
}
