/**
 * Enemy - Battle Enemy System
 * Defines enemy entities with builder pattern
 */

import { PS1Sound } from './PSLibSound';
import { PSGame } from '../PSGame';
import { CHR } from '../../../domain/CHR';

export enum EnemyType {
  NONE,
  PALMA,
  MOTAVIA,
  DEZORIS,
  SPECIAL,
  UNDEAD
}

export enum HasItem {
  NONE,
  COLA,
  DIMATE,
  FLASH
}

export enum CanTalk {
  YES,
  NO
}

export enum CanChat {
  YES,
  NO
}

export enum CanRope {
  YES,
  NO
}

export enum CanProt {
  YES,
  NO
}

export enum HasWing {
  YES,
  NO
}

export enum FireRes {
  YES,
  NO
}

export enum Special {
  NONE,
  FIRE,
  THUNDER,
  THUNDER2,
  ROPE,
  HELP,
  PETRIFY,
  CURE,
  MP_DRAIN,
  DOUBLE_ATTACK
}

export enum Mental {
  LOWEST,
  LOWER,
  NORMAL,
  HIGHER
}

export class Enemy {
  private name: string;
  public hp: number = 0;
  public atk: number = 0;
  public def: number = 0;
  public exp: number = 0;
  public mst: number = 0;
  public num: number = 1;
  public run: number = 0;
  public trap: number = 0;
  public specialShiftX: number = 0;
  public specialShiftY: number = 0;

  // Optional properties with defaults
  public talk: CanTalk = CanTalk.NO;
  public chat: CanChat = CanChat.NO;
  public rope: CanRope = CanRope.YES;
  public prot: CanProt = CanProt.YES;
  public wing: HasWing = HasWing.NO;
  public fire: FireRes = FireRes.NO;
  public item: HasItem = HasItem.NONE;
  public special: Special = Special.NONE;
  public mental: Mental = Mental.NORMAL;

  public attackSound: PS1Sound | null = null;
  public type: EnemyType | null = null;

  public strAnimCHR: string | null = null;
  public animCHR: CHR | null = null;
  public vertical: number = 0;
  public contact: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  // Builder pattern methods - direct port of Java
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

  // Optional property setters
  public setItem(item: HasItem): Enemy {
    this.item = item;
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

  public setSpecial(special: Special): Enemy {
    this.special = special;
    return this;
  }

  public setMental(mental: Mental): Enemy {
    this.mental = mental;
    return this;
  }

  public setSpcpoint(x: number, y: number): Enemy {
    this.specialShiftX = x;
    this.specialShiftY = y;
    return this;
  }

  public setSound(sound: PS1Sound): Enemy {
    this.attackSound = sound;
    return this;
  }

  public setAnim(strAnim: string): Enemy {
    this.strAnimCHR = strAnim;
    return this;
  }

  public setVertical(vertical: number): Enemy {
    this.vertical = vertical;
    return this;
  }

  public setContact(contact: number): Enemy {
    this.contact = contact;
    return this;
  }

  public setType(type: EnemyType): Enemy {
    this.type = type;
    return this;
  }

  // Getters - direct port of Java
  public getSound(): PS1Sound | null {
    return this.attackSound;
  }

  public getMaxHp(): number {
    return this.hp;
  }

  public getMaxNum(): number {
    return this.num;
  }

  // Lazy load CHR
  public async getChr(scene?: Phaser.Scene, basePath: string = 'src/demos/ps'): Promise<CHR | null> {
    if (this.animCHR === null && this.strAnimCHR && scene) {
      try {
        this.animCHR = await CHR.loadChr(scene, this.strAnimCHR, basePath);
        console.log(`Enemy CHR loaded: ${this.strAnimCHR}`);
      } catch (error) {
        console.error(`Failed to load enemy CHR ${this.strAnimCHR}:`, error);
      }
    }
    return this.animCHR;
  }

  public getMental(): number {
    switch (this.mental) {
      case Mental.HIGHER:
        return this.getMaxHp() * 2;
      case Mental.LOWER:
        return Math.floor(this.getMaxHp() / 2);
      case Mental.LOWEST:
        return Math.floor(this.getMaxHp() / 4);
      default:
        return this.getMaxHp();
    }
  }

  public getName(): string {
    return PSGame.getString(this.name);
  }
}