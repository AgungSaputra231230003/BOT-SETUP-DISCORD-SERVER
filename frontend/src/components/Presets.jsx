import { presetCatalog } from '../data/templates';
import { useSetupStore } from '../store/useSetupStore';

export function Presets() {
  const { loadPreset } = useSetupStore();

  return (
    <div className="preset-row">
      {presetCatalog.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className="preset-button"
          onClick={() => loadPreset(preset)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
