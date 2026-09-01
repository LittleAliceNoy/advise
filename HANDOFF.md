# ADVISE presentation — current handoff

Last updated: 1 September 2026

This is the single canonical handoff for the ADVISE web presentation. The live
source is authoritative; use this file to orient a new chat, then inspect the
worktree before changing anything.

## Project and workflow

- Project: `/Users/jirachayachoovuthayakorn/Desktop/ADVISE/site`
- Repository: `https://github.com/LittleAliceNoy/advise.git` on `main`.
- Framework: React 19 / Vinext; this is a browser presentation, not a PPTX.
- Current committed presentation state: `763323f` — `Restore full-height
  statistical analysis layout`.
- Source of truth:
  - `app/page.tsx`: `chapters`, physical page order, copy, data, and click
    states.
  - `app/globals.css`: design system and layered page-specific overrides.
  - `../Adalimumab vs.md`: all trial data and clinical wording.
- First actions in a new session: `git status --short`, inspect the named
  slide at 1920 × 1080, then make only scoped changes.
- Use `apply_patch`; avoid destructive Git actions. Run `npm run build` from
  `site` after changes. Vinext’s route-classification notice is informational.
- Do not recreate the old root-level handoffs; they were deliberately deleted.

## Design language

The deck is cinematic editorial science: near-black canvas, warm off-white type,
ADVISE red, and violet for CID / the discontinuation horizon. It must read as a
stage argument, not a dashboard or conventional PowerPoint.

- Use 16:9 presentation proportions, large editorial headlines, thin rules,
  subtle glow, fine square borders, and intentional negative space.
- Red = ADA / active or decisive signal; violet = CID and 0 mg/day further-goal
  logic; gray = context.
- Keep proportional Geist Sans with proportional fallbacks. Never bring back
  generic `monospace`, Menlo, or SF Mono—the earlier fallback caused cramped,
  slashed-zero coding-font text.
- Avoid global restyling for a local problem. Append a narrow page-scoped rule
  at the true end of `globals.css` where needed.
- Screenshots are visual references only; verify clinical claims in the trial
  source.

## Current navigation — 34 live pages

`chapters` in `app/page.tsx` drives the counter and rail and currently matches
the JSX order.

| # | Scene ID | Purpose |
|---:|---|---|
| 01 | `signal` | Opening clinical signal |
| 02 | `clinical-problem` | Introduction: clinical landscape |
| 03 | `therapeutic-goal` | Inflammation control / steroid goals |
| 04 | `systemic-strategies` | Conventional immunosuppression |
| 05 | `question` | Adalimumab evidence before ADVISE |
| 06 | `evidence-gap` | Evidence gap / ADVISE reveal |
| 07–11 | `study-design` through `tapering` | Methodology |
| 12 | `followup` | Follow-up schedule |
| 13 | `outcomes` | Outcome definitions |
| 14 | `statistics-sample-only` | Sample-size statistics |
| 15 | `statistics-redesign` | Statistical framework |
| 16 | `participant-flow` | Participant flow |
| 17 | `baseline-portrait` | Baseline cohort |
| 18 | `treatment-results-redesign` | Treatments received |
| 19–23 | `results` through `quality-of-life-results` | Results and safety |
| 24–30 | `limitations-*`, `discussion-safety` | Discussion / limitations |
| 31 | `conclusion` | Conclusion |
| 32–34 | `outcomes-original`, `secondary-outcomes-redesign`, `tapering-cinematic` | Preserved legacy variants |

Do not remove, reorder, or renumber preserved pages without an explicit request.

## Introduction: locked continuous story

Slides 02–06 must be treated as one progression.

1. **02 — Clinical landscape:** >30 heterogeneous uveitides, anatomical and
   etiologic classification, activity assessment, then convergence of many
   noninfectious intermediate/posterior/panuveitides on oral corticosteroids +
   immunosuppression. Keep the four anatomical eye diagrams, germ/inflammation
   motifs, and centered treatment destination. Do not restore the old funnel,
   central eye, disease list, exclusions, or ADVISE-population language.
2. **03 — Therapeutic goal:** inactive uveitis + lower prednisone. Red `≤7.5
   mg/day` is successful sparing; violet 0 mg/day is the further
   discontinuation goal. Recent work narrowed the upper boxes, made the
   inflammation floor violet, refined the gradient line, and shifted lower
   equations/evidence upward.
