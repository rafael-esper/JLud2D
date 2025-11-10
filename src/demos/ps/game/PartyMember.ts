/**
 * PartyMember - Party Character System
 * Direct port of PartyMember.java - Defines playable characters with equipment, spells, and progression
 */

import { Battler } from './Battler';
import { Job, JobHelper } from './Job';
import { Specie, SpecieHelper } from './Specie';
import { Item, EquipPlace, ItemType } from './Item';
import { Spell } from './PSLibSpell';
import { EffectPlace } from './Item';
import { PS1Image } from './PSLibImage';
import { PSGame } from '../PSGame';

// Forward declarations for types that will be implemented later
export interface MenuLabelBox {
  // Will be defined when we port MenuLabelBox
  updateText(index: number, text: string): void;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export class GenderHelper {
  public static toString(gender: Gender): string {
    const s = gender.toString();
    const formatted = s.substring(0, 1) + s.substring(1).toLowerCase();
    return PSGame.getString(`Gender_${formatted}`);
  }
}

export class PartyMember extends Battler {
  public static readonly ITEMS_SIZE: number = 10;

  // Core character data
  private charPath: string;
  private gender: Gender;
  private spe: Specie;
  private job: Job;
  private name: string;

  // Stats
  private atk: number = 0;
  private def: number = 0;
  private maxHp: number = 0;
  private maxMp: number = 0;
  public hp: number = 0;
  public mp: number = 0;
  public level: number = 0;
  public xp: number = 0;

  // Equipment and inventory
  public equipment: (Item | null)[] = new Array(Object.keys(EquipPlace).length).fill(null);
  public items: Item[] = [];
  public spells: Spell[] = [];

  // Graphics
  public portrait: PS1Image | null = null;
  public smallPortrait: PS1Image | null = null;

  // Battle UI
  public textBox: MenuLabelBox | null = null;

  // Job/Species equipment restrictions
  private static readonly jobEquipmentMap = new Map<Job, ItemType[]>([
    [Job.ADVENTURER, [ItemType.SWORD, ItemType.WAND, ItemType.MAIL, ItemType.LIGHT_SHIELD, ItemType.BARRIER]],
    [Job.WATCHER, [ItemType.PISTOL, ItemType.ARMOR, ItemType.BARRIER]],
    [Job.ESPER, [ItemType.WAND, ItemType.MANTLE, ItemType.BARRIER]],
    [Job.HUNTER, [ItemType.SLICER, ItemType.WAND, ItemType.MAIL, ItemType.FUR, ItemType.LIGHT_SHIELD, ItemType.BARRIER, ItemType.GLOVES]],
    [Job.NATURER, [ItemType.CLAW, ItemType.FUR, ItemType.GLOVES]],
    [Job.PRIEST, [ItemType.WAND, ItemType.MANTLE, ItemType.BARRIER]],
    [Job.FIGHTER, [ItemType.SWORD, ItemType.PISTOL, ItemType.AXE, ItemType.WAND, ItemType.MAIL, ItemType.ARMOR, ItemType.LIGHT_SHIELD, ItemType.BARRIER, ItemType.HEAVY_SHIELD]]
  ]);

  private static readonly specieRestrictions = new Map<Specie, ItemType[]>([
    [Specie.MUSK_CAT, [ItemType.SWORD, ItemType.AXE, ItemType.WAND, ItemType.PISTOL, ItemType.MAIL, ItemType.ARMOR,
                       ItemType.MANTLE, ItemType.BARRIER, ItemType.LIGHT_SHIELD, ItemType.HEAVY_SHIELD]]
  ]);

  // Constructor with portrait
  constructor(gender: Gender, spe: Specie, job: Job, name: string, portrait: PS1Image, charPath: string);
  constructor(gender: Gender, spe: Specie, job: Job, name: string, charPath: string);
  constructor(
    gender: Gender,
    spe: Specie,
    job: Job,
    name: string,
    portraitOrCharPath: PS1Image | string,
    charPath?: string
  ) {
    super();

    this.setGender(gender);
    this.setSpe(spe);
    this.setJob(job);
    this.name = name;

    if (charPath !== undefined) {
      // First constructor variant (with portrait) - 6 parameters
      this.portrait = portraitOrCharPath as PS1Image;
      this.setCharPath(charPath || '');
    } else {
      // Second constructor variant (no portrait) - 5 parameters
      this.setCharPath(portraitOrCharPath as string || '');
    }

    this.xp = 0;
    this.level = 0;
    this.advanceLevel(); // To Level 1

    this.heal();
    this.equipDefault();
  }

