import { Link } from "react-router";
import { buttonClasses } from "../../ui/buttonStyles";
import { PageHeader } from "../../ui/PageHeader";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-6">
      <PageHeader
        title="Sellist lehte ei ole"
        lead="Võib-olla on link vana või kirjapildis viga. Alusta kursusest."
      />
      <Link to="/kursus" className={buttonClasses()}>
        Ava kursus
      </Link>
    </div>
  );
}
