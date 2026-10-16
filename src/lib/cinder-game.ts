export const BEST_KEY = "cinder-best";
export const MUTE_KEY = "cinder-muted";

const DESIGN_H = 720;
const GROUND = 560;
const GRAVITY = 4300;
const JUMP_V = -980;
const PLAYER_W = 36;
const STAND_H = 78;
const SLIDE_H = 34;
const COYOTE = 0.09;
const JUMP_BUFFER = 0.1;

export type Phase = "ready" | "run" | "dead";
export type Kind = "block" | "beam" | "vent";

export type RunStats = {
  score: number;
  best: number;
  peak: number;
  fresh: boolean;
  embers: number;
  meters: number;
};

export function metersFor(distance: number): number {
  return Math.max(0, Math.floor(distance / 48));
}

type Obstacle = {
  kind: Kind;
  x: number;
  w: number;
  h: number;
  cleared: boolean;
  near: boolean;
  bob: number;
  phase: number;
};

type Pickup = {
  kind: "ember" | "shield";
  x: number;
  y: number;
  taken: boolean;
  bob: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

type Tone = {
  skyTop: string;
  skyMid: string;
  skyLow: string;
  glow: string;
  ridgeFar: string;
  ridgeNear: string;
  ground: string;
  rail: string;
  tick: string;
  block: string;
  edge: string;
  beam: string;
  lamp: string;
};

const WARM: Tone = {
  skyTop: "#100c0a",
  skyMid: "#231610",
  skyLow: "#6a3418",
  glow: "rgba(255, 140, 60, 0.28)",
  ridgeFar: "#3a241c",
  ridgeNear: "#241812",
  ground: "#14110e",
  rail: "#e7a15a",
  tick: "rgba(255, 150, 70, 0.18)",
  block: "#2c241e",
  edge: "#ff8a3d",
  beam: "#4a3c32",
  lamp: "#ffb070",
};

const HOT: Tone = {
  skyTop: "#14080c",
  skyMid: "#3a1414",
  skyLow: "#8a2a18",
  glow: "rgba(255, 70, 40, 0.34)",
  ridgeFar: "#4a201c",
  ridgeNear: "#2a1210",
  ground: "#120c0a",
  rail: "#ff6a3a",
  tick: "rgba(255, 90, 50, 0.22)",
  block: "#2a1814",
  edge: "#ff5a2a",
  beam: "#5a3028",
  lamp: "#ff7848",
};

const WHITE: Tone = {
  skyTop: "#16141a",
  skyMid: "#3a3034",
  skyLow: "#e7cbb4",
  glow: "rgba(255, 236, 220, 0.42)",
  ridgeFar: "#4a3c40",
  ridgeNear: "#241c20",
  ground: "#100e10",
  rail: "#fff1e4",
  tick: "rgba(255, 226, 206, 0.28)",
  block: "#241e22",
  edge: "#fff6ee",
  beam: "#5c5054",
  lamp: "#fff4ea",
};

function toneFor(pace: number): Tone {
  if (pace < 0.34) return WARM;
  if (pace < 0.7) return HOT;
  return WHITE;
}

type Popup = {
  x: number;
  y: number;
  text: string;
  life: number;
};

export function pace01(distance: number): number {
  return clamp(distance / 7200, 0, 1);
}

export function speedFor(distance: number): number {
  return 420 + pace01(distance) * 280;
}

export function gapFor(distance: number, rand: number): number {
  const d = pace01(distance);
  const speed = speedFor(distance);
  const react = 0.78 - d * 0.16;
  const jitter = 50 + (1 - d) * 160;
  return speed * react + rand * jitter;
}

export function loadBest(storage: Pick<Storage, "getItem"> | null): number {
  if (!storage) return 0;
  try {
    const n = Number(storage.getItem(BEST_KEY));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function saveBest(storage: Pick<Storage, "setItem"> | null, score: number): void {
  if (!storage) return;
  try {
    storage.setItem(BEST_KEY, String(Math.floor(score)));
  } catch {
    /* private mode */
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class CinderGame {
  phase: Phase = "ready";
  score = 0;
  best = 0;
  peak = 1;
  combo = 1;
  distance = 0;
  embers = 0;
  shield = 0;
  paused = false;
  muted = false;
  reduced = false;

  private viewW = 1280;
  private viewH = DESIGN_H;
  private dpr = 1;
  private scale = 1;
  private feetY = GROUND;
  private vy = 0;
  private grounded = true;
  private sliding = false;
  private slideHold = false;
  private slideLeft = 0;
  private coyote = 0;
  private jumpBuffer = 0;
  private runPhase = 0;
  private squash = 1;
  private rot = 0;
  private tumble = 0;
  private hitT = 0;
  private shake = 0;
  private flash = 0;
  private nextX = 780;
  private lastClear = -10;
  private comboLeft = 0;
  private obstacles: Obstacle[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private popups: Popup[] = [];
  private embersFx: Particle[] = [];
  private audio: AudioContext | null = null;
  private isFresh = false;
  private notifiedDead = false;
  private invuln = 0;
  private shieldPulse = 0;
  private runTime = 0;
  private tone: Tone = WARM;

  onPhase: ((phase: Phase, stats: RunStats) => void) | null = null;
  onPause: ((paused: boolean) => void) | null = null;

  constructor(opts?: { best?: number; muted?: boolean; reduced?: boolean }) {
    this.best = opts?.best ?? 0;
    this.muted = opts?.muted ?? false;
    this.reduced = opts?.reduced ?? false;
    for (let i = 0; i < 28; i++) this.embersFx.push(this.makeEmber(true));
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.viewH = DESIGN_H;
    this.scale = cssH / DESIGN_H;
    this.viewW = cssW / Math.max(0.0001, this.scale);
    this.dpr = dpr;
  }

  stats(): RunStats {
    return {
      score: Math.floor(this.score),
      best: this.best,
      peak: this.peak,
      fresh: this.isFresh,
      embers: this.embers,
      meters: metersFor(this.distance),
    };
  }

  start(): void {
    this.paused = false;
    this.onPause?.(false);
    this.resetWorld();
    this.phase = "run";
    this.notifiedDead = false;
    this.isFresh = false;
    this.onPhase?.("run", this.stats());
  }

  restart(): void {
    this.start();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  key(code: string, down: boolean): void {
    const pause = code === "Escape" || code === "KeyP";
    if (pause && down) {
      this.togglePause();
      return;
    }
    if (this.paused) {
      if (down) this.togglePause();
      return;
    }
    const jump = code === "Space" || code === "ArrowUp" || code === "KeyW";
    const slide = code === "ArrowDown" || code === "KeyS";
    if (jump && down) {
      if (this.phase === "ready") {
        this.start();
        this.jumpBuffer = JUMP_BUFFER;
      } else if (this.phase === "dead" && this.hitT > 0.45) this.restart();
      else this.jumpBuffer = JUMP_BUFFER;
    }
    if (slide) {
      this.slideHold = down;
      if (down) {
        if (this.phase === "ready") this.start();
        this.slideLeft = Math.max(this.slideLeft, 0.42);
        if (!this.grounded) this.vy = Math.max(this.vy, 980);
      }
    }
  }

  togglePause(): void {
    if (this.phase !== "run") return;
    this.paused = !this.paused;
    if (this.paused) {
      this.jumpBuffer = 0;
      this.slideHold = false;
    }
    this.onPause?.(this.paused);
  }

  pointer(dx: number, dy: number, ended: boolean): void {
    if (!ended) return;
    if (this.paused) {
      this.togglePause();
      return;
    }
    const swipeDown = dy > 42 && Math.abs(dy) > Math.abs(dx);
    if (this.phase === "ready") {
      this.start();
      if (swipeDown) this.slideLeft = 0.42;
      else this.jumpBuffer = JUMP_BUFFER;
      return;
    }
    if (this.phase === "dead") {
      if (this.hitT > 0.5) this.restart();
      return;
    }
    if (swipeDown) {
      this.slideLeft = 0.48;
      if (!this.grounded) this.vy = Math.max(this.vy, 980);
    } else {
      this.jumpBuffer = JUMP_BUFFER;
    }
  }

  step(dt: number): void {
    const t = Math.min(Math.max(dt, 0), 0.05);
    this.squash += (1 - this.squash) * Math.min(1, t * 10);
    this.shieldPulse += t;

    if (this.phase === "run" && this.paused) {
      this.tickEmbers(t * 0.2);
      this.tickParticles(t);
      this.tickPopups(t);
      return;
    }

    this.tickEmbers(t);
    this.tickParticles(t);
    this.tickPopups(t);

    if (this.phase === "ready") return;

    if (this.phase === "dead") {
      this.hitT += t;
      this.shake = this.reduced ? 0 : Math.max(0, 16 * (1 - this.hitT / 0.38));
      this.flash = Math.max(0, 1 - this.hitT / 0.22);
      this.tumble += t * 9;
      this.vy += GRAVITY * t;
      this.feetY += this.vy * t;
      if (this.feetY > GROUND) {
        this.feetY = GROUND;
        this.vy = 0;
      }
      if (!this.notifiedDead && this.hitT > 0.42) {
        this.notifiedDead = true;
        this.commitBest();
        this.onPhase?.("dead", this.stats());
      }
      return;
    }

    this.flash = Math.max(0, this.flash - t * 2.4);
    this.invuln = Math.max(0, this.invuln - t);
    this.runTime += t;
    this.runPhase += t * (9 + pace01(this.distance) * 6);
    if (this.combo > 1) {
      this.comboLeft -= t;
      if (this.comboLeft <= 0) this.combo = 1;
    }

    const speed = speedFor(this.distance);
    const slices = Math.max(1, Math.ceil((speed * t) / 12));
    const sub = t / slices;
    for (let i = 0; i < slices; i++) {
      this.distance += speed * sub;
      this.score += (speed / 430) * 14 * sub;
      this.physics(sub);
      this.collide();
      this.collect();
      if (this.phase !== "run") break;
    }
    this.spawn();
    this.cull();
  }

  draw(ctx: CanvasRenderingContext2D, cssW: number, cssH: number): void {
    const shakeX = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    const shakeY = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, shakeX, shakeY);

    this.tone = toneFor(this.phase === "ready" ? 0 : pace01(this.distance));
    this.drawSky(ctx);
    this.drawRidges(ctx);
    this.drawGround(ctx);
    for (const obs of this.obstacles) this.drawObstacle(ctx, obs);
    this.drawPickups(ctx);
    this.drawEmbers(ctx, false);
    this.drawParticles(ctx);
    this.drawTrail(ctx);
    this.drawPlayer(ctx);
    this.drawShield(ctx);
    this.drawEmbers(ctx, true);
    this.drawPopups(ctx);

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 196, 140, ${this.flash * 0.45})`;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }
  }

  private resetWorld(): void {
    this.score = 0;
    this.peak = 1;
    this.combo = 1;
    this.distance = 0;
    this.feetY = GROUND;
    this.vy = 0;
    this.grounded = true;
    this.sliding = false;
    this.slideLeft = 0;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.runPhase = 0;
    this.squash = 1;
    this.rot = 0;
    this.tumble = 0;
    this.hitT = 0;
    this.shake = 0;
    this.flash = 0;
    this.nextX = 860;
    this.lastClear = -10;
    this.comboLeft = 0;
    this.embers = 0;
    this.shield = 0;
    this.invuln = 0;
    this.shieldPulse = 0;
    this.runTime = 0;
    this.obstacles = [];
    this.pickups = [];
    this.particles = [];
    this.popups = [];
    this.seedStart();
  }

  private seedStart(): void {
    let x = 980;
    for (let i = 0; i < 4; i++) {
      const obs = this.makeObstacle(x, i === 0 ? "block" : undefined);
      this.obstacles.push(obs);
      const next = x + gapFor(i * 400, Math.random());
      this.seedPickup(obs.x + obs.w + 28, next - 28);
      x = next;
    }
    this.nextX = x;
  }

  private playerX(): number {
    return Math.max(150, this.viewW * 0.22);
  }

  private spawn(): void {
    const ahead = this.distance + this.viewW + 260;
    let guard = 0;
    while (this.nextX < ahead && guard < 8) {
      guard += 1;
      const d = pace01(this.distance);
      const last = this.obstacles[this.obstacles.length - 1]?.kind;
      const kind = this.pickKind(d, last);
      const obs = this.makeObstacle(this.nextX, kind);
      this.obstacles.push(obs);
      const gap = gapFor(this.distance, Math.random());
      this.seedPickup(obs.x + obs.w + 28, obs.x + gap - 28);
      this.nextX = obs.x + gap;
    }
  }

  private pickKind(d: number, previous?: Kind): Kind {
    const r = Math.random();
    if (previous === "beam") return r < 0.62 ? "block" : "vent";
    if (previous === "vent") return r < 0.45 ? "beam" : "block";
    if (previous === "block") return r < 0.5 ? "beam" : r < 0.78 ? "block" : "vent";
    if (r < 0.48 - d * 0.1) return "block";
    if (r < 0.78) return "beam";
    return d > 0.15 ? "vent" : "block";
  }

  private makeObstacle(x: number, kind?: Kind): Obstacle {
    const d = pace01(Math.max(0, x - 800));
    const k = kind ?? this.pickKind(d);
    if (k === "beam") {
      const bob = d > 0.4 && Math.random() < 0.62 ? rand(10, 16) : 0;
      return {
        kind: k,
        x,
        w: rand(96, 150),
        h: 22,
        cleared: false,
        near: false,
        bob,
        phase: rand(0, Math.PI * 2),
      };
    }
    if (k === "vent") {
      return {
        kind: k,
        x,
        w: rand(72, 120) + d * 36,
        h: 18,
        cleared: false,
        near: false,
        bob: 0,
        phase: 0,
      };
    }
    const h = clamp(42 + Math.random() * 16 + d * 12, 42, 68);
    return {
      kind: "block",
      x,
      w: rand(40, 68),
      h,
      cleared: false,
      near: false,
      bob: 0,
      phase: 0,
    };
  }

  private seedPickup(from: number, to: number): void {
    const span = to - from;
    if (span < 130) return;
    const spots = span > 460 ? 3 : 2;
    for (let i = 0; i < spots; i++) {
      const t = (i + 1) / (spots + 1);
      const air = i % 2 === 1;
      this.pickups.push({
        kind: "ember",
        x: from + span * t,
        y: air ? GROUND - 118 : GROUND - 42,
        taken: false,
        bob: rand(0, Math.PI * 2),
      });
    }
    const shieldLive = this.shield > 0 || this.pickups.some((p) => p.kind === "shield" && !p.taken);
    if (!shieldLive && pace01(this.distance) > 0.18 && Math.random() < 0.16) {
      this.pickups.push({
        kind: "shield",
        x: from + span * 0.55,
        y: GROUND - 102,
        taken: false,
        bob: rand(0, Math.PI * 2),
      });
    }
  }

  private physics(dt: number): void {
    const wantSlide = this.slideHold || this.slideLeft > 0;
    this.slideLeft = Math.max(0, this.slideLeft - dt);

    if (this.grounded && wantSlide) this.sliding = true;
    else if (!wantSlide) this.sliding = false;
    if (!this.grounded && !this.sliding) this.sliding = false;

    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= dt;
      const canJump = (this.grounded || this.coyote > 0) && !this.sliding;
      if (canJump) {
        this.vy = JUMP_V;
        this.grounded = false;
        this.coyote = 0;
        this.jumpBuffer = 0;
        this.sliding = false;
        this.slideLeft = 0;
        this.squash = 0.72;
        this.blip(620, 0.07, "triangle", 0.05);
        this.puff(this.playerX() + 10, GROUND, "#e7b48a", 5);
      }
    }

    if (!this.grounded) this.coyote = Math.max(0, this.coyote - dt);

    this.vy += GRAVITY * dt;
    this.feetY += this.vy * dt;

    if (this.feetY >= GROUND) {
      const landing = !this.grounded && this.vy > 0;
      this.feetY = GROUND;
      this.vy = 0;
      if (landing) {
        this.squash = 0.62;
        this.puff(this.playerX() + 16, GROUND, "#c9844e", 8);
        this.blip(140, 0.05, "sine", 0.04);
      }
      this.grounded = true;
      this.coyote = COYOTE;
      this.rot = 0;
    } else {
      this.grounded = false;
      this.rot = clamp(this.vy / 2200, -0.35, 0.4);
    }
  }

  private bodyRect(): { x: number; y: number; w: number; h: number } {
    const h = this.sliding && this.grounded ? SLIDE_H : STAND_H;
    return {
      x: this.playerX() + 4,
      y: this.feetY - h + 6,
      w: PLAYER_W - 8,
      h: h - 8,
    };
  }

  private obsRect(obs: Obstacle): { x: number; y: number; w: number; h: number } {
    const x = obs.x - this.distance;
    if (obs.kind === "beam") {
      const bob = obs.bob ? Math.sin(this.runTime * 2.4 + obs.phase) * obs.bob : 0;
      const bottom = GROUND - 64 + bob;
      return { x, y: bottom - obs.h, w: obs.w, h: obs.h };
    }
    if (obs.kind === "vent") {
      return { x, y: GROUND - obs.h, w: obs.w, h: obs.h };
    }
    return { x, y: GROUND - obs.h, w: obs.w, h: obs.h };
  }

  private collide(): void {
    const body = this.bodyRect();
    const px = this.distance + body.x;
    for (const obs of this.obstacles) {
      const r = this.obsRect(obs);
      const hit = overlap(body, r);
      if (!obs.near && !hit && xOverlap(body, r)) {
        const close =
          obs.kind === "beam"
            ? body.y - (r.y + r.h) < 18 && body.y >= r.y + r.h
            : r.y - (body.y + body.h) < 20 && body.y + body.h <= r.y;
        if (close) {
          obs.near = true;
          this.raiseCombo(Math.min(12, this.combo + 1), r.x + r.w * 0.5, r.y - 12);
          this.score += 15 * this.combo;
          this.popups.push({
            x: r.x + r.w * 0.5,
            y: r.y - 12,
            text: "close",
            life: 0.7,
          });
          this.blip(880, 0.06, "square", 0.03);
        }
      }
      if (hit) {
        if (this.invuln > 0) continue;
        if (this.shield > 0) {
          this.shield = 0;
          this.invuln = 0.85;
          this.flash = 0.7;
          this.shake = this.reduced ? 0 : 8;
          obs.cleared = true;
          obs.near = true;
          this.popups.push({
            x: r.x + r.w * 0.5,
            y: r.y - 8,
            text: "shield broke",
            life: 0.85,
          });
          this.puff(r.x + r.w * 0.5, r.y, "#fff1e4", 14);
          this.blip(180, 0.14, "sawtooth", 0.05);
          continue;
        }
        this.die(r.x + r.w * 0.5, r.y);
        return;
      }
      if (!obs.cleared && obs.x + obs.w < px) {
        obs.cleared = true;
        if (!obs.near) {
          const chain = this.distance - this.lastClear < speedFor(this.distance) * 2.6;
          const next = chain ? Math.min(12, this.combo + 1) : 1;
          this.raiseCombo(next, r.x + r.w * 0.4, GROUND - 120);
        }
        this.lastClear = this.distance;
        const bonus = 24 * this.combo;
        this.score += bonus;
        this.popups.push({
          x: r.x + r.w * 0.4,
          y: GROUND - 120,
          text: `+${bonus}`,
          life: 0.8,
        });
        if (this.combo >= 3) this.blip(520 + this.combo * 40, 0.08, "triangle", 0.04);
      }
    }
  }

  private die(x: number, y: number): void {
    this.phase = "dead";
    this.hitT = 0;
    this.vy = -420;
    this.grounded = false;
    this.sliding = false;
    this.shake = this.reduced ? 0 : 16;
    this.flash = 1;
    this.squash = 1.2;
    this.puff(x, y, "#ffb070", 16);
    this.puff(this.playerX() + 18, this.feetY - 20, "#ff7a3c", 10);
    this.blip(90, 0.18, "sawtooth", 0.06);
  }

  private raiseCombo(next: number, x: number, y: number): void {
    const prev = this.combo;
    this.combo = next;
    this.peak = Math.max(this.peak, this.combo);
    this.comboLeft = 2.2;
    if ((prev < 6 && this.combo >= 6) || (prev < 10 && this.combo >= 10)) {
      this.score += 100;
      this.flash = Math.max(this.flash, 0.4);
      this.popups.push({ x, y: y - 22, text: "surge +100", life: 0.85 });
      this.blip(360, 0.12, "sawtooth", 0.045);
    }
  }

  private collect(): void {
    const body = this.bodyRect();
    const cx = body.x + body.w * 0.5;
    const cy = body.y + body.h * 0.5;
    for (const p of this.pickups) {
      if (p.taken) continue;
      const sx = p.x - this.distance;
      const sy = p.y + Math.sin(this.runTime * 3 + p.bob) * 6;
      const dx = sx - cx;
      const dy = sy - cy;
      if (dx * dx + dy * dy > 28 * 28) continue;
      p.taken = true;
      if (p.kind === "shield") {
        this.shield = 1;
        this.popups.push({ x: sx, y: sy - 10, text: "shield", life: 0.8 });
        this.blip(740, 0.12, "triangle", 0.05);
        this.puff(sx, sy, "#fff1e4", 8);
      } else {
        this.embers += 1;
        this.raiseCombo(Math.min(12, this.combo + 1), sx, sy - 16);
        const bonus = 18 * this.combo;
        this.score += bonus;
        this.popups.push({ x: sx, y: sy - 10, text: `+${bonus}`, life: 0.7 });
        this.blip(980, 0.05, "sine", 0.03);
        this.puff(sx, sy, this.tone.lamp, 4);
      }
    }
  }

  private commitBest(): void {
    const score = Math.floor(this.score);
    this.isFresh = score > this.best;
    if (this.isFresh) {
      this.best = score;
      saveBest(typeof localStorage === "undefined" ? null : localStorage, score);
    }
  }

  private cull(): void {
    const limit = this.distance - 200;
    this.obstacles = this.obstacles.filter((obs) => obs.x + obs.w > limit);
    this.pickups = this.pickups.filter((p) => !p.taken && p.x > limit);
  }

  private drawSky(ctx: CanvasRenderingContext2D): void {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, this.tone.skyTop);
    g.addColorStop(0.62, this.tone.skyMid);
    g.addColorStop(1, this.tone.skyLow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    const glow = ctx.createRadialGradient(
      this.viewW * 0.7,
      GROUND - 20,
      20,
      this.viewW * 0.55,
      GROUND,
      520,
    );
    glow.addColorStop(0, this.tone.glow);
    glow.addColorStop(1, "rgba(255, 120, 40, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
  }

  private drawRidges(ctx: CanvasRenderingContext2D): void {
    this.ridge(ctx, this.tone.ridgeFar, 46, 0.0042, 400, 0.15);
    this.ridge(ctx, this.tone.ridgeNear, 32, 0.0065, 470, 0.34);
  }

  private ridge(
    ctx: CanvasRenderingContext2D,
    color: string,
    amp: number,
    freq: number,
    y: number,
    parallax: number,
  ): void {
    const off = this.distance * parallax;
    ctx.beginPath();
    ctx.moveTo(0, this.viewH);
    for (let x = 0; x <= this.viewW + 24; x += 18) {
      const n =
        Math.sin((x + off) * freq) * amp + Math.sin((x + off) * freq * 2.1 + 1.2) * amp * 0.35;
      ctx.lineTo(x, y + n);
    }
    ctx.lineTo(this.viewW, this.viewH);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.tone.ground;
    ctx.fillRect(0, GROUND, this.viewW, this.viewH - GROUND);
    ctx.fillStyle = this.tone.rail;
    ctx.fillRect(0, GROUND, this.viewW, 3);
    ctx.fillStyle = this.tone.tick;
    const step = 48;
    const shift = this.distance % step;
    for (let x = -shift; x < this.viewW; x += step) {
      ctx.fillRect(x, GROUND + 16, 18, 2);
    }
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle): void {
    const r = this.obsRect(obs);
    if (r.x > this.viewW + 40 || r.x + r.w < -40) return;
    if (obs.kind === "vent") {
      ctx.fillStyle = "#0c0a09";
      ctx.fillRect(r.x, GROUND - 8, r.w, 22);
      ctx.fillStyle = this.tone.edge;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(r.x + 6, GROUND - 4, r.w - 12, 3);
      ctx.globalAlpha = 1;
      return;
    }
    if (obs.kind === "beam") {
      ctx.fillStyle = this.tone.block;
      ctx.fillRect(r.x, 0, 8, r.y);
      ctx.fillRect(r.x + r.w - 8, 0, 8, r.y);
      ctx.fillStyle = this.tone.beam;
      roundRect(ctx, r.x, r.y, r.w, r.h, 4);
      ctx.fill();
      ctx.fillStyle = this.tone.edge;
      for (let x = r.x + 8; x < r.x + r.w - 8; x += 16) {
        ctx.fillRect(x, r.y + 6, 8, r.h - 12);
      }
      return;
    }
    ctx.fillStyle = this.tone.block;
    roundRect(ctx, r.x, r.y, r.w, r.h, 6);
    ctx.fill();
    ctx.fillStyle = this.tone.edge;
    ctx.fillRect(r.x, r.y, 4, r.h);
    ctx.strokeStyle = "rgba(255, 196, 140, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r.x + 10, r.y + r.h - 8);
    ctx.lineTo(r.x + r.w * 0.55, r.y + 10);
    ctx.stroke();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D): void {
    if (this.invuln > 0 && Math.sin(this.shieldPulse * 28) > 0) return;
    const body = this.bodyRect();
    const x = body.x + body.w * 0.5;
    const slide = this.sliding && this.grounded && this.phase === "run";
    ctx.save();
    ctx.translate(x, this.feetY);
    if (this.phase === "dead") ctx.rotate(this.tumble);
    else ctx.rotate(this.rot);
    const sy = slide ? 0.48 : this.squash;
    const sx = slide ? 1.18 : 1 + (1 - this.squash) * 0.28;
    ctx.scale(sx, sy);

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const swing = this.grounded && this.phase === "run" ? Math.sin(this.runPhase) : 0.35;
    ctx.strokeStyle = "#f3d2b0";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6, -30);
    ctx.lineTo(-10 - swing * 14, -2);
    ctx.moveTo(5, -30);
    ctx.lineTo(10 + swing * 14, -2);
    ctx.stroke();

    ctx.fillStyle = "#4a3428";
    roundRect(ctx, -16, -64, 32, 38, 9);
    ctx.fill();
    ctx.strokeStyle = "#ffd7b0";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#2a211c";
    ctx.beginPath();
    ctx.arc(3, -76, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffd7b0";
    ctx.stroke();
    ctx.fillStyle = "#ff7a2f";
    ctx.fillRect(-1, -80, 16, 5);

    ctx.strokeStyle = "#e38b4a";
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(-16, -58);
    ctx.quadraticCurveTo(-36 - pace01(this.distance) * 18, -50, -28, -40);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawPickups(ctx: CanvasRenderingContext2D): void {
    for (const p of this.pickups) {
      if (p.taken) continue;
      const x = p.x - this.distance;
      if (x < -40 || x > this.viewW + 40) continue;
      const y = p.y + Math.sin(this.runTime * 3 + p.bob) * 6;
      if (p.kind === "shield") {
        ctx.strokeStyle = this.tone.lamp;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = this.tone.edge;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawTrail(ctx: CanvasRenderingContext2D): void {
    if (this.phase !== "run" || this.combo < 2) return;
    const n = Math.min(8, this.combo);
    const x = this.playerX() + 8;
    const y = this.feetY - (this.sliding && this.grounded ? 16 : 46);
    for (let i = n; i >= 1; i--) {
      ctx.globalAlpha = (0.22 * (n - i + 1)) / n;
      ctx.fillStyle = this.tone.lamp;
      ctx.beginPath();
      ctx.arc(x - i * 16, y, Math.max(2, 7 - i * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawShield(ctx: CanvasRenderingContext2D): void {
    if (this.shield <= 0 || this.phase !== "run") return;
    const pulse = 0.55 + Math.sin(this.shieldPulse * 5) * 0.2;
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = this.tone.lamp;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(this.playerX() + 16, this.feetY - 40, 30, 48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private drawEmbers(ctx: CanvasRenderingContext2D, front: boolean): void {
    for (const e of this.embersFx) {
      const near = e.size > 2.2;
      if (near !== front) continue;
      ctx.globalAlpha = clamp(e.life / e.max, 0, 1) * 0.85;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawPopups(ctx: CanvasRenderingContext2D): void {
    ctx.font = "600 16px Outfit, sans-serif";
    ctx.textAlign = "center";
    for (const p of this.popups) {
      ctx.globalAlpha = clamp(p.life / 0.3, 0, 1);
      ctx.fillStyle = "#ffe2c4";
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  private tickEmbers(dt: number): void {
    const speed = this.phase === "run" && !this.paused ? speedFor(this.distance) : 80;
    for (const e of this.embersFx) {
      e.x -= speed * dt * (0.15 + e.size * 0.04);
      e.y -= 18 * dt;
      e.life -= dt;
      if (e.life <= 0 || e.x < -20) Object.assign(e, this.makeEmber(false));
    }
  }

  private tickParticles(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += 500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private tickPopups(dt: number): void {
    for (const p of this.popups) {
      p.life -= dt;
      p.y -= 28 * dt;
    }
    this.popups = this.popups.filter((p) => p.life > 0);
  }

  private makeEmber(anywhere: boolean): Particle {
    return {
      x: anywhere ? Math.random() * 1600 : this.viewW + rand(0, 80),
      y: rand(80, GROUND - 10),
      vx: 0,
      vy: 0,
      life: rand(2, 6),
      max: 6,
      size: rand(1, 3.2),
      color: Math.random() > 0.7 ? "#ffd29a" : "#ff8a3d",
    };
  }

  private puff(x: number, y: number, color: string, n: number): void {
    const count = this.reduced ? Math.ceil(n / 3) : n;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: rand(-80, 80),
        vy: rand(-220, -40),
        life: rand(0.25, 0.55),
        max: 0.55,
        size: rand(1.5, 3.5),
        color,
      });
    }
  }

  private blip(freq: number, dur: number, type: OscillatorType, gain: number): void {
    if (this.muted || typeof AudioContext === "undefined") return;
    try {
      if (!this.audio) this.audio = new AudioContext();
      const ctx = this.audio;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.value = gain;
      amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      /* audio optional */
    }
  }
}

function overlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function xOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