  private equipDefault(): void {
    if (this.getCharPath() === '') { // Fake 'Char', created for testing purposes
      return;
    }

    // Note: This would need PSGame.getItem implementation and OriginalItem enum
    switch (this.getJob()) {
      case Job.ADVENTURER:
        // equipItem(PSGame.getItem(OriginalItem.Weapon_Short_Sword));
        // equipItem(PSGame.getItem(OriginalItem.Armor_Leather_Clothes));
        break;
      case Job.FIGHTER:
        // equipItem(PSGame.getItem(OriginalItem.Weapon_Iron_Axe));
        // equipItem(PSGame.getItem(OriginalItem.Armor_Iron_Armor));
        break;
      case Job.ESPER:
        // equipItem(PSGame.getItem(OriginalItem.Weapon_Wood_Cane));
        // equipItem(PSGame.getItem(OriginalItem.Armor_White_Cloak));
        break;
      case Job.ROBOT:
        // equipItem(PSGame.getItem(OriginalItem.Weapon_Mini_Cannon));
        break;
      default:
        break;
    }
  }

  // True if learned a new spell, False otherwise - direct port from Java
  public advanceLevel(): boolean {
    if (this.level >= 100) {
      console.error("Can't advance level past 100.");
      return false;
    }

    this.level = this.level + 1;
    const requiredXp = JobHelper.getXp(this.job, this.level);
    if (this.xp < requiredXp) {
      this.xp = requiredXp;
    }

    this.maxHp = JobHelper.getHp(this.job, this.spe, this.level);
    this.maxMp = JobHelper.getMp(this.job, this.spe, this.level);

    const currentAtk = JobHelper.getAtk(this.job, this.level);
    const previousAtk = this.level > 1 ? JobHelper.getAtk(this.job, this.level - 1) : 0;
    this.atk += currentAtk - previousAtk;

    const currentDef = JobHelper.getDef(this.job, this.level);
    const previousDef = this.level > 1 ? JobHelper.getDef(this.job, this.level - 1) : 0;
    this.def += currentDef - previousDef;

    // If has spell(s) for this level
    const spellMap = JobHelper.getMapLevelSpell(this.job);
    const levelSpells = spellMap.get(this.level);
    if (levelSpells) {
      for (const spell of levelSpells) {
        this.spells.push(spell);
      }
      return true;
    }

    return false;
  }

  public heal(): void {
    this.hp = this.getMaxHp();
    this.mp = this.getMaxMp();
  }

  public canEquip(type: ItemType): boolean {
    // Species can't equip this item
    const specieRestrictions = PartyMember.specieRestrictions.get(this.getSpe());
    if (specieRestrictions && specieRestrictions.includes(type)) {
      return false;
    }

    // Job can equip this item
    const jobEquipment = PartyMember.jobEquipmentMap.get(this.getJob());
    if (jobEquipment && jobEquipment.includes(type)) {
      return true;
    }

    return false;
  }

  public getNumItems(): number {
    return this.items.length;
  }

  public isFull(): boolean {
    return this.items.length >= PartyMember.ITEMS_SIZE;
  }

  public addItem(item: Item): void {
    if (item.type === ItemType.QUEST || item.type === ItemType.VEHICLE) {
      // PSGame.getParty().addQuestItem(item);
      console.warn('Quest item handling not yet implemented - requires Party class');
    } else {
      this.items.push(item);
    }
  }

  public removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  public equipItemByIndex(index: number): void {
    const item = this.items[index];
    this.equipItem(item);
    this.items.splice(index, 1);
  }

  public equipItem(item: Item): void {
    const equipPlace = item.type; // This would need ItemTypeHelper.getEquipPlace(item.type)

    // Note: This is simplified - would need proper EquipPlace mapping
    let equipIndex = 0;
    switch (item.type) {
      case ItemType.SWORD:
      case ItemType.AXE:
      case ItemType.WAND:
      case ItemType.CLAW:
      case ItemType.PISTOL:
      case ItemType.CANNON:
      case ItemType.SLICER:
        equipIndex = 0; // WEAPON
        break;
      case ItemType.MAIL:
      case ItemType.ARMOR:
      case ItemType.MANTLE:
      case ItemType.FUR:
        equipIndex = 1; // CHEST
        break;
      case ItemType.GLOVES:
      case ItemType.BARRIER:
      case ItemType.LIGHT_SHIELD:
      case ItemType.HEAVY_SHIELD:
        equipIndex = 2; // COVER
        break;
      default:
        return;
    }

    // If there is an equipped item, unequip it
    if (this.equipment[equipIndex] !== null) {
      this.unEquip(equipIndex as any); // Cast needed for EquipPlace
    }

    // Increment stats
    if (equipIndex === 0) { // WEAPON
      this.atk += item.itemstat;
    } else {
      this.def += item.itemstat;
    }

    this.equipment[equipIndex] = item;
  }

