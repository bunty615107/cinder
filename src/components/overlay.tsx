import {
  Captions,
  CaptionsOff,
  CircleHelp,
  Locate,
  Maximize,
  Minimize,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Telescope,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  BODIES,
  BODY_BY_ID,
  MOONS,
  formatAu,
  formatDayLength,
  formatDiameter,
  formatPeriod,
  formatSimClock,
  formatSimDate,
  formatSpeed,
  type BodyId,
} from "@/lib/solar-data";
import {
  SPEED_MAX,
  SPEED_MIN,
  SPEED_PRESETS,
  getSimDays,
  useSim,
} from "@/lib/sim-store";
import { labelPositions } from "@/lib/label-state";
import { cn } from "@/lib/utils";

const HOTKEYS: { code: string; id: BodyId }[] = [
  { code: "Digit0", id: "sun" },
  { code: "Digit1", id: "mercury" },
  { code: "Digit2", id: "venus" },
  { code: "Digit3", id: "earth" },
  { code: "Digit4", id: "mars" },
  { code: "Digit5", id: "jupiter" },
  { code: "Digit6", id: "saturn" },
  { code: "Digit7", id: "uranus" },
  { code: "Digit8", id: "neptune" },
];

const SHORTCUTS = [
  { keys: "Space", action: "Pause or resume" },
  { keys: "0–8", action: "Focus a world" },
  { keys: "Esc", action: "System view" },
  { keys: "L", action: "Toggle labels" },
  { keys: "T", action: "Toggle trails" },
  { keys: "R", action: "Reset the clock" },
  { keys: "G", action: "Guided tour" },
  { keys: "I / O", action: "Inner or full view" },
  { keys: "F", action: "Fullscreen" },
  { keys: "Drag / scroll", action: "Orbit and zoom" },
];

function PlanetLabels() {
  const labelsOn = useSim((s) => s.labels);
  const selectedId = useSim((s) => s.selectedId);
  const hoveredId = useSim((s) => s.hoveredId);
  const select = useSim((s) => s.select);
  const refs = useRef<Partial<Record<BodyId, HTMLButtonElement | null>>>({});

  useEffect(() => {
    if (!labelsOn) return;
    let raf = 0;
    const tick = () => {
      for (const body of BODIES) {
        const el = refs.current[body.id];
        const pos = labelPositions[body.id];
        if (!el) continue;
        if (!pos.visible) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
          el.style.transform = `translate(-50%, -100%) translate(${pos.x}px, ${pos.y}px)`;
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [labelsOn]);

  if (!labelsOn) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {BODIES.map((body) => (
        <button
          key={body.id}
          type="button"
          ref={(el) => {
            refs.current[body.id] = el;
          }}
          className={
            selectedId === body.id || hoveredId === body.id
              ? "helio-label is-active"
              : "helio-label"
          }
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "translate(-9999px, -9999px)",
            pointerEvents: "auto",
          }}
          onClick={() => select(body.id)}
        >
          {body.name}
        </button>
      ))}
    </div>
  );
}

function SimClockReadout() {
  const [days, setDays] = useState(0);
  const paused = useSim((s) => s.paused);
  const direction = useSim((s) => s.direction);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 180) {
        setDays(getSimDays());
        last = now;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <p className="font-mono text-xs tabular-nums text-muted">
        {paused ? "Paused · " : direction < 0 ? "Reverse · " : null}
        {formatSimClock(days)}
      </p>
      <p className="mt-0.5 font-mono text-xs tabular-nums text-subtle">{formatSimDate(days)}</p>
    </div>
  );
}

