export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first-game", title: "Primera partida", description: "Juega una partida.", icon: "🎯" },
  {
    id: "focused-10",
    title: "Mente en marcha",
    description: "Juega 10 partidas en una sesión.",
    icon: "⚡",
  },
  {
    id: "streak-3",
    title: "Racha",
    description: "Consigue 3 victorias seguidas en un mismo juego.",
    icon: "🔥",
  },
  {
    id: "streak-5",
    title: "Racha pro",
    description: "Consigue 5 victorias seguidas en un mismo juego.",
    icon: "🚀",
  },
  {
    id: "explorer",
    title: "Explorador",
    description: "Prueba 5 juegos distintos.",
    icon: "🧭",
  },
  {
    id: "mastery",
    title: "Maestría",
    description: "Gana en dificultad difícil en 3 juegos distintos.",
    icon: "🏆",
  },
  {
    id: "sharp-shooter",
    title: "Precisión quirúrgica",
    description: "Consigue 90% o más de acierto global tras al menos 20 partidas.",
    icon: "🎯",
  },
  {
    id: "speedrunner",
    title: "Speedrunner",
    description: "Gana 10 partidas terminando en menos de 30 segundos.",
    icon: "⏱️",
  },
];
