/**
 * PSBattle - Battle System Enums
 * TypeScript port of PSBattle.java enums
 */

export enum Action {
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