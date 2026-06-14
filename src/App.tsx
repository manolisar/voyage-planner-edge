import { useState, useMemo } from 'react';
import './app.css';
import type { EngineState, FuelType, SeaLeg, PortEntry, StandbyEntry, AnchorageEntry, VesselSettings, Voyage, ShipId } from './types';
import { DEFAULT_SETTINGS, engineConfigs } from './data/engineDefaults';
import { maxSpeed, getShip } from './data/shipData';
import { computeConsumption } from './engine/consumption';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Panel from './components/layout/Panel';
import ParametersPanel from './components/parameters/ParametersPanel';
import EnginePanel from './components/engines/EnginePanel';
import ResultsPanel from './components/results/ResultsPanel';
import SettingsModal from './components/settings/SettingsModal';
import SeaLegPlanner from './components/planner/SeaLegPlanner';
import PortHoursEntry from './components/planner/PortHoursEntry';
import StandbyHoursEntry from './components/planner/StandbyHoursEntry';
import AnchorageHoursEntry from './components/planner/AnchorageHoursEntry';
import VoyageSummary from './components/voyage/VoyageSummary';
import VoyageMeta from './components/voyage/VoyageMeta';
import VoyageExport from './components/voyage/VoyageExport';

function getLocalDateString(now: Date): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_SHIP: ShipId = 'EG';

/** Default DG lineup for a ship: mains on the ship's fuel basis, DG5 on MGO. */
function lineupFor(shipId: ShipId): EngineState[] {
  const mainFuel = getShip(shipId).defaultMainFuel;
  return [
    { id: 1, available: true, fuel: mainFuel },
    { id: 2, available: true, fuel: mainFuel },
    { id: 3, available: true, fuel: mainFuel },
    { id: 4, available: true, fuel: mainFuel },
    { id: 5, available: true, fuel: 'MGO' },
  ];
}

