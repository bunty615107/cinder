import { useEffect, useState, type ComponentType } from "react";
import { Overlay } from "@/components/overlay";
import { useSim } from "@/lib/sim-store";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Observatory() {
  const [Canvas, setCanvas] = useState<ComponentType | null>(null);
  const [supported, setSupported] = useState(true);
  const ready = useSim((s) => s.ready);

  useEffect(() => {
    if (!hasWebGL()) {
      setSupported(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      useSim.getState().setPaused(true);
    }
    let live = true;
    void import("@/components/solar/canvas").then((mod) => {
      if (live) setCanvas(() => mod.SolarCanvas);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!supported) {
    return (
      <main className="flex h-dvh items-center justify-center bg-bg px-6 text-center text-fg">
        <div>
          <h1 className="font-display text-3xl italic">Helios</h1>
          <p className="mt-3 max-w-sm text-sm text-muted">
            This observatory needs WebGL to draw the solar system.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      {Canvas ? <Canvas /> : null}
      <div className="helio-vignette pointer-events-none absolute inset-0 z-[1]" />
      <Overlay />
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-bg">
          <p className="font-display text-xl italic text-muted">Calibrating…</p>
        </div>
      ) : null}
    </main>
  );
}
