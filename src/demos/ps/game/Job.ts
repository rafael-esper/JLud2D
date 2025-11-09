/**
 * Job - Character Job System
 * Direct port of Job.java - Defines character jobs/classes with stats and spell progression
 */

import { PSGame } from '../PSGame';
import { Spell, PS1Spell, SpellFactory } from './PSLibSpell';
import { Specie, SpecieHelper } from './Specie';

// Job enum with stats - direct port from Job.java
export enum Job {
  ADVENTURER = 'ADVENTURER', // Alis, Rolf, Chaz - 36 Weap (9) + ATKTech(10) + ORITech (5) = 60
  NATURER = 'NATURER',       // Nei, Ryka, Myau - 39 Weap (6) + CURTech (10) + AGI (5) = 60
  FIGHTER = 'FIGHTER',       // Odin, Rudo - 48 Weap(12) = 60
  ESPER = 'ESPER',           // Noah, Rune - 33 Weap (3) + ATK2Tech (18) + MiscTech (6) = 60
  ROBOT = 'ROBOT',           // Hapsby
  HUNTER = 'HUNTER',         // Anna, Alys, Kyra - 39 Weap (6) + CBTTech(10) + AGI (5)
  MECHANIC = 'MECHANIC',     // Kain, Gryz - 45 Weap (9) + AntiTech (6) = 60
  PRIEST = 'PRIEST',         // Raja - 34 Weap (3) + CUR2Tech (18) + DEFTech (5) = 60
  SCHOLAR = 'SCHOLAR',       // Hahn, Hugh - 32 Weap (3) + CURTech (10) + CBTTech(10) + DEFTech (5) = 60
  HEALER = 'HEALER',         // Amy - 33 Weap (3) + CUR2Tech (18) + MiscTech (6) = 60
  THIEF = 'THIEF',           // Shir - 34 Weap (3) + MiscTech (6) + AGI (5) + THI (12) = 60
  GUARDIAN = 'GUARDIAN',     // Wren - 42 Weap (6) + MiscTech (6) + AutoCure (6) = 60
  WATCHER = 'WATCHER'        // Demi - 38 Weap (6) + CURTech (10) + AutoCure (6) = 60
}

export class JobHelper {
  private static readonly jobConfigs = new Map<Job, {
    baseHp: number, baseMp: number, aMod: number, dMod: number
  }>([
    [Job.ADVENTURER, { baseHp: 16, baseMp: 4, aMod: 2.2, dMod: 2.7 }],
    [Job.NATURER, { baseHp: 18, baseMp: 4, aMod: 2.4, dMod: 2.4 }],
    [Job.FIGHTER, { baseHp: 24, baseMp: 1, aMod: 3.1, dMod: 2.9 }],
    [Job.ESPER, { baseHp: 11, baseMp: 11, aMod: 1.4, dMod: 2.2 }],
    [Job.ROBOT, { baseHp: 12, baseMp: 1, aMod: 2.0, dMod: 2.6 }],
    [Job.HUNTER, { baseHp: 18, baseMp: 3, aMod: 2.0, dMod: 2.5 }],
    [Job.MECHANIC, { baseHp: 21, baseMp: 3, aMod: 2.0, dMod: 2.5 }],
    [Job.PRIEST, { baseHp: 12, baseMp: 10, aMod: 1.0, dMod: 2.5 }],
    [Job.SCHOLAR, { baseHp: 13, baseMp: 8, aMod: 1.0, dMod: 2.5 }],
    [Job.HEALER, { baseHp: 12, baseMp: 9, aMod: 1.0, dMod: 2.5 }],
    [Job.THIEF, { baseHp: 15, baseMp: 4, aMod: 1.0, dMod: 2.5 }],
    [Job.GUARDIAN, { baseHp: 20, baseMp: 2, aMod: 2.0, dMod: 2.5 }],
    [Job.WATCHER, { baseHp: 18, baseMp: 2, aMod: 2.0, dMod: 2.5 }]
  ]);

  // Level-to-spell mapping cache
  private static readonly spellMappings = new Map<Job, Map<number, Spell[]>>();

  public static getBaseHp(job: Job): number {
    return this.jobConfigs.get(job)?.baseHp || 0;
  }

  public static getBaseMp(job: Job): number {
    return this.jobConfigs.get(job)?.baseMp || 0;
  }

  public static getAMod(job: Job): number {
    return this.jobConfigs.get(job)?.aMod || 0;
  }

  public static getDMod(job: Job): number {
    return this.jobConfigs.get(job)?.dMod || 0;
  }

  // HP calculation - direct port from Java
  public static getHp(job: Job, specie: Specie, level: number): number {
    const baseHp = this.getBaseHp(job);
    const modHp = SpecieHelper.getModHp(specie);
    let value = baseHp + modHp;

    for (let i = 2; i <= level; i++) {
      value = value + ((baseHp + modHp) / 4) * (i + 6) / 9;
    }

    return Math.round(value);
  }

