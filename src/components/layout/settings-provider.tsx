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
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { ...stored, animations: stored.animations && !prefersReduced };
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(readInitialSettings);

  useEffect(() => {
    storage.set("settings", settings);
    document.documentElement.classList.toggle("high-contrast", settings.highContrast);
    document.documentElement.classList.toggle("motion-reduce", !settings.animations);
    document.body.classList.remove("text-base", "text-lg", "text-xl");
    document.body.classList.add(textSizeClass[settings.textSize]);
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
