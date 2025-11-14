/**
 * Item - Game Item System
 * Defines items, equipment, and their properties
 */

import { PS1Sound } from './PSLibSound';
import { PSGame } from '../PSGame';
import { CHR } from '../../../domain/CHR';

import { Effect, EffectPlace, EffectTarget } from './PSEffect';

export enum EquipPlace {
  WEAPON, CHEST, COVER
}

export enum ItemType {
  // Weapons
  WAND,
  SWORD,
  AXE,
  SLICER,
  CLAW,
  PISTOL,
  CANNON,

  // Armor
  MAIL,
  ARMOR,
  MANTLE,
  FUR,

  // Shields/Covers
  GLOVES,
  BARRIER,
  LIGHT_SHIELD,
  HEAVY_SHIELD,

  // Non-equipment
  ITEM,
  QUEST,
  VEHICLE,
  SECRET
}

export class ItemTypeHelper {
  private static readonly typeConfigs = new Map<ItemType, { place: EquipPlace | null }>([
    // Weapons
    [ItemType.WAND, { place: EquipPlace.WEAPON }],
    [ItemType.SWORD, { place: EquipPlace.WEAPON }],
    [ItemType.AXE, { place: EquipPlace.WEAPON }],
    [ItemType.SLICER, { place: EquipPlace.WEAPON }],
    [ItemType.CLAW, { place: EquipPlace.WEAPON }],
    [ItemType.PISTOL, { place: EquipPlace.WEAPON }],
    [ItemType.CANNON, { place: EquipPlace.WEAPON }],

    // Armor
    [ItemType.MAIL, { place: EquipPlace.CHEST }],
    [ItemType.ARMOR, { place: EquipPlace.CHEST }],
    [ItemType.MANTLE, { place: EquipPlace.CHEST }],
    [ItemType.FUR, { place: EquipPlace.CHEST }],

    // Shields/Covers
    [ItemType.GLOVES, { place: EquipPlace.COVER }],
    [ItemType.BARRIER, { place: EquipPlace.COVER }],
    [ItemType.LIGHT_SHIELD, { place: EquipPlace.COVER }],
    [ItemType.HEAVY_SHIELD, { place: EquipPlace.COVER }],

    // Non-equipment
    [ItemType.ITEM, { place: null }],
    [ItemType.QUEST, { place: null }],
    [ItemType.VEHICLE, { place: null }],
    [ItemType.SECRET, { place: null }]
  ]);

  public static getEquipPlace(type: ItemType): EquipPlace | null {
    return this.typeConfigs.get(type)?.place || null;
  }
}

export class Item {
  public static readonly MAX_ITEM_PRICE_LENGTH: number = 5; // Up to '99999'

  private varName: string;
  private cost: number;
  public itemstat: number;
  public type: ItemType;

  // Weapon animation
  private chrWeaponAnimation: CHR | null = null;
  private strWeaponAnimation: string | null = null;
  public weaponSound: PS1Sound | null = null;

  public effect: Effect;

  // Constructor with weapon animation
  constructor(str: string, mesetas: number, type: ItemType, modifier: number, chrWeapon: string, sound: PS1Sound);
  constructor(name: string, price: number, type: ItemType, modifier: number, effect: Effect);
  constructor(
    nameOrStr: string,
    priceOrMesetas: number,
    type: ItemType,
    modifier: number,
    effectOrChrWeapon: Effect | string,
    sound?: PS1Sound
  ) {
    this.varName = nameOrStr;
    this.cost = priceOrMesetas;
    this.type = type;
    this.itemstat = modifier;

    if (typeof effectOrChrWeapon === 'string' && sound) {
      // First constructor variant (weapon with animation)
      this.effect = Effect.NONE;
      this.strWeaponAnimation = effectOrChrWeapon;
      this.weaponSound = sound;
    } else {
      // Second constructor variant (item with effect)
      this.effect = effectOrChrWeapon as Effect;
    }
  }

  public isEquippable(): boolean {
    if (this.type === ItemType.ITEM ||
        this.type === ItemType.VEHICLE ||
        this.type === ItemType.QUEST) {
      return false;
    }
    return true;
  }

  public getName(): string {
    try {
      return PSGame.getString(this.varName);
    } catch (error) {
      return this.varName;
    }
  }

  public async getChrWeaponAnimation(scene?: Phaser.Scene): Promise<CHR | null> {
    if (this.chrWeaponAnimation === null && this.strWeaponAnimation) {
      if (scene) {
        // Note: This would need to be adapted based on how CHR.loadChr works in the TypeScript version
        console.warn('CHR weapon animation loading not yet implemented in TypeScript version');
      }
    }
    return this.chrWeaponAnimation;
  }

  public getCost(): number {
    return this.cost;
  }

  public getEffect(): Effect {
    return this.effect;
  }

  public getStat(): number {
    return this.itemstat;
  }

  public isQuest(): boolean {
    if (this.type === ItemType.QUEST ||
        this.type === ItemType.VEHICLE ||
        this.type === ItemType.SECRET) {
      return true;
    }
    return false;
  }

  public toString(): string {
    return this.getName();
  }

  // Static utility methods
  public static toString(items: Item[], showCost: boolean): string[] {
    return this.toStringFromList(items, showCost);
  }

  public static toStringFromList(items: Item[], showCost: boolean): string[] {
    const s: string[] = new Array(items.length);
    let maxSize = 0;

    // Find maximum name length
    for (let i = 0; i < s.length; i++) {
      if (items[i].getName().length > maxSize) {
        maxSize = items[i].getName().length;
      }
    }

    // Format strings with optional cost display
    for (let i = 0; i < s.length; i++) {
      if (showCost) {
        const numSpaces = Math.max(0, maxSize - items[i].getName().length);
        s[i] = items[i].getName() + ' '.repeat(numSpaces);
        const costSpaces = 1 + Item.MAX_ITEM_PRICE_LENGTH - items[i].cost.toString().length;
        s[i] = s[i] + ' '.repeat(costSpaces) + items[i].cost;
      } else {
        s[i] = items[i].getName();
      }
    }

    return s;
  }

  // Equality and hash methods for proper comparison
  public equals(other: Item): boolean {
    if (this === other) return true;
    if (!other) return false;

    return this.varName === other.varName &&
           this.cost === other.cost &&
           this.itemstat === other.itemstat &&
           this.type === other.type &&
           this.strWeaponAnimation === other.strWeaponAnimation &&
           this.weaponSound === other.weaponSound &&
           this.effect === other.effect;
  }

  public hashCode(): number {
    let hash = 0;
    const str = `${this.varName}-${this.cost}-${this.itemstat}-${this.type}-${this.strWeaponAnimation}-${this.weaponSound}-${this.effect}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}