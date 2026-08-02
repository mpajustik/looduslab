import type { ReactNode } from "react";

/** Iga lehe ühesugune algus: üks pealkiri ja üks selgitav lause. */
export function PageHeader({
  title,
  lead,
}: {
  title: string;
  lead?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {lead ? <p className="text-lg text-ink-soft">{lead}</p> : null}
    </header>
  );
}
