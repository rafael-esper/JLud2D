/**
 * PSBattle - Phantasy Star Battle System
 * TypeScript port of PSBattle.java - Complete battle mechanics with enemy AI, animations, and turn management
 */

import { PSGame } from '../PSGame';
import { MainEngine } from '../../../core/MainEngine';
import { Battler } from '../game/Battler';
import { PartyMember } from '../game/PartyMember';
import { EnemyBattler } from './EnemyBattler';
import { Enemy, HasItem, FireRes, Special, CanProt } from './Enemy';
import { BattlePosition, SceneType } from './BattlePosition';
import { PSMenu, PSSceneType, SpecialEntity } from '../PSMenu';
import { PSCancellable, MenuStack } from '../menu/MenuStack';
import { MenuCHR } from '../menu/MenuCHR';
import { MenuLabelBox } from '../menu/MenuLabelBox';
import { MenuState } from '../menu/MenuType';
import { PS1Music } from '../game/PSLibMusic';
import { PS1Sound } from '../game/PSLibSound';
import { PS1CHR } from '../game/PSLibCHR';
import { PSEffect, Effect, EffectOutcome, EffectTarget, EffectPlace, EffectHelper } from '../game/PSEffect';
import { PSLibSpell, Spell } from '../game/PSLibSpell';
import { PSLibItem } from '../game/PSLibItem';
import { Item, EquipPlace, ItemType } from '../game/Item';
import { OriginalItem } from '../game/PSLibItem';
import { Trapped } from '../game/GameData';
import { Dungeon } from '../game/Dungeon';

export enum Action {
  NONE = 'NONE',
  ATTACK = 'ATTACK',
  SPECIAL = 'SPECIAL',
  MAGIC = 'MAGIC',
  ITEM = 'ITEM',
  DEFEND = 'DEFEND'
}

export enum BattleOutcome {
  WIN = 'WIN',
  DEFEAT = 'DEFEAT',
  ESCAPE = 'ESCAPE',
  TALK = 'TALK',
  BACK_MAIN_MENU = 'BACK_MAIN_MENU',
  ROUND_START = 'ROUND_START'
}

export enum BattleMode {
  NORMAL = 'NORMAL',
  AUTO_ACTION = 'AUTO_ACTION'
}

export class PSBattle {
  private sceneType: SceneType = SceneType.OPEN;
  private battleMode: BattleMode = BattleMode.NORMAL;

  private menuEnemyLabelBox: MenuLabelBox | null = null;
  private maxEnemyNameSize: number = 0;

  // Static battle effect animations
  private static enemyFire: MenuCHR | null = null;
  private static enemyThunder: MenuCHR | null = null;
  private static playerFire: MenuCHR | null = null;
  private static playerWind: MenuCHR | null = null;
  private static playerThunder: MenuCHR | null = null;
  private static playerGifire: MenuCHR | null = null;

  private wallEffect: number = 0;
  private protEffect: boolean = false;

  private battlePositions: number[] = [];
  private currentBattlers: Battler[] = [];

  constructor(battleMode?: BattleMode) {
    if (battleMode) {
      this.battleMode = battleMode;
    }
  }

  /**
   * Initialize static battle animations (lazy loading)
   */
  private static async initBattleAnimations(scene: Phaser.Scene): Promise<void> {
    if (!PSBattle.enemyFire) {
      PSBattle.enemyFire = new MenuCHR(scene, 0, 0, await PSGame.getCHR(PS1CHR.ENEMY_FIRE));
      PSBattle.enemyThunder = new MenuCHR(scene, 0, 0, await PSGame.getCHR(PS1CHR.ENEMY_THUNDER));
      PSBattle.playerFire = new MenuCHR(scene, 0, 0, await PSGame.getCHR(PS1CHR.PLAYER_FIRE));
      PSBattle.playerWind = new MenuCHR(scene, 0, 0, await PSGame.getCHR(PS1CHR.PLAYER_WIND));
      PSBattle.playerThunder = new MenuCHR(scene, 0, 0, await PSGame.getCHR(PS1CHR.PLAYER_THUNDER));
      PSBattle.playerGifire = new MenuCHR(scene, 0, 0, await PSGame.getCHR(PS1CHR.PLAYER_GIFIRE));
    }
  }

  /**
   * Start battle scene with single enemy type and quantity
   */
  public async battleScene(scene: PSSceneType, enemy: Enemy, quantity: number): Promise<BattleOutcome> {
    const enemies: Enemy[] = new Array(quantity).fill(enemy);
    return this.battleSceneWithEnemies(scene, enemies);
  }

  /**
   * Start battle scene with array of enemies
   */
  public async battleSceneWithEnemies(scene: PSSceneType, enemies: Enemy[]): Promise<BattleOutcome> {
    // Determine scene type
    if (scene === PSSceneType.DUNGEON || scene === PSSceneType.CORRIDOR || scene === PSSceneType.CAVE) {
      this.sceneType = SceneType.CLOSE;
    } else {
      this.sceneType = SceneType.OPEN;
    }

    await PSMenu.startScene(scene, SpecialEntity.NONE);

    const outcome = await this.startBattle(enemies, PS1Music.BATTLE);

    if (outcome === BattleOutcome.DEFEAT) {
      await PSGame.gameOverRoutine();
    }

    if (PSGame.getCurrentDungeon() === Dungeon.NONE && !PSGame.isOnTransport()) {
      PSGame.getParty().reallocate();
    }

    PSMenu.endScene();
    return outcome;
  }

  /**
   * Start battle with enemies and music
   */
  public async startBattle(enemies: Enemy[], music: PS1Music): Promise<BattleOutcome> {
    // Initialize battle animations
    const currentScene = PSGame.getCurrentScene();
    if (currentScene) {
      await PSBattle.initBattleAnimations(currentScene);
    }

    let index = 0;
    const battlerList: Battler[] = [];

    // Add party members
    for (const member of PSGame.getParty().getMembers()) {
      battlerList.push(member);
      member.naturalOrder = index++;
    }

    // Add enemies and load their CHR
    for (const enemy of enemies) {
      // Load CHR for enemy if not already loaded
      await enemy.loadCHR(PSGame.getCurrentScene());

      const enemyBattler = new EnemyBattler(enemy);
      battlerList.push(enemyBattler);
      enemyBattler.naturalOrder = index++;
    }

    await PSGame.playMusic(music);

    return this.startBattleWithBattlers(battlerList);
  }

