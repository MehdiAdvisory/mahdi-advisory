import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditSubmissionForm } from "./edit-form";

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const { data: salaries } = await supabase
    .from("salaries")
    .select("*")
    .eq("submission_id", id)
    .order("id");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Modifier : {submission.nom_entreprise}
      </h1>
      <EditSubmissionForm
        submission={submission}
        salaries={salaries ?? []}
      />
    </div>
  );
}
