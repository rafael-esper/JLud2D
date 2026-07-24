/**
 * PersistenceManager - generic "snapshot on backgrounding" registry.
 *
 * Mobile browsers frequently kill a backgrounded tab (a full page reload on
 * return), so any demo that wants to survive that needs to flush its state when
 * the page is hidden. This registry keeps the lifecycle wiring in one place
 * (src/main.ts listens for visibilitychange/pagehide and calls snapshotAll())
 * while letting each demo register its own synchronous snapshot callback.
 *
 * Callbacks MUST be synchronous and fast — they run inside the hidden/pagehide
 * handler, which may be the last code that executes before the OS kills the
 * process. Persist to synchronous storage (localStorage), not async IndexedDB.
 *
 * Currently only the Phantasy Star demo registers a callback (GameScene), but
 * the interface is demo-agnostic so others can opt in later.
 */
export class PersistenceManager {
  private static callbacks = new Set<() => void>();

  /** Register a synchronous snapshot callback. Idempotent. */
  public static register(fn: () => void): void {
    PersistenceManager.callbacks.add(fn);
  }

  /** Stop invoking a previously registered callback. */
  public static unregister(fn: () => void): void {
    PersistenceManager.callbacks.delete(fn);
  }

  /** Invoke every registered callback; one throwing never blocks the others. */
  public static snapshotAll(): void {
    for (const fn of PersistenceManager.callbacks) {
      try {
        fn();
      } catch (error) {
        console.error('PersistenceManager: snapshot callback failed', error);
      }
    }
  }
}
