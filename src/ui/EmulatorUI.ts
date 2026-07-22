/**
 * EmulatorUI — retro-emulation style overlay shared by all demos.
 *
 * A DOM overlay (not a Phaser scene) so it renders crisply at any canvas
 * scale, works over every demo, and takes mouse/touch input natively.
 * Styled after the SMS-era Phantasy Star menu boxes: dark navy panels with a
 * blue border and the red "▶" cursor as the hover marker.
 *
 * Toolbar actions:
 *   Restart (confirm) · Pause (TODO) · Save state (TODO) · Load state (TODO)
 *   Controls (key rebinding) · Volume (slider + mute) · Game speed · Settings
 *   Touch pad toggle · Fullscreen
 *
 * The bar auto-hides after a few seconds without pointer activity and
 * reappears on any mouse move / tap.
 */

import { GameConfig } from '../config/GameConfig';
import { ControlsConfig } from '../config/Controls';
import { GameSpeed, SPEED_LEVELS, SPEED_LABELS, SpeedLevel } from '../config/GameSpeed';
import { VGMMusicManager } from '../core/vgm2/VGMMusicManager';

type AspectMode = 'fit' | 'integer' | 'stretch';

const IDLE_HIDE_MS = 3200;
const RESTART_KEY = 'jlud2d-restart';
const ASPECT_KEY = 'jlud2d-aspect';

/** Maps any running demo scene back to the demo's entry scene, so Restart
 *  can relaunch the demo from the top after a clean page reload. */
const DEMO_ENTRIES: Record<string, { scene: string; demoPath: string }> = {
  Demo1Scene: { scene: 'Demo1Scene', demoPath: 'src/demos/demo1' },
  Demo2Scene: { scene: 'Demo2Scene', demoPath: 'src/demos/demo2' },
  Demo3Scene: { scene: 'Demo3Scene', demoPath: 'src/demos/demo3' },
  TitleScene: { scene: 'TitleScene', demoPath: 'src/demos/ak' },
  MapScene: { scene: 'TitleScene', demoPath: 'src/demos/ak' },
  AkScene: { scene: 'TitleScene', demoPath: 'src/demos/ak' },
  PSTitleScene: { scene: 'PSTitleScene', demoPath: 'src/demos/ps' },
  PSGameScene: { scene: 'PSTitleScene', demoPath: 'src/demos/ps' }
};

const BINDING_DEFS: { key: string; label: string }[] = [
  { key: 'keyUp', label: 'Move up' },
  { key: 'keyDown', label: 'Move down' },
  { key: 'keyLeft', label: 'Move left' },
  { key: 'keyRight', label: 'Move right' },
  { key: 'keyB1', label: 'Button 1' },
  { key: 'keyB2', label: 'Button 2' },
  { key: 'keyB3', label: 'Button 3' },
  { key: 'keyB4', label: 'Button 4' },
  { key: 'keyB5', label: 'Button 5' },
  { key: 'keyB6', label: 'Button 6' },
  { key: 'keyStart', label: 'Start' },
  { key: 'keyMenu', label: 'Menu / Pause' }
];

const ICONS: Record<string, string> = {
  restart: '<polyline points="21 4 21 10 15 10"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L21 10"/>',
  pause: '<rect x="7" y="5" width="4" height="14" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none"/>',
  save: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/>',
  load: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 8 12 3 17 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  controls: '<rect x="2" y="6" width="20" height="12" rx="1"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01" stroke-linecap="round"/><path d="M9 14h6"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9.5 9.5 0 0 1 0 13"/>',
  volumeMuted: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><line x1="15" y1="9" x2="21" y2="15"/><line x1="21" y1="9" x2="15" y2="15"/>',
  speed: '<path d="M4 17a8 8 0 1 1 16 0"/><line x1="12" y1="16" x2="16.5" y2="11.5"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/>',
  settings: '<line x1="4" y1="7" x2="20" y2="7"/><rect x="7" y="5" width="3.5" height="4" fill="currentColor" stroke="none"/><line x1="4" y1="12" x2="20" y2="12"/><rect x="13" y="10" width="3.5" height="4" fill="currentColor" stroke="none"/><line x1="4" y1="17" x2="20" y2="17"/><rect x="8.5" y="15" width="3.5" height="4" fill="currentColor" stroke="none"/>',
  touch: '<rect x="2" y="7" width="20" height="10" rx="3"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="18.5" cy="13.5" r="1.1" fill="currentColor" stroke="none"/>',
  fullscreen: '<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>',
  fullscreenExit: '<path d="M9 4v5H4"/><path d="M15 4v5h5"/><path d="M9 20v-5H4"/><path d="M15 20v-5h5"/>'
};

