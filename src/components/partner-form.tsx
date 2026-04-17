"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormData } from "@/lib/schemas";
import { EmployeeCard } from "./employee-card";
import { useState } from "react";

const EMPTY_SALARIE = {
  nom: "",
  prenom: "",
  date_naissance: "",
  salaire_brut_mensuel: NaN,
  type_contrat: "" as unknown as FormData["salaries"][number]["type_contrat"],
  poste: "",
};

export function PartnerForm() {
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_entreprise: "",
      siret: "",
      salaries: [{ ...EMPTY_SALARIE }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "salaries",
  });

  async function onSubmit(data: FormData) {
    setSubmitState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get("Content-Type") ?? "";

      if (contentType.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename =
          res.headers
            .get("Content-Disposition")
            ?.match(/filename="(.+?)"/)?.[1] ??
          `Analyse_SSM_${data.nom_entreprise.replace(/\s+/g, "_")}.pdf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();

        setSubmitState("success");
        reset();
        return;
      }

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error ?? `Erreur serveur (${res.status})`);
      }

      setSubmitState("success");
      reset();
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Entreprise */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Entreprise</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom de l&apos;entreprise <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex : Stradium Advisory"
              {...register("nom_entreprise")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            {errors.nom_entreprise && (
              <p className="mt-1 text-xs text-red-500">
                {errors.nom_entreprise.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              SIRET <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="14 chiffres"
              maxLength={14}
              {...register("siret")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            {errors.siret && (
              <p className="mt-1 text-xs text-red-500">
                {errors.siret.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Salariés */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Salariés</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ajoutez un ou plusieurs salariés puis envoyez.
          </p>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <EmployeeCard
              key={field.id}
              index={index}
              register={register}
              errors={errors}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ ...EMPTY_SALARIE })}
          className="mt-6 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Ajouter un salarié
        </button>
      </section>

      {/* Submit */}
      <div className="flex flex-col items-center gap-4">
        {submitState === "success" && (
          <div className="w-full rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
            Formulaire envoyé avec succès ! Le rapport PDF a été téléchargé.
          </div>
        )}
        {submitState === "error" && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={submitState === "loading"}
          className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitState === "loading" ? "Envoi en cours..." : "Envoyer"}
        </button>
      </div>
    </form>
  );
}
