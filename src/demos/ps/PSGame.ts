/**
 * PSGame - Phantasy Star Game Management
 * Port of PSGame.java - Core game state and resource management
 */

import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { Entity, EntityDirection } from '../../domain/Entity';
import { PS1Music } from './game/PSLibMusic';
import { PS1Image } from './game/PSLibImage';
import { PS1Sound } from './game/PSLibSound';
import { PSMenu } from './PSMenu';
import { Party } from './game/Party';
import { Planet, City, CityHelper } from './game/City';
import { ScreenSize, GameType, Flags, GameData } from './game/GameData';
import { Dungeon } from './game/Dungeon';
import { CHR } from '../../domain/CHR';
import { PS1CHR, PS1CHRHelper } from './game/PSLibCHR';
import { Item } from './game/Item';
import { OriginalItem, PSLibItem } from './game/PSLibItem';
import { I18nManager } from './game/I18nManager';
import { PS_MUSIC_MANIFEST } from './music-manifest';


export class PSGame {
  public static gameData: GameData = new GameData();
  private static currentScene: Phaser.Scene | null = null;
  private static party: Party | null = null;
  private static gotox: number = 0;
  private static gotoy: number = 0;
  private static currentCity: any = null; // Current city for music and location
  private static currentMusic: PS1Music | null = null; // Track currently playing music
  private static i18nManager: I18nManager = I18nManager.getInstance();

  // Sound library cache (equivalent to Java soundLIB HashMap)
  private static soundLIB: Map<PS1Sound, string> = new Map();

  // CHR library cache (equivalent to Java chrLIB HashMap)
  private static chrLIB: Map<PS1CHR, CHR> = new Map();


  /**
   * Initialize game screen with specified size
   */
  public static initGameScreen(screenSize: ScreenSize): void {
    this.gameData.setScreenSize(screenSize);
    console.log(`PSGame: Initialized with screen size ${screenSize === ScreenSize.SCREEN_320_240 ? '320x240' : '640x480'}`);
  }


  /**
   * Initialize internationalization system
   */
  public static async initializeI18n(locale?: string): Promise<void> {
    try {
      const targetLocale = locale || this.gameData.locale;
      await this.i18nManager.initialize(targetLocale);
      console.log(`PSGame: I18n initialized for locale: ${targetLocale}`);
    } catch (error) {
      console.error('PSGame: Failed to initialize I18n:', error);
      throw error;
    }
  }

  public static async playMusic(music: PS1Music): Promise<void> {
    if (this.currentMusic === music) {
      return;
    }

    const musicKey = this.getMusicKeyFromPath(music as string);

    ScriptEngine.playmusic(musicKey);
    this.currentMusic = music;
  }

  /**
   * Get music key from music path for cached playback
   */
  private static getMusicKeyFromPath(musicPath: string): string {
    // Find the matching asset key in the manifest based on the path
    for (const asset of PS_MUSIC_MANIFEST.assets) {
      if (asset.path === musicPath) {
        return asset.key;
      }
    }

    // Fallback: extract filename without extension as key
    const filename = musicPath.split('/').pop() || '';
    return filename.replace(/\.(vgz|vgm)$/, '').toLowerCase();
  }

  /**
   * Stop currently playing music
   */
  public static stopMusic(): void {
    ScriptEngine.stopmusic();
    this.currentMusic = null;
  }

