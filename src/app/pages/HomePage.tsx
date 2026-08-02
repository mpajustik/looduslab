import { Link } from "react-router";
import { Card, CardDescription, CardTitle } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="LoodusLab AI"
        lead="Füüsika simulatsioonid ja harjutused 8. klassile. Ennusta, uuri, selgita, harjuta."
      />

      <Link to="/kursus" className="rounded-2xl">
        <Card className="transition-shadow duration-150 hover:shadow-md">
          <CardTitle>8. klassi füüsika</CardTitle>
          <CardDescription className="mt-1">
            Seitse teemat valgusest võnkumiseni. Alusta esimesest tunnist.
          </CardDescription>
        </Card>
      </Link>
    </div>
  );
}
