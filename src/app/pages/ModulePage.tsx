import { useParams } from "react-router";
import { PageHeader } from "../../ui/PageHeader";

export default function ModulePage() {
  const { slug } = useParams();

  return (
    <PageHeader
      title="Tund"
      lead={`Selle tunni sisu (${slug}) valmib etapis 1.`}
    />
  );
}
