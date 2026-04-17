"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  approved: boolean;
  created_at: string;
}

export function UserRow({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  async function toggleApproval() {
    const newApproved = !profile.approved;
    const newRole = newApproved ? "admin" : "pending";

    await supabase
      .from("profiles")
      .update({ approved: newApproved, role: newRole })
      .eq("id", profile.id);

    router.refresh();
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-medium text-slate-900">{profile.email}</td>
      <td className="px-4 py-3 text-slate-500">
        {profile.full_name || "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            profile.role === "admin"
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {profile.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            profile.approved
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {profile.approved ? "Approuvé" : "En attente"}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500">
        {new Date(profile.created_at).toLocaleDateString("fr-FR")}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={toggleApproval}
          className={`text-xs font-medium ${
            profile.approved
              ? "text-red-500 hover:text-red-700"
              : "text-green-600 hover:text-green-800"
          }`}
        >
          {profile.approved ? "Révoquer" : "Approuver"}
        </button>
      </td>
    </tr>
  );
}
