/**
 * PSMenu - Phantasy Star Scene and Menu Utility System
 * Direct port of PSMenu.java - Handles scene transitions, entity display, and menu utilities
 */

import { MenuStack } from './menu/MenuStack';
import { MenuImageBox } from './menu/MenuImageBox';
import { MenuScrollerText } from './menu/MenuScrollerText';
import { MenuTextBox } from './menu/MenuTextBox';
import { MenuCHR } from './menu/MenuCHR';
import { ScriptEngine } from '../../core/ScriptEngine';
import { PSGame } from './PSGame';
import { CHR } from '../../domain/CHR';
import { VImage } from '../../domain/VImage';
import { ScreenSize } from './game/GameData';

export enum Scene {
  BLACK, BLUE_HOUSE, YELLOW_HOUSE, HOSPITAL, CHURCH, SHOP_CENTRAL, SHOP_FOOD, SHOP_HAND, SHOP_WEAPON,
  VILLAGE_HOUSE, SHOP_FOOD_VILLAGE, SHOP_HAND_VILLAGE, SHOP_WEAPON_VILLAGE, HOSPITAL_VILLAGE, CHURCH_VILLAGE,
  RUINED_HOUSE, SPACESHIP, PALACE, VILLA, CITY, BAYA, ALTAR, SCREEN, SCREEN_NOFADE, TITLE, ENDING,
  DUNGEON, CORRIDOR, FOREST, FIELDS, DESERT, ARTIC, PINES, SKY, BEACH, SEA, LAVA, GAS, CAVE
}

export enum EntityType {
  CITY_MAN_BLOND, CITY_WMN_BLOND, VILLA_MAN_BLOND, VILLA_WMN_BLOND,
  CITY_MAN_BROWN, CITY_WMN_BROWN, VILLA_MAN_BROWN, VILLA_WMN_BROWN,
  CITY_MAN_BLUE, CITY_WMN_BLUE, VILLA_MAN_BLUE, VILLA_WMN_BLUE,
  CITY_MAN_CUSTOM, CITY_WMN_CUSTOM, MOTA_NOCAP, MOTA_CAP,
  MOTA_MASK, MOTA_CUSTOM, DEZO, NECRO, SPECIAL
}

export enum EntityClothes { RED, GREEN, BLUE, WHITE }
export enum MotaCape { GREEN, RED, YELLOW, BROWN }
export enum DezoType { REGULAR, HEAD, BLUE, TORCH }
export enum NecroType { PALMAN, DEZO, ESPER, SKULL }

export enum SpecialEntity {
  NONE, OLDMAN, BEGGAR, ROBOTCOP, PRIEST, LUVENO, HASHIM, DEZOMAN, DEZO_PRIEST
}

export enum LargeEntity {
  NOAH, JUNK, HAPSBY, GOVERNOR, MYAU, ALIS, LAERMA1, LAERMA2, SORCERER
}

export enum Position { TOP_LEFT, TOP_CENTER, TOP_RIGHT, BOTTOM_ROW }

export class PSMenu {
  public static instance: MenuStack;

  /**
   * Initialize PS Menu system - direct port of Java initPSMenu()
   */
  public static initPSMenu(screenSize: ScreenSize): void {
    if (!PSMenu.instance) {
      // This should be initialized by the scene that uses it
      console.warn('PSMenu.instance not initialized');
      return;
    }

    if (screenSize === ScreenSize.SCREEN_320_240) {
      PSMenu.instance.MAX_SCREEN_X = 320;
      PSMenu.instance.MAX_SCREEN_Y = 240;
      MenuStack.fontXSize = 7;
      MenuStack.fontYSize = 11;
    } else if (screenSize === ScreenSize.SCREEN_640_480) {
      PSMenu.instance.MAX_SCREEN_X = 640;
      PSMenu.instance.MAX_SCREEN_Y = 480;
      MenuStack.fontXSize = 16;
      MenuStack.fontYSize = 16;
    }

    // Load more icon
    // PSMenu.instance.moreIcon = new VImage(...);

    // Calculate text positioning
    PSMenu.instance.STEXT_BOTTOM_X = PSMenu.instance.MAX_SCREEN_X / 14;
    PSMenu.instance.STEXT_BOTTOM_Y = Math.floor(PSMenu.instance.MAX_SCREEN_Y / 1.4);
    PSMenu.instance.STEXT_BOTTOM_WX = PSMenu.instance.MAX_SCREEN_X - PSMenu.instance.STEXT_BOTTOM_X * 2;
    PSMenu.instance.STEXT_BOTTOM_WY = 16 * 2 + 10;
  }