export class EmulatorUI {
  private game: Phaser.Game;
  private config: GameConfig;

  private root!: HTMLDivElement;
  private bar!: HTMLDivElement;
  private scrim!: HTMLDivElement;
  private panel!: HTMLDivElement;
  private volPop!: HTMLDivElement;
  private speedPop!: HTMLDivElement;
  private toastEl!: HTMLDivElement;

  private hideTimer: number | null = null;
  private toastTimer: number | null = null;
  private panelOpen = false;
  private aspectMode: AspectMode = 'fit';
  private muted = false;
  private volume = 1;

  /** Non-null while waiting for a key press to rebind a control. */
  private listening: { bindKey: string; slot: number; chip: HTMLElement } | null = null;

  constructor(game: Phaser.Game, config: GameConfig) {
    this.game = game;
    this.config = config;
    this.volume = Phaser.Math.Clamp(config.masterVolume ?? 1, 0, 1);
    this.muted = !!config.muted;
    this.aspectMode = (localStorage.getItem(ASPECT_KEY) as AspectMode) || 'fit';

    this.injectStyles();
    this.buildDom();
    this.wireActivity();
    this.wireAspect();
    this.applyVolumeWhenReady();
    if (this.muted) this.setMuted(true); // restore persisted mute in the UI
    this.syncTouchButtonIcon(); // reflect the touch pad's default-on state on mobile
    this.showBar();
  }

  // ------------------------------------------------------------- toolbar

  private buildDom(): void {
    this.root = document.createElement('div');
    this.root.id = 'emu-ui';

    this.bar = document.createElement('div');
    this.bar.id = 'emu-bar';
    this.bar.setAttribute('role', 'toolbar');
    this.bar.setAttribute('aria-label', 'Game controls');

    const buttons: { act: string; icon: string; label: string; sep?: boolean }[] = [
      { act: 'restart', icon: 'restart', label: 'Restart' },
      { act: 'pause', icon: 'pause', label: 'Pause' },
      { act: 'save', icon: 'save', label: 'Save state' },
      { act: 'load', icon: 'load', label: 'Load state' },
      { act: 'controls', icon: 'controls', label: 'Controls', sep: true },
      { act: 'volume', icon: 'volume', label: 'Volume' },
      { act: 'speed', icon: 'speed', label: 'Game speed' },
      { act: 'settings', icon: 'settings', label: 'Settings' },
      { act: 'touch', icon: 'touch', label: 'Touch pad', sep: true },
      { act: 'fullscreen', icon: 'fullscreen', label: 'Full screen' }
    ];

    for (const b of buttons) {
      if (b.sep) {
        const sep = document.createElement('span');
        sep.className = 'emu-sep';
        this.bar.appendChild(sep);
      }
      const btn = document.createElement('button');
      btn.className = 'emu-btn';
      btn.dataset.act = b.act;
      btn.dataset.label = b.label;
      btn.setAttribute('aria-label', b.label);
      btn.innerHTML = this.svg(b.icon);
      this.bar.appendChild(btn);
    }

    // Volume popover lives inside the bar so hovering it keeps the bar shown
    this.volPop = document.createElement('div');
    this.volPop.id = 'emu-vol-pop';
    this.volPop.hidden = true;
    this.volPop.innerHTML =
      `<input type="range" id="emu-vol-slider" min="0" max="100" step="1" value="${Math.round(this.volume * 100)}" aria-label="Volume">` +
      `<button id="emu-mute" class="emu-small-btn">Mute</button>`;
    this.bar.appendChild(this.volPop);

    // Game-speed popover, same pattern as the volume popover
    this.speedPop = document.createElement('div');
    this.speedPop.id = 'emu-speed-pop';
    this.speedPop.hidden = true;
    this.speedPop.innerHTML = SPEED_LEVELS.map((lvl) =>
      `<button class="emu-small-btn" data-speed="${lvl}">${SPEED_LABELS[lvl]}</button>`).join('');
    this.bar.appendChild(this.speedPop);

    // Modal scrim + panel (controls / settings / restart confirmation)
    this.scrim = document.createElement('div');
    this.scrim.id = 'emu-scrim';
    this.scrim.hidden = true;
    this.panel = document.createElement('div');
    this.panel.id = 'emu-panel';
    this.panel.setAttribute('role', 'dialog');
    this.scrim.appendChild(this.panel);

    this.toastEl = document.createElement('div');
    this.toastEl.id = 'emu-toast';
    this.toastEl.hidden = true;

    this.root.appendChild(this.bar);
    this.root.appendChild(this.scrim);
    this.root.appendChild(this.toastEl);
    document.body.appendChild(this.root);

    this.bar.addEventListener('click', (ev) => this.onBarClick(ev));
    this.wireTouchTap(this.bar, '.emu-btn', (btn) => this.runBarAction(btn as HTMLButtonElement));

    this.scrim.addEventListener('click', (ev) => {
      if (ev.target === this.scrim) this.closePanel();
    });
    this.wireTouchTap(this.scrim, undefined, (_target, ev) => {
      if (ev.target === this.scrim) this.closePanel();
    });

    this.panel.addEventListener('click', (ev) => this.onPanelClick(ev));
    this.wireTouchTap(this.panel, '[data-act], .emu-chip, [data-aspect]', (_target, ev) => this.onPanelClick(ev as MouseEvent));

    const slider = this.volPop.querySelector<HTMLInputElement>('#emu-vol-slider')!;
    slider.addEventListener('input', () => this.setVolume(Number(slider.value) / 100, false));
    slider.addEventListener('change', () => this.setVolume(Number(slider.value) / 100, true));
    const muteBtn = this.volPop.querySelector<HTMLButtonElement>('#emu-mute')!;
    muteBtn.addEventListener('click', () => this.setMuted(!this.muted));
    this.wireTouchTap(muteBtn, undefined, () => this.setMuted(!this.muted));

    this.speedPop.addEventListener('click', (ev) => {
      const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>('[data-speed]');
      if (btn) this.setSpeedLevel(btn.dataset.speed as SpeedLevel);
    });
    this.wireTouchTap(this.speedPop, '[data-speed]', (btn) => {
      this.setSpeedLevel((btn as HTMLElement).dataset.speed as SpeedLevel);
    });
    this.refreshSpeedButtons();

    document.addEventListener('fullscreenchange', () => this.refreshFullscreenIcon());
    document.addEventListener('keydown', (ev) => this.onKeyDown(ev), true);
  }

