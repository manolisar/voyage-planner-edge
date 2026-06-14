# Edge Class Voyage Planner — Project Charter

> Single-page speed/power/fuel consumption model for **Celebrity Edge-class ships** (Edge, Apex, Beyond, Ascent, Xcel) with a heterogeneous 5-DG Wärtsilä plant: **2× W12V46F (14.4 MW) + 2× W8L46F (9.6 MW) + 1× W12V32E (6.72 MW)**, 2× ABB Azipod XO (16 MW each).
> Sibling of [Solstice Class Voyage Planner](../voyage-planner/) (4× 16V46 plant); same architecture and Signal Flag Bands design language, different data and plant model.

---

## 1. What this app is

A static SPA used by Chief Engineers / voyage planners to model fuel burn **before** a voyage runs:

- Pick the **ship** (header selector) — each has its own Static propulsion-power curve.
- Set the **condition factor** (%) — clean-hull Static × condition (100 = clean; >100 = fouling / weather / current). Replaces the old static/dynamic toggle (Dynamic is ephemeral and not stored).
- Mark which DGs are available and the fuel per fuel-system (HFO / MGO / LSFO).
- Choose **load sharing**: Equal % (droop) or Sea Optimal (SFOC-minimising).
- The engine takes Static prop power → condition factor → **32 MW pod ceiling** → + hotel + sailing aux → **PMS dispatch** (config ladder ≤85%) → per-engine **FAT SFOC** fuel, split by fuel type (t/h).
- Build a voyage from sea legs + port/anchorage/standby hours; totals roll up in MT.
- Export / import voyages as JSON (payload carries `ship` + `conditionPct`).

No backend. No auth. State lives in React; voyages are user-downloaded JSON blobs.

---

## 2. Tech stack

- **React 19** + **TypeScript** + **Vite 8**, **Tailwind CSS 4** (CSS-first in `src/app.css`)
- Deployment: **GitHub Pages** via `.github/workflows/deploy.yml`

---

## 3. Domain model (computation core)

Power-first forward model (verified spec `docs/edge-power-plant-verified.md` + MAS `docs/load-sharing-philosophy.md`). Pure functions under `src/engine/` and `src/data/`:

- `data/engineDefaults.ts` — 5-DG plant: **electrical (M40E4937) + mechanical (FAT) ratings**, DG class, switchboard, fuel system, and FAT SFOC curves (verified spec §8: load% → kg/h & g/kWh). Constants: `POD_CEILING_MW=32`, `PMS_START_PCT=85`, `PMS_STOP_PCT=75`, `MIN_SEA_DGS=2`, `FUEL_LCV_FACTOR` (MGO ×0.9492 vs HFO basis).
- `data/shipData.ts` — per-ship **Static propulsion-power curves** (MW vs kn), xlsx `EG_Class_Power_from_Fuel.xlsx` column E. Dynamic is NOT stored. Ascent/Xcel end at 22 kn (source non-monotonic above), Edge 24, Apex/Beyond 25. Each ship carries `defaultMainFuel` (Xcel = MGO/diesel).
- `engine/powerModel.ts` — `staticPropMW` + `propPowerMW` (Static × condition%, clamped to the 32 MW pod ceiling; `podLimited` flag).
- `engine/interpolation.ts` — table interp; `interpFuelKgh` (load→kg/h, linear to origin below 10%), `interpSFOC`.
- `engine/fuelBasis.ts` — `fuelFactor(fuel)`: HFO/LSFO ×1.0, MGO ×0.9492.
- `engine/loadSharing.ts` — **PMS dispatch** (M40E4937 §4.2.7): builds the ladder 1L+1M→2L→2L+1M→2L+2M from available mains, picks the smallest config with busbar load ≤ start threshold; ≥1 Large, ≥2 DGs at sea; DG5 excluded from sea. Engine-out falls back to the available pool. `distributeLoad`: **equal-%** or **Sea Optimal** (1-D scan over the Large/Medium split minimising combined FAT fuel).
- `engine/consumption.ts` — orchestrates: prop + hotel + aux → dispatch → per-engine FAT fuel × LCV factor × SFOC-det → per-fuel t/h. Port/anchorage/standby use a capacity-weighted average DG. Fixed MGO boiler burn 0.18 t/hr per port hour.

### Plant facts (verified spec §1, M40E4937)