  /**
   * Enable menu input hooks - direct port of Java menuOn()
   */
  public static menuOn(): void {
    // TODO: Implement button hooks for menu system
    // In original Java: hookbutton(4, "PSMenuMain.menu")
  }

  /**
   * Disable menu input hooks - direct port of Java menuOff()
   */
  public static menuOff(): void {
    // TODO: Implement button hook clearing
  }

  // Scene management methods

  /**
   * Start scene with character - direct port of Java startScene(Scene, String)
   */
  public static startScene(scene: Scene, strChar?: string): void {
    if (strChar) {
      // Big screen shows players in scene graphics
      if (PSGame.gameData.getScreenSize() === ScreenSize.SCREEN_640_480) {
        PSMenu.instance.npc = CHR.loadChr(strChar);
        PSMenu.instance.showPlayers = true;
      } else {
        PSMenu.instance.npc = null;
        PSMenu.instance.showPlayers = false;
      }
    }

    PSMenu.startSceneInternal(scene);
  }

  /**
   * Start scene with special entity - direct port of Java startScene(Scene, SpecialEntity)
   */
  public static startSceneWithSpecialEntity(scene: Scene, specialEntity: SpecialEntity): void {
    if (specialEntity === SpecialEntity.NONE) {
      PSMenu.instance.entitySprite = null;
      PSMenu.startSceneInternal(scene);
      return;
    }

    PSMenu.startSceneWithEntityType(scene, EntityType.SPECIAL, specialEntity - 1);
  }

  /**
   * Start scene with large entity - direct port of Java startScene(Scene, LargeEntity)
   */
  public static startSceneWithLargeEntity(scene: Scene, largeEntity: LargeEntity): void {
    // TODO: Load large entity sprites
    // PSMenu.instance.entitySprite = new VImage(56, 112);
    // PSMenu.instance.entitySprite.image = PSGame.getCHR(PS1CHR.IMG_ENTITIES_LARGE).getFrames()[largeEntity];
    // PSMenu.instance.entityY = 210 - PSMenu.instance.entitySprite.height;

    PSMenu.startSceneInternal(scene);
  }

  /**
   * Start scene with CHR - direct port of Java startScene(Scene, CHR)
   */
  public static startSceneWithCHR(scene: Scene, chr: CHR): void {
    // TODO: Create VImage from CHR
    // PSMenu.instance.entitySprite = new VImage(chr.getFxsize(), chr.getFysize());
    // PSMenu.instance.entitySprite.image = chr.getFrames()[0];
    // PSMenu.instance.entityY = 183 - PSMenu.instance.entitySprite.height;

    PSMenu.startSceneInternal(scene);
  }

  /**
   * Start scene with entity type - direct port of Java startScene(Scene, EntityType, int)
   */
  private static startSceneWithEntityType(scene: Scene, entityType: EntityType, numIndex: number): void {
    PSMenu.instance.entitySprite = null;
    // TODO: Create entity sprite based on type and index
    // PSMenu.instance.entitySprite = new VImage(35, 90);

    const isHalf = scene.toString().startsWith('SHOP') ||
                   scene.toString().startsWith('HOSP') ||
                   scene.toString().startsWith('CHURCH');

    // TODO: Load entity graphics based on type and create sprite
    PSMenu.instance.entityY = 183; // - PSMenu.instance.entitySprite.height;

    // Special positioning for MOTA characters
    if (!isHalf && (entityType === EntityType.MOTA_CAP || entityType === EntityType.MOTA_MASK ||
                   entityType === EntityType.MOTA_NOCAP || entityType === EntityType.MOTA_CUSTOM)) {
      PSMenu.instance.entityY += 20;
    }

    PSMenu.startSceneInternal(scene);
  }

