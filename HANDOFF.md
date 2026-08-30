# ADVISE presentation — canonical project handoff

Last reconciled: 29 August 2026

This is the only canonical handoff for the ADVISE presentation. The former
root `HANDOFF.md` and `NEW_CHAT_HANDOFF.md` were deleted so future sessions do
not inherit conflicting copies. Read this document before editing.

The current source is always authoritative. Recheck the worktree, `chapters`
array, physical scene order, and rendered page at the start of a session rather
than assuming this snapshot is still current.

## 1. Project, source of truth, and safe workflow

- Project: `/Users/jirachayachoovuthayakorn/Desktop/ADVISE/site`
- Repository: `https://github.com/LittleAliceNoy/advise.git`
- Branch: `main`
- Framework: React 19 with Vinext and a Next-style `app` directory. This is a
  web presentation, not a PowerPoint deck.
- Current reconciled commit: `ca0c7ff`
  (`feat(slide-02): add Introduction / Clinical Problem conceptual progression
  funnel and lock Slide 24-26 typography parity`).
- Primary source files:
  - `app/page.tsx`: chapter list, physical scene order, navigation, scientific
    copy, data, and interactive states.
  - `app/globals.css`: global design system, animations, responsive rules, and
    slide-specific overrides. Later rules win when specificity is equal.
  - `../Adalimumab vs.md`: authoritative trial source for wording,
    definitions, values, and statistical claims.
- Development server: `npm run dev`
- Required implementation verification: `npm run build`
- Edit with `apply_patch`. Avoid destructive Git commands.

Before editing, run `git status --short` inside `site`. Preserve all user-owned
changes. Work only on the slide named by the user unless broader work is
explicitly requested. Do not commit or push handoff documents unless asked.

The existing `tests/rendered-html.test.mjs` is stale starter-template coverage
and does not validate this presentation. Do not treat `npm test` as proof that
the deck is correct until that test is rewritten. The production build plus
rendered visual inspection is the current verification path.

## 2. What the deck is trying to feel like

The ADVISE deck is an interactive, cinematic, editorial scientific story. It
should feel closer to a carefully art-directed journal feature or TED-stage
scientific argument than a dashboard, poster, or conventional PowerPoint.

The visual rhythm is:

1. State a precise clinical question or conclusion.
2. Give only enough explanatory context to orient the audience.
3. Let one dominant visual system carry the reasoning.
4. Reveal evidence deliberately when interaction improves comprehension.
5. End with a restrained takeaway, not another dense panel.

Each slide should communicate one main idea. The headline expresses the
interpretation; the visualization shows why it is credible. Avoid slides that
merely inventory facts.

### Core visual language

- Canvas: true full-screen 16:9; primary inspection size is 1920 x 1080.
- Background: near-black (`#050505`, `#050507`, or `#08080c`) with very subtle
  crimson and occasional violet atmospheric gradients.
- Primary text: warm/off white (`#f2f0ec` and nearby values).
- Secondary text: muted warm gray (`#9b9a98`, `#a09591`, and nearby values).
- ADA: vivid red (`var(--red)`, `#ff2d2d`, `#ff4d52`, `#ff7175`, `#ff8085`).
- CID: violet/purple (`#8f67ff`, `#b58eff`, and related muted violets).
- Neutral comparisons, uncertainty, and connective geometry: white/gray.
- Borders: usually 1 px and low contrast. Use square corners or a restrained
  2-4 px radius.
- Glow: atmospheric and selective. Reserve stronger glow for the decisive
  endpoint, active state, or statistically important signal.
- Texture: the global scene scan-line overlay is intentionally faint.

Color is semantic, not decorative. ADA values and paths stay red; CID values
and paths stay violet. Muted gray communicates context, uncertainty, inactive
states, or secondary evidence. Do not recolor groups merely for variety.

### Typography and hierarchy

The opening slides can use the larger global `h2`, but recent introduction and
discussion slides establish the preferred editorial scale for new
content-heavy slides:

