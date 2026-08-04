import type { ModuleFigures } from "../../engine/figures";

/**
 * Mooduli joonis sildi järgi (src/engine/figures.ts).
 *
 * See fail ei tea ühestki konkreetsest joonisest – ainult sildist. Joonised
 * tulevad väljastpoolt (`figures`), sest ui/ ei tohi teada moodulitest
 * (docs/ARHITEKTUUR.md).
 *
 * Silt ilma jooniseta (registrist puudub kirje) tähendab katkist moodulit ja
 * seda valvab test, mitte see komponent – ekraanile jääb siis lihtsalt tekst
 * ilma pildita. Sama lugu sildita sammu või küsimusega: siis ei ole joonist
 * lihtsalt ette nähtud.
 */
export function Figure({
  figures,
  id,
}: {
  figures?: ModuleFigures;
  /** `step.figure` või `question.figure` – puudub, kui joonist ei ole. */
  id?: string;
}) {
  const FigureComponent = id ? figures?.[id] : undefined;

  return FigureComponent ? <FigureComponent /> : null;
}