function App() {
  const [ship, setShip] = useState<ShipId>(DEFAULT_SHIP);
  const [speed, setSpeed] = useState(15);
  const [settings, setSettings] = useState<VesselSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [engines, setEngines] = useState<EngineState[]>(() => lineupFor(DEFAULT_SHIP));

  const [legs, setLegs] = useState<SeaLeg[]>([]);
  const [portEntry, setPortEntry] = useState<PortEntry>({ hours: 0, engineCount: 1, fuelType: 'MGO' });
  const [standbyEntry, setStandbyEntry] = useState<StandbyEntry>({ hours: 0, engineCount: 2, avgPowerMW: 14, fuelType: 'MGO' });
  const [anchorageEntry, setAnchorageEntry] = useState<AnchorageEntry>({ hours: 0, engineCount: 2, avgPowerMW: 10, fuelType: 'MGO' });

  const [cruiseName, setCruiseName] = useState('');
  const [voyageFrom, setVoyageFrom] = useState('');
  const [voyageTo, setVoyageTo] = useState('');
  const [voyageDate, setVoyageDate] = useState(getLocalDateString(new Date()));

  const shipMaxSpeed = maxSpeed(ship);

  const result = useMemo(
    () => computeConsumption(ship, speed, engines, settings),
    [ship, speed, engines, settings]
  );

  const handleShipChange = (next: ShipId) => {
    setShip(next);
    setSpeed((prev) => Math.min(prev, maxSpeed(next)));
    // Re-seed the DG fuel basis to the new ship (mains HFO, or MGO for Xcel).
    setEngines((prev) => {
      const mainFuel = getShip(next).defaultMainFuel;
      return prev.map((e) => (e.id === 5 ? e : { ...e, fuel: mainFuel }));
    });
  };

  const handleToggle = (id: number, available: boolean) => {
    setEngines((prev) => prev.map((e) => (e.id === id ? { ...e, available } : e)));
  };

  /**
   * DGs on a common fuel system burn the same fuel: changing DG1 also
   * switches DG2 (FS1), DG3 ↔ DG4 (FS2); DG5 is alone on FS3.
   */
  const handleFuelChange = (id: number, fuel: FuelType) => {
    const system = engineConfigs.find((c) => c.id === id)?.fuelSystem;
    setEngines((prev) =>
      prev.map((e) => {
        const cfg = engineConfigs.find((c) => c.id === e.id);
        if (!cfg || cfg.fuelSystem !== system) return e;
        // A paired engine that can't burn the chosen fuel keeps its own.
        return cfg.allowedFuels.includes(fuel) ? { ...e, fuel } : e;
      })
    );
  };

  const handleLoadVoyage = (v: Pick<Voyage, 'ship' | 'conditionPct' | 'cruiseName' | 'from' | 'to' | 'date' | 'seaLegs' | 'portEntry' | 'standbyEntry' | 'anchorageEntry'>) => {
    if (v.ship) handleShipChange(v.ship);
    if (typeof v.conditionPct === 'number') setSettings((prev) => ({ ...prev, conditionPct: v.conditionPct! }));
    setCruiseName(v.cruiseName);
    setVoyageFrom(v.from);
    setVoyageTo(v.to);
    setVoyageDate(v.date);
    setLegs(v.seaLegs);
    setPortEntry(v.portEntry);
    setStandbyEntry(v.standbyEntry);
    setAnchorageEntry(v.anchorageEntry);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 pb-16">
      <Header ship={ship} onShipChange={handleShipChange} onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} settings={settings} onSave={setSettings} onClose={() => setSettingsOpen(false)} />

      <EnginePanel engines={engines} results={result.engineResults} onToggle={handleToggle} onFuelChange={handleFuelChange} />
      <ParametersPanel
        speed={speed} settings={settings} maxSpeed={shipMaxSpeed}
        onSpeedChange={setSpeed} onSettingsChange={setSettings}
      />
      <ResultsPanel result={result} />

      {/* Voyage Builder */}
      <Panel tag="PLAN" tagStyle="legs" title="Cruise Leg Planner" delay={0.24}>
        <SeaLegPlanner
          legs={legs} currentResult={result} speed={speed} settings={settings}
          onAddLeg={(leg) => setLegs((prev) => [...prev, leg])}
          onUpdateLeg={(leg) => setLegs((prev) => prev.map((l) => (l.id === leg.id ? leg : l)))}
          onRemoveLeg={(id) => setLegs((prev) => prev.filter((l) => l.id !== id))}
          onClearLegs={() => setLegs([])}
        />
      </Panel>

      <Panel tag="VOYAGE" tagStyle="voyage" title="Voyage Builder" delay={0.3}>
        <div className="p-5 space-y-5">
          <VoyageMeta
            cruiseName={cruiseName} from={voyageFrom} to={voyageTo} date={voyageDate}
            onCruiseNameChange={setCruiseName} onFromChange={setVoyageFrom} onToChange={setVoyageTo} onDateChange={setVoyageDate}
          />

          <div className="grid grid-cols-1 gap-4 mt-4">
            <PortHoursEntry entry={portEntry} hotelLoad={settings.hotelLoad} sfocDet={settings.sfocDet} onChange={setPortEntry} />
            <AnchorageHoursEntry entry={anchorageEntry} sfocDet={settings.sfocDet} onChange={setAnchorageEntry} />
            <StandbyHoursEntry entry={standbyEntry} sfocDet={settings.sfocDet} onChange={setStandbyEntry} />
          </div>

          <VoyageSummary legs={legs} portEntry={portEntry} standbyEntry={standbyEntry} anchorageEntry={anchorageEntry} hotelLoad={settings.hotelLoad} sfocDet={settings.sfocDet} />

          <VoyageExport
            ship={ship} conditionPct={settings.conditionPct}
            cruiseName={cruiseName} from={voyageFrom} to={voyageTo} date={voyageDate}
            legs={legs} portEntry={portEntry} standbyEntry={standbyEntry} anchorageEntry={anchorageEntry}
            hotelLoad={settings.hotelLoad} sfocDet={settings.sfocDet}
            onLoadVoyage={handleLoadVoyage}
          />
        </div>
      </Panel>

      <Footer />
    </div>
  );
}

export default App;
