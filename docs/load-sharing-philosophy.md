# Load-Sharing & PMS Philosophy — Edge Class

Distilled from **M40E4937 Rev A1, "MAS – Electric Power Plant Philosophy"**
(STX France, Jan 2017). PDF: `docs/M40E4937-MAS-load-sharing.pdf`.
This is the authority for the planner's engine-dispatch logic.

## Operating modes & minimum config
- **Harbour:** min 1 DG.
- **Manoeuvring / Open Sea:** min 2 DGs. Bus tie open → 1L+1M per switchboard;
  closed → any 2 of L/M. At least one **Large** stays on the bus.
- Switchboards: **HMS1 (FWD)** = DG1 + DG2; **HMS2 (AFT)** = DG3 + DG4 + DG5.

## Load-sharing modes (§4.2.3.1)
1. **Symmetric / equal (default droop):** every connected DG carries the same
   **% of its rating**. Reproduces the verified spec's inversion tables.
2. **Unbalanced:** priority-1 master DG pinned at a 20–100% setpoint; slaves
   split the remainder equally; reverts to equal if a slave would go <10% or
   =100%. Per-switchboard when bus tie open. *(Not modelled in the planner.)*
3. **Sea Optimal:** per-engine setpoints from optimised combined SFOC — each DG
   at a different load for best plant SFOC. *(Planner: optional toggle.)*

## Load-dependent Start / Stop (§4.2.7) — the config ladder
`Available Power = BusBar Nominal − Total Load − Reserve`
`Reserve = 0` in Open Sea / Harbour; `= bow-thruster (nominal − actual)` in Manoeuvring.
- **START** next standby DG when load **>85%** (available <15%) for **30 s**, or
  DG current >95% nominal for 5 s.
- **STOP** lowest-priority DG when post-stop load would be **<75%** for **5 min**.
- Bus tie open → evaluated per side. Stop blocked in Manoeuvring; in Open Sea
  stop blocked once only **2 DGs** remain.

The 85%/75% hysteresis is what produces the ascending ladder
**1L+1M → 2L → 2L+1M → 2L+2M** as speed/load rises (DG5 is a harbour set and
does not join sea configs).

## Other rules
- **Priority (§4.2.3.3):** operator sets 1–5; priority 1 = master / first start / blackout lead.
- **Load ramp (§4.2.4):** newly coupled DG ramps ~6 min to full.
- **Load limitation (§4.2.5):** per-DG real MW limit + de-rating of nominal.
- **Heavy-consumer blocking (§4.2.8):** 3× AC compressors (1.25 MW) and
  4× bow thrusters (3.5 MW) gate on available power; thrusters need 1L+1M,
  compressors need ≥1 Large (or any 2 DGs). Manoeuvring reserves 3.5 MW − thruster load.
- **Preferential trip (§4.2.9):** shed stage 1 = galleys + AC compressors;
  stage 2 = accommodation ventilation.

## Planner encoding
- Sea dispatch = ascending-ceiling ladder among **available** main engines
  (DG1–4), ≥1 Large, ≥2 DGs, smallest config with total busbar load ≤ **85%**.
  Hybrid: marking a DG unavailable forces the next feasible config.
- **Reserve = 0** (Open Sea); available power = nominal − load.
- Load sharing: **equal-%** default; **Sea Optimal** (SFOC-min) optional toggle.
- DG5 excluded from sea auto-dispatch; available for port/harbour boxes (MGO only).
