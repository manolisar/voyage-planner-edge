# Edge Class Voyage Planner — Project Charter

> Single-page speed/power/fuel consumption model for **Celebrity Edge-class ships** (Edge, Apex, Beyond, Ascent, Xcel) with a heterogeneous 5-DG Wärtsilä plant: **2× W8L46F (9.6 MW) + 2× W12V46F (14.4 MW) + 1× W12V32E (6.72 MW)**.
> Sibling of [Voyage Planner](../voyage-planner/) (4× 16V46 vessel); same architecture and Signal Flag Bands design language, different data and plant model.

---

## 1. What this app is

A static SPA used by Chief Engineers / voyage planners to model fuel burn **before** a voyage runs:

- Pick the **ship** (header selector) — each ship has its own speed→fuel model curve.
- Pick the **curve model** (Parameters): `static` (as-built) or `dynamic` (at selected month, incl. hull fouling).
- Pick which DGs are available and which fuel each fuel system runs (HFO / MGO / LSFO).
- Dial in vessel speed, hotel load, sea margin, SFOC deterioration, DG load limit.
- The engine solves plant power demand from the ship curve, distributes load across running DGs (capacity-proportional), interpolates each engine's FAT SFOC, and returns **total fuel rate (t/h) split by fuel type**.
- Build a voyage from sea legs + port/anchorage/standby hours; totals roll up in MT.
- Export / import voyages as JSON (payload carries `ship` + `model`).

No backend. No auth. State lives in React; voyages are user-downloaded JSON blobs.

---

## 2. Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** (CSS-first config in `src/app.css`)
- Deployment: **GitHub Pages** via `.github/workflows/deploy.yml`

---

## 3. Domain model (computation core)

All pure functions under `src/engine/` and `src/data/`:

- `data/engineDefaults.ts` — the 5-DG plant. Per-engine MCR, rpm, fuel system, and FAT SFOC curves (ISO 15550 "Biso" g/kWh) transcribed from each engine's *Record Book of Engine Parameters incl. EIAPP* (project STX FRANCE J34). Also `SFOC_SERVICE_FACTOR` (LHV 42 700 → 40 500 correction) and `DEFAULT_LOAD_LIMIT_PCT = 82`.
- `data/shipData.ts` — per-ship speed→total-fuel curves (MT/h), static + dynamic, from the fleet model export *Speed Fuel Curves in MTh EG Class.xlsx* (modelVersion 2026_V2). Ascent/Xcel curves end at 22 kn (source rows above were non-monotonic and excluded); Edge ends at 24 kn, Apex/Beyond at 25 kn.
- `engine/interpolation.ts` — linear interp; `serviceSFOC()` = FAT ISO SFOC × LHV correction.
- `engine/powerModel.ts` — **inverts the ship fuel curves into speed→plant-kW tables** through the app's own dispatch pipeline under the default lineup. By construction, default config reproduces the source curves (223/236 feasible points < 0.5 %; ±5 % at a few dispatch-step speeds); what-ifs deviate physically.
- `engine/loadSharing.ts` — minimum-set selection (fuel priority HFO→LSFO→MGO, then largest MCR; ≥2 DGs at sea), capacity-proportional distribution.
- `engine/consumption.ts` — orchestrates speed + ship + engines + settings → `CalculationResult`. Port/anchorage/standby use a plant-average representative engine. Fixed **MGO boiler burn 0.18 t/hr** folds into every port hour.

### Plant facts (from FAT records + fleet reference, `docs/edge-class-engine-propulsion.md`)

| DG | Engine | MCR | rpm | FAT serial | Fuel system |
|----|--------|-----|-----|-----------|-------------|
| DG1 | W12V46F | 14 400 kW | 600 | PAAE299764 | FS1 (shared w/ DG2) |
| DG2 | W8L46F | 9 600 kW | 600 | PAAE299766 | FS1 |
| DG3 | W12V46F | 14 400 kW | 600 | PAAE299765 | FS2 (shared w/ DG4) |
| DG4 | W8L46F | 9 600 kW | 600 | PAAE299767 | FS2 |
| DG5 | W12V32E | 6 720 kW | 720 | PAAE319873 | FS3 (own) |

> DG numbering per shipboard practice (DG1 & DG3 are the big V12s) — the public
> fleet reference's "DG1&2 = 8L46F" grouping is wrong. Serial↔DG assignment of
> each pair is an assumption; swap serials in `engineDefaults.ts` if records say otherwise.

- **Shared fuel systems:** changing fuel on one DG of a pair switches its partner (App.handleFuelChange). DG5 is MGO/LSFO only (no HFO connection).
- **Load limit:** 82 % of MCR continuous, any fuel — adjustable in Settings. High-speed fouled-hull legs can exceed 82 % plant capacity; the app flags them *insufficient* (truthful — raise the limit to model flank speed).
- **Hotel load default** is derived per ship/model from the curve's service-fuel column (≈6–7 MW); re-seeded when ship or model changes.
- All ships carry hybrid EGCS scrubbers (RCG "AEP") → HFO is the default at-sea fuel; propulsion is 2× ABB Azipod XO (16 MW each) off the common bus.

**Rule:** the engine never reaches into React. Components pass state in, get a `CalculationResult` back. No side effects.

---

## 4. Visual design — Signal Flag Bands (v7-inspired)

Carried unchanged from Voyage Planner / Voyage Tracker v7. See `../voyage-planner/CLAUDE.md` §4 for the full spec: stratified `.cat-card` motif, fuel bands (HFO orange / MGO green / LSFO indigo — never reassign), ocean-cyan accent, Manrope + IBM Plex Mono, slideUp mount animation.

Engine cards additionally show `type · MW · fuel-system` under the DG label (5-card grid).

---

## 5. Component layout

Same tree as Voyage Planner with these deltas:

- `layout/Header.tsx` — **ship selector** (5 Edge-class ships) next to the settings button.
- `parameters/ParametersPanel.tsx` — adds **Curve Model** select (dynamic/static); speed input max follows the selected ship's curve.
- `engines/EnginePanel.tsx` — grid of **5** EngineCards.
- `settings/SettingsModal.tsx` — adds **DG Load Limit** (%).
- `voyage/VoyageExport.tsx` — JSON payload includes `ship` and `model`.

`App.tsx` is the single state owner — ship/model/DG/settings/legs/port/standby state lives there; children are controlled.

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
- **The ship curves are the calibration target.** Default config must reproduce them; engine/data changes must re-verify the sweep (see §3).
- **Fuel colors are stable.** HFO = orange, MGO = green, LSFO = indigo. Everywhere. Always.
- **Source data is transcribed, not invented.** SFOC tables ↔ FAT PDFs; ship curves ↔ xlsx export. Cite the document when changing a number.

---

*Last updated: 2026-06-10.*
