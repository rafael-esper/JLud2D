/**
 * Alex Kidd music track paths. Tracks are fetched on first play and
 * streamed instantly after that — no preloading needed.
 */

const BASE_FOLDER = 'src/demos/ak/res/music';

export const AkMusic = {
  INTRO: `${BASE_FOLDER}/intro.vgz`,
  FIELD: `${BASE_FOLDER}/field.vgz`,
  SWIM: `${BASE_FOLDER}/swim.vgz`,
  MOTO: `${BASE_FOLDER}/moto.vgz`
} as const;
