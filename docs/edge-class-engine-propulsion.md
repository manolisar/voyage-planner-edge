# Celebrity Edge Class — Engine & Propulsion Technical Reference

**Document Type:** Fleet Engineering Reference
**Class:** Edge Class (Celebrity Cruises / Royal Caribbean Group)
**Builder:** Chantiers de l'Atlantique, Saint-Nazaire, France
**Date:** June 2026

---

## 1. Fleet Overview

| Ship | IMO | Yard No. | Delivered | GT | Sub-Class |
|---|---|---|---|---|---|
| Celebrity Edge | 9812705 | J34 | Dec 2018 | 130,818 | Original |
| Celebrity Apex | 9838383 | K34 | Mar 2020 | 130,818 | Original |
| Celebrity Beyond | 9838395 | L34 | Apr 2022 | 140,600 | Extended |
| Celebrity Ascent | 9838400 | M34 | Nov 2023 | 141,420 | Extended |
| Celebrity Xcel | 9884136 | N34 | Nov 2025 | 141,420 | Extended |

> **Note:** Celebrity Edge and Apex were built to the original hull length of 306 m. Celebrity Beyond, Ascent, and Xcel were built on an extended hull of 326–327 m (+20 m), increasing GT to approximately 140,000–141,420.

---

## 2. Power Generation Plant

### 2.1 Plant Philosophy

All Edge-class ships operate on a **diesel-electric propulsion system**. Prime movers drive generators that feed a common electrical bus, which in turn supplies power to the Azipod propulsion drives, bow/stern thrusters, and the hotel load. There are no direct mechanical connections between the engines and propellers.

This arrangement provides:
- Optimal loading and sequencing of generating sets
- Full redundancy and flexible power management
- Freedom in machinery room layout
- High part-load efficiency at reduced speed operations

### 2.2 Generating Sets — Configuration

| Unit | Engine Model | Cylinders | MCR Output | Qty | Total |
|---|---|---|---|---|---|
| DG 1 & 2 | Wärtsilä 8L46F | 8-cylinder in-line | 9.6 MW | 2 | 19.2 MW |
| DG 3 & 4 | Wärtsilä 12V46F | 12-cylinder V-form | 14.4 MW | 2 | 28.8 MW |
| DG 5 | Wärtsilä 12V32E | 12-cylinder V-form | 6.96 MW | 1 | 6.96 MW |
| **Total Installed** | | | | **5** | **~55 MW** |

### 2.3 Wärtsilä 46F — Engine Description

The Wärtsilä 46F is a four-stroke, medium-speed engine series rated at 600 rpm. Key characteristics:

- **Bore × Stroke:** 460 mm × 580 mm
- **Mean effective pressure:** High-efficiency turbocharged and intercooled
- **Fuel injection:** Conventional twin-plunger injection pumps with timing control, or electronically controlled common rail (CR) option
- **Fuel flexibility:** Available in diesel-only, dual-fuel (gas), and methanol-capable configurations
- **Automation:** Wärtsilä Unified Controls — **UNIC C2** (hardwired control interface + CAN bus for alarm/monitoring)
- **Safety module:** Engine Safety Module (ESM) handles overspeed, low lube oil pressure, and high cooling water temperature shutdowns
- **Sump:** Dry oil sump

### 2.4 Wärtsilä 12V32E — Harbour/Emergency Set

The smaller DG 5 (12V32E) provides flexible capacity for port operations and partial-load passages. It complements the 46F units during reduced-demand periods and serves as a backup for power management redundancy.

### 2.5 Fuel Flexibility — Celebrity Xcel (5th Ship)

For Celebrity Xcel, Wärtsilä converted the two 8-cylinder 8L46F units into **tri-fuel capable engines**, able to operate on:

1. Marine Gas Oil (MGO)
2. Heavy Fuel Oil (HFO) / VLSFO
3. **Methanol** (green or conventional)

This makes Celebrity Xcel the first cruise ship in the industry fitted with Wärtsilä 46F methanol-capable engines, significantly reducing SOx, NOx, and particulate matter emissions compared to conventional marine fuels.

---

## 3. Propulsion System

### 3.1 Propulsion Architecture

The Edge class uses **ABB Azipod** electric podded propulsion — a fully integrated diesel-electric drive with no conventional shafting, gearboxes, or rudders.

