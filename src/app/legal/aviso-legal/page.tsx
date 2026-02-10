import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata("Aviso legal", "Aviso legal y uso responsable de ActivaMente.", ["aviso legal", "estimulación cognitiva"]);

export default function AvisoLegalPage() {
  return (
    <article className="prose max-w-3xl">
      <h1>Aviso legal</h1>
      <p>ActivaMente es una aplicación informativa de entrenamiento mental y estimulación cognitiva.</p>
      <p>No sustituye diagnóstico, tratamiento ni consejo médico profesional.</p>
      <p>Titular del proyecto: Jose Luis Diaz Garcia.</p>
    </article>
  );
}
