import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { PageHeader } from "../ui/PageHeader";
import { AppLayout } from "./AppLayout";
import CoursePage from "./pages/CoursePage";
import HomePage from "./pages/HomePage";
import ModulePage from "./pages/ModulePage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPage from "./pages/PrivacyPage";
import ProgressPage from "./pages/ProgressPage";
import ReviewPage from "./pages/ReviewPage";

/**
 * Õpetaja leht laisalt (CLAUDE.md reegel 13): ta toob kaasa
 * @supabase/supabase-js (~55 kB gzip), mida õpilase esileht ei vaja.
 * Õpetajaid on klassitäie kohta üks – tema võib pool sekundit oodata.
 */
const TeacherPage = lazy(() => import("./pages/TeacherPage"));

/**
 * Liitumisleht samast põhjusest laisalt: samuti vajab supabase-js't
 * (signInAnonymously + join_class), aga esilehte, kursust ega mooduleid
 * see kaasa ei too.
 */
const JoinPage = lazy(() => import("./pages/JoinPage"));

/** Klassivaade samast põhjusest laisalt (supabase-js + moodulite register). */
const ClassLivePage = lazy(() => import("./pages/ClassLivePage"));

/**
 * Marsruudid docs/ARHITEKTUUR.md järgi. /m/:slug on otselink, mida õpetaja
 * saab õpilastele jagada – seepärast on ta lühike ja püsiv.
 *
 * ErrorBoundary on KÕIGE ümber: ka siis, kui viga tuleb raamist endast,
 * ei näe kasutaja valget tühja ekraani.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="kursus" element={<CoursePage />} />
            {/* Sammuraami arendusdemo (/m/test, sammud 1.2–1.12) on kadunud:
                päris moodul (/m/peegeldumisseadus, samm 1.13) katab nüüd
                sama eesmärki, sh preview't saab katsuda `?eelvaade=1`-ga. */}
            <Route path="m/:slug" element={<ModulePage />} />
            <Route
              path="liitu/:kood"
              element={
                <Suspense fallback={<PageHeader title="Laen liitumislehte …" />}>
                  <JoinPage />
                </Suspense>
              }
            />
            {/* Privaatsusleht on ainult teksti ja EI ole `lazy`: ta avaneb
                sageli kõige esimesena (link liitumislehelt) ja peab tulema
                kohe, ka kehva ühendusega telefonis. */}
            <Route path="privaatsus" element={<PrivacyPage />} />
            <Route path="kordamine" element={<ReviewPage />} />
            <Route path="edenemine" element={<ProgressPage />} />
            <Route
              path="opetaja"
              element={
                <Suspense fallback={<PageHeader title="Laen õpetaja ala …" />}>
                  <TeacherPage />
                </Suspense>
              }
            />
            <Route
              path="opetaja/klass/:id"
              element={
                <Suspense fallback={<PageHeader title="Laen klassivaadet …" />}>
                  <ClassLivePage />
                </Suspense>
              }
            />
            {/* Ainult arenduses: siit saab veaekraani päriselt näha.
                Toodangu buildi see rida ei jõua. */}
            {import.meta.env.DEV && (
              <Route path="viga-test" element={<CrashTest />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function CrashTest(): never {
  throw new Error("Sihilik viga: veapüüdja kontroll");
}
