export const APP_NAME = "Senobi";
export const APP_CLAIM = "Juegos sencillos para mantener la mente activa.";
export const APP_DESCRIPTION =
  "Entrena memoria, atención y orientación con ejercicios visuales y fáciles de usar, pensados para personas mayores.";

export const APP_STATE_VERSION = 1;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/nutruxiq",
  tiktok: "https://tiktok.com/@nutruxiq",
  linkedin: "https://linkedin.com/in/tu_usuario",
  blog: "https://nutruxiq.com",
};

export const NAV_ITEMS = [
  { href: "/juegos", label: "Juegos" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/logros", label: "Logros" },
  { href: "/ajustes", label: "Ajustes" },
];

export const DIFFICULTY_LEVELS = ["facil", "media", "dificil"] as const;
export type Difficulty = (typeof DIFFICULTY_LEVELS)[number];
