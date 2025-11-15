/**
 * Specie - Character Species System
 * Defines character species with stat modifiers
 */

import { PSGame } from '../PSGame';

// Specie enum
export enum Specie {
  PALMAN,
  MUSK_CAT,
  NUMAN,
  ANDROID,
  MOTAVIAN,
  DEZORIAN,
  CYBORG
}

export class SpecieHelper {
  // About mods: +1 hp = 2 points; +1 any other = 1 point. So all species are balanced.
  private static readonly specieConfigs = new Map<Specie, {
    modHp: number, modMp: number, modAgi: number, modStr: number, modMen: number
  }>([
    // HP MP AGI STR MEN - hp=4, mp=3, other=1
    [Specie.PALMAN, { modHp: 0, modMp: 0, modAgi: 0, modStr: 0, modMen: 0 }],
    [Specie.MUSK_CAT, { modHp: -3, modMp: 2, modAgi: 3, modStr: 0, modMen: 3 }], // -12+6+3+3 = 0
    [Specie.NUMAN, { modHp: 1, modMp: 0, modAgi: 2, modStr: -3, modMen: -3 }],   // +4+2-3-3 = 0
    [Specie.ANDROID, { modHp: 0, modMp: 0, modAgi: -2, modStr: 0, modMen: 2 }],  // -2+2 = 0
    [Specie.MOTAVIAN, { modHp: 1, modMp: -1, modAgi: 0, modStr: 2, modMen: -3 }], // +4-3+2-3 = 0
    [Specie.DEZORIAN, { modHp: -1, modMp: 2, modAgi: -2, modStr: -3, modMen: 3 }], // -4+6-2-3+3 = 0
    [Specie.CYBORG, { modHp: 0, modMp: 0, modAgi: 0, modStr: 0, modMen: 0 }]
  ]);

  /**
   * Get HP modifier for species
   */
  public static getModHp(specie: Specie): number {
    return this.specieConfigs.get(specie)?.modHp || 0;
  }

  /**
   * Get MP modifier for species
   */
  public static getModMp(specie: Specie): number {
    return this.specieConfigs.get(specie)?.modMp || 0;
  }

  /**
   * Get Agility modifier for species
   */
  public static getModAgi(specie: Specie): number {
    return this.specieConfigs.get(specie)?.modAgi || 0;
  }

  /**
   * Get Strength modifier for species
   */
  public static getModStr(specie: Specie): number {
    return this.specieConfigs.get(specie)?.modStr || 0;
  }

  /**
   * Get Mental modifier for species
   */
  public static getModMen(specie: Specie): number {
    return this.specieConfigs.get(specie)?.modMen || 0;
  }

  /**
   * Get localized species name
   */
  public static toString(specie: Specie): string {
    const s = specie.toString();
    const formatted = s.substring(0, 1) + s.substring(1).toLowerCase();
    return PSGame.getString(`Specie_${formatted}`);
  }
}