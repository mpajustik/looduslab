import type { ComponentType } from "react";

/**
 * Leping sammu ja mooduli enda jooniste vahel.
 *
 * Sama muster mis simulatsioonil (./simulationFeatures): sammukomponent
 * (`ui/steps/TheoryStep`, `HookStep`) on üldine ega tohi teada ühestki
 * konkreetsest moodulist (docs/ARHITEKTUUR.md „ui/ ei tohi teada
 * moodulitest"). Samm ütleb ainult SILDI (`step.figure`, nt
 * „peegeldumise-moisted") ja saab joonised propsina väljastpoolt – mida see
 * silt joonistab, teab ainult mooduli enda figures.tsx.
 *
 * Joonised on registris (src/modules/registry.ts) laisad komponendid, seega
 * esilehe bundle neid kaasa ei võta (CLAUDE.md reegel 13).
 */
export type ModuleFigures = Readonly<Record<string, ComponentType | undefined>>;