  /**
   * Internal scene start logic - direct port of Java startScene(Scene)
   */
  private static startSceneInternal(scene: Scene): void {
    // Clear button press state
    // unpress(9);

    // Position entity sprite if present
    if (PSMenu.instance.entitySprite) {
      PSMenu.instance.entityX = 320 / 2; // - (PSMenu.instance.entitySprite.width / 2);
      if (scene === Scene.DUNGEON || scene === Scene.CORRIDOR) {
        PSMenu.instance.entityY += 13;
      }
    }

    // Pause entities and disable menu
    ScriptEngine.setEntitiesPaused(true);
    PSMenu.menuOff();

    // Handle scene fading
    if (scene === Scene.DUNGEON || scene === Scene.SCREEN || scene === Scene.BLACK || scene === Scene.ALTAR) {
      // TODO: screen.fadeIn(25, false);
    } else if (scene === Scene.CORRIDOR || scene === Scene.SCREEN_NOFADE) {
      // Do nothing
    } else {
      // TODO: screen.fade(25, true);
      PSMenu.instance.back = null;
      PSMenu.instance.backAnim = null;
    }

    PSMenu.instance.setdelay(20);

    // Set scene-specific background and outcome
    switch (scene) {
      case Scene.BLUE_HOUSE:
      case Scene.YELLOW_HOUSE:
      case Scene.SHOP_FOOD:
      case Scene.SHOP_HAND:
      case Scene.SHOP_WEAPON:
      case Scene.HOSPITAL:
      case Scene.CHURCH:
      case Scene.VILLAGE_HOUSE:
      case Scene.SHOP_FOOD_VILLAGE:
      case Scene.SHOP_HAND_VILLAGE:
      case Scene.SHOP_WEAPON_VILLAGE:
      case Scene.HOSPITAL_VILLAGE:
      case Scene.CHURCH_VILLAGE:
      case Scene.RUINED_HOUSE:
      case Scene.SPACESHIP:
      case Scene.PALACE:
      case Scene.VILLA:
      case Scene.CITY:
      case Scene.TITLE:
      case Scene.ENDING:
        PSMenu.instance.back = PSGame.getImage(scene);
        PSMenu.instance.outcome = PSOutcome.FADE_HOUSE;
        break;

      case Scene.CAVE:
      case Scene.FOREST:
      case Scene.FIELDS:
      case Scene.DESERT:
      case Scene.ARTIC:
      case Scene.PINES:
      case Scene.SKY:
        PSMenu.instance.back = PSGame.getImage(scene);
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case Scene.BAYA:
        PSMenu.instance.setdelay(0);
        PSMenu.instance.back = PSGame.getImage(scene);
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case Scene.LAVA:
        // PSMenu.instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_LAVA));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case Scene.BEACH:
        // PSMenu.instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_BEACH));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case Scene.SEA:
        // PSMenu.instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_SEA));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case Scene.GAS:
        // PSMenu.instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_GAS));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case Scene.ALTAR:
        PSMenu.instance.back = PSGame.getImage(scene);
        PSMenu.instance.outcome = PSOutcome.FADE_DUNGEON;
        break;

      case Scene.DUNGEON:
        PSMenu.instance.outcome = PSOutcome.FADE_DUNGEON;
        break;

      case Scene.CORRIDOR:
        PSMenu.instance.outcome = PSOutcome.NO_FADE;
        break;

      case Scene.SCREEN:
      case Scene.SCREEN_NOFADE:
        PSMenu.instance.outcome = PSOutcome.FADE_HOUSE;
        PSMenu.instance.setdelay(0);
        break;

      default:
        // TODO: Create default background
        // PSMenu.instance.back = new VImage(screen.width, screen.height);
        PSMenu.instance.outcome = PSOutcome.FADE_HOUSE;
        break;
    }
  }

  /**
   * End scene - direct port of Java endScene()
   */
  public static endScene(): void {
    PSMenu.endSceneWithOutcome(PSMenu.instance.outcome);
  }

