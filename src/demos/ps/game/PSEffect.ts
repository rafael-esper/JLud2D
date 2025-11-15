/**
 * PSEffect - Phantasy Star Effect System
 * Handles spell and item effects with complete game logic
 */

import { PartyMember } from './PartyMember';
import { Battler } from './Battler';
import { EnemyBattler } from './EnemyBattler';
import { CanRope, CanTalk, CanChat, EnemyType } from './Enemy';
import { City } from './City';
import { Dungeon } from './Dungeon';
import { PS1Sound } from './PSLibSound';
import { PSGame } from '../PSGame';
import { Action } from '../PSBattle';
import { PSMenu } from '../PSMenu';

// Forward declarations for types that will be implemented later
export interface PSBattle {
  // Will be defined when we port PSBattle
}

export interface PSMenu {
  // Will be defined when we port PSMenu
}


// Effect enums
export enum EffectTarget {
  NONE,
  MEMBER,
  ALIVE_MEMBER,
  ENEMY,
  ALL_MEMBERS,
  ALL_ENEMIES
}

export enum EffectPlace {
  ANY,
  WORLD,
  BATTLE
}

export enum EffectOutcome {
  NONE,
  FAIL,
  SUCCESS,
  CLOSE_ALL
}

export enum Effect {
  NONE,

  // Healing effects
  CURE,
  WCURE,
  REVIVE,
  F_REVIVE,

  // World effects
  FLY,
  EXIT,
  TRAP,
  TRAP_CHEST,
  OPEN,

  // Communication effects
  RUN,
  TALK,
  ESCAPE,
  CHAT,
  TELE,

  // Control effects
  ROPE,
  ROPE_ALL,
  FEAR,
  FEAR_ALL,
  FORCE,
  WALL,
  PROT,

  // Attack effects
  FIRE,
  GIFIRE,
  WIND,
  THUNDER,

  // Utility effects
  LIGHT,
  MUSIC
}

export class EffectHelper {
  private static readonly effectConfigs = new Map<Effect, { place: EffectPlace, target: EffectTarget }>([
    [Effect.NONE, { place: EffectPlace.ANY, target: EffectTarget.NONE }],

    // Healing effects
    [Effect.CURE, { place: EffectPlace.ANY, target: EffectTarget.ALIVE_MEMBER }],
    [Effect.WCURE, { place: EffectPlace.WORLD, target: EffectTarget.ALIVE_MEMBER }],
    [Effect.REVIVE, { place: EffectPlace.WORLD, target: EffectTarget.MEMBER }],
    [Effect.F_REVIVE, { place: EffectPlace.ANY, target: EffectTarget.MEMBER }],

    // World effects
    [Effect.FLY, { place: EffectPlace.WORLD, target: EffectTarget.NONE }],
    [Effect.EXIT, { place: EffectPlace.WORLD, target: EffectTarget.NONE }],
    [Effect.TRAP, { place: EffectPlace.WORLD, target: EffectTarget.NONE }],
    [Effect.TRAP_CHEST, { place: EffectPlace.WORLD, target: EffectTarget.NONE }],
    [Effect.OPEN, { place: EffectPlace.WORLD, target: EffectTarget.NONE }],

    // Communication effects
    [Effect.RUN, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],
    [Effect.TALK, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],
    [Effect.ESCAPE, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],
    [Effect.CHAT, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],
    [Effect.TELE, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],

    // Control effects
    [Effect.ROPE, { place: EffectPlace.BATTLE, target: EffectTarget.ENEMY }],
    [Effect.ROPE_ALL, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],
    [Effect.FEAR, { place: EffectPlace.BATTLE, target: EffectTarget.ENEMY }],
    [Effect.FEAR_ALL, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],
    [Effect.FORCE, { place: EffectPlace.BATTLE, target: EffectTarget.ALIVE_MEMBER }],
    [Effect.WALL, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_MEMBERS }],
    [Effect.PROT, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_MEMBERS }],

