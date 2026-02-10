import type { GameDefinition } from "@/features/games/types";

export const GAMES: GameDefinition[] = [
  {
    slug: "reloj",
    title: "Marca la hora",
    shortDescription: "Ajusta el reloj a la hora indicada.",
    instructions: "Elige la hora correcta según la consigna.",
    category: "Tiempo",
    difficulties: ["facil", "media", "dificil"],
  },
  {
    slug: "parejas",
    title: "Encuentra la pareja",
    shortDescription: "Descubre pares de cartas iguales.",
    instructions: "Voltea cartas y encuentra todas las parejas.",
    category: "Memoria",
    difficulties: ["facil", "media", "dificil"],
  },
  {
    slug: "patrones",
    title: "Completa el patrón",
    shortDescription: "Selecciona la pieza que completa la secuencia.",
    instructions: "Observa la secuencia y pulsa la mejor opción.",
    category: "Lógica",
    difficulties: ["facil", "media", "dificil"],
  },
  {
    slug: "colores",
    title: "Color correcto",
    shortDescription: "Pulsa el color de la tinta, no la palabra.",
    instructions: "Concéntrate en el color visual del texto.",
    category: "Atención",
    difficulties: ["facil", "media", "dificil"],
  },
  {
    slug: "encaja",
    title: "Encaja la figura",
    shortDescription: "Relaciona cada figura con su silueta.",
    instructions: "Asocia figura y silueta con botones grandes.",
    category: "Espacial",
    difficulties: ["facil", "media", "dificil"],
  },
  {
    slug: "intruso",
    title: "Encuentra el intruso",
    shortDescription: "Detecta el elemento diferente en la cuadrícula.",
    instructions: "Pulsa el elemento que no es igual al resto.",
    category: "Atención",
    difficulties: ["facil", "media", "dificil"],
  },
  {
    slug: "simon",
    title: "Memoria de secuencia",
    shortDescription: "Repite la secuencia de luces.",
    instructions: "Observa la secuencia y repítela en orden.",
    category: "Memoria",
    difficulties: ["facil", "media", "dificil"],
  },
  {
    slug: "rutinas",
    title: "Ordena el día",
    shortDescription: "Organiza actividades en orden lógico.",
    instructions: "Ordena los pasos usando subir y bajar.",
    category: "Lógica",
    difficulties: ["facil", "media", "dificil"],
  },
];

export const GAME_BY_SLUG = Object.fromEntries(GAMES.map((game) => [game.slug, game]));
