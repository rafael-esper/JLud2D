// Main-thread controller for the streaming VGM engine.
//
// Owns the AudioContext, the vgm-processor AudioWorkletNode (which runs the
// bit-exact emulator on the audio thread), and a master GainNode for
// volume/mute. Playback starts the instant bytes are posted to the worklet —
// no whole-track pre-render, so no AudioBuffer cache is needed.

// The worklet is pre-bundled to a self-contained classic script in public/
// (see scripts/build-worklet.mjs) and served at <base>/vgm-worklet.js.
// (import.meta.env is Vite-injected; typed loosely to avoid needing vite/client.)
const BASE_URL = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
const WORKLET_URL = `${BASE_URL}vgm-worklet.js`;

export interface VgmEngineOptions {
  sampleRate?: number;
}

/**
 * Gunzip a .vgz payload if needed, using the native DecompressionStream
 * (no pako dependency). Passes through already-inflated .vgm data.
 */
export async function inflateVgmIfNeeded(data: Uint8Array): Promise<Uint8Array> {
  if (data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b) {
    const ds = new DecompressionStream('gzip');
    const stream = new Response(data as unknown as BodyInit).body!.pipeThrough(ds);
    const buf = await new Response(stream).arrayBuffer();
    return new Uint8Array(buf);
  }
  return data;
}

export class VgmEnginePlayer {
  private ctx: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private gain: GainNode | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private playing = false;

  private volume = 1;
  private muted = false;

  private readonly sampleRate: number;

  constructor(options: VgmEngineOptions = {}) {
    this.sampleRate = options.sampleRate ?? 44100;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate,
      });

      await this.ctx.audioWorklet.addModule(WORKLET_URL);

      this.node = new AudioWorkletNode(this.ctx, 'vgm-processor', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });
      this.node.port.onmessage = (e: MessageEvent) => {
        if (e.data?.type === 'ended') this.playing = false;
      };

      this.gain = this.ctx.createGain();
      this.node.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      this.applyGain();

      this.initialized = true;
    })();

    return this.initPromise;
  }

  /**
   * Start (or switch to) a track. `data` is raw or gzipped VGM bytes.
   * Returns as soon as the bytes are handed to the audio thread.
   */
  async play(data: Uint8Array, loop: boolean = true): Promise<void> {
    if (!this.initialized) await this.initialize();
    if (!this.ctx || !this.node) throw new Error('VgmEnginePlayer not initialized');

    const vgm = await inflateVgmIfNeeded(data);

    // Copy into a fresh transferable ArrayBuffer (the worklet takes ownership)
    const copy = vgm.slice();
    const buffer = copy.buffer as ArrayBuffer;
    this.node.port.postMessage({ type: 'load', data: buffer, loop }, [buffer]);
    this.playing = true;

    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  stop(): void {
    if (this.node) this.node.port.postMessage({ type: 'stop' });
    this.playing = false;
  }

  /** Shelve the current track (exact position + chip state) for resume(). */
  pause(): void {
    if (this.node) this.node.port.postMessage({ type: 'pause' });
    this.playing = false;
  }

  /** Restore the track shelved by pause(), continuing where it stopped. */
  resume(): void {
    if (this.node) this.node.port.postMessage({ type: 'resume' });
    this.playing = true;
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  isPlaying(): boolean {
    return this.playing;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyGain();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyGain();
  }

  private applyGain(): void {
    if (this.gain) this.gain.gain.value = this.muted ? 0 : this.volume;
  }

  resumeAudio(): void {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }
}
