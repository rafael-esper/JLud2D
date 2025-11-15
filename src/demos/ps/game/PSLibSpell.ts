/**
 * PSLibSpell - Phantasy Star Spell Library
 * Defines all spells, their costs, and effects
 */

import { Effect, EffectOutcome, EffectPlace, EffectTarget, PSEffect } from './PSEffect';
import { PartyMember } from './PartyMember';
import { PSGame } from '../PSGame';

// Spell interface
export interface Spell {
  getMpCost(): number;
  getEffect(): Effect;
}

// PS1 Spell enum
export enum PS1Spell {
  // Healing spells
  REST,
  CURE,
  W_REST,
  W_CURE,
  REVIVE,
  F_REVIVE,

  // Utility spells
  FLY,
  EXIT,
  TRAP,
  OPEN,

  // Communication spells
  ESCAPE,
  CHAT,
  TELE,

  // Control spells
  ROPE,
  ROPE_ALL,
  FEAR,
  FEAR_ALL,
  WALL,
  FORCE,
  PROT,

  // Attack spells
  FIRE,
  GI_FIRE,
  WIND,
  THUNDER,

  // Light spell
  LIGHT,
  POWER_CURE
}

export class PS1SpellHelper {
  private static readonly spellConfigs = new Map<PS1Spell, {
    mpCost: number,
    nameString: string,
    effect: Effect
  }>([
    // Healing spells
    [PS1Spell.REST, { mpCost: 2, nameString: "Spell_Heal", effect: Effect.CURE }],
    [PS1Spell.CURE, { mpCost: 6, nameString: "Spell_Cure", effect: Effect.CURE }],
    [PS1Spell.W_REST, { mpCost: 2, nameString: "Spell_Heal", effect: Effect.WCURE }],
    [PS1Spell.W_CURE, { mpCost: 6, nameString: "Spell_Cure", effect: Effect.WCURE }],
    [PS1Spell.REVIVE, { mpCost: 12, nameString: "Spell_Rebirth", effect: Effect.REVIVE }],
    [PS1Spell.F_REVIVE, { mpCost: 30, nameString: "Spell_FullRebirth", effect: Effect.F_REVIVE }],

    // Utility spells
    [PS1Spell.FLY, { mpCost: 8, nameString: "Spell_Fly", effect: Effect.FLY }],
    [PS1Spell.EXIT, { mpCost: 4, nameString: "Spell_Bypass", effect: Effect.EXIT }],
    [PS1Spell.TRAP, { mpCost: 2, nameString: "Spell_Untrap", effect: Effect.TRAP }],
    [PS1Spell.OPEN, { mpCost: 4, nameString: "Spell_Open", effect: Effect.OPEN }],

    // Communication spells
    [PS1Spell.ESCAPE, { mpCost: 2, nameString: "Spell_Bye", effect: Effect.ESCAPE }],
    [PS1Spell.CHAT, { mpCost: 2, nameString: "Spell_Chat", effect: Effect.CHAT }],
    [PS1Spell.TELE, { mpCost: 4, nameString: "Spell_Telepathy", effect: Effect.TELE }],

    // Control spells
    [PS1Spell.ROPE, { mpCost: 4, nameString: "Spell_Rope", effect: Effect.ROPE }],
    [PS1Spell.ROPE_ALL, { mpCost: 20, nameString: "Spell_RopeAll", effect: Effect.ROPE_ALL }],
    [PS1Spell.FEAR, { mpCost: 2, nameString: "Spell_Terror", effect: Effect.FEAR }],
    [PS1Spell.FEAR_ALL, { mpCost: 12, nameString: "Spell_TerrorAll", effect: Effect.FEAR_ALL }],
    [PS1Spell.WALL, { mpCost: 6, nameString: "Spell_Waller", effect: Effect.WALL }],
    [PS1Spell.FORCE, { mpCost: 10, nameString: "Spell_Power", effect: Effect.FORCE }],
    [PS1Spell.PROT, { mpCost: 8, nameString: "Spell_Magic_waller", effect: Effect.PROT }],

    // Attack spells
    [PS1Spell.FIRE, { mpCost: 4, nameString: "Spell_Fire", effect: Effect.FIRE }],
    [PS1Spell.GI_FIRE, { mpCost: 14, nameString: "Spell_GiFire", effect: Effect.GIFIRE }],
    [PS1Spell.WIND, { mpCost: 12, nameString: "Spell_Wind", effect: Effect.WIND }],
    [PS1Spell.THUNDER, { mpCost: 18, nameString: "Spell_Thunder", effect: Effect.THUNDER }],

    // Light spell
    [PS1Spell.LIGHT, { mpCost: 2, nameString: "Spell_Light", effect: Effect.LIGHT }],
    [PS1Spell.POWER_CURE, { mpCost: 12, nameString: "Spell_PowerCure", effect: Effect.CURE }]
  ]);

  public static getMpCost(spell: PS1Spell): number {
    return this.spellConfigs.get(spell)?.mpCost || 0;
  }

  public static getEffect(spell: PS1Spell): Effect {
    return this.spellConfigs.get(spell)?.effect || Effect.NONE;
  }

  public static toString(spell: PS1Spell): string {
    const nameString = this.spellConfigs.get(spell)?.nameString;
    if (nameString) {
      return PSGame.getString(nameString);
    }
    return spell.toString();
  }
}

// PS1SpellImpl class implements Spell interface for each spell
export class PS1SpellImpl implements Spell {
  private spell: PS1Spell;

  constructor(spell: PS1Spell) {
    this.spell = spell;
  }

  public getMpCost(): number {
    return PS1SpellHelper.getMpCost(this.spell);
  }

  public getEffect(): Effect {
    return PS1SpellHelper.getEffect(this.spell);
  }

  public toString(): string {
    return PS1SpellHelper.toString(this.spell);
  }

  public getSpell(): PS1Spell {
    return this.spell;
  }
}

// Factory class for creating spell instances
export class SpellFactory {
  public static createSpell(spell: PS1Spell): Spell {
    return new PS1SpellImpl(spell);
  }
}

// Spell preparation and casting functions (simplified for now)
// Note: These would need full PSMenu implementation

export class PSLibSpell {
  /**
   * Prepare spell for casting - simplified version of Java prepareSpell
   */
  public static prepareSpell(spell: Spell, caster: PartyMember): PSEffect | null {
    // Implementation would require full PSEffect, PSMenu, and PartyMember classes
    console.warn('prepareSpell not yet fully implemented - requires PSEffect, PSMenu, and PartyMember');
    return null;
  }

  /**
   * Cast prepared spell - simplified version of Java castSpell
   */
  public static castSpell(spell: Spell, effect: PSEffect): EffectOutcome {
    // Implementation would require full PSEffect, PSMenu, and PartyMember classes
    console.warn('castSpell not yet fully implemented - requires PSEffect, PSMenu, and PartyMember');
    return EffectOutcome.NONE;
  }
}