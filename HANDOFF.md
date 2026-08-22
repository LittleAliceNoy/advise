# ADVISE presentation handoff

This document is for continuing work in a new chat. Read it before editing. The project is a React/Vinext presentation, not a PowerPoint file.

## Project location and commands

- Repository: `/Users/jirachayachoovuthayakorn/Desktop/ADVISE/site`
- GitHub remote: `https://github.com/LittleAliceNoy/advise.git`
- Branch: `main`
- Main source files:
  - `app/page.tsx` — chapter list, navigation, all slide JSX/content
  - `app/globals.css` — all presentation styles; later rules intentionally override earlier ones
- Study/source material: `/Users/jirachayachoovuthayakorn/Desktop/ADVISE/Adalimumab vs.md`
- Start locally: `npm run dev`
- Build/type check: `npm run build`

Use `apply_patch` for edits. Do not use destructive Git commands. The parent folder `/Users/jirachayachoovuthayakorn/Desktop/ADVISE` is only a wrapper Git repository and does not have the GitHub remote. Commit and push from `site`.

## Presentation-wide conventions

- The deck is a full-screen slide experience. Navigation is driven by the `chapters` array near the start of `app/page.tsx`.
- Current deck length: **37 slides**. The right rail and counter are generated from that array.
- The visual system is intentionally consistent:
  - near-black background
  - ADA = vivid red
  - CID = violet/purple
  - white = primary typography
  - muted gray = secondary text
  - thin rules / borders, restrained red and purple atmospheric gradients
  - editorial typography, not dashboard cards or generic charts
- Preserve the existing header, brand, page counter, and right-side progress rail unless a user explicitly requests otherwise.
- When editing a single slide, do not alter other scenes or shared presentation behavior.
- Always inspect at a 16:9 presentation viewport (1920×1080) and check for clipping, text collisions, or vertical overflow. A taller browser window may expose percentage-height problems, so inspect that too if spacing uses viewport percentages.

## Scientific-content rule

The user cares strongly about numerical accuracy. The screenshots are visual references only. Verify wording and values against `Adalimumab vs.md` before changing scientific claims.

Important source locations in `Adalimumab vs.md`:

- Table 5 / safety outcomes: around lines 251–282
- Quality-of-life narrative: immediately after Table 5
- The primary/successful corticosteroid-sparing definition and methodology are earlier in the source.

Do not imply that adalimumab is conventional immunosuppressive therapy (IMT). Do not fabricate statistics, denominators, P values, event rates, model specifications, or outcome definitions.

## Current high-priority slide state

### Safety and tolerability — currently display counter 24 / 37

Scene ID: `systemic-safety-tolerability` in `app/page.tsx`.

Exact safety slide hierarchy:

1. Headline:
   - `Fewer safety signals with ADA.` (white)
   - `Serious events remained similar.` (red)
2. Supporting sentence:
   - `ADA had fewer cataract surgeries, ≥15-letter vision losses, and liver enzyme elevations; serious systemic event rates were similar.`
3. Main / largest evidence block, left:
   - `SAFETY SIGNALS THAT DIFFERED`
   - Cataract surgery, phakic eyes: ADA 2% vs CID 11%, P=0.009
   - ≥15-letter BCVA loss, 3-line decrease: ADA 6% vs CID 13%, P=0.026
   - ≥30-letter BCVA loss, 6-line decrease: ADA 3% vs CID 7%, P=0.430. Its P value is muted, but the rest of the row remains full-color.
   - Elevated liver enzymes: ADA 2% vs CID 10%, P=0.014
4. Smaller secondary panel, upper right:
   - `OTHER OCULAR EVENTS`, header `ADA / CID`
   - IOP +10 mmHg: 9% / 8%, P=0.730
   - IOP ≥24 mmHg: 11% / 13%, P=0.500
   - IOP ≥30 mmHg: 5% / 5%, P=0.930
   - IOP medication: 16% / 10%, P=0.850
   - New glaucoma: 1% / 11%, P=0.200
   - Glaucoma surgery: 1% / 3%, P=0.290
   - ADA values red, CID values violet; separators/P values gray.
   - Do NOT add systemic/laboratory Table 5 rows to this panel unless asked. The user explicitly requested only ocular adverse events here.
