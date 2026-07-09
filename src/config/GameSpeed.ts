/**
 * GameSpeed — global game-speed setting shared by all demos.
 *
 * The original Java engine ran its whole loop at 50 fps (GUI.java
 * frameDelay = 20 ms) and every gameplay counter — entity movement ticks,
 * menu/battle text and animation counters, dungeon frame delays — advanced
 * once per frame. The Phaser port renders at 60 fps, so anything that
 * advances "per rendered frame" runs too fast unless it is paced here.
 *
 * This module emits logic ticks at the Java rate (50/s) scaled by the
 * user-selected speed level, and scales millisecond delays the same way.
 * The level is chosen from the EmulatorUI toolbar and persisted in
 * GameConfig.
 */

export type SpeedLevel = 'slow' | 'normal' | 'fast' | 'faster' | 'max';

export const SPEED_LEVELS: SpeedLevel[] = ['slow', 'normal', 'fast', 'faster', 'max'];

export const SPEED_LABELS: Record<SpeedLevel, string> = {
  slow: 'Slow',
  normal: 'Normal',
  fast: 'Fast',
  faster: 'Faster',
  max: 'Max'
};

const MULTIPLIER: Record<SpeedLevel, number> = {
  slow: 0.5,
  normal: 1,
  fast: 1.5,
  faster: 2,
  max: 3
};

/** Tick rate of the original Java engine (GUI.java frameDelay = 20 ms). */
const JAVA_TICKS_PER_SECOND = 50;

interface Ticker {
  last: number;
  accum: number;
}

export class GameSpeed {
  private static level: SpeedLevel = 'normal';

  private static menuTicker: Ticker = { last: 0, accum: 0 };

  public static getLevel(): SpeedLevel {
    return GameSpeed.level;
  }

  public static setLevel(level: SpeedLevel): void {
    GameSpeed.level = MULTIPLIER[level] !== undefined ? level : 'normal';
  }

  public static getMultiplier(): number {
    return MULTIPLIER[GameSpeed.level];
  }

  /** Scales a millisecond delay: Fast/Max shorten it, Slow lengthens it. */
  public static scaleDelay(ms: number): number {
    return Math.max(1, Math.round(ms / GameSpeed.getMultiplier()));
  }

  /**
   * Factor applied to entity speeds inside Entity.think(), which runs once
   * per rendered frame (60/s). The 50/60 rebase makes "Normal" match the
   * Java engine's 50 ticks/s; the multiplier applies the user's level on
   * top. Feeding this through the entity speed accumulator (rather than
   * skipping engine ticks) keeps per-frame movement smooth.
   */
  public static entitySpeedScale(): number {
    return (JAVA_TICKS_PER_SECOND / 60) * GameSpeed.getMultiplier();
  }

  /** Menu logic ticks to run this frame (text boxes, battle animations). */
  public static menuTicks(): number {
    return GameSpeed.consumeTicks(GameSpeed.menuTicker);
  }

  /**
   * Real-time accumulator, so the tick rate is independent of both the
   * display refresh rate and how many times per frame the caller polls —
   * a second call in the same frame simply gets 0 ticks.
   */
  private static consumeTicks(t: Ticker): number {
    const now = performance.now();
    if (t.last === 0) t.last = now;
    // Cap the step so stalls (tab switch, scene loads) don't burst ticks
    const dt = Math.min(now - t.last, 50);
    t.last = now;
    t.accum += (dt / 1000) * JAVA_TICKS_PER_SECOND * GameSpeed.getMultiplier();
    const ticks = Math.floor(t.accum);
    t.accum -= ticks;
    return ticks;
  }
}

export default GameSpeed;