  /**
   * Start battle with prepared battler list
   */
  public async startBattleWithBattlers(battlers: Battler[]): Promise<BattleOutcome> {
    PSGame.menuOff();
    const transportActive = PSGame.canTransport;
    PSGame.transportOff();

    // Discover number of enemies and size
    let numOfEnemies = 0;
    let maxSize = 0;
    this.maxEnemyNameSize = 0;

    for (const battler of battlers) {
      if (battler instanceof EnemyBattler) {
        numOfEnemies++;
        const enemySize = battler.getEnemy().getChr().getFxsize();
        if (enemySize > maxSize) {
          maxSize = enemySize;
        }
        if (battler.getName().length > this.maxEnemyNameSize) {
          this.maxEnemyNameSize = battler.getName().length;
        }
      }
    }

    this.battlePositions = BattlePosition.distributePositions(maxSize, numOfEnemies, this.sceneType);

    const textEnemies: string[] = new Array(numOfEnemies);

    let pos = 0;
    for (const battler of battlers) {
      if (battler instanceof EnemyBattler) {
        const enemy = battler.getEnemy();
        battler.position = pos;

        try {
          const enemyChr = enemy.getChr();
          if (enemyChr && enemyChr.getFxsize) {
            const currentScene = PSGame.getCurrentScene();
            if (currentScene) {
              const enemySprite = new MenuCHR(
                currentScene,
                this.battlePositions[pos] - (enemyChr.getFxsize() / 2),
                battler.getVerticalPos(),
                enemyChr
              );
              battler.sprite = enemySprite;
              PSMenu.instance.push(enemySprite);
              console.log(`Enemy sprite created for ${enemy.getName()} at position (${this.battlePositions[pos] - (enemyChr.getFxsize() / 2)}, ${battler.getVerticalPos()})`);
            } else {
              console.error(`No current scene available for enemy sprite creation`);
              battler.sprite = null;
            }
          } else {
            console.warn(`Enemy CHR not properly loaded for ${enemy.getName()}`);
            battler.sprite = null;
          }
        } catch (error) {
          console.error(`Failed to create enemy sprite for ${enemy.getName()}:`, error);
          // Skip sprite creation if CHR loading failed
          battler.sprite = null;
        }

        const enemyName = enemy.getTranslatedName(PSGame) || enemy.getName();
        textEnemies[pos] = this.format(enemyName, this.maxEnemyNameSize, true) + " " + this.format(enemy.hp, 3);
        pos++;
      }
    }

    // Java: right-aligned by name width — 320 - fontXSize*(7+maxEnemyNameSize)
    this.menuEnemyLabelBox = PSMenu.instance.createLabelBox(
      320 - MenuStack.fontXSize * (7 + this.maxEnemyNameSize), 5, textEnemies, false
    );
    PSMenu.instance.push(this.menuEnemyLabelBox);

    pos = 0;
    for (const battler of battlers) {
      // Associate the general enemyBox to enemy
      if (battler instanceof EnemyBattler) {
        battler.enemyBox = this.menuEnemyLabelBox;
      } else if (battler instanceof PartyMember) {
        const p = battler as PartyMember;
        const playerBox = PSMenu.instance.createLabelBox(pos * 64, 195, [
          this.format(p.getName(), 6, true),
          PSGame.getString("Stats_HP") + ":" + this.format(p.getHp(), 4),
          PSGame.getString("Stats_MP") + ":" + this.format(p.getMp(), 4)
        ], false);
        PSMenu.instance.push(playerBox);

        if (p.getHp() <= 0) {
          playerBox.setOff();
        }
        p.textBox = playerBox;

        // Initialize attack sprite
        const weaponScene = PSGame.getCurrentScene();
        if (weaponScene) {
          const weapon = p.equipment[EquipPlace.WEAPON];
          const weaponChr = weapon ? await weapon.getChrWeaponAnimation(weaponScene) : null;
          if (weaponChr) {
            battler.sprite = new MenuCHR(weaponScene, 0, 0, weaponChr);
          } else {
            // Load default claw animation
            const clawChr = await import('../../../domain/CHR').then(mod =>
              mod.CHR.loadChr(weaponScene, "battle/weapon_ps1/Claw.chr", "ps")
            );
            battler.sprite = new MenuCHR(weaponScene, 0, 0, clawChr);
          }
        }
        pos++;
      }
    }

    // Store current battlers for reference in animation methods
    this.currentBattlers = battlers;

    // START MAIN BATTLE LOOP
    let battleResult = BattleOutcome.ESCAPE;
    try {
      battleResult = await this.battleLoop(battlers);
    } catch (error) {
      console.error('Battle loop error:', error);
    }
    // END MAIN BATTLE LOOP

    PSGame.findAndPlayMusic();

    // Clean up sprites and boxes
    for (let i = 0; i < battlers.length; i++) {
      PSMenu.instance.pop(); // enemySprite + playerBox
    }
    PSMenu.instance.pop(); // enemyTextBox

    PSGame.menuOn();
    if (transportActive) {
      PSGame.transportOn();
    }

    return battleResult;
  }

  /**
   * Main battle loop
   */
  private async battleLoop(battlers: Battler[]): Promise<BattleOutcome> {
    let opt = 1; // Java: first round goes straight to the character action menu;
                 // the Action/Talk/Run prompt only appears after cancelling (opt=0)

    while (true) {
      // Show player boxes
      for (const b of battlers) {
        if (b instanceof PartyMember) {
          if (b.getHp() > 0) {
            b.textBox?.setOn();
          } else {
            b.textBox?.setOff();
          }
        }
      }

      // Draw menus including enemy sprites (port of Java PSMenu.instance.drawMenus())
      PSMenu.instance.drawMenus();

      // MENU LOGIC
      if (opt === 0 && this.battleMode !== BattleMode.AUTO_ACTION) {
        PSMenu.instance.push(PSMenu.instance.createPromptBox(10, 10, [
          PSGame.getString("Menu_Battle_Action"),
          PSGame.getString("Menu_Battle_Talk"),
          PSGame.getString("Menu_Battle_Run")
        ], true));
        opt = await PSMenu.instance.waitOpt(PSCancellable.FALSE) + 1;
        PSMenu.instance.pop();
      }

      if (opt === 1 || this.battleMode === BattleMode.AUTO_ACTION) {
        battlers.sort(Battler.getNaturalComparator());
        const outcome = await this.mainActionMenu(battlers);
        if (outcome === BattleOutcome.BACK_MAIN_MENU) {
          opt = 0;
          continue;
        } else if (outcome === BattleOutcome.TALK) {
          return outcome;
        }
      } else if (opt === 2) { // TALK
        opt = 0; // Back to main menu
        const talkEffect = new PSEffect(Effect.TALK);
        battlers.sort(Battler.getNaturalComparator());
        talkEffect.setTargets(battlers);
        if (await talkEffect.callEffect() === EffectOutcome.SUCCESS) {
          this.cleanPlayerStatus(battlers);
          // Through PSGame so currentMusic is cleared — otherwise the next
          // playMusic() with the same battle track would be skipped
          PSGame.stopMusic();
          return BattleOutcome.TALK;
        }
      } else if (opt === 3) { // RUN
        opt = 0; // Back to main menu
        const runEffect = new PSEffect(Effect.RUN);
        runEffect.setTargets(battlers);
        if (await runEffect.callEffect() === EffectOutcome.SUCCESS) {
          this.cleanPlayerStatus(battlers);
          PSGame.stopMusic();
          return BattleOutcome.ESCAPE;
        }
      }

      // CONTROL LOGIC
      PSBattle.setOrderOfPrecedence(battlers);
      PSBattle.setTargets(battlers);
      this.setEnemyActions(battlers);

      // Process each battler's action
      for (const b of battlers) {
        if (b.getHp() <= 0) { // Only alive battlers attack
          continue;
        }

        // Get a new target if current one is dead
        if (b.target == null || b.target.getHp() <= 0) {
          b.target = PSBattle.getTarget(b, battlers);
        }

        // Process status effects; a paralyzed battler skips its turn,
        // including the round the paralysis wears off (Java behavior)
        const skipTurn = await this.processStatusEffects(b);
        if (skipTurn) {
          continue;
        }

        // Execute action; MAGIC/ITEM escape spells can end the battle
        const actionOutcome = await this.executeAction(b, battlers);
        if (actionOutcome === BattleOutcome.ESCAPE) {
          return BattleOutcome.ESCAPE;
        }

        if (!this.checkOnePlayerAlive(battlers)) {
          this.battlelog("Battle lost!");
          return BattleOutcome.DEFEAT;
        } else if (!this.checkOneEnemyAlive(battlers)) {
          await this.battleWonRoutine(battlers);
          this.cleanPlayerStatus(battlers);
          return BattleOutcome.WIN;
        }
      }
    }
  }