  private svg(icon: string): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${ICONS[icon]}</svg>`;
  }

  private onBarClick(ev: MouseEvent): void {
    const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>('.emu-btn');
    if (!btn) return;
    this.runBarAction(btn);
  }

  private runBarAction(btn: HTMLButtonElement): void {
    this.showBar();

    switch (btn.dataset.act) {
      case 'restart':
        this.openConfirmRestart();
        break;
      case 'pause':
        // TODO(pause): needs cooperation from every scene — Phaser scene.pause()
        // alone leaves the VGM WebAudio graph and DOM-driven timers running.
        // Plan: a global pause flag checked by each demo's update() plus a
        // suspend/resume hook on the VGM player.
        this.toast('Pause is not implemented yet');
        break;
      case 'save':
        // TODO(save-state): needs per-demo snapshot support (scene state, PSGame
        // singleton, entity positions, RNG) serialized to localStorage slots.
        this.toast('Save state is not implemented yet');
        break;
      case 'load':
        // TODO(load-state): counterpart of save-state, restoring a snapshot.
        this.toast('Load state is not implemented yet');
        break;
      case 'controls':
        this.openControlsPanel();
        break;
      case 'volume':
        this.volPop.hidden = !this.volPop.hidden;
        break;
      case 'speed':
        this.speedPop.hidden = !this.speedPop.hidden;
        break;
      case 'settings':
        this.openSettingsPanel();
        break;
      case 'touch':
        this.toggleTouchControls();
        break;
      case 'fullscreen':
        this.toggleFullscreen();
        break;
    }

    if (btn.dataset.act !== 'volume') this.volPop.hidden = true;
    if (btn.dataset.act !== 'speed') this.speedPop.hidden = true;
  }

  /**
   * Touch fallback for delegated 'click' handlers. On this page <body> sets
   * touch-action:none (needed to stop the game canvas from panning/zooming),
   * and some mobile browsers then never synthesize the compatibility 'click'
   * after touchend — the button's :active style flashes but nothing fires.
   * Handles the tap directly on 'pointerdown' for touch pointers only and
   * preventDefault()s to swallow the resulting ghost click (matches the
   * virtual gamepad's approach in index.html). Mouse and keyboard activation
   * are untouched — they keep using the normal 'click' listener alongside
   * this one, so this must never double-fire for them.
   *
   * `selector` narrows which descendants respond, so untargeted touches
   * (panel scrolling, slider dragging) pass through without preventDefault.
   * Omit it to match the element itself (e.g. a single button, or the scrim
   * backdrop where the handler re-checks ev.target itself).
   */
  private wireTouchTap(
    el: HTMLElement,
    selector: string | undefined,
    handler: (target: HTMLElement, ev: PointerEvent) => void
  ): void {
    el.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType !== 'touch') return;
      // No selector means "el itself, and nothing else" (e.g. the scrim
      // backdrop, or a leaf button) — anything else in the subtree (panel
      // scroll content, slider) must fall through untouched.
      const target = selector
        ? (ev.target as HTMLElement).closest<HTMLElement>(selector)
        : (ev.target === el ? el : null);
      if (!target) return;
      ev.preventDefault();
      handler(target, ev);
    });
  }

  // ------------------------------------------------------------ auto-hide

  private wireActivity(): void {
    const onActivity = (ev: Event) => {
      // Ignore activity coming from the on-screen touch pad, otherwise the
      // bar would stay visible for the whole play session on mobile.
      const t = ev.target as HTMLElement | null;
      if (t && (t.closest('#joy-area') || t.closest('.control-button'))) return;
      this.showBar();
    };
    window.addEventListener('pointermove', onActivity, { passive: true });
    window.addEventListener('pointerdown', onActivity, { passive: true });
  }

  private showBar(): void {
    this.bar.classList.remove('emu-off');
    this.armHideTimer();
  }

  private armHideTimer(): void {
    if (this.hideTimer !== null) window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.maybeHideBar(), IDLE_HIDE_MS);
  }

  private maybeHideBar(): void {
    // Stay visible while the user is on the bar (which includes the volume
    // popover) or a modal panel is open
    if (this.panelOpen || this.bar.matches(':hover')) {
      this.armHideTimer();
      return;
    }
    // Idle popovers fade away with the bar
    this.volPop.hidden = true;
    this.speedPop.hidden = true;
    this.bar.classList.add('emu-off');
  }

  // -------------------------------------------------------------- restart

  private openConfirmRestart(): void {
    this.openPanelWith(`
      <h2><span class="emu-cursor">&#9654;</span> Restart game</h2>
      <p class="emu-note">Restart the current game from the beginning? Unsaved progress will be lost.</p>
      <div class="emu-panel-actions">
        <button class="emu-small-btn" data-act="close">Cancel</button>
        <button class="emu-small-btn emu-danger" data-act="restart-confirm">Restart</button>
      </div>`);
  }

  /** Restarts the running demo with a full page reload — the only way to get
   *  a truly clean slate given the game-state singletons (PSGame etc.).
   *  BootScene reads RESTART_KEY and jumps straight back into the demo. */
  private doRestart(): void {
    try {
      for (const s of this.game.scene.getScenes(true)) {
        const entry = DEMO_ENTRIES[s.scene.key];
        if (entry) {
          sessionStorage.setItem(RESTART_KEY, JSON.stringify(entry));
          break;
        }
      }
    } catch (e) {
      console.warn('EmulatorUI: could not record restart target', e);
    }
    location.reload();
  }

  // --------------------------------------------------------------- volume

  private applyVolumeWhenReady(): void {
    // VGMMusicManager keeps these values and applies them when its WebAudio
    // player initializes, so it is safe to set them this early
    const vgm = VGMMusicManager.getInstance();
    vgm.setVolume(this.volume);
    vgm.setMuted(this.muted);

    const apply = () => {
      this.game.sound.volume = this.volume;
      this.game.sound.mute = this.muted;
    };
    if (this.game.isBooted) apply();
    else this.game.events.once(Phaser.Core.Events.READY, apply);
  }

  /** Applies to both audio paths: Phaser sound effects and VGM music. */
  private setVolume(v: number, persist: boolean): void {
    this.volume = Phaser.Math.Clamp(v, 0, 1);
    if (this.game.isBooted) this.game.sound.volume = this.volume;
    VGMMusicManager.getInstance().setVolume(this.volume);
    if (this.muted && this.volume > 0) this.setMuted(false);
    if (persist) {
      this.config.masterVolume = this.volume;
      this.config.saveConfig();
    }
  }

  private setMuted(m: boolean): void {
    this.muted = m;
    if (this.game.isBooted) this.game.sound.mute = m;
    VGMMusicManager.getInstance().setMuted(m);
    this.config.muted = m;
    this.config.saveConfig();
    const volBtn = this.bar.querySelector<HTMLButtonElement>('[data-act="volume"]')!;
    volBtn.innerHTML = this.svg(m ? 'volumeMuted' : 'volume');
    volBtn.classList.toggle('emu-active', m);
    this.volPop.querySelector<HTMLButtonElement>('#emu-mute')!.textContent = m ? 'Unmute' : 'Mute';
  }

  // ----------------------------------------------------------- game speed

  /** Applies globally: engine ticks, menu/battle pacing, dungeon delays. */
  private setSpeedLevel(level: SpeedLevel): void {
    GameSpeed.setLevel(level);
    this.config.gameSpeed = GameSpeed.getLevel();
    this.config.saveConfig();
    this.refreshSpeedButtons();
    this.toast(`Game speed: ${SPEED_LABELS[GameSpeed.getLevel()]}`);
  }

  private refreshSpeedButtons(): void {
    const level = GameSpeed.getLevel();
    this.speedPop.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((b) =>
      b.classList.toggle('emu-active', b.dataset.speed === level));
    // Flag the toolbar icon whenever the speed deviates from Normal
    this.bar.querySelector<HTMLButtonElement>('[data-act="speed"]')!
      .classList.toggle('emu-active', level !== 'normal');
  }

  // ------------------------------------------------------------ touch pad

  private toggleTouchControls(): void {
    const mc = (window as any).mobileControls;
    if (!mc) return;
    mc.controlsVisible = !mc.controlsVisible;
    mc.updateControlsVisibility();
    this.bar.querySelector<HTMLButtonElement>('[data-act="touch"]')!
      .classList.toggle('emu-active', mc.controlsVisible);
  }

  /** Matches the toolbar icon to the touch pad's initial visibility (on by
   *  default on touch devices, see index.html's MobileControlsManager). */
  private syncTouchButtonIcon(): void {
    const mc = (window as any).mobileControls;
    if (!mc) return;
    this.bar.querySelector<HTMLButtonElement>('[data-act="touch"]')!
      .classList.toggle('emu-active', !!mc.controlsVisible);
  }

  // ----------------------------------------------------------- fullscreen

  public toggleFullscreen(): void {
    const doc = document as any;
    const isFull = !!(document.fullscreenElement || doc.webkitFullscreenElement);
    if (isFull) {
      (document.exitFullscreen || doc.webkitExitFullscreen)?.call(document);
      return;
    }
    // Fullscreen the whole document (not the Phaser container) so this
    // overlay and the touch pad stay usable. On phones, also try to force
    // landscape so the 4:3 canvas gets the full width.
    const el = document.documentElement as any;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) {
      this.toast('Full screen is not supported by this browser');
      return;
    }
    Promise.resolve(req.call(el, { navigationUI: 'hide' }))
      .then(() => {
        const orientation = screen.orientation as any;
        if (orientation && typeof orientation.lock === 'function') {
          orientation.lock('landscape').catch(() => { /* not allowed on desktop */ });
        }
      })
      .catch(() => this.toast('Full screen was blocked by the browser'));
  }

  private refreshFullscreenIcon(): void {
    const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
    const btn = this.bar.querySelector<HTMLButtonElement>('[data-act="fullscreen"]')!;
    btn.innerHTML = this.svg(isFull ? 'fullscreenExit' : 'fullscreen');
    btn.dataset.label = isFull ? 'Exit full screen' : 'Full screen';
    btn.classList.toggle('emu-active', isFull);
  }

  // --------------------------------------------------------- aspect ratio

  private wireAspect(): void {
    // Re-assert the override after Phaser's own Scale.FIT pass on every
    // resize / fullscreen change (rAF runs after Phaser's sync handlers).
    const reapply = () => requestAnimationFrame(() => this.applyAspect());
    window.addEventListener('resize', reapply);
    document.addEventListener('fullscreenchange', reapply);
    const hook = () => {
      this.game.scale.on(Phaser.Scale.Events.RESIZE, reapply);
      reapply();
    };
    if (this.game.isBooted) hook();
    else this.game.events.once(Phaser.Core.Events.READY, hook);
  }

  private setAspect(mode: AspectMode): void {
    this.aspectMode = mode;
    localStorage.setItem(ASPECT_KEY, mode);
    if (mode === 'fit' && this.game.isBooted) {
      this.game.scale.refresh(); // hand the canvas style back to Phaser
    }
    this.applyAspect();
  }

  /**
   * 'fit' leaves Phaser's Scale.FIT in charge. 'integer' and 'stretch'
   * override the canvas CSS after Phaser positions it. Note: this skews
   * Phaser's pointer-coordinate mapping slightly, which is acceptable here —
   * all demos are keyboard / touch-pad driven, none read canvas clicks.
   */
  private applyAspect(): void {
    if (!this.game.isBooted || this.aspectMode === 'fit') return;
    const canvas = this.game.canvas;
    const parent = document.getElementById('game-container');
    if (!canvas || !parent) return;

    const cw = parent.clientWidth;
    const ch = parent.clientHeight;
    const gw = this.game.scale.width;
    const gh = this.game.scale.height;
    let w: number;
    let h: number;

    if (this.aspectMode === 'stretch') {
      w = cw;
      h = ch;
    } else {
      const s = Math.floor(Math.min(cw / gw, ch / gh));
      if (s < 1) return; // screen smaller than base resolution — keep FIT
      w = gw * s;
      h = gh * s;
    }

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.style.marginLeft = `${(cw - w) / 2}px`;
    canvas.style.marginTop = `${(ch - h) / 2}px`;
  }

  // --------------------------------------------------------------- panels

  private openPanelWith(html: string): void {
    this.panel.innerHTML = html;
    this.scrim.hidden = false;
    this.panelOpen = true;
    this.volPop.hidden = true;
    this.speedPop.hidden = true;
    this.setGameKeyboardEnabled(false);
    this.showBar();
  }

  private closePanel(): void {
    this.cancelListening();
    this.scrim.hidden = true;
    this.panelOpen = false;
    this.setGameKeyboardEnabled(true);
  }

  /** Keep the game from reacting to keys while a panel is open (especially
   *  while capturing a rebind). */
  private setGameKeyboardEnabled(enabled: boolean): void {
    const kb = this.game.input?.keyboard as any;
    if (kb) kb.enabled = enabled;
  }

  private onPanelClick(ev: MouseEvent): void {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-act], .emu-chip, [data-aspect]');
    if (!el) return;

    if (el.classList.contains('emu-chip')) {
      this.startListening(el);
      return;
    }
    if (el.dataset.aspect) {
      this.setAspect(el.dataset.aspect as AspectMode);
      this.panel.querySelectorAll('[data-aspect]').forEach((b) =>
        b.classList.toggle('emu-active', (b as HTMLElement).dataset.aspect === this.aspectMode));
      return;
    }
    switch (el.dataset.act) {
      case 'close':
        this.closePanel();
        break;
      case 'restart-confirm':
        this.doRestart();
        break;
      case 'bind-reset':
        ControlsConfig.clearSavedBindings();
        this.renderBindingRows();
        this.toast('Controls reset to defaults');
        break;
    }
  }

  // ------------------------------------------------------ controls panel

  private openControlsPanel(): void {
    this.openPanelWith(`
      <h2><span class="emu-cursor">&#9654;</span> Control settings</h2>
      <p class="emu-note">Click a key, then press the new key. Esc cancels, Delete clears an alternate key. Changes apply when a scene starts.</p>
      <div id="emu-bind-rows"></div>
      <div class="emu-panel-actions">
        <button class="emu-small-btn" data-act="bind-reset">Reset to defaults</button>
        <button class="emu-small-btn" data-act="close">Close</button>
      </div>`);
    this.renderBindingRows();
  }

  private renderBindingRows(): void {
    const host = this.panel.querySelector('#emu-bind-rows');
    if (!host) return;
    const effective = new ControlsConfig() as any; // defaults + saved rebinds
    host.innerHTML = BINDING_DEFS.map((def) => {
      const keys: string[] = effective.parseKeys(effective[def.key] || '');
      const chip = (slot: number) =>
        `<button class="emu-chip${keys[slot] ? '' : ' emu-chip-empty'}" data-bind="${def.key}" data-slot="${slot}">${keys[slot] || '&mdash;'}</button>`;
      return `<div class="emu-bind-row"><span>${def.label}</span><span class="emu-chips">${chip(0)}${chip(1)}</span></div>`;
    }).join('');
  }

  private startListening(chip: HTMLElement): void {
    this.cancelListening();
    this.listening = {
      bindKey: chip.dataset.bind!,
      slot: Number(chip.dataset.slot),
      chip
    };
    chip.classList.add('emu-chip-listen');
    chip.textContent = 'Press a key…';
  }

  private cancelListening(): void {
    if (!this.listening) return;
    this.listening = null;
    this.renderBindingRows();
  }

  private onKeyDown(ev: KeyboardEvent): void {
    if (this.listening) {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.key === 'Escape') {
        this.cancelListening();
        return;
      }
      if (ev.key === 'Delete') {
        this.assignBinding(null);
        return;
      }
      const name = EmulatorUI.keyNameFromEvent(ev);
      if (name) this.assignBinding(name);
      return;
    }
    if (this.panelOpen && ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      this.closePanel();
    }
  }

  /** null clears the slot (alternate keys only — an action always keeps at
   *  least its primary key). */
  private assignBinding(name: string | null): void {
    const l = this.listening;
    if (!l) return;
    const effective = new ControlsConfig() as any;
    const keys: string[] = effective.parseKeys(effective[l.bindKey] || '');
    if (name === null) {
      if (l.slot === 0 && keys.length <= 1) {
        this.toast('Each action needs at least one key');
        this.cancelListening();
        return;
      }
      keys.splice(l.slot, 1);
    } else {
      keys[l.slot] = name;
    }
    ControlsConfig.saveBinding(l.bindKey, keys.filter(Boolean).slice(0, 2).join(','));
    this.listening = null;
    this.renderBindingRows();
  }

  /** Convert a DOM key event to the Phaser key name used in ControlsConfig. */
  private static keyNameFromEvent(ev: KeyboardEvent): string | null {
    const special: Record<string, string> = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      Enter: 'ENTER', ' ': 'SPACE', Shift: 'SHIFT', Control: 'CTRL',
      Alt: 'ALT', Tab: 'TAB', Backspace: 'BACKSPACE'
    };
    if (special[ev.key]) return special[ev.key];
    if (/^[a-zA-Z]$/.test(ev.key)) return ev.key.toUpperCase();
    if (/^[0-9]$/.test(ev.key)) {
      return ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'][Number(ev.key)];
    }
    return null;
  }

  // ------------------------------------------------------ settings panel

  private openSettingsPanel(): void {
    this.openPanelWith(`
      <h2><span class="emu-cursor">&#9654;</span> Settings</h2>
      <div class="emu-field">
        <span>Aspect ratio</span>
        <span class="emu-seg">
          <button class="emu-small-btn" data-aspect="fit">Fit 4:3</button>
          <button class="emu-small-btn" data-aspect="integer">Pixel perfect</button>
          <button class="emu-small-btn" data-aspect="stretch">Stretch</button>
        </span>
      </div>
      <label class="emu-check"><input type="checkbox" id="emu-opt-debug"> Debug mode <em>(after restart)</em></label>
      <label class="emu-check"><input type="checkbox" id="emu-opt-fps"> Show FPS <em>(after restart)</em></label>
      <div class="emu-panel-actions">
        <button class="emu-small-btn" data-act="close">Close</button>
      </div>`);

    this.panel.querySelectorAll('[data-aspect]').forEach((b) =>
      b.classList.toggle('emu-active', (b as HTMLElement).dataset.aspect === this.aspectMode));

    const dbg = this.panel.querySelector<HTMLInputElement>('#emu-opt-debug')!;
    dbg.checked = this.config.debug;
    dbg.addEventListener('change', () => {
      this.config.debug = dbg.checked;
      this.config.saveConfig();
    });

    const fps = this.panel.querySelector<HTMLInputElement>('#emu-opt-fps')!;
    fps.checked = this.config.showFPS;
    fps.addEventListener('change', () => {
      this.config.showFPS = fps.checked;
      this.config.saveConfig();
    });
  }

  // ---------------------------------------------------------------- toast

  private toast(msg: string): void {
    this.toastEl.textContent = msg;
    this.toastEl.hidden = false;
    this.toastEl.classList.add('emu-toast-show');
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastEl.classList.remove('emu-toast-show');
      this.toastEl.hidden = true;
    }, 2200);
  }

  // ---------------------------------------------------------------- style

  private injectStyles(): void {
    const style = document.createElement('style');
    style.id = 'emu-ui-style';
    style.textContent = `
#emu-ui {
  --emu-bg: rgba(10, 12, 26, 0.94);
  --emu-blue: #4a5ae8;
  --emu-edge: #262d54;
  --emu-text: #9aa3d0;
  --emu-white: #f2f4ff;
  --emu-red: #e03c30;
  font-family: ui-monospace, 'Cascadia Mono', 'Courier New', monospace;
}
#emu-bar {
  position: fixed;
  top: calc(10px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: var(--emu-bg);
  border: 1px solid var(--emu-blue);
  box-shadow: 0 0 0 1px #090b1c, 0 6px 20px rgba(0, 0, 0, 0.55);
  border-radius: 3px;
  z-index: 2000;
  opacity: 1;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
#emu-bar.emu-off {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
  pointer-events: none;
}
.emu-btn {
  width: 38px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 2px;
  color: var(--emu-text);
  cursor: pointer;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}
