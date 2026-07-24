/**
 * TitleScene - Phantasy Star Title Screen
 * Updated to use the ported menu system with circles and red cursor
 */

import { PSScene } from './PSScene';
import { PSSceneType, SpecialEntity } from './PSMenu';
import { PSGame } from './PSGame';
import { ScreenSize, GameType } from './game/GameData';
import { PS1Music } from './game/PSLibMusic';
import { PS1Image } from './game/PSLibImage';
import { PSAssets } from './PSAssets';
import { PSCancellable } from './menu/MenuStack';
import { ScriptEngine } from '../../core/ScriptEngine';
import { GameConfig } from '../../config/GameConfig';

export class TitleScene extends PSScene {
  private autoResume: boolean = false;

  constructor() {
    super('PSTitleScene');
  }

  async init(data: { config: GameConfig; autoResume?: boolean }) {
    await super.init(data);
    this.autoResume = data.autoResume || false;
  }

  preload() {
    // Load title screen background
    this.load.image('ps-title', PS1Image.TITLE);

    // Load credit images
    this.load.image('ps-credit1', PS1Image.CINE_CREDIT1);
    this.load.image('ps-credit2', PS1Image.CINE_CREDIT2);
    this.load.image('ps-credit3', PS1Image.CINE_CREDIT3);
    this.load.image('ps-credit4', PS1Image.CINE_CREDIT4);
    this.load.image('ps-credit5', PS1Image.CINE_CREDIT5);

    // Warm the whole PS asset set up-front (sounds, city maps, tilesets) while
    // the demo-select loading overlay is still up, so nothing stalls mid-game
    // when served from a remote host. Idempotent with GameScene's own call.
    PSAssets.queuePhaserAssets(this);

    console.log('TitleScene: Preloading PS title resources');
  }

  async create() {
    try {
      console.log('TitleScene: Starting Phantasy Star title screen');

      // Initialize game screen (equivalent to Java PSGame.initGameScreen)
      PSGame.initGameScreen(ScreenSize.SCREEN_320_240);
      PSGame.gameData.enableCheats = false;

      // Initialize internationalization system BEFORE any getString calls
      await PSGame.initializeI18n();

      // Auto-resume: a prior session was snapshotted before a mobile process
      // kill / reload. Adopt it and re-enter by mode:
      //  - 'field': hand straight to the GameScene (enterLoaded), same path as a
      //    title-screen Load minus the slot picker — a fully seamless return.
      //  - 'arena': re-run the PS Arena gauntlet from the saved battle, then fall
      //    through to the normal title screen when it ends.
      if (this.autoResume) {
        await PSGame.initPSGame(GameType.PS_ORIGINAL);
        const mode = await PSGame.loadAutoResume();

        if (mode === 'field') {
          PSGame.stopMusic();
          this.scene.start('PSGameScene', { config: this.config, enterLoaded: true });
          return;
        }

        if (mode === 'arena') {
          // Render the title as a backdrop, drop the loading overlay (the arena
          // is interactive), then resume the gauntlet. When it returns, execution
          // falls through to the normal title setup + menu loop below.
          this.startScene(PSSceneType.TITLE, SpecialEntity.NONE);
          (window as any).hideLoading?.();
          const { PhantasyArena } = await import('./PhantasyArena');
          await PhantasyArena.PhantasyArenaGame(PSGame.consumeArenaResume() ?? undefined);
        } else if (mode === null) {
          // Snapshot missing/corrupt — fall through to the normal title menu.
          console.warn('TitleScene: auto-resume snapshot could not be loaded');
        }
      }

      // Warm the VGM cache (all tracks, ~80 KB total) so the first play of every
      // track later is instant. Awaited (blocking) while the loading overlay is
      // still up, so no track ever stalls on first play even on a remote host.
      await PSAssets.warmMusic();

      // Start title music (fetched on first play, streamed instantly after)
      await PSGame.playMusic(PS1Music.TITLE);

      // Start the title scene (equivalent to Java PSMenu.startScene)
      this.startScene(PSSceneType.TITLE, SpecialEntity.NONE);
    } finally {
      // Hide once the title screen is actually visible/interactive — not
      // after startMainMenuLoop(), which only resolves once the player picks
      // an option and would leave the overlay up for the whole title screen.
      (window as any).hideLoading?.();
    }

    // Start the main menu loop (equivalent to Java startmap() while loop)
    await this.startMainMenuLoop();
  }