  // Helper method to format strings (like Java String.format)
  private format(value: string | number, length: number, leftAlign: boolean = false): string {
    let str = value.toString();
    if (str.length >= length) return str;

    const padding = ' '.repeat(length - str.length);
    return leftAlign ? str + padding : padding + str;
  }

  /**
   * Process status effect countdowns for one battler's turn.
   * Port of Java battleLoop lines 318-361 (boost, weak, paralysis).
   * @returns true if the battler's turn must be skipped (paralysis)
   */
  private async processStatusEffects(b: Battler): Promise<boolean> {
    const WHITE = 0xFFFFFF;

    // Reduces gradually boost effect
    if (b.boost > 0) {
      b.boost--;
      if (b instanceof EnemyBattler && b.boost === 0) {
        this.menuEnemyLabelBox?.updateColor(b.position, WHITE);
      } else if (b instanceof PartyMember && b.boost === 0) {
        b.textBox?.updateColor(0, WHITE);
        b.textBox?.updateColor(1, WHITE);
        b.textBox?.updateColor(2, WHITE);
      }
    }

    // Reduces gradually weak effect
    if (b.weak > 0) {
      b.weak--;
      if (b instanceof EnemyBattler && b.weak === 0 && b.paralyzed <= 0) {
        this.menuEnemyLabelBox?.updateColor(b.position, WHITE);
      }
    }

    // *** Paralyzed Condition ***
    if (b.paralyzed > 0) {
      b.paralyzed--;
      if (b.paralyzed > 0) { // Still paralyzed
        if (b instanceof PartyMember) {
          await PSMenu.StextTimeout(PSGame.getString("Battle_Player_Bound", "<player>", b.getName()));
        } else {
          await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Bound", "<monster>", this.battlerName(b)));
        }
      } else { // Finish paralyzed condition
        if (b instanceof PartyMember) {
          b.textBox?.updateColor(0, WHITE);
          b.textBox?.updateColor(1, WHITE);
          b.textBox?.updateColor(2, WHITE);
          await PSMenu.StextTimeout(PSGame.getString("Battle_Player_Unbound", "<player>", b.getName()));
        } else if (b instanceof EnemyBattler) {
          this.menuEnemyLabelBox?.updateColor(b.position, WHITE);
          await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Unbound", "<monster>", this.battlerName(b)));
        }
      }
      return true; // Java: continue in both branches — the turn is lost
    }

    return false;
  }

  /** Display name for a battler (translated for enemies) */
  private battlerName(b: Battler): string {
    return b instanceof EnemyBattler
      ? (b.getEnemy().getTranslatedName(PSGame) || b.getName())
      : b.getName();
  }

  private async executeAction(b: Battler, battlers: Battler[]): Promise<BattleOutcome | null> {
    // Java keeps actions for the whole round — DEFEND must persist so the
    // 1.5x defense bonus applies when this battler is attacked later
    switch (b.action) {
      case Action.ATTACK:
        if (b.target) {
          await this.executeAttack(b, b.target);
        }
        break;

      case Action.MAGIC:
        return this.executeMagic(b, battlers);

      case Action.ITEM:
        return this.executeItemAction(b, battlers);

      case Action.DEFEND:
        await this.executeDefend(b);
        break;

      case Action.SPECIAL:
        if (b instanceof EnemyBattler && b.target) {
          await this.executeEnemySpecial(b, b.target, battlers);
        }
        break;
    }

    return null;
  }