function PlanetList({ layout }: { layout: "rail" | "chips" }) {
  const selectedId = useSim((s) => s.selectedId);
  const hoveredId = useSim((s) => s.hoveredId);
  const select = useSim((s) => s.select);
  const setHovered = useSim((s) => s.setHovered);

  if (layout === "chips") {
    return (
      <nav
        className="helio-chips flex flex-nowrap gap-2 overflow-x-auto"
        aria-label="Solar system bodies"
      >
        {BODIES.map((body) => {
          const active = selectedId === body.id;
          return (
            <button
              key={body.id}
              type="button"
              onClick={() => select(active ? null : body.id)}
              onPointerEnter={() => setHovered(body.id)}
              onPointerLeave={() => setHovered(null)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-sm transition-[background-color,border-color,opacity] duration-150",
                active || hoveredId === body.id
                  ? "border-border bg-elevated text-fg"
                  : "border-transparent bg-surface text-muted hover:text-fg",
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: body.color }}
                aria-hidden
              />
              {body.name}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Solar system bodies">
      {BODIES.map((body) => {
        const active = selectedId === body.id;
        return (
          <button
            key={body.id}
            type="button"
            onClick={() => select(active ? null : body.id)}
            onPointerEnter={() => setHovered(body.id)}
            onPointerLeave={() => setHovered(null)}
            className={cn(
              "flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm transition-[background-color,color] duration-150",
              active || hoveredId === body.id
                ? "bg-elevated text-fg"
                : "text-muted hover:bg-elevated/70 hover:text-fg",
            )}
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: body.color }}
              aria-hidden
            />
            <span className="flex-1">{body.name}</span>
            {active ? <Locate className="size-3.5 text-subtle" aria-hidden /> : null}
          </button>
        );
      })}
    </nav>
  );
}

function InfoPanel() {
  const selectedId = useSim((s) => s.selectedId);
  const touring = useSim((s) => s.touring);
  const select = useSim((s) => s.select);
  if (!selectedId) return null;
  const body = BODY_BY_ID[selectedId];
  const moons = MOONS[body.id];

  return (
    <section
      className="helio-panel helio-sheet panel-enter pointer-events-auto w-full max-w-sm p-4 md:w-80"
      aria-label={`${body.name} dossier`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-caps text-muted uppercase">
            {touring ? "Guided tour" : body.kindLabel}
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-display">{body.name}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          aria-label="Return to system view"
          onClick={() => select(null)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs tracking-caps text-subtle uppercase">Distance</dt>
          <dd className="mt-0.5 tabular-nums text-fg">{formatAu(body.au)}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-caps text-subtle uppercase">Orbit</dt>
          <dd className="mt-0.5 tabular-nums text-fg">{formatPeriod(body.period, body.id)}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-caps text-subtle uppercase">Diameter</dt>
          <dd className="mt-0.5 tabular-nums text-fg">{formatDiameter(body.diameterKm)}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-caps text-subtle uppercase">Day length</dt>
          <dd className="mt-0.5 tabular-nums text-fg">{formatDayLength(body.rotationHours)}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-caps text-subtle uppercase">Gravity</dt>
          <dd className="mt-0.5 tabular-nums text-fg">{body.gravity}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-caps text-subtle uppercase">Temperature</dt>
          <dd className="mt-0.5 tabular-nums text-fg">{body.meanTemp}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs tracking-caps text-subtle uppercase">Composition</dt>
          <dd className="mt-0.5 text-fg">{body.composition}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-caps text-subtle uppercase">Moons</dt>
          <dd className="mt-0.5 tabular-nums text-fg">{body.moons}</dd>
        </div>
        {moons?.length ? (
          <div>
            <dt className="text-xs tracking-caps text-subtle uppercase">Shown here</dt>
            <dd className="mt-0.5 text-fg">{moons.map((m) => m.name).join(", ")}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-4 text-sm leading-snug text-muted">{body.fact}</p>
    </section>
  );
}

function HelpPanel({ onClose }: { onClose: () => void }) {
  return (
    <section
      className="helio-panel helio-sheet panel-enter pointer-events-auto w-full max-w-sm p-4 md:w-80"
      aria-label="Controls"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-caps text-muted uppercase">Controls</p>
          <h2 className="font-display text-2xl leading-tight tracking-display">How to look</h2>
        </div>
        <Button variant="ghost" size="icon" className="size-11 shrink-0" aria-label="Close help" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {SHORTCUTS.map((row) => (
          <li key={row.keys} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="helio-kbd">{row.keys}</span>
            <span className="text-muted">{row.action}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-subtle">
        Sizes and distances are compressed so every world can share the sky. A long-period comet
        traces the faint eccentric path crossing the planets.
      </p>
    </section>
  );
}

export function Overlay() {
  const paused = useSim((s) => s.paused);
  const speed = useSim((s) => s.speed);
  const direction = useSim((s) => s.direction);
  const labels = useSim((s) => s.labels);
  const trails = useSim((s) => s.trails);
  const selectedId = useSim((s) => s.selectedId);
  const touring = useSim((s) => s.touring);
  const viewPreset = useSim((s) => s.viewPreset);
  const togglePause = useSim((s) => s.togglePause);
  const setSpeed = useSim((s) => s.setSpeed);
  const toggleDirection = useSim((s) => s.toggleDirection);
  const setLabels = useSim((s) => s.setLabels);
  const setTrails = useSim((s) => s.setTrails);
  const select = useSim((s) => s.select);
  const resetTime = useSim((s) => s.resetTime);
  const setTouring = useSim((s) => s.setTouring);
  const setViewPreset = useSim((s) => s.setViewPreset);
  const [helpOpen, setHelpOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!touring) return;
    const order = BODIES;
    let i = 0;
    useSim.getState().tourFocus(order[0]!.id);
    const id = window.setInterval(() => {
      i += 1;
      if (i >= order.length) {
        useSim.getState().setTouring(false);
        useSim.getState().select(null);
        return;
      }
      useSim.getState().tourFocus(order[i]!.id);
    }, 4800);
    return () => window.clearInterval(id);
  }, [touring]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (typing) return;

      if (event.code === "Space") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (event.code === "Escape") {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (useSim.getState().touring) {
          setTouring(false);
          return;
        }
        select(null);
        return;
      }
      if (event.key === "l" || event.key === "L") {
        setLabels(!useSim.getState().labels);
        return;
      }
      if (event.key === "t" || event.key === "T") {
        setTrails(!useSim.getState().trails);
        return;
      }
      if (event.key === "r" || event.key === "R") {
        resetTime();
        return;
      }
      if (event.key === "g" || event.key === "G") {
        setTouring(!useSim.getState().touring);
        return;
      }
      if (event.key === "i" || event.key === "I") {
        setViewPreset("inner");
        return;
      }
      if (event.key === "o" || event.key === "O") {
        setViewPreset("system");
        return;
      }
      if (event.key === "f" || event.key === "F") {
        void toggleFullscreen();
        return;
      }
      if (event.key === "?" || event.key === "/") {
        setHelpOpen((open) => !open);
        return;
      }
      const hit = HOTKEYS.find((item) => item.code === event.code);
      if (hit) select(hit.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    helpOpen,
    resetTime,
    select,
    setLabels,
    setTouring,
    setTrails,
    setViewPreset,
    togglePause,
  ]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <PlanetLabels />
      <div className="helio-hud flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <header className="helio-panel pointer-events-auto px-4 py-3">
            <p className="font-display text-2xl italic leading-none tracking-display">Helios</p>
            <p className="mt-1 text-xs font-medium tracking-caps text-muted uppercase">
              Solar observatory
            </p>
            <div className="mt-2">
              <SimClockReadout />
            </div>
          </header>

          <div className="pointer-events-auto hidden md:block">
            {helpOpen ? <HelpPanel onClose={() => setHelpOpen(false)} /> : <InfoPanel />}
          </div>
        </div>

        <div className="mt-3 hidden max-w-56 pointer-events-auto md:block">
          <div className="helio-panel p-3">
            <PlanetList layout="rail" />
            <div className="mt-2 flex gap-2">
              <Button
                variant={viewPreset === "inner" ? "primary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setViewPreset("inner")}
              >
                Inner
              </Button>
              <Button
                variant={viewPreset === "system" ? "primary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setViewPreset("system")}
              >
                Full
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="pointer-events-auto md:hidden">
            {helpOpen ? <HelpPanel onClose={() => setHelpOpen(false)} /> : selectedId ? <InfoPanel /> : null}
          </div>

          <div className="pointer-events-auto md:hidden">
            <PlanetList layout="chips" />
          </div>

          <div className="helio-panel pointer-events-auto flex flex-col gap-2 p-3">
            <div className="helio-chips flex flex-nowrap items-center gap-2 overflow-x-auto">
              <Button
                variant="primary"
                size="icon"
                aria-label={paused ? "Resume simulation" : "Pause simulation"}
                onClick={togglePause}
              >
                <span className="icon-swap" aria-hidden>
                  <Pause className={paused ? "is-hidden" : "is-shown"} />
                  <Play className={paused ? "is-shown" : "is-hidden"} />
                </span>
              </Button>
              <Button variant="outline" size="icon" aria-label="Reset clock" onClick={resetTime}>
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={direction < 0 ? "Play forward" : "Play in reverse"}
                onClick={toggleDirection}
              >
                <Undo2 className={cn("size-4", direction < 0 && "text-accent")} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={labels ? "Hide labels" : "Show labels"}
                onClick={() => setLabels(!labels)}
              >
                {labels ? <Captions className="size-4" /> : <CaptionsOff className="size-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={trails ? "Hide orbital trails" : "Show orbital trails"}
                onClick={() => setTrails(!trails)}
              >
                <Orbit className={cn("size-4", trails ? "opacity-100" : "opacity-40")} />
              </Button>
              <Button
                variant={touring ? "primary" : "outline"}
                size="icon"
                aria-label={touring ? "Stop guided tour" : "Start guided tour"}
                onClick={() => setTouring(!touring)}
              >
                <Telescope className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="System view"
                onClick={() => select(null)}
              >
                <Locate className="size-4" />
              </Button>
              <Button
                variant={helpOpen ? "primary" : "outline"}
                size="icon"
                aria-label={helpOpen ? "Close help" : "Open help"}
                onClick={() => setHelpOpen((open) => !open)}
              >
                <CircleHelp className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                onClick={() => void toggleFullscreen()}
              >
                {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </Button>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <label className="shrink-0 text-xs font-medium tracking-caps text-muted uppercase">
                Speed
              </label>
              <Slider
                value={speed}
                min={SPEED_MIN}
                max={SPEED_MAX}
                step={1}
                onValueChange={setSpeed}
                aria-label="Simulation speed in days per second"
              />
              <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-fg">
                {formatSpeed(speed)}
              </span>
              <div className="hidden shrink-0 gap-1.5 sm:flex">
                {SPEED_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={cn(
                      "helio-pill h-9 px-2.5 text-xs",
                      speed === preset.value ? "is-active" : "",
                    )}
                    onClick={() => setSpeed(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    /* preview hosts may block fullscreen */
  }
}
