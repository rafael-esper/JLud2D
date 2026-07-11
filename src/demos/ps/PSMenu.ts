/**
 * PSMenu - Phantasy Star Scene and Menu Utility System
 * Direct port of PSMenu.java - Handles scene transitions, entity display, and menu utilities
 */

import { MenuStack, PSOutcome } from './menu/MenuStack';
import { MenuImageBox, VImage } from './menu/MenuImageBox';
import { MenuScrollerText } from './menu/MenuScrollerText';
import { MenuTextBox } from './menu/MenuTextBox';
import { MenuCHR } from './menu/MenuCHR';
import { ScriptEngine } from '../../core/ScriptEngine';
import { PSGame } from './PSGame';
import { CHR } from '../../domain/CHR';
import { ScreenSize } from './game/GameData';
import { PS1CHR } from './game/PSLibCHR';
import { MainEngine } from '@/core/MainEngine';

export enum PSSceneType {
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

// Type alias for Java compatibility
export type Scene = PSSceneType;

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

    // More icon (Next_Icon.png) is loaded lazily by MenuTextBox

    // Calculate text positioning
    PSMenu.instance.STEXT_BOTTOM_X = PSMenu.instance.MAX_SCREEN_X / 14;
    PSMenu.instance.STEXT_BOTTOM_Y = Math.floor(PSMenu.instance.MAX_SCREEN_Y / 1.4);
    PSMenu.instance.STEXT_BOTTOM_WX = PSMenu.instance.MAX_SCREEN_X - PSMenu.instance.STEXT_BOTTOM_X * 2;
    PSMenu.instance.STEXT_BOTTOM_WY = 16 * 2 + 10;
  }

  // Whether the main-menu button hook is active (Java: hookbutton(4, "PSMenuMain.menu"))
  private static menuHooked: boolean = false;

  /**
   * Enable menu input hooks - direct port of Java menuOn()
   * The scene update loop checks isMenuHooked() and opens PSMenuMain.menu() on b4.
   */
  public static menuOn(): void {
    PSMenu.menuHooked = true;
  }

  /**
   * Disable menu input hooks - direct port of Java menuOff()
   */
  public static menuOff(): void {
    PSMenu.menuHooked = false;
  }

  /**
   * Whether the main menu can currently be opened by the menu button
   */
  public static isMenuHooked(): boolean {
    return PSMenu.menuHooked;
  }

  // Scene management methods

  /**
   * Start scene with special entity - overload for Java compatibility
   */
  public static startScene(scene: Scene, specialEntity: SpecialEntity): Promise<void>;
  /**
   * Start scene with character - direct port of Java startScene(Scene, String)
   */
  public static startScene(scene: Scene, strChar?: string): Promise<void>;
  /**
   * Start scene with entity type and clothes - direct port of Java startScene(Scene, EntityType, Enum)
   */
  public static startScene(scene: Scene, entityType: EntityType, entityClothes: EntityClothes): Promise<void>;
  public static async startScene(scene: Scene, param1?: string | SpecialEntity | EntityType, param2?: EntityClothes): Promise<void> {
    if (typeof param1 === 'number' && param2 === undefined) {
      // Handle SpecialEntity case - startScene(scene, specialEntity)
      await PSMenu.startSceneWithSpecialEntity(scene, param1 as SpecialEntity);
    } else if (typeof param1 === 'number' && param2 !== undefined) {
      // Handle EntityType + EntityClothes case - startScene(scene, entityType, entityClothes)
      const entityType = param1 as EntityType;
      const entityClothes = param2 as EntityClothes;

      try {
        await PSMenu.createEntitySprite(entityType, entityClothes, scene);
        await PSMenu.startSceneInternal(scene);
      } catch (error) {
        console.error('PSMenu: Error creating entity sprite:', error);
        await PSMenu.startSceneInternal(scene);
      }
    } else if (typeof param1 === 'string') {
      // Handle string character case - startScene(scene, strChar)
      if (PSGame.gameData.getScreenSize() === ScreenSize.SCREEN_640_480) {
        PSMenu.instance.npc = await CHR.loadChr(PSGame.getCurrentScene()!, param1, 'ps');
        PSMenu.instance.showPlayers = true;
      } else {
        PSMenu.instance.npc = null;
        PSMenu.instance.showPlayers = false;
      }
      await PSMenu.startSceneInternal(scene);
    } else {
      // Handle no second parameter case - startScene(scene)
      await PSMenu.startSceneInternal(scene);
    }
  }

  /**
   * Create entity sprite from type and clothes - direct port of Java implementation
   */
  private static async createEntitySprite(entityType: EntityType, entityClothes: EntityClothes, scene: Scene): Promise<void> {
    PSMenu.instance.entitySprite = null;

    const isHalf = scene === PSSceneType.SHOP_FOOD ||
                   scene === PSSceneType.SHOP_HAND ||
                   scene === PSSceneType.SHOP_WEAPON ||
                   scene === PSSceneType.SHOP_CENTRAL ||
                   scene === PSSceneType.SHOP_FOOD_VILLAGE ||
                   scene === PSSceneType.SHOP_HAND_VILLAGE ||
                   scene === PSSceneType.SHOP_WEAPON_VILLAGE ||
                   scene === PSSceneType.HOSPITAL ||
                   scene === PSSceneType.HOSPITAL_VILLAGE ||
                   scene === PSSceneType.CHURCH ||
                   scene === PSSceneType.CHURCH_VILLAGE;

    // Load entity CHR data
    const entitiesCHR = await PSGame.getCHR(PS1CHR.IMG_ENTITIES);

    // Calculate frame index: (entityType * 4 + entityClothes)
    const frameIndex = entityType * 4 + entityClothes;

    console.log(`PSMenu: Creating entity sprite - EntityType: ${entityType} (${EntityType[entityType]}), EntityClothes: ${entityClothes} (${EntityClothes[entityClothes]}), Frame Index: ${frameIndex}`);
    console.log(`PSMenu: Entity CHR loaded with ${entitiesCHR.getFrameCount()} frames, totalframes: ${entitiesCHR.getTotalframes()}`);

    if (!PSGame.getCurrentScene()) {
      console.error('PSMenu: No current scene to create entity sprite');
      return;
    }

    // Create texture key for this specific entity frame (include isHalf to prevent caching conflicts)
    const textureKey = `entity_${entityType}_${entityClothes}_${isHalf ? 'half' : 'full'}`;

    // Get the frame image from CHR
    const frame = entitiesCHR.getFrameByIndex(frameIndex);
    if (!frame) {
      console.error(`PSMenu: Entity frame ${frameIndex} not found in entities CHR (total frames: ${entitiesCHR.getFrameCount()})`);
      return;
    }

    const currentScene = PSGame.getCurrentScene()!;

    // Create texture from frame if not already exists
    if (!currentScene.textures.exists(textureKey)) {
      // Create a canvas to extract the sprite from the entities sheet
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const spriteWidth = 35;
      const spriteHeight = isHalf ? 51 : 90;

      canvas.width = spriteWidth;
      canvas.height = spriteHeight;

      // Draw the specific frame to the canvas (extract from Phaser frame)
      if (isHalf) {
        // For half sprites: crop to show only top 51 pixels (characters behind counter)
        // Take only the top portion of the source image
        const cropHeight = 51;
        ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, cropHeight, 0, 0, spriteWidth, spriteHeight);
      } else {
        // For full sprites: draw the entire frame
        ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, spriteWidth, spriteHeight);
      }

      // Add as texture to Phaser
      currentScene.textures.addCanvas(textureKey, canvas);
    }

    // Create Phaser sprite but make it invisible initially
    PSMenu.instance.entitySprite = currentScene.add.image(0, 0, textureKey);
    PSMenu.instance.entitySprite.setOrigin(0.5, 1); // Bottom center origin
    PSMenu.instance.entitySprite.setDepth(1995); // Above background and dungeon view (1990), below menu graphics (2000+)
    PSMenu.instance.entitySprite.setScrollFactor(0, 0); // Fixed to screen
    PSMenu.instance.entitySprite.setVisible(false); // Hide until after fade in

    // Calculate position but don't set it yet (will be set after fade in)
    PSMenu.instance.entityY = 190; // 240 - 30 - 20 (moved up 20px)

    // Half sprites (shops/churches/hospitals) need to be positioned higher (behind counter)
    if (isHalf) {
      PSMenu.instance.entityY -= 45; // Move half sprites 45 pixels up
    }

    // Special positioning for MOTA characters (only for full sprites)
    if (!isHalf && (entityType === EntityType.MOTA_CAP || entityType === EntityType.MOTA_MASK ||
                   entityType === EntityType.MOTA_NOCAP || entityType === EntityType.MOTA_CUSTOM)) {
      PSMenu.instance.entityY -= 20; // Move MOTA characters up a bit
    }
  }

  /**
   * Start scene with special entity - direct port of Java startScene(Scene, SpecialEntity)
   */
  public static async startSceneWithSpecialEntity(scene: Scene, specialEntity: SpecialEntity): Promise<void> {
    if (specialEntity === SpecialEntity.NONE) {
      PSMenu.instance.entitySprite = null;
      await PSMenu.startSceneInternal(scene);
      return;
    }

    await PSMenu.startScene(scene, EntityType.SPECIAL, specialEntity - 1 as EntityClothes);
  }

  /**
   * Start scene with large entity - direct port of Java startScene(Scene, LargeEntity)
   */
  public static async startSceneWithLargeEntity(scene: Scene, largeEntity: LargeEntity): Promise<void> {
    if (!PSGame.getCurrentScene()) {
      await PSMenu.startSceneInternal(scene);
      return;
    }

    const currentScene = PSGame.getCurrentScene()!;

    // Load large entities CHR
    const largeEntitiesCHR = await PSGame.getCHR(PS1CHR.IMG_ENTITIES_LARGE);

    const textureKey = `large_entity_${largeEntity}`;

    // Create texture if not exists
    if (!currentScene.textures.exists(textureKey)) {
      const frame = largeEntitiesCHR.getFrameByIndex(largeEntity);
      if (frame) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 56;
          canvas.height = 112;
          ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, 56, 112);
          currentScene.textures.addCanvas(textureKey, canvas);
        }
      }
    }

    // Create large entity sprite
    PSMenu.instance.entitySprite = currentScene.add.image(0, 0, textureKey);
    PSMenu.instance.entitySprite.setOrigin(0.5, 1); // Bottom center origin
    PSMenu.instance.entitySprite.setDepth(1995); // Above background and dungeon view (1990), below menu graphics (2000+)
    PSMenu.instance.entitySprite.setScrollFactor(0, 0); // Fixed to screen
    PSMenu.instance.entityY = 190; // 240 - 30 - 20 (moved up 20px)

    await PSMenu.startSceneInternal(scene);
  }

  /**
   * Start scene with CHR - direct port of Java startScene(Scene, CHR)
   */
  public static async startSceneWithCHR(scene: Scene, chr: CHR): Promise<void> {
    if (!PSGame.getCurrentScene()) {
      await PSMenu.startSceneInternal(scene);
      return;
    }

    const currentScene = PSGame.getCurrentScene()!;
    const textureKey = `chr_${chr.getImageName()}`;

    // Create texture if not exists
    if (!currentScene.textures.exists(textureKey) && chr.getFrameCount() > 0) {
      const frame = chr.getFrameByIndex(0);
      if (frame) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = chr.getFxsize();
          canvas.height = chr.getFysize();
          ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, chr.getFxsize(), chr.getFysize());
          currentScene.textures.addCanvas(textureKey, canvas);
        }
      }
    }

    // Create CHR sprite
    PSMenu.instance.entitySprite = currentScene.add.image(0, 0, textureKey);
    PSMenu.instance.entitySprite.setOrigin(0.5, 1); // Bottom center origin
    PSMenu.instance.entitySprite.setDepth(1995); // Above background and dungeon view (1990), below menu graphics (2000+)
    PSMenu.instance.entitySprite.setScrollFactor(0, 0); // Fixed to screen
    PSMenu.instance.entityY = 190; // 240 - 30 - 20 (moved up 20px)

    await PSMenu.startSceneInternal(scene);
  }


  /**
   * Internal scene start logic - direct port of Java startScene(Scene)
   */
  private static async startSceneInternal(scene: Scene): Promise<void> {
    // Clear button press state, pause entities and disable menu
    ScriptEngine.clearInputs();
    ScriptEngine.setEntitiesPaused(true);
    PSMenu.menuOff();

    // First fade out to prepare for scene rendering
    let needsFadeIn = false;
    if (scene === PSSceneType.DUNGEON || scene === PSSceneType.SCREEN || scene === PSSceneType.BLACK || scene === PSSceneType.ALTAR) {
      needsFadeIn = true;
    } else if (scene === PSSceneType.CORRIDOR || scene === PSSceneType.SCREEN_NOFADE) {
      // Do nothing
    } else {
      await ScriptEngine.fadeout(25, true);
      PSMenu.instance.setBackground('');
      PSMenu.instance.backAnim?.destroy?.();
      PSMenu.instance.backAnim = null;
      needsFadeIn = true;
    }

    PSMenu.instance.setdelay(20);

    // Set scene-specific background and outcome
    switch (scene) {
      case PSSceneType.BLUE_HOUSE:
      case PSSceneType.YELLOW_HOUSE:
      case PSSceneType.SHOP_FOOD:
      case PSSceneType.SHOP_HAND:
      case PSSceneType.SHOP_WEAPON:
      case PSSceneType.HOSPITAL:
      case PSSceneType.CHURCH:
      case PSSceneType.VILLAGE_HOUSE:
      case PSSceneType.SHOP_FOOD_VILLAGE:
      case PSSceneType.SHOP_HAND_VILLAGE:
      case PSSceneType.SHOP_WEAPON_VILLAGE:
      case PSSceneType.HOSPITAL_VILLAGE:
      case PSSceneType.CHURCH_VILLAGE:
      case PSSceneType.RUINED_HOUSE:
      case PSSceneType.SPACESHIP:
      case PSSceneType.PALACE:
      case PSSceneType.VILLA:
      case PSSceneType.CITY:
      case PSSceneType.TITLE:
      case PSSceneType.ENDING:
        const imagePath = PSGame.getImage(scene);
        PSMenu.instance.setBackground(imagePath);
        PSMenu.instance.outcome = PSOutcome.FADE_HOUSE;
        break;

      case PSSceneType.CAVE:
      case PSSceneType.FOREST:
      case PSSceneType.FIELDS:
      case PSSceneType.DESERT:
      case PSSceneType.ARTIC:
      case PSSceneType.PINES:
      case PSSceneType.SKY:
        PSMenu.instance.setBackground(PSGame.getImage(scene));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case PSSceneType.BAYA:
        PSMenu.instance.setdelay(0);
        PSMenu.instance.setBackground(PSGame.getImage(scene));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case PSSceneType.LAVA:
        PSMenu.instance.backAnim = new MenuCHR(PSGame.getCurrentScene()!, 0, 0, await PSGame.getCHR(PS1CHR.ANIM_LAVA));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case PSSceneType.BEACH:
        PSMenu.instance.backAnim = new MenuCHR(PSGame.getCurrentScene()!, 0, 0, await PSGame.getCHR(PS1CHR.ANIM_BEACH));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case PSSceneType.SEA:
        PSMenu.instance.backAnim = new MenuCHR(PSGame.getCurrentScene()!, 0, 0, await PSGame.getCHR(PS1CHR.ANIM_SEA));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case PSSceneType.GAS:
        PSMenu.instance.backAnim = new MenuCHR(PSGame.getCurrentScene()!, 0, 0, await PSGame.getCHR(PS1CHR.ANIM_GAS));
        PSMenu.instance.outcome = PSOutcome.FADE;
        break;

      case PSSceneType.ALTAR:
        PSMenu.instance.setBackground(PSGame.getImage(scene));
        PSMenu.instance.outcome = PSOutcome.FADE_DUNGEON;
        break;

      case PSSceneType.DUNGEON:
        PSMenu.instance.outcome = PSOutcome.FADE_DUNGEON;
        break;

      case PSSceneType.CORRIDOR:
        PSMenu.instance.outcome = PSOutcome.NO_FADE;
        break;

      case PSSceneType.SCREEN:
      case PSSceneType.SCREEN_NOFADE:
        PSMenu.instance.outcome = PSOutcome.FADE_HOUSE;
        PSMenu.instance.setdelay(0);
        break;

      default:
        // TODO: Create default background
        // PSMenu.instance.back = new VImage(screen.width, screen.height);
        PSMenu.instance.outcome = PSOutcome.FADE_HOUSE;
        break;
    }

    // Fade in after all scene content is set up and rendered
    if (needsFadeIn) {
      await ScriptEngine.fadein(25, false);
    }

    // Show and position entity sprite after fade in is complete
    if (PSMenu.instance.entitySprite) {
      PSMenu.instance.entityX = 320 / 2; // Center horizontally
      PSMenu.instance.entitySprite.setPosition(PSMenu.instance.entityX, PSMenu.instance.entityY);
      PSMenu.instance.entitySprite.setVisible(true);
    }
  }

  /**
   * End scene - direct port of Java endScene()
   */
  public static async endScene(): Promise<void> {
    await PSMenu.endSceneWithOutcome(PSMenu.instance.outcome);
  }

  /**
   * End scene with specific outcome - direct port of Java endScene(Outcome)
   */
  public static async endSceneWithOutcome(outcome: PSOutcome): Promise<void> {
    // Clean up scene elements
    PSMenu.instance.npc = null;
    PSMenu.instance.clearEntity(); // Properly destroy entity sprite
    PSMenu.instance.backAnim?.destroy?.();
    PSMenu.instance.backAnim = null;

    // Clear all menus and graphics
    while (PSMenu.instance.hasMenu()) {
      PSMenu.instance.pop();
    }
    PSMenu.instance.clearGraphics();

    if (outcome === PSOutcome.FADE_HOUSE || outcome === PSOutcome.FADE) {
      if (outcome === PSOutcome.FADE_HOUSE) {
        // TODO: Script.pauseplayerinput();
        await ScriptEngine.fadeout(25, false);
        // Clear scene background and prepare map only after fade out
        PSMenu.instance.setBackground('');
        PSGame.regroup(0, 1);
        await ScriptEngine.fadein(25, false);
      }

      if (outcome === PSOutcome.FADE) {
        // TODO: Script.pauseplayerinput();
        await ScriptEngine.fadeout(50, false);
        // Clear scene background and prepare map only after fade out
        PSMenu.instance.setBackground('');
        if (!PSGame.isOnTransport()) {
          PSGame.regroup(0, 0);
        }
        await ScriptEngine.fadein(50, false);
      }

      ScriptEngine.setEntitiesPaused(false);
      MainEngine.setScriptActive(false);
    } else if (outcome === PSOutcome.FADE_DUNGEON) {
      await ScriptEngine.fadeout(25, false);
      // fadeout re-enables controls on completion; keep them paused so the
      // overworld ProcessControls can't change the player's facing between here
      // and warpBack (which reads that facing to pick the step-back direction).
      MainEngine.setScriptActive(true);
      // Java: PSDungeon.warpBack(2) — step off the event tile so it doesn't
      // re-trigger, redraw the view while black, then reveal it (the Phaser
      // camera fade persists until an explicit fadein, unlike Java's screen).
      const dungeon = PSGame.getCurrentDungeonInstance();
      if (dungeon) {
        dungeon.warpBack(2);
      }
      await ScriptEngine.fadein(25, false);
    }

    PSMenu.menuOn();
  }

  /**
   * Display cinematic text with portrait - direct port of Java cinematicText()
   */
  public static async cinematicText(portrait: VImage, texts: string[]): Promise<void> {
    const portraitBox = MenuImageBox.MenuImage(PSMenu.instance.getScene(), PSMenu.instance, 32, 22, portrait);
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

        const menuScrollerText = new MenuScrollerText(PSMenu.instance.getScene(), 35, 22 + 113 + 15, strText);
        PSMenu.instance.push(menuScrollerText);

        await PSMenu.instance.waitReady(menuScrollerText);
        await PSMenu.instance.waitB1();

        // If last chunk of text, fade out
        if (t === texts.length - 1 && i + 1 > Math.floor((rows.length - 1) / 4)) {
          //await ScriptEngine.fadeout(25, false);
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
        (j + 2 > rows.length)
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

        let promptX, promptY;
        if (choices.length > 2) {
          // Item lists (more than 2 choices) go to top-left
          promptX = 10;
          promptY = 10; // Same Y as MST label
        } else {
          // Buy/Sell, Yes/No (2 choices) stay in original position
          const maxTextLength = MenuStack.getMaxTextLength(choices);
          const menuWidth = 25 + maxTextLength;
          const screenWidth = PSMenu.instance.MAX_SCREEN_X;
          promptX = Math.min(240, Math.max(10, screenWidth - menuWidth - 10));
          promptY = 140;
        }

        const promptBox = PSMenu.instance.createPromptBox(
          promptX,
          promptY,
          choices,
          true
        );
        PSMenu.instance.push(promptBox);

        const ret = await PSMenu.instance.waitOpt('TRUE' as any);

        PSMenu.instance.pop(); // Pop only the prompt box, leave the text box
        // Don't pop the text box - it should remain visible for scene context
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

  /**
   * Show MST (money) display - required for Church and shop systems
   * Creates a MenuLabelBox showing current party money
   */
  public static async showMST(): Promise<void> {
    // Get party money
    const party = PSGame.getParty();
    const money = party.getMesetas();

    // Create MST display box with correct signature
    const mstBox = PSMenu.instance.createLabelBox(
      220, 10, // Position (top-right corner)
      [`MST: ${money}`], // Text array
      false // No delay
    );

    PSMenu.instance.push(mstBox);

    // MST display stays on screen until explicitly removed
    // The Church routine or other systems will pop it when done
  }
}