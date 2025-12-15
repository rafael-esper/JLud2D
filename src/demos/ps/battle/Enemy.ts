/**
 * Enemy - Enemy Definition System
 * TypeScript port of Enemy.java - Enemy definitions with builder pattern
 */

import { PS1Sound } from '../game/PSLibSound';
import { CHR } from '../../../domain/CHR';

export enum EnemyType {
  NONE = 'NONE',
  PALMA = 'PALMA',
  MOTAVIA = 'MOTAVIA',
  DEZORIS = 'DEZORIS',
  SPECIAL = 'SPECIAL',
  UNDEAD = 'UNDEAD'
}

export enum HasItem {
  NONE = 'NONE',
  COLA = 'COLA',
  DIMATE = 'DIMATE',
  FLASH = 'FLASH'
}

export enum CanTalk {
  YES = 'YES',
  NO = 'NO'
}

export enum CanChat {
  YES = 'YES',
  NO = 'NO'
}

export enum CanRope {
  YES = 'YES',
  NO = 'NO'
}

export enum CanProt {
  YES = 'YES',
  NO = 'NO'
}

export enum HasWing {
  YES = 'YES',
  NO = 'NO'
}

export enum FireRes {
  YES = 'YES',
  NO = 'NO'
}

export enum Special {
  NONE = 'NONE',
  FIRE = 'FIRE',
  THUNDER = 'THUNDER',
  THUNDER2 = 'THUNDER2',
  ROPE = 'ROPE',
  HELP = 'HELP',
  PETRIFY = 'PETRIFY',
  CURE = 'CURE',
  MP_DRAIN = 'MP_DRAIN',
  DOUBLE_ATTACK = 'DOUBLE_ATTACK'
}

export enum Mental {
  LOWEST = 'LOWEST',
  LOWER = 'LOWER',
  NORMAL = 'NORMAL',
  HIGHER = 'HIGHER'
}

export class Enemy {
  // Required fields
  private name: string;

  // Core stats
  public hp: number = 0;
  public atk: number = 0;
  public def: number = 0;
  public exp: number = 0;
  public mst: number = 0;
  public num: number = 1;
  public run: number = 0;
  public trap: number = 0;

  // Special attack positioning
  public specialShiftX: number = 0;
  public specialShiftY: number = 0;

  // Optional attributes with defaults
  public talk: CanTalk = CanTalk.NO;
  public chat: CanChat = CanChat.NO;
  public rope: CanRope = CanRope.YES;
  public prot: CanProt = CanProt.YES;
  public wing: HasWing = HasWing.NO;
  public fire: FireRes = FireRes.NO;
  public item: HasItem = HasItem.NONE;
  public special: Special = Special.NONE;
  public mental: Mental = Mental.NORMAL;

  // Audio and visual
  public attackSound: PS1Sound | null = null;
  public type: EnemyType = EnemyType.NONE;

  // Animation data
  private strAnimCHR: string = "";
  private animCHR: CHR | null = null;
  public vertical: number = 0;
  public contact: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  // Builder pattern methods
  public setHp(hp: number): Enemy {
    this.hp = hp;
    return this;
  }

  public setAtk(atk: number): Enemy {
    this.atk = atk;
    return this;
  }

  public setDef(def: number): Enemy {
    this.def = def;
    return this;
  }

  public setExp(exp: number): Enemy {
    this.exp = exp;
    return this;
  }

  public setMst(mst: number): Enemy {
    this.mst = mst;
    return this;
  }

  public setNum(num: number): Enemy {
    this.num = num;
    return this;
  }

  public setRun(run: number): Enemy {
    this.run = run;
    return this;
  }

  public setTrap(trap: number): Enemy {
    this.trap = trap;
    return this;
  }

  public setSpecialShift(x: number, y: number): Enemy {
    this.specialShiftX = x;
    this.specialShiftY = y;
    return this;
  }

  public setTalk(talk: CanTalk): Enemy {
    this.talk = talk;
    return this;
  }

  public setChat(chat: CanChat): Enemy {
    this.chat = chat;
    return this;
  }

  public setRope(rope: CanRope): Enemy {
    this.rope = rope;
    return this;
  }

  public setProt(prot: CanProt): Enemy {
    this.prot = prot;
    return this;
  }

  public setWing(wing: HasWing): Enemy {
    this.wing = wing;
    return this;
  }

  public setFire(fire: FireRes): Enemy {
    this.fire = fire;
    return this;
  }

  public setItem(item: HasItem): Enemy {
    this.item = item;
    return this;
  }

  public setSpecial(special: Special): Enemy {
    this.special = special;
    return this;
  }