  private async executeAttack(attacker: Battler, target: Battler): Promise<void> {
    // Critical hits are rolled once, inside playerAttackAnimation (Java behavior)
    let isCritical = false;

    if (attacker instanceof PartyMember) {
      // Java: hide boxes and show the ATTACKER's box for player attacks
      await this.hideBoxesAndShowTarget(attacker, this.currentBattlers);

      const weapon = attacker.equipment[EquipPlace.WEAPON];

      // Pistols hit every living enemy for itemstat/2 (Java lines 688-698)
      if (weapon && weapon.type === ItemType.PISTOL && attacker.sprite) {
        for (const naturalIndex of Battler.getNaturalOrder(this.currentBattlers)) {
          const shooted = this.currentBattlers[naturalIndex];
          if (shooted instanceof EnemyBattler && shooted.getHp() > 0) {
            await this.playerAttackAnimation(attacker, shooted, attacker.sprite, 0, weapon.weaponSound);
            await this.hit(shooted, Math.trunc(weapon.itemstat / 2));
          }
        }
        return;
      }

      // Normal attack with animation (Java: xAdj -20, weapon sound with default fallback)
      const weaponAnimation = attacker.sprite; // Player weapon sprite
      if (weaponAnimation) {
        isCritical = await this.playerAttackAnimation(attacker, target, weaponAnimation, -20, weapon ? weapon.weaponSound : null);
      }
    } else if (attacker instanceof EnemyBattler) {
      // Java: hide boxes and show the DEFENDER's box for enemy attacks
      await this.hideBoxesAndShowTarget(target, this.currentBattlers);

      // Magic wall (WALL/PROT spells) — counts down per enemy attack (Java 665-681)
      if (this.wallEffect > 0) {
        this.wallEffect--;
        if (this.wallEffect <= 0 || attacker.getEnemy().prot === CanProt.NO) {
          await PSMenu.StextTimeout(PSGame.getString("Battle_Wall_End"));
          this.wallEffect = 0;
          this.protEffect = false;
        }
      }

      // Enemy attack with animation
      await this.enemyAnimationAttack(attacker);

      if (this.wallEffect > 0) {
        PSGame.playSound(PS1Sound.MISS);
        await PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Dodge", "<monster>", this.battlerName(attacker)));
        return;
      }
    }

    // Calculate Attack Points (AP) with status modifiers - Java lines 633-641
    let ap = attacker.getAtk();
    console.log(`${attacker.getName()} base ATK: ${ap}`);

    if (attacker.boost > 0) {
      ap *= 1.5; // 50% boost
      console.log(`${attacker.getName()} boosted ATK: ${ap}`);
    }
    if (attacker.weak > 0) {
      ap *= 0.75; // 25% weakness
      console.log(`${attacker.getName()} weakened ATK: ${ap}`);
    }

    // Calculate Defense Points (DP) with defend action bonus - Java lines 643-648
    let dp = target.getDef();
    console.log(`${target.getName()} base DEF: ${dp}`);

    if (target.action === Action.DEFEND && target.paralyzed <= 0) {
      dp *= 1.5; // 50% defense bonus when defending
      console.log(`${target.getName()} defending DEF: ${dp}`);
    }

    // Apply random variance to both AP and DP - Java lines 650-651
    const apVariance = (1 - 0.25 * Math.random());
    const dpVariance = (1 - 0.25 * Math.random());

    ap *= apVariance; // reduce AP by up to 25%
    dp *= dpVariance; // reduce DP by up to 25%

    // Truncate AP and DP (round down)
    ap = Math.floor(ap);
    dp = Math.floor(dp);

    console.log(`${attacker.getName()} final AP: ${ap} (variance: ${apVariance.toFixed(3)})`);
    console.log(`${target.getName()} final DP: ${dp} (variance: ${dpVariance.toFixed(3)})`);

    const amount = ap - dp;
    console.log(`Damage calculation: ${ap.toFixed(1)} - ${dp.toFixed(1)} = ${amount.toFixed(1)}`);

    // Three-tier attack result system - Java lines 704-722
    if (amount > 0) {
      // Strong attacker: normal or critical hit
      await this.hitAttack(target, isCritical ? amount * 2 : amount, isCritical);
    } else if (amount > -10) {
      // Moderately weak attacker: weak hit
      await this.weakHit(target, attacker);
    } else {
      // Very weak attacker: 50% chance of weak hit vs miss
      if (Math.abs(amount) % 2 === 1) {
        await this.weakHit(target, attacker);
      } else {
        await this.miss(target, attacker);
      }
    }
  }

  private async executeDefend(battler: Battler): Promise<void> {
    // Java (NONE/DEFEND case): no action on the defender's own turn — the
    // 1.5x defense bonus is applied via action === DEFEND when attacked
    this.battlelog(`${battler.getName()} makes no action!`);
  }

  /** Inclusive random integer — equivalent of Java Script.random(min, max) */
  private randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /**
   * Spell damage with mental modifier and fire resistance — port of Java spellDamage
   */
  private async spellDamage(attacker: Battler, defenser: Battler, effect: Effect, min: number, max: number): Promise<void> {
    let damage = this.randomInt(min, max);
    damage += Math.trunc((attacker.getMental() - defenser.getMental()) / 20);
    if (damage <= 0) {
      damage = 1;
    }

    if (defenser instanceof EnemyBattler && (effect === Effect.FIRE || effect === Effect.GIFIRE)) {
      if (defenser.getEnemy().fire === FireRes.YES) {
        this.battlelog(`Fire resistance! Damage ${damage} is going to be diminished.`);
        damage = Math.trunc(damage / 4);
      }
    }

    this.battlelog(`${attacker.getName()} uses Spell causing ${damage} damage on ${defenser.getName()}`);
    await this.hit(defenser, damage);
  }

  /**
   * MAGIC turn execution — port of Java battleLoop MAGIC case (lines 376-439)
   */
  private async executeMagic(b: Battler, battlers: Battler[]): Promise<BattleOutcome | null> {
    if (!b.effect || !b.usedSpell) {
      return null;
    }

    await this.hideBoxesAndShowTarget(b, battlers);
    const spellTarget = b.effect.getTarget();
    if (spellTarget instanceof PartyMember) {
      spellTarget.textBox?.setOn();
    }

    const effectTarget = EffectHelper.getTarget(b.effect.getEffect());
    if (effectTarget === EffectTarget.ENEMY || effectTarget === EffectTarget.ALL_ENEMIES) {
      b.effect.setTargets(battlers);
    }

    const outcome = await PSLibSpell.castSpell(b.usedSpell, b.effect);

    // Java gates every branch below on outcome == SUCCESS
    if (outcome !== EffectOutcome.SUCCESS) {
      return null;
    }

    switch (b.effect.getEffect()) {
      case Effect.ESCAPE:
        this.cleanPlayerStatus(battlers);
        return BattleOutcome.ESCAPE;

      case Effect.WALL:
        await PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Spell"));
        this.wallEffect = Math.max(this.wallEffect, this.randomInt(2, 5));
        break;

      case Effect.PROT:
        await PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Spell"));
        this.wallEffect = Math.max(this.wallEffect, this.randomInt(2, 5));
        this.protEffect = true;
        break;

      case Effect.FIRE:
        if (PSBattle.playerFire) {
          await this.hideBoxesAndShowTarget(b, battlers);
          for (let i = 0; i < 2 && b.target && b.target.getHp() > 0; i++) {
            await this.playerAttackAnimation(b, b.target, PSBattle.playerFire, 0, PS1Sound.FIRE);
            await this.spellDamage(b, b.target, Effect.FIRE, 8, 15); // Original: 7-11
          }
        }
        break;

      case Effect.GIFIRE:
        if (PSBattle.playerGifire && b.target) {
          await this.hideBoxesAndShowTarget(b, battlers);
          await this.playerAttackAnimation(b, b.target, PSBattle.playerGifire, 0, PS1Sound.FIRE);
          await this.spellDamage(b, b.target, Effect.GIFIRE, 48, 64);
        }
        break;

      case Effect.WIND:
        if (PSBattle.playerWind) {
          await this.hideBoxesAndShowTarget(b, battlers);
          for (let i = 0; i < 3 && b.target; i++) {
            await this.playerAttackAnimation(b, b.target, PSBattle.playerWind, 0, PS1Sound.WIND);
            await this.spellDamage(b, b.target, Effect.WIND, 15, 20); // Original: 9-12
            b.target = PSBattle.getTarget(b, battlers);
          }
        }
        break;

      case Effect.THUNDER:
        if (PSBattle.playerThunder) {
          await this.hideBoxesAndShowTarget(b, battlers);
          for (const naturalIndex of Battler.getNaturalOrder(battlers)) {
            const bTarget = battlers[naturalIndex];
            if (bTarget instanceof EnemyBattler && bTarget.getHp() > 0) {
              await this.playerAttackAnimation(b, bTarget, PSBattle.playerThunder, 0, PS1Sound.THUNDER);
              await this.spellDamage(b, bTarget, Effect.THUNDER, 25, 60); // Original: 30-40
            }
          }
        }
        break;
    }

    return null;
  }

