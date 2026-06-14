import { useId } from 'react';
import Panel from '../layout/Panel';
import type { VesselSettings, ShareMode } from '../../types';

interface Props {
  speed: number;
  settings: VesselSettings;
  maxSpeed: number;
  onSpeedChange: (v: number) => void;
  onSettingsChange: (s: VesselSettings) => void;
}

function Input({ label, hint, name, value, onChange, min, max, step }: {
  label: string; hint: string; name: string; value: number;
  onChange: (v: number) => void; min: number; max: number; step: number;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="flex items-end min-h-[1.6rem] text-[0.68rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">{label}</label>
      <input
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        min={min}
        max={max}
        step={step}
        aria-describedby={hintId}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="font-mono text-[0.9rem] font-semibold tabular-nums bg-white border border-bdr rounded-xl text-txt px-3 py-2.5 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
      />
      <div id={hintId} className="text-[0.65rem] text-dim mt-1 leading-snug">{hint}</div>
    </div>
  );
}

export default function ParametersPanel({ speed, settings, maxSpeed, onSpeedChange, onSettingsChange }: Props) {
  const shareId = useId();
  const shareHintId = `${shareId}-hint`;
  return (
    <Panel tag="INPUT" tagStyle="param" title="Parameters" delay={0.06}>
      <div className="grid grid-cols-6 gap-4 p-5 max-[1000px]:grid-cols-3 max-[700px]:grid-cols-2 max-[480px]:grid-cols-1">
        <Input label="Vessel Speed" hint={`knots (0–${maxSpeed})`} name="speed" value={speed}
          onChange={(v) => onSpeedChange(Math.min(v, maxSpeed))} min={0} max={maxSpeed} step={0.1} />
        <Input label="Condition Factor" hint="% × Static prop power (100 = clean hull; >100 fouled/weather)" name="conditionPct" value={settings.conditionPct}
          onChange={(v) => onSettingsChange({ ...settings, conditionPct: v })} min={50} max={200} step={1} />
        <Input label="Hotel Load" hint="kW — nominal 6 MW, adjust to suit" name="hotelLoad" value={settings.hotelLoad}
          onChange={(v) => onSettingsChange({ ...settings, hotelLoad: v })} min={0} max={20000} step={100} />
        <Input label="Sailing Aux" hint="kW — underway only (nominal 1.5 MW)" name="sailingAux" value={settings.sailingAux}
          onChange={(v) => onSettingsChange({ ...settings, sailingAux: v })} min={0} max={5000} step={100} />
        <Input label="SFOC Decay" hint="% deterioration (0–5)" name="sfocDet" value={settings.sfocDet}
          onChange={(v) => onSettingsChange({ ...settings, sfocDet: v })} min={0} max={5} step={0.1} />
        <div>
          <label htmlFor={shareId} className="flex items-end min-h-[1.6rem] text-[0.68rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Load Sharing</label>
          <select
            id={shareId}
            value={settings.shareMode}
            aria-describedby={shareHintId}
            onChange={(e) => onSettingsChange({ ...settings, shareMode: e.target.value as ShareMode })}
            className="font-mono text-[0.9rem] font-semibold bg-white border border-bdr rounded-xl text-txt px-3 py-2.5 w-full cursor-pointer outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
          >
            <option value="equal">Equal %</option>
            <option value="optimal">Sea Optimal</option>
          </select>
          <div id={shareHintId} className="text-[0.65rem] text-dim mt-1 leading-snug">equal droop vs SFOC-optimised</div>
        </div>
      </div>
    </Panel>
  );
}
