function PresetButton({ active, label, onClick }) {
  return (
    <button
      className={`rounded-lg border px-2 py-2 text-xs transition ${
        active
          ? 'border-accent/70 bg-accent/20 text-white'
          : 'border-white/25 bg-white/5 hover:bg-white/10'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function PresetSelector({ onLoadPreset, presets, selectedPreset }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs uppercase tracking-wide text-white/70">Presets</p>
      <div className="grid grid-cols-2 gap-2">
        <PresetButton
          active={selectedPreset === presets.JWST_L2}
          label="JWST L2"
          onClick={() => onLoadPreset(presets.JWST_L2)}
        />
        <PresetButton
          active={selectedPreset === presets.TROJAN_L4}
          label="Troyano L4"
          onClick={() => onLoadPreset(presets.TROJAN_L4)}
        />
        <PresetButton
          active={selectedPreset === presets.UNSTABLE_L1}
          label="Inestable L1"
          onClick={() => onLoadPreset(presets.UNSTABLE_L1)}
        />
        <PresetButton
          active={selectedPreset === presets.CUSTOM}
          label="Custom"
          onClick={() => onLoadPreset(presets.CUSTOM)}
        />
      </div>
    </div>
  )
}

export default PresetSelector
