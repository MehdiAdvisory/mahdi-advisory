import { PartnerForm } from "@/components/partner-form";

export default function Home() {
  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-900">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            Formulaire partenaires
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <PartnerForm />
      </main>
    </>
  );
}