5. Bottom left:
   - `TREATMENT INTOLERANCE`
   - Dramatic 0 ADA vs 8 CID is approved and must remain dominant.
   - Detail is deliberately condensed for presentation readability:
     - `CID discontinuations`
     - `MTX-based 6 · Mycophenolate 2`
     - `After discontinuation: 6 → another CID · 1 → ADA · 1 → stopped`
6. Bottom right:
   - `SERIOUS SYSTEMIC EVENTS — NO SIGNIFICANT DIFFERENCE`
   - Infections requiring antibiotics: ADA 0.40/PY, CID 0.37/PY, IRR 1.10, 95% CI 0.61–2.00, P=0.760
   - Hospitalizations: ADA 0.045/PY, CID 0.115/PY, IRR 0.39, 95% CI 0.12–1.26, P=0.120
   - Other serious systemic AEs: rare and similar between groups; no new demyelination events in either group.
   - This section is meant to be a substantial counterweight to the safety-signals panel, not a tiny footnote.

Important layout rules for this slide:

- The top area is `.safety-qol-top`; the lower area is `.safety-bottom-band`.
- The main safety panel uses a fitted CSS grid (`grid-template-rows: auto repeat(4, minmax(0,1fr))`). Do not change the safety rows back to percentage `min-height` rules; that caused the upper content to overflow into the lower band on tall browser windows.
- The upper-right panel is `.table-five-events`; it also uses fitted grid rows so its six rows do not collide with the bottom band.
- The current CSS refinements are near the later Page 25 override section in `app/globals.css`. Prefer adding narrow overrides near this established section rather than refactoring the much older, earlier safety CSS.

### Quality of life — follows the safety slide

Scene ID: `quality-of-life-results`.

It has a dedicated slide and must not be moved back into the safety slide unless the user explicitly asks. Its source-supported content is:

- EQ-5D: no significant change in the proportion of individuals with a perfect score.
- NEI-VFQ-25: similar improvements in both groups, near the 4–6-point minimally clinically meaningful difference.
- SF-36 Physical: ADA essentially unchanged; CID small decline; significant difference at 6 months but not 12 months; neither had a clinically meaningful change.
- SF-36 Mental: no significant between-group difference at 6 or 12 months.

## Other important slide history

- Methodology slides have been repeatedly refined. Do not delete the original combined outcomes/methodology archive pages; the user previously had to request restoration after one was removed.
- Existing outcomes/statistics pages include several intentional archived variants. Preserve their scene IDs and only modify pages explicitly named by the user.
- The current sample-size redesign is the last chapter (`sample-size-redesign`). It was intentionally moved to the end of the deck.
- Page numbers in eyebrow text (for example, `24 — RESULTS`) describe the source/deck narrative, while the displayed right-side counter is generated from the current chapter order. Do not “fix” a discrepancy unless the user specifically requests renumbering.

## Git and handoff process

When the user asks to push:

1. Run `git -C site status --short`.
2. Commit only intended project files in `site`.
3. Push with `git -C site push origin main`.
4. If the sandbox cannot resolve GitHub, re-run that exact push with required elevated network permission.
5. Report the pushed commit hash.

Before finalizing any visual change:

1. Run `npm run build` from `site`.
2. Inspect the named scene at 1920×1080.
3. Check no child element leaves the scene bounds and no adjacent blocks overlap.
4. Keep the answer concise and report build status.

## What not to do

- Do not make visual/scientific guesses when a source value is available.
- Do not replace slide content outside the requested scope.
- Do not turn the editorial slides into dense cards or conventional PowerPoint charts.
- Do not use excessive glow, thick borders, or generic dashboard visuals.
- Do not call a treatment globally safer when the evidence only supports selected tolerability/safety signals with serious events similar.