| Parameter | Specification |
|---|---|
| Propulsion type | Diesel-electric, podded |
| Propulsor units | 2 × ABB Azipod XO |
| Power per unit | 16 MW |
| Total propulsive power | 32 MW |
| Propeller type | Fixed pitch, pulling |
| Azimuthing range | 360° continuous |
| Drive | Variable frequency, direct motor drive |

### 3.2 ABB Azipod XO — Description

The Azipod XO series is designed for high-power open-water applications. The electric motor is housed inside a fully submerged, hydrodynamically optimised pod. Key features:

- **360° azimuthing** — provides full directional thrust in any heading, eliminating the need for rudders
- **Pulling-type propeller** — operates in undisturbed water ahead of the pod, maximising hydrodynamic efficiency
- **Variable speed control** — powered via ACS marine propulsion drive (frequency converter)
- **No shafts or stern tubes** — eliminates stern seal maintenance and shaft alignment issues
- **Improved hull efficiency** — the parabolic ultra-bow design and pod configuration reduce hull resistance
- **Passenger comfort** — lower vibration and noise compared to conventional shaftline arrangements

### 3.3 Bow and Stern Thrusters

| Unit | Type | Qty | Supplier |
|---|---|---|---|
| Tunnel thrusters (bow/stern) | Fixed tunnel, electric drive | 4 | Brunvoll FU115 |

The four Brunvoll FU115 thrusters provide transverse thrust for manoeuvring in port, DP-assisted operations, and wind/current compensation. They are distributed between the bow and stern sections.

### 3.4 Speed Performance

| Parameter | Value |
|---|---|
| Service speed | ~22 knots |
| Maximum speed | ~24 knots |
| Typical fuel consumption at sea | 150–200 t/day (load and condition dependent) |

---

## 4. Power Balance Summary

| Load Category | Approximate Demand |
|---|---|
| Propulsion (2 × Azipod @ full power) | 32.0 MW |
| Bow/stern thrusters (at sea — standby) | ~0.5–1.0 MW |
| Hotel load (HVAC, lighting, catering, etc.) | ~12–18 MW |
| Auxiliary systems (pumps, compressors, etc.) | ~2–4 MW |
| **Total full-load demand (estimated)** | **~47–55 MW** |
| **Total installed generation** | **~55 MW** |

> At full sea speed with full hotel load, all five generating sets are typically required. At reduced speed or in port, selective unit loading optimises fuel consumption and minimises specific fuel oil consumption (SFOC).

---

## 5. Fuel & Emissions Notes

### 5.1 Fuel Types in Service

- **At sea (open ocean):** VLSFO (≤0.50% S) in compliance with MARPOL Annex VI Regulation 14
- **ECA zones (North Sea, Baltic, North America):** MGO (≤0.10% S) or equivalent low-sulphur distillate
- **Xcel:** Additionally capable of methanol operation

### 5.2 NOx Compliance

The Wärtsilä 46F engines comply with **IMO Tier II NOx limits** (MARPOL Annex VI Regulation 13) as delivered. Celebrity Xcel's methanol-capable engines offer a further reduction pathway toward Tier III levels, particularly relevant in NOx Emission Control Areas (NECAs).

### 5.3 SOx & Particulates

With VLSFO and MGO operation, the fleet meets global 0.50% sulphur cap and ECA 0.10% cap requirements without exhaust gas cleaning systems (scrubbers). Celebrity Xcel's methanol mode virtually eliminates SOx and significantly reduces particulate matter.

### 5.4 CII & Energy Efficiency

The diesel-electric architecture, combined with the Azipod's hydrodynamic efficiency, contributes to a favourable Carbon Intensity Indicator (CII) rating. Optimal generator sequencing, slow steaming strategies, and load management are key operational tools for maintaining CII compliance under IMO MEEPC.1/Circ.896.

---

## 6. Key Engineering Notes

**Diesel-electric advantage:** The absence of a direct mechanical link between engines and propellers allows each generating set to be loaded at its optimal efficiency point regardless of ship speed. This is especially beneficial during partial-load passages and port manoeuvring.

**Azipod redundancy:** With two fully independent Azipod units, loss of one pod still allows the vessel to proceed at reduced speed and maintain directional control, satisfying SOLAS propulsion redundancy requirements.

**Hull design:** The parabolic ultra-bow — a vertically rising bow that provides additional sheathing for the bulbous bow and integrates the thruster tunnel exits — reduces drag and improves propulsion efficiency compared to conventional bow forms.

