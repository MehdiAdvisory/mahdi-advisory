"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { FormData } from "@/lib/schemas";
import { CONTRACT_TYPES } from "@/lib/schemas";

interface EmployeeCardProps {
  index: number;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export function EmployeeCard({
  index,
  register,
  errors,
  onRemove,
  canRemove,
}: EmployeeCardProps) {
  const e = errors.salaries?.[index];

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Salarié {index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clipRule="evenodd"
              />
            </svg>
            Supprimer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Dupont"
            {...register(`salaries.${index}.nom`)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {e?.nom && (
            <p className="mt-1 text-xs text-red-500">{e.nom.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Jean"
            {...register(`salaries.${index}.prenom`)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {e?.prenom && (
            <p className="mt-1 text-xs text-red-500">{e.prenom.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date de naissance <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register(`salaries.${index}.date_naissance`)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {e?.date_naissance && (
            <p className="mt-1 text-xs text-red-500">
              {e.date_naissance.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Salaire brut mensuel (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="3000"
            {...register(`salaries.${index}.salaire_brut_mensuel`, { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {e?.salaire_brut_mensuel && (
            <p className="mt-1 text-xs text-red-500">
              {e.salaire_brut_mensuel.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Type de contrat <span className="text-red-500">*</span>
          </label>
          <select
            {...register(`salaries.${index}.type_contrat`)}
            defaultValue=""
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              Sélectionner
            </option>
            {CONTRACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {e?.type_contrat && (
            <p className="mt-1 text-xs text-red-500">
              {e.type_contrat.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Poste <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Développeur, Comptable..."
            {...register(`salaries.${index}.poste`)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {e?.poste && (
            <p className="mt-1 text-xs text-red-500">{e.poste.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
