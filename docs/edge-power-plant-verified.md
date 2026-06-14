# Celebrity Edge (J34) — Power Plant & Propulsion Reference (Verified)

> Fact-checked reference compiled from primary documents. Use as ground truth
> for Voyage Tracker / analysis code. Date verified: 2026-06-12.
>
> **Primary sources:**
> 1. Wärtsilä FAT Test Protocols (5 engines, STX France J34, 2017)
> 2. STX France M40E4937 Rev A1 — "MAS – Electric Power Plant Philosophy" (Jan 2017)
> 3. Bridge manoeuvring data plate (Podded Diesel-Electric, 2×16 MW)

---

## 1. Diesel generator ratings — VERIFIED

Two rating sets exist and must not be mixed:

| DG | Engine type | Serial (FAT) | FAT mech. rated (kW) | M40E4937 electrical (kW) | Speed | PMS class | Switchboard |
|----|------------|--------------|---------------------:|-------------------------:|-------|-----------|-------------|
| DG1 | W12V46F | PAAE299764 or 299765 | 14,400 | 14,109 | 600 RPM | Large | HMS1 (FWD) |
| DG2 | W8L46F  | PAAE299766 or 299767 |  9,600 |  9,381 | 600 RPM | Medium | HMS1 (FWD) |
| DG3 | W12V46F | PAAE299764 or 299765 | 14,400 | 14,109 | 600 RPM | Large | HMS2 (AFT) |
| DG4 | W8L46F  | PAAE299766 or 299767 |  9,600 |  9,381 | 600 RPM | Medium | HMS2 (AFT) |
| DG5 | W12V32E | PAAE319873           |  6,720 |  6,543 | 720 RPM | Small | HMS2 (AFT) |

**Plant totals (use the electrical column for any busbar/PMS calculation):**

| Quantity | Mechanical (FAT) | Electrical (M40E4937) |
|----------|----------------:|----------------------:|
| Four main engines (2L + 2M) | 48,000 kW | **46,980 kW** |
| All five DGs | 54,720 kW | **53,523 kW** |

The delta between columns is alternator efficiency (~98%).

FAT details worth keeping: W12V46F units tested with alternator
(ABB AMG 1600UT10 DSE, 20,558 kVA, 11 kV, 60 Hz) at Wärtsilä Trieste on HFO.
W8L46F units tested on water brake (Zoellner 14N2N110F) at Trieste on HFO —
so 9,600 kW is shaft power. W12V32E tested at Wärtsilä Vaasa on LFO
(alternator Jeumont JEGSY 100 S 10 R). Turbochargers: TPL71-C34 (V46F),
TPL76-C35 (L46F), Napier NT1-10 ×2 (V32E).

Emergency generators (M40E4937 §2.2): 2 × 1,450 kW, 440 V, 1,800 RPM
(EDG1 → ES1, EDG2 → ES2).

## 2. DG combination ceilings (electrical, 11 kV busbar)

| Combination | Ceiling (kW) | PMS 85% start (kW) | PMS 75% stop (kW) |
|-------------|-------------:|-------------------:|------------------:|
| DG5 only (Small) | 6,543 | 5,562 | 4,907 |
| 1 × Large | 14,109 | 11,993 | 10,582 |
| 1L + 1M | 23,490 | 19,967 | 17,618 |
| 2 × Large | 28,218 | 23,985 | 21,164 |
| 2L + 1M | 37,599 | 31,959 | 28,199 |
| All 4 main | 46,980 | 39,933 | 35,235 |

PMS logic (M40E4937 §4.2.7): load-dependent **start** at >85% of available
power sustained 30 s (adjustable), or DG current >95% nominal for 5 s.
Load-dependent **stop** when post-disconnect load would be <75%, sustained
5 min. Stop is blocked in Manoeuvring mode and once minimum sea
configuration (2 DGs) is reached.

## 3. Bridge manoeuvring plate — ahead (verified from plate photo)

Plate header: "Type of engine: Podded Diesel-Electric — Maximum power: 2×16 MW"

| Lever | Position | RPM | Speed (kn) |
|-------|---------:|----:|-----------:|
| Full Ahead | 10 | 129 | 22.5 |
| Half Ahead | 6 | 90 | 16.6 |
| Slow Ahead | 4 | 60 | 11.0 |
| Dead Slow Ahead | 2 | 30 | 5.5 |
| Stop | 0 | 0 | 0 |