    // Attack effects
    [Effect.FIRE, { place: EffectPlace.BATTLE, target: EffectTarget.ENEMY }],
    [Effect.GIFIRE, { place: EffectPlace.BATTLE, target: EffectTarget.ENEMY }],
    [Effect.WIND, { place: EffectPlace.BATTLE, target: EffectTarget.ENEMY }],
    [Effect.THUNDER, { place: EffectPlace.BATTLE, target: EffectTarget.ALL_ENEMIES }],

    // Utility effects
    [Effect.LIGHT, { place: EffectPlace.WORLD, target: EffectTarget.NONE }],
    [Effect.MUSIC, { place: EffectPlace.ANY, target: EffectTarget.NONE }]
  ]);

  public static getPlace(effect: Effect): EffectPlace {
    return this.effectConfigs.get(effect)?.place || EffectPlace.ANY;
  }

  public static getTarget(effect: Effect): EffectTarget {
    return this.effectConfigs.get(effect)?.target || EffectTarget.NONE;
  }
}

export class PSEffect {
  private effect: Effect;
  private value: number = 0;
  private user: PartyMember | null = null;
  private target: Battler | null = null;
  private targets: Battler[] = [];

  constructor(effect: Effect) {
    this.setEffect(effect);
  }

  public getEffect(): Effect {
    return this.effect;
  }

  public setEffect(effect: Effect): void {
    this.effect = effect;
  }

  public setTarget(target: Battler): void {
    this.target = target;
  }

  public getTarget(): Battler | null {
    return this.target;
  }

  public setTargets(battlers: Battler[]): void {
    this.targets = battlers;
  }

  public setUser(user: PartyMember): void {
    this.user = user;
  }

  public getUser(): PartyMember | null {
    return this.user;
  }

  public setValue(value: number): void {
    this.value = value;
  }