  public unEquip(equipPlace: EquipPlace): void {
    const equipIndex = Object.values(EquipPlace).indexOf(equipPlace);
    const item = this.equipment[equipIndex];

    if (!item) return;

    switch (equipPlace) {
      case EquipPlace.WEAPON:
        this.atk -= item.itemstat;
        break;
      case EquipPlace.CHEST:
      case EquipPlace.COVER:
        this.def -= item.itemstat;
        break;
    }

    this.items.push(item);
    this.equipment[equipIndex] = null;
  }

  public getItems(): Item[] {
    return this.items;
  }

  public getSpells(place: EffectPlace): Spell[] {
    const spellList: Spell[] = [];
    for (const spell of this.spells) {
      const effect = spell.getEffect();
      // Note: This would need proper Effect.getPlace() implementation
      // For now, simplified check
      spellList.push(spell); // Add all spells for now
    }
    return spellList;
  }

  public listSpells(place: EffectPlace): string[] {
    const spellList = this.getSpells(place);
    return spellList.map(spell => spell.toString());
  }

  // Battler abstract methods implementation
  public getName(): string {
    return this.name;
  }

  public getAtk(): number {
    return this.atk;
  }

  public getDef(): number {
    return this.def;
  }

  public getHp(): number {
    return this.hp;
  }

  public setHp(hp: number): void {
    this.hp = hp;
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  public getLevel(): number {
    return this.level;
  }

  public getAgi(): number {
    let mod = 10;
    switch (this.getSpe()) {
      case Specie.MUSK_CAT:
        mod = 21;
        break;
      case Specie.NUMAN:
        mod = 17;
        break;
      case Specie.MOTAVIAN:
        mod = 13;
        break;
      default:
        break;
    }
    return Math.floor((JobHelper.getAtk(this.job, this.level) * mod) / 8);
  }

  public getMental(): number {
    const defValue = JobHelper.getDef(this.job, this.level);
    const mpValue = JobHelper.getMp(this.job, this.spe, this.level);
    return Math.floor((defValue + (mpValue + 4) * 4) / 4);
  }

  public getStr(): number {
    const atkValue = JobHelper.getAtk(this.job, this.level);
    const hpValue = JobHelper.getHp(this.job, this.spe, this.level);
    return Math.floor((atkValue * 3 + (hpValue - 4)) / 4);
  }

  // Additional getters/setters
  public getMp(): number {
    return this.mp;
  }

  public setMp(mp: number): void {
    this.mp = mp;
  }

  public getMaxMp(): number {
    if (this.spells.length === 0) {
      return 0;
    }
    return this.maxMp;
  }

  public getXp(): number {
    return this.xp;
  }

  public giveExp(gainedExp: number): void {
    const remainingXp = JobHelper.getXp(this.job, this.getLevel() + 1) - this.xp;
    this.xp += gainedExp;

    if (remainingXp <= gainedExp) { // TODO: Advance more than once, if enough Exp
      // PSGame.playSound(PS1Sound.LEVEL_UP);
      // PSMenu.StextNext(PSGame.getString("Battle_Level_Up", "<player>", this.getName()));
      console.log(`${this.getName()} leveled up!`);

      if (this.advanceLevel()) {
        // PSMenu.StextNext(PSGame.getString("Battle_Learn_Spell", "<player>", this.getName()));
        console.log(`${this.getName()} learned new spell(s)!`);
      }
    }
  }

  public getSpe(): Specie {
    return this.spe;
  }

  public setSpe(spe: Specie): void {
    this.spe = spe;
  }

  public getGender(): Gender {
    return this.gender;
  }

  public setGender(gender: Gender): void {
    this.gender = gender;
  }

  public getJob(): Job {
    return this.job;
  }

  public setJob(job: Job): void {
    this.job = job;
  }

  public getCharPath(): string {
    return this.charPath;
  }

  public setCharPath(charPath: string): void {
    this.charPath = charPath;
  }

  public toString(): string {
    return `${this.name} level ${this.level} is a ${SpecieHelper.toString(this.spe)} ${JobHelper.toString(this.job)} with ${this.maxHp} HP and ${this.maxMp} MP. ATK: ${this.atk} DEF: ${this.def}`;
  }
}