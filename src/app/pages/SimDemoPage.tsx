import { Card } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";
import { Simulation } from "../../modules/physics/peegeldumisseadus/Simulation";

/**
 * Arendusdemo (/sim-test) – simulatsiooni visuaali katsumiseks (samm 1.8).
 *
 * Marsruut on App.tsx-is `import.meta.env.DEV` taga, seega toodangu buildi ta
 * ei jõua. Õpilaseni jõuab simulatsioon explore-sammus, mis valmib koos
 * ülesannetega sammus 1.9 – siis kaob see leht.
 */
export default function SimDemoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Peegeldumise simulatsioon (arendus)"
        lead="Ainult visuaal ja liugur. Ülesanded, mattpinna lüliti ja lisavaade „nurk pinna suhtes“ tulevad järgmises sammus."
      />
      <Card>
        <Simulation />
      </Card>
    </div>
  );
}
