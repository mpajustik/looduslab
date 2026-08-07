import { Link, NavLink, Outlet, useLocation } from "react-router";
import { cn } from "../ui/cn";
import { devClockAvailable } from "../lib/devClock";
import { readStudentName } from "../lib/studentIdentity";
import { DevClockPanel } from "./DevClockPanel";
import { NAV_ITEMS } from "./navigation";

/**
 * Ühine raam kõigile lehtedele.
 * - töölaual: navigatsioon ülaribal
 * - telefonis: navigatsioon alumisel ribal (pöial ulatub sinna)
 *
 * NavLink annab aktiivsele lingile ise `aria-current="page"` – ekraanilugeja
 * ütleb, kus kasutaja on, ja aktiivsust ei näita ainult värv (ka rasvane
 * kiri + ikoon), nagu ligipääsetavuse reegel nõuab.
 */
export function AppLayout() {
  // `useLocation` paneb AppLayout'i uuesti renderduma igal marsruudivahetusel
  // – seega loeb see otse localStorage'ist (mitte Supabase'i sessioonist,
  // et hoida supabase-js väljas põhipaketist, CLAUDE.md reegel 13) värske
  // väärtuse ka siis, kui liitumisleht (samm 2.10) just nime kirjutas ja
  // /kursus'ele suunas.
  useLocation();
  const studentName = readStudentName();

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/"
            className="rounded-lg text-lg font-semibold tracking-tight text-ink"
          >
            LoodusLab<span className="text-brand"> AI</span>
          </Link>

          {/* Ülariba nähtav alates 640 px – telefonis on all oma riba. */}
          <div className="hidden items-center gap-4 sm:flex">
            {studentName ? (
              <span className="text-ink-soft">Tere, {studentName}!</span>
            ) : null}
            <nav aria-label="Peamenüü">
              <ul className="flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "flex min-h-11 items-center rounded-lg px-3 text-base transition-colors duration-150",
                          item.teacher
                            ? "text-teacher hover:bg-teacher-soft"
                            : "text-ink-soft hover:bg-brand-soft hover:text-brand",
                          isActive &&
                            (item.teacher
                              ? "bg-teacher-soft font-semibold text-teacher"
                              : "bg-brand-soft font-semibold text-brand"),
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* pb-8 sm:pb-8 – telefonis hoiab sisu alumise riba alt välja hoopis
          jaluse enda pb-24 (jalus on nüüd main'i järel). */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      {/* Privaatsuslink peab olema IGAL lehel leitav (samm 2.15) – ka siis,
          kui laps tuli otse jagatud lingiga ega näinud liitumislehte.
          Navigatsiooni teda panna ei tohi: seal on lubatud maksimaalselt neli
          valikut (docs/DISAINIJUHIS.md) ja need on õppimiseks. */}
      <footer className="mx-auto w-full max-w-4xl px-4 pb-24 text-ink-soft sm:pb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
          <NavLink
            to="/privaatsus"
            className="flex min-h-11 items-center rounded-lg underline underline-offset-2 hover:text-brand"
          >
            Privaatsus
          </NavLink>
          <span>LoodusLab AI</span>
        </div>
      </footer>

      <nav
        aria-label="Peamenüü"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-xs transition-colors duration-150",
                      item.teacher ? "text-teacher" : "text-ink-soft",
                      isActive &&
                        (item.teacher
                          ? "bg-teacher-soft font-semibold"
                          : "bg-brand-soft font-semibold text-brand"),
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {item.shortLabel}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Ajakerimine (samm 3.5) ainult arenduses. `devClockAvailable` on
          `import.meta.env.DEV`, mille Vite asendab toodangus `false`-iga –
          seega langeb nii see rida kui ka riba enda kood buildist välja. */}
      {devClockAvailable ? <DevClockPanel /> : null}
    </div>
  );
}
