import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { alustaSeiret } from "./lib/seire";
import { alustaStatistikat } from "./lib/statistika";
import "./index.css";

// Seire ja statistika käivad omas tempos – rakendus ei oota nende järel.
// Mõlemad vaikivad arenduses ja siis, kui vastav muutuja on seadmata.
void alustaSeiret();
alustaStatistikat();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Juurelementi #root ei leitud");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