  public setMental(mental: Mental): Enemy {
    this.mental = mental;
    return this;
  }

  public setAttackSound(sound: PS1Sound): Enemy {
    this.attackSound = sound;
    return this;
  }

  // Alias for PSLibEnemy compatibility
  public setSound(sound: PS1Sound): Enemy {
    return this.setAttackSound(sound);
  }

  public setType(type: EnemyType): Enemy {
    this.type = type;
    return this;
  }

  public setCHR(chrPath: string): Enemy {
    this.strAnimCHR = chrPath;
    return this;
  }

  // Alias for PSLibEnemy compatibility
  public setAnim(chrPath: string): Enemy {
    return this.setCHR(chrPath);
  }

  public setPosition(vertical: number, contact: number): Enemy {
    this.vertical = vertical;
    this.contact = contact;
    return this;
  }

  // Alias for PSLibEnemy compatibility
  public setVertical(vertical: number): Enemy {
    this.vertical = vertical;
    return this;
  }

  // Alias for PSLibEnemy compatibility
  public setContact(contact: number): Enemy {
    this.contact = contact;
    return this;
  }

  // Special attack position shift (for animation alignment)
  public setSpcpoint(shiftX: number, shiftY: number): Enemy {
    this.specialShiftX = shiftX;
    this.specialShiftY = shiftY;
    return this;
  }

  // Getter methods
  public getName(): string {
    // For now, return raw name - translation will be handled elsewhere to avoid circular dependency
    return this.name;
  }

  // Get translated name using provided PSGame reference
  public getTranslatedName(PSGameClass: any): string {
    try {
      if (this.name.startsWith("Enemy_") && PSGameClass && PSGameClass.getString) {
        return PSGameClass.getString(this.name);
      }
    } catch (e) {
      // If translation fails, fall back to raw name
    }
    return this.name;
  }

  public getCHRPath(): string {
    return this.strAnimCHR;
  }

  public getMaxNum(): number {
    return this.num;
  }

  public getChr(): CHR {
    if (!this.animCHR) {
      throw new Error(`CHR not loaded for enemy ${this.name}. Call loadCHR() first.`);
    }
    return this.animCHR;
  }

  /**
   * Load CHR animation data
   */
  public async loadCHR(scene: Phaser.Scene): Promise<void> {
    if (!this.strAnimCHR) {
      throw new Error(`No CHR path set for enemy ${this.name}`);
    }

    console.log(`Enemy.loadCHR: Loading CHR for ${this.name} with path: ${this.strAnimCHR}`);

    const { CHR } = await import('../../../domain/CHR');
    // The strAnimCHR already contains the full path like "battle/enemy_ps1/sworm.anim.json"
    // We need to prepend with ps/ to get "ps/battle/enemy_ps1/sworm.anim.json"
    const fullPath = `ps/${this.strAnimCHR}`;
    console.log(`Enemy.loadCHR: Full path constructed: ${fullPath}`);
    this.animCHR = await CHR.loadChr(scene, this.strAnimCHR, "ps");
  }

  /**
   * Get mental stat as numeric value
   */
  public getMental(): number {
    switch (this.mental) {
      case Mental.LOWEST:
        return 10;
      case Mental.LOWER:
        return 30;
      case Mental.NORMAL:
        return 50;
      case Mental.HIGHER:
        return 70;
      default:
        return 50;
    }
  }

  /**
   * Clone this enemy (for creating multiple instances)
   */
  public clone(): Enemy {
    const cloned = new Enemy(this.name)
      .setHp(this.hp)
      .setAtk(this.atk)
      .setDef(this.def)
      .setExp(this.exp)
      .setMst(this.mst)
      .setNum(this.num)
      .setRun(this.run)
      .setTrap(this.trap)
      .setSpecialShift(this.specialShiftX, this.specialShiftY)
      .setTalk(this.talk)
      .setChat(this.chat)
      .setRope(this.rope)
      .setProt(this.prot)
      .setWing(this.wing)
      .setFire(this.fire)
      .setItem(this.item)
      .setSpecial(this.special)
      .setMental(this.mental)
      .setType(this.type)
      .setCHR(this.strAnimCHR)
      .setPosition(this.vertical, this.contact);

    if (this.attackSound) {
      cloned.setAttackSound(this.attackSound);
    }

    // Copy loaded CHR if available
    if (this.animCHR) {
      cloned.animCHR = this.animCHR;
    }

    return cloned;
  }

  /**
   * Create a builder for common enemy types
   */
  public static createBuilder(name: string): Enemy {
    return new Enemy(name);
  }
}