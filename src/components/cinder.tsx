import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITIES, CITY_KEY, loadCity, type CityId } from "@/lib/cinder-cities";
import { CinderGame, loadBest, MUTE_KEY, type Phase, type RunStats } from "@/lib/cinder-game";
import { cn } from "@/lib/utils";

type Card = RunStats & { show: boolean };

export function Cinder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<CinderGame | null>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const comboRef = useRef<HTMLSpanElement>(null);
  const paceRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLParagraphElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [city, setCity] = useState<CityId>("default");
  const [card, setCard] = useState<Card>({
    score: 0,
    best: 0,
    peak: 1,
    fresh: false,
    embers: 0,
    meters: 0,
    road: "The line",
    city: "Default",
    show: false,
  });

  useEffect(() => {
    const storedBest = loadBest(localStorage);
    const storedMute = localStorage.getItem(MUTE_KEY) === "1";
    const storedCity = loadCity(localStorage);
    setBest(storedBest);
    setMuted(storedMute);
    setCity(storedCity);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const game = new CinderGame({ best: storedBest, muted: storedMute, reduced, city: storedCity });
    gameRef.current = game;
    game.onPhase = (next, stats) => {
      setPhase(next);
      setBest(stats.best);
      setCard({ ...stats, show: next === "dead" });
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fit = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      game.resize(cssW, cssH, dpr);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas.parentElement ?? canvas);

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      game.step(dt);
      game.draw(ctx, canvas.clientWidth, canvas.clientHeight);
      if (scoreRef.current) scoreRef.current.textContent = String(Math.floor(game.score));
      if (comboRef.current) {
        comboRef.current.textContent = game.combo > 1 ? `×${game.combo}` : "×1";
      }
      if (paceRef.current) paceRef.current.textContent = game.paceLabel();
      if (roadRef.current) {
        const note = game.roadNote();
        roadRef.current.textContent = note ? `${game.roadName()} — ${note}` : game.roadName();
      }
      if (barRef.current) {
        const pace = Math.min(1, game.distance / 7200);
        barRef.current.style.width = `${Math.round(pace * 100)}%`;
      }
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target instanceof HTMLButtonElement) return;
      const jump = event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW";
      const slide = event.code === "ArrowDown" || event.code === "KeyS";
      const pause = event.code === "Escape" || event.code === "KeyP";
      if (!jump && !slide && !pause) return;
      if (event.type === "keydown" && event.repeat) return;
      event.preventDefault();
      game.key(event.code, event.type === "keydown");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      gameRef.current = null;
    };
  }, []);

  const play = () => gameRef.current?.start();

  const pickCity = (id: CityId) => {
    setCity(id);
    gameRef.current?.setCity(id);
    try {
      localStorage.setItem(CITY_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    gameRef.current?.setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const selected = CITIES.find((item) => item.id === city) ?? CITIES[0];

  return (
    <main className="cinder-root">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-label="Cinder endless runner"
        onPointerDown={(event) => {
          if (phase !== "run") return;
          (event.currentTarget as HTMLCanvasElement).setPointerCapture(event.pointerId);
          event.currentTarget.dataset.x = String(event.clientX);
          event.currentTarget.dataset.y = String(event.clientY);
        }}
        onPointerUp={(event) => {
          const startX = Number(event.currentTarget.dataset.x ?? event.clientX);
          const startY = Number(event.currentTarget.dataset.y ?? event.clientY);
          gameRef.current?.pointer(event.clientX - startX, event.clientY - startY, true);
        }}
      />

      <div className="cinder-hud pointer-events-none absolute inset-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="helio-panel pointer-events-auto px-4 py-3">
            <p className="text-xs font-medium tracking-caps text-muted uppercase">Score</p>
            <p className="font-mono text-2xl tabular-nums leading-none">
              <span ref={scoreRef}>0</span>
            </p>
            <p className="mt-1 text-xs text-subtle tabular-nums">Best {best}</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="helio-panel px-4 py-3 text-right">
              <p className="text-xs font-medium tracking-caps text-muted uppercase">Streak</p>
              <p className="font-display text-3xl leading-none italic">
                <span ref={comboRef}>×1</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="pointer-events-auto"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={toggleMute}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-3 max-w-xs">
          <div className="mb-1 flex items-center justify-between text-xs tracking-caps text-muted uppercase">
            <span>Pace</span>
            <span ref={paceRef}>Warm</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <div ref={barRef} className="cinder-pace h-full w-[4%] rounded-full" />
          </div>
          <p ref={roadRef} className="mt-2 max-w-xs text-xs text-subtle">
            The line
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <p className="hidden text-xs text-subtle md:block">
            Space jumps · Down slides · Tap or swipe the track
          </p>
          <p className="text-xs text-subtle md:hidden">Tap jumps · Swipe down slides</p>
        </div>
      </div>

      {phase === "ready" ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center p-4"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) play();
          }}
        >
          <section className="helio-panel panel-enter max-h-[90dvh] w-full max-w-md overflow-y-auto p-6 text-center">
            <p className="text-xs font-medium tracking-caps text-muted uppercase">Endless line</p>
            <h1 className="font-display text-5xl italic leading-none tracking-display">Cinder</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted">{selected.blurb}</p>
            <div className="cinder-cities mt-4" role="listbox" aria-label="City">
              {CITIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === city}
                  className={cn(
                    "helio-pill h-11 shrink-0 px-3 text-xs tracking-caps uppercase",
                    item.id === city && "is-active",
                  )}
                  onClick={() => pickCity(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-subtle">
              {city === "default"
                ? "Jump slag. Slide gantries."
                : "Jump potholes and oncoming cars. Slide the gantries. Streets change as you go."}
            </p>
            <Button className="mt-5 w-full" variant="primary" onClick={play}>
              Run
            </Button>
            <p className="mt-3 text-xs text-subtle tabular-nums">Best {best}</p>
          </section>
        </div>
      ) : null}

      {card.show ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-bg/40 p-4"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) play();
          }}
        >
          <section className="helio-panel panel-enter w-full max-w-md p-6 text-center" aria-label="Run over">
            <p className="text-xs font-medium tracking-caps text-muted uppercase">
              {card.fresh ? "New best" : card.city === "Default" ? "The line went cold" : card.city}
            </p>
            <h2 className="font-display text-5xl italic leading-none tracking-display">
              {card.score.toLocaleString("en-US")}
            </h2>
            <p className="mt-2 text-sm text-muted">{card.road}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-elevated px-3 py-2">
                <dt className="text-xs tracking-caps text-subtle uppercase">Best</dt>
                <dd className="mt-1 font-mono text-lg tabular-nums">{card.best.toLocaleString("en-US")}</dd>
              </div>
              <div className="rounded-xl bg-elevated px-3 py-2">
                <dt className="text-xs tracking-caps text-subtle uppercase">Peak streak</dt>
                <dd className="mt-1 font-mono text-lg tabular-nums">×{card.peak}</dd>
              </div>
            </dl>
            <Button className="mt-6 w-full" variant="primary" onClick={play}>
              Run again
            </Button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
