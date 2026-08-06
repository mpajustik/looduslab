import { useEffect, useState } from "react";
import { course } from "../content/fyysika-8";
import { blockModules } from "../content/schema";
import type { ModuleManifest } from "../engine/contract";
import { moduleRegistry } from "../modules/registry";

/** Kõik kursusel viidatud mooduli id-d kursuse järjekorras. */
export const allModuleIds = course.blocks.flatMap(blockModules);

/**
 * Iga viidatud mooduli manifest (pealkiri + slug) registrist – ainult
 * NIIPALJU, et loend saaks näidata pealkirja ja linki, mitte tervet
 * mooduli sisu. Registri kirje ise laadib manifesti+activities.ts, aga
 * MITTE Simulation.tsx-i (samm 1.1 otsus, üle vaadatud sammus 1.13), seega
 * see ei tiri kaasa raskeid sõltuvusi (CLAUDE.md reegel 13).
 *
 * Kaks kasutajat: kursuse leht (õpilase loend) ja õpetaja jagamisvaade
 * (samm 2.14) – seepärast elab hook lehtede kõrval, mitte ühe lehe sees.
 */
export function useModuleManifests(): Record<string, ModuleManifest> {
  const [manifests, setManifests] = useState<Record<string, ModuleManifest>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    for (const id of allModuleIds) {
      const loader = moduleRegistry[id];
      // Vale id kursusefailis on test'i (tests/course.test.ts) viga, mitte
      // midagi, mille pärast leht peaks kokku jooksma.
      if (!loader) continue;
      loader()
        .then(({ manifest }) => {
          if (!cancelled) {
            setManifests((previous) => ({ ...previous, [id]: manifest }));
          }
        })
        // Katkine võrk jätab selle mooduli lihtsalt id-kujul nähtavale
        // (varuvaade kutsuja pool) – ilma `.catch`-ita jääks brauserisse
        // käsitlemata tagasilükkega lubadus (ülevaatuse leid, 2026-08-04).
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return manifests;
}
