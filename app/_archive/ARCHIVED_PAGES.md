# Archived presentation pages

These pages were removed from the live deck on 2026-08-17, but their complete source is preserved here for manual restoration.

## Restore instructions

1. Add the matching chapter object back to the `chapters` array in `site/app/page.tsx`.
2. Copy the archived `<section>` back into the marked location described below.
3. For the Participants page, also restore `baselineRows` above `treatmentTables` and the `baselineColumn` state inside `Home()`.
4. Run `npm run build` from the `site` directory.

---

## 04 — METHODOLOGY / ELIGIBILITY

Chapter entry:

```tsx
{ id: "eligibility", label: "Eligibility" },
```

Restore this section immediately before `<section id="screening" ...>`:

```tsx
<section id="eligibility" className="scene eligibility-scene">
  <div className="scene-copy eligibility-copy">
    <p className="eyebrow"><span /> 04 — METHODOLOGY / ELIGIBILITY</p>
    <h2>A precise window<br /><em>for entry.</em></h2>
    <p className="lede">Adults and adolescents with non-infectious uveitis entered only when systemic immunosuppression was clinically indicated.</p>

    <div className="inclusion-metrics" aria-label="Key inclusion criteria">
      <article><strong>≥13</strong><span>years of age</span></article>
      <article><strong>≤60</strong><span>days since activity</span></article>
      <article><strong>&gt;7.5</strong><span>mg/day prednisone*</span></article>
    </div>

    <div className="disease-window">
      <span>NON-INFECTIOUS UVEITIS</span>
      <div><small>INTERMEDIATE</small><small>POSTERIOR</small><small>PANUVEITIS</small></div>
      <p>*Current prednisone/prednisolone dose—or an anticipated increase above this threshold for recently active disease.</p>
    </div>
  </div>

  <div className="screening-panel" aria-label="Eight exclusion criteria">
    <div className="screening-header">
      <span>EXCLUSION SCREEN</span>
      <strong>8 GATES</strong>
    </div>
    <div className="screen-core" aria-hidden="true"><i /><i /><span /></div>
    <div className="scan-line" aria-hidden="true" />
    <div className="exclusion-grid">
      <article><b>01</b><span>Active or untreated latent <strong>tuberculosis</strong></span></article>
      <article><b>02</b><span><strong>Multiple sclerosis</strong> or MRI demyelination</span></article>
      <article><b>03</b><span><strong>Behçet disease</strong></span></article>
      <article><b>04</b><span>Current therapy with <strong>2 immunosuppressive drugs</strong></span></article>
      <article><b>05</b><span>Long-acting intravitreal implant within <strong>3 years</strong></span></article>
      <article><b>06</b><span>Anti-TNF-α monoclonal antibody within <strong>60 days</strong></span></article>
      <article><b>07</b><span>Adalimumab <strong>ineffectiveness or intolerance</strong></span></article>
      <article><b>08</b><span><strong>Pregnancy or lactation</strong></span></article>
    </div>
  </div>
</section>
```

---

## 14 — RESULTS / PARTICIPANTS

Chapter entry:

```tsx
{ id: "participants", label: "Participants" },
```

Supporting data—restore above `const treatmentTables`:

```tsx
const baselineRows = [
  ["Age, median (IQR)", "44 (34–57)", "44 (35–55)", "44 (34–59)"],
  ["Women, n (%)", "153 (67)", "75 (66)", "78 (69)"],
  ["White, n (%)", "163 (72)", "81 (71)", "82 (73)"],
  ["Bilateral active uveitis", "189 (83)", "87 (76)", "102 (90)", "contrast"],
  ["Eyes with uveitis", "434", "214", "220"],
  ["BCVA letters, median (IQR)", "81 (71–86)", "81 (71–87)", "81 (74–86)"],
  ["BCVA ≥20/40, n (%)", "344 (79)", "167 (78)", "177 (80)"],
  ["Lens opacity / cataract", "165 (38)", "76 (36)", "89 (40)"],
  ["Macular edema, n (%)", "105 (25)", "61 (29)", "44 (20)", "contrast"],
];
```

Supporting state—restore inside `Home()`:

```tsx
const [baselineColumn, setBaselineColumn] = useState(0);
```

Restore this section immediately before `<section id="baseline-portrait" ...>`:

```tsx
<section id="participants" className="scene participants-scene">
  <div className="scene-copy participants-copy">
    <p className="eyebrow"><span /> 14 — RESULTS / PARTICIPANTS</p>
    <h2>227 entered.<br /><em>Baseline mostly balanced.</em></h2>
    <p className="lede">Selected participant- and eye-level characteristics from Table 1.</p>
    <div className="participant-facts"><span><b>44</b> median age</span><span><b>67%</b> women</span><span><b>72%</b> White</span><span><b>78%</b> posterior / panuveitis</span></div>
  </div>

  <section className="participant-dashboard" aria-label="Selected baseline characteristics">
    <div className="baseline-table" role="table" aria-label="Selected baseline characteristics from Table 1">
      <header role="row">
        <span>TABLE 1 · SELECTED BASELINE CHARACTERISTICS</span>
        {["TOTAL", "ADA", "CID"].map((column, index) => <button key={column} className={baselineColumn === index ? "active" : ""} onClick={() => setBaselineColumn(index)}>{column}</button>)}
      </header>
      {baselineRows.map((row) => (
        <div key={row[0]} className={row[4] ? "baseline-row contrast" : "baseline-row"} role="row">
          <span role="rowheader">{row[0]}</span>
          {row.slice(1, 4).map((value, index) => <strong key={index} className={baselineColumn === index ? "active" : ""} role="cell">{value}</strong>)}
        </div>
      ))}
      <footer><span>Groups were broadly balanced.</span><b>Largest numerical contrasts:</b><span>bilateral disease 76% ADA vs 90% CID</span><span>macular edema 29% ADA vs 20% CID</span></footer>
    </div>
  </section>
</section>
```

