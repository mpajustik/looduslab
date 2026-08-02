import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Juurelementi #root ei leitud");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
