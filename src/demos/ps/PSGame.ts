/**
 * PSGame - Phantasy Star Game Management
 * Port of PSGame.java - Core game state and resource management
 */

import { MainEngine } from '../../core/MainEngine';
import { PS1Music } from './PSLibMusic';
import { PS1Image } from './PSLibImage';

export enum ScreenSize {
  SCREEN_320_240,
  SCREEN_640_480
}

export enum GameType {
  PS_ORIGINAL,
  PS_START_AS_ODIN,
  PS_START_AS_NOAH,
  PS_ARENA
}

export class PSGameData {
  public enableCheats: boolean = false;
  private screenSize: ScreenSize = ScreenSize.SCREEN_320_240;

  public getScreenSize(): ScreenSize {
    return this.screenSize;
  }

  public setScreenSize(size: ScreenSize): void {
    this.screenSize = size;
  }
}

export class PSGame {
  public static gameData: PSGameData = new PSGameData();
  private static currentScene: Phaser.Scene | null = null;

  // Localization strings (simplified for demo - in original this loads from resource bundles)
  private static strings: { [key: string]: string } = {
    "Title_Newgame": "New Game",
    "Title_Loadgame": "Load Game",
    "Title_Credits": "Credits",
    "Title_Options_Language": "Language",
    "Title_Newgame_Alis": "Start as Alis",
    "Title_Newgame_Odin": "Start as Odin",
    "Title_Newgame_Noah": "Start as Noah",
    "Title_Newgame_Party": "Start as Party",
    "Title_Newgame_Extended": "Extended Game",
    "Title_Newgame_PSArena": "PS Arena",
    "Title_Credits_About": "About",
    "Title_Credits_Game": "Game Credits",
    "Title_Credits_Contact": "Contact"
  };

  /**
   * Initialize game screen with specified size
   */
  public static initGameScreen(screenSize: ScreenSize): void {
    this.gameData.setScreenSize(screenSize);
    console.log(`PSGame: Initialized with screen size ${screenSize === ScreenSize.SCREEN_320_240 ? '320x240' : '640x480'}`);
  }

  /**
   * Play VGM music
   */
  public static async playMusic(music: PS1Music): Promise<void> {
    const musicPath = music as string;
    console.log(`PSGame: Playing music ${musicPath}`);
    await MainEngine.loadVGM('ps_current', musicPath);
    MainEngine.playmusic('ps_current');
  }

  /**
   * Stop currently playing music
   */
  public static stopMusic(): void {
    MainEngine.stopmusic();
  }

  /**
   * Get localized string
   */
  public static getString(key: string): string {
    return this.strings[key] || key;
  }

  /**
   * Get image resource path
   */
  public static getImage(imageKey: PS1Image | string): string {
    if (typeof imageKey === 'string') {
      return imageKey;
    }
    return imageKey as string;
  }

  /**
   * Set current scene reference
   */
  public static setCurrentScene(scene: Phaser.Scene): void {
    this.currentScene = scene;
  }

  /**
   * Get current scene reference
   */
  public static getCurrentScene(): Phaser.Scene | null {
    return this.currentScene;
  }

  /**
   * Initialize PS game with specified type
   */
  public static initPSGame(gameType: GameType): void {
    console.log(`PSGame: Initializing game type ${GameType[gameType]}`);
    // In full implementation, this would set up character stats, party, etc.
    // For title scene demo, we just log the selection
  }

  /**
   * Load game (placeholder)
   */
  public static loadGame(): boolean {
    console.log("PSGame: Load game not implemented in demo");
    return false;
  }

  /**
   * Language menu (placeholder)
   */
  public static languageMenu(x: number, y: number): void {
    console.log(`PSGame: Language menu at (${x}, ${y}) not implemented in demo`);
  }
}