**No rudders:** The Azipod system eliminates conventional rudders entirely. Steering is achieved purely by azimuthing the pods. This removes rudder stock, pintles, gudgeons, and associated maintenance from the scope of hull and machinery class surveys.

**Machinery room flexibility:** The diesel-electric arrangement allows generator sets to be positioned freely within the machinery spaces rather than being constrained by shaft alignment. This optimises weight distribution, noise isolation, and access for maintenance.

---

## 7. Exhaust Gas Cleaning Systems (EGCS / Scrubbers)

### 7.1 Fleet Status

All Edge-class ships are fitted with **Exhaust Gas Cleaning Systems (EGCS)**, referred to within Royal Caribbean Group as **Advanced Emissions Purification (AEP)** systems. RCG has confirmed that approximately 70% of its combined fleet across all brands is equipped with AEP, removing roughly 98% of sulphur dioxide (SO₂) from engine exhaust gases. The Edge-class vessels, as the group's flagship newbuilds, are all within this fitted pool.

| Ship | EGCS Fitted | Type |
|---|---|---|
| Celebrity Edge | Yes | Hybrid (Open/Closed Loop) |
| Celebrity Apex | Yes | Hybrid (Open/Closed Loop) |
| Celebrity Beyond | Yes | Hybrid (Open/Closed Loop) |
| Celebrity Ascent | Yes | Hybrid (Open/Closed Loop) |
| Celebrity Xcel | Yes | Hybrid (Open/Closed Loop) |

### 7.2 System Type — Hybrid EGCS

RCG operates **hybrid scrubbers**, which can switch between two operating modes:

**Open-Loop Mode**
- Uses raw seawater as the scrubbing medium
- The alkalinity of seawater neutralises SOx in the exhaust stream
- Washwater (containing dissolved sulphates, heavy metals, and PAHs) is treated and discharged overboard
- Used in open ocean where local regulations permit discharge
- Economically advantageous — allows continued use of HFO/VLSFO rather than switching to more expensive MGO

**Closed-Loop Mode**
- Uses a recirculating freshwater solution dosed with caustic soda (NaOH) as the scrubbing medium
- Washwater is retained onboard in holding tanks and discharged at approved port reception facilities
- Engaged automatically or manually when entering areas that prohibit open-loop discharge

### 7.3 Mode Selection — Operational Relevance

The hybrid configuration is operationally critical for the Edge-class itinerary profile. Several key trading areas impose restrictions on open-loop washwater discharge:

| Area | Restriction |
|---|---|
| Baltic Sea ports (many) | Open-loop discharge prohibited |
| North Sea (some ports) | Open-loop discharge restricted |
| Belgian, German, Norwegian ports | Varying local bans in force |
| Singapore, Fujairah, other key ports | Discharge restrictions in effect |

Ships operating Scandinavia/Baltic itineraries — as Celebrity Eclipse and Edge-class vessels regularly do — must switch to closed-loop mode upon entering restricted zones. Holding tank capacity and washwater residue discharge planning are key operational considerations for port calls in these regions.

### 7.4 MARPOL Compliance Pathway

The scrubber allows the vessel to burn **HFO or VLSFO (≤3.5% S)** while still complying with:

- **Global sulphur cap (0.50% S):** MARPOL Annex VI Reg. 14 — met via EGCS equivalent compliance
- **ECA sulphur cap (0.10% S):** North Sea and Baltic ECAs — met via EGCS in closed-loop mode, or by switching to MGO/VLSFO as a backup

The EGCS Exhaust Gas Cleaning Record Book (EGCS Record Book) must be maintained onboard, recording mode changes, wash water monitoring data, and any bypass events, in accordance with MEPC.259(68) guidelines.

### 7.5 Celebrity Xcel — Future Outlook

As Celebrity Xcel transitions to **methanol operation** on its two tri-fuel 8L46F units, the reliance on scrubber operation for those engines will be eliminated — methanol combustion produces no SOx and significantly reduced NOx and particulates. The remaining 12V46F and 12V32 engines will continue to require EGCS coverage when burning conventional fuel.

---

*Reference sources: Wikipedia (Edge-class cruise ship, Celebrity Edge, Celebrity Apex, Celebrity Ascent, Celebrity Xcel); Chantiers de l'Atlantique; Wärtsilä 46F Product Guide; ABB Azipod technical documentation; Maritime Executive.*