(Astern data exists on the plate but was excluded from analysis by request.
Noteworthy: Half and Full Astern both cap at −90 RPM / 11.2 kn.)

## 4. Speed–power model (approximation, clearly flagged)

Model: `P_prop = 32 × (V / 22.5)³` MW (admiralty/cube law anchored to the
plate's 2×16 MW at Full Ahead 22.5 kn). Hotel load fixed at **6.0 MW**
(figure provided by Chief Engineer; treat as operational baseline, not from
the documents). `P_total = P_prop + 6`.

Verified table:

| Speed (kn) | P_prop (MW) | P_total (MW) | Lever |
|-----------:|------------:|-------------:|-------|
| 5.5 | 0.47 | 6.5 | DSA |
| 11.0 | 3.74 | 9.7 | Slow |
| 16.6 | 12.85 | **18.9** | Half |
| 18.0 | 16.38 | 22.4 | |
| 19.0 | 19.27 | 25.3 | |
| 20.0 | 22.47 | 28.5 | |
| 21.0 | 26.02 | 32.0 | |
| 22.5 | 32.00 | 38.0 | Full |

85% start-threshold crossings (speed at which PMS would call the next DG):

| Running combo | Crossed at |
|---------------|-----------:|
| 1 × Large | 12.9 kn |
| 1L + 1M | 17.1 kn |
| 2 × Large | 18.6 kn |
| 2L + 1M | 21.0 kn |
| All 4 main | 22.9 kn (never reached — above max speed) |

Full Ahead loading: 38 MW on all 4 mains = **80.9%** plant load
(comfortable). On 2L+1M it would be 101.1% — over ceiling, so sustained
Full Ahead requires all four main engines online. DG5 contributes
~0.5 MW of headroom above hotel load and is effectively a harbour set.

Model limitations: cube law underestimates resistance growth near hull
speed (22–23 kn); no sea-trial curve was available; hotel load treated as
speed-invariant.

## 5. Electrical topology (M40E4937)

- Two 11 kV / 60 Hz main switchboards: HMS1 (FWD, DG1+DG2) and
  HMS2 (AFT, DG3+DG4+DG5), bus tie QCTHM1/QCTHM2 with synchro.
- Per pod: 2 × 9,200 kVA propulsion transformers
  (MPEPHTR1/2 port from HMS1; MPESHTR1/2 stbd from HMS2) —
  18,400 kVA per pod, consistent with ~16 MW pod motors.
- 4 bow thrusters × 3,500 kW (BT1/BT3 on HMS1; BT2/BT4 on HMS2).
  Thruster start interlock: one Large + one Medium DG connected,
  loads balanced ±15%.
- 3 AC compressors × 1,250 kW (heavy-consumer blocking; one Large DG
  needed on the bus, or any two DGs).
- Machinery transformers 4 × 4,500 kVA (FHTR1/2 MS1/MS2) feed 440 V
  MS1/MS2; emergency boards ES1/ES2 fed from MS1/MS2 with EDG backup.
- Mode minimum configs: Harbour = 1 DG; Manoeuvring/Sea = 2 DGs
  (bus tie open: 1L + 1M per switchboard; closed: any 2 L/M).
  Sea Optimal mode applies SFOC-optimised unequal load sharing.
- Load shedding: stage 1 = galleys + AC compressors;
  stage 2 = accommodation ventilation.

## 6. Corrections log (errors found in this conversation's earlier turns)

| # | Earlier claim | Correct value | Status |
|---|---------------|---------------|--------|
| 1 | Plant total "62 MW" (initial estimate) | 53,523 kW electrical / 54,720 kW mech | Superseded by documents |
| 2 | Plant total "47.8 MW" with 7.7 / 12.6 / 7.2 MW units (second estimate) | See §1 | Superseded by FAT records |
| 3 | Chart metric card "Total installed 47,142 kW" | **46,980 kW** (4 mains) or **53,523 kW** (all 5) — 47,142 was a mis-addition and mislabel | **ERROR — corrected here** |
| 4 | "All 4 main = 47.1 MW" combination ceiling | 46,980 kW = **47.0 MW** | Minor error (~160 kW) |
| 5 | "Half ahead 16.6 kn ≈ 20.6 MW total" | **18.9 MW** total | **ERROR** |
| 6 | "At 18–19 kn total demand ≈ 18–20 MW" | **22.4–25.3 MW** total | **ERROR** |
| 7 | "1L+1M is the workhorse at 18–19 kn sea speed" | 1L+1M comfortable only to **~17.1 kn**; at 18–19 kn demand exceeds its 85% threshold → 2L or 3-engine config needed | **Revised conclusion** |
| 8 | "2L+1M (37.6 MW) fractionally short of 38 MW at Full Ahead" | Confirmed: 101.1% — over ceiling | Correct |
| 9 | "Full Ahead requires all four mains" | Confirmed: 80.9% load on 4 mains | Correct |
| 10 | DG3/DG4 described as the W12V46F pair in FAT table turn | Per M40E4937, Large units are **DG1 and DG3** (one per switchboard); Medium are DG2/DG4 | Clarified |
| 11 | Public max speed 21.8 kn (Edge) vs plate Full Ahead 22.5 kn | Both retained: 21.8 kn is the published service figure; 22.5 kn is the plate/trial figure. Use 22.5 kn as the model anchor since it matches the plate | Noted discrepancy |
| 12 | Hotel load 6 MW | User-provided operational figure. Note: 3 AC compressors alone total 3.75 MW installed — 6 MW total hotel implies modest AC duty; figure is plausible for mild conditions but is condition-dependent | Flagged assumption |

## 7. Confidence levels

- **High (document-verified):** all §1 ratings, §3 plate values, §5 topology,
  PMS thresholds and mode logic.
- **Medium (derived):** combination ceilings and threshold crossings
  (arithmetic on verified inputs; model-dependent for the speed mapping).
- **Low (approximation):** the cube-law speed–power curve itself, the
  fixed 6 MW hotel load, and any per-speed fuel/SFOC inference. Replace
  with sea-trial or MAS-logged data when available.

---

## 8. FAT SFOC curves — measured fuel vs power (ISO 15550)

Authoritative engine fuel-flow data from the Wärtsilä FAT Acceptance
protocols (page 13, "Fuel Oil Consumption According to ISO 15550").
These supersede any published/generic SFOC curve for inversion work.

**W12V46F — Large (DG1, DG3), HFO LCV 40.530 MJ/kg, rated 14,400 kW**

| Load % | Power (kW) | Fuel (kg/h) | SFOC (g/kWh) |
|-------:|-----------:|------------:|-------------:|
| 10 | 1,457 | 388.9 | 266.9 |
| 25 | 3,597 | 860.9 | 239.3 |
| 50 | 7,205 | 1,506.6 | 209.1 |
| 75 | 10,690 | 2,139.8 | 200.2 |
| 85 | 12,221 | 2,331.5 | 190.8 |
| 90 | 12,972 | 2,506.6 | 193.2 |
| 100 | 14,395 | 2,863.2 | 198.9 |

**W8L46F — Medium (DG2, DG4), HFO LCV 40.530 MJ/kg, rated 9,600 kW**

| Load % | Power (kW) | Fuel (kg/h) | SFOC (g/kWh) |
|-------:|-----------:|------------:|-------------:|
| 10 | 972 | 324.2 | 333.5 |
| 25 | 2,400 | 601.1 | 250.5 |
| 50 | 4,788 | 1,024.9 | 214.1 |
| 75 | 7,224 | 1,486.6 | 205.8 |
| 85 | 8,136 | 1,582.6 | 194.5 |
| 90 | 8,508 | 1,671.5 | 196.5 |
| 100 | 9,534 | 1,918.7 | 201.2 |

**W12V32E — Small (DG5), LFO LCV 42.880 MJ/kg, rated 6,720 kW**

| Load % | Power (kW) | Fuel (kg/h) | SFOC (g/kWh) |
|-------:|-----------:|------------:|-------------:|
| 10 | 675 | 194.3 | 287.9 |
| 25 | 1,679 | 363.6 | 216.6 |
| 50 | 3,372 | 680.5 | 201.8 |
| 75 | 5,080 | 966.7 | 190.3 |
| 85 | 5,716 | 1,084.9 | 189.8 |
| 90 | 6,049 | 1,154.5 | 190.9 |
| 100 | 6,870 | 1,287.0 | 187.3 |

Best-efficiency point sits around 85% load for all three (~190 g/kWh),
the basis for the PMS 85% load-dependent start threshold.

## 9. Fuel basis matrix (per vessel)

| Vessel | Operating fuel | LCV (MJ/kg) | Correction vs FAT HFO basis |
|--------|----------------|------------:|-----------------------------|
| Celebrity Edge (EG) | HFO | 40.530 | None — invert directly |
| Celebrity Beyond (BY) | HFO | 40.530 | None — invert directly |
| Celebrity Apex (AX) | HFO | 40.530 | None — invert directly |
| Celebrity Ascent (AT) | HFO | 40.530 | None — invert directly |
| Celebrity Xcel (XL) | MGO/Diesel | 42.700 | **×1.0535** (scale fuel up to HFO-equiv energy before inversion) |

Propulsion engines (W12V46F, W8L46F) were FAT-tested on HFO, so HFO ships
invert with no correction. XL burns diesel (more energy per kg → fewer kg
for same power); multiply its MT/h by 42.700/40.530 = 1.0535 before
inverting on the HFO-basis FAT curves. DG5's LFO FAT basis is irrelevant to
propulsion (DG5 never joins sea configs).

## 10. Fuel → power inversion method (MAS load-sharing)

Procedure to convert measured fuel (MT/h) to power (MW) per speed:

1. Take Dynamic (or Static) fuel = propulsion + auxiliaries. Apply LCV
   correction from §9 if diesel.
2. Select DG configuration: smallest combination keeping load ≤ 85%
   (PMS load-dependent start threshold, M40E4937 §4.2.7). Try in order:
   1L+1M → 2L → 2L+1M → 2L+2M.
3. Apply equal % load-sharing across connected DGs (MAS §4.2.3.1).
4. Solve for total electrical MW such that the summed FAT fuel of the
   connected engines (each at that % load, via §8 curves) equals the
   target fuel.
5. Propulsion power = electrical − 1.5 MW sailing auxiliaries.
6. Hotel power: invert Service fuel on one medium engine (W8L46F) curve.

Pseudocode:
```
def fuel_MTh(P_MW, dgs):           # dgs = list of (fuel_curve, rated_kW)
    cap = sum(rated for _,rated in dgs)/1000
    lf  = P_MW / cap               # equal % load
    return sum(curve(lf*rated) for curve,rated in dgs)/1000

def invert(target_MTh, dgs):       # solve fuel_MTh(P)=target for P
    return brentq(lambda P: fuel_MTh(P,dgs)-target_MTh, 1.0, cap)

def pick_config(target_MTh):       # PMS 85% rule
    for cfg in [1L+1M, 2L, 2L+1M, 2L+2M]:
        P, load = invert(target_MTh, cfg)
        if load <= 0.85: return cfg, P
    return 2L+2M, invert(target_MTh, 2L+2M)
```

## 11. Power model structure (Static curve + app parameters)

The canonical power-vs-speed curve is **Static** — the clean-hull
reference, derived by inverting the model's Static fuel through the FAT
SFOC curves (§8) and MAS load-sharing. Static fits **P ∝ V^2.98**
(near-ideal cube), confirming it as the physics baseline.

**Dynamic is deliberately excluded** from the stored figures. It is
ephemeral: a point-in-time snapshot of one month's hull state and operating
region. Evidence — the Dynamic/Static ratio is not constant across the
class: Edge/Apex/Ascent/Xcel ≈ +7%, but **Beyond ≈ −5%**. Baking it in
would hard-code one month's conditions into a durable spec. Instead it is
represented at runtime as a single **condition factor (%)** applied to
Static propulsion power (see §12).

### App parameters (not stored as fixed power numbers)

| Parameter | Type | Default | Notes |
|-----------|------|--------:|-------|
| Condition factor | % on propulsion | 100% | >100 = fouling / heavy weather / adverse current; replaces Dynamic |
| Hotel load | MW, class default + per-ship % | 7.23 MW class mean | per-ship % below; itself climate/chiller-adjustable |
| Sailing auxiliaries | MW, underway only | 1.5 MW | applied when V > 0 |

### Per-ship hotel load (derived from Service fuel)

Hotel load varies ±15% across the class — weather/itinerary climate and
big-chiller duty, not a fixed plant trait. Class default = mean = 7.23 MW;
each ship carried as a % of that, app-adjustable by season/region.

| Ship | Hotel (MW) | % of class default |
|------|-----------:|-------------------:|
| Celebrity Edge | 6.58 | 91% |
| Celebrity Beyond | 8.15 | 113% |
| Celebrity Apex | 5.94 | 82% |
| Celebrity Ascent | 7.47 | 103% |
| Celebrity Xcel | 7.99 | 111% |

## 12. Power computation model (for the app)

```
# Inputs
V              = speed (kn)
condition_pct  = condition factor (%, default 100)   # replaces Dynamic
hotel_MW       = class_default(7.23) * ship_hotel_pct # per-ship, season-adj
AUX            = 1.5 if V > 0 else 0

# 1. Static propulsion power (clean-hull reference) from §13 table / fit
P_prop_static  = interp(V, static_table)             # or 0.00604 * V^2.98

# 2. Apply ephemeral condition factor
P_prop         = P_prop_static * condition_pct/100

# 3. HARD POD CEILING — never exceed
if P_prop > 32.0:           # 2 × 16 MW nominal
    V is UNACHIEVABLE at this condition; clamp / flag

# 4. Electrical & total demand
P_elec_prop    = P_prop                              # pods are electrical
P_total_elec   = P_prop + hotel_MW + AUX

# 5. DG configuration (MAS): smallest combo with load <= 85%
config         = pick_config(P_total_elec)           # 1L+1M→2L→2L+1M→2L+2M
```

## 13. Edge STATIC power table (canonical, clean-hull)

Propulsion-only MW (electrical − 1.5 MW aux), HFO, condition = 100%.
Rows above the 32 MW pod ceiling marked ✖ (unachievable; propulsion-limited).

| Speed (kn) | Static fuel (MT/h) | DG config | Pprop STATIC (MW) | >32 MW? |
|-----------:|-------------------:|-----------|------------------:|:-------:|
| 10 | 1.277 | 1L+1M | 3.6 | |
| 12 | 1.641 | 1L+1M | 5.5 | |
| 14 | 2.218 | 1L+1M | 8.7 | |
| 16 | 2.976 | 1L+1M | 12.9 | |
| 17 | 3.421 | 1L+1M | 15.3 | |
| 18 | 3.957 | 2L | 18.1 | |
| 19 | 4.563 | 2L | 22.1 | |
| 20 | 5.312 | 2L+1M | 24.6 | |
| 21 | 5.989 | 2L+1M | 28.9 | |
| 22 | 6.889 | 2L+2M | 32.4 | ✖ |
| 23 | 7.738 | 2L+2M | 38.4 | ✖ |
| 24 | 8.891 | 2L+2M | 43.6 | ✖ |

Static reaches the 32 MW pod ceiling at ~21.7 kn. At condition = 100%
(clean hull) that is the propulsion-limited max speed; higher condition %
lowers it (e.g. +10% → ceiling ≈ 21.1 kn).

## 14. Corrections log — addendum (fuel/SFOC/structure)

| # | Item | Resolution |
|---|------|-----------|
| 13 | Hotel load 6 MW flat | Per-ship, ±15% spread (5.94–8.15 MW); class default 7.23 MW + per-ship % (§11). |
| 14 | Generic Wärtsilä SFOC | Replaced by measured FAT curves (§8). |
| 15 | XL treated as HFO | Corrected: MGO/diesel ×1.0535 (§9). |
| 16 | Dynamic stored as a curve | **Removed.** Ephemeral (Beyond −5% vs others +7%); now a runtime condition % (§12). |
| 17 | Service/colleague point | **Removed** — hull/sea-margin unknown. |
| 18 | No propulsion cap | **32 MW pod ceiling** enforced as hard constraint (§12–13). |
| 19 | Static field role | Confirmed as the canonical clean-hull curve (V^2.98). |

## 15. Confidence levels — addendum

- **High (document-verified):** §8 FAT SFOC; §9 fuel basis; §12 pod ceiling.
- **Medium (derived, validated):** §13 Static inversion (V^2.98 confirms
  near-ideal cube); §11 per-ship hotel loads.
- **Low / app-parameterised:** condition factor (default 100%, user-set per
  voyage); hotel season/region %; 1.5 MW aux; XL LCV assumed 42.7 MJ/kg.

> Companion files: `EG_Class_Power_from_Fuel.xlsx` — **Parameters** sheet
> (class constants, condition %, per-ship hotel %) + per-ship **Static-only**
> power tables with pod-ceiling flags. This .md is the ground-truth spec.
> The app computes power via §12; Static (§13) is the only stored curve,
> Dynamic is reconstructed as Static × condition%. Enforce the 32 MW pod
> ceiling everywhere.
