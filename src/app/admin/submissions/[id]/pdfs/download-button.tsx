"use client";

import { createClient } from "@/lib/supabase/client";

export function DownloadPdfButton({
  storagePath,
  filename,
}: {
  storagePath: string;
  filename: string;
}) {
  const supabase = createClient();

  async function handleDownload() {
    const { data, error } = await supabase.storage
      .from("pdfs")
      .createSignedUrl(storagePath, 60);

    if (error || !data?.signedUrl) {
      alert("Impossible de générer le lien de téléchargement");
      return;
    }

    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = filename;
    a.click();
  }

  return (
    <button
      onClick={handleDownload}
      className="text-xs font-medium text-blue-600 hover:underline"
    >
      Télécharger
    </button>
  );
}
