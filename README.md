# Edge Class Voyage Planner

Speed → Power → Consumption forecasting for the five Celebrity Edge-class ships
(Edge, Apex, Beyond, Ascent, Xcel).

- Per-ship speed/fuel model curves (static + dynamic) from the fleet performance model.
- Heterogeneous 5-DG Wärtsilä plant (2× W8L46F, 2× W12V46F, 1× W12V32E) with
  per-engine FAT SFOC curves (ISO 15550) from the engine Record Books.
- Shared fuel systems (DG1+DG2, DG3+DG4, DG5 own), 82 % continuous load limit (adjustable).
- Voyage builder: sea legs, port / anchorage / standby hours, JSON export & import.

```bash
npm install
npm run dev
```

See `CLAUDE.md` for the full project charter and `docs/edge-class-engine-propulsion.md`
for the fleet engineering reference.
