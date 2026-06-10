import { useId } from 'react';
import Panel from '../layout/Panel';
import type { VesselSettings, CurveModel } from '../../types';

interface Props {
  speed: number;
  settings: VesselSettings;
  model: CurveModel;
  maxSpeed: number;
  onSpeedChange: (v: number) => void;
  onSettingsChange: (s: VesselSettings) => void;
  onModelChange: (m: CurveModel) => void;
}

function Input({ label, hint, name, value, onChange, min, max, step }: {
  label: string; hint: string; name: string; value: number;
  onChange: (v: number) => void; min: number; max: number; step: number;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="block text-[0.68rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">{label}</label>
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

export default function ParametersPanel({ speed, settings, model, maxSpeed, onSpeedChange, onSettingsChange, onModelChange }: Props) {
  const modelId = useId();
  const modelHintId = `${modelId}-hint`;
  return (
    <Panel tag="INPUT" tagStyle="param" title="Parameters" delay={0.06}>
      <div className="grid grid-cols-6 gap-4 p-5 max-[1000px]:grid-cols-3 max-[700px]:grid-cols-2 max-[480px]:grid-cols-1">
        <Input label="Vessel Speed" hint={`knots (0–${maxSpeed})`} name="speed" value={speed}
          onChange={(v) => onSpeedChange(Math.min(v, maxSpeed))} min={0} max={maxSpeed} step={0.1} />
        <div>
          <label htmlFor={modelId} className="block text-[0.68rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Curve Model</label>
          <select
            id={modelId}
            value={model}
            aria-describedby={modelHintId}
            onChange={(e) => onModelChange(e.target.value as CurveModel)}
            className="font-mono text-[0.9rem] font-semibold bg-white border border-bdr rounded-xl text-txt px-3 py-2.5 w-full cursor-pointer outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
          >
            <option value="dynamic">Dynamic</option>
            <option value="static">Static</option>
          </select>
          <div id={modelHintId} className="text-[0.65rem] text-dim mt-1 leading-snug">dynamic = at selected month, incl. fouling</div>
        </div>
        <Input label="Hotel Load" hint="kW — nominal 6 MW, adjust to suit" name="hotelLoad" value={settings.hotelLoad}
          onChange={(v) => onSettingsChange({ ...settings, hotelLoad: v })} min={0} max={20000} step={100} />
        <Input label="Sea Margin" hint="% (−10 to +20)" name="seaMargin" value={settings.seaMargin}
          onChange={(v) => onSettingsChange({ ...settings, seaMargin: v })} min={-10} max={20} step={0.5} />
        <Input label="SFOC Deterioration" hint="% (0–5)" name="sfocDet" value={settings.sfocDet}
          onChange={(v) => onSettingsChange({ ...settings, sfocDet: v })} min={0} max={5} step={0.1} />
        <Input label="Prop Auxiliaries" hint="kW — extra thruster/aux beyond curve" name="propAux" value={settings.propAux}
          onChange={(v) => onSettingsChange({ ...settings, propAux: v })} min={0} max={5000} step={100} />
      </div>
    </Panel>
  );
}