  /**
   * End scene with specific outcome - direct port of Java endScene(Outcome)
   */
  public static endSceneWithOutcome(outcome: PSOutcome): void {
    // Clean up scene elements
    PSMenu.instance.npc = null;
    PSMenu.instance.entitySprite = null;
    PSMenu.instance.backAnim = null;

    if (outcome === PSOutcome.FADE_HOUSE || outcome === PSOutcome.FADE) {
      PSMenu.instance.back = null;

      if (outcome === PSOutcome.FADE_HOUSE) {
        // TODO: Script.pauseplayerinput();
        PSGame.regroup(0, 1);
        // TODO: screen.fade(25, false);
        // TODO: Script.unpauseplayerinput();
      }

      if (outcome === PSOutcome.FADE) {
        // TODO: Script.pauseplayerinput();
        if (!PSGame.isOnTransport()) {
          PSGame.regroup(0, 0);
        }
        // TODO: screen.fadeOut(50, false);
        // TODO: Script.unpauseplayerinput();
      }

      ScriptEngine.setEntitiesPaused(false);
    } else if (outcome === PSOutcome.FADE_DUNGEON) {
      // TODO: screen.fadeOut(25, false);
      // TODO: PSDungeon.warpBack(2);
    }

    PSMenu.menuOn();
  }

  /**
   * Display cinematic text with portrait - direct port of Java cinematicText()
   */
  public static async cinematicText(portrait: VImage, texts: string[]): Promise<void> {
    const portraitBox = MenuImageBox.MenuImage(PSMenu.instance.scene, PSMenu.instance, 32, 22, portrait);
    PSMenu.instance.push(portraitBox);

    for (let t = 0; t < texts.length; t++) {
      const rows = PSMenu.splitTextIntoRows(texts[t], 30);

      for (let i = 0; i <= Math.floor((rows.length - 1) / 4); i++) {
        const strText: string[] = [];
        const endIndex = Math.min(4, rows.length - i * 4);

        for (let j = 0; j < endIndex; j++) {
          strText[j] = rows[i * 4 + j];
          console.log(strText[j]);
        }

        const menuScrollerText = new MenuScrollerText(PSMenu.instance.scene, 35, 22 + 113 + 15, strText);
        PSMenu.instance.push(menuScrollerText);

        await PSMenu.instance.waitReady(menuScrollerText);
        await PSMenu.instance.waitB1();

        // If last chunk of text, fade out
        if (t === texts.length - 1 && i + 1 > Math.floor((rows.length - 1) / 4)) {
          // TODO: screen.fadeOut(25, false);
        }

        PSMenu.instance.pop();
      }
    }

    PSMenu.instance.pop();
  }

  /**
   * Show prompt with text - direct port of Java Prompt()
   */
  public static async Prompt(text: string, choices: string[]): Promise<number> {
    return PSMenu.PromptInternal(text, choices, true);
  }

  /**
   * Show prompt (continuation) - direct port of Java PromptNext()
   */
  public static async PromptNext(text: string, choices: string[]): Promise<number> {
    return PSMenu.PromptInternal(text, choices, false);
  }

  /**
   * Internal prompt implementation - direct port of Java Prompt()
   */
  private static async PromptInternal(text: string, choices: string[], isFirst: boolean): Promise<number> {
    const rows = PSMenu.splitTextIntoRows(text, 37);

    // Show multiple textboxes with at most two rows for text
    let textBox: MenuTextBox | null = null;
    for (let j = 0; j < rows.length; j++) {
      const r2 = (j + 1 < rows.length) ? rows[j + 1] : '';

      textBox = PSMenu.instance.createTextBox(
        PSMenu.instance.STEXT_BOTTOM_X,
        PSMenu.instance.STEXT_BOTTOM_Y,
        PSMenu.instance.STEXT_BOTTOM_WX,
        PSMenu.instance.STEXT_BOTTOM_WY,
        rows[j],
        r2,
        (j < 2) && isFirst,
        (j + 2 > rows.size())
      );

      PSMenu.instance.push(textBox);

      if (j + 2 < rows.length) {
        await PSMenu.instance.waitB1();
        if (textBox.endTextDelay()) {
          await PSMenu.instance.waitB1();
        }
      } else {
        // Issue prompt
        await PSMenu.instance.waitReady(textBox);

        const promptBox = PSMenu.instance.createPromptBox(
          PSMenu.instance.MAX_SCREEN_X * 3 / 4 - MenuStack.getMaxTextLength(choices),
          PSMenu.instance.STEXT_BOTTOM_Y - 15 - choices.length * (MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE),
          choices,
          true
        );
        PSMenu.instance.push(promptBox);

        const ret = await PSMenu.instance.waitOpt('TRUE' as any);

        PSMenu.instance.pop();
        PSMenu.instance.pop();
        return ret + 1; // Start counting options from 1
      }

      j++;
      PSMenu.instance.pop();
    }

    return 0;
  }