- Eyebrow: uppercase mono, widely tracked, muted white, with the red pulse dot.
- Question hook (`.cataract-hook`): red uppercase, approximately
  `clamp(0.58rem, 0.7vw, 0.8rem)`, weight 600.
- Editorial headline: approximately `clamp(2.6rem, 3.4vw, 4rem)`, line-height
  `0.98`, tracking `-0.05em`.
- Headline emphasis: a short red second line or phrase, not multiple competing
  colors.
- Lede: approximately `clamp(.85rem, .98vw, 1.1rem)`, line-height `1.55`,
  muted warm gray, normally no more than 90% of the left column.
- Editorial evidence rules: thin top rule, numbered mono heading such as
  `01 — CORE THERAPEUTIC OBJECTIVE`, and concise gray body copy.
- Data telemetry: Geist Mono, compact labels, uppercase where useful, with
  numbers visually stronger than descriptors.

Slides 26 (`limitations-1`) and 28 (`limitations-3`) are the best current
references for left-column editorial hierarchy. Slide 02 (`clinical-problem`)
uses a distinct full-width clinical-landscape composition.

### Composition and evidence density

- Preserve generous outer margins and the fixed global brand, counter,
  right-side chapter rail, and progress track.
- A common contemporary layout is a two-column editorial frame: argument on
  the left, dominant scientific figure on the right.
- The right side should be one coherent visual system, not unrelated cards.
  Use paths, tiers, timelines, matrices, funnels, or a single evidence field to
  make relationships visible.
- Use cards only when they represent meaningful units in a larger system.
  Avoid generic dashboard grids, thick containers, repeated rounded boxes, and
  excessive badges.
- Establish a clear evidence hierarchy. One panel or signal should dominate;
  secondary evidence should visibly recede.
- Prefer thin rules, whitespace, alignment, and contrast over decoration.
- Keep copy concise enough to be read while presenting. Supporting detail
  belongs in small telemetry or a short editorial rule, not paragraph stacks.

### Motion and interaction

Motion should explain sequence, causality, comparison, or uncertainty. It
should not exist simply to make the slide busy.

- Start interactive stories with a legible base state.
- Reveal one conceptual step per click.
- Use lines and connectors to lead the eye before revealing the destination.
- Delay a dependent result until its connector or transition arrives.
- Keep inactive material hidden or clearly muted.
- Reset state when re-entering the slide when the interaction requires it.
- Add a clear accessible role/label to clickable canvases and preserve keyboard
  navigation.
- Five states including the initial state is a useful upper bound unless the
  scientific argument genuinely needs more.

## 3. Scientific-content rules

- Screenshots and visual references guide composition only; they are not data
  sources.
- Verify every clinical, numerical, statistical, and methodological statement
  in `../Adalimumab vs.md` before adding or changing it.
- Do not invent denominators, P values, event rates, confidence intervals,
  outcomes, definitions, model specifications, or causal interpretations.
- Do not imply that adalimumab is conventional immunosuppressive therapy (IMT).
- Do not call ADA globally safer. The supported message is that selected
  tolerability/safety signals favored ADA while serious events were similar.
- Preserve the distinction between observed results and speculation. Beyond
  Month 12, the deck must say that the trajectory was not observed.
- Do not give a nonsignificant result the same visual emphasis as a significant
  result unless the slide is explicitly explaining uncertainty.

Important source areas in `Adalimumab vs.md`:

- Safety/Table 5: approximately lines 251-282.
- Quality-of-life narrative: immediately after Table 5.
- Corticosteroid-sparing definitions and methodology: earlier in the source.

## 4. Current chapter map

The current `chapters` array contains 37 entries. The counter and chapter rail
are generated from this array; never hard-code the total.

