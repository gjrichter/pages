# Waves of change — US elections 2016–2026

Animated [ixmaps-gl](https://github.com/gjrichter/ixmaps-gl) map. Each state gets an arrow that leans left (Democratic gain) or right (Republican gain); its size is the swing in the two-party margin. Every election swells and fades, and the swell travels across the country (west→east or east→west, switchable).

## What is compared
- Presidential vs the previous presidential (2016 vs 2012, 2020 vs 2016, 2024 vs 2020)
- Midterm (House vote) vs the previous presidential (2018 vs 2016, 2022 vs 2020, 2026 vs 2024)

Margin = (Democratic − Republican) / (Democratic + Republican) × 100, two-party votes. Arrow size is capped at 30 points.

## Data (`data/states.csv`)
- 2012, 2016 presidential; 2018, 2022 House: FEC official federal election results
- 2020, 2024 presidential: county results summed per state ([tonmcg/US_County_Level_Election_Results_08-24](https://github.com/tonmcg/US_County_Level_Election_Results_08-24))
- 2026 House: NBC News live results, **preliminary** (74–99 % counted per state when collected on 2026-11-09)

## Caveats
- House vote totals include uncontested seats, which distort the margin in some states (for example Alabama, Florida, the Dakotas in 2022).
- Alaska and Hawaii are outside the map frame; Washington, DC has no House vote in the 2026 data.
- Midterm and presidential electorates differ, so a midterm "swing" also contains turnout composition effects.

`index.html` is self-contained (data and state outlines inline) and loads ixmaps-gl 0.2.42 from jsDelivr.
