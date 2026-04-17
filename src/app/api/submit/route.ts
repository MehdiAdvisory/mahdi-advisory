import { NextResponse } from "next/server";
import { formSchema } from "@/lib/schemas";
import { insertFormData } from "@/lib/airtable";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = formSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await insertFormData(parsed.data);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