| # | Scene ID | Role |
|---:|---|---|
| 01 | `signal` | Opening clinical signal |
| 02 | `clinical-problem` | Introduction / clinical landscape |
| 03 | `therapeutic-goal` | Corticosteroid-sparing objective |
| 04 | `systemic-strategies` | Conventional therapy and adalimumab |
| 05 | `question` | Evidence gap / ADVISE reveal |
| 06 | `study-design` | Study design and network |
| 07 | `screening` | Screening pathway |
| 08 | `randomization` | Randomization |
| 09 | `treatment` | Treatment by stratum |
| 10 | `tapering` | Tapering and reactivation |
| 11 | `tapering-cinematic` | Cinematic tapering redesign |
| 12 | `followup` | Follow-up schedule |
| 13 | `outcomes` | Outcomes overview |
| 14 | `statistics-sample-only` | Sample-size-only statistics |
| 15 | `statistics-redesign` | Statistical framework redesign |
| 16 | `participant-flow` | Participant flow |
| 17 | `baseline-portrait` | Baseline cohort |
| 18 | `treatment-results-redesign` | Treatments received |
| 19 | `results` | Corticosteroid sparing |
| 20 | `discontinuation` | Corticosteroid discontinuation |
| 21 | `ocular-results` | Visual and macular outcomes |
| 22 | `systemic-safety-tolerability` | Safety and tolerability |
| 23 | `quality-of-life-results` | Quality of life |
| 24 | `limitations-4` | Treatment advancement |
| 25 | `discussion-safety` | Cataract signal |
| 26 | `limitations-1` | Masking limitations |
| 27 | `limitations-2` | Comparator heterogeneity |
| 28 | `limitations-3` | Temporal trajectory |
| 29 | `limitations-5` | Missing data and attrition |
| 30 | `limitations-6` | Immunogenicity |
| 31 | `conclusion` | Main conclusion |
| 32 | `basics` | Legacy original Slide 02 |
| 33 | `outcomes-original` | Legacy combined outcomes page |
| 34 | `statistics` | Legacy combined statistics page |
| 35 | `sample-size-redesign` | Sample-size redesign |
| 36 | `secondary-outcomes-redesign` | Outcome definitions redesign |
| 37 | `discussion` | Legacy efficacy discussion |

There are 31 main narrative chapters plus 6 preserved legacy/variant chapters,
but all 37 remain live in `chapters`, the counter, the rail, and the rendered
deck. “Archived” means preserved for reference; it does not currently mean
hidden or excluded from navigation. The `chapters` array and physical JSX
scene order currently match.

When adding a new slide, add its unique ID to `chapters` and place its JSX in
the same relative physical order. Decide explicitly whether it belongs in the
main narrative or the legacy/variant section. Do not create another array/DOM
mismatch.

## 5. Key slide references and preservation rules

### Slide 02 — Clinical landscape (`clinical-problem`)

Purpose: establish that heterogeneous uveitides are classified and assessed in
different ways, yet many noninfectious forms converge on one systemic approach.

- This is a full-width clinical landscape, not an ADVISE eligibility or patient-
  selection diagram.
- `>30 UVEITIDES` is the upper hero and introduces a heterogeneous group of
  diseases characterized by intraocular inflammation.
- The middle taxonomy preserves all categories: anterior, intermediate,
  posterior, and panuveitis by anatomy; infectious and noninfectious by
  etiology. Infectious uses a germ motif; noninfectious uses an inflammatory-
  glow motif and includes the nuanced subclass label `PRESUMED AUTOIMMUNE /
  AUTOINFLAMMATORY`. A vertical divider separates the etiologies; do not use a
  bidirectional arrow.
  Nothing is visually discarded at this stage.
- The four schematic eye icons localize inflammation anatomically: anterior
  emphasizes iris/ciliary-body structures, intermediate the vitreous, posterior
  the retinal/choroidal wall, and panuveitis all three compartments.
- The taxonomy leads directly into the clinician's multimodal activity
  assessment: history, ophthalmic examination with anterior-chamber/vitreous
  grading, and often disease-specific imaging. These use detailed line-art SVGs;
  the examination symbol is a diagrammatic slit lamp with the chin/forehead rest
  on the left, the narrow illumination assembly centrally, a single compact
  binocular microscope on the right, a minimal right-sided joystick, pivot, and
  base. It intentionally omits a physician silhouette. Do not add a central eye
  icon.