  public async callEffect(): Promise<EffectOutcome> {
    const effectTarget = EffectHelper.getTarget(this.effect);

    if (effectTarget === EffectTarget.ALIVE_MEMBER && this.target && this.target.getHp() <= 0) {
      await PSMenu.StextTimeout(PSGame.getString("Battle_Player_Dead", "<player>", this.target.getName()));
      return EffectOutcome.FAIL;
    }

    switch (this.effect) {
      case Effect.NONE:
        return EffectOutcome.NONE;

      case Effect.LIGHT:
        // Note: Would need PSGame.getCurrentDungeon implementation
        /*
        if (PSGame.getCurrentDungeon().equals(Dungeon.NONE)) {
          return EffectOutcome.FAIL;
        } else {
          PSGame.playSound(PS1Sound.LIGHT);
          PSGame.currentDungeon.setLight();
          return EffectOutcome.CLOSE_ALL;
        }
        */
        console.warn('LIGHT effect not fully implemented - requires dungeon system');
        return EffectOutcome.SUCCESS;

      case Effect.RUN:
      case Effect.ESCAPE:
        if (this.targets.length > 0 && this.runRoutine(this.targets, this.effect === Effect.RUN)) {
          return EffectOutcome.SUCCESS;
        } else {
          return EffectOutcome.NONE;
        }

      case Effect.TALK:
      case Effect.CHAT:
      case Effect.TELE:
        if (this.targets.length > 0 && await this.talk(this.targets, this.user!, this.effect)) {
          return EffectOutcome.SUCCESS;
        } else {
          return EffectOutcome.NONE;
        }

      case Effect.CURE:
      case Effect.WCURE:
        if (!this.target) return EffectOutcome.FAIL;

        await PSMenu.instance.waitDelay(15);
        this.target.setHp(Math.min(this.target.getHp() + this.value, this.target.getMaxHp()));

        if ((this.target as PartyMember).textBox) { // in battle
          (this.target as PartyMember).textBox!.updateText(1, PSGame.getString("Stats_HP") + ":" + PSGame.format(this.target.getHp(), 4));
          await PSMenu.instance.waitDelay(15);
        }

        PSGame.playSound(PS1Sound.CURE);
        await PSMenu.StextTimeout(PSGame.getString("Magic_Heal", "<player>", this.target.getName()));

        return EffectOutcome.SUCCESS;

      case Effect.FLY:
        // Note: Would need full city/planet system implementation
        console.warn('FLY effect not fully implemented - requires city/planet system');
        return EffectOutcome.SUCCESS;

      case Effect.REVIVE:
        return await this.revive(this.target as PartyMember, false);

      case Effect.F_REVIVE:
        return await this.revive(this.target as PartyMember, true);

      case Effect.FORCE:
        if (!this.target) return EffectOutcome.FAIL;

        this.target.boost = 2 + Math.floor(Math.random() * 4);
        // Note: Would need textBox color implementation
        // ((PartyMember)target).textBox.updateColor(Color.CYAN);
        await PSMenu.StextTimeout(PSGame.getString("Battle_Player_Up", "<player>", this.target.getName()));

        return EffectOutcome.SUCCESS;

      case Effect.ROPE:
        // Note: Would need PSBattle.getTarget implementation
        // this.target = PSBattle.getTarget(this.user, this.targets);
        if (!this.target) return EffectOutcome.FAIL;

        const enemyBattler = this.target as EnemyBattler;
        if (enemyBattler.getEnemy().rope === CanRope.YES) {
          this.target.paralyzed = 2 + Math.floor(Math.random() * 3);
          await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Bind", "<monster>", this.target.getName()));
          // this.target.enemyBox.updateColor(this.target.position, Color.YELLOW);
          return EffectOutcome.SUCCESS;
        } else {
          return EffectOutcome.FAIL;
        }

      case Effect.ROPE_ALL:
        let ropeSuccess = false;
        for (const target of this.targets) {
          if (target instanceof EnemyBattler) {
            if (target.getEnemy().rope === CanRope.YES) {
              target.paralyzed = 2 + Math.floor(Math.random() * 3);
              if (!ropeSuccess) {
                await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Bind", "<monster>", target.getName()));
                ropeSuccess = true;
              }
              // target.enemyBox.updateColor(target.position, Color.YELLOW);
            }
          }
        }
        return ropeSuccess ? EffectOutcome.SUCCESS : EffectOutcome.FAIL;

      case Effect.FEAR:
        // Note: Would need PSBattle.getTarget implementation
        if (!this.target) return EffectOutcome.FAIL;

        const fearTarget = this.target as EnemyBattler;
        if (this.target.getMaxHp() <= 100 && fearTarget.getEnemy().type !== EnemyType.UNDEAD) {
          this.target.weak = 3 + Math.floor(Math.random() * 3);
          await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Down", "<monster>", this.target.getName()));
          return EffectOutcome.SUCCESS;
        } else {
          return EffectOutcome.FAIL;
        }

      case Effect.FEAR_ALL:
        let fearSuccess = false;
        for (const target of this.targets) {
          if (target instanceof EnemyBattler) {
            if (target.getMaxHp() <= 133 && target.getEnemy().type !== EnemyType.UNDEAD) {
              target.weak = 3 + Math.floor(Math.random() * 3);
              if (!fearSuccess) {
                await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Down", "<monster>", target.getName()));
                fearSuccess = true;
              }
            }
          }
        }
        return fearSuccess ? EffectOutcome.SUCCESS : EffectOutcome.FAIL;

      // These have special treatments in PSBattle code
      case Effect.WALL:
      case Effect.PROT:
      case Effect.FIRE:
      case Effect.GIFIRE:
      case Effect.WIND:
      case Effect.THUNDER:
        return EffectOutcome.SUCCESS;

      case Effect.MUSIC:
        PSGame.playSound(PS1Sound.FLUTESONG);
        await PSMenu.instance.waitDelay(90);
        // Fall through to EXIT

      case Effect.EXIT:
        // Note: Would need dungeon system implementation
        console.warn('EXIT effect not fully implemented - requires dungeon system');
        return EffectOutcome.CLOSE_ALL;

      case Effect.OPEN:
        // Note: Would need dungeon system implementation
        console.warn('OPEN effect not fully implemented - requires dungeon system');
        return EffectOutcome.CLOSE_ALL;

      case Effect.TRAP:
        // Note: Would need dungeon system implementation
        console.warn('TRAP effect not fully implemented - requires dungeon system');
        return EffectOutcome.FAIL;

      case Effect.TRAP_CHEST:
        return EffectOutcome.SUCCESS;
    }

    return EffectOutcome.FAIL;
  }

