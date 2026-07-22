/**
 * Baya_malay - Dungeon Script (Baya Malay tower)
 * TypeScript port of Baya_malay.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Flags, Trap } from '../game/GameData';
import { Planet, City } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PS1CHR } from '../game/PSLibCHR';
import { PS1Image } from '../game/PSLibImage';
import { PS1Music } from '../game/PSLibMusic';
import { PS1Sound } from '../game/PSLibSound';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { MenuCHR } from '../menu/MenuCHR';
import { MenuState } from '../menu/MenuType';
import { Specie } from '../game/Specie';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Baya_malay {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Baya_malay);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.SORCERER, PS1Enemy.CENTAUR, PS1Enemy.GIANT]);
      dungeon.setRandomEnemies(1, [PS1Enemy.SORCERER, PS1Enemy.STALKER, PS1Enemy.GIANT]);
      dungeon.setRandomEnemies(2, [PS1Enemy.REAPER, PS1Enemy.GR_SLIME]);
      dungeon.setRandomEnemies(3, [PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.ANDROCOP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN, PS1Enemy.WYVERN]);
      dungeon.setRandomEnemies(-3, [PS1Enemy.ANDROCOP, PS1Enemy.HORSEMAN, PS1Enemy.WYVERN, PS1Enemy.GIANTFLY]);

      dungeon.setFixedEnemies(0, [PS1Enemy.SORCERER, PS1Enemy.CENTAUR]);
      dungeon.setFixedEnemies(1, [PS1Enemy.STALKER, PS1Enemy.SORCERER, PS1Enemy.STALKER]);
      dungeon.setFixedEnemies(2, [PS1Enemy.REAPER, PS1Enemy.SORCERER]);
      dungeon.setFixedEnemies(3, [PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.MAGICIAN, PS1Enemy.HORSEMAN]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP]);
      dungeon.setFixedEnemies(-3, [PS1Enemy.WYVERN, PS1Enemy.GIANTFLY]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST2, 50, Trapped.ARROW, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST3, 0, Trapped.NO_TRAP, null);
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Light_Pendant));
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST5, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST6, 500, Trapped.NO_TRAP, null);
  }

  public static async chest7(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST7, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
  }

  public static async chest8(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST8, 0, Trapped.EXPLOSION, null);
  }

  public static async chest9(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST9, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest10(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST10, 500, Trapped.NO_TRAP, null);
  }

  public static async chest11(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST11, 20, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest12(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST12, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Iron_Sword));
  }

  public static async chest13(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST13, 0, Trapped.ARROW, PSGame.getItem(OriginalItem.Weapon_Short_Sword));
  }

  public static async chest14(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST14, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Light_Saber));
  }

  public static async chest15(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST15, 0, Trapped.EXPLOSION, PSGame.getItem(OriginalItem.Quest_Miracle_Key));
  }

  public static async chest16(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST16, 20, Trapped.NO_TRAP, null);
  }

  public static async chest17(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST17, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest18(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST18, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest19(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST19, 100, Trapped.NO_TRAP, null);
  }

  public static async chest20(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST20, 0, Trapped.ARROW, null);
  }

  public static async chest21(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST21, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Iron_Axe));
  }

  public static async chest22(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST22, 0, Trapped.EXPLOSION, null);
  }

  public static async chest23(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST23, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest24(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST24, 0, Trapped.ARROW, null);
  }

  public static async chest25(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST25, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest26(): Promise<void> {
    await PSGame.chestFlag(Chest.BAYA_MALAY_CHEST26, 0, Trapped.EXPLOSION, null);
  }

  public static async stairs_1_up(): Promise<void> {
    await PSGame.warp(30, 4, false);
  }

  public static async stairs_1_down(): Promise<void> {
    await PSGame.warp(14, 2, false);
  }

  public static async stairs_2_up(): Promise<void> {
    await PSGame.warp(26, 10, false);
  }

  public static async stairs_2_down(): Promise<void> {
    await PSGame.warp(12, 10, false);
  }

  public static async stairs_3_up(): Promise<void> {
    await PSGame.warp(29, 12, false);
  }

  public static async stairs_3_down(): Promise<void> {
    await PSGame.warp(11, 12, false);
  }

  public static async stairs_4_up(): Promise<void> {
    await PSGame.warp(10, 19, false);
  }

  public static async stairs_4_down(): Promise<void> {
    await PSGame.warp(26, 5, false);
  }

  public static async stairs_5_up(): Promise<void> {
    await PSGame.warp(8, 24, false);
  }

  public static async stairs_5_down(): Promise<void> {
    await PSGame.warp(26, 8, false);
  }

  public static async stairs_6_up(): Promise<void> {
    await PSGame.warp(3, 25, false);
  }

  public static async stairs_6_down(): Promise<void> {
    await PSGame.warp(19, 11, false);
  }

  public static async stairs_7_up(): Promise<void> {
    await PSGame.warp(14, 25, false);
  }

  public static async stairs_7_down(): Promise<void> {
    await PSGame.warp(30, 11, false);
  }

  public static async stairs_8_up(): Promise<void> {
    await PSGame.warp(5, 29, false);
  }

  public static async stairs_8_down(): Promise<void> {
    await PSGame.warp(21, 11, false);
  }

  public static async stairs_9_up(): Promise<void> {
    await PSGame.warp(30, 20, false);
  }

  public static async stairs_9_down(): Promise<void> {
    await PSGame.warp(14, 18, false);
  }

  public static async stairs_10_up(): Promise<void> {
    await PSGame.warp(17, 27, false);
  }

  public static async stairs_10_down(): Promise<void> {
    await PSGame.warp(1, 25, false);
  }

  public static async stairs_11_up(): Promise<void> {
    await PSGame.warp(26, 30, false);
  }

  public static async stairs_11_down(): Promise<void> {
    await PSGame.warp(8, 30, false);
  }

  public static async stairs_12_up(): Promise<void> {
    await PSGame.warp(7, 35, false);
  }

  public static async stairs_12_down(): Promise<void> {
    await PSGame.warp(25, 19, false);
  }

  public static async stairs_13_up(): Promise<void> {
    await PSGame.warp(7, 42, false);
  }

  public static async stairs_13_down(): Promise<void> {
    await PSGame.warp(23, 28, false);
  }

  public static async stairs_14_up(): Promise<void> {
    await PSGame.warp(11, 42, false);
  }

  public static async stairs_14_down(): Promise<void> {
    await PSGame.warp(27, 28, false);
  }

  public static async stairs_15_up(): Promise<void> {
    await PSGame.warp(14, 45, false);
  }

  public static async stairs_15_down(): Promise<void> {
    await PSGame.warp(30, 27, false);
  }

  public static async stairs_16_up(): Promise<void> {
    await PSGame.warp(26, 33, false);
  }

  public static async stairs_16_down(): Promise<void> {
    await PSGame.warp(8, 33, false);
  }

  public static async stairs_17_up(): Promise<void> {
    await PSGame.warp(28, 36, false);
  }

  public static async stairs_17_down(): Promise<void> {
    await PSGame.warp(12, 38, false);
  }

  public static async stairs_18_up(): Promise<void> {
    await PSGame.warp(19, 44, false);
  }

  public static async stairs_18_down(): Promise<void> {
    await PSGame.warp(3, 42, false);
  }

  public static async stairs_19_up(): Promise<void> {
    await PSGame.warp(17, 43, false);
  }

  public static async stairs_19_down(): Promise<void> {
    await PSGame.warp(1, 45, false);
  }

  public static async stairs_20_up(): Promise<void> {
    await PSGame.warp(6, 50, false);
  }

  public static async stairs_20_down(): Promise<void> {
    await PSGame.warp(20, 33, false);
  }

  public static async stairs_21_up(): Promise<void> {
    await PSGame.warp(13, 50, false);
  }

  public static async stairs_21_down(): Promise<void> {
    await PSGame.warp(27, 33, false);
  }

  public static async stairs_22_up(): Promise<void> {
    await PSGame.warp(28, 55, false);
  }

  public static async stairs_22_down(): Promise<void> {
    await PSGame.warp(10, 55, false);
  }

  public static async stairs_23_up(): Promise<void> {
    await PSGame.warp(28, 57, false);
  }

  public static async stairs_23_down(): Promise<void> {
    await PSGame.warp(10, 57, false);
  }

  public static async stairs_24_up(): Promise<void> {
    await PSGame.warp(28, 61, false);
  }

  public static async stairs_24_down(): Promise<void> {
    await PSGame.warp(10, 61, false);
  }

  public static async stairs_25_up(): Promise<void> {
    await PSGame.warp(18, 63, false);
  }

  public static async stairs_25_down(): Promise<void> {
    await PSGame.warp(4, 63, false);
  }

  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP1, Trap.INFO_BAYA_MALAY_TRAP1, 12, 9);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP2, Trap.INFO_BAYA_MALAY_TRAP2, 26, 8);
  }

  public static async trap3(): Promise<void> {
    await PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP3, Trap.INFO_BAYA_MALAY_TRAP3, 20, 12);
  }

  public static async trap4(): Promise<void> {
    await PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP4, Trap.INFO_BAYA_MALAY_TRAP4, 1, 22);
  }

  public static async oldman(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.OLDMAN);
    if (await PSMenu.Prompt(PSGame.getString("Baya_Malay_Tower_Questioner"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_Questioner_Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_Questioner_No"));
    }
    await PSMenu.endScene();
  }

  public static async damor(): Promise<void> {
    await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.OLDMAN);
    // Question 1
    if (await PSMenu.Prompt(PSGame.getString("Baya_Malay_Tower_DamorIntro"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextNext(PSGame.getString("Baya_Malay_Tower_DamorYes"));

      // If already has crystal, end here
      if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Damoa_Crystal))) {
        await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorCorrectYes"));
      } else {
        // Question 2
        if (await PSMenu.PromptNext(PSGame.getString("Baya_Malay_Tower_DamorSearch"), PSGame.getYesNo()) === 1) {
          await PSMenu.StextNext(PSGame.getString("Baya_Malay_Tower_DamorYes"));

          // Question 3
          if (await PSMenu.PromptNext(PSGame.getString("Baya_Malay_Tower_DamorAlex"), PSGame.getYesNo()) === 1) {
            await PSMenu.StextNext(PSGame.getString("Baya_Malay_Tower_DamorYes"));

            // Question 4
            if (await PSMenu.PromptNext(PSGame.getString("Baya_Malay_Tower_DamorCorrect"), PSGame.getYesNo()) === 1) {
              await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorCorrectYes"));
            } else {
              // Question 5
              if (await PSMenu.PromptNext(PSGame.getString("Baya_Malay_Tower_DamorCorrectNo"), PSGame.getYesNo()) === 1) {
                await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorContradictYes"));
              } else {
                await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorContradictNo"));
                PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Damoa_Crystal));
              }
            }
          } else {
            await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorCorrectYes")); // Question 3: Then come again
          }
        } else {
          await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorCorrectYes")); // Question 2: Then come again
        }
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorNo")); // Question 1
    }

    await PSMenu.endScene();
  }

  public static async skull(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(1, 3) - inclusive on both ends
    const quantity = 1 + Math.floor(Math.random() * 3);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.SKULL_EN)!, quantity);
  }

  // Changed monster to Palma correspondent
  public static async bluescorpion(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(2, 4) - inclusive on both ends
    const quantity = 2 + Math.floor(Math.random() * 3);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.SCORPION)!, quantity);
  }

  public static async stalker1(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(1, 3) - inclusive on both ends
    const quantity = 1 + Math.floor(Math.random() * 3);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.SKELETON_GUARD)!, quantity);
  }

  public static async stalker2(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(2, 3) - inclusive on both ends
    const quantity = 2 + Math.floor(Math.random() * 2);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.SKELETON_GUARD)!, quantity);
  }

  public static async sky(): Promise<void> {
    const currentScene = PSGame.getCurrentScene();
    if (!currentScene) return;

    PSMenu.setMapOff();
    await PSMenu.startScene(PSSceneType.BAYA, SpecialEntity.NONE);
    if (!await PSMenu.instance.waitAnyButton()) {
      await PSMenu.endScene();
      return;
    }

    if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Aeroprism))) {
      await PSMenu.endScene();
      return;
    }

    const alivePlayer = PSGame.getParty().getFirstAlivePlayer();
    await PSMenu.Stext(PSGame.getString("Item_TookOut",
      "<player>", PSGame.getParty().getMember(alivePlayer)!.getName(),
      "<item>", PSGame.getItem(OriginalItem.Quest_Aeroprism).getName()));

    await PSGame.playMusic(PS1Music.PALACE);

    // Java: PSMenu.instance.back.changeColor() palette-swap cycle - approximated
    // with background tints since the Phaser port has no per-pixel recolor
    const flashColors = [0xff0000, 0x00ff00, 0xffff00, 0x808080, 0x00ffff, 0xff00ff, 0xffc800, 0x0000ff];
    for (const color of flashColors) {
      PSMenu.instance.back?.setTint(color);
      await PSMenu.instance.waitDelay(6);
    }
    PSMenu.instance.back?.clearTint();

    // Make castle appear
    const castle = new MenuCHR(currentScene, 125, 55, await PSGame.getCHR(PS1CHR.SKY_CASTLE));
    castle.setDepth(1995); // above scene background (1950), below menu text boxes (2000+)
    PSMenu.instance.push(castle);
    castle.animate(MenuState.ANIM1);
    await PSMenu.instance.waitAnimationEnd(castle);
    castle.animate(MenuState.ANIM2);

    let muskCat = null;
    for (const p of PSGame.getParty().getMembers()) {
      if (p.getSpe() === Specie.MUSK_CAT) {
        muskCat = p;
        break;
      }
    }

    if (await PSMenu.instance.waitAnyButton() && muskCat !== null && muskCat.getHp() > 0) {

      let flyToBaya = false;

      if (PSGame.hasFlag(Flags.DEFEAT_GOLD_DRAKE)) {
        flyToBaya = true;
      } else if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laerma_Berries))) {
        flyToBaya = true;
        await PSMenu.Stext(PSGame.getString("Baya_Malay_Myau_Eat"));
        PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Laerma_Berries));
        PSMenu.instance.pop();

        await PSGame.playMusic(PS1Music.STORY);
        await PSMenu.startScene(PSSceneType.CORRIDOR, SpecialEntity.NONE);
        // Java: PSMenu.instance.back = new VImage(...) - black backdrop covering
        // the dungeon first-person view (the following startScene(BAYA) replaces it).
        PSMenu.instance.setBlackBackground();
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_BEAST1), [PSGame.getString("Cinematic_Baya_Malay_1")]);
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_BEAST2), [PSGame.getString("Cinematic_Baya_Malay_2")]);
      }

      if (flyToBaya) {

        await PSMenu.startScene(PSSceneType.BAYA, SpecialEntity.NONE);
        const castleAgain = new MenuCHR(currentScene, 125, 55, await PSGame.getCHR(PS1CHR.SKY_CASTLE));
        castleAgain.setDepth(1995); // above scene background (1950), below menu text boxes (2000+)
        PSMenu.instance.push(castleAgain);
        castleAgain.animate(MenuState.ANIM2);

        const flyingBeast = new MenuCHR(currentScene, 295, 225, true, await PSGame.getCHR(PS1CHR.MYAU_FLAPPING));
        flyingBeast.setDepth(1995); // above scene background (1950), below menu text boxes (2000+)
        PSMenu.instance.push(flyingBeast);
        flyingBeast.animate(MenuState.ANIM1);
        PSGame.playSound(PS1Sound.FLAPPING);

        for (let i = 0; i < 140; i++) {
          flyingBeast.changePosition(295 - i, 225 - Math.floor(i / 2));
          await PSMenu.instance.waitDelay(1);
        }

        PSMenu.instance.pop(); // Myau flapping
        PSMenu.instance.pop(); // Castle

        if (!PSGame.hasFlag(Flags.DEFEAT_GOLD_DRAKE)) {
          const battle = new PSBattle();
          await PSMenu.startScene(PSSceneType.SKY, SpecialEntity.NONE);
          const battleResult = await battle.startBattle([PSLibEnemy.getEnemyByEnum(PS1Enemy.GD_DRAGN)!], PS1Music.BATTLE);
          if (battleResult === BattleOutcome.DEFEAT) {
            // gameOverRoutine switches to the title scene; endScene would
            // await a fade on the torn-down scene and never resolve
            await PSGame.gameOverRoutine();
            return;
          }
          // If Myau is dead
          else if (muskCat.getHp() <= 0) {
            await PSMenu.StextFirst(PSGame.getString("Baya_Malay_Myau_Fall"));
            await PSGame.gameOverRoutine();
            return;
          } else {
            PSGame.setFlag(Flags.DEFEAT_GOLD_DRAKE);
          }
        }
      }

      await PSMenu.endScene();
      await PSGame.mapswitchToCity(City.SKY_CASTLE, 22, 25);

    } else {
      PSMenu.instance.pop();
      await PSMenu.endScene();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 105, 22);
  }
}
