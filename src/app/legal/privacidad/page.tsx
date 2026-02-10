import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata("Política de privacidad", "Información sobre privacidad y almacenamiento local de ActivaMente.", ["privacidad"]);

export default function PrivacidadPage() {
  return (
    <article className="prose max-w-3xl">
      <h1>Política de privacidad</h1>
      <p>ActivaMente no solicita cuentas ni recopila datos personales. No utilizamos rastreo de terceros.</p>
      <p>Solo se guarda información local en tu navegador para recordar ajustes, progreso y estadísticas.</p>
    </article>
  );
}
