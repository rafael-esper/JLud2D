/**
 * PSBattle - Phantasy Star Battle System Enums
 * Direct port of PSBattle.java enums - Battle system definitions
 */

export enum Action {
  NONE,
  FIGHT,
  MAGIC,
  TALK,
  ITEM,
  RUN
}

export enum BattleOutcome {
  VICTORY,
  DEFEAT,
  ESCAPED,
  TALKED
}

export enum BattleMode {
  NORMAL,
  SURPRISE_ATTACK,
  SURPRISED,
  PINCER_ATTACK,
  PINCERED
}