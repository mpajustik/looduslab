import { PageHeader } from "../../ui/PageHeader";

export default function TeacherPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Kollane riba: õpilane ei tohi kunagi kahelda, kelle ala see on. */}
      <p className="rounded-lg bg-teacher-soft px-4 py-3 text-teacher">
        Õpetaja ala
      </p>
      <PageHeader
        title="Õpetajale"
        lead="Klassid, klassikoodid ja klassi ülevaade valmivad etapis 2."
      />
    </div>
  );
}