.emu-btn svg { width: 18px; height: 18px; }
.emu-btn:hover, .emu-btn:focus-visible {
  color: var(--emu-white);
  background: rgba(74, 90, 232, 0.22);
}
.emu-btn:focus-visible { outline: 1px solid var(--emu-blue); }
.emu-btn.emu-active { color: var(--emu-red); }
/* Tooltip below the button, marked with the Phantasy Star red cursor */
.emu-btn::after {
  content: '\\25B6 ' attr(data-label);
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--emu-white);
  background: var(--emu-bg);
  border: 1px solid var(--emu-edge);
  padding: 3px 7px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
.emu-btn::after { color: var(--emu-white); }
.emu-btn:hover::after, .emu-btn:focus-visible::after { opacity: 1; }
.emu-sep {
  width: 1px;
  height: 22px;
  margin: 0 4px;
  background: var(--emu-edge);
}
/* display:flex on these would otherwise override the hidden attribute */
#emu-scrim[hidden], #emu-vol-pop[hidden], #emu-speed-pop[hidden] { display: none; }
#emu-vol-pop, #emu-speed-pop {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--emu-bg);
  border: 1px solid var(--emu-blue);
  box-shadow: 0 0 0 1px #090b1c;
}
#emu-vol-slider { width: 120px; accent-color: var(--emu-red); }
#emu-speed-pop { gap: 4px; }
.emu-small-btn {
  font: inherit;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--emu-white);
  background: transparent;
  border: 1px solid var(--emu-edge);
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 2px;
}
.emu-small-btn:hover, .emu-small-btn:focus-visible {
  border-color: var(--emu-blue);
  background: rgba(74, 90, 232, 0.22);
}
.emu-small-btn.emu-active { border-color: var(--emu-red); color: var(--emu-red); }
.emu-small-btn.emu-danger { border-color: var(--emu-red); }
.emu-small-btn.emu-danger:hover { background: rgba(224, 60, 48, 0.2); }
#emu-scrim {
  position: fixed;
  inset: 0;
  background: rgba(4, 5, 12, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}