  private async revive(target: PartyMember, fullRevive: boolean): Promise<EffectOutcome> {
    await PSMenu.instance.waitDelay(15);
    if (this.target!.getHp() <= 0) {
      if (fullRevive) {
        target.setHp(target.getMaxHp());
        target.setMp(target.getMaxMp());
      } else {
        target.setHp(1);
      }
      PSGame.playSound(PS1Sound.REVIVE);
      PSGame.getParty().reallocate();
      await PSMenu.Stext(PSGame.getString("Magic_Ressurrect", "<player>", target.getName()));
      return EffectOutcome.SUCCESS;
    } else {
      return EffectOutcome.FAIL;
    }
  }

  private runRoutine(battlers: Battler[], random: boolean): boolean {
    let chanceToRun = Number.MAX_SAFE_INTEGER;
    let blocker: Battler | null = null;

    // Process battlers for run attempt
    for (const runner of battlers) {
      if (runner.getHp() <= 0) {
        continue;
      }
      if (runner instanceof PartyMember) {
        runner.action = Action.NONE;
      } else {
        const enemyRunner = runner as EnemyBattler;
        if (enemyRunner.getEnemy().run < chanceToRun) {
          chanceToRun = enemyRunner.getEnemy().run;
          blocker = runner;
        }
      }
    }

    // Check for dead end (would need dungeon system)
    /*
    if (PSGame.getCurrentDungeon() !== Dungeon.NONE && PSGame.currentDungeon.deadEnd()) {
      chanceToRun = 0;
      console.log("On dead end!");
    }
    */

    const chance = random ? 1 + Math.floor(Math.random() * 255) : 1;

    console.log(`Got ${chance} of ${chanceToRun}`);
    if (chance <= chanceToRun) {
      PSGame.playSound(PS1Sound.ESCAPE);
      // Additional logic would need dungeon and display message systems
      console.log(`Successfully ran from ${blocker?.getName() || 'enemy'}!`);
      return true; // Escape successful
    } else {
      console.log(`Failed to run from ${blocker?.getName() || 'enemy'}!`);
      return false; // Escape failed
    }
  }

  private async talk(battlers: Battler[], talker: PartyMember, effect: Effect): Promise<boolean> {
    let chanceToTalk = false;
    let talkee: Battler | null = null;

    // Process battlers for talk attempt
    for (const battler of battlers) {
      if (battler.getHp() <= 0) {
        continue;
      }
      if (battler instanceof PartyMember) {
        battler.action = Action.NONE;
        if (battler.getHp() > 0 && !talker) {
          talker = battler;
        }
      } else {
        if (!talkee) {
          talkee = battler;
        }
        const enemyBattler = battler as EnemyBattler;
        if (effect === Effect.TALK && enemyBattler.getEnemy().talk === CanTalk.YES) {
          chanceToTalk = true;
        } else if (enemyBattler.getEnemy().chat === CanChat.YES) {
          if (battler.getMaxHp() < 100 && effect === Effect.CHAT) {
            chanceToTalk = true;
          }
          if (effect === Effect.TELE) { // TELE is stronger
            chanceToTalk = true;
          }
        }
      }
    }

    await PSMenu.StextNext(PSGame.getString("Battle_Player_Speak", "<player>", talker.getName(), "<monster>", talkee?.getName() || 'enemy'));

    if (chanceToTalk) {
      if (effect === Effect.CHAT || effect === Effect.TELE) {
        PSGame.playSound(PS1Sound.TELE);
      }

      await PSMenu.StextNext(PSGame.getString("Battle_Enemy_Reply", "<monster>", talkee?.getName() || 'enemy'));
      if (effect === Effect.TALK || effect === Effect.CHAT) {
        const rand = 1 + Math.floor(Math.random() * 9);
        await PSMenu.StextLast(PSGame.getString("Monster_Dialogue_" + rand));
      } else {
        const rand = 1 + Math.floor(Math.random() * 10);
        await PSMenu.StextLast(PSGame.getString("Monster_Tele_" + rand));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Battle_Enemy_No_Understand", "<player>", talker.getName(), "<monster>", talkee?.getName() || 'enemy'));
    }

    return chanceToTalk;
  }
}