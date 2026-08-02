import { BrowserRouter, Route, Routes } from "react-router";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { AppLayout } from "./AppLayout";
import CoursePage from "./pages/CoursePage";
import HomePage from "./pages/HomePage";
import ModulePage from "./pages/ModulePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProgressPage from "./pages/ProgressPage";
import ReviewPage from "./pages/ReviewPage";
import TeacherPage from "./pages/TeacherPage";

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
            <Route path="m/:slug" element={<ModulePage />} />
            <Route path="kordamine" element={<ReviewPage />} />
            <Route path="edenemine" element={<ProgressPage />} />
            <Route path="opetaja" element={<TeacherPage />} />
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