  /**
   * Get localized string - direct port from Java getString() method
   */
  public static getString(key: string): string;
  public static getString(key: string, ...params: string[]): string;
  public static getString(key: string, ...params: string[]): string {
    try {
      let result = this.i18nManager.getString(key);

      // Handle parameter substitution (Java style with placeholder/value pairs)
      if (params.length > 0) {
        for (let i = 0; i < params.length; i += 2) {
          if (i + 1 < params.length) {
            const placeholder = params[i];
            const value = params[i + 1];
            result = result.replace(new RegExp(placeholder.replace(/[<>]/g, '\\$&'), 'g'), value);
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`String ${key} not found.`);
      return key;
    }
  }

  /**
   * Get Yes/No choice array for prompts (localized)
   */
  public static getYesNo(): string[] {
    return [this.getString("Menu_Choice_Yes"), this.getString("Menu_Choice_No")];
  }

  /**
   * Set current locale and reload language files
   */
  public static async setLocale(locale: string): Promise<void> {
    try {
      await this.i18nManager.setLocale(locale);
      this.gameData.locale = locale;
      console.log(`PSGame: Locale changed to ${locale}`);
    } catch (error) {
      console.error(`PSGame: Failed to set locale to ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Get current locale
   */
  public static getCurrentLocale(): string {
    return this.i18nManager.getCurrentLocale();
  }

  /**
   * Get available languages with their display names
   */
  public static async getAvailableLanguages(): Promise<{code: string, name: string}[]> {
    // Define supported languages with native display names
    return [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
      { code: 'pt', name: 'Português' },
      { code: 'se', name: 'Svenska' },
      { code: 'tt', name: 'Português (TT)' }
    ];
  }

  /**
   * Check if player is on transport
   */
  public static isOnTransport(): boolean {
    // For now, assume player is not on transport
    // TODO: Implement proper transport detection
    return false;
  }

  /**
   * Regroup party members - direct port of Java PSGame.regroup()
   * Positions the player at adjusted coordinates and faces south
   */
  public static regroup(xAdjust: number, yAdjust: number): void {
    console.log(`PSGame: Regrouping party with adjustment (${xAdjust}, ${yAdjust})`);

    // Early exit if no player (equivalent to TEST_SIMULATION or entities == null checks)
    const player = MainEngine.getPlayer();
    if (!player) {
      console.log('PSGame.regroup: No player entity found');
      return;
    }

    // Get current position and convert to tile coordinates
    // Java: int x = (entities.get(player).getx()+16*xAdjust)/16;
    // Java: int y = (entities.get(player).gety()+16*yAdjust)/16;
    const currentX = player.getx();
    const currentY = player.gety();
    const tileX = Math.floor((currentX + 16 * xAdjust) / 16);
    const tileY = Math.floor((currentY + 16 * yAdjust) / 16);

    // Set player to exact tile position (removes sub-pixel positioning)
    // Java: entities.get(player).setxy(x*16, y*16);
    player.setxy(tileX * 16, tileY * 16);

    // Force player to face south
    // Java: entities.get(player).setFace(Entity.SOUTH);
    player.setFace(EntityDirection.SOUTH);

    console.log(`PSGame.regroup: Player moved from (${currentX}, ${currentY}) to tile (${tileX}, ${tileY}) = (${tileX * 16}, ${tileY * 16}) pixels, facing south`);
  }

  /**
   * Get image resource path
   */
  public static getImage(imageKey: PS1Image | string): string;
  public static getImage(sceneType: any): string; // PSSceneType overload
  public static getImage(imageKeyOrScene: PS1Image | string | any): string {
    if (typeof imageKeyOrScene === 'string') {
      return imageKeyOrScene;
    }

    // Handle PSSceneType - import here to avoid circular dependency
    if (typeof imageKeyOrScene === 'number') {
      // Map PSSceneType enum values to background images
      switch (imageKeyOrScene) {
        case 1: // PSSceneType.BLUE_HOUSE
          return PS1Image.BLUE_HOUSE;
        case 2: // PSSceneType.YELLOW_HOUSE
          return PS1Image.YELLOW_HOUSE;
        case 3: // PSSceneType.HOSPITAL
          return PS1Image.HOSPITAL;
        case 4: // PSSceneType.CHURCH
          return PS1Image.CHURCH;
        case 5: // PSSceneType.SHOP_CENTRAL
          return PS1Image.SHOP_WEAPON; // Generic shop
        case 6: // PSSceneType.SHOP_FOOD
          return PS1Image.SHOP_FOOD;
        case 7: // PSSceneType.SHOP_HAND
          return PS1Image.SHOP_HAND;
        case 8: // PSSceneType.SHOP_WEAPON
          return PS1Image.SHOP_WEAPON;
        default:
          return PS1Image.BLUE_HOUSE; // Default fallback
      }
    }

    return imageKeyOrScene as string;
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
   * Initialize PS game with specified type - direct port from Java
   */
  public static async initPSGame(gameType: GameType): Promise<void> {
    console.log(`PSGame: Initializing game type ${GameType[gameType]}`);

    // Initialize party with specified game type
    this.party = new Party(gameType);

    console.log(`PSGame: Party initialized with ${this.party.partySize()} members`);
  }

  /**
   * Load game (placeholder)
   */
  public static loadGame(): boolean {
    console.log("PSGame: Load game not implemented in demo");
    return false;
  }

  /**
   * Language menu - direct port from Java with I18n integration
   */
  public static async languageMenu(menuStack: any): Promise<boolean> {
    console.log("PSGame: Opening language selection menu");

    // Define supported languages with display names
    const languages = await this.getAvailableLanguages();

    // Get current locale to mark it
    const currentLocale = this.getCurrentLocale();

    // Create language options with current language marked
    const languageOptions = languages.map(lang => {
      const prefix = lang.code === currentLocale ? '* ' : '  ';
      return prefix + lang.name;
    });

    // Create language selection menu
    const languageMenu = menuStack.createPromptBox(90, 140, languageOptions, true);
    menuStack.push(languageMenu);

    // Import PSCancellable for proper typing
    const { PSCancellable } = await import('./menu/MenuStack');

    const selectedIndex = await menuStack.waitOpt(PSCancellable.TRUE);
    menuStack.pop();

    // Handle cancellation (waitOpt returns -1 when cancelled)
    if (selectedIndex === -1) {
      console.log("PSGame: Language selection cancelled");
      return false;
    }

    const selectedLanguage = languages[selectedIndex];
    console.log(`PSGame: Selected language: ${selectedLanguage.name} (${selectedLanguage.code})`);

    // Only change language if it's different from current
    if (selectedLanguage.code !== currentLocale) {
      try {
        await this.setLocale(selectedLanguage.code);
        console.log(`PSGame: Language changed to ${selectedLanguage.name}`);
        return true; // Indicate that language was changed
      } catch (error) {
        console.error(`PSGame: Failed to change language to ${selectedLanguage.code}:`, error);
        return false;
      }
    } else {
      console.log("PSGame: Language unchanged (same as current)");
      return false; // No change needed
    }
  }

  /**
   * Get current party - direct port from Java
   */
  public static getParty(): Party {
    if (!this.party) {
      throw new Error("Party not initialized - call initPSGame() first");
    }
    return this.party;
  }

  /**
   * Get current game type
   */
  public static getGameType(): GameType {
    // For now return PS_ORIGINAL, could be stored in gameData
    return GameType.PS_ORIGINAL;
  }

  /**
   * Get goto X coordinate - direct port from Java
   */
  public static getgotox(): number {
    return this.gotox;
  }

  /**
   * Get goto Y coordinate - direct port from Java
   */
  public static getgotoy(): number {
    return this.gotoy;
  }

  /**
   * Map switch with string path - base implementation
   */
  public static async mapswitch(mapname: string, x: number, y: number, fade: boolean = true): Promise<void> {
    console.log(`PSGame.mapswitch: Loading map ${mapname} at (${x}, ${y})`);

    MainEngine.setEntitiesPaused(true);
    this.setgotoxy(x, y);
    this.transportOff();

    if (fade) {
      await ScriptEngine.fadeout(30, true);
    }

    //MainEngine.setEntitiesPaused(false);
    await ScriptEngine.map(mapname);
  }

  /**
   * Map switch to Planet - explicit method for Planet enum
   */
  public static async mapswitchToPlanet(planet: Planet, x: number, y: number): Promise<void> {
    console.log(`PSGame.mapswitchToPlanet: ${Planet[planet]} at (${x}, ${y})`);

    this.gameData.onGroundVehicle = false;
    this.gameData.current_dungeon = Dungeon.NONE;
    this.gameData.current_planet = planet;
    this.gameData.current_city = null;

    // Import Planet helpers
    const { PlanetHelper } = await import('./game/City');

    // Get planet map path and call base mapswitch
    const mapPath = PlanetHelper.getMapPath(planet);
    await this.mapswitch(mapPath, x, y, true);
    await this.playMusic(PlanetHelper.getMusic(planet));
  }

  /**
   * Map switch to City - explicit method for City enum
   */
  public static async mapswitchToCity(city: City, x: number, y: number): Promise<void> {
    console.log(`PSGame.mapswitchToCity: ${City[city]} at (${x}, ${y})`);

    // Import City helpers
    const { CityHelper } = await import('./game/City');

    if (this.gameData.current_dungeon !== null && this.gameData.current_dungeon !== Dungeon.NONE) {
      // PSMenu.setMapOff(); // TODO: Implement when PSMenu is ready
    }

    this.gameData.onGroundVehicle = false;
    this.gameData.current_dungeon = Dungeon.NONE;
    this.gameData.current_city = city;
    this.gameData.current_planet = CityHelper.getPlanet(city);

    // Add to visited cities
    this.gameData.visitedCities.add(city);

    // Call base mapswitch with city path
    await this.mapswitch(CityHelper.getPath(city), x, y, true);
    this.playMusic(CityHelper.getMusic(city));
  }

  /**
   * Set goto coordinates
   */
  public static setgotoxy(x: number, y: number): void {
    this.gotox = x;
    this.gotoy = y;
  }

  /**
   * Get current city
   */
  public static getCurrentCity(): any {
    return this.currentCity;
  }

  /**
   * Transport off - direct port from Java transportOff()
   */
  public static transportOff(): void {
    console.log("PSGame: Transport off");
    // In full implementation, this would disable transport mode
  }


  /**
   * Turn menu on - direct port from Java PSMenu.menuOn()
   */
  public static menuOn(): void {
    console.log("PSGame: Menu system activated");
    // In full implementation, this would enable the in-game menu system
    // This would integrate with our ported menu system
  }

  /**
   * Turn menu off - direct port from Java PSMenu.menuOff()
   */
  public static menuOff(): void {
    console.log("PSGame: Menu system deactivated");
    // In full implementation, this would disable the in-game menu system
    // This would integrate with our ported menu system
  }

  /**
   * Play sound - direct port of Java PSGame.playSound()
   */
  public static playSound(sound: PS1Sound): void {
    if (!sound) {
      console.error("PSGame: Sound is null");
      return;
    }

    if (!this.currentScene) {
      console.error("PSGame: No current scene to play sound");
      return;
    }

    try {
      // Get sound path
      const soundPath = sound as string;

      // Create audio key from filename
      const audioKey = soundPath.split('/').pop()?.replace('.wav', '') || 'unknown';

      // Check if sound needs to be loaded in Phaser's cache
      if (!this.currentScene.cache.audio.exists(audioKey)) {
        // Load the sound first
        this.currentScene.load.audio(audioKey, soundPath);
        this.currentScene.load.once('complete', () => {
          // Play sound once loaded
          this.currentScene!.sound.play(audioKey, { volume: 0.7 });
        });
        this.currentScene.load.start();
      } else {
        // Sound already loaded in Phaser, play it directly
        this.currentScene.sound.play(audioKey, { volume: 0.7 });
      }

      // Cache the sound path for reference
      if (!this.soundLIB.has(sound)) {
        this.soundLIB.set(sound, soundPath);
      }
    } catch (error) {
      console.error(`PSGame: Error playing sound ${sound}:`, error);
    }
  }

  /**
   * Get CHR data for given PS1CHR type - direct port from Java getCHR()
   */
  public static async getCHR(chrType: PS1CHR): Promise<CHR> {
    if (this.chrLIB.has(chrType)) {
      return this.chrLIB.get(chrType)!;
    }

    if (!this.currentScene) {
      throw new Error("PSGame: No current scene to load CHR data");
    }

    // Load CHR from file
    const chrUrl = PS1CHRHelper.getUrl(chrType);
    console.log(`PSGame: Loading CHR ${PS1CHR[chrType]} from ${chrUrl}`);

    // Parse the URL to get base path and filename
    const urlParts = chrUrl.split('/');
    const filename = urlParts.pop() || '';
    const basePath = urlParts.join('/');

    // Keep the full filename since CHR.loadChr expects .anim.json files
    const chrName = filename;

    console.log(`PSGame: Parsed URL - basePath: "${basePath}", filename: "${filename}", chrName: "${chrName}"`);

    const chr = await CHR.loadChr(this.currentScene, chrName, basePath);
    this.chrLIB.set(chrType, chr);

    return chr;
  }

  /**
   * Check if a flag is set - direct port from Java hasFlag()
   */
  public static hasFlag(flag: Flags): boolean {
    return this.gameData.flags.has(flag);
  }

  /**
   * Set a flag - direct port from Java setFlag()
   */
  public static setFlag(flag: Flags): void {
    this.gameData.flags.add(flag);
    console.log(`PSGame: Set flag ${Flags[flag]}`);
  }

  /**
   * Clear a flag - direct port from Java clearFlag()
   */
  public static clearFlag(flag: Flags): void {
    this.gameData.flags.delete(flag);
    console.log(`PSGame: Cleared flag ${Flags[flag]}`);
  }

  /**
   * Get item by OriginalItem enum - direct port from Java getItem()
   */
  public static getItem(originalItem: OriginalItem): Item {
    const item = PSLibItem.getItemByEnum(originalItem);
    if (!item) {
      throw new Error(`Item not found for OriginalItem: ${OriginalItem[originalItem]}`);
    }
    return item;
  }

  /**
   * Start entity interaction - direct port from Java EntStart()
   * Sets up the interaction context for talking to NPCs/entities
   */
  public static EntStart(): void {
    console.log("PSGame: Starting entity interaction");
    // FIXME: Implement proper entity interaction start behavior
    // In the original Java, this would:
    // 1. Stop entity movement
    // 2. Face entity towards player
    // 3. Set interaction state
    // 4. Potentially show entity sprite/portrait

    // For now, we'll implement basic functionality
    // The actual sprite/portrait display would be handled by PSMenu if needed
  }

  /**
   * Finish entity interaction - direct port from Java EntFinish()
   * Cleans up after entity interaction
   */
  public static EntFinish(): void {
    console.log("PSGame: Finishing entity interaction");

    // Simple fix: pop the text box from the menu stack and clear graphics
    PSMenu.instance.pop();
    PSMenu.instance.clearGraphics();

    // TODO: In the original Java, this would also:
    // 1. Resume entity movement patterns
    // 2. Clear interaction state
    // 3. Hide entity portraits/sprites if shown
    // 4. Return entities to normal behavior
  }

  /**
   * Church routine - direct port from Java PSGame.Church(int costMultiplier)
   * Provides resurrection services for dead party members
   */
  public static async Church(costMultiplier: number): Promise<void> {
    console.log(`PSGame: Church routine started with cost multiplier ${costMultiplier}`);

    // Store current music to restore later
    const previousMusic = this.currentMusic;

    // Play church music
    await this.playMusic(PS1Music.CHURCH);

    // Show MST display
    await PSMenu.showMST();

    // Get dead party members
    const party = this.getParty();
    const deadMembers = party.getDeadMembers();

    if (deadMembers.length === 0) {
      // No one needs resurrection
      await PSMenu.Stext(this.getString("Church_NoResurrectionNeeded"));
    } else {
      // Create resurrection menu with dead members (similar to shop menu)
      const resurrectionOptions: string[] = [];
      const costs: number[] = [];

      for (const member of deadMembers) {
        const cost = member.getLevel() * 20 * costMultiplier;
        costs.push(cost);
        resurrectionOptions.push(`${member.getName()} - ${cost} MST`);
      }

      // Add "None" option
      resurrectionOptions.push(this.getString("Church_None"));

      // Single menu interaction (like shop)
      const resurrectionMenu = PSMenu.instance.createPromptBox(
        50, 80, resurrectionOptions, true
      );

      PSMenu.instance.push(resurrectionMenu);

      // Import PSCancellable for proper typing
      const { PSCancellable } = await import('./menu/MenuStack');

      const choice = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
      PSMenu.instance.pop();

      if (choice !== -1 && choice !== resurrectionOptions.length - 1) {
        // Valid selection - handle resurrection
        const selectedMember = deadMembers[choice];
        const cost = costs[choice];

        // Check if party has enough money
        if (party.getMesetas() < cost) {
          await PSMenu.Stext(this.getString("Church_NotEnoughMoney"));
        } else {
          // Confirm resurrection
          const confirmText = this.getString("Church_ConfirmResurrection")
            .replace("{name}", selectedMember.getName())
            .replace("{cost}", cost.toString());

          const confirmChoice = await PSMenu.Prompt(confirmText, this.getYesNo());

          if (confirmChoice === 0) { // Yes
            // Deduct money and resurrect
            party.removeMesetas(cost);
            selectedMember.resurrect();

            this.playSound(PS1Sound.CURE);

            await PSMenu.Stext(
              this.getString("Church_ResurrectionSuccess")
                .replace("{name}", selectedMember.getName())
            );

            // Check for level up (if character gained experience while dead)
            if (selectedMember.checkLevelUp()) {
              await this.showLevelUp(selectedMember);
            }
          } else {
            // Player chose "No" for confirmation
            await PSMenu.Stext(this.getString("Church_Goodbye"));
          }
        }
      } else {
        // Cancelled or chose "None"
        await PSMenu.Stext(this.getString("Church_Goodbye"));
      }
    }

    // Remove MST display
    PSMenu.instance.pop();

    // Restore previous music
    if (previousMusic) {
      await this.playMusic(previousMusic);
      console.log(`PSGame: Restored previous music: ${previousMusic}`);
    }

    console.log("PSGame: Church routine completed");
  }

  /**
   * Hospital routine - direct port of Java Hospital() method
   * Heals party members for a fee based on cost multiplier
   */
  public static async Hospital(costMultiplier: number): Promise<void> {
    // Create MST display box
    const mstBox = PSMenu.instance.createOneLabelBox(200, 10, "MST " + this.getParty().mst, true);
    PSMenu.instance.push(mstBox);

    const option = await PSMenu.Prompt(this.getString("Hospital_Welcome"), this.getYesNo());
    if (option === 1) { // Yes

      if (this.getParty().partySize() === 1) {
        const member = this.getParty().getMember(0);
        if (member) {
          const hpMpDiff = (member.getMaxHp() - member.getHp()) + (member.getMaxMp() - member.mp);
          if (hpMpDiff <= 0) {
            await PSMenu.StextNext(this.getString("Hospital_Healthy"));
          } else {
            const cost = hpMpDiff * costMultiplier;
            const optCure = await PSMenu.PromptNext(this.getString("Hospital_Cost", "<number>", cost.toString()), this.getYesNo());
            if (optCure === 1) { // Yes
              if (this.getParty().mst >= cost) {
                this.getParty().mst -= cost;
                mstBox.updateText(0, "MST " + this.getParty().mst);
                member.heal();
                this.playSound(PS1Sound.CURE);
                await PSMenu.StextLast(this.getString("Hospital_Cure"));
                PSMenu.instance.pop(); // mstBox
                return;
              } else {
                await PSMenu.StextLast(this.getString("Shop_Not_Enough_Money"));
                PSMenu.instance.pop(); // mstBox
                return;
              }
            }
          }
        }
      } else { // Party size > 1
        let cureWho = await PSMenu.PromptNext(this.getString("Hospital_Who"), this.getParty().listMembers());
        while (cureWho > 0) {
          const member = this.getParty().getMember(cureWho - 1);
          if (member) {
            if (member.getHp() <= 0) {
              await PSMenu.StextNext(this.getString("Hospital_Dead", "<player>", member.getName()));
            } else {
              const hpMpDiff = (member.getMaxHp() - member.getHp()) + (member.getMaxMp() - member.mp);
              if (hpMpDiff <= 0) {
                await PSMenu.StextNext(this.getString("Hospital_Player_Healthy", "<player>", member.getName()));
              } else {
                const cost = hpMpDiff * costMultiplier;
                const optCure = await PSMenu.PromptNext(this.getString("Hospital_Cost", "<number>", cost.toString()), this.getYesNo());
                if (optCure === 1) { // Yes
                  if (this.getParty().mst >= cost) {
                    this.getParty().mst -= cost;
                    mstBox.updateText(0, "MST " + this.getParty().mst);
                    member.heal();
                    this.playSound(PS1Sound.CURE);
                    await PSMenu.StextNext(this.getString("Hospital_Cure"));
                  } else {
                    await PSMenu.StextLast(this.getString("Shop_Not_Enough_Money"));
                    PSMenu.instance.pop(); // mstBox
                    return;
                  }
                }
              }
            }
          }

          cureWho = await PSMenu.PromptNext(this.getString("Hospital_Other"), this.getParty().listMembers());
        }
      }
    }

    await PSMenu.StextLast(this.getString("Hospital_End"));
    PSMenu.instance.pop(); // mstBox
  }

  /**
   * Show level up information - helper for Church and other level-up scenarios
   */
  private static async showLevelUp(member: any): Promise<void> {
    const levelUpText = this.getString("LevelUp_Message")
      .replace("{name}", member.getName())
      .replace("{level}", member.getLevel().toString());

    await PSMenu.Stext(levelUpText);

    // Show stat increases if available
    const statIncrease = member.getLastLevelUpStats();
    if (statIncrease) {
      const statsText = this.getString("LevelUp_Stats")
        .replace("{hp}", statIncrease.hp.toString())
        .replace("{mp}", statIncrease.mp.toString())
        .replace("{attack}", statIncrease.attack.toString())
        .replace("{defense}", statIncrease.defense.toString());

      await PSMenu.Stext(statsText);
    }
  }

  /**
   * Spaceport transition with animation - direct port of Java spaceportTransition() method
   * Animates party movement in specified direction until reaching stop point, then switches to destination
   */
  public static async spaceportTransition(direction: number, whenStop: number, destiny: City, gotox: number, gotoy: number): Promise<void> {
    MainEngine.setScriptActive(true);
    this.menuOff();
    this.transportOff();

    await this.getParty().allocate(this.getgotox(), this.getgotoy());
    MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();
    await ScriptEngine.fadein(30, true);

    let count = 0;
    const party = this.getParty();

    while (true) {
      const player = MainEngine.getPlayer();
      if (!player) break;

      // Check stop conditions based on direction
      const playerTileX = Math.floor(player.getx() / 16);
      const playerTileY = Math.floor(player.gety() / 16);

      if (direction === 3 && playerTileX < whenStop) break; // WEST
      if (direction === 4 && playerTileX > whenStop) break; // EAST
      if (direction === 1 && playerTileY < whenStop) break; // NORTH
      if (direction === 2 && playerTileY > whenStop) break; // SOUTH

      // Move all party members
      let currentEntity: Entity | null = player;
      for (let j = 0; j < party.partySize(); j++) {
        if (j === 0) {
          currentEntity = player;
        } else if (currentEntity) {
          currentEntity = currentEntity.getFollower();
        }

        if (currentEntity && count === 0) {
          currentEntity.setFace(direction);
          if (direction === 2 || direction === 1) {
            currentEntity.incx(4);
          }
        }

        if (currentEntity && count > j * 16) {
          switch (direction) {
            case 3: // WEST
              currentEntity.incx(-1);
              break;
            case 4: // EAST
              currentEntity.incx(1);
              break;
            case 1: // NORTH
              currentEntity.incy(-1);
              break;
            case 2: // SOUTH
              currentEntity.incy(1);
              break;
          }
        }
      }

      count++;
      await new Promise(resolve => setTimeout(resolve, 16));
    }

    MainEngine.setScriptActive(false);
    this.menuOn();
    await this.mapswitchToCity(destiny, gotox, gotoy);
  }
}