- The bottom transition is the prominent two-line statement `MANY NON-INFECTIOUS
  INTERMEDIATE, POSTERIOR AND PANUVEITIDES / CONVERGE ON A COMMON SYSTEMIC
  APPROACH`. The single centered, compact treatment destination is `ORAL
  CORTICOSTEROIDS + IMMUNOSUPPRESSION`; do not restore named disease streams or
  the earlier `DIFFERENT DISEASES` headline.
- A scoped short-height layout keeps the entire composition inside wide,
  shallow presentation windows; preserve this so the hero cannot collide with
  the eyebrow and the treatment destination cannot be clipped.
- Do not restore the old funnel, `ADVISE-RELEVANT POPULATION`, exclusion labels,
  or persistent-inflammation-to-visual-acuity endpoint.
- Preserve the legacy `basics` scene unless explicitly asked to remove it.

### Slides 02-05 — Introduction arc

The introduction is a four-slide story after the title signal; treat these
slides as a sequence, not four independent designs.

1. Slide 02, `clinical-problem`: survey the heterogeneous clinical landscape,
   show how clinicians classify and assess activity, then reveal that many
   noninfectious forms converge on oral corticosteroids plus immunosuppression.
2. Slide 03, `therapeutic-goal`: translate sustained control into the two
   concepts used later in the trial—successful corticosteroid sparing and
   successful corticosteroid discontinuation. The equations are the hero, and
   discontinuation is visibly the further clinical goal.
3. Slide 04, `systemic-strategies`: introduce conventional immunosuppression
   and adalimumab as two plausible paths to the same target while keeping their
   different evidence histories visually and scientifically distinct. Keep the
   pathways in an equal violet/red split screen and converge them only at the
   common clinical destination.
4. Slide 05, `question`: remove the supporting detail, expose the absent
   randomized head-to-head comparison through empty space between the two
   evidence streams, then reveal ADVISE as the trial that made the comparison.

Introduction-specific visual grammar:

- Introduction is progressive visual storytelling: landscape and convergence,
  transformation, confrontation, and reveal.
- The small red provocative question plus large white/red interpretive
  headline is reserved for Discussion. Do not use that device on Slides 02-05.
- Do not repeat one left-text/right-visual template across the introduction.
- Do not add numbered editorial takeaway blocks to these slides.
- Slide 02 is a clinical landscape converging on systemic therapy; Slide 03 is a centered clinical equation;
  Slide 04 is a true split-screen pathway; Slide 05 is a minimal cinematic gap.
- Preserve negative space. These slides should become progressively more
  focused as the story moves toward ADVISE.
- Every Introduction slide has one projector-readable hero object. Necessary
  labels use presentation-scale type and sufficient contrast; faint text is
  reserved for genuinely tertiary metadata.
- Slide 03 uses the prednisone `7.5 -> 0 mg/day` transition as the visual hinge
  between sparing and the further goal of discontinuation.
- Slide 04 intentionally differentiates the pathway geometries: CID escalates
  through a staggered treatment path, while ADA anchors two parallel pre-ADVISE
  evidence sources—randomized placebo-controlled trials and a follow-up
  cohort—around the targeted biologic. Do not depict those evidence sources as
  sequential patient-treatment steps.
- Slide 05 removes the supporting premise sentence. The interrupted lines,
  stop nodes, and enlarged `NO RANDOMIZED HEAD-TO-HEAD COMPARISON` occupy the
  evidence gap before the ADVISE reveal.

Scientific safeguards for this arc:

- Do not introduce ADVISE results before the Study Design section.
- Do not present historical conventional response percentages beside the
  adalimumab cohort estimate as if they were comparable. Those historical
  percentages are intentionally absent from Slide 04.
- Previous randomized adalimumab trials established longer time to relapse
  versus placebo during corticosteroid taper/discontinuation; cohort evidence
  only suggested corticosteroid-sparing effectiveness.
- Preserve the exact conceptual thresholds: inactive uveitis plus prednisone
  `<=7.5 mg/day` for successful sparing, and inactive uveitis plus prednisone
  `0 mg/day` for successful discontinuation.