  /**
   * ITEM turn execution — port of Java battleLoop ITEM case (lines 441-468)
   */
  private async executeItemAction(b: Battler, battlers: Battler[]): Promise<BattleOutcome | null> {
    if (!b.effect || !b.usedItem) {
      return null;
    }

    await this.hideBoxesAndShowTarget(b, battlers);
    const itemTarget = b.effect.getTarget();
    if (itemTarget instanceof PartyMember) {
      itemTarget.textBox?.setOn();
    }

    const effectTarget = EffectHelper.getTarget(b.effect.getEffect());
    if (effectTarget === EffectTarget.ENEMY || effectTarget === EffectTarget.ALL_ENEMIES) {
      b.effect.setTargets(battlers);
    }

    await PSMenu.StextTimeout(PSGame.getString("Item_Use", "<item>", b.usedItem.getName(), "<player>", b.getName()));
    const outcome = await b.effect.callEffect();

    if (outcome === EffectOutcome.NONE || outcome === EffectOutcome.FAIL) {
      await PSMenu.StextLast(PSGame.getString("Item_NoEffect"));
    } else if (b.usedItem.getCost() > 0 && b instanceof PartyMember) {
      // Consumable used up (Java: items.remove(usedItem))
      const idx = b.items.indexOf(b.usedItem);
      if (idx >= 0) {
        b.items.splice(idx, 1);
      }
    }

    if (b.effect.getEffect() === Effect.ESCAPE && outcome === EffectOutcome.SUCCESS) {
      this.cleanPlayerStatus(battlers);
      return BattleOutcome.ESCAPE;
    }

    return null;
  }

