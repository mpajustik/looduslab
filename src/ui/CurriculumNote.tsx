import type { ReactNode } from "react";
import { AccordionItem } from "./Accordion";
import { curriculumBlocks } from "../lib/curriculumSource";
import { moduleCurriculum } from "../lib/curriculum";

/**
 * „Mida see tund ainekavast katab" – õpetaja vaate plokk (plaan 4.0b).
 *
 * Miks see üldse on: katvusraport (`npm run coverage`) vastab MULLE
 * ehitajana küsimusele „mis on veel katmata". Õpetajal on teine küsimus –
 * „kas ma tohin selle tunni oma töökavva panna ja mille kohta ta käib".
 * Sama andmed, teine suund: raport vaatab ainekavalt moodulile, see plokk
 * moodulilt ainekavale.
 *
 * Kokku pandud (`<details>`), sest tunni jagamise hetkel on tähtsam link ja
 * QR. Ainekava seos on see, mida vaadatakse ÜKS kord tunni valimisel –
 * ligipääsetavuse annab brauseri enda element (vt Accordion.tsx).
 *
 * See on ÕPETAJA ala plokk: õpilase vaates ainekava ID-sid ei ole. Laps ei
 * õpi „P1-T2" – tema jaoks on eesmärk manifesti `goal` („Oskan ennustada,
 * kuhu valguskiir peegeldub").
 */
export function CurriculumNote({
  manifest,
}: {
  manifest: {
    outcomes: readonly string[];
    concepts: readonly string[];
    practicalWork: readonly string[];
  };
}) {
  const seos = moduleCurriculum(curriculumBlocks(), manifest);
  const known = seos.concepts.filter((concept) => concept.inCurriculum);
  const extra = seos.concepts.filter((concept) => !concept.inCurriculum);
  const count = seos.outcomes.length + seos.practicalWork.length;

  return (
    <AccordionItem
      title="Mida see tund ainekavast katab"
      meta={count === 1 ? "1 punkt" : `${count} punkti`}
    >
      <dl className="flex flex-col gap-4">
        <Rida label="Õpitulemused">
          <Kirjed entries={seos.outcomes} />
        </Rida>

        {seos.practicalWork.length > 0 ? (
          <Rida label="Praktilised tööd">
            <Kirjed entries={seos.practicalWork} />
          </Rida>
        ) : null}

        <Rida label="Põhimõisted ainekavast">
          <p>
            {known.length > 0
              ? known.map((concept) => concept.name).join(", ")
              : "Ükski selle mooduli mõistetest ei ole ainekavas nimeliselt kirjas."}
          </p>
        </Rida>

        {/* Ainekava põhimõisted on MIINIMUM, mitte lubatud sõnade loend –
            „peegeldumisnurk" on hea mõiste ka siis, kui ainekava teda ei
            nimeta. Eraldi reana selleks, et õpetaja teaks, kumb on kumb,
            kui ta tunnikavva ainekava sõnastust kopeerib. */}
        {extra.length > 0 ? (
          <Rida label="Lisaks selles tunnis">
            <p>{extra.map((concept) => concept.name).join(", ")}</p>
          </Rida>
        ) : null}
      </dl>
    </AccordionItem>
  );
}

function Rida({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-medium text-ink">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * ID on alati ees, tekst tema järel. ID-ta ei saa õpetaja seost ainekava
 * failis üles otsida; tekstita ei tea ta, mida ID tähendab.
 *
 * Tühi tekst = manifest viitab ID-le, mida ainekavas EI OLE (trükiviga).
 * Vaikselt ära jättes arvaks õpetaja, et seost polegi – seepärast on rida
 * ekraanil koos ausa selgitusega. `npm run coverage` kukub sellise viite
 * peal läbi, nii et see olukord ei tohiks õpetajani jõuda.
 */
function Kirjed({ entries }: { entries: { id: string; text: string }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.id}>
          <span className="font-mono text-ink">{entry.id}</span>{" "}
          {entry.text === "" ? (
            <em>seda ID-d ei ole ainekava failis</em>
          ) : (
            entry.text
          )}
        </li>
      ))}
    </ul>
  );
}