| DG | Engine | Class | Mech kW | Elec kW | rpm | FAT serial | Switchboard | Fuel system |
|----|--------|-------|--------:|--------:|-----|-----------|-------------|-------------|
| DG1 | W12V46F | Large | 14 400 | 14 109 | 600 | PAAE299764 | HMS1 (FWD) | FS1 (w/ DG2) |
| DG2 | W8L46F | Medium | 9 600 | 9 381 | 600 | PAAE299766 | HMS1 (FWD) | FS1 |
| DG3 | W12V46F | Large | 14 400 | 14 109 | 600 | PAAE299765 | HMS2 (AFT) | FS2 (w/ DG4) |
| DG4 | W8L46F | Medium | 9 600 | 9 381 | 600 | PAAE299767 | HMS2 (AFT) | FS2 |
| DG5 | W12V32E | Small | 6 720 | 6 543 | 720 | PAAE319873 | HMS2 (AFT) | FS3 (own, MGO/LSFO) |

- DG1 & DG3 are the big V12s (shipboard numbering; public fleet ref's "DG1&2=8L46F" is wrong).
- **Electrical ratings** drive all busbar / PMS / load %. SFOC curves are mechanical-basis FAT; load fraction is the common %.
- **Fuel systems share a counter:** changing fuel on one DG of a pair switches its partner (FS1 DG1+DG2, FS2 DG3+DG4). DG5 alone on FS3, MGO/LSFO only.
- **Hotel load:** flat nominal **6 MW**, adjustable (per-ship spec values 5.94–8.15 MW kept only as `hotelRefMW`).
- **Sailing aux:** 1.5 MW when underway. **Pod ceiling:** 32 MW hard cap → speed unachievable above it.
- All ships carry hybrid EGCS scrubbers → HFO is the default at-sea fuel (Xcel: MGO/diesel).

**Rule:** the engine never reaches into React. Components pass state in, get a `CalculationResult` back. No side effects.

### Load-sharing / PMS philosophy
See `docs/load-sharing-philosophy.md` (distilled from M40E4937, PDF in `docs/`). Equal-% droop default + Sea Optimal; start >85%/30 s, stop <75%/5 min; min 2 DGs at sea, ≥1 Large; reserve=0 at sea.

---

## 4. Visual design — Signal Flag Bands (v7-inspired)

Carried unchanged from Solstice Class Voyage Planner / Voyage Tracker v7. See `../voyage-planner/CLAUDE.md` §4: stratified `.cat-card` motif, fuel bands (HFO orange / MGO green / LSFO indigo — never reassign), ocean-cyan accent, Manrope + IBM Plex Mono, slideUp mount.

Engine cards show `type · elec MW · fuel-system` under the DG label (5-card grid); load bar turns amber past the PMS start threshold, red over 100%.

---

## 5. Component layout

Same tree as the Solstice Class Voyage Planner with these deltas:

- `layout/Header.tsx` — ship selector (5 Edge-class ships).
- `parameters/ParametersPanel.tsx` — Condition Factor, Hotel Load, Sailing Aux, SFOC Det, **Load Sharing** select; speed max follows the ship's curve.
- `engines/EnginePanel.tsx` — grid of **5** EngineCards.
- `results/ResultsPanel.tsx` — shows DG config label; pod-ceiling + insufficient warnings.
- `settings/SettingsModal.tsx` — Hotel, Condition, SFOC Det, Sailing Aux, PMS Start Threshold.
- `voyage/VoyageExport.tsx` — JSON payload carries `ship` + `conditionPct`.

`App.tsx` is the single state owner.

---

## 6. Development

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # tsc -b && vite build → dist/
npm run lint
npm run preview  # serve dist/
```

Preview server name in `.claude/launch.json`: **`voyage-planner-edge`** (port 8092).

---

## 7. Operating principles

- **The engine is the source of truth.** If the UI disagrees with `computeConsumption()`, fix the UI.
- **Static power is the canonical curve; condition % is the runtime knob.** Dynamic is never stored.
- **Dispatch follows the MAS PMS ladder** (≤85% start, ≥1 Large, ≥2 at sea). Verify against `docs/edge-power-plant-verified.md` §13 after engine/data changes.
- **Fuel colors are stable.** HFO = orange, MGO = green, LSFO = indigo. Always.
- **Source data is transcribed, not invented.** SFOC ↔ FAT spec §8; ship power ↔ xlsx col E; PMS ↔ M40E4937. Cite the document when changing a number.

---

*Last updated: 2026-06-12.*
