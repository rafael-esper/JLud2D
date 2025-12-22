/**
 * PSBattle - Phantasy Star Battle System
 * TypeScript port of PSBattle.java - Complete battle mechanics with enemy AI, animations, and turn management
 */

import { PSGame } from '../PSGame';
import { MainEngine } from '../../../core/MainEngine';
import { ScriptEngine } from '../../../core/ScriptEngine';
import { Battler } from '../game/Battler';
import { PartyMember } from '../game/PartyMember';
import { EnemyBattler } from './EnemyBattler';
import { Enemy } from './Enemy';
import { BattlePosition, SceneType } from './BattlePosition';
import { PSMenu, PSSceneType, SpecialEntity } from '../PSMenu';
import { PSCancellable } from '../menu/MenuStack';
import { MenuCHR } from '../menu/MenuCHR';
import { MenuLabelBox } from '../menu/MenuLabelBox';
import { MenuState } from '../menu/MenuType';
import { PS1Music } from '../game/PSLibMusic';
import { PS1Sound } from '../game/PSLibSound';
import { PS1CHR } from '../game/PSLibCHR';
import { PSEffect, Effect, EffectOutcome, EffectTarget, EffectPlace } from '../game/PSEffect';
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

    PSMenu.startScene(scene, SpecialEntity.NONE);

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

    // Allow background to be fully established before creating enemy sprites
    // This ensures proper stacking order: background first, then enemy sprites with natural delay
    await new Promise(resolve => setTimeout(resolve, 100));

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

    this.menuEnemyLabelBox = PSMenu.instance.createLabelBox(
      140, 5, textEnemies, false
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
        const weapon = p.equipment[EquipPlace.WEAPON];
        if (weapon) {
          battler.sprite = new MenuCHR(0, 0, weapon.getChrWeaponAnimation());
        } else {
          // Load default claw animation
          const clawChr = await import('../../../domain/CHR').then(mod =>
            mod.CHR.loadChr(PSGame.getCurrentScene(), "battle/weapon_ps1/Claw.chr", "ps")
          );
          battler.sprite = new MenuCHR(0, 0, clawChr);
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
    let opt = 0; // Start with 0 to show menu

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
        if (talkEffect.callEffect() === EffectOutcome.SUCCESS) {
          this.cleanPlayerStatus(battlers);
          ScriptEngine.stopmusic();
          return BattleOutcome.TALK;
        }
      } else if (opt === 3) { // RUN
        opt = 0; // Back to main menu
        const runEffect = new PSEffect(Effect.RUN);
        runEffect.setTargets(battlers);
        if (runEffect.callEffect() === EffectOutcome.SUCCESS) {
          this.cleanPlayerStatus(battlers);
          ScriptEngine.stopmusic();
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

        // Process status effects
        await this.processStatusEffects(b, battlers);
        if (b.paralyzed > 0) {
          continue; // Skip action if paralyzed
        }

        // Execute action
        await this.executeAction(b, battlers);

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
   * Process status effects each turn - port of Java status effect countdown system
   * @param b The battler to process status effects for
   * @param battlers All battlers in the battle
   */
  private async processStatusEffects(b: Battler, battlers: Battler[]): Promise<void> {
    // Process paralysis - if paralyzed, skip turn and count down
    if (b.paralyzed > 0) {
      b.paralyzed--;
      if (b.paralyzed > 0) {
        const battlerName = b instanceof EnemyBattler
          ? b.getEnemy().getTranslatedName(PSGame)
          : b.getName();
        const message = PSGame.getString("Battle_Player_Bound", "<player>", battlerName);
        console.log(message);
        return; // Skip turn completely
      } else {
        // Paralysis ends
        const battlerName = b instanceof EnemyBattler
          ? b.getEnemy().getTranslatedName(PSGame)
          : b.getName();
        const message = PSGame.getString("Battle_Player_Unbound", "<player>", battlerName);
        console.log(message);
      }
    }

    // Process boost effect (increased attack)
    if (b.boost > 0) {
      b.boost--;
      if (b.boost === 0) {
        // Boost effect ends - visual indicator should return to normal
        console.log(`${b.getName()}'s boost effect ends`);
      }
    }

    // Process weak effect (decreased attack/defense)
    if (b.weak > 0) {
      b.weak--;
      if (b.weak === 0) {
        // Weak effect ends - visual indicator should return to normal
        console.log(`${b.getName()}'s weakness effect ends`);
      }
    }

    // Reset defending status at start of new turn (Java implementation)
    if (b instanceof PartyMember) {
      (b as any).defending = false;
    }
  }

  private async executeAction(b: Battler, battlers: Battler[]): Promise<void> {
    if (!b.target && b.action !== Action.DEFEND) {
      return; // No valid target
    }

    switch (b.action) {
      case Action.ATTACK:
        await this.executeAttack(b, b.target!);
        break;

      case Action.MAGIC:
        if (b instanceof PartyMember && b.technique) {
          await this.executeTechnique(b, b.technique, b.target, battlers);
        }
        break;

      case Action.ITEM:
        if (b instanceof PartyMember && b.selectedItem) {
          await this.executeItem(b, b.selectedItem, b.target);
        }
        break;

      case Action.DEFEND:
        await this.executeDefend(b);
        break;

      case Action.SPECIAL:
        if (b instanceof EnemyBattler) {
          await this.executeEnemySpecial(b, b.target!, battlers);
        }
        break;
    }

    // Reset action after execution
    b.action = Action.ATTACK;
    b.target = null;
  }

  private async executeAttack(attacker: Battler, target: Battler): Promise<void> {
    // Critical hit check using original Java formula
    const isCritical = Math.floor(Math.random() * 1000) < (attacker.getStr() - target.getStr());

    if (attacker instanceof PartyMember) {
      // Player attack with animation
      const weaponAnimation = attacker.sprite; // Player weapon sprite
      if (weaponAnimation) {
        await this.playerAttackAnimation(attacker, target, weaponAnimation, 0, null);
      }
    } else if (attacker instanceof EnemyBattler) {
      // Enemy attack with animation
      await this.enemyAnimationAttack(attacker);
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
    // Defending reduces incoming damage by 50% until next turn
    battler.defending = true;

    console.log(`${battler.getName()} defends!`);
  }

  private async executeTechnique(caster: PartyMember, technique: any, target: Battler | null, battlers: Battler[]): Promise<void> {
    // TODO: Implement technique execution when technique system is available
  }

  private async executeItem(user: PartyMember, item: any, target: Battler | null): Promise<void> {
    // TODO: Implement item usage when item system is available
  }

  private async executeEnemySpecial(enemy: EnemyBattler, target: Battler, battlers: Battler[]): Promise<void> {
    // TODO: Implement enemy special attacks based on enemy type
    // For now, just do a regular attack
    await this.executeAttack(enemy, target);
  }

  private async mainActionMenu(battlers: Battler[]): Promise<BattleOutcome> {
    // Process each player's turn
    for (const battler of battlers) {
      if (!(battler instanceof PartyMember) || battler.getHp() <= 0) {
        continue;
      }

      const player = battler as PartyMember;
      let actionSelected = false;

      while (!actionSelected) {
        // Create player action menu
        const actionMenu = PSMenu.instance.createPromptBox(10, 100, [
          PSGame.getString("Menu_Battle_Attack"),
          PSGame.getString("Menu_Battle_Magic"),
          PSGame.getString("Menu_Battle_Item"),
          PSGame.getString("Menu_Battle_Defend")
        ], true);
        PSMenu.instance.push(actionMenu);

        const actionChoice = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        PSMenu.instance.pop();

        if (actionChoice === -1) {
          return BattleOutcome.BACK_MAIN_MENU;
        }

        switch (actionChoice) {
          case 0: // Attack
            player.action = Action.ATTACK;
            // Select target
            player.target = await this.selectEnemyTarget(battlers);
            if (player.target) {
              actionSelected = true;
            }
            break;

          case 1: // Magic
            const technique = await this.selectTechnique(player);
            if (technique) {
              player.action = Action.MAGIC;
              player.technique = technique;
              if (technique.isTargeted) {
                player.target = await this.selectTarget(battlers, technique.targetEnemies);
              }
              actionSelected = true;
            }
            break;

          case 2: // Item
            const item = await this.selectItem(player);
            if (item) {
              player.action = Action.ITEM;
              player.selectedItem = item;
              if (item.isTargeted) {
                player.target = await this.selectTarget(battlers, false);
              }
              actionSelected = true;
            }
            break;

          case 3: // Defend
            player.action = Action.DEFEND;
            actionSelected = true;
            break;
        }
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
    // Calculate total EXP and mesetas from defeated enemies
    let totalExp = 0;
    let totalMesetas = 0;

    for (const battler of battlers) {
      if (battler instanceof EnemyBattler && battler.getHp() <= 0) {
        totalExp += battler.getExpReward();
        totalMesetas += battler.getMstReward();
      }
    }

    // Display victory message
    await PSMenu.StextNext(PSGame.getString("Battle_Won", "<number1>", totalExp.toString(), "<number2>", totalMesetas.toString()));

    // Award experience points
    if (totalExp > 0) {
      const livingPlayers = battlers.filter(b => b instanceof PartyMember && b.getHp() > 0) as PartyMember[];
      const expPerPlayer = Math.floor(totalExp / livingPlayers.length);

      for (const player of livingPlayers) {
        const oldLevel = player.getLevel();
        player.giveExp(expPerPlayer);
        const newLevel = player.getLevel();

        // Show EXP gain message
        await PSMenu.StextNext(PSGame.getString("Battle_Xp_Points", "<number>", expPerPlayer.toString()));

        // Check for level up
        if (newLevel > oldLevel) {
          await PSMenu.StextNext(PSGame.getString("Battle_Level_Up", "<player>", player.getName(), "<level>", newLevel.toString()));

          // TODO: Handle stat increases and technique learning
        }
      }
    }

    // Award mesetas
    if (totalMesetas > 0) {
      PSGame.getParty().addMesetas(totalMesetas);
      await PSMenu.StextLast(PSGame.getString("Battle_Mesetas_Gain", "<amount>", totalMesetas.toString()));
    }

    // TODO: Handle item drops from enemies
  }

  private setEnemyActions(battlers: Battler[]): void {
    for (const battler of battlers) {
      if (!(battler instanceof EnemyBattler) || battler.getHp() <= 0) {
        continue;
      }

      const enemy = battler;

      // Simple AI: mostly attack, occasionally use special if available
      if (enemy.getEnemy().special && Math.random() < 0.25) {
        enemy.action = Action.SPECIAL;
      } else {
        enemy.action = Action.ATTACK;
      }

      // Select target (random living player)
      const players = battlers.filter(b => b instanceof PartyMember && b.getHp() > 0);
      if (players.length > 0) {
        enemy.target = players[Math.floor(Math.random() * players.length)];
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
  private async playerAttackAnimation(attacker: Battler, defender: Battler, animation: MenuCHR, xAdj: number, sound: any): Promise<boolean> {
    // Calculate critical hit based on strength difference (original formula)
    const criticalChance = Math.max(0, attacker.getStr() - defender.getStr());
    const criticalRoll = Math.floor(Math.random() * 256);
    const isCritical = criticalRoll < criticalChance;

    // Hide boxes and focus on target
    await this.hideBoxesAndShowTarget(defender, this.currentBattlers);

    if (defender instanceof EnemyBattler) {
      // Position weapon animation at enemy contact point
      const contactX = defender.sprite?.x || 0;
      const contactY = defender.getContactPos();

      animation.changePosition(contactX + xAdj, contactY);
      PSMenu.instance.push(animation);

      // Start weapon animation
      animation.animate(MenuState.ANIM1);

      // Play attack sound
      if (sound) {
        PSGame.playSound(sound);
      }

      // Wait for animation to complete
      await this.waitForAnimationComplete(animation);

      // Show critical hit message if applicable
      if (isCritical) {
        const criticalMessage = PSGame.getString("Battle_Critical_Hit");
        // Position critical hit message near target
        await PSMenu.StextTimeout(criticalMessage);
      }

      // Clean up animation
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

    // Add small delay for visual effect (original Java timing)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Wait for MenuCHR animation to complete
   * @param animation The animation to wait for
   */
  private async waitForAnimationComplete(animation: MenuCHR): Promise<void> {
    // Wait for animation to finish (simplified timing)
    // In original Java this checks animation state, here we use fixed timing
    await new Promise(resolve => setTimeout(resolve, 500));
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
      }

      // Enemy hit animation
      if (defender.sprite) {
        defender.sprite.animate(MenuState.ANIM3);
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
    console.log("weak:");

    // Play miss sound
    PSGame.playSound(PS1Sound.MISS);

    // Display dodge message based on attacker type
    const defenderName = defender instanceof EnemyBattler
      ? defender.getEnemy().getTranslatedName(PSGame)
      : defender.getName();
    const attackerName = attacker instanceof EnemyBattler
      ? attacker.getEnemy().getTranslatedName(PSGame)
      : attacker.getName();

    if (attacker instanceof PartyMember) {
      // Enemy dodged player attack
      const message = PSGame.getString("Battle_Enemy_Dodge", "<monster>", defenderName, "<player>", attackerName);
      console.log(message);
    } else {
      // Player dodged enemy attack
      const message = PSGame.getString("Battle_Player_Dodge", "<player>", defenderName, "<monster>", attackerName);
      console.log(message);
    }
  }

  /**
   * Screen shake effect when players take damage - port of original earthquakeEffect
   * @param amount Damage amount determining shake intensity
   */
  private async earthquakeEffect(amount: number): Promise<void> {
    console.log(`Screen shake effect for ${amount} damage`);

    // Simplified screen shake - in original Java this manipulates screen buffer
    // For now we just add a delay to simulate the effect
    const shakeIntensity = Math.min(amount / 10, 5);
    const shakeDuration = shakeIntensity * 50; // 50ms per intensity point

    // TODO: Implement actual screen shake with Phaser camera effects
    await new Promise(resolve => setTimeout(resolve, shakeDuration));
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
      // Player death handling
      if (battler.textBox) {
        battler.textBox.setOff();
      }

      // Play death sound
      PSGame.playSound(PS1Sound.DEAD);

      // Show death message
      const deathMessage = PSGame.getString("Battle_Player_Died", "<player>", battler.getName());
      await PSMenu.StextTimeout(deathMessage);

    } else if (battler instanceof EnemyBattler) {
      // Enemy death handling
      const enemyName = battler.getEnemy().getTranslatedName(PSGame);
      console.log(`Enemy ${enemyName} killed - removing sprite`);

      if (battler.sprite) {
        console.log(`Destroying sprite for ${enemyName}`);
        battler.sprite.destroy();
        battler.sprite = null;
        console.log(`Sprite destroyed for ${enemyName}`);
      }

      // Show victory message with translated enemy name
      const victoryMessage = PSGame.getString("Battle_Monster_Killed", "<monster>", enemyName);
      await PSMenu.StextTimeout(victoryMessage);
    }
  }

  // Helper methods for battle menu system
  private async selectEnemyTarget(battlers: Battler[]): Promise<EnemyBattler | null> {
    const enemies = battlers.filter(b => b instanceof EnemyBattler && b.getHp() > 0) as EnemyBattler[];
    if (enemies.length === 0) return null;
    if (enemies.length === 1) return enemies[0];

    const enemyNames = enemies.map(e => e.getEnemy().getTranslatedName(PSGame) || e.getEnemy().getName());
    const targetMenu = PSMenu.instance.createPromptBox(50, 50, enemyNames, true);
    PSMenu.instance.push(targetMenu);

    const choice = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
    PSMenu.instance.pop();

    return choice >= 0 ? enemies[choice] : null;
  }

  private async selectTarget(battlers: Battler[], targetEnemies: boolean): Promise<Battler | null> {
    if (targetEnemies) {
      return this.selectEnemyTarget(battlers);
    } else {
      const allies = battlers.filter(b => b instanceof PartyMember && b.getHp() > 0) as PartyMember[];
      if (allies.length === 0) return null;
      if (allies.length === 1) return allies[0];

      const allyNames = allies.map(p => p.getName());
      const targetMenu = PSMenu.instance.createPromptBox(50, 50, allyNames, true);
      PSMenu.instance.push(targetMenu);

      const choice = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
      PSMenu.instance.pop();

      return choice >= 0 ? allies[choice] : null;
    }
  }

  private async selectTechnique(player: PartyMember): Promise<any | null> {
    // TODO: Implement technique selection from player's learned techniques
    // For now return null (no techniques available)
    return null;
  }

  private async selectItem(player: PartyMember): Promise<any | null> {
    // TODO: Implement item selection from party inventory
    // For now return null (no items available)
    return null;
  }
}