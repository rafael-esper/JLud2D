/**
 * PartyMember - Party Character System
 * Defines playable characters with equipment, spells, and progression
 */

import { Battler } from './Battler';
import { Job, JobHelper } from './Job';
import { Specie, SpecieHelper } from './Specie';
import { Item, EquipPlace, ItemType } from './Item';
import { Spell } from './PSLibSpell';
import { EffectPlace, EffectHelper } from './PSEffect';
import { PS1Image } from './PSLibImage';
import { PSGame } from '../PSGame';
import { PS1Sound } from './PSLibSound';
import { PSMenu } from '../PSMenu';
import { OriginalItem } from './PSLibItem';
import { MenuLabelBox } from '../menu/MenuLabelBox';

export enum Gender {
  MALE,
  FEMALE
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

  // Core character data (assigned via setters in the constructor)
  private charPath!: string;
  private gender!: Gender;
  private spe!: Specie;
  private job!: Job;
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

    switch (this.getJob()) {
      case Job.ADVENTURER:
        this.equipItem(PSGame.getItem(OriginalItem.Weapon_Iron_Sword));
        this.equipItem(PSGame.getItem(OriginalItem.Armor_Leather_Clothes));
        break;
      case Job.FIGHTER:
        this.equipItem(PSGame.getItem(OriginalItem.Weapon_Iron_Axe));
        this.equipItem(PSGame.getItem(OriginalItem.Armor_Iron_Armor));
        break;
      case Job.ESPER:
        this.equipItem(PSGame.getItem(OriginalItem.Weapon_Wood_Cane));
        this.equipItem(PSGame.getItem(OriginalItem.Armor_White_Cloak));
        break;
      case Job.ROBOT:
        this.equipItem(PSGame.getItem(OriginalItem.Weapon_Mini_Cannon));
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
    // EquipPlace is a numeric enum, so the value IS the slot index.
    // (Object.values(...).indexOf() returned 3-5 because of the enum's
    // reverse mappings, hitting always-empty slots — equipping a new item
    // then stacked stats instead of replacing the old item's.)
    const equipIndex = equipPlace as number;
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
      const spellPlace = EffectHelper.getPlace(spell.getEffect());
      if (spellPlace === EffectPlace.ANY || spellPlace === place) {
        spellList.push(spell);
      }
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

  public async giveExp(gainedExp: number): Promise<void> {
    const remainingXp = JobHelper.getXp(this.job, this.getLevel() + 1) - this.xp;
    this.xp += gainedExp;

    if (remainingXp <= gainedExp) { // TODO: Advance more than once, if enough Exp
      PSGame.playSound(PS1Sound.LEVEL_UP);
      await PSMenu.StextNext(PSGame.getString("Battle_Level_Up", "<player>", this.getName()));

      if (this.advanceLevel()) {
        await PSMenu.StextNext(PSGame.getString("Battle_Learn_Spell", "<player>", this.getName()));
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

  // Methods for Church resurrection system
  public resurrect(): void {
    // Resurrect with 1 HP
    this.hp = 1;
    console.log(`${this.name} has been resurrected with 1 HP`);
  }

  private lastLevelUpStats: {hp: number, mp: number, attack: number, defense: number} | null = null;

  public checkLevelUp(): boolean {
    // Check if character has enough XP for next level
    const requiredXp = JobHelper.getXp(this.job, this.level + 1);
    if (this.xp >= requiredXp) {
      const oldHp = this.maxHp;
      const oldMp = this.maxMp;
      const oldAtk = this.atk;
      const oldDef = this.def;

      this.advanceLevel();

      // Store stat increases for display
      this.lastLevelUpStats = {
        hp: this.maxHp - oldHp,
        mp: this.maxMp - oldMp,
        attack: this.atk - oldAtk,
        defense: this.def - oldDef
      };

      return true;
    }
    return false;
  }

  public getLastLevelUpStats(): {hp: number, mp: number, attack: number, defense: number} | null {
    return this.lastLevelUpStats;
  }
}