  /**
   * Show simple text - direct port of Java Stext()
   */
  public static async Stext(text: string): Promise<void> {
    await PSMenu.StextInternal(text, true, false, false);
  }

  /**
   * Show text with timeout - direct port of Java StextTimeout()
   */
  public static async StextTimeout(text: string): Promise<void> {
    await PSMenu.StextInternal(text, true, false, true);
  }

  /**
   * Show first text in sequence - direct port of Java StextFirst()
   */
  public static async StextFirst(text: string): Promise<void> {
    await PSMenu.StextInternal(text, true, true, false);
  }

  /**
   * Show next text in sequence - direct port of Java StextNext()
   */
  public static async StextNext(text: string): Promise<void> {
    await PSMenu.StextInternal(text, false, true, false);
  }

  /**
   * Show last text in sequence - direct port of Java StextLast()
   */
  public static async StextLast(text: string): Promise<void> {
    await PSMenu.StextInternal(text, false, false, false);
  }

  /**
   * Internal text display implementation - direct port of Java Stext()
   */
  private static async StextInternal(text: string, isFirst: boolean, hasNext: boolean, timeout: boolean): Promise<void> {
    let first = isFirst;
    const rows = PSMenu.splitTextIntoRows(text, 37);

    // Show multiple textboxes with at most two rows for text
    for (let j = 0; j < rows.length; j++) {
      const r2 = (j + 1 < rows.length) ? rows[j + 1] : '';
      const next = (j + 2 < rows.length) || hasNext;

      const textBox = PSMenu.instance.createTextBox(
        PSMenu.instance.STEXT_BOTTOM_X,
        PSMenu.instance.STEXT_BOTTOM_Y,
        PSMenu.instance.STEXT_BOTTOM_WX,
        PSMenu.instance.STEXT_BOTTOM_WY,
        rows[j],
        r2,
        first,
        next
      );

      PSMenu.instance.push(textBox);
      first = false;

      if (timeout) {
        await PSMenu.instance.waitB1OrTimeout(textBox);
      } else {
        await PSMenu.instance.waitB1();
      }

      if (textBox.endTextDelay()) {
        if (timeout) {
          await PSMenu.instance.waitB1OrTimeout(textBox);
        } else {
          await PSMenu.instance.waitB1();
        }
      }

      PSMenu.instance.pop();
      j++;
    }
  }

  /**
   * Set map render mode off - direct port of Java setMapOff()
   */
  public static setMapOff(): void {
    // TODO: Implement map rendering control
    // if (current_map !== null) {
    //   current_map.setRenderstring('R');
    // }
  }

  /**
   * Split text into rows - utility method
   */
  private static splitTextIntoRows(text: string, maxLength: number): string[] {
    const rows: string[] = [];
    let currentRow = '';
    const words = text.split(' ');

    for (const word of words) {
      if ((currentRow + word).length <= maxLength) {
        currentRow += (currentRow ? ' ' : '') + word;
      } else {
        if (currentRow) {
          rows.push(currentRow);
          currentRow = word;
        } else {
          rows.push(word); // Word is longer than maxLength
        }
      }
    }

    if (currentRow) {
      rows.push(currentRow);
    }

    return rows;
  }
}