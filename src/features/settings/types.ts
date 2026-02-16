export type TextSize = "normal" | "grande" | "muy-grande";

export type SettingsState = {
  textSize: TextSize;
  highContrast: boolean;
  sounds: boolean;
};

export const defaultSettings: SettingsState = {
  textSize: "normal",
  highContrast: false,
  sounds: true,
};
