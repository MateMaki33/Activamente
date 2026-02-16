"use client";

import { useSettings } from "@/components/layout/settings-provider";

export default function AjustesPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Ajustes de accesibilidad</h1>
      <div className="space-y-4 rounded-2xl border bg-white p-5">
        <label className="block">
          <span className="font-semibold">Tamaño de texto</span>
          <select
            value={settings.textSize}
            onChange={(event) => updateSettings({ textSize: event.target.value as typeof settings.textSize })}
            className="mt-2 w-full rounded-lg border px-3 py-3"
          >
            <option value="normal">Normal</option>
            <option value="grande">Grande</option>
            <option value="muy-grande">Muy grande</option>
          </select>
        </label>

        <Toggle label="Alto contraste" checked={settings.highContrast} onChange={(checked) => updateSettings({ highContrast: checked })} />
        <Toggle label="Sonidos" checked={settings.sounds} onChange={(checked) => updateSettings({ sounds: checked })} />
      </div>
    </div>
  );
}

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
  <label className="flex items-center justify-between rounded-lg border px-4 py-3">
    <span className="font-semibold">{label}</span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-6 w-6" />
  </label>
);