  /**
   * Enemy special attacks — port of Java special() (lines 854-1002)
   */
  private async executeEnemySpecial(b: EnemyBattler, target: Battler, battlers: Battler[]): Promise<void> {
    const special = b.getEnemy().special;

    if (special === Special.CURE) {
      PSGame.playSound(PS1Sound.ENEMY_ROPE);
      b.setHp(Math.floor(Math.min(b.getMaxHp(), b.getHp() + Math.max(20, Math.random() * b.getMaxHp() / 2))));
      this.menuEnemyLabelBox?.updateText(b.position,
        this.format(this.battlerName(b), this.maxEnemyNameSize, true) + " " + this.format(b.getHp(), 3));
      await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Stamina", "<monster>", this.battlerName(b)));
      this.battlelog(`${b.getName()} uses Cure! Current HP: ${b.getHp()}/${b.getMaxHp()}`);

    } else if (special === Special.HELP) {
      PSGame.playSound(PS1Sound.ENEMY_ROPE);
      b.boost = this.randomInt(3, 5);
      this.menuEnemyLabelBox?.updateColor(b.position, 0x00FFFF); // CYAN
      await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Up", "<monster>", this.battlerName(b)));

    } else if (special === Special.PETRIFY) {
      await this.executeAttack(b, target);
      let hasPetrifyProtection = false;
      for (const p of PSGame.getParty().getMembers()) {
        const cover = p.equipment[EquipPlace.COVER];
        if (cover && cover.equals(PSGame.getItem(OriginalItem.Shield_Mirror_Shield))) {
          hasPetrifyProtection = true;
        }
      }
      if (!hasPetrifyProtection && b.target instanceof PartyMember) {
        b.target.setHp(0);
        b.target.textBox?.updateColorAll(0xFF0000);
        b.target.textBox?.updateText(1, PSGame.getString("Stats_HP") + ":" + this.format(b.target.getHp(), 4));
        PSMenu.instance.drawMenus();
        await PSMenu.StextTimeout(PSGame.getString("Battle_Player_Stone", "<player>", b.target.getName()));
      }

    } else if (special === Special.MP_DRAIN) {
      if (target instanceof PartyMember) {
        await this.hideBoxesAndShowTarget(target, battlers);
        if (b.sprite) {
          b.sprite.animate(MenuState.ANIM3); // Enemy special attack animation
        }
        PSGame.playSound(PS1Sound.ENEMY_SPLASH);
        if (b.sprite) {
          await PSMenu.instance.waitAnimationEnd(b.sprite);
        }

        target.mp -= Math.trunc(this.randomInt(12, 20) * target.getMp() / 100);
        target.textBox?.updateText(2, PSGame.getString("Stats_MP") + ":" + this.format(target.getMp(), 4));
        PSMenu.instance.drawMenus();
        await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Drain_MP", "<monster>", this.battlerName(b)));
      }

    } else if (special === Special.ROPE) {
      if (target instanceof PartyMember) {
        PSGame.playSound(PS1Sound.ENEMY_ROPE);
        target.paralyzed = this.randomInt(2, 4);
        target.textBox?.updateColorAll(0xFFFF00); // YELLOW
        await PSMenu.StextTimeout(PSGame.getString("Battle_Player_Bind", "<player>", target.getName()));
        this.battlelog(`${b.getName()} uses Rope! ${target.getName()} is Paralyzed: ${target.paralyzed}`);
      }

    } else if (special === Special.FIRE) {
      this.battlelog(`${b.getName()} uses Fire!`);
      for (let i = 0; i < 2 && b.target && b.target.getHp() > 0; i++) {
        await this.hideBoxesAndShowTarget(b.target, battlers);
        if (b.sprite) {
          b.sprite.animate(MenuState.ANIM3); // Enemy special attack animation
        }

        PSGame.playSound(PS1Sound.FIRE);
        const fireAnim = PSBattle.enemyFire;
        if (fireAnim) {
          PSMenu.instance.push(fireAnim);
          fireAnim.changePosition(
            this.battlePositions[b.position] + b.getEnemy().specialShiftX,
            b.getVerticalPos() + b.getEnemy().specialShiftY);
          fireAnim.animate(MenuState.ANIM2);
        }

        if (b.sprite) {
          await PSMenu.instance.waitAnimationEnd(b.sprite);
          b.sprite.animate(MenuState.READY); // Back to idle state
        }

        if (fireAnim) {
          fireAnim.animate(MenuState.END);
          PSMenu.instance.pop();
        }

        if (this.protEffect && this.wallEffect > 0) {
          PSGame.playSound(PS1Sound.MISS);
          await PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Deflect", "<monster>", this.battlerName(b)));
        } else {
          await this.spellDamage(b, b.target, Effect.FIRE, 8, 15);
        }
      }

    } else if (special === Special.THUNDER) {
      for (const naturalIndex of Battler.getNaturalOrder(battlers)) {
        const bTarget = battlers[naturalIndex];
        if (bTarget instanceof PartyMember && bTarget.getHp() > 0) {
          await this.hideBoxesAndShowTarget(bTarget, battlers);
          if (b.sprite) {
            b.sprite.animate(MenuState.ANIM3); // Enemy special attack animation
          }

          PSGame.playSound(PS1Sound.THUNDER);
          const thunderAnim = PSBattle.enemyThunder;
          if (thunderAnim) {
            PSMenu.instance.push(thunderAnim);
            thunderAnim.changePosition(
              this.battlePositions[b.position] + b.getEnemy().specialShiftX,
              b.getVerticalPos() + b.getEnemy().specialShiftY);
            thunderAnim.animate(MenuState.ANIM2);
          }

          if (b.sprite) {
            await PSMenu.instance.waitAnimationEnd(b.sprite);
            b.sprite.animate(MenuState.READY); // Back to idle state
          }

          if (thunderAnim) {
            thunderAnim.animate(MenuState.END);
            PSMenu.instance.pop();
          }

          if (this.protEffect && this.wallEffect > 0) {
            PSGame.playSound(PS1Sound.MISS);
            await PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Deflect", "<monster>", this.battlerName(b)));
          } else {
            await this.spellDamage(b, bTarget, Effect.THUNDER, 25, 60);
          }
        }
      }

    } else if (special === Special.THUNDER2) {
      for (const naturalIndex of Battler.getNaturalOrder(battlers)) {
        const bTarget = battlers[naturalIndex];
        if (bTarget instanceof PartyMember && bTarget.getHp() > 0) {
          await this.hideBoxesAndShowTarget(bTarget, battlers);
          await this.enemyAnimationAttack(b);
          if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Damoa_Crystal))) {
            await this.spellDamage(b, bTarget, Effect.THUNDER, 60, 100);
          } else {
            await this.spellDamage(b, bTarget, Effect.THUNDER, 150, 300);
          }
        }
      }

    } else if (special === Special.DOUBLE_ATTACK) {
      await this.executeAttack(b, target);
      b.target = PSBattle.getTarget(b, battlers);
      if (b.target) {
        await this.executeAttack(b, b.target);
      }
    }
  }

  /**
   * Per-character action menu — direct port of Java mainActionMenu (lines 505-622).
   * Targets are NOT chosen by the player; they are assigned randomly by
   * setTargets() like the original game.
   */
  private async mainActionMenu(battlers: Battler[]): Promise<BattleOutcome> {
    const members: PartyMember[] = [];
    for (const b of battlers) {
      if (b instanceof PartyMember && b.hp > 0 && b.paralyzed <= 0) {
        members.push(b);
      }
    }

    let currentMember = 0;
    let gotoNextChar = false;

    while (currentMember < members.length) {
      const p = members[currentMember];

      PSMenu.instance.push(PSMenu.instance.createPromptBox(5, 5, [
        PSGame.getString("Menu_Battle_Attack"),
        PSGame.getString("Menu_Battle_Magic"),
        PSGame.getString("Menu_Battle_Item"),
        PSGame.getString("Menu_Battle_Defend")
      ], false));
      // Current character's name so the player knows whose turn it is
      PSMenu.instance.push(PSMenu.instance.createLabelBox(6, 77, [" " + this.format(p.getName(), 6, true)], true));

      const actionOpt = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;

      if (actionOpt === 0) { // Cancelled: step back to the previous character
        PSMenu.instance.pop();
        PSMenu.instance.pop();

        if (currentMember === 0) {
          return BattleOutcome.BACK_MAIN_MENU;
        } else {
          currentMember--;
          continue;
        }
      }

      if (actionOpt === 1) {
        p.action = Action.ATTACK;
        gotoNextChar = true;
      } else if (actionOpt === 2) {
        p.action = Action.MAGIC;

        if (p.getSpells(EffectPlace.BATTLE).length === 0) {
          await PSMenu.Stext(PSGame.getString("Magic_NotLearned", "<player>", p.getName()));
          gotoNextChar = false;
        } else {
          PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, p.listSpells(EffectPlace.BATTLE), true));
          const chosenSpell = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
          if (chosenSpell !== -1) {
            p.usedSpell = p.getSpells(EffectPlace.BATTLE)[chosenSpell];
            p.effect = await PSLibSpell.prepareSpell(p.usedSpell, p);

            // Special code to treat chat/tele interruption (cast immediately)
            if (p.effect !== null && (p.effect.getEffect() === Effect.CHAT || p.effect.getEffect() === Effect.TELE)) {
              p.effect.setTargets(battlers);
              const outcome = await PSLibSpell.castSpell(p.usedSpell, p.effect);
              PSMenu.instance.pop();
              PSMenu.instance.pop();
              PSMenu.instance.pop();
              if (outcome === EffectOutcome.SUCCESS) {
                this.cleanPlayerStatus(battlers);
                return BattleOutcome.TALK;
              } else {
                return BattleOutcome.ROUND_START;
              }
            }

            gotoNextChar = (p.effect !== null);
          } else {
            gotoNextChar = false;
          }
          PSMenu.instance.pop(); // spell list
        }
      } else if (actionOpt === 3) {
        p.action = Action.ITEM;

        if (p.items.length === 0) {
          await PSMenu.Stext(PSGame.getString("Menu_No_Items", "<player>", p.getName()));
          gotoNextChar = false;
        } else {
          PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, Item.toString(p.items, false), true));
          const optItem = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
          if (optItem >= 0) {
            p.usedItem = p.items[optItem];
            p.effect = await PSLibItem.prepareItem(p.usedItem, p);
            gotoNextChar = (p.effect !== null);
          } else {
            gotoNextChar = false;
          }
          PSMenu.instance.pop(); // item list
        }
      } else if (actionOpt === 4) {
        p.action = Action.DEFEND;
        gotoNextChar = true;
      }

      PSMenu.instance.pop();
      PSMenu.instance.pop();

      if (gotoNextChar) {
        currentMember++;
      }
    }

    return BattleOutcome.ROUND_START;
  }

  private cleanPlayerStatus(battlers: Battler[]): void {
    for (const b of battlers) {
      b.clean();

      // Clean up enemy sprites
      if (b.sprite && typeof b.sprite.destroy === 'function') {
        b.sprite.destroy();
        b.sprite = null;
      }
    }
    this.wallEffect = 0;
    this.protEffect = false;
  }

  private async battleWonRoutine(battlers: Battler[]): Promise<void> {
    // Sort battlers using natural comparator (like Java Collections.sort)
    battlers.sort(Battler.getNaturalComparator());

    let item: Item | null = null;
    let gainedExp = 0;
    let gainedMst = 0;

    // Calculate totals and check for item drops
    for (const b of battlers) {
      if (b instanceof EnemyBattler) {
        gainedExp += b.getEnemy().exp;
        gainedMst += b.getEnemy().mst;
        // Check for item drops
        if (b.getEnemy().item === HasItem.COLA) {
          item = PSGame.getItem(OriginalItem.Inventory_Monomate);
        } else if (b.getEnemy().item === HasItem.DIMATE) {
          item = PSGame.getItem(OriginalItem.Inventory_Dimate);
        } else if (b.getEnemy().item === HasItem.FLASH) {
          item = PSGame.getItem(OriginalItem.Inventory_Flash);
        }
      } else {
        // Turn on textboxes for alive party members
        if (b.getHp() > 0) {
          (b as PartyMember).textBox?.setOn();
        }
      }
    }

    // Stop music (Java: Script.stopmusic()) — through PSGame so currentMusic
    // is cleared and the next battle's playMusic() actually restarts the track
    PSGame.stopMusic();

    // Display victory message if any gains
    if (gainedMst > 0 || gainedExp > 0) {
      await PSMenu.Stext(PSGame.getString("Battle_Won", "<number1>", gainedExp.toString(), "<number2>", gainedMst.toString()));
      if (PSGame.getParty() !== null) {
        PSGame.getParty().addMesetas(gainedMst);
      }
    }

    // Add XP to alive party members
    if (gainedExp > 0) {
      for (const b of battlers) {
        if (b instanceof PartyMember && b.getHp() > 0) {
          const p = b as PartyMember;
          await p.giveExp(gainedExp);
        }
      }
    }

    // 1/3 chance of getting an item
    if (item !== null && Math.floor(Math.random() * 3) + 1 === 1) {
      await PSGame.chest(0, Trapped.NO_TRAP, item);
    }
  }

  /**
   * Enemy AI — port of Java setEnemyActions (lines 1119-1171).
   * Targets are assigned separately by setTargets().
   */
  private setEnemyActions(battlers: Battler[]): void {
    for (const b of battlers) {
      if (!(b instanceof EnemyBattler)) {
        continue;
      }

      const eb = b;
      switch (eb.getEnemy().special) {
        case Special.NONE:
          eb.action = Action.ATTACK;
          break;

        case Special.PETRIFY: // Medusa: always petrifies
        case Special.THUNDER2: // Lassic: always attacks all
        case Special.DOUBLE_ATTACK: // Darkfalz: always double attacks
          eb.action = Action.SPECIAL;
          break;

        case Special.MP_DRAIN:
          if (eb.target instanceof PartyMember && eb.target.getMp() > 0 && this.randomInt(1, 3) === 1) {
            eb.action = Action.SPECIAL;
          } else {
            eb.action = Action.ATTACK;
          }
          break;

        case Special.CURE:
          if (eb.getHp() < eb.getMaxHp() && this.randomInt(1, 3) === 1) {
            eb.action = Action.SPECIAL;
          } else {
            eb.action = Action.ATTACK;
          }
          break;

        case Special.HELP:
          if (eb.boost === 0 && this.randomInt(1, 4) === 1) {
            eb.action = Action.SPECIAL;
          } else {
            eb.action = Action.ATTACK;
          }
          break;

        default:
          eb.action = this.randomInt(1, 4) === 1 ? Action.SPECIAL : Action.ATTACK;
      }
    }
  }

  private checkOnePlayerAlive(battlers: Battler[]): boolean {
    return battlers.some(b => b instanceof PartyMember && b.getHp() > 0);
  }

  private checkOneEnemyAlive(battlers: Battler[]): boolean {
    return battlers.some(b => b instanceof EnemyBattler && b.getHp() > 0);
  }

  // Static utility methods
  public static setOrderOfPrecedence(battlers: Battler[]): void {
    for (const b of battlers) {
      b.precedence = Math.floor(Math.random() * b.getAgi());
    }

    battlers.sort(Battler.getPrecedenceComparator());
  }

  public static setTargets(battlers: Battler[]): void {
    for (const b of battlers) {
      b.target = PSBattle.getTarget(b, battlers);
    }
  }

  public static getTarget(attacker: Battler, battlers: Battler[]): Battler | null {
    const rand = Math.floor(Math.random() * battlers.length);
    for (let i = 0; i < battlers.length; i++) {
      const target = battlers[(rand + i) % battlers.length];

      if (attacker instanceof PartyMember && target instanceof EnemyBattler && target.getHp() > 0) {
        return target;
      }
      if (attacker instanceof EnemyBattler && target instanceof PartyMember && target.getHp() > 0) {
        return target;
      }
    }
    return null;
  }

  private battlelog(message: string): void {
    console.debug(`Battle: ${message}`);
  }

  /**
   * Player attack animation - port of original PSBattle.java playerAttackAnimation method
   * @param attacker The attacking player
   * @param defender The defending enemy
   * @param animation The weapon animation CHR
   * @param xAdj X position adjustment
   * @param sound Attack sound effect
   * @returns True if critical hit occurred
   */
  private async playerAttackAnimation(attacker: Battler, defender: Battler, animation: MenuCHR, xAdj: number, sound: PS1Sound | null): Promise<boolean> {
    // Java: single d1000 roll based on strength difference
    const isCritical = Math.floor(Math.random() * 1001) < (attacker.getStr() - defender.getStr());

    if (defender instanceof EnemyBattler) {
      // Java: centered "Critical!" label at the enemy's contact point, with sound and delays
      if (isCritical) {
        PSMenu.instance.push(PSMenu.instance.createCenteredLabelBox(
          this.battlePositions[defender.position],
          defender.getContactPos(),
          PSGame.getString("Battle_Critical_Hit"), true));
        await PSMenu.instance.waitDelay(20);
        PSGame.playSound(sound ?? PS1Sound.PLAYER_DEFAULT_ATTACK);
        await PSMenu.instance.waitDelay(10);
        PSMenu.instance.pop();
      }

      // Attack sound (Java: default attack sound when no weapon sound)
      PSGame.playSound(sound ?? PS1Sound.PLAYER_DEFAULT_ATTACK);

      // Weapon animation at the enemy contact point (Java: ANIM2, then END)
      PSMenu.instance.push(animation);
      animation.changePosition(this.battlePositions[defender.position] + xAdj, defender.getContactPos());
      animation.animate(MenuState.ANIM2);
      await PSMenu.instance.waitAnimationEnd(animation);
      animation.animate(MenuState.END);
      PSMenu.instance.pop();
    }

    return isCritical;
  }

  /**
   * Enemy attack animation - port of original PSBattle.java enemyAnimationAttack method
   * @param attacker The attacking enemy
   */
  private async enemyAnimationAttack(attacker: Battler): Promise<void> {
    if (attacker instanceof EnemyBattler && attacker.sprite) {
      // Play enemy attack sound
      const attackSound = attacker.getAttackSound();
      if (attackSound) {
        PSGame.playSound(attackSound);
      }

      // Animate enemy to attack state
      attacker.sprite.animate(MenuState.ANIM2);

      // Wait for animation to complete
      await this.waitForAnimationComplete(attacker.sprite);

      // Return to ready state
      attacker.sprite.animate(MenuState.READY);
    }
  }

  /**
   * Hide all boxes except target and show focus on target
   * @param target The battler to focus on
   * @param allBattlers All battlers in combat
   */
  private async hideBoxesAndShowTarget(target: Battler, allBattlers: Battler[]): Promise<void> {
    // Hide all player boxes except if target is a player
    for (const battler of allBattlers) {
      if (battler instanceof PartyMember && battler.textBox) {
        if (battler === target) {
          battler.textBox.setOn();
        } else {
          battler.textBox.setOff();
        }
      }
    }

    // Java: waitDelay(15) — draws menus while waiting
    await PSMenu.instance.waitDelay(15);
  }

  /**
   * Wait for MenuCHR animation to complete (Java: MenuStack.waitAnimationEnd)
   */
  private async waitForAnimationComplete(animation: MenuCHR): Promise<void> {
    await PSMenu.instance.waitAnimationEnd(animation);
  }

  /**
   * Comprehensive damage application system - port of original PSBattle.java hit method
   * @param defender The battler taking damage
   * @param amount Amount of damage to apply
   */
  private async hit(defender: Battler, amount: number): Promise<void> {
    // Apply damage
    const newHp = Math.max(0, defender.getHp() - amount);
    defender.setHp(newHp);

    const defenderName = defender instanceof EnemyBattler
      ? defender.getEnemy().getTranslatedName(PSGame)
      : defender.getName();
    console.log(`${defenderName} takes ${amount} damage! (${newHp}/${defender.getMaxHp()} HP remaining)`);

    // Update text displays for HP changes
    if (defender instanceof PartyMember && defender.textBox) {
      // Update player HP display in text box
      defender.textBox.updateText(1, `${PSGame.getString("Stats_HP")}:${this.format(defender.getHp(), 4)}`);
    } else if (defender instanceof EnemyBattler) {
      // Update enemy HP display in enemy label box
      if (this.menuEnemyLabelBox && defender.position !== undefined) {
        const enemyName = defender.getEnemy().getTranslatedName(PSGame) || defender.getEnemy().getName();
        const updatedText = this.format(enemyName, this.maxEnemyNameSize, true) + " " + this.format(defender.getHp(), 3);
        this.menuEnemyLabelBox.updateText(defender.position, updatedText);

        // If enemy HP reaches 0, immediately turn label red (simultaneous with HP change)
        if (defender.getHp() <= 0) {
          this.menuEnemyLabelBox.updateColor(defender.position, 0xFF0000); // RED color
        }

        // Force immediate display update (Java pattern: drawMenus() after text updates)
        PSMenu.instance.drawMenus();
      }

      // Enemy hit animation (Java: ANIM1 is the damage animation)
      if (defender.sprite) {
        defender.sprite.animate(MenuState.ANIM1);
        await this.waitForAnimationComplete(defender.sprite);
        defender.sprite.animate(MenuState.READY);
      }
    }

    // Apply screen shake effect for player damage
    if (defender instanceof PartyMember) {
      await this.earthquakeEffect(amount);
    }

    // Check if defender is killed
    if (defender.getHp() <= 0) {
      await this.killed(defender);
    }
  }

  /**
   * Strong attack hit - port of Java hit method with damage parameter
   * @param defender The battler taking damage
   * @param amount Amount of damage to apply (positive value)
   * @param isCritical Whether this is a critical hit
   */
  private async hitAttack(defender: Battler, amount: number, isCritical: boolean = false): Promise<void> {
    console.log("strong:");

    // Display critical hit message if applicable
    if (isCritical) {
      const criticalMessage = PSGame.getString("Battle_Critical_Hit");
      console.log(criticalMessage);

      // TODO: Display critical hit visual effect like Java implementation
      // Java creates a centered label box for "Critical!" message
    }

    // Round damage properly (Java behavior)
    const finalDamage = Math.round(amount);
    console.log(`Final damage after rounding: ${amount.toFixed(1)} → ${finalDamage}`);
    await this.hit(defender, finalDamage);
  }

  /**
   * Weak hit - port of Java weakHit method
   * @param defender The battler taking damage
   * @param attacker The attacking battler
   */
  private async weakHit(defender: Battler, attacker: Battler): Promise<void> {
    console.log("medium:");
    // Level-based weak damage: 1 + (0 to attacker.level), max 32
    const damage = 1 + Math.floor(Math.min(32, attacker.getLevel() + 1) * Math.random());
    await this.hit(defender, damage);
  }

  /**
   * Attack miss - port of Java miss method
   * @param defender The target that was missed
   * @param attacker The attacking battler
   */
  private async miss(defender: Battler, attacker: Battler): Promise<void> {
    // Play miss sound
    PSGame.playSound(PS1Sound.MISS);

    if (!PSGame.getDisplayMessages()) {
      await PSMenu.instance.waitDelay(15);
      return;
    }

    // Java: message keyed on who dodged (the defender)
    if (defender instanceof PartyMember) {
      await PSMenu.StextTimeout(PSGame.getString("Battle_Player_Dodge",
        "<player>", this.battlerName(defender), "<monster>", this.battlerName(attacker)));
    } else {
      await PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Dodge",
        "<monster>", this.battlerName(defender), "<player>", this.battlerName(attacker)));
    }
  }

  /**
   * Screen shake effect when players take damage - port of original earthquakeEffect
   * @param amount Damage amount determining shake intensity
   */
  private async earthquakeEffect(amount: number): Promise<void> {
    // Java: blits the screen at random offsets for 12 frames, offset
    // scaling with damage (1 + amount/10 pixels)
    const scene = PSGame.getCurrentScene();
    if (!scene) return;

    const quakeAmount = 1 + Math.floor(Math.abs(amount) / 10);
    scene.cameras.main.shake(200, quakeAmount / 320);
    await PSMenu.instance.waitDelay(12); // draws menus while the shake plays
  }

  /**
   * Handle battler death - port of original killed method
   * @param battler The battler that was killed
   */
  private async killed(battler: Battler): Promise<void> {
    const battlerName = battler instanceof EnemyBattler
      ? battler.getEnemy().getTranslatedName(PSGame)
      : battler.getName();
    console.log(`${battlerName} is killed!`);

    if (battler instanceof PartyMember) {
      // Player death handling (Java: red box + hide, message — no sound)
      if (battler.textBox) {
        battler.textBox.updateColorAll(0xFF0000);
        battler.textBox.setOff();
      }

      // Show death message
      const deathMessage = PSGame.getString("Battle_Player_Died", "<player>", battler.getName());
      await PSMenu.StextTimeout(deathMessage);

    } else if (battler instanceof EnemyBattler) {
      // Enemy death handling
      const enemyName = battler.getEnemy().getTranslatedName(PSGame);
      console.log(`Enemy ${enemyName} killed - hiding sprite`);

      if (battler.sprite) {
        // Animate to END state (Java behavior)
        battler.sprite.animate(MenuState.END);
        // Hide defeated enemy sprite (setVisible(false))
        battler.sprite.setVisible(false);
        console.log(`Sprite hidden for ${enemyName}`);
      }

      // Note: Label color is already changed to red when HP reached 0 in hit() method

      // Play enemy death sound (Java behavior)
      PSGame.playSound(PS1Sound.ENEMY_DEAD);

    }
  }

}