- The visual progression is heterogeneity -> sustained control -> steroid
  dependence -> two strategies -> unresolved comparison -> ADVISE.

### Slide 06 — Study design (`study-design`)

- Preserve the order `CLINICAL CENTERS <-> MTQAC <-> READING CENTER`.
- `.mtqac-workflow` uses `justify-content: flex-start`, `width: fit-content`,
  and `max-width: 100%`.
- At 1920 x 1080, the current rendered layout gives the Reading Center roughly
  200 px of clearance from the internal ethics panel's right edge and has no
  workflow overflow. The earlier right-clearance request is not an unresolved
  desktop task.
- At the narrow in-app browser size previously observed (545 x 837), this row
  overflows the internal panel. Treat that as a separate responsive request,
  not evidence that the 16:9 presentation layout is stale.
- If source and browser disagree, reload or restart the development server and
  compare rendered DOM/computed styles before changing CSS.

### Slide 22 — Safety and tolerability (`systemic-safety-tolerability`)

The hierarchy is deliberate:

1. Headline: fewer selected safety signals with ADA; serious events remained
   similar.
2. Dominant upper-left `SAFETY SIGNALS THAT DIFFERED` panel:
   - Cataract surgery, phakic eyes: ADA 2% vs CID 11%, P=0.009.
   - >=15-letter BCVA loss: ADA 6% vs CID 13%, P=0.026.
   - >=30-letter BCVA loss: ADA 3% vs CID 7%, P=0.430. Keep this P value muted.
   - Elevated liver enzymes: ADA 2% vs CID 10%, P=0.014.
3. Smaller upper-right `OTHER OCULAR EVENTS` panel:
   - IOP +10 mmHg: 9% / 8%, P=0.730.
   - IOP >=24 mmHg: 11% / 13%, P=0.500.
   - IOP >=30 mmHg: 5% / 5%, P=0.930.
   - IOP medication: 16% / 10%, P=0.850.
   - New glaucoma: 1% / 11%, P=0.200.
   - Glaucoma surgery: 1% / 3%, P=0.290.
   This panel is ocular only; do not add systemic/laboratory rows.
4. Bottom-left treatment intolerance: preserve dominant `0 ADA vs 8 CID`,
   MTX-based 6 / mycophenolate 2, and subsequent-treatment summary.
5. Bottom-right serious systemic events: keep it a substantial counterweight.
   - Infections requiring antibiotics: ADA 0.40/PY, CID 0.37/PY, IRR 1.10,
     95% CI 0.61-2.00, P=0.760.
   - Hospitalizations: ADA 0.045/PY, CID 0.115/PY, IRR 0.39,
     95% CI 0.12-1.26, P=0.120.
   - Other serious systemic AEs were rare and similar; no new demyelination
     events occurred in either group.

Layout safeguards:

- `.safety-qol-top` and `.safety-bottom-band` form the upper/lower structure.
- The main panel uses
  `grid-template-rows: auto repeat(4, minmax(0, 1fr))`.
- The ocular-events panel also uses fitted rows. Do not return either area to
  percentage `min-height` rules; that previously caused overlap on tall
  windows.
- Prefer narrow overrides near the later safety section instead of refactoring
  older shared CSS.

### Slide 23 — Quality of life (`quality-of-life-results`)

Keep QoL on its own slide; do not merge it into Safety.

- EQ-5D: no significant change in the proportion with a perfect score.
- NEI-VFQ-25: both groups improved similarly, near the 4-6 point minimally
  clinically meaningful difference.
- SF-36 Physical: ADA essentially unchanged, CID declined slightly; the
  6-month difference was not sustained at 12 months, and neither group had a
  clinically meaningful change.
- SF-36 Mental: no significant between-group difference at 6 or 12 months.

### Slide 28 — Temporal trajectory (`limitations-3`)

Purpose: distinguish an observed earlier ADA advantage from the unobserved
question of whether CID might catch up after Month 12.

`temporalStep` is `0..4`:

