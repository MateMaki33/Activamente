import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata("Política de cookies", "Uso de cookies y almacenamiento local.", ["cookies", "sessionStorage"]);

export default function CookiesPage() {
  return (
    <article className="prose max-w-3xl">
      <h1>Política de cookies</h1>
      <p>No usamos cookies de seguimiento ni publicidad.</p>
      <p>Podemos usar almacenamiento del navegador (sessionStorage) para preferencias y progreso del juego.</p>
    </article>
  );
}
