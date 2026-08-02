import { Button } from "../ui/Button";
import { Card, CardDescription, CardTitle } from "../ui/Card";

export default function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          LoodusLab AI
        </h1>
        <p className="text-lg text-ink-soft">
          Füüsika simulatsioonid ja harjutused 8. klassile. Vundament on püsti –
          sisu tuleb järgmiste sammudega.
        </p>
      </div>

      <Card>
        <CardTitle>Kursus on tulekul</CardTitle>
        <CardDescription className="mt-1">
          Teemaplokid ja esimesed moodulid lisanduvad lähipäevil.
        </CardDescription>
      </Card>

      <Button className="self-start">Alusta</Button>
    </main>
  );
}
