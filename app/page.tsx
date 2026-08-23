"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";

const chapters = [
  { id: "signal", label: "The signal" },
  { id: "basics", label: "Basic knowledge" },
  { id: "question", label: "The research question" },
  { id: "study-design", label: "Study design" },
  { id: "screening", label: "Screening pathway" },
  { id: "randomization", label: "Randomization" },
  { id: "treatment", label: "Treatment by stratum" },
  { id: "tapering", label: "Tapering and reactivation" },
  { id: "tapering-cinematic", label: "Tapering (Cinematic Redesign)" },
  { id: "followup", label: "Follow-up" },
  { id: "outcomes", label: "Outcomes overview" },
  { id: "secondary-outcomes-redesign", label: "Secondary outcomes (Redesign)" },
  { id: "statistics-sample-only", label: "Statistics — sample size only" },
  { id: "statistics-redesign", label: "Statistical analysis framework (Redesign)" },
  { id: "quality-assurance", label: "Quality assurance" },
  { id: "participant-flow", label: "Participant flow" },
  { id: "baseline-portrait", label: "Baseline cohort portrait" },
  { id: "treatment-results-redesign", label: "Treatments received (Redesign)" },
  { id: "results", label: "Corticosteroid sparing" },
  { id: "discontinuation", label: "Corticosteroid discontinuation" },
  { id: "advancement", label: "Immunosuppression advancement" },
  { id: "ocular-results", label: "Visual and macular outcomes" },
  { id: "safety-outcomes", label: "Safety outcomes" },
  { id: "systemic-safety-tolerability", label: "Safety and tolerability" },
  { id: "quality-of-life-results", label: "Quality of life" },
  { id: "discussion", label: "Discussion" },
  { id: "discussion-safety", label: "Discussion 2" },
  { id: "limitations-1", label: "Limitations 1" },
  { id: "limitations-2", label: "Limitations 2" },
  { id: "limitations-3", label: "Limitations 3" },
  { id: "limitations-4", label: "Limitations 4" },
  { id: "limitations-5", label: "Limitations 5" },
  { id: "limitations-6", label: "Limitations 6" },
  { id: "conclusion", label: "Conclusion" },
  { id: "outcomes-original", label: "Outcomes (original combined)" },
  { id: "statistics", label: "Statistical analysis" },
  { id: "sample-size-redesign", label: "Sample size (Redesign)" },
];

const strata = [
  { code: "0L", drug: "0 drugs", prednisone: "<30 mg/day", blocks: [["A", "A", "C", "C"], ["A", "C"], ["C", "A", "A", "C"]] },
  { code: "0H", drug: "0 drugs", prednisone: "≥30 mg/day", blocks: [["A", "C"], ["C", "C", "A", "A"], ["C", "A"]] },
  { code: "1L", drug: "1 drug", prednisone: "<30 mg/day", blocks: [["A", "C", "A", "C", "C", "A"], ["C", "A", "A", "C"]] },
  { code: "1H", drug: "1 drug", prednisone: "≥30 mg/day", blocks: [["C", "A"], ["C", "A", "A", "C"], ["A", "C"]] },
];

const analysisMethods = [
  {
    code: "PRIMARY OUTCOME",
    outcome: "Cumulative corticosteroid sparing and discontinuation",
    note: "Once achieved, a corticosteroid outcome counted at subsequent visits.",
    model: "GEE logistic regression",
    reason: "Unstructured covariance matrix",
    details: [
      ["Fixed effect", "Assigned treatment"],
      ["Stratification", "Initial prednisone dose · baseline immunosuppression use"],
      ["Visit indicators", "Months 8 · 10 · 12"],
      ["Interaction", "Treatment × visit"],
    ],
    specNote: undefined,
  },
  {
    code: "CONTINUOUS",
    outcome: "BCVA, quality of life, and retinal thickness",
    model: "Mixed-effects model",
    reason: "Unstructured correlation",
    note: undefined,
    details: [
      ["Fixed effect", "Assigned treatment"],
      ["Stratification", "Initial prednisone dose · baseline immunosuppression use"],
      ["Visit indicators", "Months 1–12"],
      ["Interaction", "Treatment × visit"],
    ],
    specNote: "Eye-level outcomes · person-level random intercept",
  },
  {
    code: "TIME-TO-EVENT",
    outcome: "Time to corticosteroid outcomes and adverse events",
    model: "Kaplan–Meier + Cox proportional hazards",
    reason: "Tests of interaction and a random effect (frailty model).",
    note: undefined,
    details: undefined,
    specNote: undefined,
  },
  {
    code: "CUMULATIVE",
    outcome: "Prednisone exposure and recurrent systemic events",
    model: "Negative binomial",
    reason: "Fits accumulated exposure and over-dispersed event counts.",
    note: undefined,
    details: undefined,
    specNote: undefined,
  },
];

const treatmentTables = [
  {
    label: "AT BASELINE",
    rows: [
      ["Receiving oral corticosteroids", "186 (82)", "92 (81)", "94 (84)"],
      ["Prednisone dose, median (IQR)", "25 (15–50)", "28 (19–60)", "20 (10–40)"],
      ["Prednisone ≥30 mg/day", "86 (38)", "46 (40)", "40 (36)"],
      ["No immunosuppressive drug", "177 (78)", "90 (79)", "87 (78)"],
      ["Antimetabolite", "49 (22)", "24 (21)", "25 (22)"],
    ],
    mix: ["MTX 23", "MMF 24", "AZA 2"],
  },
  {
    label: "AFTER RANDOMIZATION",
    rows: [
      ["Receiving oral corticosteroids", "221 (99)", "113 (100)", "108 (98)"],
      ["Prednisone dose, median (IQR)", "50 (26–60)", "50 (25–60)", "40 (27–60)"],
      ["Prednisone ≥30 mg/day", "164 (74)", "83 (73)", "81 (74)"],
      ["Antimetabolite initiated", "87 (39)", "2 (2)", "85 (77)"],
      ["Calcineurin inhibitor initiated", "23 (10)", "0", "23 (21)"],
    ],
    mix: ["MTX 44", "MMF 42", "AZA 1", "TAC 19", "CSP 4"],
  },
];

const efficacyHighlights = [
  { label: "6 MONTHS", ada: "69%", cid: "54%", signal: "+15 points", effect: "aOR 1.86", detail: "95% CI 1.06–3.25 · P = 0.029", status: "SIGNIFICANT", month: 6 },
  { label: "12 MONTHS", ada: "86%", cid: "77%", signal: "+9 points", effect: "aOR 1.89", detail: "95% CI 0.93–3.83 · P = 0.077", status: "NOT SIGNIFICANT", month: 12 },
  { label: "TIME-TO-EVENT", ada: "FASTER", cid: "REFERENCE", signal: "Earlier sparing", effect: "HR 1.39", detail: "95% CI 1.02–1.87 · P = 0.032", status: "SIGNIFICANT", month: 0 },
];

const efficacySeries = {
  ada: [[0, 0], [2.1, .02], [2.7, .08], [3.2, .14], [3.6, .20], [3.9, .31], [4.1, .43], [4.5, .48], [5, .58], [5.8, .62], [6, .69], [7, .71], [8, .75], [9, .79], [10, .80], [11, .83], [12, .86], [12.5, .95]] as [number, number][],
  cid: [[0, 0], [2.3, .02], [3, .08], [3.5, .14], [3.9, .28], [4.2, .33], [4.7, .38], [5.1, .48], [5.8, .51], [6, .54], [7, .56], [8, .61], [9, .65], [10, .66], [11, .71], [12, .77], [12.5, .90]] as [number, number][],
};

const discontinuationHighlights = [
  { label: "6 MONTHS", ada: "15%", cid: "11%", signal: "+4 points", effect: "Similar", detail: "P = 0.30", status: "NOT SIGNIFICANT", month: 6 },
  { label: "12 MONTHS", ada: "55%", cid: "40%", signal: "+15 points", effect: "OR 1.85", detail: "95% CI 1.06–3.19 · P = 0.028", status: "SIGNIFICANT", month: 12 },
  { label: "TIME-TO-EVENT", ada: "NUMERICALLY FASTER", cid: "REFERENCE", signal: "Earlier discontinuation", effect: "HR 1.48", detail: "95% CI 0.99–2.22 · P = 0.053", status: "NOT SIGNIFICANT", month: 0 },
];

const discontinuationSeries = {
  ada: [[0, 0], [4.4, .01], [4.9, .04], [5.5, .05], [6, .15], [7, .18], [8, .25], [9, .28], [9.5, .37], [10, .42], [11, .45], [11.5, .55], [12, .55], [12.5, .62]] as [number, number][],
  cid: [[0, 0], [3, .01], [4.8, .03], [5.5, .04], [6, .11], [7, .11], [8, .22], [9, .24], [9.5, .30], [10, .31], [10.5, .37], [11.5, .38], [12, .40], [12.5, .53]] as [number, number][],
};

function CumulativeChart({ focus, highlights, series, ariaLabel }: { focus: number; highlights: typeof efficacyHighlights; series: typeof efficacySeries; ariaLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef(focus);
  const redrawRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    focusRef.current = focus;
    redrawRef.current();
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    let start = 0;
    let visible = false;
    let hoveredMonth: number | null = null;
    let currentProgress = 1;
    const pad = { left: 88, right: 18, top: 16, bottom: 74 };
    const visitMonths = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12];
    const atRiskAda = [113, 110, 108, 100, 77, 59, 51, 38, 31, 0];
    const atRiskCid = [114, 113, 113, 98, 68, 50, 42, 28, 22, 2];
    const stepValue = (points: [number, number][], month: number) => points.reduce((value, point) => point[0] <= month ? point[1] : value, 0);

    const draw = (progress: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;
      const plotW = width - pad.left - pad.right;
      const plotH = height - pad.top - pad.bottom;
      const x = (month: number) => pad.left + (month / 12.5) * plotW;
      const y = (value: number) => pad.top + (1 - value) * plotH;

      ctx.clearRect(0, 0, width, height);
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.lineWidth = 1;
      for (let tick = 0; tick <= 4; tick += 1) {
        const value = tick / 4;
        const py = y(value);
        ctx.strokeStyle = "rgba(255,255,255,.075)";
        ctx.beginPath(); ctx.moveTo(pad.left, py); ctx.lineTo(width - pad.right, py); ctx.stroke();
        ctx.fillStyle = "rgba(205,200,196,.52)";
        ctx.textAlign = "right";
        ctx.fillText(`${Math.round(value * 100)}%`, pad.left - 9, py + 3);
      }
      visitMonths.forEach((month) => {
        const px = x(month);
        ctx.strokeStyle = "rgba(255,255,255,.04)";
        ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, height - pad.bottom); ctx.stroke();
        ctx.fillStyle = "rgba(205,200,196,.52)";
        ctx.textAlign = "center";
        ctx.fillText(String(month), px, height - 57);
      });

      const activeFocus = focusRef.current;
      const markerMonth = highlights[activeFocus].month;
      if (markerMonth) {
        const px = x(markerMonth);
        ctx.fillStyle = activeFocus === 0 ? "rgba(255,45,45,.055)" : "rgba(154,116,255,.045)";
        ctx.fillRect(px - 8, pad.top, 16, plotH);
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = activeFocus === 0 ? "rgba(255,75,75,.7)" : "rgba(190,165,255,.6)";
        ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, height - pad.bottom); ctx.stroke();
        ctx.setLineDash([]);
      }

      const drawSeries = (points: [number, number][], color: string, glow: string) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(pad.left, pad.top - 6, plotW * progress, plotH + 12);
        ctx.clip();
        ctx.beginPath();
        points.forEach(([month, value], index) => {
          if (index === 0) ctx.moveTo(x(month), y(value));
          else {
            const previous = points[index - 1];
            ctx.lineTo(x(month), y(previous[1]));
            ctx.lineTo(x(month), y(value));
          }
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4;
        ctx.lineJoin = "round";
        ctx.shadowColor = glow;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      };
      drawSeries(series.cid, "#aa8cff", "rgba(149,108,255,.45)");
      drawSeries(series.ada, "#ff3d42", "rgba(255,45,45,.55)");
      if (markerMonth && currentProgress > .98) {
        const px = x(markerMonth);
        const adaValue = stepValue(series.ada, markerMonth);
        const cidValue = stepValue(series.cid, markerMonth);
        [[adaValue, "#ff3d42"], [cidValue, "#aa8cff"]].forEach(([value, color]) => {
          const py = y(value as number);
          ctx.beginPath();ctx.arc(px, py, 5.5, 0, Math.PI * 2);ctx.fillStyle=color as string;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#050505";ctx.stroke();
        });
      }
      if (hoveredMonth !== null && progress > .98) {
        const px = x(hoveredMonth);
        const adaValue = stepValue(series.ada, hoveredMonth);
        const cidValue = stepValue(series.cid, hoveredMonth);
        ctx.save();
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = "rgba(235,231,227,.42)";
        ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, height - pad.bottom); ctx.stroke();
        ctx.setLineDash([]);
        [[adaValue, "#ff3d42"], [cidValue, "#aa8cff"]].forEach(([value, color]) => {
          ctx.beginPath(); ctx.arc(px, y(value as number), 5, 0, Math.PI * 2); ctx.fillStyle = color as string; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = "#050505"; ctx.stroke();
        });
        const tooltipW = Math.min(292, width - pad.left - pad.right - 12);
        const tooltipH = 74;
        const tooltipX = Math.max(pad.left + 5, Math.min(width - pad.right - tooltipW, px - tooltipW / 2));
        let tooltipY = y(Math.max(adaValue, cidValue)) - tooltipH - 13;
        if (tooltipY < pad.top + 4) tooltipY = y(Math.min(adaValue, cidValue)) + 14;
        ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 16;
        ctx.fillStyle = "rgba(8,9,14,.96)"; ctx.fillRect(tooltipX, tooltipY, tooltipW, tooltipH);
        ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.strokeRect(tooltipX, tooltipY, tooltipW, tooltipH);
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace"; ctx.textAlign = "left";
        ctx.fillStyle = "rgba(205,200,196,.68)"; ctx.fillText(`MONTH ${hoveredMonth}`, tooltipX + 13, tooltipY + 18);
        ctx.fillStyle = "#ff6468"; ctx.fillText("●", tooltipX + 13, tooltipY + 40);
        ctx.fillStyle = "#f1ede9"; ctx.fillText(`ADA  ${adaValue.toFixed(2)}`, tooltipX + 31, tooltipY + 40);
        ctx.fillStyle = "#bca7ff"; ctx.fillText("●", tooltipX + 132, tooltipY + 40);
        ctx.fillStyle = "#d8d2e8"; ctx.fillText(`CID  ${cidValue.toFixed(2)}`, tooltipX + 150, tooltipY + 40);
        const riskIndex = visitMonths.indexOf(hoveredMonth);
        ctx.fillStyle = "rgba(170,165,161,.66)"; ctx.fillText(`AT RISK  ${atRiskAda[riskIndex]} ADA · ${atRiskCid[riskIndex]} CID`, tooltipX + 13, tooltipY + 61);
        ctx.restore();
      }
      ctx.font = "10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillStyle = "#ff6669";
      ctx.fillText("AT RISK · ADA", pad.left - 8, height - 34);
      ctx.fillStyle = "#bca7ff";
      ctx.fillText("AT RISK · CID", pad.left - 8, height - 17);
      ctx.textAlign = "center";
      visitMonths.forEach((month, index) => {
        ctx.fillStyle = "rgba(239,235,231,.78)";
        ctx.fillText(String(atRiskAda[index]), x(month), height - 34);
        ctx.fillStyle = "rgba(205,193,244,.72)";
        ctx.fillText(String(atRiskCid[index]), x(month), height - 17);
      });
      ctx.save();
      ctx.translate(11, pad.top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "rgba(210,205,201,.48)";
      ctx.textAlign = "center";
      ctx.fillText("CUMULATIVE PROPORTION", 0, 0);
      ctx.restore();
    };

    const animate = (time: number) => {
      if (!visible) return;
      if (!start) start = time;
      const progress = Math.min(1, (time - start) / 1500);
      currentProgress = 1 - Math.pow(1 - progress, 3);
      draw(currentProgress);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        visible = true;
        start = 0;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(animate);
      } else visible = false;
    }, { threshold: .35 });
    observer.observe(canvas);
    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      if (localX < pad.left || localX > rect.width - pad.right || localY < pad.top || localY > rect.height - pad.bottom) {
        hoveredMonth = null;
      } else {
        const rawMonth = ((localX - pad.left) / (rect.width - pad.left - pad.right)) * 12.5;
        const reportedMonths = [6, 12];
        const closestReportedMonth = reportedMonths.reduce((closest, month) => Math.abs(month - rawMonth) < Math.abs(closest - rawMonth) ? month : closest, reportedMonths[0]);
        hoveredMonth = Math.abs(closestReportedMonth - rawMonth) <= .55 ? closestReportedMonth : null;
      }
      draw(currentProgress);
    };
    const onLeave = () => { hoveredMonth = null; draw(currentProgress); };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    const resize = new ResizeObserver(() => draw(currentProgress));
    resize.observe(canvas);
    redrawRef.current = () => draw(currentProgress);
    return () => { redrawRef.current = () => undefined;observer.disconnect(); resize.disconnect(); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseleave", onLeave); cancelAnimationFrame(frame); };
  }, [highlights, series]);

  return <canvas ref={canvasRef} className="efficacy-canvas" aria-label={ariaLabel} />;
}

