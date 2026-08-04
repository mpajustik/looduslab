import { defineCourse } from "./schema";

/**
 * 8. klassi füüsika kursus.
 *
 * See fail on AINUS koht, mis teab, mis järjekorras ja mis rühmades
 * moodulid õpilasele näidatakse (docs/SISUHALDUS.md). Moodul ise ei tea
 * oma kohta kursuses – teema ümbertõstmine on siin ühe rea liigutamine.
 *
 * Plokid vastavad ainekava plokkidele P1–P7
 * (sisu/AINEKAVA-fyysika-8.md). Pealkirjad on siin lühemad, sest need
 * loeb õpilane telefoniekraanilt; ainekava täispealkiri jääb ainekavva.
 *
 * Moodulite loendid täituvad samm-sammult etapis 1 – esimene on
 * "Valguse peegeldumine" (samm 1.13).
 */
export const course = defineCourse({
  id: "fyysika-8",
  title: "8. klassi füüsika",
  blocks: [
    // P1. Valgus ja valguse sirgjooneline levimine. Peegeldumine ja neeldumine
    {
      title: "Valgus ja peegeldumine",
      modules: ["physics.peegeldumisseadus"],
    },
    // P2. Valguse murdumine
    { title: "Valguse murdumine", modules: [] },
    // P3. Liikumine ja jõud
    { title: "Liikumine ja jõud", modules: [] },
    // P4. Jõud looduses
    { title: "Jõud looduses", modules: [] },
    // P5. Rõhumisjõud ja rõhk. Rõhk ja üleslükkejõud vedelikes ja gaasides
    { title: "Rõhk ja üleslükkejõud", modules: ["physics.vedeliku-rohk"] },
    // P6. Mehaaniline töö, energia ja võimsus
    { title: "Töö, energia ja võimsus", modules: [] },
    // P7. Võnkumine ja laine
    { title: "Võnkumine ja laine", modules: [] },
  ],
});
