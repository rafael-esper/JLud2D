// AudioWorklet processor that streams VGM audio in real time.
//
// This is the browser equivalent of the Java EmuPlayer background thread: it
// owns a VgmStream and fills each render quantum on the audio thread, so
// playback starts immediately and never blocks the main thread. All the DSP
// lives in VgmStream / VgmEmu (verified bit-identical to the Java engine);
// this file is only the audio-thread plumbing.

/// <reference types="./worklet-types" />

import { VgmStream } from './VgmStream';

interface LoadMessage {
  type: 'load';
  data: ArrayBuffer;
  loop: boolean;
}
interface StopMessage {
  type: 'stop';
}
type InMessage = LoadMessage | StopMessage;

class VgmProcessor extends AudioWorkletProcessor {
  private stream: VgmStream | null = null;

  constructor() {
    super();
    this.port.onmessage = (e: MessageEvent<InMessage>) => {
      const msg = e.data;
      if (msg.type === 'load') {
        this.stream = new VgmStream(new Uint8Array(msg.data), sampleRate, msg.loop);
      } else if (msg.type === 'stop') {
        this.stream = null;
      }
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0];
    if (!output || output.length === 0) return true;

    const left = output[0];
    const right = output.length > 1 ? output[1] : output[0];
    const frames = left.length;

    if (!this.stream) {
      left.fill(0);
      if (right !== left) right.fill(0);
      return true;
    }

    this.stream.fill(left, right, frames);

    if (this.stream.isEnded()) {
      this.port.postMessage({ type: 'ended' });
      this.stream = null;
    }

    return true; // keep the node alive for the next track
  }
}

registerProcessor('vgm-processor', VgmProcessor);
