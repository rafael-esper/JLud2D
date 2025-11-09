/**
 * TitleScene - Phantasy Star Title Screen
 * Updated to use the ported menu system with circles and red cursor
 */

import { PSScene, PSScene_Type, PSSpecialEntity } from './PSScene';
import { PSGame, ScreenSize, GameType } from './PSGame';
import { PS1Music } from './PSLibMusic';
import { PS1Image } from './PSLibImage';
import { MenuPromptBox } from './menu/MenuPromptBox';
import { PSCancellable } from './menu/MenuStack';

export class TitleScene extends PSScene {
  constructor() {
    super('PSTitleScene');
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

    console.log('TitleScene: Preloading PS title resources');
  }

  async create() {
    console.log('TitleScene: Starting Phantasy Star title screen');

    // Initialize game screen (equivalent to Java PSGame.initGameScreen)
    PSGame.initGameScreen(ScreenSize.SCREEN_320_240);
    PSGame.gameData.enableCheats = false;

    // Start title music (equivalent to Java PSGame.playMusic(PS1Music.TITLE))
    await PSGame.playMusic(PS1Music.TITLE);

    // Start the title scene (equivalent to Java PSMenu.startScene)
    this.startScene(PSScene_Type.TITLE, PSSpecialEntity.NONE);

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
        // Load Game
        PSGame.initPSGame(GameType.PS_ORIGINAL);
        if (PSGame.loadGame()) {
          // syncAfterLoading() - placeholder
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
        PSGame.languageMenu(60, 120);
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

    if (opt === 0) {
      // Start as Alis
      PSGame.initPSGame(GameType.PS_ORIGINAL);
      console.log("TitleScene: Starting game as Alis");
      // TODO: map("space/Space.map");
    } else if (opt === 1) {
      // Start as Odin
      PSGame.initPSGame(GameType.PS_START_AS_ODIN);
      console.log("TitleScene: Starting game as Odin");
      // TODO: map("space/Space.map");
    } else if (opt === 2) {
      // Start as Noah
      PSGame.initPSGame(GameType.PS_START_AS_NOAH);
      console.log("TitleScene: Starting game as Noah");
      // TODO: map("space/Space.map");
    } else if (opt === 4) {
      // Extended
      PSGame.initPSGame(GameType.PS_ORIGINAL);
      console.log("TitleScene: Starting extended game");
      // TODO: PSGame.mapswitch(Planet.DEZORIS, 133, 104);
    } else if (opt === 5) {
      // PS Arena
      PSGame.initPSGame(GameType.PS_ARENA);
      console.log("TitleScene: Starting PS Arena");
      // TODO: PhantasyArena.PhantasyArenaGame();
      // For now, return to title
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
    this.startScene(PSScene_Type.TITLE, PSSpecialEntity.NONE);
  }

  /**
   * Show about credits with image slideshow
   */
  private async showAboutCredits(): Promise<void> {
    this.startScene(PSScene_Type.BLACK, PSSpecialEntity.NONE);

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
      await this.screenFade(25, false);
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
    super.destroy();
  }
}