export default function Home() {
  const deckRef = useRef<HTMLElement>(null);
  const efficacyTouchStartY = useRef<number | null>(null);
  const efficacyTouchAdvancedAt = useRef(0);
  const discontinuationTouchStartY = useRef<number | null>(null);
  const discontinuationTouchAdvancedAt = useRef(0);
  const taperTouchStartY = useRef<number | null>(null);
  const taperTouchAdvancedAt = useRef(0);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedStratum, setSelectedStratum] = useState(0);
  const [calcCycle, setCalcCycle] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState(0);
  const [qaFocus, setQaFocus] = useState(0);
  const [cohortCycle, setCohortCycle] = useState(0);
  const [treatmentPhase, setTreatmentPhase] = useState(0);
  const [treatmentStoryStage, setTreatmentStoryStage] = useState(-1);
  const [treatmentMetric, setTreatmentMetric] = useState(0);
  const [steroidPct, setSteroidPct] = useState(82);

  const treatmentMetrics = [
    {
      label: "OVERALL STEROIDS",
      title: "ALL ORAL CORTICOSTEROIDS",
      subtitle: "Participants receiving any oral prednisone or prednisolone",
      baseTotal: "186 / 226",
      basePct: 82,
      initTotal: "221 / 223",
      initPct: 99,
      adaBase: { count: 92, total: 114, pct: 81 },
      adaInit: { count: 113, total: 113, pct: 100, add: "+21" },
      cidBase: { count: 94, total: 112, pct: 84 },
      cidInit: { count: 108, total: 110, pct: 98, add: "+14" },
      insight: "18% of participants were steroid-free at baseline. Following randomization, trial protocols mandated initiation of oral corticosteroids in 99% of active participants, establishing a high-exposure baseline prior to tapering."
    },
    {
      label: "HIGH-DOSE STEROIDS (≥30mg)",
      title: "HIGH-DOSE CORTICOSTEROIDS (≥30 mg/day)",
      subtitle: "Participants receiving ≥30 mg/day prednisone at baseline vs trial initiation",
      baseTotal: "86 / 226",
      basePct: 38,
      initTotal: "164 / 223",
      initPct: 74,
      adaBase: { count: 46, total: 114, pct: 40 },
      adaInit: { count: 83, total: 113, pct: 73, add: "+37" },
      cidBase: { count: 40, total: 112, pct: 36 },
      cidInit: { count: 81, total: 110, pct: 74, add: "+41" },
      insight: "High-dose corticosteroid usage (≥30 mg/day) increased from 38% at baseline to 74% post-randomization, reflecting protocol-mandated aggressive disease suppression across both treatment arms."
    },
    {
      label: "ANTIMETABOLITE IMT",
      title: "ANTIMETABOLITE THERAPY BREAKDOWN",
      subtitle: "Baseline vs post-randomization antimetabolite use across arms",
      baseTotal: "49 / 226",
      basePct: 22,
      initTotal: "87 / 223",
      initPct: 39,
      adaBase: { count: 24, total: 114, pct: 21 },
      adaInit: { count: 2, total: 113, pct: 2, add: "-22" },
      cidBase: { count: 25, total: 112, pct: 22 },
      cidInit: { count: 85, total: 110, pct: 77, add: "+60" },
      chips: [
        { name: "MMF", count: 42 },
        { name: "MTX", count: 44 },
        { name: "AZA", count: 1 }
      ],
      insight: "Antimetabolite usage fell from 24 (21%) to 2 (2%) in the ADA arm as participants transitioned to Adalimumab biologic monotherapy, while surging from 25 (22%) to 85 (77%) in the CID arm."
    }
  ];

  useEffect(() => {
    const cur = treatmentMetrics[treatmentMetric];
    const targetPct = treatmentPhase === 1 ? cur.initPct : cur.basePct;
    
    setSteroidPct((prev) => {
      if (prev === targetPct) return prev;
      return prev;
    });

    let current = steroidPct;
    const step = targetPct > current ? 1 : -1;
    if (targetPct === current) return;

    const interval = setInterval(() => {
      current += step;
      setSteroidPct(current);
      if ((step > 0 && current >= targetPct) || (step < 0 && current <= targetPct)) {
        setSteroidPct(targetPct);
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [treatmentPhase, treatmentMetric]);
  const [efficacyFocus, setEfficacyFocus] = useState(0);
  const [efficacyStoryStage, setEfficacyStoryStage] = useState(5);
  const [discontinuationFocus, setDiscontinuationFocus] = useState(1);
  const [discontinuationStoryStage, setDiscontinuationStoryStage] = useState(5);
  const [taperingStage, setTaperingStage] = useState(0);
  const [outcomesStoryStage, setOutcomesStoryStage] = useState(0);
  const [sampleSizeCycle, setSampleSizeCycle] = useState(0);
  const [statisticsFrameworkStage, setStatisticsFrameworkStage] = useState(-1);
  const [showCataractWarning, setShowCataractWarning] = useState(false);

  const [comparatorZoomStage, setComparatorZoomStage] = useState(0);
  const compTouchStartY = useRef<number | null>(null);
  const compTouchAdvancedAt = useRef(0);

  const goTo = (index: number) => {
    document.getElementById(chapters[index]?.id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const onScroll = () => {
      const max = deck.scrollHeight - deck.clientHeight;
      setProgress(max > 0 ? (deck.scrollTop / max) * 100 : 0);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(chapters.findIndex((chapter) => chapter.id === visible.target.id));
      },
      { root: deck, threshold: [0.45, 0.65] },
    );
    deck.querySelectorAll(".scene").forEach((section) => observer.observe(section));
    deck.addEventListener("scroll", onScroll, { passive: true });

    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(event.key)) {
        if (chapters[active]?.id === "limitations-2" && comparatorZoomStage < 3) {
          event.preventDefault();
          setComparatorZoomStage((s) => s + 1);
          return;
        }
        event.preventDefault();
        goTo(Math.min(active + 1, chapters.length - 1));
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        if (chapters[active]?.id === "limitations-2" && comparatorZoomStage > 0) {
          event.preventDefault();
          setComparatorZoomStage((s) => s - 1);
          return;
        }
        event.preventDefault();
        goTo(Math.max(active - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      deck.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, comparatorZoomStage]);

  useEffect(() => {
    if (chapters[active]?.id !== "limitations-2") {
      setComparatorZoomStage(0);
    }
  }, [active]);

  const advanceComparatorStory = () => {
    setComparatorZoomStage((current) => (current < 3 ? current + 1 : 0));
  };

  const onCompTouchStart = (event: TouchEvent<HTMLElement>) => {
    compTouchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onCompTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startY = compTouchStartY.current;
    const endY = event.changedTouches[0]?.clientY;
    compTouchStartY.current = null;
    if (startY === null || endY === undefined) return;
    const diff = startY - endY;
    if (Math.abs(diff) < 42) return;
    if (diff > 0 && comparatorZoomStage < 3) {
      event.preventDefault();
      compTouchAdvancedAt.current = Date.now();
      setComparatorZoomStage((s) => Math.min(s + 1, 3));
    } else if (diff < 0 && comparatorZoomStage > 0) {
      event.preventDefault();
      compTouchAdvancedAt.current = Date.now();
      setComparatorZoomStage((s) => Math.max(s - 1, 0));
    }
  };

  const onCompClick = () => {
    if (Date.now() - compTouchAdvancedAt.current < 500) return;
    advanceComparatorStory();
  };

  useEffect(() => {
    if (chapters[active]?.id !== "results") return;
    setEfficacyStoryStage(0);
    setEfficacyFocus(2);
  }, [active]);

  useEffect(() => {
    if (chapters[active]?.id !== "tapering-cinematic") return;
    setTaperingStage(0);
  }, [active]);

  useEffect(() => {
    if (chapters[active]?.id !== "outcomes") return;
    setOutcomesStoryStage(0);
  }, [active]);

  useEffect(() => {
    if (chapters[active]?.id !== "sample-size-redesign") return;
    setSampleSizeCycle((cycle) => cycle + 1);
  }, [active]);

  useEffect(() => {
    if (chapters[active]?.id !== "statistics-sample-only") return;
    setCalcCycle((cycle) => cycle + 1);
  }, [active]);

  useEffect(() => {
    if (chapters[active]?.id !== "statistics-redesign") return;
    setStatisticsFrameworkStage(-1);
  }, [active]);

  const advanceEfficacyStory = () => {
    setEfficacyStoryStage((current) => {
      const next = Math.min(current + 1, 5);
      if (next === 2) setEfficacyFocus(0);
      if (next === 3) setEfficacyFocus(1);
      if (next === 4) setEfficacyFocus(2);
      return next;
    });
  };

  const resetEfficacyStory = () => {
    setEfficacyStoryStage(0);
    setEfficacyFocus(2);
  };

  const onEfficacyTouchStart = (event: TouchEvent<HTMLElement>) => {
    efficacyTouchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onEfficacyTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startY = efficacyTouchStartY.current;
    const endY = event.changedTouches[0]?.clientY;
    efficacyTouchStartY.current = null;
    if (startY === null || endY === undefined || startY - endY < 42 || efficacyStoryStage >= 5) return;
    event.preventDefault();
    efficacyTouchAdvancedAt.current = Date.now();
    advanceEfficacyStory();
  };

  const onEfficacyClick = () => {
    if (Date.now() - efficacyTouchAdvancedAt.current < 500 || efficacyStoryStage >= 5) return;
    advanceEfficacyStory();
  };

  const advanceTaperingStory = () => {
    setTaperingStage((current) => Math.min(current + 1, 8));
  };

  const advanceOutcomesStory = () => {
    setOutcomesStoryStage((current) => Math.min(current + 1, 3));
  };

  const onTaperTouchStart = (event: TouchEvent<HTMLElement>) => {
    taperTouchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onTaperTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startY = taperTouchStartY.current;
    const endY = event.changedTouches[0]?.clientY;
    taperTouchStartY.current = null;
    if (startY === null || endY === undefined || startY - endY < 42 || taperingStage >= 8) return;
    event.preventDefault();
    taperTouchAdvancedAt.current = Date.now();
    advanceTaperingStory();
  };

  const onTaperClick = () => {
    if (Date.now() - taperTouchAdvancedAt.current < 500 || taperingStage >= 8) return;
    advanceTaperingStory();
  };

  useEffect(() => {
    if (chapters[active]?.id !== "discontinuation") return;
    setDiscontinuationStoryStage(0);
    setDiscontinuationFocus(2);
  }, [active]);

  const advanceDiscontinuationStory = () => {
    setDiscontinuationStoryStage((current) => {
      const next = Math.min(current + 1, 5);
      if (next === 2) setDiscontinuationFocus(1);
      if (next === 3) setDiscontinuationFocus(0);
      if (next === 4) setDiscontinuationFocus(2);
      return next;
    });
  };

  const resetDiscontinuationStory = () => {
    setDiscontinuationStoryStage(0);
    setDiscontinuationFocus(2);
  };

  const onDiscontinuationTouchStart = (event: TouchEvent<HTMLElement>) => {
    discontinuationTouchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onDiscontinuationTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startY = discontinuationTouchStartY.current;
    const endY = event.changedTouches[0]?.clientY;
    discontinuationTouchStartY.current = null;
    if (startY === null || endY === undefined || startY - endY < 42 || discontinuationStoryStage >= 5) return;
    event.preventDefault();
    discontinuationTouchAdvancedAt.current = Date.now();
    advanceDiscontinuationStory();
  };

  const onDiscontinuationClick = () => {
    if (Date.now() - discontinuationTouchAdvancedAt.current < 500 || discontinuationStoryStage >= 5) return;
    advanceDiscontinuationStory();
  };

  return (
    <>
      <div className="progress-track" aria-hidden="true">
        <span style={{ height: `${progress}%` }} />
      </div>

      <header className="topbar">
        <button className="brand" onClick={() => goTo(0)} aria-label="Return to opening">
          <span className="brand-mark"><i /></span>
          <span>ADVISE <b>TRIAL</b></span>
        </button>
        <div className="chapter-readout" aria-live="polite">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <i />
          <span>{String(chapters.length).padStart(2, "0")}</span>
        </div>
      </header>

      <nav className="chapter-nav" aria-label="Presentation chapters">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            className={index === active ? "active" : ""}
            onClick={() => goTo(index)}
            aria-label={`Go to ${chapter.label}`}
            aria-current={index === active ? "step" : undefined}
          >
            <i />
          </button>
        ))}
      </nav>

      <main className="deck" ref={deckRef}>
        <section id="signal" className="scene hero-scene">
          <div className="star-field" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit orbit-a"><i /></div>
            <div className="orbit orbit-b"><i /></div>
            <div className="cosmic-eye"><div className="iris"><i /></div></div>
          </div>
          <div className="scene-copy hero-copy">
            <p className="eyebrow"><span /> 01 — A NEW CLINICAL SIGNAL</p>
            <h1>Seeing beyond<br />the <em>steroid horizon.</em></h1>
            <p className="lede hero-paper">
              <span>Adalimumab vs. Conventional Immunosuppression for Uveitis (ADVISE) Trial</span>
              <small>OPHTHALMOLOGY • 2026</small>
            </p>
            <button className="primary-action" onClick={() => goTo(1)}>
              Begin the story <span>↓</span>
            </button>
          </div>
          <div className="hero-meta">
            <span>Presented by · R2 Jirachaya Choovuthayakorn</span>
            <span>Advisor · Prof. Kessara Pathanapitoon, MD, PhD</span>
          </div>
        </section>

        <section id="basics" className="scene basics-scene">
          <div className="scene-copy">
            <p className="eyebrow"><span /> 02 — BASIC KNOWLEDGE</p>
            <h2>When inflammation<br />moves <em>inside the eye.</em></h2>
            <p className="lede">Uveitis is a family of 30+ inflammatory diseases. In intermediate, posterior, and panuveitis, inflammation can threaten the retina, choroid, and vision itself.</p>
            <div className="micro-facts">
              <div><strong>30+</strong><span>uveitic diseases</span></div>
              <div><strong>≤7.5</strong><span>mg/day prednisone target</span></div>
            </div>
          </div>
          <div className="anatomy-graphic" aria-label="Animated cross-section of an inflamed eye">
            <div className="eye-shell">
              <div className="eye-flare flare-one" /><div className="eye-flare flare-two" />
              <div className="lens" /><div className="retina" /><div className="optic" />
            </div>
            <span className="label label-retina"><i />RETINA</span>
            <span className="label label-inflammation"><i />INFLAMMATION</span>
            <span className="label label-nerve"><i />OPTIC NERVE</span>
          </div>
          <p className="side-note">The clinical target: inactive disease with the lowest possible corticosteroid exposure.</p>
        </section>

        <section id="question" className="scene question-scene">
          <div className="question-orbits" aria-hidden="true">
            <div className="choice choice-ada"><div className="molecule"><i /><i /><i /><i /></div><span>ADALIMUMAB</span></div>
            <div className="versus">VS</div>
            <div className="choice choice-cid"><div className="tablet-stack"><i /><i /><i /></div><span>CONVENTIONAL</span></div>
          </div>
          <div className="scene-copy centered-copy">
            <p className="eyebrow"><span /> 03 — THE RESEARCH QUESTION</p>
            <h2>Two proven paths.<br /><em>One missing comparison.</em></h2>
            <p className="lede">Adalimumab was known to delay relapse versus placebo. Conventional antimetabolites and calcineurin inhibitors were standard care. Their head-to-head effectiveness was unknown.</p>
            <div className="research-question">Which approach achieves steroid-sparing control sooner?</div>
          </div>
        </section>

        <section id="study-design" className="scene design-scene">
          <div className="scene-copy design-copy">
            <p className="eyebrow"><span /> 04 — METHODOLOGY / STUDY DESIGN</p>
            <h2>Built across<br /><em>three continents.</em></h2>
            <p className="lede">The ADVISE Trial was a multicenter, randomized, unmasked, parallel-treatment comparative-effectiveness superiority trial comparing adalimumab with conventional immunosuppressive drugs for uveitis.</p>
            <div className="design-attributes" aria-label="Study design features">
              <div><strong>1:1</strong><span>randomized allocation</span></div>
              <div><strong>OPEN</strong><span>unmasked treatment</span></div>
              <div><strong>∥</strong><span>parallel groups</span></div>
              <div><strong>SUPERIORITY</strong><span>comparative effectiveness</span></div>
            </div>
          </div>

          <div className="geo-stage" aria-label="Map showing 26 clinical centers in the United States, United Kingdom, and Australia">
            <div className="map-header"><span>ADVISE CLINICAL NETWORK</span><strong>26 SITES</strong></div>
            <div className="world-map" aria-hidden="true">
              <i className="continent cont-na" /><i className="continent cont-sa" />
              <i className="continent cont-eu" /><i className="continent cont-af" />
              <i className="continent cont-as" /><i className="continent cont-au" />
              <i className="map-route route-west" /><i className="map-route route-east" />
              <span className="site-marker marker-us"><i /><b>19</b><small>UNITED STATES</small></span>
              <span className="site-marker marker-uk"><i /><b>5</b><small>UNITED KINGDOM</small></span>
              <span className="site-marker marker-au"><i /><b>2</b><small>AUSTRALIA</small></span>
            </div>
            <div className="ethics-panel">
              <div className="ethics-seal" aria-hidden="true"><i /></div>
              <div className="ethics-copy"><span>ETHICS &amp; OVERSIGHT</span><p>Approved by the institutional review boards of every clinical center and all 3 resource centers.</p></div>
              <div className="resource-tags"><small>Chairman&apos;s Office</small><small>Coordinating Center</small><small>Reading Center</small></div>
            </div>
          </div>
        </section>

        <section id="screening" className="scene journey-scene">
          <div className="scene-copy journey-copy screening-inclusion-copy">
            <p className="eyebrow"><span /> 05 — METHODOLOGY / SCREENING PATHWAY</p>
            <h2>The entry<br /><em>window.</em></h2>
            <p className="lede">Three inclusion thresholds defined who could proceed to the eight-part safety screen.</p>
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

          <div className="orbital-screen-panel" aria-label="Central orbital scanner showing eight exclusion gates">
            <div className="orbital-panel-header"><span>EXCLUSION SCREEN</span><strong>8 SAFETY GATES</strong></div>
            <div className="clearance-orbit">
              <span className="journey-label">ORBITAL SAFETY SCAN</span>
              <div className="orbit-sweep" aria-hidden="true" />
              <div className="clearance-eye" aria-hidden="true"><i /><span /></div>
              <small className="gate gate-1"><b>01</b> ACTIVE/LATENT TB</small>
              <small className="gate gate-2"><b>02</b> MS/DEMYELINATION (MRI)</small>
              <small className="gate gate-3"><b>03</b> BEHÇET</small>
              <small className="gate gate-4"><b>04</b> 2 IMMUNOSUPPRESSIVE</small>
              <small className="gate gate-5"><b>05</b> IVT STEROID ≤3Y<span>LONG-ACTING</span></small>
              <small className="gate gate-6"><b>06</b> ANTI-TNFα ≤60D</small>
              <small className="gate gate-7"><b>07</b> ANA INEFFECTIVE/<wbr />INTOLERANCE</small>
              <small className="gate gate-8"><b>08</b> PREGNANCY/<wbr />LACTATION</small>
              <div className="clearance-status"><i />SCREENING IN PROGRESS</div>
            </div>
          </div>
        </section>

        <section id="randomization" className="scene randomization-scene">
          <div className="scene-copy randomization-copy">
            <p className="eyebrow"><span /> 06 — METHODOLOGY / STRATIFICATION &amp; RANDOMIZATION</p>
            <h2>Four strata.<br /><em>One balanced split.</em></h2>
            <p className="lede">Participants were stratified by current immunosuppression and anticipated prednisone dose, then randomized within each stratum using varying-size permuted blocks to maintain the expected allocation ratio.</p>
            <div className="randomization-timeline" aria-label="Steps completed before randomization assignment was revealed">
              <span><b>01</b><em>CONSENT</em></span>
              <span><b>02</b><em>BASELINE CHECK</em></span>
              <span><b>03</b><em>ELIGIBLE</em></span>
              <span><b>04</b><em>RANDOMIZATION</em><small>BY COORDINATING CENTER</small></span>
              <span className="timeline-reveal"><b>05</b><em>REVEAL</em><small>VIA WEB PORTAL</small></span>
            </div>
          </div>

          <div className="four-strata-flow" aria-label="Four parallel strata, each using independent permuted blocks with 1 to 1 allocation">
            <div className="strata-source"><span>ELIGIBLE PARTICIPANT</span></div>
            {[1, 3, 0, 2].map((target, sequence) => (
              <i key={target} className={`participant-token target-${target} sequence-${sequence}`} aria-hidden="true" />
            ))}
            <div className="strata-branches" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="strata-columns">
              {strata.map((stratum, index) => (
                <button key={stratum.code} className={`stratum-column ${selectedStratum === index ? "active" : ""}`} onClick={() => setSelectedStratum(index)} aria-pressed={selectedStratum === index}>
                  <span className="stratum-code">{stratum.code}</span>
                  <small>{stratum.drug} · {stratum.prednisone}</small>
                  <div className="permuted-stack" key={`${stratum.code}-${selectedStratum === index}`}>
                    {stratum.blocks.map((block, blockIndex) => (
                      <span className="permuted-block" key={`${stratum.code}-${blockIndex}`}>
                        {block.map((assignment, assignmentIndex) => <i key={`${assignment}-${assignmentIndex}`} className={assignment === "A" ? "token-a" : "token-c"}>{assignment}</i>)}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <div className="strata-balance"><strong>1 : 1 WITHIN EACH STRATUM</strong></div>
            <div className="strata-legend">
              <span><b>0 / 1</b> = DRUG COUNT</span>
              <span><b>L / H</b> = &lt;30 / ≥30 MG/DAY</span>
              <span><b>A</b> = ADA</span>
              <span><b>C</b> = CID</span>
            </div>
          </div>
        </section>

        <section id="treatment" className="scene treatment-scene">
          <div className="scene-copy treatment-copy">
            <p className="eyebrow"><span /> 07 — METHODOLOGY / TREATMENT BY STRATUM</p>
            <h2>Baseline therapy.<br /><em>Defines the next step.</em></h2>
          <p className="lede">No drug at baseline? Start one. Already on one? Add another.</p>
          </div>

          <div className="treatment-symbols" aria-hidden="true">
            <div className="treatment-symbol treatment-symbol-ada">
              <div className="treatment-symbol-orb"><i className="syringe-icon"><b /></i></div>
              <span>ADA · BIOLOGIC</span>
            </div>
            <div className="treatment-symbol treatment-symbol-cid">
              <div className="treatment-symbol-orb"><i className="tablet-icon"><b /><b /></i></div>
              <span>CID · CONVENTIONAL</span>
            </div>
          </div>

          <div className="immunosuppressive-title treatment-section-title">
            <span>IMMUNOSUPPRESSIVE</span>
          </div>
          <div className="treatment-matrix" aria-label="Treatment assignment for each of the four strata">
            <div className="treatment-table-head">
              <span>STRATUM</span>
              <strong><b>ADA</b></strong>
              <strong><b>CID</b></strong>
            </div>
            <div className="treatment-table-body">
              <article className="treatment-row">
                <div className="treatment-stratum"><strong>0 DRUGS</strong><span>&lt;30 MG/DAY</span></div>
                <div className="treatment-ada treatment-plan"><span className="drug-chip drug-chip-new">ADA</span><small>MONOTHERAPY</small></div>
                <div className="treatment-cid treatment-plan"><span className="drug-chip drug-chip-new">MTX</span><em>OR</em><span className="drug-chip drug-chip-new">MMF</span></div>
              </article>
              <article className="treatment-row">
                <div className="treatment-stratum"><strong>0 DRUGS</strong><span>≥30 MG/DAY</span></div>
                <div className="treatment-ada treatment-plan"><span className="drug-chip drug-chip-new">ADA</span><small>MONOTHERAPY</small></div>
                <div className="treatment-cid treatment-plan"><span className="drug-chip drug-chip-new">MTX</span><em>OR</em><span className="drug-chip drug-chip-new">MMF</span></div>
              </article>
              <article className="treatment-row">
                <div className="treatment-stratum"><strong>1 DRUG</strong><span>&lt;30 MG/DAY</span></div>
                <div className="treatment-ada treatment-plan"><span className="drug-chip drug-chip-current">CURRENT DRUG</span><i>+</i><span className="drug-chip drug-chip-new">ADA</span></div>
                <div className="treatment-cid treatment-plan"><span className="drug-chip drug-chip-current">CURRENT DRUG</span><i>+</i><span className="drug-chip drug-chip-new">DIFFERENT-CLASS DRUG</span></div>
              </article>
              <article className="treatment-row">
                <div className="treatment-stratum"><strong>1 DRUG</strong><span>≥30 MG/DAY</span></div>
                <div className="treatment-ada treatment-plan"><span className="drug-chip drug-chip-current">CURRENT DRUG</span><i>+</i><span className="drug-chip drug-chip-new">ADA</span></div>
                <div className="treatment-cid treatment-plan"><span className="drug-chip drug-chip-current">CURRENT DRUG</span><i>+</i><span className="drug-chip drug-chip-new">DIFFERENT-CLASS DRUG</span></div>
              </article>
            </div>
          </div>

          <div className="prednisolone-strip" aria-label="Initial prednisolone dosing by uveitis activity">
            <div className="prednisolone-title treatment-section-title"><span>PREDNISOLONE</span></div>
            <div className="prednisolone-cards">
              <article><i>01</i><span><b>ACTIVE</b> · NO ORAL STEROID</span><strong>START 1 MG/KG/DAY</strong></article>
              <article><i>02</i><span><b>ACTIVE</b> · ON ORAL STEROID</span><strong>DOUBLE CURRENT DOSE</strong></article>
              <article><i>03</i><span><b>INACTIVE UVEITIS</b></span><strong>HOLD 1 MONTH · THEN TAPER</strong></article>
            </div>
          </div>
        </section>

        <section id="tapering" className="scene tapering-scene">
          <div className="scene-copy tapering-copy">
            <p className="eyebrow"><span /> 08 — METHODOLOGY / TAPERING &amp; REACTIVATION</p>
            <h2>Taper the steroid.<br /><em>Escalate when needed.</em></h2>
            <p className="lede">Taper after 2–4 weeks of disease control; reactivation resets steroids and advances immunosuppression.</p>
          </div>

          <div className="tapering-control">
            <article className="taper-protocol">
              <header><span>PREDNISONE</span><strong>WEEKLY TAPER</strong></header>
              <div className="taper-trajectory" aria-hidden="true"><i /><i /><i /><i /><i /><b /></div>
              <div className="taper-checkpoints">
                <div><small>01</small><strong>REDUCE WEEKLY</strong><span>Declining decrements</span></div>
                <div><small>02</small><strong>7.5 MG/DAY GOAL</strong><span>Inactive uveitis checkpoint</span></div>
                <div><small>03</small><strong>HOLD</strong><span>2 visits · ≥28 days apart</span></div>
                <div><small>04</small><strong>RESUME TAPER</strong><span>After both visits</span></div>
              </div>
              <p className="reset-guidance"><b>PREDNISONE STEPPED DOWN WEEKLY TOWARD 7.5 MG/DAY.</b></p>
            </article>

            <article className="reactivation-protocol">
              <header><span>REACTIVATION / ESCALATION MATRIX</span><strong>RESET + ADVANCE</strong></header>
              <div className="steroid-reset"><b>≥2×</b><span>PREDNISONE DOSE</span><i>→</i><strong>HOLD 2–4 WEEKS</strong></div>
              <div className="advance-ladder">
                <div><span>ADA ONLY</span><strong className="action-red">ADD CID <small>typically antimetabolite</small></strong></div>
                <div><span>ADA + CID <b>BELOW MAX</b></span><strong>ESCALATE CID TO MAX</strong></div>
                <div><span>1 CID <b>BELOW MAX</b></span><strong>ESCALATE TO MAX</strong></div>
                <div><span>1 CID <b>AT MAX</b></span><strong className="action-red">ADD ALTERNATE CLASS</strong></div>
                <div><span>2 CID <b>AT MAX</b></span><strong className="action-red">BEST MEDICAL JUDGMENT</strong></div>
              </div>
            </article>
          </div>

          <div className="injection-window" aria-label="Permitted timing for regional corticosteroid injections for macular edema">
            <div className="injection-title"><span>REGIONAL CORTICOSTEROID</span><small>MACULAR EDEMA · MAXIMUM 2 INJECTIONS</small></div>
            <div className="injection-timeline">
              <div className="window window-early"><b>01</b><strong>MONTHS 0–2</strong><span>one injection permitted</span></div>
              <p>Restricted windows protected<br />primary and secondary outcome assessment.</p>
              <div className="window window-late"><b>02</b><strong>MONTHS 6–8</strong><span>one injection permitted</span></div>
            </div>
          </div>
        </section>

        <section
          id="tapering-cinematic"
          className={`scene tapering-cinematic-scene tapering-stage-${taperingStage}`}
          onClick={onTaperClick}
          onTouchStart={onTaperTouchStart}
          onTouchEnd={onTaperTouchEnd}
          aria-label="Methodology for corticosteroid tapering and reactivation. Click to advance through the progressive stages."
        >
          {/* Atmospheric background — deliberately restrained */}
          <div className="taperx-atmosphere" aria-hidden="true">
            <i className="taperx-orbit taperx-orbit-a" />
            <i className="taperx-orbit taperx-orbit-b" />
            <i className="taperx-horizon" />
          </div>

          {/* =========================================================
              EDITORIAL COPY
              ========================================================= */}
          <div className="scene-copy tapering-copy">
            <p className="eyebrow">
              <span /> 09 — METHODOLOGY / TAPERING &amp; REACTIVATION
            </p>

            <h2>
              Taper the steroid.<br />
              <em>Escalate when needed.</em>
            </h2>

            <p className="lede">
              Taper after 2–4 weeks of disease control.<br />
              Reactivation resets steroids and advances immunosuppression.
            </p>

            {/* Small narrative marker — visually similar to existing metadata */}
            <div className="taperx-sequence-label" aria-hidden="true">
              <span className={taperingStage <= 1 ? "active" : ""}>01 TAPER</span>
              <i />
              <span
                style={ taperingStage >= 2 && taperingStage <= 7 ? { color: "var(--red)" } : undefined }
                className={
                  taperingStage >= 2 && taperingStage <= 7 ? "active" : ""
                }
              >
                02 ESCALATE
              </span>
              <i />
              <span
                style={ taperingStage === 8 ? { color: "var(--red)" } : undefined }
                className={taperingStage === 8 ? "active" : ""}
              >
                03 RESCUE
              </span>
            </div>

            {/* RESCUE STAGE — MOVED TO COPY AREA */}
            <div className={`taperx-rescue ${taperingStage === 8 ? "active" : ""}`}>
              <header className="tapering-control-header" style={{ marginBottom: "1.5rem" }}>
                <span style={{ display: "block", color: "var(--red)", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.12em", marginBottom: "0.3rem" }}>RESCUE THERAPY</span>
                <strong style={{ display: "block", color: "#eee", fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.01em" }}>REGIONAL CORTICOSTEROID</strong>
              </header>

              <div className="taperx-rescue-indication" style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2.5rem", padding: "1rem 1.2rem", background: "linear-gradient(90deg, rgba(255,45,45,0.1), transparent)", borderLeft: "2px solid var(--red)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.42rem", color: "#ff8c8c", letterSpacing: "0.1em", marginBottom: "0.2rem", fontWeight: 600 }}>INDICATION</div>
                  <div style={{ fontSize: "1.1rem", color: "#fff", fontWeight: 500, letterSpacing: "-0.02em" }}>Macular Edema</div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,45,45,0.5))" }}>
                    <path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>
                  </svg>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,45,45,0.5))" }}>
                    <path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>
                  </svg>
                </div>
                <div style={{ marginLeft: "0.5rem", borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: "1rem" }}>
                  <strong style={{ display: "block", fontSize: "1.3rem", color: "#fff", lineHeight: 1 }}>MAX 2</strong>
                  <span style={{ fontSize: "0.4rem", color: "#999", letterSpacing: "0.08em", marginTop: "0.2rem", display: "block" }}>INJECTIONS</span>
                </div>
              </div>



              <div className="taperx-rescue-rule">
                <span>0</span>
                <i />
                <span>2</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <strong style={{ color: "#97928e", font: "500 .55rem var(--font-geist-mono), monospace", letterSpacing: "0.14em" }}>PROTECTED</strong>
                  <span style={{ color: "#595653", font: ".38rem var(--font-geist-mono), monospace", letterSpacing: "0.07em", marginTop: "0.25rem" }}>OUTCOME-ASSESSMENT WINDOW</span>
                </div>
                <span>6</span>
                <i />
                <span>8 MONTHS</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              VISUAL FIELD
              ========================================================= */}
          <div className="taperx-visual-field">
            {/* SHARED STEROID RESET BANNER */}
            <div 
              style={{
                position: "absolute",
                left: taperingStage >= 2 ? "0" : "5%",
                right: taperingStage >= 2 ? "0" : "5%",
                zIndex: 15,
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: (taperingStage >= 1 && taperingStage <= 8) ? 1 : 0,
                pointerEvents: (taperingStage >= 1 && taperingStage <= 8) ? "auto" : "none",
                top: taperingStage >= 2 ? "0" : "60%",
                transform: taperingStage >= 2 ? "translateY(0)" : "translateY(-50%)",
              }}
            >
              <div className="tapering-control" style={{ width: "100%", maxWidth: taperingStage >= 2 ? "100%" : "800px", margin: "0 auto" }}>
                <article style={{ position: "relative", width: "100%", margin: 0, inset: "auto", height: "auto", padding: taperingStage >= 2 ? "1.5rem" : undefined }}>
                  <header>
                    <span>REACTIVATION</span>
                    <strong>{taperingStage >= 2 ? "PROTOCOL ADVANCEMENT" : "RESET + HOLD"}</strong>
                  </header>
                  <div className="steroid-reset" style={{ marginTop: "1rem" }}>
                    <b>≥2×</b>
                    <span>PREDNISONE DOSE</span>
                    <i>→</i>
                    <strong>HOLD 2–4 WEEKS</strong>
                  </div>
                </article>
              </div>
            </div>

            {/* ---------------------------------------------------------
                STAGE 0 — TAPER
                --------------------------------------------------------- */}
            <div
              className={`taperx-scene taperx-taper ${
                taperingStage === 0 ? "active" : ""
              }`}
            >
              <div className="tapering-control" style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                <article className="taper-protocol" style={{ position: "absolute", inset: 0, width: "100%", margin: 0, display: "flex", flexDirection: "column", padding: "1.5rem" }}>
                  <header><span>PREDNISONE</span><strong>WEEKLY TAPER</strong></header>
                  <div className="taper-trajectory" aria-hidden="true" style={{ flex: 1, height: "auto", margin: "1.5rem .5rem" }}><i /><i /><i /><i /><i /><b /></div>
                  <div className="taper-checkpoints" style={{ marginTop: "auto" }}>
                    <div><small>01</small><strong>REDUCE WEEKLY</strong><span>Declining decrements</span></div>
                    <div><small>02</small><strong>7.5 MG/DAY GOAL</strong><span>Inactive uveitis checkpoint</span></div>
                    <div><small>03</small><strong>HOLD</strong><span>2 visits · ≥28 days apart</span></div>
                    <div><small>04</small><strong>RESUME TAPER</strong><span>After both visits</span></div>
                  </div>
                  <p className="reset-guidance" style={{ marginTop: "1.5rem" }}><b>PREDNISONE STEPPED DOWN WEEKLY TOWARD 7.5 MG/DAY.</b></p>
                </article>
              </div>
            </div>

            {/* ---------------------------------------------------------
                STAGE 1 — REACTIVATION
                --------------------------------------------------------- */}
            <div
              className={`taperx-scene taperx-reactivation ${
                taperingStage === 1 ? "active" : ""
              }`}
            >
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingBottom: "10rem" }}>
                <div style={{ 
                  width: "5rem", 
                  height: "5rem", 
                  borderRadius: "50%", 
                  border: "2px solid #ff2d2d", 
                  color: "#ff2d2d", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  fontSize: "3.5rem", 
                  fontWeight: "bold", 
                  boxShadow: "0 0 35px rgba(255,45,45,0.4), inset 0 0 25px rgba(255,45,45,0.2)",
                  fontFamily: "var(--font-geist-mono)"
                }}>
                  !
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------
                STAGES 2–7 — ESCALATION
                --------------------------------------------------------- */}
            <div
              className={`taperx-scene taperx-escalation ${
                taperingStage >= 2 && taperingStage <= 8 ? "active" : ""
              } ${taperingStage === 8 ? "faded" : ""}`}
            >

              <div className="taperx-escalation-grid">
                <div className="taperx-escalation-axis" aria-hidden="true" />

                <article
                  className={`taperx-esc-step s1 ${
                    taperingStage >= 3 ? "revealed" : ""
                  } ${taperingStage === 3 ? "current" : ""}`}
                >
                  <b className="taperx-esc-number">01</b>
                  <div>
                    <small>ADA ONLY</small>
                    <strong>ADD</strong>
                    <span>CID (ANTIMETABOLITES)</span>
                  </div>
                </article>

                <article
                  className={`taperx-esc-step s2 ${
                    taperingStage >= 4 ? "revealed" : ""
                  } ${taperingStage === 4 ? "current" : ""}`}
                >
                  <b className="taperx-esc-number">02</b>
                  <div>
                    <small>ADA + CID · BELOW MAX</small>
                    <strong>ESCALATE CID</strong>
                    <span>TO MAXIMUM DOSE</span>
                  </div>
                </article>

                <article
                  className={`taperx-esc-step s3 ${
                    taperingStage >= 5 ? "revealed" : ""
                  } ${taperingStage === 5 ? "current" : ""}`}
                >
                  <b className="taperx-esc-number">03</b>
                  <div>
                    <small>1 CID · BELOW MAX</small>
                    <strong>ESCALATE</strong>
                    <span>TO MAXIMUM DOSE</span>
                  </div>
                </article>

                <article
                  className={`taperx-esc-step s4 ${
                    taperingStage >= 6 ? "revealed" : ""
                  } ${taperingStage === 6 ? "current" : ""}`}
                >
                  <b className="taperx-esc-number">04</b>
                  <div>
                    <small>1 CID · AT MAX</small>
                    <strong>ADD</strong>
                    <span>ALTERNATE CLASS</span>
                  </div>
                </article>

                <article
                  className={`taperx-esc-step s5 ${
                    taperingStage >= 7 ? "revealed" : ""
                  } ${taperingStage === 7 ? "current" : ""}`}
                >
                  <b className="taperx-esc-number">05</b>
                  <div>
                    <small>2 CID · AT MAX</small>
                    <strong>BEST MEDICAL</strong>
                    <span>JUDGMENT</span>
                  </div>
                </article>
              </div>

              <div className="taperx-escalation-caption">
                <span>LESS INTENSIVE</span>
                <i />
                <span>GREATER TREATMENT INTENSITY</span>
              </div>
            </div>
          </div>

        </section>

        <section id="followup" className="scene followup-scene">
          <div className="scene-copy followup-copy">
            <p className="eyebrow"><span /> 10 — METHODOLOGY / FOLLOW-UP</p>
            <h2>A year in focus.<br /><em>Every visit counts.</em></h2>
            <p className="lede">Monthly through month 6, then every 2 months to the 1-year close-out.</p>
          </div>

          <div className="followup-timeline" aria-label="Follow-up visits over 12 months">
            <div className="followup-bands"><span>12-MONTH FOLLOW-UP SCHEDULE</span><span>ANNIVERSARY CLOSE-OUT</span></div>
            <div className="visit-rail">
              <i className="visit-signal" aria-hidden="true" />
              {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12].map((month) => (
                <div className={`visit-node ${[0, 3, 6, 12].includes(month) ? "milestone" : ""}`} key={month}>
                  <b>M{month}</b>
                  {month === 6 && <span>SHIFT TO BI-MONTHLY</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="followup-grid">
            <article className="followup-panel visit-suite">
              <header><span>EVERY VISIT PROTOCOL</span></header>
              <div><b>CLINICAL HISTORY</b><span>Medical, ophthalmic, and treatment history.</span></div>
              <div><b>OPHTHALMIC EXAM</b><span>Complete eye exam and BCVA using logarithmic charts.</span></div>
              <div><b>VITALS &amp; PHLEBOTOMY</b><span>Weight, blood pressure, CBC, and CMP.</span></div>
            </article>

            <article className="followup-panel milestone-suite">
              <header><span>MILESTONE EVALUATIONS</span></header>
              <p className="milestone-dates">BASELINE · M3 · M6 · M12</p>
              <div className="milestone-test"><b>OPTICAL COHERENCE TOMOGRAPHY (OCT)</b><span>Retinal thickness evaluation</span></div>
              <div className="milestone-test"><b>QUALITY OF LIFE (QOL) ×3</b><span><i>EuroQol</i><i>SF-36</i><i>NEI-VFQ-25</i></span></div>
            </article>

            <article className="followup-panel diagnosis-suite">
              <header><span>DIAGNOSIS-SPECIFIC TARGETING</span></header>
              <p className="diagnosis-note">ASSESSED AT EVERY VISIT · BASED ON DIAGNOSIS</p>
              <div><span>Birdshot chorioretinitis</span><b>VISUAL FIELDS</b></div>
              <div><span>Multifocal · PIC · serpiginous · placoid · secondary/undifferentiated choroiditis</span><b>FAF</b></div>
              <div><span>Early-stage VKH · exudative retinal detachment</span><b>OCT</b></div>
              <div><span>Secondary/undifferentiated retinal vasculitis or panuveitis</span><b>FFA</b></div>
            </article>
          </div>
        </section>

        <section
          id="outcomes"
          className={`scene outcomes-scene outcomes-story-${outcomesStoryStage}`}
          onClick={advanceOutcomesStory}
          aria-label="Outcomes overview. Click to reveal the primary outcome, secondary outcomes, then the definition of inactive uveitis."
        >
          <div className="scene-copy outcomes-copy">
            <p className="eyebrow"><span /> 11 — METHODOLOGY / OUTCOMES</p>
            <h2>Define success.<br /><em>Then measure it.</em></h2>
          </div>

          <section className="endpoint-stage" aria-label="Primary outcome by 6 months">
            <div className="endpoint-time" aria-hidden="true"><strong>6</strong><span>MONTHS</span><i /></div>
            <div className="endpoint-message">
              <div className="endpoint-label"><span>PRIMARY OUTCOME</span></div>
              <h3>Successful corticosteroid sparing</h3>
              <p>Assessed at 6 months. All three required for success.</p>
              <div className="endpoint-equation">
                <div><b>01</b><span>INACTIVE<br />UVEITIS</span></div><i>+</i>
                <div><b>02</b><span>PREDNISONE<br /><strong>≤7.5 MG/DAY</strong></span></div><i>+</i>
                <div><b>03</b><span>2 CONSECUTIVE VISITS<br /><strong>≥28 DAYS APART</strong></span></div>
              </div>
            </div>
          </section>

          <section className="secondary-outcomes-band outcomes-secondary-band" aria-label="Secondary outcomes">
            <header>SECONDARY OUTCOMES</header>
            <div>
              <article><i className="secondary-icon-ring" /><strong>STEROID SPARING</strong><span>By 1 year of follow-up</span></article>
              <article><i className="secondary-icon-slash" /><strong>CORTICOSTEROID<br />DISCONTINUATION</strong><span>Inactive after prednisone discontinuation<br />2 visits ≥28 days apart</span></article>
              <article><svg className="secondary-icon-svg secondary-icon-va" viewBox="0 0 76 104" aria-hidden="true"><rect x="3" y="3" width="70" height="98" rx="3" /><text x="38" y="30">E</text><text x="38" y="52">F P</text><text x="38" y="70">T O Z</text><text x="38" y="86">L P E D</text></svg><strong>BCVA</strong><span>Best-corrected visual acuity</span></article>
              <article><i className="secondary-icon-signal" /><strong>INFECTIONS</strong><span>Incidence</span></article>
              <article><svg className="secondary-icon-svg secondary-icon-eye-baseline" viewBox="0 0 64 64" aria-hidden="true"><path d="M4 32C15 14 49 14 60 32 49 50 15 50 4 32Z" /><circle cx="32" cy="32" r="10" /><circle cx="32" cy="32" r="3" /></svg><strong>ADVERSE EVENTS</strong><span>Including serious adverse events</span></article>
              <article><svg className="secondary-icon-svg secondary-icon-people-baseline" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="14" r="8" /><path d="M18 54v-13c0-9 6-15 14-15s14 6 14 15v13M24 54V41m16 13V41" /></svg><strong>QUALITY OF LIFE</strong><span>Patient-reported</span></article>
            </div>
          </section>

          <section className="inactive-uveitis-definition outcomes-inactive-popup" aria-label="Definition of inactive uveitis">
            <header><span>INACTIVE UVEITIS</span><p>Clinical quiescence + applicable disease-specific imaging criteria</p></header>
            <div className="inactive-definition-groups">
              <section className="inactive-clinical">
                <h3>CLINICAL QUIESCENCE</h3>
                <article><i className="inactive-icon-cells" /><div><span>AC CELLS</span><strong>GRADE 0</strong><small>Anterior / intermediate / panuveitis</small></div></article>
                <article><i className="inactive-icon-haze" /><div><span>VITREOUS HAZE</span><strong>GRADE 0</strong><small>Intermediate / posterior / panuveitis</small></div></article>
              </section>
              <section className="inactive-imaging">
                <h3>DISEASE-SPECIFIC IMAGING CRITERIA</h3>
                <div>
                  <article><i className="imaging-icon-field" /><span>BIRDSHOT CHORIORETINITIS</span><strong>VISUAL FIELDS</strong><small>Stable or improved in reliable visual fields</small></article>
                  <article><i className="imaging-icon-faf" /><span>CHORIORETINITIS</span><strong>FAF</strong><small>No uveitis lesion-related hyperautofluorescence</small></article>
                  <article><i className="imaging-icon-oct" /><span>EARLY-STAGE VKH</span><strong>OCT</strong><small>No subretinal fluid</small></article>
                  <article><i className="imaging-icon-ffa" /><span>RETINAL VASCULITIS</span><strong>FFA</strong><small>No increase in retinal nonperfusion, leakage, or vessel staining</small></article>
                </div>
              </section>
            </div>
          </section>
        </section>

        <section id="secondary-outcomes-redesign" className="scene secondary-outcomes-redesign-scene" aria-label="Definition of inactive uveitis">
          <div className="scene-copy primary-outcome-redesign-copy secondary-outcomes-redesign-copy">
            <p className="eyebrow"><span /> 12 — METHODOLOGY / OUTCOME DEFINITIONS</p>
            <h2>Activity was measured precisely.</h2>
          </div>

          <section className="inactive-uveitis-definition" aria-label="Definition of inactive uveitis">
            <header><span>INACTIVE UVEITIS</span><p>Clinical quiescence + applicable disease-specific imaging criteria</p></header>
            <div className="inactive-definition-groups">
              <section className="inactive-clinical">
                <h3>CLINICAL QUIESCENCE</h3>
                <article><i className="inactive-icon-cells" /><div><span>AC CELLS</span><strong>GRADE 0</strong><small>Anterior / intermediate / panuveitis</small></div></article>
                <article><i className="inactive-icon-haze" /><div><span>VITREOUS HAZE</span><strong>GRADE 0</strong><small>Intermediate / posterior / panuveitis</small></div></article>
              </section>

              <section className="inactive-imaging">
                <h3>DISEASE-SPECIFIC IMAGING CRITERIA</h3>
                <div>
                  <article><i className="imaging-icon-field" /><span>BIRDSHOT CHORIORETINITIS</span><strong>VISUAL FIELDS</strong><small>Stable or improved in reliable visual fields</small></article>
                  <article><i className="imaging-icon-faf" /><span>CHORIORETINITIS</span><strong>FAF</strong><small>No uveitis lesion-related hyperautofluorescence</small></article>
                  <article><i className="imaging-icon-oct" /><span>EARLY-STAGE VKH</span><strong>OCT</strong><small>No subretinal fluid</small></article>
                  <article><i className="imaging-icon-ffa" /><span>RETINAL VASCULITIS</span><strong>FFA</strong><small>No increase in retinal nonperfusion, leakage, or vessel staining</small></article>
                </div>
              </section>
            </div>
          </section>
        </section>

        <section id="statistics-sample-only" className="scene statistics-scene statistics-sample-only-scene">
          <div className="scene-copy statistics-copy">
            <p className="eyebrow"><span /> 13 — METHODOLOGY / STATISTICS</p>
            <h2>Power the comparison.<br /><em>Model the journey.</em></h2>
          </div>

          <section className="sample-size-story" aria-label="Sample size calculation">
            <header>
              <span>SAMPLE SIZE</span><small>PRIMARY OUTCOME · 6-MONTH CORTICOSTEROID SPARING</small>
              <button onClick={() => setCalcCycle((cycle) => cycle + 1)} aria-label="Replay sample-size calculation">↻</button>
            </header>
            <div key={`sample-only-${calcCycle}`} className="sample-calculation">
              <div className="calc-parameter calc-alpha"><strong>α 0.0492</strong><span>TWO-SIDED</span></div>
              <div className="calc-parameter calc-power"><strong>90%</strong><span>POWER</span></div>
              <div className="calc-parameter calc-loss"><strong>10%</strong><span>LOSS ALLOWANCE</span></div>

              <div className="calc-input calc-ada"><span>ADA EXPECTED</span><strong>75%</strong></div>
              <div className="calc-track calc-track-left"><b>75%</b></div>
              <div className="calc-effect-size">24 PERCENTAGE-POINT DIFFERENCE</div>
              <div className="calc-core"><strong>222</strong><span>PARTICIPANTS</span></div>
              <div className="calc-track calc-track-right"><b>51%</b></div>
              <div className="calc-input calc-cid"><span>CID EXPECTED</span><strong>51%</strong></div>

              <div className="calc-note calc-interim"><strong>40%</strong><span>INTERIM INFORMATION · STOPPING α 0.008</span></div>
              <div className="calc-split"><b>111 <i>ADA</i></b><b>111 <i>CID</i></b></div>
              <div className="calc-note calc-secondary"><strong>80%</strong><span>POWER FOR DISCONTINUATION · 1 Y</span></div>
            </div>
          </section>
        </section>

        <section
          id="statistics-redesign"
          className={`scene statistics-framework-scene statistics-framework-stage-${statisticsFrameworkStage}`}
          onClick={() => setStatisticsFrameworkStage((stage) => (stage >= 3 ? -1 : stage + 1))}
          aria-label="Statistical analysis framework. Click to focus each analysis family."
        >
          <div className="scene-copy statistics-framework-copy">
            <p className="eyebrow"><span /> 14 — METHODOLOGY / STATISTICAL ANALYSIS</p>
            <h2>Different questions.<br /><em>Different models.</em></h2>
          </div>

          <section className="analysis-framework" aria-label="Four statistical analysis families">
            <article className="analysis-framework-column">
              <header><b>01</b><span>PRIMARY OUTCOME</span></header>
              <section><small>QUESTION</small><h3>Did assigned treatment achieve successful corticosteroid sparing more often?</h3></section>
              <div className="analysis-visual analysis-visual-binary" aria-label="Schematic repeated binary participant-state motif"><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <section><small>MODEL</small><h4>GEE LOGISTIC<br />REGRESSION</h4></section>
              <ul><li>Repeated measurements; unstructured covariance</li><li>Treatment + strata + visits 8/10/12; treatment × visit</li></ul>
            </article>

            <article className="analysis-framework-column">
              <header><b>02</b><span>CONTINUOUS OUTCOMES</span></header>
              <section><small>QUESTION</small><h3>Did visual acuity, quality of life, or retinal thickness change differently over time?</h3></section>
              <svg className="analysis-visual analysis-visual-lines" viewBox="0 0 240 90" aria-label="Schematic longitudinal trajectories"><path d="M8 72 43 48 76 57 112 34 148 42 189 19 232 27" /><path d="M8 76 43 62 76 69 112 54 148 59 189 45 232 47" /><g><circle cx="43" cy="48" r="3" /><circle cx="112" cy="34" r="3" /><circle cx="189" cy="19" r="3" /><circle cx="43" cy="62" r="3" /><circle cx="112" cy="54" r="3" /><circle cx="189" cy="45" r="3" /></g></svg>
              <section><small>MODEL</small><h4>MIXED-EFFECTS<br />MODEL</h4></section>
              <ul><li>Linear: visual acuity / quality of life; log: retinal thickness</li><li>Unstructured correlation; person-level random intercept for eye outcomes</li></ul>
            </article>

            <article className="analysis-framework-column">
              <header><b>03</b><span>TIME-TO-EVENT OUTCOMES</span></header>
              <section><small>QUESTION</small><h3>Which assigned strategy reached corticosteroid outcomes or adverse events sooner?</h3></section>
              <svg className="analysis-visual analysis-visual-km" viewBox="0 0 240 90" aria-label="Schematic Kaplan-Meier-style step curves"><path d="M8 12h24v10h27v11h29v14h33v11h38v10h68" /><path d="M8 12h22v17h25v14h28v18h31v12h39v7h79" /></svg>
              <section><small>MODEL</small><h4>KAPLAN-MEIER + COX<br />PROPORTIONAL HAZARDS</h4></section>
              <ul><li>Corticosteroid events (secondary analysis); adverse events (primary analysis)</li><li>Stratification interaction tests; frailty model for ocular adverse events</li></ul>
            </article>

            <article className="analysis-framework-column">
              <header><b>04</b><span>CUMULATIVE / RECURRENT OUTCOMES</span></header>
              <section><small>QUESTION</small><h3>How did accumulated prednisone exposure and recurrent systemic events differ?</h3></section>
              <svg className="analysis-visual analysis-visual-accumulation" viewBox="0 0 240 90" aria-label="Schematic accumulated exposure trajectories"><path d="M8 80 43 72 78 60 113 47 148 36 190 20 232 9V80Z" /><path d="M8 80 43 77 78 70 113 61 148 52 190 43 232 33V80Z" /></svg>
              <section><small>MODEL</small><h4>NEGATIVE BINOMIAL<br />REGRESSION</h4></section>
              <ul><li>Cumulative prednisone exposure</li><li>Recurrent systemic events, including hospitalizations</li></ul>
            </article>
          </section>

          <footer className="analysis-framework-footer"><span>AS RANDOMIZED</span><span>Stratification variables: initial prednisone dosage + baseline immunosuppression use</span><span>Sensitivity analyses assessed missingness</span><span>Secondary-outcome P values nominal</span></footer>
        </section>

        <section id="quality-assurance" className="scene qa-scene">
          <div className="scene-copy qa-copy">
            <p className="eyebrow"><span /> 15 — METHODOLOGY / QUALITY ASSURANCE</p>
            <h2>One protocol.<br /><em>Consistent judgment.</em></h2>
            <p className="lede">Independent oversight aligned disease-activity assessment, treatment decisions, and retinal-image interpretation across every clinical center.</p>
            <div className="qa-experts"><strong>3</strong><span>independent uveitis experts<br />not managing trial participants</span></div>
          </div>

          <section className="qa-network" aria-label="Medical Therapy Quality Assurance monitoring workflow">
            <div className="qa-flow-line" aria-hidden="true"><i /></div>
            <button className={qaFocus === 0 ? "qa-node active" : "qa-node"} onClick={() => setQaFocus(0)}>
              <span>01 / CLINICAL CENTERS</span><strong>First 2 participants</strong><small>Activity assessment + medication management at every center</small>
            </button>
            <button className={qaFocus === 1 ? "qa-node active" : "qa-node"} onClick={() => setQaFocus(1)}>
              <span>02 / COORDINATING CENTER</span><strong>Protocol signal</strong><small>Flag any assessment or management decision that appears discrepant</small>
            </button>
            <button className={qaFocus === 2 ? "qa-node active" : "qa-node"} onClick={() => setQaFocus(2)}>
              <span>03 / READING CENTER</span><strong>Retinal images</strong><small>Central interpretation compared with the clinical center</small>
            </button>

            <div className="qa-core" aria-live="polite">
              <i /><i /><i />
              <span>MTQAC REVIEW</span>
              <strong>{["Activity + treatment", "Protocol discrepancy", "Image discrepancy"][qaFocus]}</strong>
              <small>{[
                "Checks early center-level consistency.",
                "Independent experts adjudicate the flagged decision.",
                "Center and reading-center interpretations are reconciled.",
              ][qaFocus]}</small>
            </div>

            <div className="qa-feedback">
              <span>CORRECTIVE FEEDBACK · AS NEEDED</span>
              <div><strong>SPECIFIC CLINICAL CENTER</strong><i>or</i><strong>ENTIRE RESEARCH GROUP</strong></div>
            </div>
          </section>
        </section>

        <section id="participant-flow" className="scene participant-flow-scene">
          {chapters[active]?.id === "participant-flow" && (
            <div key={cohortCycle} className="flow-intro" aria-hidden="true">
              <div className="flow-intro-title flow-assessed-title"><span>ASSESSED FOR ELIGIBILITY</span><strong>338</strong></div>
              <div className="flow-intro-title flow-excluded-title"><span>EXCLUDED</span><strong>111</strong></div>
              <div className="flow-intro-title flow-randomized-title"><span>RANDOMIZED</span><strong>227</strong></div>
              <div className="flow-intro-title flow-assignment-title"><span>ARM ASSIGNMENT</span><strong><i>ADA</i> : <b>CID</b></strong></div>
              <div className="flow-intro-particles">
                {Array.from({ length: 108 }, (_, index) => {
                  const startAngle = index * 137.5 * Math.PI / 180;
                  const startRadius = 28 + (index * 37) % 152;
                  const endAngle = index * 151 * Math.PI / 180;
                  const endRadius = 8 + (index * 19) % 55;
                  const excluded = index % 3 === 0;
                  const ada = index % 2 === 0;
                  const splitAngle = index * 163 * Math.PI / 180;
                  const splitRadius = 7 + (index * 13) % 32;
                  return <i key={index} className={excluded ? "particle-excluded" : `particle-randomized ${ada ? "particle-ada" : "particle-cid"}`} style={{
                    "--start-x": `${Math.cos(startAngle) * startRadius}px`,
                    "--start-y": `${Math.sin(startAngle) * startRadius * .58}px`,
                    "--end-x": `${(excluded ? 220 : 0) + Math.cos(endAngle) * endRadius}px`,
                    "--end-y": `${(excluded ? 28 : 0) + Math.sin(endAngle) * endRadius * .6}px`,
                    "--split-x": `${(ada ? -125 : 125) + Math.cos(splitAngle) * splitRadius}px`,
                    "--split-y": `${38 + Math.sin(splitAngle) * splitRadius}px`,
                    "--delay": `${(index % 12) * .014}s`,
                  } as React.CSSProperties} />;
                })}
              </div>
              <div className="flow-exclusion-caption"><span>111 excluded from the cohort</span><small>Medication · medical condition · preference · inactive uveitis · other</small></div>
              <div className="flow-arm-labels"><strong>114 <i>ADA</i></strong><strong>113 <i>CID</i></strong></div>
            </div>
          )}
          <div className="scene-copy flow-copy">
            <p className="eyebrow"><span /> 16 — RESULTS / PARTICIPANT FLOW</p>
            <h2>338 screened.<br /><em>227 randomized.</em></h2>
            <p className="lede">From eligibility assessment to the 12-month close-out, every participant is accounted for.</p>
            <div className="flow-duration"><span>STUDY ENROLLMENT</span><strong>SEPTEMBER 2019</strong><i /><strong>SEPTEMBER 2023</strong></div>
            <section className="flow-strata-summary" aria-label="Four randomization strata with treatment allocation">
              <header><span>STRATA AT RANDOMIZATION</span><small>1 : 1 WITHIN EACH STRATUM</small></header>
              <div className="flow-strata-columns">
                <div className="flow-strata-arm ada-arm"><strong>ADA</strong><div className="flow-strata-stack" aria-label="ADA strata allocation"><i className="s-0l" style={{ height: "15.8%" }}><b>18</b></i><i className="s-0h" style={{ height: "63.2%" }}><b>72</b></i><i className="s-1l" style={{ height: "9.6%" }}><b>11</b></i><i className="s-1h" style={{ height: "11.4%" }}><b>13</b></i></div></div>
                <div className="flow-strata-arm cid-arm"><strong>CID</strong><div className="flow-strata-stack" aria-label="CID strata allocation"><i className="s-0l" style={{ height: "15%" }}><b>17</b></i><i className="s-0h" style={{ height: "62.8%" }}><b>71</b></i><i className="s-1l" style={{ height: "9.7%" }}><b>11</b></i><i className="s-1h" style={{ height: "12.5%" }}><b>14</b></i></div></div>
                <div className="flow-strata-categories"><span><b>0L</b> No IMT · &lt;30 <em>35 total</em></span><span><b>0H</b> No IMT · ≥30 <em>143 total</em></span><span><b>1L</b> 1 IMT · &lt;30 <em>22 total</em></span><span><b>1H</b> 1 IMT · ≥30 <em>27 total</em></span></div>
              </div>
              <footer><span>0 / 1 = immunosuppressive drugs</span><span>L / H = prednisone &lt;30 / ≥30 mg/day</span></footer>
            </section>
          </div>

          <section className="consort-flow" aria-label="Participant screening, allocation, and follow-up flow diagram">
            <button className="flow-replay" onClick={() => setCohortCycle((cycle) => cycle + 1)} aria-label="Replay eligibility and randomization animation">↻</button>
            <div className="consort-screening">
              <article className="consort-node assessed-node">
                <strong>Assessed for Eligibility</strong><span>N = 338</span>
              </article>
              <div className="consort-route route-to-randomized" aria-hidden="true" />
              <article className="consort-node excluded-node">
                <header><strong>Excluded: N = 111</strong></header>
                <dl>
                  <div><dt>Medication issues:</dt><dd>N = 32 (29%)</dd></div>
                  <div><dt>Medical condition:</dt><dd>N = 25 (23%)</dd></div>
                  <div><dt>Patient preference:</dt><dd>N = 22 (20%)</dd></div>
                  <div><dt>Inactive uveitis:</dt><dd>N = 8 (7%)</dd></div>
                  <div><dt>Other:</dt><dd>N = 24 (22%)</dd></div>
                </dl>
              </article>
            </div>

            <div className="consort-randomized">
              <strong>Randomized</strong><span>N = 227</span><i aria-hidden="true" />
            </div>

            <div className="allocation-branch" aria-hidden="true" />

            <div className="consort-arms">
              <article className="consort-arm ada-flow-arm">
                <section className="assignment-box">
                  <strong><b>Assigned ADA:</b> N = 114</strong><span>Baseline</span>
                </section>
                <section className="outcome-box">
                  <div className="visit-label"><strong>Primary Outcome:</strong><span>6 Months</span></div>
                  <dl><div><dt>Completed:</dt><dd>N = 107</dd></div><div><dt>Missed visit:</dt><dd>N = 5</dd></div><div><dt>Lost to FU:</dt><dd>N = 2*</dd></div></dl>
                </section>
                <section className="last-visit-box">
                  <div className="visit-label"><strong>Last Visit:</strong><span>12 Months</span></div>
                  <dl><div><dt>Completed:</dt><dd>N = 109</dd></div><div><dt>Lost to FU:</dt><dd>N = 5*</dd></div></dl>
                </section>
              </article>

              <article className="consort-arm cid-flow-arm">
                <section className="assignment-box">
                  <strong><b>Assigned CID:</b> N = 113</strong><span>Baseline</span>
                </section>
                <section className="outcome-box">
                  <div className="visit-label"><strong>Primary Outcome:</strong><span>6 Months</span></div>
                  <dl><div><dt>Completed:</dt><dd>N = 100</dd></div><div><dt>Missed visit:</dt><dd>N = 5</dd></div><div><dt>Lost to FU:</dt><dd>N = 8†</dd></div></dl>
                </section>
                <section className="last-visit-box">
                  <div className="visit-label"><strong>Last Visit:</strong><span>12 Months</span></div>
                  <dl><div><dt>Completed:</dt><dd>N = 98</dd></div><div><dt>Lost to FU:</dt><dd>N = 15†</dd></div></dl>
                </section>
              </article>
            </div>

            <footer className="consort-notes"><span>* 1 ADA participant was lost after baseline.</span><span>† 3 CID participants were lost after baseline.</span></footer>
          </section>
        </section>

        <section id="baseline-portrait" className="scene baseline-portrait-scene">
          <div className="scene-copy baseline-portrait-copy">
            <p className="eyebrow"><span /> 17 — RESULTS / BASELINE COHORT</p>
            <h2>A cohort in view.<br /><em>Balanced—with a few contrasts.</em></h2>
            <p className="lede">Participant and eye-level characteristics were broadly similar between groups. The clearest numerical imbalances are shown separately.</p>
          </div>

          <section className="cohort-portrait" aria-label="Visual summary of baseline participant and ocular characteristics">
            <article className="cohort-core" aria-label="227 participants, 434 eyes, 189 participants with bilateral active uveitis">
              <header>TRIAL COHORT</header>
              <div className="cohort-icon-counts">
                <section className="people-count">
                  <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="14" r="8" /><path d="M18 54v-13c0-9 6-15 14-15s14 6 14 15v13M24 54V41m16 13V41" /></svg>
                  <div><strong>227</strong><span>PARTICIPANTS</span></div>
                </section>
                <section className="eyes-count">
                  <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 32C15 14 49 14 60 32 49 50 15 50 4 32Z" /><circle cx="32" cy="32" r="10" /><circle cx="32" cy="32" r="3" /></svg>
                  <div><strong>434</strong><span>EYES INCLUDED</span></div>
                </section>
                <section className="bilateral-count">
                  <div className="paired-eyes" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M3 32C10 20 26 20 33 32 26 44 10 44 3 32Z" /><circle cx="18" cy="32" r="5" /><path d="M31 32C38 20 54 20 61 32 54 44 38 44 31 32Z" /><circle cx="46" cy="32" r="5" /></svg></div>
                  <div><strong>189</strong><span>BILATERAL ACTIVE</span><small>83% of participants</small></div>
                </section>
              </div>
            </article>

            <article className="demographic-signals">
              <header>WHO THEY WERE</header>
              <div className="demographic-topline">
                <div className="age-signal"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="10" width="34" height="30" rx="3" /><path d="M7 18h34M15 6v8m18-8v8" /></svg><strong>44</strong><span>YEARS</span><small>median age</small></div>
                <div className="women-signal" style={{ "--ring-value": "67%" } as React.CSSProperties}><span className="sex-icon" aria-hidden="true">♀</span><strong>67%</strong><span>WOMEN</span></div>
              </div>
              <div className="race-visual">
                <div className="race-donut" role="img" aria-label="Race: 72 percent White, 18 percent Black, 5 percent Asian, and 5 percent other"><span><strong>72%</strong>WHITE</span></div>
                <ul><li><i />WHITE <b>72%</b></li><li><i />BLACK <b>18%</b></li><li><i />ASIAN <b>5%</b></li><li><i />OTHER <b>5%</b></li></ul>
              </div>
              <div className="ethnicity-signal"><strong>15%</strong><span>HISPANIC ETHNICITY</span></div>
            </article>

            <article className="cohort-composition">
              <header>UVEITIS LOCATION</header>
              <div className="anatomical-eye" aria-hidden="true">
                <svg viewBox="0 0 180 104"><path className="eye-shell" d="M8 52C38 10 139 10 172 52 139 94 38 94 8 52Z" /><path className="posterior-zone" d="M95 19C133 20 157 35 172 52 157 70 133 84 95 85 116 68 116 36 95 19Z" /><path className="anterior-zone" d="M8 52C21 34 35 25 52 21 39 39 39 65 52 83 34 78 20 69 8 52Z" /><ellipse className="eye-lens" cx="62" cy="52" rx="12" ry="23" /><circle className="eye-core" cx="76" cy="52" r="18" /><path className="retina-line" d="M105 26c29 8 44 23 52 26-8 4-23 19-52 26" /></svg>
                <span><i />ANTERIOR / INTERMEDIATE</span><span><i />POSTERIOR / PANUVEITIS</span>
              </div>
              <div className="uveitis-spectrum">
                <div><i style={{ width: "22%" }}><b>22%</b></i><i style={{ width: "78%" }}><b>78%</b></i></div>
                <footer><span>INTERMEDIATE · ANTERIOR + INTERMEDIATE</span><span>BIRDSHOT · CHOROIDITIS · VKH · RETINAL VASCULITIS</span></footer>
              </div>
              <div className="uveitis-duration-signal"><span>DURATION OF UVEITIS (YRS)*</span><strong>0.9 <small>(0.3—3.9)</small></strong></div>
            </article>

            <article className="ocular-signal">
              <header>VISION AT BASELINE</header>
              <div className="snellen-bcva">
                <svg viewBox="0 0 76 104" aria-hidden="true"><rect x="3" y="3" width="70" height="98" rx="3" /><text x="38" y="30">E</text><text x="38" y="52">F P</text><text x="38" y="70">T O Z</text><text x="38" y="86">L P E D</text></svg>
                <div><strong>81</strong><span>BCVA LETTERS</span><small>median · Snellen 20/24</small></div>
              </div>
              <div className="vision-threshold"><strong>79%</strong><span>OF EYES</span><small>20/40 or better</small></div>
            </article>

            <article className="baseline-contrasts">
              <header><span>NOTABLE NUMERICAL IMBALANCES</span><small>ADA <i /> CID</small></header>
              <div className="contrast-row"><span>BILATERAL ACTIVE UVEITIS</span><div><i style={{ width: "76%" }} /><b style={{ width: "90%" }} /><em style={{ left: "76%" }}>76%</em><strong style={{ left: "90%" }}>90%</strong></div></div>
              <div className="contrast-row lens-contrast"><span>LENS OPACITY / CATARACT<small>OVERALL · 82% PHAKIC · 44% CLEAR LENS · 38% OPACITY/CATARACT</small></span><div><i style={{ width: "36%" }} /><b style={{ width: "40%" }} /><em style={{ left: "36%" }}>36%</em><strong style={{ left: "40%" }}>40%</strong></div></div>
              <div className="contrast-row"><span>MACULAR EDEMA</span><div><i style={{ width: "29%" }} /><b style={{ width: "20%" }} /><em style={{ left: "29%" }}>29%</em><strong style={{ left: "20%" }}>20%</strong></div></div>
              <footer>Numerical differences only; the groups remained reasonably well balanced overall.</footer>
            </article>
          </section>
        </section>

        {false && <section id="treatment-results" className="scene treatment-results-scene">
          <div className="scene-header-row">
            <div className="scene-copy treatment-results-copy">
              <p className="eyebrow"><span /> 16 — RESULTS / TREATMENTS</p>
              <h2>Therapy assigned. <em>Treatment evolved.</em></h2>
            </div>
            
            <div className="surge-controller-header">
              <span className="surge-stage-tag">
                {treatmentPhase === 0 ? "STAGE 1 : BASELINE ENROLLMENT STATUS" : "STAGE 2 : RANDOMIZATION INITIATION SURGE"}
              </span>
              <button
                className={`surge-trigger-btn ${treatmentPhase === 1 ? "active" : ""}`}
                onClick={() => setTreatmentPhase(treatmentPhase === 0 ? 1 : 0)}
              >
                {treatmentPhase === 0 ? "TRIGGER TREATMENT SURGE ➔" : "↺ RESET TO BASELINE"}
                <i className="surge-btn-glow" />
              </button>
            </div>
          </div>

          <section className="treatment-results-stage steroid-surge-stage all-in-one-surge" aria-label="Treatment evolution matrix from baseline to randomization initiation">
            
            {/* 3 Full-Width Matrix Cards */}
            <div className="surge-matrix-grid">
              
              {/* Card 1: ALL CORTICOSTEROIDS */}
              <div className="surge-matrix-card oral-steroid-card">
                <header className="matrix-card-header">
                  <span className="card-lbl">01 · ON ORAL STEROIDS</span>
                  <div className="card-total-badge">
                    <strong>{treatmentPhase === 0 ? "82%" : <>99% <i className="trend-up-inline">▲</i></>}</strong>
                    <small>{treatmentPhase === 0 ? "186 / 226" : "221 / 223"}</small>
                  </div>
                </header>

                <div className="matrix-card-tracks">
                  {/* ADA */}
                  <div className="matrix-arm-row">
                    <div className="arm-row-meta">
                      <span className="arm-tag ada">ADA ARM</span>
                      <span className="arm-nums">
                        {treatmentPhase === 0 ? <b>81%</b> : <><b>81%</b><i>→</i><strong>100%</strong></>}
                      </span>
                    </div>
                    <div className={`surge-pill-container mini surge-phase-${treatmentPhase}`}>
                      <span className="surge-bar-count surge-total-count">{treatmentPhase === 0 ? "92/114" : "113/113"}</span>
                      <div className="surge-pill-base ada-base" style={{ width: "81%" } as React.CSSProperties}>
                      </div>
                      <div className="surge-pill-add ada-add" style={{ left: "81%", width: treatmentPhase === 1 ? "19%" : "0%" } as React.CSSProperties}>
                        {treatmentPhase === 1 && <span className="surge-add-label">+21</span>}
                      </div>
                    </div>
                  </div>

                  {/* CID */}
                  <div className="matrix-arm-row">
                    <div className="arm-row-meta">
                      <span className="arm-tag cid">CID ARM</span>
                      <span className="arm-nums">
                        {treatmentPhase === 0 ? <b>84%</b> : <><b>84%</b><i>→</i><strong>98%</strong></>}
                      </span>
                    </div>
                    <div className={`surge-pill-container mini surge-phase-${treatmentPhase}`}>
                      <span className="surge-bar-count surge-total-count">{treatmentPhase === 0 ? "94/112" : "108/110"}</span>
                      <div className="surge-pill-base cid-base" style={{ width: "84%" } as React.CSSProperties} />
                      <div className="surge-pill-add cid-add" style={{ left: "84%", width: treatmentPhase === 1 ? "14%" : "0%" } as React.CSSProperties}>
                        {treatmentPhase === 1 && <span className="surge-add-label">+14</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="nested-treatment-panel">
                  <header className="nested-panel-header">
                    <span>HIGH-DOSE SUBGROUP (prednisone ≥30 mg/day)</span>
                    <strong>{treatmentPhase === 0 ? "38%" : <>74% <i className="trend-up-inline">▲</i></>}</strong>
                    <small>{treatmentPhase === 0 ? "86 / 226" : "164 / 223"}</small>
                  </header>
                  <div className="matrix-card-tracks nested-tracks">
                    <div className="matrix-arm-row">
                      <div className="arm-row-meta">
                        <span className="arm-tag ada">ADA ARM</span>
                        <span className="arm-nums">{treatmentPhase === 0 ? <b>40%</b> : <><b>40%</b><i>→</i><strong>73%</strong></>}</span>
                      </div>
                      <div className={`surge-pill-container mini surge-phase-${treatmentPhase}`}>
                        <span className="surge-bar-count surge-total-count">{treatmentPhase === 0 ? "46/114" : "83/113"}</span>
                        <div className="surge-pill-base ada-base" style={{ width: "40%" }} />
                        <div className="surge-pill-add ada-add" style={{ left: "40%", width: treatmentPhase === 1 ? "33%" : "0%" }}>{treatmentPhase === 1 && <span className="surge-add-label">+37</span>}</div>
                      </div>
                    </div>
                    <div className="matrix-arm-row">
                      <div className="arm-row-meta">
                        <span className="arm-tag cid">CID ARM</span>
                        <span className="arm-nums">{treatmentPhase === 0 ? <b>36%</b> : <><b>36%</b><i>→</i><strong>74%</strong></>}</span>
                      </div>
                      <div className={`surge-pill-container mini surge-phase-${treatmentPhase}`}>
                        <span className="surge-bar-count surge-total-count">{treatmentPhase === 0 ? "40/112" : "81/110"}</span>
                        <div className="surge-pill-base cid-base" style={{ width: "36%" }} />
                        <div className="surge-pill-add cid-add" style={{ left: "36%", width: treatmentPhase === 1 ? "38%" : "0%" }}>{treatmentPhase === 1 && <span className="surge-add-label">+41</span>}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prednisone-exposure-panel">
                  <header>
                    <strong className="prednisone-exposure-title">PREDNISONE EXPOSURE</strong>
                    <div className="prednisone-exposure-meta">
                      <span>TRIAL MEAN</span>
                      <small>12-MONTH MEDIAN · BOTH ARMS</small>
                    </div>
                  </header>
                  <div className="prednisone-exposure-grid">
                    <div><b>ADA</b><strong>11.8 <small>mg/day</small></strong><span>4.31 g cumulative</span></div>
                    <div><b>CID</b><strong>13.8 <small>mg/day</small></strong><span>5.04 g cumulative</span></div>
                    <div className="prednisone-exposure-shared"><b>BOTH ARMS</b><strong>7.5 <small>mg/day</small></strong><span>median at month 12</span></div>
                  </div>
                  <footer>IRR 0.86 · 95% CI 0.73–1.01 · P = 0.061</footer>
                </div>
                <div className="regional-injection-panel">
                  <header>
                    <strong>REGIONAL CORTICOSTEROID</strong>
                  </header>
                  <div className="regional-injection-grid">
                    <div>
                      <b>ADA</b>
                      <strong>27 <small>INJECTIONS</small></strong>
                      <span>19 eyes · 13 participants</span>
                    </div>
                    <div>
                      <b>CID</b>
                      <strong>25 <small>INJECTIONS</small></strong>
                      <span>20 eyes · 13 participants</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: ALL IMMUNOSUPPRESSIVE THERAPY, with class breakdown */}
              <div className="surge-matrix-card imt-detail-card">
                <header className="matrix-card-header">
                  <span className="card-lbl">03 · ALL IMMUNOSUPPRESSIVE THERAPY (IMT)</span>
                  <div className="card-total-badge">
                    <strong>{treatmentPhase === 0 ? "22%" : <>49% <i className="trend-up-inline">▲</i></>}</strong>
                    <small>{treatmentPhase === 0 ? "49 / 226" : "110 / 223"}</small>
                  </div>
                </header>

                <div className="matrix-card-tracks">
                  {/* ADA */}
                  <div className="matrix-arm-row">
                    <div className="arm-row-meta">
                      <span className="arm-tag ada">ADA ARM</span>
                      <span className="arm-nums">
                        {treatmentPhase === 0 ? <b>21%</b> : <><b>21%</b><i>→</i><strong>2%</strong><i className="trend-down">▼</i></>}
                      </span>
                    </div>
                    <div className={`surge-pill-container mini surge-phase-${treatmentPhase}`}>
                      <span className="surge-bar-count surge-total-count">{treatmentPhase === 0 ? "24/114" : "2/113"}</span>
                      <div className="surge-pill-base ada-base" style={{ width: treatmentPhase === 1 ? "2%" : "21%" } as React.CSSProperties} />
                      {treatmentPhase === 1 && (
                        <div className="surge-pill-drop" style={{ left: "2%", width: "19%" } as React.CSSProperties}>
                          <span className="surge-drop-label">−22</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CID */}
                  <div className="matrix-arm-row">
                    <div className="arm-row-meta">
                      <span className="arm-tag cid">CID ARM</span>
                      <span className="arm-nums">
                        {treatmentPhase === 0 ? <b>22%</b> : <><b>22%</b><i>→</i><strong>98%</strong><i className="trend-up-inline">▲</i></>}
                      </span>
                    </div>
                    <div className={`surge-pill-container mini surge-phase-${treatmentPhase}`}>
                      <span className="surge-bar-count surge-total-count">{treatmentPhase === 0 ? "25/112" : "108/110"}</span>
                      <div className="surge-pill-base cid-base" style={{ width: "22%" } as React.CSSProperties} />
                      <div className="surge-pill-add cid-add cid-antimetabolite-add" style={{ left: "22%", width: treatmentPhase === 1 ? "61%" : "0%" }}>{treatmentPhase === 1 && <span className="surge-add-label">+85</span>}</div>
                      <div className="surge-pill-add cid-cni-add" style={{ left: "83%", width: treatmentPhase === 1 ? "16.5%" : "0%" }}>{treatmentPhase === 1 && <span className="surge-add-label">+23</span>}</div>
                    </div>
                  </div>
                </div>

                <div className="imt-bar-legend" aria-label="CID immunosuppressive therapy surge legend">
                  <span><i className="legend-swatch legend-antimetabolite" />ANTIMETABOLITE</span>
                  <span><i className="legend-swatch legend-cni" />CALCINEURIN INHIBITOR</span>
                </div>

                {/* IMT Class Breakdown Grid */}
                <div className="imt-class-matrix">
                  {/* Class 1: Antimetabolites */}
                  <div className="imt-class-block">
                    <div className="imt-class-head">
                      <span>ANTIMETABOLITES</span>
                      <strong className="class-shift">
                        {treatmentPhase === 0 ? "49 / 226 (22%)" : <>87 / 223 (39%) <i className="trend-up-inline">▲</i></>}
                      </strong>
                    </div>
                    <div className="imt-agents-grid">
                      <div className="agent-pill">
                        <b>MMF</b>
                        <span>
                          {treatmentPhase === 0 ? "24" : <>42 <i className="trend-up">▲</i></>}
                        </span>
                        <small>{treatmentPhase === 0 ? "11 ADA / 13 CID" : "1 ADA / 41 CID"}</small>
                      </div>
                      <div className="agent-pill">
                        <b>MTX</b>
                        <span>
                          {treatmentPhase === 0 ? "23" : <>44 <i className="trend-up">▲</i></>}
                        </span>
                        <small>{treatmentPhase === 0 ? "12 ADA / 11 CID" : "1 ADA / 43 CID"}</small>
                      </div>
                      <div className="agent-pill">
                        <b>AZA</b>
                        <span>
                          {treatmentPhase === 0 ? "2" : <>1 <i className="trend-down">▼</i></>}
                        </span>
                        <small>{treatmentPhase === 0 ? "1 ADA / 1 CID" : "0 ADA / 1 CID"}</small>
                      </div>
                    </div>
                  </div>

                  {/* Class 2: Calcineurin Inhibitors (CNI) */}
                  <div className="imt-class-block cni-block">
                    <div className="imt-class-head">
                      <span>CALCINEURIN INHIBITORS (CNI)</span>
                      <strong className="class-shift">
                        {treatmentPhase === 0 ? "0 / 226 (0%)" : <>23 / 223 (10%) <i className="trend-up-inline cni-arrow">▲</i></>}
                      </strong>
                    </div>
                    <div className="imt-agents-grid">
                      <div className="agent-pill cni">
                        <b>Tacrolimus</b>
                        <span>
                          {treatmentPhase === 0 ? "0" : <>19 <i className="trend-up cni-arrow">▲</i></>}
                        </span>
                        <small>{treatmentPhase === 0 ? "Baseline: 0" : "0 ADA / 19 CID"}</small>
                      </div>
                      <div className="agent-pill cni">
                        <b>Cyclosporine</b>
                        <span>
                          {treatmentPhase === 0 ? "0" : <>4 <i className="trend-up cni-arrow">▲</i></>}
                        </span>
                        <small>{treatmentPhase === 0 ? "Baseline: 0" : "0 ADA / 4 CID"}</small>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="imt-advancement-callout">
                  <header><span>SECOND-AGENT ADDITION · DURING FOLLOW-UP</span></header>
                  <div className="imt-advancement-values">
                    <strong>41%</strong><span>ADA</span><b>vs</b><strong>29%</strong><span>CID</span>
                  </div>
                  <footer>HR 1.68 · 95% CI 0.98–2.86 · P = 0.06</footer>
                </div>

                <div className="imt-dose-escalation-callout">
                  <header><span>CID · ANTIMETABOLITE DOSE ESCALATION</span><strong>56/85 <small>(66%)</small></strong></header>
                  <div className="imt-dose-breakdown">
                    <span><b>AZA</b> 1/1</span>
                    <span><b>MTX</b> 32/43 <i>(74%)</i></span>
                    <span><b>MMF</b> 25/41 <i>(61%)</i></span>
                  </div>
                </div>

              </div>

            </div>

          </section>
        </section>}

        <section
          id="treatment-results-redesign"
          className={`scene txr-dashboard-scene txr-stage-${treatmentStoryStage}`}
          onClick={() => setTreatmentStoryStage((stage) => (stage >= 3 ? -1 : stage + 1))}
          aria-label="Treatment evolution dashboard from baseline through follow-up. Click to advance."
        >
          {/* HEADER AREA */}
          <header className="txrd-header">
            <div className="txrd-title-area">
              <p className="eyebrow"><span /> 18 — RESULTS / TREATMENTS</p>
              <h1>
                <span>Therapy assigned.</span><br />
                <span className="txrd-red">Treatment evolved.</span>
              </h1>
              <p>
                Baseline treatment looked similar between arms.<br />
                After randomization, treatment intensity surged in both arms—<span className="txrd-red">by different pathways.</span>
              </p>
            </div>
            <nav className="txrd-timeline">
              <div className={`txrd-step ${treatmentStoryStage >= 0 ? "active" : ""}`}>
                <strong>01</strong>
                <b>BASELINE</b>
                <small>They started alike.</small>
              </div>
              <div className={`txrd-step ${treatmentStoryStage >= 1 ? "active" : ""}`}>
                <strong>02</strong>
                <b>TREATMENT SURGE</b>
                <small>Intensity increased<br />in both arms.</small>
              </div>
              <div className={`txrd-step ${treatmentStoryStage >= 2 ? "active" : ""}`}>
                <strong>03</strong>
                <b>PATHWAYS DIVERGED</b>
                <small>Different strategies.<br />Different outcomes.</small>
              </div>
              <div className="txrd-track" aria-hidden="true"><i className="txrd-indicator" /></div>
            </nav>
          </header>

          {/* MAIN GRID */}
          <div className="txrd-grid-main">
            {/* COLUMN 1: BEFORE RANDOMIZATION */}
            <section className="txrd-col txrd-before">
              <header>BEFORE RANDOMIZATION<br /><span>Baseline enrollment status</span></header>
              <div className="txrd-arms">
                <article className="txrd-arm-row">
                  <div className="txrd-arm-label txrd-ada-color">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <div><b>ADA</b><span>ARM</span></div>
                  </div>
                  <div className="txrd-stat">
                    <small>ORAL STEROIDS</small>
                    <strong>81%</strong>
                    <span>92 / 114</span>
                    <div className="txrd-bar txrd-ada-color"><i style={{ width: "81%" }} /></div>
                  </div>
                  <div className="txrd-stat">
                    <small>CONVENTIONAL IMT</small>
                    <strong>21%</strong>
                    <span>24 / 114</span>
                    <div className="txrd-bar txrd-ada-color"><i style={{ width: "21%" }} /></div>
                  </div>
                </article>
                <article className="txrd-arm-row">
                  <div className="txrd-arm-label txrd-cid-color">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <div><b>CID</b><span>ARM</span></div>
                  </div>
                  <div className="txrd-stat">
                    <small>ORAL STEROIDS</small>
                    <strong>84%</strong>
                    <span>94 / 112</span>
                    <div className="txrd-bar txrd-cid-color"><i style={{ width: "84%" }} /></div>
                  </div>
                  <div className="txrd-stat">
                    <small>CONVENTIONAL IMT</small>
                    <strong>22%</strong>
                    <span>25 / 112</span>
                    <div className="txrd-bar txrd-cid-color"><i style={{ width: "22%" }} /></div>
                  </div>
                </article>
              </div>
              <div className="txrd-high-dose-subgroup" aria-label="High-dose subgroup: 38 percent overall, 40 percent in the ADA arm and 36 percent in the CID arm">
                38% high dose subgroup (ADA 40% : CID 36%)
              </div>
            </section>

            {/* ARROWS */}
            <div className="txrd-arrows" aria-hidden="true">
              <div className="txrd-arrow txrd-ada-color">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              <div className="txrd-arrow txrd-cid-color">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>

            {/* COLUMN 2: AFTER RANDOMIZATION */}
            <section className="txrd-col txrd-after">
              <header>AFTER RANDOMIZATION<br /><span>Treatment surge</span></header>
              <div className="txrd-arms">
                <article className="txrd-arm-row no-label">
                  <div className="txrd-stat">
                    <small>ORAL STEROIDS</small>
                    <strong>100%</strong>
                    <span>113 / 113</span>
                    <div className="txrd-bar txrd-ada-color"><i style={{ width: "100%" }} /></div>
                  </div>
                  <div className="txrd-stat">
                    <small>CONVENTIONAL IMT</small>
                    <strong>2%</strong>
                    <span>2 / 113</span>
                    <div className="txrd-bar txrd-ada-color"><i style={{ width: "2%" }} /></div>
                  </div>
                </article>
                <article className="txrd-arm-row no-label">
                  <div className="txrd-stat">
                    <small>ORAL STEROIDS</small>
                    <strong>98%</strong>
                    <span>108 / 110</span>
                    <div className="txrd-bar txrd-cid-color"><i style={{ width: "98%" }} /></div>
                  </div>
                  <div className="txrd-stat">
                    <small>CONVENTIONAL IMT</small>
                    <strong>98%</strong>
                    <span>108 / 110</span>
                    <div className="txrd-bar txrd-cid-color"><i style={{ width: "98%" }} /></div>
                  </div>
                </article>
              </div>
              <div className="txrd-high-dose-subgroup" aria-label="High-dose subgroup: 74 percent overall, 73 percent in the ADA arm and 74 percent in the CID arm">
                74% high dose subgroup (ADA 73% : CID 74%)
              </div>
            </section>

            {/* COLUMN 3: TREATMENT PATHWAYS */}
            <section className="txrd-col txrd-pathways">
              <header>TREATMENT PATHWAYS<br /><span>POST-RANDOMIZATION STRATEGY</span></header>
              <div className="txrd-arms">
                <article className="txrd-pathway-card txrd-ada-border txrd-pathway-ada">
                  <div className="txrd-pathway-hero">
                    <div className="txrd-ada-orbit" aria-label="Adalimumab received by 114 of 114 participants">
                      <i />
                      <i />
                    </div>
                    <div className="txrd-pathway-hero-copy">
                      <strong>ADALIMUMAB</strong>
                      <span>114 / 114 received</span>
                    </div>
                    <b>100%</b>
                  </div>
                  <div className="txrd-pathway-secondary">CONVENTIONAL IMT · 2 / 113 (2%)</div>
                </article>
                <article className="txrd-pathway-card txrd-cid-border txrd-pathway-cid">
                  <div className="txrd-pathway-hero">
                    <div className="txrd-donut txrd-cid-donut" aria-label="Among 108 initiated conventional IMT treatments: 85 antimetabolite, 23 CNI"></div>
                    <div className="txrd-pathway-hero-copy">
                      <strong>CONVENTIONAL IMT</strong>
                      <span>108 / 110 initiated</span>
                    </div>
                    <b>98%</b>
      </div>
      <div className="txrd-pathway-composition">
        <div className="txrd-pathway-composition-item"><i className="txrd-swatch txrd-swatch-purple" /><span>Antimetabolite:</span><b>85 (79%)</b></div>
        <div className="txrd-pathway-composition-item"><i className="txrd-swatch txrd-swatch-darkpurple" /><span>CNI:</span><b>23 (21%)</b></div>
      </div>
                </article>
              </div>
            </section>
          </div>

          {/* BOTTOM GRID: PATHWAYS DIVERGED */}
          <div className="txrd-grid-outcomes">
            <div className="txrd-outcomes-title">
              <strong>PATHWAYS DIVERGED</strong>
              <span>Key outcomes<br />during follow-up</span>
            </div>
            
            <section className="txrd-outcome txrd-outcome-steroid">
              <div className="txrd-outcome-header">
                <b>01</b>
                <div><strong>STEROID BURDEN</strong><span>12-month mean prednisone dose</span></div>
              </div>
              <div className="txrd-vs">
                <div className="txrd-ada-color"><small>ADA ARM</small><strong>11.8</strong><span>mg/day</span></div>
                <i>VS</i>
                <div className="txrd-cid-color"><small>CID ARM</small><strong>13.8</strong><span>mg/day</span></div>
              </div>
              <footer>IRR 0.86 &nbsp;|&nbsp; 95% CI 0.73-1.01 &nbsp;|&nbsp; P = 0.061</footer>
            </section>

            <section className="txrd-outcome txrd-outcome-second-agent">
              <div className="txrd-outcome-header">
                <b>02</b>
                <div><strong>SECOND-AGENT ADDITION</strong><span>During follow-up</span></div>
              </div>
              <div className="txrd-vs">
                <div className="txrd-ada-color"><small>ADA ARM</small><strong>41%</strong><span>N = 86</span></div>
                <i>VS</i>
                <div className="txrd-cid-color"><small>CID ARM</small><strong>29%</strong><span>N = 62</span></div>
              </div>
              <footer>HR 1.68 &nbsp;|&nbsp; 95% CI 0.92-2.86 &nbsp;|&nbsp; P = 0.06</footer>
            </section>

            <section className="txrd-outcome txrd-outcome-escalation">
              <div className="txrd-outcome-header">
                <b>03</b>
                <div><strong>CID DOSE ESCALATION</strong><span>Among eligible CID participants</span></div>
              </div>
              <div className="txrd-escalation-viz">
                <div className="txrd-cid-color txrd-esc-stats">
                  <strong>56 / 85</strong>
                  <span>(66%)</span>
                  <small>Escalated to higher dose</small>
                </div>
                <div className="txrd-dots" aria-hidden="true">
                  {Array.from({ length: 85 }).map((_, i) => (
                    <i key={i} className={i < 56 ? "on" : ""} />
                  ))}
                </div>
              </div>
              <div className="txrd-escalation-details" aria-label="Dose escalation by conventional immunosuppressive medication">
                <div><span>AZA</span><strong>1 / 1</strong></div>
                <div><span>MTX</span><strong>32 / 43 <i>(74%)</i></strong></div>
                <div><span>MMF</span><strong>25 / 41 <i>(61%)</i></strong></div>
              </div>
            </section>
          </div>

          {/* FOOTER STRIP */}
          <footer className="txrd-footer txrd-footer-regional-only">
            <div className="txrd-footer-card">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>
              <div>
                <strong>REGIONAL CORTICOSTEROID</strong>
                <span>During follow-up</span>
              </div>
              <div className="txrd-footer-stats">
                <div className="txrd-ada-color"><strong>27</strong><span>Injections<br />(19 eyes · 13 participants)</span></div>
                <div className="txrd-cid-color"><strong>25</strong><span>Injections<br />(20 eyes · 13 participants)</span></div>
              </div>
            </div>
          </footer>
        </section>

        <section
          id="results"
          className={`scene results-scene efficacy-sequence-${efficacyStoryStage}`}
          onClick={onEfficacyClick}
          onTouchStart={onEfficacyTouchStart}
          onTouchEnd={onEfficacyTouchEnd}
          aria-label="Efficacy results. Click or swipe up to advance the result sequence."
        >
          <div className="scene-copy results-copy">
            <p className="eyebrow"><span /> 19 — RESULTS / EFFICACY</p>
            <h2>Steroid sparing.<br /><em>Sooner with ADA.</em></h2>
            <p className="lede">Adalimumab produced more successful corticosteroid sparing by 6 months and reached the outcome faster.</p>
          </div>

          <section className="efficacy-stage efficacy-sequence-stage" aria-label="Successful corticosteroid sparing efficacy outcomes">
            <div className={`efficacy-chart-panel efficacy-story-${efficacyStoryStage}`}>
              <header><span>CUMULATIVE CORTICOSTEROID SPARING</span><div><b>ADA</b><i /><b>CID</b><small className="efficacy-advance-hint">{efficacyStoryStage < 5 ? "CLICK / SWIPE ↑" : "COMPLETE"}</small><button className="efficacy-story-replay" onClick={(event) => { event.stopPropagation(); resetEfficacyStory(); }} aria-label="Reset efficacy result sequence">↻</button></div></header>
              {efficacyStoryStage > 0 && <CumulativeChart focus={efficacyStoryStage === 1 ? 2 : efficacyFocus} highlights={efficacyHighlights} series={efficacySeries} ariaLabel="Cumulative proportion achieving successful corticosteroid sparing from randomization through 12 months" />}
            </div>
            {efficacyStoryStage === 5 ? (
              <div className="efficacy-summary-cards">
                <article className="primary-summary">
                  <header><span>PRIMARY · 6 MONTHS</span><b>P = 0.029</b></header>
                  <strong><small>aOR</small> 1.86</strong>
                  <div><span><b>69%</b> ADA</span><span><i>54%</i> CID</span></div>
                  <footer>95% CI 1.06–3.25 <em>SIGNIFICANT</em></footer>
                </article>
                <article>
                  <header><span>12 MONTHS</span><b>P = 0.077</b></header>
                  <strong><small>aOR</small> 1.89</strong>
                  <div><span><b>86%</b> ADA</span><span><i>77%</i> CID</span></div>
                  <footer>95% CI 0.93–3.83 <em>NOT SIGNIFICANT</em></footer>
                </article>
                <article className="time-summary">
                  <header><span>TIME TO SPARING</span><b>P = 0.032</b></header>
                  <strong><small>HR</small> 1.39</strong>
                  <div><span>FASTER WITH ADA</span></div>
                  <footer>95% CI 1.02–1.87 <em>SIGNIFICANT</em></footer>
                </article>
              </div>
            ) : efficacyStoryStage >= 2 ? (
              <aside key={`${efficacyFocus}-${efficacyStoryStage}`} className={`efficacy-readout efficacy-story-readout efficacy-focus-${efficacyFocus}`}>
                <span>{efficacyHighlights[efficacyFocus].label}</span>
                {efficacyFocus < 2 ? <div className="efficacy-groups"><article><small>ADA</small><strong>{efficacyHighlights[efficacyFocus].ada}</strong></article><i>VS</i><article><small>CID</small><strong>{efficacyHighlights[efficacyFocus].cid}</strong></article></div> : <div className="efficacy-speed"><strong>1.39×</strong><span>faster time to successful sparing</span></div>}
                <div className="efficacy-signal"><small>{efficacyHighlights[efficacyFocus].signal}</small><strong>{efficacyHighlights[efficacyFocus].effect}</strong><p>{efficacyHighlights[efficacyFocus].detail}</p></div>
                <b className={efficacyHighlights[efficacyFocus].status === "SIGNIFICANT" ? "significant" : "not-significant"}>{efficacyHighlights[efficacyFocus].status}</b>
              </aside>
            ) : <aside className="efficacy-readout efficacy-empty-readout" aria-hidden="true" />}
            <footer className="efficacy-reactivation"><span>AFTER SUCCESSFUL SPARING</span><p>Prednisone was escalated or restarted after reactivation in <b>29 ADA</b> and <strong>28 CID</strong> participants.</p></footer>
          </section>
        </section>

        <section
          id="discontinuation"
          className={`scene results-scene discontinuation-scene efficacy-sequence-${discontinuationStoryStage}`}
          onClick={onDiscontinuationClick}
          onTouchStart={onDiscontinuationTouchStart}
          onTouchEnd={onDiscontinuationTouchEnd}
          aria-label="Corticosteroid discontinuation results. Click or swipe up to advance the result sequence."
        >
          <div className="scene-copy results-copy">
            <p className="eyebrow"><span /> 20 — RESULTS / CORTICOSTEROID DISCONTINUATION</p>
            <h2>Off steroids.<br /><em>The gap emerged later.</em></h2>
            <p className="lede">Discontinuation was similar at 6 months. By 12 months, significantly more ADA participants had successfully stopped corticosteroids.</p>
          </div>

          <section className="efficacy-stage efficacy-sequence-stage discontinuation-stage" aria-label="Successful corticosteroid discontinuation outcomes">
            <div className={`efficacy-chart-panel efficacy-story-${discontinuationStoryStage} discontinuation-story-${discontinuationStoryStage}`}>
              <header><span>CUMULATIVE CORTICOSTEROID DISCONTINUATION</span><div><b>ADA</b><i /><b>CID</b><small className="efficacy-advance-hint">{discontinuationStoryStage < 5 ? "CLICK / SWIPE ↑" : "COMPLETE"}</small><button className="efficacy-story-replay" onClick={(event) => { event.stopPropagation(); resetDiscontinuationStory(); }} aria-label="Reset corticosteroid discontinuation result sequence">↻</button></div></header>
              {discontinuationStoryStage > 0 && <CumulativeChart focus={discontinuationStoryStage === 1 ? 2 : discontinuationFocus} highlights={discontinuationHighlights} series={discontinuationSeries} ariaLabel="Cumulative proportion achieving successful corticosteroid discontinuation through 12 months" />}
            </div>
            {discontinuationStoryStage === 5 ? (
              <div className="efficacy-summary-cards discontinuation-summary-cards">
                <article className="primary-summary">
                  <header><span>1 YEAR · 12 MONTHS</span><b>P = 0.028</b></header>
                  <strong><small>OR</small> 1.85</strong>
                  <div><span><b>55%</b> ADA</span><span><i>40%</i> CID</span></div>
                  <footer>95% CI 1.06–3.19 <em>SIGNIFICANT</em></footer>
                </article>
                <article>
                  <header><span>6 MONTHS</span><b>P = 0.30</b></header>
                  <strong><small>RESULT</small> SIMILAR</strong>
                  <div><span><b>15%</b> ADA</span><span><i>11%</i> CID</span></div>
                  <footer>4-POINT GAP <em>NOT SIGNIFICANT</em></footer>
                </article>
                <article>
                  <header><span>TIME TO EVENT</span><b>P = 0.053</b></header>
                  <strong><small>HR</small> 1.48</strong>
                  <div><span>NUMERICALLY FASTER</span></div>
                  <footer>95% CI 0.99–2.22 <em>NOT SIGNIFICANT</em></footer>
                </article>
              </div>
            ) : discontinuationStoryStage >= 2 ? (
              <aside key={`${discontinuationFocus}-${discontinuationStoryStage}`} className={`efficacy-readout efficacy-story-readout efficacy-focus-${discontinuationFocus}`}>
                <span>{discontinuationHighlights[discontinuationFocus].label}</span>
                {discontinuationFocus < 2 ? <div className="efficacy-groups"><article><small>ADA</small><strong>{discontinuationHighlights[discontinuationFocus].ada}</strong></article><i>VS</i><article><small>CID</small><strong>{discontinuationHighlights[discontinuationFocus].cid}</strong></article></div> : <div className="efficacy-speed"><strong>1.48×</strong><span>numerically faster time to discontinuation</span></div>}
                <div className="efficacy-signal"><small>{discontinuationHighlights[discontinuationFocus].signal}</small><strong>{discontinuationHighlights[discontinuationFocus].effect}</strong><p>{discontinuationHighlights[discontinuationFocus].detail}</p></div>
                <b className={discontinuationHighlights[discontinuationFocus].status === "SIGNIFICANT" ? "significant" : "not-significant"}>{discontinuationHighlights[discontinuationFocus].status}</b>
              </aside>
            ) : <aside className="efficacy-readout efficacy-empty-readout" aria-hidden="true" />}
            <footer className="discontinuation-foot">
              <article><span>RESTARTED PREDNISONE</span><p><b>7 ADA</b> vs <strong>4 CID</strong> after successful discontinuation</p></article>
              <article><span>SUBGROUP EFFECT</span><p>No heterogeneity by initial prednisone or baseline immunosuppression · interaction P &gt; 0.40</p></article>
            </footer>
          </section>
        </section>

        <section id="advancement" className="scene advancement-scene">

          {/* ── Ambient glow layers ── */}
          <div className="adv-glow adv-glow-left" aria-hidden="true" />
          <div className="adv-glow adv-glow-right" aria-hidden="true" />

          {/* ── Top header strip ── */}
          <header className="adv-header">
            <p className="eyebrow"><span /> 21 — RESULTS / IMMUNOSUPPRESSION ADVANCEMENT</p>
            <h2>ADA held steady.<br /><em>CID escalated.</em></h2>
            <p className="adv-lede">Among participants with no immunosuppression at baseline — how often did each arm need to escalate treatment?</p>
          </header>

          {/* ── Context chip ── */}
          <div className="adv-context" aria-label="Stratum: no immunosuppressive drug at baseline">
            <i aria-hidden="true" />
            <span>IMMUNOSUPPRESSION ADVANCEMENT</span>
            <i aria-hidden="true" />
          </div>

          {/* ── The main chart ── */}
          <div className="adv-chart" role="img" aria-label="Bar chart: 37 advancements in ADA group vs 60 in CID group">

            {/* ADA column */}
            <div className="adv-col adv-col-ada">
              <div className="adv-bar-wrap">
                <div className="adv-bar-label-top">
                  <span className="adv-bar-arm">ADA</span>
                  <strong className="adv-bar-num">37</strong>
                  <span className="adv-bar-unit">advancements</span>
                </div>
                <div className="adv-bar adv-bar-ada" style={{ "--bar-h": "61.7%" } as React.CSSProperties} aria-hidden="true">
                  <div className="adv-bar-fill" />
                  <div className="adv-bar-shine" aria-hidden="true" />
                </div>
              </div>
              <div className="adv-bar-footer">
                <span className="adv-bar-desc">first step: add 2nd agent</span>
              </div>
            </div>

            {/* Center: HR badge */}
            <div className="adv-center" aria-label="Hazard ratio 0.38, highly significant">
              <div className="adv-hr-block">
                <span className="adv-hr-label">HAZARD RATIO</span>
                <div className="adv-hr-value">
                  <small>HR</small>
                  <strong>0.38</strong>
                </div>
                <div className="adv-hr-badge">
                  <i aria-hidden="true" />
                  <span>P &lt; 0.001</span>
                </div>
                <div className="adv-hr-ci">
                  <span>95% CI</span>
                  <strong>0.25 – 0.57</strong>
                </div>
                <p className="adv-hr-meaning">ADA arm had <em>38%</em> the rate of immunosuppression advancement</p>
              </div>
              {/* vertical rule */}
              <div className="adv-center-line" aria-hidden="true" />
            </div>

            {/* CID column */}
            <div className="adv-col adv-col-cid">
              <div className="adv-bar-wrap">
                <div className="adv-bar-label-top">
                  <span className="adv-bar-arm">CID</span>
                  <strong className="adv-bar-num">60</strong>
                  <span className="adv-bar-unit">advancements</span>
                </div>
                <div className="adv-bar adv-bar-cid" style={{ "--bar-h": "100%" } as React.CSSProperties} aria-hidden="true">
                  <div className="adv-bar-fill" />
                  <div className="adv-bar-shine" aria-hidden="true" />
                </div>
              </div>
              <div className="adv-bar-footer">
                <span className="adv-bar-desc">first step: escalate dose</span>
              </div>
            </div>

          </div>

          {/* ── Bottom annotation ── */}
          <div className="adv-annotation">
            <span className="adv-annotation-arrow adv-down">↓ FEWER = BETTER</span>
            <span className="adv-annotation-note">Fewer advancements required = drug is controlling disease more effectively</span>
          </div>

        </section>


        <section id="ocular-results" className="scene ocular-results-scene">
          <div className="scene-copy ocular-results-copy">
            <p className="eyebrow"><span /> 22 — RESULTS / VISUAL &amp; MACULAR OUTCOMES</p>
            <h2>Vision held.<br /><em>Edema receded.</em></h2>
            <p className="lede">Both groups maintained good visual acuity. ADA showed an earlier advantage in visual gain and macular edema resolution.</p>
          </div>

          <section className="ocular-stage published-ocular-stage" aria-label="Visual acuity and macular edema outcomes at 6 and 12 months">
            <article className="vision-module published-bcva-panel">
              <header><span>PUBLISHED BCVA DISTRIBUTION</span><small>FIGURE 3 · STANDARD LETTERS · ADA VS CID</small></header>
              <figure className="bcva-source-figure">
                <img src="/nihms-2128218-f0004.jpg" alt="Published box plots of visual acuity in the ADA and CID groups from baseline through month 12" />
              </figure>
              <div className="bcva-findings">
                <section><span>6 MONTHS</span><strong>+3.0 <i>letters</i></strong><small>ΔADA − ΔCID · P = 0.01</small></section>
                <section><span>12 MONTHS</span><strong>+0.4 <i>letters</i></strong><small>ΔADA − ΔCID · P = 0.77</small></section>
              </div>
            </article>

            <article className="edema-module">
              <header><span>MACULAR EDEMA RESOLUTION</span><small>ODDS OF EDEMA VS BASELINE · LOWER IS BETTER</small></header>
              <div className="edema-comparison">
                {/* 6 Months Column */}
                <div className="edema-time-col">
                  <span className="edema-time-title">6 MONTHS</span>
                  <div className="edema-visual-group">
                    <div className="edema-bar-container">
                      <div className="edema-bar-track">
                        <div className="edema-bar-fill edema-bar-ada" style={{ "--val": "46%" } as React.CSSProperties}>
                          <span className="edema-bar-val">0.46</span>
                        </div>
                      </div>
                      <span className="edema-bar-arm">ADA</span>
                    </div>

                    <div className="edema-bar-container">
                      <div className="edema-bar-track">
                        <div className="edema-bar-fill edema-bar-cid" style={{ "--val": "76%" } as React.CSSProperties}>
                          <span className="edema-bar-val">0.76</span>
                        </div>
                      </div>
                      <span className="edema-bar-arm">CID</span>
                    </div>
                  </div>
                  <div className="edema-stats-badge">
                    <span>RATIO OF ORs</span>
                    <strong>0.60</strong>
                    <small>P = 0.027</small>
                  </div>
                </div>

                {/* 12 Months Column */}
                <div className="edema-time-col">
                  <span className="edema-time-title">12 MONTHS</span>
                  <div className="edema-visual-group">
                    <div className="edema-bar-container">
                      <div className="edema-bar-track">
                        <div className="edema-bar-fill edema-bar-ada" style={{ "--val": "34%" } as React.CSSProperties}>
                          <span className="edema-bar-val">0.34</span>
                        </div>
                      </div>
                      <span className="edema-bar-arm">ADA</span>
                    </div>

                    <div className="edema-bar-container">
                      <div className="edema-bar-track">
                        <div className="edema-bar-fill edema-bar-cid" style={{ "--val": "63%" } as React.CSSProperties}>
                          <span className="edema-bar-val">0.63</span>
                        </div>
                      </div>
                      <span className="edema-bar-arm">CID</span>
                    </div>
                  </div>
                  <div className="edema-stats-badge">
                    <span>RATIO OF ORs</span>
                    <strong>0.55</strong>
                    <small>P = 0.028</small>
                  </div>
                </div>
              </div>
              <footer className="edema-module-footer">Both groups improved further by month 12, with ADA sustaining a clear advantage.</footer>
            </article>
          </section>
        </section>

        <section id="safety-outcomes" className="scene safety-outcomes-scene">
          <div className="scene-copy safety-outcomes-copy">
            <p className="eyebrow"><span /> 23 — RESULTS / SAFETY OUTCOMES</p>
            <h2>Protect the vision.<br /><em>Watch the exceptions.</em></h2>
            <p className="lede">Cataract surgery and moderate visual decline were more frequent with CID; severe decline was uncommon and not significantly different.</p>
          </div>

          <section className="safety-outcomes-stage" aria-label="Safety outcomes comparing adalimumab and conventional immunosuppression">
            <div className="safety-outcomes-primary">
              <header><span>BETWEEN-GROUP SAFETY SIGNALS</span><small>ADA vs CID · CUMULATIVE PROPORTION</small></header>
              <div className="safety-metric-row safety-significant">
                <div><b>CATARACT SURGERY</b><small>phakic eyes</small></div>
                <div className="safety-bars"><span><i style={{ "--bar": "15%" } as React.CSSProperties}>2%</i><em>ADA</em></span><span><i className="cid-fill" style={{ "--bar": "85%" } as React.CSSProperties}>11%</i><em>CID</em></span></div>
                <strong>P = 0.009</strong>
              </div>
              <div className="safety-metric-row safety-significant">
                <div><b>≥15-LETTER BCVA LOSS</b><small>3-line decrease</small></div>
                <div className="safety-bars"><span><i style={{ "--bar": "46%" } as React.CSSProperties}>6%</i><em>ADA</em></span><span><i className="cid-fill" style={{ "--bar": "100%" } as React.CSSProperties}>13%</i><em>CID</em></span></div>
                <strong>P = 0.026</strong>
              </div>
              <div className="safety-metric-row">
                <div><b>≥30-LETTER BCVA LOSS</b><small>6-line decrease</small></div>
                <div className="safety-bars"><span><i style={{ "--bar": "43%" } as React.CSSProperties}>3%</i><em>ADA</em></span><span><i className="cid-fill" style={{ "--bar": "100%" } as React.CSSProperties}>7%</i><em>CID</em></span></div>
                <strong>P = 0.43</strong>
              </div>
            </div>

            <div className="safety-outcomes-secondary">
              <article className="safety-reasons">
                <header><span>6-LINE DECLINE · MOST COMMON REASONS</span><small>14 eyes had additional follow-up</small></header>
                <div className="reason-grid">
                  <div><strong>8</strong><span>CATARACT</span><small>2 ADA · 6 CID</small></div>
                  <div><strong>4</strong><span>UVEITIS ACTIVITY</span></div>
                  <div><strong>2</strong><span>VITREOUS HEMORRHAGE</span></div>
                </div>
              </article>
              <article className="safety-recovery">
                <header><span>FOLLOW-UP STATUS</span><small>among 14 eyes</small></header>
                <div className="recovery-track"><i style={{ "--bar": "57%" } as React.CSSProperties} /><i style={{ "--bar": "14%" } as React.CSSProperties} /><i style={{ "--bar": "29%" } as React.CSSProperties} /></div>
                <div className="recovery-legend"><span><b>8</b> regained baseline</span><span><b>2</b> within 10 letters</span><span><b>4</b> ≥3 lines below</span></div>
              </article>
            </div>
            <footer className="safety-outcomes-footnote">Other ocular events occurred at similar rates in both treatment groups.</footer>
          </section>
        </section>

        <section id="systemic-safety-tolerability" className="scene safety-qol-results-scene">
          <div className="scene-copy safety-qol-copy">
            <p className="eyebrow"><span /> 24 — RESULTS / SAFETY &amp; TOLERABILITY</p>
            <h2>Fewer safety signals with ADA.<br /><em>Serious events remained similar.</em></h2>
            <p className="lede">ADA had fewer cataract surgeries, ≥15-letter vision losses, and liver enzyme elevations; serious systemic event rates were similar.</p>
          </div>

          <section className="safety-qol-top" aria-label="Safety signals and other Table 5 events">
            <article className="safety-difference-panel">
              <header><span>SAFETY SIGNALS THAT DIFFERED</span><small>ADA vs CID</small></header>
              <div className="safety-difference-row significant"><span className="safety-row-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" /><circle cx="16" cy="16" r="5" /><path d="M16 4v24" opacity=".32" /></svg></span><div className="safety-difference-label"><b>CATARACT SURGERY</b><small>Phakic eyes</small></div><div className="safety-difference-bars"><span><em>ADA</em><i style={{ "--bar": "18%" } as React.CSSProperties}>2%</i></span><span><em>CID</em><i className="cid" style={{ "--bar": "100%" } as React.CSSProperties}>11%</i></span></div><strong>P=0.009</strong></div>
              <div className="safety-difference-row significant"><span className="safety-row-icon safety-row-icon-va"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="4" width="22" height="24" rx="1.5" /><path d="M12 10h8M10 16h5m2 0h5M8 22h4m3 0h3m3 0h3" /></svg></span><div className="safety-difference-label"><b>≥15-LETTER BCVA LOSS</b><small>3-line decrease</small></div><div className="safety-difference-bars"><span><em>ADA</em><i style={{ "--bar": "46%" } as React.CSSProperties}>6%</i></span><span><em>CID</em><i className="cid" style={{ "--bar": "100%" } as React.CSSProperties}>13%</i></span></div><strong>P=0.026</strong></div>
              <div className="safety-difference-row"><span className="safety-row-icon safety-row-icon-va"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="4" width="22" height="24" rx="1.5" /><path d="M12 10h8M10 16h5m2 0h5M8 22h4m3 0h3m3 0h3" /></svg></span><div className="safety-difference-label"><b>≥30-LETTER BCVA LOSS</b><small>6-line decrease</small></div><div className="safety-difference-bars"><span><em>ADA</em><i style={{ "--bar": "43%" } as React.CSSProperties}>3%</i></span><span><em>CID</em><i className="cid" style={{ "--bar": "100%" } as React.CSSProperties}>7%</i></span></div><strong>P=0.430</strong></div>
              <div className="safety-difference-row significant"><span className="safety-row-icon safety-row-icon-liver"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 16c0-6 3-10 8-11 3-.6 5 1 7 3 2 1.7 4.8 2.5 7 2.5v6.2c-2.5.1-4.2 1.1-5.5 3.5-1.8 3.3-5.1 5.7-9.3 5.7C7.5 25.9 5 22.6 5 16Z" /><path d="M17.5 8.3c-.4 5.1-2.2 9.2-5.4 12.2" /></svg></span><div className="safety-difference-label"><b>ELEVATED LIVER ENZYMES</b><small>Any grade elevation</small></div><div className="safety-difference-bars"><span><em>ADA</em><i style={{ "--bar": "20%" } as React.CSSProperties}>2%</i></span><span><em>CID</em><i className="cid" style={{ "--bar": "100%" } as React.CSSProperties}>10%</i></span></div><strong>P=0.014</strong></div>
            </article>

            <aside className="table-five-events" aria-label="Other ocular adverse events from Table 5">
              <header><span>OTHER OCULAR EVENTS</span><small>ADA / CID</small></header>
              <div className="table-five-columns">
                <section>
                  <p><span>IOP +10 mmHg</span><em><b>9%</b><i>/</i><strong>8%</strong><i>· P=0.730</i></em></p>
                  <p><span>IOP ≥24 mmHg</span><em><b>11%</b><i>/</i><strong>13%</strong><i>· P=0.500</i></em></p>
                  <p><span>IOP ≥30 mmHg</span><em><b>5%</b><i>/</i><strong>5%</strong><i>· P=0.930</i></em></p>
                  <p><span>IOP medication</span><em><b>16%</b><i>/</i><strong>10%</strong><i>· P=0.850</i></em></p>
                  <p><span>New glaucoma</span><em><b>1%</b><i>/</i><strong>11%</strong><i>· P=0.200</i></em></p>
                  <p><span>Glaucoma surgery</span><em><b>1%</b><i>/</i><strong>3%</strong><i>· P=0.290</i></em></p>
                </section>
              </div>
            </aside>
          </section>

          <section className="safety-bottom-band">
            <article className="safety-intolerance-panel">
              <header><span>TREATMENT INTOLERANCE</span><small>Discontinued assigned therapy due to intolerance</small></header>
              <div className="safety-intolerance-numbers"><div><strong>0</strong><span>ADA</span></div><i /><div><strong>8</strong><span>CID</span></div></div>
              <p><b>CID discontinuations</b><br />MTX-based 6 · Mycophenolate 2</p>
              <footer><b>After discontinuation:</b> 6 → another CID · 1 → ADA · 1 → stopped</footer>
            </article>
            <section className="serious-events-panel" aria-label="Serious events with no significant difference">
              <header><span>SERIOUS SYSTEMIC EVENTS — NO SIGNIFICANT DIFFERENCE</span><small>Rates per person-year</small></header>
              <article><span className="serious-row-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 26 7v8c0 7-4 11-10 14C10 26 6 22 6 15V7Z" /><path d="M16 10v10m-5-5h10" /></svg></span><div><b>INFECTIONS REQUIRING ANTIBIOTICS</b><span><em>ADA</em> 0.40/PY <em className="cid">CID</em> 0.37/PY</span><small>IRR 1.10 · 95% CI 0.61–2.00 · P=0.760</small></div></article>
              <article><span className="serious-row-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 28V7h18v21M12 7V3h8v4M4 28h24" /><path d="M13 12h6m-3-3v6M11 19h3m4 0h3m-10 4h3m4 0h3" /></svg></span><div><b>HOSPITALIZATIONS</b><span><em>ADA</em> 0.045/PY <em className="cid">CID</em> 0.115/PY</span><small>IRR 0.39 · 95% CI 0.12–1.26 · P=0.120</small></div></article>
              <article className="serious-other"><span className="serious-row-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="11" r="4" /><circle cx="22" cy="12" r="3.5" /><path d="M4 27c0-6 2.5-9 7-9s7 3 7 9M17 20c1.2-1.8 2.9-2.7 5-2.7 4 0 6 3 6 8" /></svg></span><div><b>OTHER SERIOUS SYSTEMIC AEs</b><span>Rare and similar between groups.</span><small>No new demyelination events in either treatment group.</small></div></article>
            </section>
          </section>
        </section>

        <section id="quality-of-life-results" className="scene qol-results-scene">
          <div className="scene-copy qol-results-copy">
            <p className="eyebrow"><span /> 25 — RESULTS / QUALITY OF LIFE</p>
            <h2>Quality of life<br /><em>remained broadly similar.</em></h2>
            <p className="lede">Across general health, vision-related function, and SF-36 domains, the trial did not show a sustained clinically meaningful between-group difference.</p>
          </div>
          <section className="qol-results-system" aria-label="Quality of life results">
            <article><span>01</span><b>EQ-5D</b><strong>Perfect index scores</strong><p>No significant change in the proportion of participants with a perfect score.</p><i /></article>
            <article><span>02</span><b>NEI-VFQ-25</b><strong>Vision-related quality of life</strong><p>Both groups improved similarly, near the 4–6-point minimally clinically meaningful difference.</p><i /></article>
            <article className="qol-sf36"><span>03</span><b>SF-36</b><strong>Physical + mental health</strong><div><p><em>PHYSICAL</em> ADA was essentially unchanged; CID declined slightly. The 6-month difference was not sustained at 12 months, and neither group had a clinically meaningful change.</p><p><em>MENTAL</em> No significant between-group difference at 6 or 12 months.</p></div><i /></article>
          </section>
        </section>
        <section id="limitations-4" className="scene discussion-advancement-scene">
          <div className="adv-two-col">
            <div className="adv-left-col">
              <p className="eyebrow"><span /> 26 — DISCUSSION / TREATMENT ADVANCEMENT</p>
              <p className="red-hook">COULD MORE SECOND-AGENT USE HAVE FAVORED ADA?</p>
              <h2>More second agents</h2>
              <h2 className="red-text">Unlikely influence its benefit.</h2>

              <p className="lede">Two observations argue against greater second-agent use explaining ADA’s benefit.</p>
              
              <div className="adv-observations-block">

                
                <div className="observation-item">
                  <h4><span>01</span> — CONSISTENCY ACROSS STRATA</h4>
                  <p>Corticosteroid-sparing and discontinuation benefits were qualitatively similar regardless of baseline immunosuppression.</p>
                </div>
                
                <div className="observation-item">
                  <h4><span>02</span> — OVERALL TREATMENT ADVANCEMENT</h4>
                  <p>Despite more second-agent use with ADA in one stratum, overall immunosuppression advancement was greater with CID.</p>
                </div>
              </div>
            </div>

            <div className="adv-right-col">
              <div className="adv-arch-evidence-strip">
                <div className="adv-arch-evidence-recall">
                  <strong>COUNTEREVIDENCE</strong>
                  <span>Among participants <strong>NOT RECEIVING</strong> immunosuppression at baseline</span>
                </div>
                <div className="adv-arch-evidence-stat">
                  <b>SECOND AGENT ADDED</b>
                  <span><em>41%</em> ADA vs <em>29%</em> CID</span>
                  <small>P = 0.060</small>
                </div>
                <div className="adv-arch-evidence-stat adv-arch-evidence-overall">
                  <b>IMMUNOSUPPRESSION ADVANCEMENT</b>
                  <span><em>37</em> ADA vs <em>60</em> CID</span>
                  <small style={{ color: '#ff666b', fontWeight: 600 }}>P &lt; 0.001</small>
                </div>
              </div>

              <div className="adv-arch-panel">
                <header className="adv-arch-header">
                  <span>PROTOCOL DIVERGES AFTER FIRST RELAPSE</span>
                </header>
                <div className="adv-arch-split">
                  {/* ADA Track Box */}
                  <div className="adv-arch-track-box adv-arch-track-ada-box">
                    <div className="adv-arch-header-ada">
                      <strong>ADA</strong>
                    </div>
                    <div className="adv-arch-track">
                      <div className="adv-arch-node adv-arch-start">
                        <span>Fixed adult dose</span><small>(FDA-approved regimen)</small>
                      </div>
                      <div className="adv-arch-edge">↓</div>
                      <div className="adv-arch-node adv-arch-hinge-node adv-arch-ada-node adv-arch-node-relapse">
                        <strong>Uveitis relapse</strong>
                      </div>
                      <div className="adv-arch-edge">↓</div>
                      <div className="adv-arch-node adv-arch-end">
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}><svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="#ff666b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>Add second agent</span>
                      </div>
                    </div>
                  </div>

                  {/* CID Track Box */}
                  <div className="adv-arch-track-box adv-arch-track-cid-box">
                    <div className="adv-arch-header-cid">
                      <strong>CID</strong>
                    </div>
                    <div className="adv-arch-track">
                      <div className="adv-arch-node adv-arch-start">
                        <span>Start antimetabolite</span><small>(at effective dose)</small>
                      </div>
                      <div className="adv-arch-edge">↓</div>
                      <div className="adv-arch-node adv-arch-hinge-node adv-arch-cid-node adv-arch-node-relapse">
                        <strong>Uveitis relapse</strong>
                      </div>
                      <div className="adv-arch-edge">↓</div>
                      <div className="adv-arch-node">
                        <span>Increase toward maximum dose</span>
                      </div>
                      <div className="adv-arch-edge">↓</div>
                      <div className="adv-arch-node adv-arch-node-relapse">
                        <strong>Uveitis relapse</strong>
                      </div>
                      <div className="adv-arch-edge">↓</div>
                      <div className="adv-arch-node adv-arch-end">
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}><svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="#b58eff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>Add second agent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section 
          id="discussion-safety" 
          className="scene discussion-cataract-scene"
          onClick={() => setShowCataractWarning(prev => !prev)}
          style={{ cursor: 'pointer' }}
        >
          <div className="adv-two-col">
            <div className="adv-left-col">
              <p className="eyebrow"><span /> 27 — DISCUSSION / CATARACT SIGNAL</p>
              <p className="red-hook">WHY DID CID SHOW MORE ≥3-LINE VISION LOSS?</p>
              <h2>More steroid exposure</h2>
              <h2 className="red-text">Plausible. Not definitive.</h2>
              
              <p className="lede">Greater corticosteroid exposure with CID offers a biologically plausible explanation. Two observations, however, prevent simple causal attribution.</p>
              
              <div className="adv-observations-block editorial-rules">
                <div className="observation-item">
                  <h4><span>01</span> — EXPOSURE DIFFERENCE WAS MODEST</h4>
                  <p>ADA had slightly lower corticosteroid use, but the magnitude of exposure separation between groups was limited.</p>
                </div>
                
                <div className="observation-item">
                  <h4><span>02</span> — BASELINE LENS STATUS WAS IMBALANCED</h4>
                  <p>A numerically greater fraction of phakic CID eyes already had cataract at baseline.</p>
                </div>

                {showCataractWarning && (
                  <div className="cataract-inline-red-box">
                    <div className="inline-warning-badge-row">
                      <span className="warning-badge-icon-custom" aria-hidden="true">!</span>
                      <span className="warning-badge-text">CRITICAL INTERPRETATION CAVEAT</span>
                    </div>
                    <p className="inline-warning-p1">
                      How much cataract explains the ≥3-line BCVA difference was not reported
                    </p>
                    <div className="inline-warning-divider" />
                    <p className="inline-warning-p2">
                      Cataract accounted for 8/18 (44%) of ≥6-line declines; other causes included uveitis activity and vitreous hemorrhage, and visual recovery after cataract surgery was variable
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="adv-right-col">
              <div className="adv-causal-panel">
                
                <div className="adv-arch-evidence-strip cataract-signal-strip">
                  <div className="adv-arch-evidence-recall">
                    <strong>THE SIGNAL</strong>
                    <span>Clinical observation from results</span>
                  </div>
                  <div className="adv-arch-evidence-stat">
                    <b>MORE ≥3-LINE BCVA LOSS</b>
                    <span><em>6%</em> ADA vs <em>13%</em> CID</span>
                    <small style={{ color: '#ff666b', fontWeight: 600 }}>P = 0.026</small>
                  </div>
                  <div className="signal-divider-arrow" aria-hidden="true">
                    <span>?</span>
                  </div>
                  <div className="adv-arch-evidence-stat">
                    <b>CATARACT SURGERY</b>
                    <span><em>2%</em> ADA vs <em>11%</em> CID</span>
                    <small style={{ color: '#ff666b', fontWeight: 600 }}>P = 0.009</small>
                  </div>
                </div>

                <div className="causal-diagram-wrapper">
                  <p className="causal-header">INTERPRETING THE CATARACT SIGNAL</p>

                  <div className="causal-diagram">
                    <div className="causal-node node-cid">CID</div>

                    <div className="causal-split">
                      <div className="causal-side-note note-left">
                        <span className="note-eyebrow-heading">GREATER STEROID EXPOSURE</span>
                        <div className="side-note-icon-card" aria-hidden="true">
                          <svg viewBox="0 0 44 40" className="icon-svg-steroid">
                            <polygon points="10,24 7,19 10,14 16,14 19,19 16,24" fill="rgba(255,77,82,0.08)" stroke="#ff666b" strokeWidth="1.5" strokeLinejoin="round"/>
                            <polygon points="16,24 19,19 16,14 22,14 25,19 22,24" fill="rgba(255,77,82,0.18)" stroke="#ff666b" strokeWidth="1.5" strokeLinejoin="round"/>
                            <polygon points="22,14 25,19 22,24 28,24 31,19 28,14" fill="rgba(255,77,82,0.08)" stroke="#ff666b" strokeWidth="1.5" strokeLinejoin="round"/>
                            <polygon points="28,14 31,19 36,16 35,10 28,10" fill="rgba(255,77,82,0.25)" stroke="#ff7175" strokeWidth="1.5" strokeLinejoin="round"/>
                            <line x1="16" y1="14" x2="16" y2="8" stroke="#ff8e91" strokeWidth="1.6" strokeLinecap="round"/>
                            <line x1="22" y1="14" x2="22" y2="8" stroke="#ff8e91" strokeWidth="1.6" strokeLinecap="round"/>
                            <circle cx="16" cy="7.5" r="1.5" fill="#ff666b" />
                            <circle cx="22" cy="7.5" r="1.5" fill="#ff666b" />
                            <path d="M7 29h6M10 26v6" stroke="#ff4d52" strokeWidth="1.5" strokeLinecap="round"/>
                            <text x="17" y="32" fill="#ff8a8e" fontFamily="var(--font-geist-mono)" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">DOSE</text>
                          </svg>
                        </div>
                        <p className="note-title">MODEST EXPOSURE GAP</p>
                        <p className="note-body">Δ cumulative dose ≈ 0.73 g<br/>IRR 0.86 · <span className="badge-p-non-sig">P = 0.061</span></p>
                      </div>
                      <div className="causal-main-path">
                         <div className="dashed-arrow-down"></div>
                      </div>
                      <div className="causal-side-note note-right">
                        <span className="note-eyebrow-heading">PRE-EXISTING LENS STATUS</span>
                        <div className="side-note-icon-card" aria-hidden="true">
                          <svg viewBox="0 0 44 40" className="icon-svg-eye">
                            <path d="M4 20C11 9 33 9 40 20C33 31 11 31 4 20Z" fill="rgba(181,142,255,0.06)" stroke="#b58eff" strokeWidth="1.6" strokeLinejoin="round" />
                            <circle cx="22" cy="20" r="8.5" fill="rgba(181,142,255,0.18)" stroke="#b58eff" strokeWidth="1.4" />
                            <ellipse cx="22" cy="20" rx="4" ry="6.5" fill="rgba(181,142,255,0.35)" stroke="#d4beff" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
                            <circle cx="22" cy="20" r="2" fill="#fff" opacity="0.95" />
                            <line x1="22" y1="6" x2="22" y2="10" stroke="#d4beff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                            <line x1="22" y1="30" x2="22" y2="34" stroke="#d4beff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                            <text x="12" y="37" fill="#c4a8ff" fontFamily="var(--font-geist-mono)" fontSize="5.5" fontWeight="700" letterSpacing="0.06em">PHAKIC</text>
                          </svg>
                        </div>
                        <p className="note-title">BASELINE IMBALANCE</p>
                        <p className="note-body">Pre-existing cataract Δ4%<br/><span className="badge-stat-ada">36% ADA</span> vs <span className="badge-stat-cid">40% CID</span></p>
                      </div>
                    </div>
                    
                    <div className="causal-node node-surgery-evident">
                      Higher cataract surgery with CID
                    </div>
                    
                    <div className="causal-node node-conclusion">
                      <strong>PLAUSIBLE CONTRIBUTOR <span className="red-highlight-text">≠ PROVEN CAUSE</span></strong>
                      <p>Greater steroid exposure may have contributed to the cataract. Cohort studies in GCA suggest ~3-4% increase risk per 1 gm increase in cumulative oral dose over one year</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="limitations-1" className="scene discussion-limitations-scene">
          <div className="adv-two-col">
            <div className="adv-left-col">
              <p className="eyebrow"><span /> 28 — DISCUSSION / LIMITATIONS</p>
              <p className="cataract-hook">COULD KNOWING TREATMENT ASSIGNMENT HAVE BIASED THE RESULTS?</p>
              <h2>Unmasked.<br /><span className="red-text" style={{display: 'inline'}}>But not uncontrolled.</span></h2>
              <p className="lede">Masking was impractical. Prespecified criteria, protocolized decisions, and quality oversight helped constrain bias.</p>

              <div className="adv-observations-block editorial-rules">
                <div className="observation-item">
                  <h4><span>01</span> — DISEASE-ACTIVITY ASSESSMENT</h4>
                  <p>Complex disease-specific assessment creates room for inter-observer variability in clinical signs and imaging interpretation.</p>
                </div>
                
                <div className="observation-item">
                  <h4><span>02</span> — KNOWLEDGE OF TREATMENT</h4>
                  <p>Knowing assignment could shape participant expectations and symptom reporting, while physician expectations could influence treatment decisions.</p>
                </div>
              </div>
            </div>

            <div className="adv-right-col">
              <div className="adv-arch-evidence-strip">
                <div className="adv-arch-evidence-recall">
                  <strong>SUPPORT CLAIMS</strong>
                  <span>Participant-reported outcomes at 6 months</span>
                </div>
                <div className="adv-arch-evidence-stat">
                  <b>EQ-5D INDEX OF 1</b>
                  <span><em className="stat-val-red">OR 1.25</em> (0.67–2.31)</span>
                  <small>P = 0.480 · <span className="stat-badge-non-sig-violet">Non-significant</span></small>
                </div>
                <div className="adv-arch-evidence-stat adv-arch-evidence-overall">
                  <b>NEI-VFQ-25 COMPOSITE</b>
                  <span><em className="stat-val-red">Δ 2.8</em> (−0.2–5.7)</span>
                  <small>P = 0.060 · <span className="stat-badge-non-sig-violet">Non-significant</span></small>
                </div>
              </div>

              <div className="limitations-analytical-panel">
                
                {/* SECTION 1: POTENTIAL BIAS WAS NOT NECESSARILY UNIDIRECTIONAL */}
                <div className="lim-bias-unidirectional-section">
                  <div className="lim-section-rule-header">
                    <span className="lim-section-title">POTENTIAL BIAS WAS NOT NECESSARILY UNIDIRECTIONAL</span>
                  </div>

                  <div className="lim-three-cards-row">
                    {/* Card 1: Perceived potency */}
                    <div className="lim-bias-card card-ada">
                      <div className="card-top-bar">
                        <span className="card-corner-badge badge-ada">
                          <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          FAVORS ADA
                        </span>
                      </div>
                      <h5 className="card-top-title">Perceived potency</h5>
                      <div className="card-big-icon" aria-hidden="true">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff666b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m18 2 4 4"/>
                          <path d="m17 7 3-3"/>
                          <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                          <path d="m9 11 4 4"/>
                          <path d="m5 19-3 3"/>
                          <path d="m14 4 6 6"/>
                        </svg>
                      </div>
                      <p className="card-details">Parenteral therapy perceived more effective</p>
                    </div>

                    {/* Card 2: Prior treatment perception */}
                    <div className="lim-bias-card card-ada">
                      <div className="card-top-bar">
                        <span className="card-corner-badge badge-ada">
                          <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          FAVORS ADA
                        </span>
                      </div>
                      <h5 className="card-top-title">Prior treatment perception</h5>
                      <div className="card-big-icon" aria-hidden="true">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff8085" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9"/>
                          <path d="M12 8v4"/>
                          <path d="M12 16h.01"/>
                          <path d="M16 12a4 4 0 0 1-8 0"/>
                        </svg>
                      </div>
                      <p className="card-details">22% had not achieved steroid sparing—potentially perceived as conventional treatment “failure.”</p>
                    </div>

                    {/* Card 3: Route preference */}
                    <div className="lim-bias-card card-cid">
                      <div className="card-top-bar">
                        <span className="card-corner-badge badge-cid">
                          <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          FAVOR CID
                        </span>
                      </div>
                      <h5 className="card-top-title">Route preference</h5>
                      <div className="card-big-icon" aria-hidden="true">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b58eff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                          <path d="m8.5 8.5 7 7"/>
                        </svg>
                      </div>
                      <p className="card-details">Participants may prefer oral convenience over injections</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: SAFEGUARDS (More vertical space, shield icons, thin lines) */}
                <div className="lim-safeguards-section">
                  <div className="lim-section-rule-header">
                    <span className="lim-section-title">SAFEGUARDS</span>
                  </div>

                  <div className="lim-safeguards-lines-list">
                    {/* Safeguard 01 */}
                    <div className="lim-safeguard-line-item">
                      <div className="shield-icon-col" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a88aff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                      </div>
                      <div className="safeguard-text-col">
                        <h4><span>01</span> — PRESPECIFIED ASSESSMENT</h4>
                        <p>Disease-specific clinical examination and imaging criteria</p>
                      </div>
                    </div>

                    {/* Safeguard 02 */}
                    <div className="lim-safeguard-line-item">
                      <div className="shield-icon-col" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a88aff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                      </div>
                      <div className="safeguard-text-col">
                        <h4><span>02</span> — PROTOCOLIZED DECISIONS</h4>
                        <p>Defined corticosteroid tapering and immunosuppression advancement</p>
                      </div>
                    </div>

                    {/* Safeguard 03 */}
                    <div className="lim-safeguard-line-item">
                      <div className="shield-icon-col" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a88aff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                      </div>
                      <div className="safeguard-text-col">
                        <h4><span>03</span> — MTQAC OVERSIGHT</h4>
                        <p>Central monitoring of imaging interpretation, activity determination, and protocol adherence</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM CONCLUSION */}
                <div className="lim-conclusion-band">
                  <strong>MITIGATION <span className="red-highlight-text">≠ ELIMINATION</span></strong>
                  <p>These safeguards constrain bias—but cannot eliminate the limitation of an unmasked design.</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section
          id="limitations-2"
          className={`scene discussion-comparator-scene comp-stage-${comparatorZoomStage}`}
          onClick={onCompClick}
          onTouchStart={onCompTouchStart}
          onTouchEnd={onCompTouchEnd}
        >
          <div className="adv-two-col">
            {/* LEFT COLUMN - Completely fixed editorial setup */}
            <div className="adv-left-col">
              <p className="eyebrow"><span /> 29 — DISCUSSION / COMPARATOR HETEROGENEITY</p>
              <p className="red-hook">COULD A WEAKER CONVENTIONAL AGENT HAVE FAVORED ADA?</p>
              <h2>One comparator.<br /><span className="red-text" style={{display: 'inline'}}>Several treatment pathways.</span></h2>
              <p className="lede">CID was a treatment strategy—not a single drug. The key concern is whether potentially lower-efficacy calcineurin-inhibitor exposure could have weakened the comparator.</p>

              <div className="comp-investigation-statement">
                <div className="investigation-rule" />
                <h4>THE QUESTION IS NOT HETEROGENEITY ALONE.</h4>
                <p>Prior evidence suggested broadly similar efficacy among antimetabolites, but possibly lower efficacy with cyclosporine; evidence for tacrolimus was mixed.</p>
              </div>
            </div>

            {/* RIGHT COLUMN - Fixed-size camera frame with internal animated canvas */}
            <div className="adv-right-col comp-anatomy-column">
              <div className="comp-viewport-frame">
                <div className="comp-anatomy-canvas">
                  
                  {/* 1. ROOT STRATEGY STRIP */}
                  <div className="anatomy-root-bar">
                    <div className="anatomy-root-tag">
                      <span className="cid-pill">CID</span>
                      <strong>CONVENTIONAL IMMUNOSUPPRESSION</strong>
                    </div>
                    <div className="anatomy-root-count">N = 113</div>
                  </div>

                  {/* 2. PROPORTIONAL BRANCHING TREE */}
                  <div className="anatomy-proportional-branches">
                    
                    {/* Left / Major: 79% Antimetabolites */}
                    <div className="branch-pane pane-dominant">
                      <div className="branch-headline-row">
                        <span className="branch-massive-pct">79%</span>
                        <div className="branch-label-stack">
                          <h5>ANTIMETABOLITES</h5>
                          <span className="sub-badge-dominant">DOMINANT STRATEGY · 87 PTS</span>
                        </div>
                      </div>

                      <div className="branch-proportions-fill">
                        <div className="branch-pills-bar">
                          <span>Methotrexate <em>(44)</em></span>
                          <span>Mycophenolate <em>(42)</em></span>
                          <span>Azathioprine <em>(1)</em></span>
                        </div>
                        <p className="branch-sub-note">Prior evidence indicated broadly comparable efficacy across antimetabolite agents.</p>
                      </div>

                      <div className="branch-stat-footer">
                        <small>DOMINANT CID COMPARATOR ARM</small>
                      </div>
                    </div>

                    {/* Right / Minor: 21% Calcineurin Inhibitors */}
                    <div className="branch-pane pane-minority">
                      <div className="branch-headline-row">
                        <span className="branch-massive-pct minority-pct">21%</span>
                        <div className="branch-label-stack">
                          <h5>CALCINEURIN INHIBITORS</h5>
                          <span className="sub-badge-minority">MINORITY EXPOSURE · 23 PTS</span>
                        </div>
                      </div>

                      {/* State 1 high-level question cue */}
                      <div className="state1-question-cue">
                        <p>CID was heterogeneous — does this 21% minority exposure matter?</p>
                      </div>

                      {/* SUB-BREAKDOWN */}
                      <div className="zoom-subdivision-box">
                        
                        {/* Tacrolimus Tier (Revealed in State 2) */}
                        <div className="zoom-tier tacrolimus-tier">
                          <div className="tac-header-line">
                            <span className="zoom-drug-title">TACROLIMUS</span>
                            <span className="zoom-drug-share">19 / 23 (83% of CNIs)</span>
                          </div>
                          <p className="tac-evidence-note">Prior evidence for tacrolimus was mixed; evidence for cyclosporine suggested potentially lower efficacy than antimetabolites.</p>
                        </div>

                        {/* State 2 intermediate question */}
                        <div className="state2-intermediate-hook">
                          <strong>COULD THE WEAKER COMPONENT HAVE DISADVANTAGED CID?</strong>
                        </div>

                        {/* Cyclosporine Tier (Hero in State 3) */}
                        <div className="zoom-tier cyclosporine-tier">
                          <div className="csa-inner-card">
                            <div className="csa-text-col">
                              <span className="csa-name">CYCLOSPORINE</span>
                              <span className="csa-sub-n">Only 4 patients assigned</span>
                            </div>
                            <div className="csa-pct-badge">
                              <span className="csa-red-num">4%</span>
                              <span className="csa-red-sub">OF TOTAL CID</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* THE CONCERN ANNOTATION (State 3) */}
                      <div className="concern-callout-bracket">
                        <div className="concern-tag-row">
                          <span className="concern-dot" />
                          <strong className="concern-label">THE CONCERN</strong>
                        </div>
                        <p className="concern-flow-text">
                          Potentially lower efficacy <span className="concern-arrow">→</span> weaker CID comparator <span className="concern-arrow">→</span> exaggerated ADA advantage?
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* 3. CONVERGING COUNTEREVIDENCE ANCHORS (State 4) */}
                  <div className="anatomy-convergence-row">
                    <div className="evidence-anchor-item">
                      <div className="anchor-num-head">
                        <span className="anchor-index">01</span>
                        <span className="anchor-metric">ONLY 4%</span>
                      </div>
                      <p className="anchor-desc">Cyclosporine was assigned to only 4% of participants.</p>
                    </div>

                    <div className="convergence-divider-line" aria-hidden="true">
                      <span className="convergence-arrow">↓</span>
                    </div>

                    <div className="evidence-anchor-item">
                      <div className="anchor-num-head">
                        <span className="anchor-index">02</span>
                        <span className="anchor-metric">CONSISTENT ACROSS STRATA</span>
                      </div>
                      <p className="anchor-desc">Results were qualitatively similar across the single- and two-immunosuppressive-drug strata.</p>
                    </div>
                  </div>

                  {/* 4. FINAL RESOLUTION TAKEAWAY (State 4) */}
                  <div className="anatomy-conclusion-anchor">
                    <div className="conclusion-hook-line">
                      <strong>UNLIKELY TO EXPLAIN <span className="red-highlight-text">ADA’S ADVANTAGE</span></strong>
                    </div>
                    <p className="conclusion-sub-text">
                      Comparator heterogeneity may introduce some efficacy variation, but limited cyclosporine exposure and consistent stratum results argue against it materially explaining ADA's advantage.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="limitations-3" className="scene discussion-temporal-scene">
          <div className="adv-two-col">
            {/* LEFT COLUMN */}
            <div className="adv-left-col">
              <p className="eyebrow"><span /> 30 — DISCUSSION / TEMPORAL TRAJECTORY</p>
              <p className="red-hook">DID ADA WORK BETTER — OR JUST FASTER?</p>
              <h2>ADA got there faster.<br /><span className="red-text" style={{display: 'inline'}}>Whether CID catches up is unresolved.</span></h2>
              <p className="lede">CID used a two-step antimetabolite dose-escalation strategy. This may have modestly delayed successful corticosteroid sparing, although the protocol was designed to allow escalation within the 6-month primary-outcome window.</p>

              <div className="comp-investigation-statement">
                <div className="investigation-rule" />
                <h4>THE CENTRAL INTERPRETIVE QUESTION</h4>
                <p>The key question is therefore temporal: does ADA produce a greater ultimate treatment effect, or does it achieve the same goal sooner?</p>
              </div>
            </div>

            {/* RIGHT COLUMN — VISUAL TIMELINE & TRAJECTORY CANVAS */}
            <div className="adv-right-col temporal-trajectory-column">
              <div className="temporal-canvas-card">
                
                {/* 1. TIMELINE MILESTONE HEADER */}
                <div className="trajectory-header-bar">
                  <div className="trajectory-milestones">
                    <span className="milestone-tag">M0 RANDOMIZATION</span>
                    <span className="milestone-tag tag-escalation">M1–M3 DOSE ESCALATION</span>
                    <span className="milestone-tag tag-primary">M6 PRIMARY WINDOW</span>
                    <span className="milestone-tag tag-end">M12 TRIAL END</span>
                  </div>
                  <span className="unobserved-badge">NOT OBSERVED (&gt;12M)</span>
                </div>

                {/* 2. MAIN SVG TRAJECTORY ENGINE */}
                <div className="trajectory-svg-wrap">
                  <svg viewBox="0 0 680 180" className="trajectory-vector-chart" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="adaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4d52" stopOpacity="0.4" />
                        <stop offset="60%" stopColor="#ff4d52" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff7175" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="cidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8f67ff" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#a37eff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#b58eff" stopOpacity="1" />
                      </linearGradient>
                      <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      </pattern>
                      <filter id="adaGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="cidGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Unobserved Zone Background */}
                    <rect x="510" y="8" width="160" height="162" fill="url(#diagonalHatch)" rx="2" />
                    <rect x="510" y="8" width="160" height="162" fill="rgba(255,255,255,0.015)" rx="2" />

                    {/* Horizontal Grid lines */}
                    <line x1="30" y1="155" x2="665" y2="155" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <line x1="30" y1="95" x2="510" y2="95" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="30" y1="35" x2="510" y2="35" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" strokeWidth="1" />

                    {/* Vertical Milestone Guides */}
                    <line x1="30" y1="12" x2="30" y2="155" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    <line x1="140" y1="12" x2="140" y2="155" stroke="rgba(181,142,255,0.15)" strokeDasharray="2 3" strokeWidth="1" />
                    <line x1="280" y1="12" x2="280" y2="155" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    
                    {/* Strong Month 12 Boundary: Follow-up Ends */}
                    <line x1="510" y1="8" x2="510" y2="168" stroke="#ff4d52" strokeWidth="2" strokeDasharray="4 3" />
                    <rect x="448" y="10" width="124" height="18" fill="#120607" stroke="rgba(255,77,82,0.5)" rx="2" />
                    <text x="510" y="22" textAnchor="middle" fill="#ff7175" fontSize="8.5" fontFamily="var(--font-geist-mono)" fontWeight="700" letterSpacing="0.08em">
                      FOLLOW-UP ENDS (M12)
                    </text>

                    {/* Dose Escalation annotation box on CID */}
                    <rect x="75" y="122" width="130" height="22" fill="#0e0a17" stroke="rgba(181,142,255,0.3)" rx="2" />
                    <text x="140" y="136" textAnchor="middle" fill="#b58eff" fontSize="8" fontFamily="var(--font-geist-mono)">
                      2-STEP CID ESCALATION
                    </text>

                    {/* CID Trajectory Curve (Purple) */}
                    <path
                      d="M 30,155 C 80,152 140,138 280,92 C 370,60 440,48 510,44"
                      fill="none"
                      stroke="url(#cidGradient)"
                      strokeWidth="3.2"
                      filter="url(#cidGlow)"
                    />

                    {/* Subtle Dotted CID Extension into NOT OBSERVED */}
                    <path
                      d="M 510,44 C 555,41 605,33 638,30"
                      fill="none"
                      stroke="#b58eff"
                      strokeWidth="2"
                      strokeDasharray="3 4"
                      opacity="0.65"
                    />
                    <circle cx="648" cy="29" r="9" fill="#160e26" stroke="#b58eff" strokeWidth="1.5" />
                    <text x="648" y="32.5" textAnchor="middle" fill="#b58eff" fontSize="10" fontFamily="var(--font-geist-mono)" fontWeight="700">?</text>
                    <text x="585" y="62" textAnchor="middle" fill="#8f859a" fontSize="7.8" fontFamily="var(--font-geist-mono)" fontStyle="italic">
                      Would CID catch up?
                    </text>

                    {/* ADA Trajectory Curve (Red) */}
                    <path
                      d="M 30,155 C 100,68 180,48 280,45 C 360,43 440,32 510,28"
                      fill="none"
                      stroke="url(#adaGradient)"
                      strokeWidth="3.5"
                      filter="url(#adaGlow)"
                    />

                    {/* Milestone Dots & Data Callouts */}
                    <circle cx="30" cy="155" r="4" fill="#fff" />

                    {/* M6 Callouts */}
                    <circle cx="280" cy="45" r="4.5" fill="#ff4d52" stroke="#fff" strokeWidth="1.5" />
                    <rect x="232" y="24" width="96" height="15" fill="#1a0708" stroke="rgba(255,77,82,0.4)" rx="2" />
                    <text x="280" y="34.5" textAnchor="middle" fill="#ff8085" fontSize="8" fontFamily="var(--font-geist-mono)" fontWeight="700">
                      ADA: 69% SPARING
                    </text>

                    <circle cx="280" cy="92" r="4.5" fill="#b58eff" stroke="#fff" strokeWidth="1.5" />
                    <rect x="238" y="98" width="84" height="15" fill="#120a1f" stroke="rgba(181,142,255,0.4)" rx="2" />
                    <text x="280" y="108.5" textAnchor="middle" fill="#c7adff" fontSize="8" fontFamily="var(--font-geist-mono)" fontWeight="700">
                      CID: 54% (+15% GAP)
                    </text>

                    {/* M12 Callouts */}
                    <circle cx="510" cy="28" r="4.5" fill="#ff4d52" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="510" cy="44" r="4.5" fill="#b58eff" stroke="#fff" strokeWidth="1.5" />

                    {/* Delta indicator */}
                    <line x1="280" y1="52" x2="280" y2="85" stroke="rgba(255,255,255,0.2)" strokeDasharray="2 2" />
                    <text x="295" y="72" fill="#e0dad6" fontSize="7.5" fontFamily="var(--font-geist-mono)">Δ +15%</text>

                    <line x1="504" y1="31" x2="504" y2="41" stroke="rgba(255,255,255,0.3)" />
                    <text x="475" y="38" fill="#e0dad6" fontSize="7.5" fontFamily="var(--font-geist-mono)" textAnchor="end">Δ 9%</text>

                    {/* X Axis Labels */}
                    <text x="30" y="172" textAnchor="middle" fill="#8c827e" fontSize="8.5" fontFamily="var(--font-geist-mono)">M0</text>
                    <text x="280" y="172" textAnchor="middle" fill="#8c827e" fontSize="8.5" fontFamily="var(--font-geist-mono)">M6 (PRIMARY)</text>
                    <text x="510" y="172" textAnchor="middle" fill="#8c827e" fontSize="8.5" fontFamily="var(--font-geist-mono)">M12</text>
                    <text x="600" y="172" textAnchor="middle" fill="#ff6468" fontSize="8" fontFamily="var(--font-geist-mono)" letterSpacing="0.04em">UNOBSERVED &gt;12M</text>
                  </svg>
                </div>

                {/* 3. DUAL 12-MONTH ENDPOINT COMPARISON */}
                <div className="endpoint-comparison-grid">
                  <div className="endpoint-card card-sparing">
                    <div className="endpoint-head-row">
                      <span className="endpoint-code">ENDPOINT 01</span>
                      <strong className="endpoint-title">CORTICOSTEROID SPARING</strong>
                      <span className="endpoint-stat-pill">86% vs 77% (P = 0.077)</span>
                    </div>
                    <p className="endpoint-verdict">
                      <strong>CID appeared to be catching up to ADA by 12 months.</strong> Sparing separation narrowed from +15 points at Month 6 to +9 points at Month 12 as stepwise escalation took effect.
                    </p>
                  </div>

                  <div className="endpoint-card card-discontinuation">
                    <div className="endpoint-head-row">
                      <span className="endpoint-code code-red">ENDPOINT 02</span>
                      <strong className="endpoint-title">CORTICOSTEROID DISCONTINUATION</strong>
                      <span className="endpoint-stat-pill pill-red">55% vs 40% (P = 0.028)</span>
                    </div>
                    <p className="endpoint-verdict">
                      <strong>ADA remained ahead at 12 months.</strong> Zero-steroid success was significantly higher with ADA, and longer-term convergence beyond 12 months was not observed.
                    </p>
                  </div>
                </div>

                {/* 4. FINAL INTERPRETIVE CONCLUSION */}
                <div className="temporal-conclusion-anchor">
                  <div className="conclusion-hook-line">
                    <strong>FASTER EFFECT <span className="red-highlight-text">≠ PROVEN GREATER ULTIMATE EFFICACY</span></strong>
                  </div>
                  <p className="conclusion-sub-text">
                    ADA clearly achieved corticosteroid control more rapidly. The 12-month follow-up was insufficient to determine whether the remaining difference represented greater ultimate efficacy or persistent temporal separation.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>


        <section id="limitations-5" className="scene discussion-scene limitations-scene">
          <div className="scene-copy discussion-copy">
            <p className="eyebrow"><span /> 31 — LIMITATIONS / FOLLOW-UP</p>
            <h2>Missing follow-up.<br /><em>Tested from every angle.</em></h2>
            <p className="lede">Loss to follow-up was higher with CID, creating a potential source of bias that required careful interpretation.</p>
          </div>
          <div className="limitation-visual visual-followup" aria-hidden="true"><div className="visual-label">POTENTIAL ATTRITION BIAS</div><div className="followup-lanes"><span><b>ADA</b><i /><strong>1</strong><small>IMMEDIATE DROPOUT</small></span><span><b>CID</b><i /><strong>3</strong><small>IMMEDIATE DROPOUTS</small></span></div><p><b>8</b> treatment discontinuations — all CID</p></div>
          <div className="discussion-grid limitations-grid">
            <article className="signal-card warning-card"><span>01 / DIFFERENTIAL FOLLOW-UP</span><strong>More losses with CID</strong><p>Follow-up losses were numerically higher in the CID arm than in the ADA arm, which could bias an unmasked comparative trial.</p><i /></article>
            <article className="signal-card"><span>02 / IMMEDIATE DROPOUT</span><strong>Assignment preference may matter</strong><p>Some participants may have wanted the newer treatment: three CID participants versus one ADA participant dropped out immediately after randomization.</p><i /></article>
            <article className="signal-card"><span>03 / TOXICITY</span><strong>All treatment discontinuations were CID</strong><p>Drug toxicity may also have contributed: all eight participants who discontinued assigned treatment were in the CID group.</p><i /></article>
            <article className="signal-card"><span>04 / ROBUSTNESS</span><strong>Findings were consistent</strong><p>Results remained consistent across multiple analyses built on different assumptions about missing data, making major distortion from dropout unlikely.</p><i /></article>
          </div>
          <p className="discussion-footnote">Differential dropout remains a limitation, but sensitivity analyses did not suggest that it substantially changed the trial conclusions.</p>
        </section>

        <section id="limitations-6" className="scene discussion-scene limitations-scene">
          <div className="scene-copy discussion-copy">
            <p className="eyebrow"><span /> 32 — LIMITATIONS / IMMUNOGENICITY</p>
            <h2>One unanswered<br /><em>antibody question.</em></h2>
            <p className="lede">The study did not measure anti-adalimumab antibodies, leaving an important question about durability of response unresolved.</p>
          </div>
          <div className="limitation-visual visual-antibody" aria-hidden="true"><div className="visual-label">UNMEASURED IMMUNOGENICITY</div><div className="ada-molecule"><b>ADA</b><i /><i /><i /><i /></div><div className="antibody-note"><strong>78%</strong><span>NO BASELINE<br />IMMUNOSUPPRESSION</span></div><p>ANTIBODIES NOT MEASURED · NO SAMPLES BANKED</p></div>
          <div className="discussion-grid limitations-grid">
            <article className="signal-card warning-card"><span>01 / POST-TRIAL EVIDENCE</span><strong>Anti-adalimumab antibodies can matter</strong><p>Case series in uveitis have since described anti-adalimumab antibodies, which may lower circulating drug levels and contribute to loss of efficacy.</p><i /></article>
            <article className="signal-card"><span>02 / MONOTHERAPY CONTEXT</span><strong>Most began without IMT</strong><p>At baseline, 78% of participants were not receiving immunosuppression. In the ADA arm, these participants received adalimumab alone.</p><i /></article>
            <article className="signal-card"><span>03 / COMBINATION THERAPY</span><strong>A second agent may help</strong><p>Several case series suggest a lower occurrence of anti-adalimumab antibodies when a second immunosuppressive agent is used, but this remains unresolved.</p><i /></article>
            <article className="signal-card"><span>04 / DATA GAP</span><strong>Not measured or banked</strong><p>ADVISE neither measured anti-adalimumab antibodies nor banked blood specimens for later testing. Additional data are needed before changing practice.</p><i /></article>
          </div>
          <p className="discussion-footnote">Whether adalimumab monotherapy should be minimized to reduce immunogenicity is an important question for future uveitis studies.</p>
        </section>

        <section id="discussion" className="scene discussion-scene primary-efficacy-discussion">
          <div className="scene-copy primary-efficacy-copy">
            <p className="eyebrow"><span /> 33 — DISCUSSION</p>
            <h2>Earlier control.<br /><em>Similar destination.</em></h2>
            <p className="lede">ADA achieved successful corticosteroid sparing faster; by 12 months the gap narrowed. Successful corticosteroid discontinuation remained higher with ADA.</p>
          </div>

          <section className="efficacy-comparisons" aria-label="Temporal efficacy comparisons">
            <article className="efficacy-chart efficacy-sparing">
              <header><span>SUCCESSFUL CORTICOSTEROID SPARING</span><small><i className="ada-key" /> ADA <i className="cid-key" /> CID</small></header>
              <div className="efficacy-plot">
                <svg viewBox="0 0 600 160" role="img" aria-label="Corticosteroid sparing was 69 percent versus 54 percent at 6 months and 86 percent versus 77 percent at 12 months.">
                  <path className="plot-axis" d="M38 132H565 M38 17V132" />
                  <path className="plot-guide" d="M300 20V132 M550 20V132" />
                  <path className="plot-ada" d="M38 132 L300 56 L550 28" />
                  <path className="plot-cid" d="M38 132 L300 73 L550 40" />
                  <circle className="plot-ada-point" cx="300" cy="56" r="6" /><circle className="plot-cid-point" cx="300" cy="73" r="6" />
                  <circle className="plot-ada-point" cx="550" cy="28" r="5" /><circle className="plot-cid-point" cx="550" cy="40" r="5" />
                </svg>
                <span className="plot-zero">0%</span><span className="plot-six-label">6 MONTHS</span><span className="plot-twelve-label">12 MONTHS</span>
                <div className="timepoint timepoint-six emphasis"><b>6 MONTHS</b><span><em>ADA</em> 69%</span><span><i>CID</i> 54%</span><small>P=0.029</small></div>
                <div className="timepoint timepoint-twelve"><b>12 MONTHS</b><span><em>ADA</em> 86%</span><span><i>CID</i> 77%</span><small>P=0.077</small></div>
              </div>
            </article>

            <article className="efficacy-chart efficacy-discontinuation">
              <header><span>SUCCESSFUL CORTICOSTEROID DISCONTINUATION</span><small><i className="ada-key" /> ADA <i className="cid-key" /> CID</small></header>
              <div className="efficacy-plot">
                <svg viewBox="0 0 600 160" role="img" aria-label="Corticosteroid discontinuation was 15 percent versus 11 percent at 6 months and 55 percent versus 40 percent at 12 months.">
                  <path className="plot-axis" d="M38 132H565 M38 17V132" />
                  <path className="plot-guide" d="M300 20V132 M550 20V132" />
                  <path className="plot-ada" d="M38 132 L300 106 L550 61" />
                  <path className="plot-cid" d="M38 132 L300 113 L550 82" />
                  <circle className="plot-ada-point" cx="300" cy="106" r="5" /><circle className="plot-cid-point" cx="300" cy="113" r="5" />
                  <circle className="plot-ada-point" cx="550" cy="61" r="6" /><circle className="plot-cid-point" cx="550" cy="82" r="6" />
                </svg>
                <span className="plot-zero">0%</span><span className="plot-six-label">6 MONTHS</span><span className="plot-twelve-label">12 MONTHS</span>
                <div className="timepoint timepoint-six"><b>6 MONTHS</b><span><em>ADA</em> 15%</span><span><i>CID</i> 11%</span><small>P=0.30</small></div>
                <div className="timepoint timepoint-twelve emphasis"><b>12 MONTHS</b><span><em>ADA</em> 55%</span><span><i>CID</i> 40%</span><small>P=0.028</small></div>
              </div>
            </article>
          </section>

          <footer className="efficacy-takeaway"><i aria-hidden="true"><b /></i><p>ADA&apos;s clearest advantage was <em>rapidity</em> of corticosteroid control; CID appeared to catch up for sparing by 12 months, although <strong>discontinuation still favored ADA.</strong></p></footer>
        </section>
        <section id="conclusion" className="scene conclusion-scene">
          <div className="final-eye" aria-hidden="true"><div className="final-horizon" /><div className="final-pupil"><i /></div><span /><span /></div>
          <div className="scene-copy conclusion-copy">
            <p className="eyebrow"><span /> 34 — CONCLUSION</p>
            <h2>Control the inflammation.<br /><em>Release the steroid.</em></h2>
            <p className="lede">Both strategies were effective. Adalimumab delivered faster corticosteroid-sparing control at 6 months and enabled more patients to discontinue corticosteroids by 12 months.</p>
            <blockquote>For shared clinical decisions, the choice is no longer simply “does it work?”—but <b>how quickly, by which route, and at what trade-off?</b></blockquote>
            <div className="citation">ADVISE Trial Research Group · Ophthalmology, Vol. 133, Issue 3 · NCT03828019</div>
            <button className="restart" onClick={() => goTo(0)}>↻ Restart story</button>
          </div>
        </section>

        <section id="outcomes-original" className="scene outcomes-original-scene">
          <div className="scene-copy outcomes-copy">
            <p className="eyebrow"><span /> 35 — METHODOLOGY / OUTCOMES</p>
            <h2>Define success.<br /><em>Then measure it.</em></h2>
          </div>

          <section className="endpoint-stage" aria-label="Primary outcome by 6 months">
            <div className="endpoint-time" aria-hidden="true"><strong>6</strong><span>MONTHS</span><i /></div>
            <div className="endpoint-message">
              <div className="endpoint-label"><span>PRIMARY OUTCOME</span></div>
              <h3>Successful corticosteroid sparing</h3>
              <p>Success required all three signals—sustained together.</p>
              <div className="endpoint-equation">
                <div><b>01</b><span>INACTIVE<br />UVEITIS</span></div><i>+</i>
                <div><b>02</b><span>PREDNISONE<br /><strong>≤7.5 MG/DAY</strong></span></div><i>+</i>
                <div><b>03</b><span>2 CONSECUTIVE VISITS<br /><strong>≥28 DAYS APART</strong></span></div>
              </div>
            </div>
          </section>

          <section className="secondary-spectrum" aria-label="Secondary outcomes">
            <div className="spectrum-label"><span>SECONDARY OUTCOMES</span></div>
            <div className="spectrum-track">
              <div><i /><b>STEROID SPARING</b><span>By 1 year</span></div>
              <div><i /><b>OFF STEROID</b><span>Inactive · 2 visits · ≥28 days</span></div>
              <div><i /><b>BCVA</b><span>Visual function</span></div>
              <div><i /><b>INFECTION</b><span>Incidence</span></div>
              <div><i /><b>SAFETY</b><span>Adverse + serious events</span></div>
              <div><i /><b>QOL</b><span>Patient-reported</span></div>
            </div>
          </section>

          <section className="definition-band" aria-label="Disease-specific definition of inactive uveitis">
            <div className="definition-heading">
              <span>DEFINITION OF INACTIVE UVEITIS</span>
              <span>DISEASE-SPECIFIC CRITERIA</span>
            </div>
            <div className="clinical-thresholds">
              <div><span>AC CELLS</span><b>GRADE 0</b><small>Anterior / intermediate / panuveitis</small></div>
              <div><span>VITREOUS HAZE</span><b>GRADE 0</b><small>Intermediate / posterior / panuveitis</small></div>
            </div>
            <div className="imaging-thresholds">
              <div><span>BIRDSHOT</span><b>VISUAL FIELDS</b><small>Stable or improved</small></div>
              <div><span>CHORIORETINITIS</span><b>FAF</b><small>No lesion-related hyper-AF</small></div>
              <div><span>EARLY VKH</span><b>OCT</b><small>No subretinal fluid</small></div>
              <div><span>RETINAL VASCULITIS</span><b>FFA</b><small>No increased non-perfusion, leakage, or staining</small></div>
            </div>
          </section>
        </section>

        <section id="statistics" className="scene statistics-scene">
          <div className="scene-copy statistics-copy">
            <p className="eyebrow"><span /> 36 — METHODOLOGY / STATISTICS</p>
            <h2>Power the comparison.<br /><em>Model the journey.</em></h2>
          </div>

          <section className="sample-size-story" aria-label="Sample size calculation">
            <header>
              <span>SAMPLE SIZE</span><small>PRIMARY OUTCOME · 6-MONTH CORTICOSTEROID SPARING</small>
              <button onClick={() => setCalcCycle((cycle) => cycle + 1)} aria-label="Replay sample-size calculation">↻</button>
            </header>
            <div key={calcCycle} className="sample-calculation">
              <div className="calc-parameter calc-alpha"><strong>α 0.0492</strong><span>TWO-SIDED</span></div>
              <div className="calc-parameter calc-power"><strong>90%</strong><span>POWER</span></div>
              <div className="calc-parameter calc-loss"><strong>10%</strong><span>LOSS ALLOWANCE</span></div>
              <div className="calc-input calc-ada"><span>ADA EXPECTED</span><strong>75%</strong></div>
              <div className="calc-track calc-track-left"><b>75%</b></div>
              <div className="calc-core"><strong>222</strong><span>PARTICIPANTS</span></div>
              <div className="calc-track calc-track-right"><b>51%</b></div>
              <div className="calc-input calc-cid"><span>CID EXPECTED</span><strong>51%</strong><small>75% × 55% + 25% × 40%</small></div>
              <div className="calc-note calc-interim"><strong>40%</strong><span>INTERIM INFORMATION · STOPPING α 0.008</span></div>
              <div className="calc-split"><b>111 <i>ADA</i></b><b>111 <i>CID</i></b></div>
              <div className="calc-note calc-secondary"><strong>80%</strong><span>POWER FOR DISCONTINUATION · 1 Y</span></div>
            </div>
          </section>

          <section className="analysis-map" aria-label="Statistical analysis strategy">
            <header><span>ANALYSIS</span><strong>AS RANDOMIZED</strong></header>
            <div className="analysis-selector" role="tablist" aria-label="Select an analysis type">
              {analysisMethods.map((method, index) => (
                <button
                  key={method.code}
                  className={selectedAnalysis === index ? "active" : ""}
                  onClick={() => setSelectedAnalysis(index)}
                  role="tab"
                  aria-selected={selectedAnalysis === index}
                >
                  <i />{method.code}
                </button>
              ))}
            </div>
            <div key={selectedAnalysis} className="analysis-display" role="tabpanel">
              <i className="analysis-scan" aria-hidden="true" />
              <div className="analysis-outcome">
                <span>01 / OUTCOME</span><strong>{analysisMethods[selectedAnalysis].outcome}</strong>
                {analysisMethods[selectedAnalysis].note && <small>{analysisMethods[selectedAnalysis].note}</small>}
              </div>
              <div><span>02 / MODEL</span><strong>{analysisMethods[selectedAnalysis].model}</strong></div>
              <div className={analysisMethods[selectedAnalysis].details ? "analysis-specification" : ""}>
                <span>03 / MODEL SPECIFICATION</span>
                <strong>{analysisMethods[selectedAnalysis].reason}</strong>
                {analysisMethods[selectedAnalysis].details && (
                  <dl>
                    {analysisMethods[selectedAnalysis].details.map(([type, included]) => (
                      <div key={type}><dt>{type}</dt><dd>{included}</dd></div>
                    ))}
                  </dl>
                )}
                {analysisMethods[selectedAnalysis].specNote && <small className="analysis-spec-note">{analysisMethods[selectedAnalysis].specNote}</small>}
              </div>
            </div>
            <footer>
              <span>Sensitivity analyses assessed missingness.</span>
              <span>Secondary-outcome P values were nominal.</span>
            </footer>
          </section>
        </section>

        <section id="sample-size-redesign" className="scene sample-size-redesign-scene">
          <div className="scene-copy primary-outcome-redesign-copy sample-size-redesign-copy">
            <p className="eyebrow"><span /> 37 — METHODOLOGY / SAMPLE SIZE</p>
            <h2>Power the comparison.<br /><em>Size the trial.</em></h2>
          </div>

          <section key={sampleSizeCycle} className="sample-size-argument" aria-label="Sample size calculation">
            <span className="sample-size-micro-label">SAMPLE SIZE</span>
            <div className="sample-size-rate sample-size-rate-ada"><span>ADA EXPECTED PRIMARY OUTCOME</span><strong>75%</strong></div>
            <div className="sample-size-rate sample-size-rate-cid"><span>CID EXPECTED PRIMARY OUTCOME</span><strong>51%</strong></div>
            <div className="sample-size-convergence" aria-hidden="true"><i /><i /><b>24 PERCENTAGE-POINT EXPECTED DIFFERENCE</b></div>
            <div className="sample-size-hero"><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><strong>222</strong><span>PARTICIPANTS</span></div>
            <div className="sample-size-assumptions" aria-label="Statistical assumptions"><span>α 0.0492 · TWO-SIDED</span><span>90% POWER</span><span>10% LOSS ALLOWANCE</span></div>
          </section>
        </section>
      </main>
    </>
  );
}