1. State 0: timeline only, with 6- and 12-month nodes.
2. Step 1: reveal 6-month steroid sparing — ADA 69%, CID 54%, delta 15 points,
   aOR 1.86, P=0.029.
3. Step 2: draw the white trajectory, then after 0.45 seconds reveal
   12-month sparing — ADA 86%, CID 77%, delta 9 points, aOR 1.89, P=0.077.
4. Step 3: reveal discontinuation at 6 months (15% vs 11%, P=0.300) and
   12 months (55% vs 40%, OR 1.85, P=0.028).
5. Step 4: extend from the 12-month discontinuation result across `FOLLOW-UP
   ENDS` into the dashed `CONVERGE? / PERSIST? / DIVERGE?` fan and reveal
   `BEYOND M12 — NOT OBSERVED`.
6. The next click resets to State 0.

Preserve `.matrix-observed-side { z-index: 10; }` and
`.discontinuation-branching-fan { z-index: 50; }`. The speculative area should
never visually dim the observed evidence.

### Legacy and variant slides

- Preserve `outcomes-original`; it was previously removed accidentally and had
  to be restored.
- Preserve `statistics-sample-only`, `statistics-redesign`, `statistics`,
  `sample-size-redesign`, `secondary-outcomes-redesign`, and `discussion`
  unless the user explicitly asks to remove or reorder them.
- `sample-size-redesign` is chapter 35, followed by Outcome definitions and
  Discussion. It is not the final chapter.
- Eyebrow numbers on legacy slides reflect narrative/version history and do not
  always match the current counter. Do not renumber them casually.

## 6. Building the next homogeneous slide

Before writing JSX, define the slide in one sentence:

- What question does it answer?
- What is the single conclusion the audience should remember?
- Which relationship makes that conclusion easiest to understand: comparison,
  sequence, hierarchy, convergence, attrition, or uncertainty?

Choose the nearest visual precedent:

- Clinical taxonomy, multimodal assessment, or therapeutic convergence: Slide 02.
- Editorial discussion with one dominant scientific figure: Slides 26 and 28.
- Dense evidence hierarchy with primary and secondary blocks: Slide 22.
- Patient-reported outcome synthesis: Slide 23.
- Network/process methodology: Slide 06.

Recommended structure for a new editorial/data slide:

1. Left column: eyebrow -> red question hook -> interpretive headline -> short
   lede -> one or two editorial rules.
2. Right column: one coherent canvas showing the scientific relationship.
3. Use red and violet only where their treatment semantics apply.
4. Make the statistically or clinically decisive signal the strongest element.
5. Use gray to recede context, alternatives, or unobserved outcomes.
6. Add staged interaction only when revealing everything at once would weaken
   understanding.

Do not copy a prior slide mechanically. Match its hierarchy, spacing, color
logic, and pacing while choosing a visual form appropriate to the new
scientific relationship. Homogeneity means shared grammar, not identical
layouts.

Use slide-scoped class names to avoid leaking styles. Because `globals.css` is
large and intentionally layered, prefer a narrow, clearly labeled override near
the current slide-specific section or at the end. Inspect for older selectors
before adding a rule.

## 7. Verification checklist

For every visual or content change:

1. Confirm only requested files/slides changed with `git status --short` and
   `git diff`.
2. Run `npm run build` from `site`.
3. Inspect the named scene at 1920 x 1080.
4. Confirm no child leaves the scene bounds and no blocks overlap, collide,
   clip, or overflow.
5. Test every click state through its final state and reset.
6. Confirm the counter and active rail dot map to the intended chapter.
7. Check ADA/CID colors and scientific wording remain consistent.
8. If responsive behavior was requested, inspect the relevant narrow and tall
   viewports separately; do not infer desktop failure from the narrow embedded
   browser.
9. Report exactly what changed and whether the build passed.

## 8. Git handoff rules

- Work from `site` on `main` unless the user requests another branch.
- Commit only intended project files.
- Do not commit or push these handoff documents unless explicitly requested.
- When asked to push: inspect status, commit intended files, run
  `git push origin main`, and report the pushed commit hash.
