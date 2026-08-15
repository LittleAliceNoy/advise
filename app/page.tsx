"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  { id: "signal", label: "The signal" },
  { id: "basics", label: "Basic knowledge" },
  { id: "question", label: "The research question" },
  { id: "method", label: "Methodology" },
  { id: "results", label: "Results" },
  { id: "discussion", label: "Discussion" },
  { id: "conclusion", label: "Conclusion" },
];

export default function Home() {
  const deckRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

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
    deck.querySelectorAll("section").forEach((section) => observer.observe(section));
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
            <span>{chapter.label}</span><i />
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
            <p className="lede">The ADVISE Trial asks which path controls sight-threatening inflammation while helping patients leave corticosteroids behind.</p>
            <button className="primary-action" onClick={() => goTo(1)}>
              Begin the story <span>↓</span>
            </button>
          </div>
          <div className="hero-meta"><span>Randomized comparative effectiveness trial</span><span>Ophthalmology · 2026</span></div>
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

        <section id="method" className="scene method-scene">
          <div className="scene-copy method-copy">
            <p className="eyebrow"><span /> 03 — METHODOLOGY</p>
            <h2>One trial.<br /><em>Two trajectories.</em></h2>
            <p className="lede">A 1:1 randomized, unmasked, parallel superiority trial in patients aged 13+ with active or recently active non-infectious uveitis.</p>
          </div>
          <div className="trial-map" aria-label="Trial design diagram">
            <div className="map-node participants"><strong>227</strong><span>participants</span></div>
            <div className="split-line"><i /></div>
            <div className="arm arm-ada"><span>n = 114</span><strong>Adalimumab</strong><small>80 mg load → 40 mg every 2 weeks</small></div>
            <div className="arm arm-cid"><span>n = 113</span><strong>Conventional</strong><small>Antimetabolite ± calcineurin inhibitor</small></div>
            <div className="outcome-node"><span>PRIMARY ENDPOINT · 6 MONTHS</span><strong>Inactive uveitis + prednisone ≤7.5 mg/day</strong><small>for 2 visits, at least 28 days apart</small></div>
          </div>
          <div className="method-stats"><div><b>26</b><span>clinical centers</span></div><div><b>3</b><span>countries</span></div><div><b>12</b><span>months follow-up</span></div></div>
        </section>

        <section id="results" className="scene results-scene">
          <div className="scene-copy results-copy">
            <p className="eyebrow"><span /> 04 — RESULTS</p>
            <h2>The earlier<br /><em>breakthrough.</em></h2>
            <p className="lede">At 6 months, adalimumab produced a significantly higher rate of successful corticosteroid sparing.</p>
            <div className="result-key"><span>Adjusted odds ratio</span><strong>1.86</strong><small>95% CI 1.06–3.25 · P = 0.029</small></div>
          </div>
          <div className="result-viz" aria-label="Comparison of successful corticosteroid sparing at 6 and 12 months">
            <div className="chart-title"><span>SUCCESSFUL CORTICOSTEROID SPARING</span><i>percentage of participants</i></div>
            <div className="bar-group">
              <span className="month">6 MO</span>
              <div className="bar-row"><span>ADA</span><div className="bar"><i style={{ "--bar": "69%" } as React.CSSProperties} /></div><strong>69%</strong></div>
              <div className="bar-row muted"><span>CID</span><div className="bar"><i style={{ "--bar": "54%" } as React.CSSProperties} /></div><strong>54%</strong></div>
            </div>
            <div className="bar-group">
              <span className="month">12 MO</span>
              <div className="bar-row"><span>ADA</span><div className="bar"><i style={{ "--bar": "86%" } as React.CSSProperties} /></div><strong>86%</strong></div>
              <div className="bar-row muted"><span>CID</span><div className="bar"><i style={{ "--bar": "77%" } as React.CSSProperties} /></div><strong>77%</strong></div>
            </div>
            <div className="off-steroid"><div className="pulse-ring"><strong>55%</strong><span>ADA</span></div><div className="pulse-ring muted-ring"><strong>40%</strong><span>CID</span></div><p>successfully discontinued corticosteroids by 12 months <b>P = 0.028</b></p></div>
          </div>
        </section>

        <section id="discussion" className="scene discussion-scene">
          <div className="scene-copy discussion-copy">
            <p className="eyebrow"><span /> 05 — DISCUSSION</p>
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
            <p className="eyebrow"><span /> 06 — CONCLUSION</p>
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