  /**
   * Main menu loop - equivalent to Title.java startmap() method
   * Now uses the ported menu system with circles and red cursor
   */
  private async startMainMenuLoop(): Promise<void> {
    while (true) {
      // Create main menu using the new ported system
      const mainMenu = this.menuStack.createPromptBox(90, 140, [
        PSGame.getString("Title_Newgame"),
        PSGame.getString("Title_Loadgame"),
        PSGame.getString("Title_Credits"),
        PSGame.getString("Title_Options_Language")
      ], true);

      this.menuStack.push(mainMenu);
      const mainOpt = await this.menuStack.waitOpt(PSCancellable.TRUE) + 1; // Java uses 1-based indexing
      this.menuStack.pop();

      if (mainOpt === 0) {
        continue; // Cancelled
      }

      if (mainOpt === 1) {
        // New Game
        if (await this.newGameMenu()) {
          break;
        }
      }

      if (mainOpt === 2) {
        // Load Game. Pick the slot and adopt the save on the title screen
        // (enterMap=false), then hand off to the GameScene, which loads the
        // saved location once its engine/scene context exists. Calling the map
        // switch here would fail — there is no running GameScene to render into.
        await PSGame.initPSGame(GameType.PS_ORIGINAL);
        if (await PSGame.loadGame(false)) {
          PSGame.stopMusic();
          this.scene.start('PSGameScene', { config: this.config, enterLoaded: true });
          break;
        }
        // syncAfterLoading() - placeholder
      }

      if (mainOpt === 3) {
        // Credits
        await this.creditsMenu();
      }

      if (mainOpt === 4) {
        // Language
        const languageChanged = await PSGame.languageMenu(this.menuStack);

        // If language was changed, refresh the title scene to show updated text
        if (languageChanged) {
          console.log("TitleScene: Language changed, refreshing scene");
          this.startScene(PSSceneType.TITLE, SpecialEntity.NONE);
        }
        // Continue the loop to show updated menu text
      }
    }

    this.endScene();
  }

  /**
   * New Game menu - equivalent to Title.java newGameMenu() method
   * Now uses the ported menu system with circles and red cursor
   */
  private async newGameMenu(): Promise<boolean> {
    const gameMenu = this.menuStack.createPromptBox(70, 130, [
      PSGame.getString("Title_Newgame_Alis"),
      PSGame.getString("Title_Newgame_Odin"),
      PSGame.getString("Title_Newgame_Noah"),
      PSGame.getString("Title_Newgame_Party"),
      PSGame.getString("Title_Newgame_Extended"),
      PSGame.getString("Title_Newgame_PSArena")
    ], true);

    this.menuStack.push(gameMenu);

    // Disable options (equivalent to Java setDisabled)
    gameMenu.setDisabled(2); // Noah
    gameMenu.setDisabled(3); // Party
    gameMenu.setDisabled(4); // Extended

    const opt = await this.menuStack.waitOpt(PSCancellable.TRUE);
    this.menuStack.pop();

    if (opt < 0) {
      return false; // Cancelled
    }

    // Stop music before starting game
    PSGame.stopMusic();

    if (opt === 0 || opt === 1 || opt === 2) {
      // Java: initPSGame(type); map("space/Space.map") — the Space map script
      // sees no departure city and runs the opening cinematic, which ends by
      // switching to the real starting map (Camineet / Scion / Motavia).
      const gameType = opt === 0 ? GameType.PS_ORIGINAL
        : opt === 1 ? GameType.PS_START_AS_ODIN
        : GameType.PS_START_AS_NOAH;
      await PSGame.initPSGame(gameType);
      console.log(`TitleScene: Starting new game (${GameType[gameType]}) — intro`);

      // A previous playthrough may have left a Hapsby flight recorded; the
      // intro branch in Space.startmap keys off fromCity being null
      PSGame.setFromCity(null);
      PSGame.setToCity(null);

      // Starting fresh: drop any prior auto-resume snapshot so a reload during
      // the intro doesn't resume the old game. It's re-established once the new
      // party reaches a safe field state (GameScene checkpoint).
      PSGame.clearAutoResume();

      // Start GameScene routed into the Space map intro
      this.scene.start('PSGameScene', { config: this.config, enterIntro: true });

      return true;
    } else if (opt === 4) {
      // Extended
      await PSGame.initPSGame(GameType.PS_ORIGINAL);
      console.log("TitleScene: Starting extended game");
      // TODO: PSGame.mapswitch(Planet.DEZORIS, 133, 104);
    } else if (opt === 5) {
      // PS Arena
      await PSGame.initPSGame(GameType.PS_ARENA);
      // Drop any prior overworld snapshot before the gauntlet starts writing its
      // own per-battle arena checkpoints (so a mid-Arena kill resumes the Arena,
      // not a stale field game).
      PSGame.clearAutoResume();
      console.log("TitleScene: Starting PS Arena");
      const { PhantasyArena } = await import('./PhantasyArena');
      await PhantasyArena.PhantasyArenaGame();
      // Arena over (won or defeated): restore the title screen, like the
      // Java title loop does when PhantasyArenaGame returns
      this.startScene(PSSceneType.TITLE, SpecialEntity.NONE);
      await PSGame.playMusic(PS1Music.TITLE);
      return false;
    }

    return true;
  }

