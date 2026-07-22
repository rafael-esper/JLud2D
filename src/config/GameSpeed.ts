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

/**
 * Per-frame entity movement factor (fraction of the Max reference step, which
 * reproduces the old 60 fps raw rate). This scale is deliberately SHIFTED UP
 * from the shared MULTIPLIER: Slow now feels like the old Normal, and Normal
 * sits just below Fast, so overall walking is faster. Values are written as
 * `n / 3` so they line up with the old `mult / maxMult` factors for reference
 * (old factors were slow 0.167, normal 0.333, fast 0.5, faster 0.667, max 1.0).
 */
const ENTITY_SPEED_FACTOR: Record<SpeedLevel, number> = {
  slow: 1.0 / 3, 
  normal: 1.3 / 3,
  fast: 2.0 / 3,  
  faster: 2.5 / 3,
  max: 3.0 / 3    
};

/**
 * Tile/map animation factor (fraction of raw elapsed time applied per frame).
 * This scale is SHIFTED DOWN from the shared MULTIPLIER because tile
 * animations ran too fast: Normal now feels like the old Slow, Slow is slower
 * still, and every level is slower than before (even Max no longer reaches the
 * old raw rate). Written as `n / 3` to match the old factor reference.
 */
const MAP_ANIM_FACTOR: Record<SpeedLevel, number> = {
  slow: 0.3 / 5, 
  normal: 0.5 / 5,
  fast: 0.8 / 5,  
  faster: 1.2 / 5,
  max: 1.8 / 5    
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

  /** The largest speed multiplier available (currently Max = 3×). */
  public static getMaxMultiplier(): number {
    return Math.max(...Object.values(MULTIPLIER));
  }

  /** Scales a millisecond delay: Fast/Max shorten it, Slow lengthens it. */
  public static scaleDelay(ms: number): number {
    return Math.max(1, Math.round(ms / GameSpeed.getMultiplier()));
  }

  /**
   * Per-frame entity movement factor for the current speed level. Multiplied by
   * the entity's base step inside Entity.think(). See ENTITY_SPEED_FACTOR.
   */
  public static entitySpeedFactor(): number {
    return ENTITY_SPEED_FACTOR[GameSpeed.level];
  }

  /**
   * Tile/map animation advance factor for the current speed level. Multiplied
   * by the raw elapsed time in TiledMap.updateAnimations(). See MAP_ANIM_FACTOR.
   */
  public static mapAnimFactor(): number {
    return MAP_ANIM_FACTOR[GameSpeed.level];
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
