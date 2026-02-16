"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage/session";
import { defaultSettings, type SettingsState } from "@/features/settings/types";

type SettingsContextType = {
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

const textSizeClass: Record<SettingsState["textSize"], string> = {
  normal: "text-base",
  grande: "text-lg",
  "muy-grande": "text-xl",
};

const readInitialSettings = (): SettingsState => {
  if (typeof window === "undefined") return defaultSettings;
  const stored = storage.get<SettingsState>("settings", defaultSettings);
  return { ...defaultSettings, ...stored };
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(readInitialSettings);

  useEffect(() => {
    storage.set("settings", settings);
    document.documentElement.classList.toggle("high-contrast", settings.highContrast);
    document.body.classList.remove("text-base", "text-lg", "text-xl");
    document.body.classList.add(textSizeClass[settings.textSize]);

    const scaleMap: Record<SettingsState["textSize"], string> = {
      normal: "100%",
      grande: "112.5%",
      "muy-grande": "125%",
    };
    document.documentElement.style.fontSize = scaleMap[settings.textSize];
  }, [settings]);

  const value = useMemo(
    () => ({ settings, updateSettings: (updates: Partial<SettingsState>) => setSettings((prev) => ({ ...prev, ...updates })) }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings debe usarse dentro de SettingsProvider");
  return context;
};
