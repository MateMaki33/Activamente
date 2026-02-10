export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first-game", title: "Primera partida", description: "Juega una partida.", icon: "🎯" },
  {
    id: "consistency",
    title: "Constancia",
    description: "Juega en 5 días distintos.",
    icon: "📆",
  },
  { id: "streak-3", title: "Racha", description: "Consigue 3 victorias seguidas.", icon: "🔥" },
  {
    id: "explorer",
    title: "Explorador",
    description: "Prueba 5 juegos distintos.",
    icon: "🧭",
  },
  {
    id: "mastery",
    title: "Maestría",
    description: "Gana en dificultad difícil en 3 juegos.",
    icon: "🏆",
  },
];