  /**
   * Credits menu - equivalent to Title.java creditsMenu() method
   * Now uses the ported menu system with circles and red cursor
   */
  private async creditsMenu(): Promise<void> {
    const creditsMenu = this.menuStack.createPromptBox(90, 140, [
      PSGame.getString("Title_Credits_About"),
      PSGame.getString("Title_Credits_Game"),
      PSGame.getString("Title_Credits_Contact")
    ], true);

    this.menuStack.push(creditsMenu);
    const creditsOpt = await this.menuStack.waitOpt(PSCancellable.TRUE) + 1;
    this.menuStack.pop();

    if (creditsOpt === 0) {
      return; // Cancelled
    }

    if (creditsOpt === 1) {
      // About credits with image slideshow
      await this.showAboutCredits();
    }

    if (creditsOpt === 2) {
      // Game credits
      await this.showGameCredits();
    }

    if (creditsOpt === 3) {
      // Contact info
      await this.showContactInfo();
    }

    // Return to title scene
    this.startScene(PSSceneType.TITLE, SpecialEntity.NONE);
  }

  /**
   * Show about credits with image slideshow
   */
  private async showAboutCredits(): Promise<void> {
    this.startScene(PSSceneType.BLACK, SpecialEntity.NONE);

    // Show credit images in sequence (equivalent to Java credit slideshow)
    const creditImages = [
      { key: 'ps-credit1', text: "Original Phantasy Star by Sega" },
      { key: 'ps-credit2', text: "Recreated with love for classic RPGs" },
      { key: 'ps-credit3', text: "Featuring the original soundtrack" },
      { key: 'ps-credit4', text: "And classic 8-bit graphics" },
      { key: 'ps-credit5', text: "Thank you for playing!" }
    ];

    for (const credit of creditImages) {
      // Show image
      const creditImage = this.add.image(40, 0, credit.key);
      creditImage.setOrigin(0, 0);
      creditImage.setDepth(0);

      // Show text and wait for input
      await this.showScrollingText(credit.text);

      // Fade out
      await ScriptEngine.fadeout(25, false);
      creditImage.destroy();
    }
  }

  /**
   * Show game credits text using the ported menu system
   */
  private async showGameCredits(): Promise<void> {
    // Use the ported text box system
    const textBox = this.menuStack.createTextBox(
      20, 50, 280, 140,
      "Game Credits - Original Game: Sega (1987)",
      "This Demo Port: JLud2D Team - TypeScript/Phaser",
      true, true
    );

    this.menuStack.push(textBox);
    await this.menuStack.waitAnyButton();
    this.menuStack.pop();
  }

  /**
   * Show contact information using the ported menu system
   */
  private async showContactInfo(): Promise<void> {
    // Use the ported text box system
    const textBox = this.menuStack.createTextBox(
      20, 50, 280, 140,
      "Contact Information - JLud2D Project",
      "Phaser 4 Port - Check project documentation",
      true, true
    );

    this.menuStack.push(textBox);
    await this.menuStack.waitAnyButton();
    this.menuStack.pop();
  }

  destroy() {
    // Stop music when scene is destroyed
    PSGame.stopMusic();
  }
}