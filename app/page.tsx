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
  { id: "followup", label: "Follow-up" },
  { id: "outcomes", label: "Outcomes" },
  { id: "statistics", label: "Statistical analysis" },
  { id: "quality-assurance", label: "Quality assurance" },
  { id: "participant-flow", label: "Participant flow" },
  { id: "baseline-portrait", label: "Baseline cohort portrait" },
  { id: "treatment-results", label: "Treatments received" },
  { id: "results", label: "Corticosteroid sparing" },
  { id: "discontinuation", label: "Corticosteroid discontinuation" },
  { id: "advancement", label: "Immunosuppression advancement" },
  { id: "ocular-results", label: "Visual and macular outcomes" },
  { id: "discussion", label: "Discussion" },
  { id: "conclusion", label: "Conclusion" },
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
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedStratum, setSelectedStratum] = useState(0);
  const [calcCycle, setCalcCycle] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState(0);
  const [qaFocus, setQaFocus] = useState(0);
  const [cohortCycle, setCohortCycle] = useState(0);
  const [treatmentPhase, setTreatmentPhase] = useState(0);
  const [efficacyFocus, setEfficacyFocus] = useState(0);
  const [efficacyStoryStage, setEfficacyStoryStage] = useState(5);
  const [discontinuationFocus, setDiscontinuationFocus] = useState(1);
  const [discontinuationStoryStage, setDiscontinuationStoryStage] = useState(5);

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
        event.preventDefault();
        goTo(Math.min(active + 1, chapters.length - 1));
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
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
  }, [active]);

  useEffect(() => {
    if (chapters[active]?.id !== "results") return;
    setEfficacyStoryStage(0);
    setEfficacyFocus(2);
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
            <p className="eyebrow"><span /> A NEW CLINICAL SIGNAL</p>
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
            <p className="eyebrow"><span /> 01 — BASIC KNOWLEDGE</p>
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
            <p className="eyebrow"><span /> 02 — THE RESEARCH QUESTION</p>
            <h2>Two proven paths.<br /><em>One missing comparison.</em></h2>
            <p className="lede">Adalimumab was known to delay relapse versus placebo. Conventional antimetabolites and calcineurin inhibitors were standard care. Their head-to-head effectiveness was unknown.</p>
            <div className="research-question">Which approach achieves steroid-sparing control sooner?</div>
          </div>
        </section>

        <section id="study-design" className="scene design-scene">
          <div className="scene-copy design-copy">
            <p className="eyebrow"><span /> 03 — METHODOLOGY / STUDY DESIGN</p>
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

        <section id="followup" className="scene followup-scene">
          <div className="scene-copy followup-copy">
            <p className="eyebrow"><span /> 09 — METHODOLOGY / FOLLOW-UP</p>
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

        <section id="outcomes" className="scene outcomes-scene">
          <div className="scene-copy outcomes-copy">
            <p className="eyebrow"><span /> 10 — METHODOLOGY / OUTCOMES</p>
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
            <p className="eyebrow"><span /> 11 — METHODOLOGY / STATISTICS</p>
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
              <div className="calc-core">
                <strong>222</strong><span>PARTICIPANTS</span>
              </div>
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

        <section id="quality-assurance" className="scene qa-scene">
          <div className="scene-copy qa-copy">
            <p className="eyebrow"><span /> 12 — METHODOLOGY / QUALITY ASSURANCE</p>
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
            <p className="eyebrow"><span /> 13 — RESULTS / PARTICIPANT FLOW</p>
            <h2>338 screened.<br /><em>227 randomized.</em></h2>
            <p className="lede">From eligibility assessment to the 12-month close-out, every participant is accounted for.</p>
            <div className="flow-duration"><span>STUDY ENROLLMENT</span><strong>SEPTEMBER 2019</strong><i /><strong>SEPTEMBER 2023</strong></div>
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
            <p className="eyebrow"><span /> 15 — RESULTS / BASELINE COHORT</p>
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
              <div className="uveitis-duration-signal"><span>DURATION OF UVEITIS (YRS)*</span><strong>0.9 <small>(0.3—3.9)</small></strong></div>
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

        <section id="treatment-results" className="scene treatment-results-scene">
          <div className="scene-copy treatment-results-copy">
            <p className="eyebrow"><span /> 16 — RESULTS / TREATMENTS</p>
            <h2>Therapy assigned.<br /><em>Treatment evolved.</em></h2>
            <p className="lede">Most participants entered on corticosteroids. Randomization determined the new immunosuppressive strategy; follow-up determined how far treatment needed to advance.</p>
          </div>

          <section className="table2-board" aria-label="Summary of Table 2 treatments at baseline and after randomization">
            <div className="table2-matrix">
              <header>
                <span>TABLE 2 · TREATMENT PROFILE</span>
                <div role="group" aria-label="Select treatment phase">
                  {treatmentTables.map((phase, index) => <button key={phase.label} className={treatmentPhase === index ? "active" : ""} onClick={() => setTreatmentPhase(index)}>{phase.label}</button>)}
                </div>
              </header>
              <div key={treatmentPhase} className="table2-data" role="table">
                <div className="table2-head" role="row"><span>VARIABLE · N (%)</span><b>TOTAL</b><b>ADA</b><b>CID</b></div>
                {treatmentTables[treatmentPhase].rows.map((row) => (
                  <div className="table2-row" role="row" key={row[0]}><span role="rowheader">{row[0]}</span><strong>{row[1]}</strong><strong>{row[2]}</strong><strong>{row[3]}</strong></div>
                ))}
                <footer><span>DRUG MIX</span>{treatmentTables[treatmentPhase].mix.map((drug) => <b key={drug}>{drug}</b>)}</footer>
              </div>
            </div>

            <aside className="prednisone-exposure" aria-label="Prednisone exposure by treatment group">
              <header><span>PREDNISONE EXPOSURE</span><small>MEAN DAILY DOSE · ENTIRE TRIAL</small></header>
              <div className="exposure-row ada-exposure"><span>ADA</span><strong>11.8 <i>mg/day</i></strong><div><i /></div><small>95% CI 10.5–13.2</small></div>
              <div className="exposure-row cid-exposure"><span>CID</span><strong>13.8 <i>mg/day</i></strong><div><i /></div><small>95% CI 12.3–15.4</small></div>
              <div className="cumulative-dose"><article><span>ADA · 1 YEAR</span><strong>4.31 g</strong></article><article><span>CID · 1 YEAR</span><strong>5.04 g</strong></article></div>
              <p>IRR 0.86 · 95% CI 0.73–1.01 · P = 0.061</p>
              <div className="month12-dose"><span>AT 12 MONTHS</span><strong>7.5 mg/day</strong><small>median in both groups still receiving prednisone</small></div>
            </aside>

            <footer className="treatment-followup">
              <article><span>SECOND DRUG ADDED</span><strong><b>41%</b> ADA monotherapy <i>vs</i> <b>29%</b> CID monotherapy</strong><small>HR 1.68 · P = 0.06</small></article>
              <article><span>CID DOSE ADVANCEMENT</span><strong><b>66%</b> escalated their antimetabolite</strong><small>56 / 85 participants · MTX 74% · MMF 61%</small></article>
              <article><span>REGIONAL CORTICOSTEROID</span><strong><b>27</b> ADA injections <i>vs</i> <b>25</b> CID injections</strong><small>ADA: 19 eyes / 13 people · CID: 20 eyes / 13 people</small></article>
            </footer>
          </section>
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
            <p className="eyebrow"><span /> 17 — RESULTS / EFFICACY</p>
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
            <p className="eyebrow"><span /> 18 — RESULTS / CORTICOSTEROID DISCONTINUATION</p>
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
          <div className="scene-copy advancement-copy">
            <p className="eyebrow"><span /> 19 — RESULTS / IMMUNOSUPPRESSION ADVANCEMENT</p>
            <h2>Same starting point.<br /><em>Different next step.</em></h2>
            <p className="lede">Among participants with no immunosuppressive drug at baseline, advancement occurred less often with ADA.</p>
          </div>

          <section className="advancement-stage" aria-label="Immunosuppression advancement among participants with no baseline immunosuppressive drug">
            <header className="advancement-origin">
              <span>NO IMMUNOSUPPRESSION AT BASELINE</span>
              <strong>FIRST ADVANCEMENT AFTER RANDOMIZATION</strong>
            </header>

            <div className="advancement-arms">
              <article className="advancement-arm ada-advancement">
                <header><span>ADA ARM</span><b>ADA ONLY</b></header>
                <div className="advancement-route"><i /><span>IF ADVANCEMENT NEEDED</span><i /></div>
                <strong>ADD A SECOND AGENT</strong>
                <footer><b>37</b><span>participants with ≥1 advancement</span></footer>
              </article>

              <article className="advancement-arm cid-advancement">
                <header><span>CID ARM</span><b>START ANTIMETABOLITE</b></header>
                <div className="advancement-route"><i /><span>IF ADVANCEMENT NEEDED</span><i /></div>
                <strong>ESCALATE THE DOSE</strong>
                <footer><b>60</b><span>participants with ≥1 advancement</span></footer>
              </article>
            </div>

            <aside className="advancement-effect">
              <span>TIME TO ≥1 ADVANCEMENT</span>
              <strong><small>HR</small> 0.38</strong>
              <div><b>95% CI 0.25–0.57</b><em>P &lt; 0.001</em></div>
              <p>The contrast may reflect both protocol-defined first steps and differential treatment efficacy.</p>
            </aside>
          </section>
        </section>

        <section id="ocular-results" className="scene ocular-results-scene">
          <div className="scene-copy ocular-results-copy">
            <p className="eyebrow"><span /> 20 — RESULTS / VISUAL &amp; MACULAR OUTCOMES</p>
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
              <header><span>MACULAR EDEMA</span><small>ODDS VERSUS BASELINE · LOWER IS BETTER</small></header>
              <div className="edema-months">
                <section>
                  <span>6 MONTHS</span>
                  <div className="edema-orbits"><i style={{ "--edema": ".46" } as React.CSSProperties}><b>ADA</b><strong>0.46</strong></i><i style={{ "--edema": ".76" } as React.CSSProperties}><b>CID</b><strong>0.76</strong></i></div>
                  <p>Ratio of ORs <b>0.60</b> · P = 0.027</p>
                </section>
                <section>
                  <span>12 MONTHS</span>
                  <div className="edema-orbits"><i style={{ "--edema": ".34" } as React.CSSProperties}><b>ADA</b><strong>0.34</strong></i><i style={{ "--edema": ".63" } as React.CSSProperties}><b>CID</b><strong>0.63</strong></i></div>
                  <p>Ratio of ORs <b>0.55</b> · P = 0.028</p>
                </section>
              </div>
              <footer>Both groups improved further by month 12.</footer>
            </article>
          </section>
        </section>

        <section id="discussion" className="scene discussion-scene">
          <div className="scene-copy discussion-copy">
            <p className="eyebrow"><span /> 21 — DISCUSSION</p>
            <h2>Speed matters.<br /><em>So does nuance.</em></h2>
            <p className="lede">Adalimumab reached steroid-sparing control faster. By 12 months, conventional therapy was catching up—suggesting a difference in rapidity, not necessarily ultimate efficacy.</p>
          </div>
          <div className="discussion-grid">
            <article className="signal-card"><span>01 / VELOCITY</span><strong>Faster control</strong><p>Time to successful steroid sparing favored adalimumab: HR 1.39; P = 0.032.</p><i /></article>
            <article className="signal-card"><span>02 / VISION</span><strong>Both preserved vision</strong><p>Good visual acuity was maintained in both groups with modest gains.</p><i /></article>
            <article className="signal-card"><span>03 / SAFETY</span><strong>Generally well tolerated</strong><p>Infection and hospitalization rates did not differ significantly.</p><i /></article>
            <article className="signal-card warning-card"><span>04 / LIMITS</span><strong>Interpret with care</strong><p>Unmasked treatment, heterogeneous conventional regimens, and differential loss to follow-up.</p><i /></article>
          </div>
          <p className="discussion-footnote">Notable signals: treatment intolerance occurred only in the CID arm (8 participants); liver enzyme elevation was more frequent with CID (10% vs 2%).</p>
        </section>

        <section id="conclusion" className="scene conclusion-scene">
          <div className="final-eye" aria-hidden="true"><div className="final-horizon" /><div className="final-pupil"><i /></div><span /><span /></div>
          <div className="scene-copy conclusion-copy">
            <p className="eyebrow"><span /> 22 — CONCLUSION</p>
            <h2>Control the inflammation.<br /><em>Release the steroid.</em></h2>
            <p className="lede">Both strategies were effective. Adalimumab delivered faster corticosteroid-sparing control at 6 months and enabled more patients to discontinue corticosteroids by 12 months.</p>
            <blockquote>For shared clinical decisions, the choice is no longer simply “does it work?”—but <b>how quickly, by which route, and at what trade-off?</b></blockquote>
            <div className="citation">ADVISE Trial Research Group · Ophthalmology, Vol. 133, Issue 3 · NCT03828019</div>
            <button className="restart" onClick={() => goTo(0)}>↻ Restart story</button>
          </div>
        </section>
      </main>
    </>
  );
}
