// Minimal AudioWorkletGlobalScope declarations for vgm-worklet.ts.
// (Avoids pulling in the full @types/audioworklet dependency.)

declare const sampleRate: number;

declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

declare function registerProcessor(
  name: string,
  processorCtor: new () => AudioWorkletProcessor
): void;