3. **04 — Conventional immunosuppression:** preserve the large, airy reference
   composition: substantial drug-class regions, central molecular graphic,
   stepwise band, and observational evidence with intentional empty space.
   CID remains violet.
4. **05 — Adalimumab:** targeted biologic + separate pre-ADVISE evidence
   sources, not a treatment staircase. Preserve large antibody illustration,
   spacious evidence panels, ≈75% scale, and bottom bridge.
5. **06 — Evidence gap:** neutral CID vs ADA comparison, interrupted lines,
   then ADVISE reveal. The reveal was recently lifted/up-tightened and the faint
   rule above it was removed.

Never introduce ADVISE results before Results or visually compare historical
CID percentages with ADA cohort evidence as though head-to-head. Definitions:
sparing = inactive uveitis + prednisone ≤7.5 mg/day; discontinuation = inactive
uveitis + 0 mg/day.

## Recent active implementation state

### Pages 10–11

- Page 10 activity states are stronger than their action lines; its lede should
  match Page 11’s proportional lede treatment.
- Page 11 regional corticosteroid label and the upper panel’s bottom rule were
  lifted to create space for `Restricted windows protected primary and
  secondary outcome assessment`. Keep month-line connectors clear of labels.

### Page 12 — Follow-up

Mandatory click cycle:

1. State 0: timeline only; no highlighted nodes or detail panels.
2. State 1: reveal Every Visit Protocol and Diagnosis-Specific Targeting;
   highlight all visits (M0–M6 red; M6–M12 violet).
3. State 2: keep both panels, reveal Milestone Evaluations, and highlight M0,
   M3, M6, M12 only. Next click resets.

M12 has no enclosing border. `SHIFT TO BI-MONTHLY` is violet and `ANNIVERSARY
CLOSE-OUT` is not bold. Current detail size is intended to be *just big enough*
for projection—larger than the original compact version but not the later
oversized/wrapping version. Baseline dates are left-aligned and not bold; no
red lead line. Diagnosis descriptions match Clinical History reading size.

### Page 13 — Outcomes

- The inactive-uveitis definition is a click-revealed translucent red/violet
  overlay; keep clinical quiescence left and imaging criteria right.
- Detail typography is now “just big enough” after an oversized pass. Icons
  must not overlap text. The second rows—vitreous haze, early-stage VKH, and
  retinal vasculitis—have extra vertical separation from row one.
- `SECONDARY OUTCOMES` is violet. Keep the underlying framework subdued.
- Primary equation numbers 01/02/03 use a separate grid column. Preserve clear
  gap between each number and its label.

### Page 15 — Statistical framework

Latest committed work: `763323f`.

- Restored a full-height editorial four-column grid matching the supplied
  reference: larger title, wider margins, lower/taller grid, larger questions,
  models, bullets and mini-diagrams.
- Header wrapping is intentional: continuous and time-to-event are two lines;
  cumulative/recurrent is three.
- Footer has four notes directly below grid: AS RANDOMIZED, stratification
  variables, sensitivity/missingness, and nominal secondary P values.
- Build passed. Judge later tuning with rendered bounding boxes, not CSS values.

### Pages 16 and 18

- **16 Participant flow:** lede and CONSORT detail were enlarged and the right
  arm flow repositioned. Check the entire flow for overflow before further type
  increases.
- **18 Treatments received:** dense layout was relaxed to correct tight /
  overlapping regions. Preserve clearance in the before/after panels, pathway
  cards, and lower outcomes strip.

## Preserved scientific corrections

- ≥30-letter BCVA loss: ADA 7%, CID 3%, P=0.43.
- Time-to-event HR: 1.68, 95% CI 0.98–2.86.
- Liver enzyme definition: AST/ALT >2× ULN; do not call it “any-grade
  elevation.”
- Use `FURTHER`, not `FARTHER`; `ADA INEFFECTIVE/INTOLERANCE`, not `ANA`.
- Use `advantage`, not `clear advantage`, where previously corrected.

## Interaction and final verification

- Page 12 uses `followupStage` (0–2); Page 13 uses `outcomesStoryStage`; Page
  15 uses `statisticsFrameworkStage`. Preserve and test the cycle/reset when
  touching their JSX or shared CSS.
- Never hard-code totals: navigation comes from `chapters`.
- For each change: inspect status, render the named page at 1920 × 1080, check
  bounds/overlaps and click states, run `npm run build`, then commit only the
  intended implementation. Push only when explicitly requested.