  // MP calculation - direct port from Java
  public static getMp(job: Job, specie: Specie, level: number): number {
    const baseMp = this.getBaseMp(job);
    const modMp = SpecieHelper.getModMp(specie);
    let value = baseMp + modMp;

    for (let i = 2; i <= level; i++) {
      value = value + ((baseMp + modMp) / 4) * (i + 6) / 7;
    }

    value = Math.round(value);

    // Make it even for small values
    if (value < 20 && value % 2 === 1) {
      return Math.floor(value + 1);
    } else {
      return Math.floor(value);
    }
  }

  // XP calculation - direct port from Java
  public static getXp(job: Job, level: number): number {
    const baseHp = this.getBaseHp(job);
    const baseMp = this.getBaseMp(job);
    const perturbation = Math.floor(2.3 * baseHp + 1.7 * baseMp);
    let value = 0;

    for (let i = 2; i <= level; i++) {
      value = value + ((13) * (i * i) / 7) + 10;
    }

    value = Math.round(value + Math.floor((perturbation * value / (190 - level))));
    return Math.floor(value);
  }

  // ATK calculation - direct port from Java
  public static getAtk(job: Job, level: number): number {
    const aMod = this.getAMod(job);
    let atk = Math.floor(aMod * 4);

    for (let i = 1; i < level; i++) {
      atk += aMod;
    }

    return Math.round(atk);
  }

  // DEF calculation - direct port from Java
  public static getDef(job: Job, level: number): number {
    const dMod = this.getDMod(job);
    let def = Math.round(dMod * 3);

    for (let i = 1; i < level; i++) {
      def += dMod;
    }

    return Math.round(def);
  }

  // Spell mapping - simplified for now (would need full PSLibSpell port)
  public static getMapLevelSpell(job: Job): Map<number, Spell[]> {
    if (!this.spellMappings.has(job)) {
      this.initLevelSpellMapping(job);
    }
    return this.spellMappings.get(job) || new Map();
  }

  private static initLevelSpellMapping(job: Job): void {
    const mapping = new Map<number, Spell[]>();

    // Direct port of Java spell mappings
    switch (job) {
      case Job.ADVENTURER:
        mapping.set(4, [SpellFactory.createSpell(PS1Spell.REST)]);
        mapping.set(5, [SpellFactory.createSpell(PS1Spell.ESCAPE)]);
        mapping.set(6, [SpellFactory.createSpell(PS1Spell.CHAT)]);
        mapping.set(8, [SpellFactory.createSpell(PS1Spell.FIRE)]); // Changed, was 12
        mapping.set(14, [SpellFactory.createSpell(PS1Spell.ROPE)]);
        mapping.set(16, [SpellFactory.createSpell(PS1Spell.FLY)]);
        mapping.set(20, [SpellFactory.createSpell(PS1Spell.CURE)]); // New
        mapping.set(26, [SpellFactory.createSpell(PS1Spell.GI_FIRE)]); // New
        mapping.set(30, [SpellFactory.createSpell(PS1Spell.ROPE_ALL)]); // New
        break;

      case Job.NATURER:
        mapping.set(6, [SpellFactory.createSpell(PS1Spell.CURE)]);
        mapping.set(9, [SpellFactory.createSpell(PS1Spell.FEAR)]);
        mapping.set(12, [SpellFactory.createSpell(PS1Spell.WALL)]);
        mapping.set(15, [SpellFactory.createSpell(PS1Spell.TRAP)]);
        mapping.set(17, [SpellFactory.createSpell(PS1Spell.EXIT)]);
        mapping.set(20, [SpellFactory.createSpell(PS1Spell.FORCE)]);
        mapping.set(22, [SpellFactory.createSpell(PS1Spell.FEAR_ALL)]); // New
        mapping.set(25, [SpellFactory.createSpell(PS1Spell.POWER_CURE)]); // New
        break;

      case Job.ESPER: // shifted by 2 some spells
        mapping.set(1, [SpellFactory.createSpell(PS1Spell.LIGHT), SpellFactory.createSpell(PS1Spell.FIRE)]);
        mapping.set(4, [SpellFactory.createSpell(PS1Spell.W_REST)]); // New
        mapping.set(7, [SpellFactory.createSpell(PS1Spell.W_CURE)]);
        mapping.set(8, [SpellFactory.createSpell(PS1Spell.EXIT)]); // 6+2
        mapping.set(10, [SpellFactory.createSpell(PS1Spell.TELE)]); // 8+2
        mapping.set(12, [SpellFactory.createSpell(PS1Spell.WIND)]);
        mapping.set(14, [SpellFactory.createSpell(PS1Spell.PROT)]);
        mapping.set(16, [SpellFactory.createSpell(PS1Spell.GI_FIRE)]); // New
        mapping.set(18, [SpellFactory.createSpell(PS1Spell.THUNDER)]);
        mapping.set(20, [SpellFactory.createSpell(PS1Spell.REVIVE)]);
        mapping.set(22, [SpellFactory.createSpell(PS1Spell.OPEN)]); // Was 17
        mapping.set(28, [SpellFactory.createSpell(PS1Spell.F_REVIVE)]); // New
        break;

      default:
        break;
    }

    this.spellMappings.set(job, mapping);
  }

  // Localized job name - direct port from Java
  public static toString(job: Job): string {
    const s = job.toString();
    const formatted = s.substring(0, 1) + s.substring(1).toLowerCase();
    return PSGame.getString(`Job_${formatted}`);
  }
}