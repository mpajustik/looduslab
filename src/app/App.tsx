export default function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          LoodusLab AI
        </h1>
        <p className="text-lg text-slate-600">
          Füüsika simulatsioonid ja harjutused 8. klassile. Vundament on püsti –
          sisu tuleb järgmiste sammudega.
        </p>
      </div>

      {/* Ajutine nupp: asendub shadcn/ui Button'iga, kui see sammu 0.2
          teises pooles seadistatakse. */}
      <button
        type="button"
        className="min-h-11 self-start rounded-lg bg-teal-700 px-6 text-base font-medium text-white transition-colors duration-150 hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Alusta
      </button>
    </main>
  );
}