#emu-panel {
  width: min(440px, 92vw);
  max-height: min(80vh, 80dvh);
  overflow-y: auto;
  background: var(--emu-bg);
  border: 1px solid var(--emu-blue);
  box-shadow: 0 0 0 1px #090b1c, 0 10px 30px rgba(0, 0, 0, 0.6);
  padding: 16px 18px;
  color: var(--emu-text);
}
#emu-panel h2 {
  margin: 0 0 10px;
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--emu-white);
}
.emu-cursor { color: var(--emu-red); margin-right: 4px; }
.emu-note { font-size: 11px; line-height: 1.5; margin: 0 0 12px; }
.emu-bind-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid rgba(38, 45, 84, 0.5);
}
.emu-chips { display: flex; gap: 6px; }
.emu-chip {
  font: inherit;
  font-size: 11px;
  min-width: 58px;
  color: var(--emu-white);
  background: rgba(74, 90, 232, 0.14);
  border: 1px solid var(--emu-edge);
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 2px;
}
.emu-chip:hover, .emu-chip:focus-visible { border-color: var(--emu-blue); }
.emu-chip-empty { color: var(--emu-text); background: transparent; }
.emu-chip-listen {
  border-color: var(--emu-red);
  color: var(--emu-red);
  animation: emu-blink 0.9s steps(1) infinite;
}
@keyframes emu-blink { 50% { opacity: 0.45; } }
.emu-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  margin: 0 0 14px;
}
.emu-seg { display: flex; gap: 6px; flex-wrap: wrap; }
.emu-check {
  display: block;
  font-size: 12px;
  margin: 0 0 10px;
  cursor: pointer;
}
.emu-check input { accent-color: var(--emu-red); margin-right: 8px; }
.emu-check em { color: var(--emu-text); font-style: normal; font-size: 10px; }
.emu-panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
#emu-toast {
  position: fixed;
  top: calc(58px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  background: var(--emu-bg);
  border: 1px solid var(--emu-red);
  color: var(--emu-white);
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 7px 14px;
  z-index: 2200;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
#emu-toast.emu-toast-show { opacity: 1; }
@media (max-width: 560px) {
  .emu-btn { width: 32px; height: 32px; }
  .emu-btn svg { width: 16px; height: 16px; }
  .emu-btn::after { display: none; } /* no hover on touch */
}
@media (prefers-reduced-motion: reduce) {
  #emu-bar, #emu-toast, .emu-btn::after { transition: none; }
  .emu-chip-listen { animation: none; }
}
`;
    document.head.appendChild(style);
  }
}

export default EmulatorUI;
