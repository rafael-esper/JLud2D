package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;

import java.awt.Color;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

import javax.jws.Oneway;
import javax.swing.JFileChooser;
import javax.swing.filechooser.FileNameExtensionFilter;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.Phantasy;
import demos.ps.oo.Item.ItemType;
import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PSEffect.EffectPlace;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSLibCHR.PS1CHR;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSLibSpell.PS1Spell;
import demos.ps.oo.PSLibSpell.Spell;
import demos.ps.oo.PSMenu.Cancellable;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Outcome;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.menuGUI.MenuCHR;
import demos.ps.oo.menuGUI.MenuLabelBox;
import demos.ps.oo.menuGUI.MenuType;
import core.Script;
import domain.CHR;
import domain.Entity;
import domain.VImage;
import domain.VSound;

/**
 * Class responsible for:
 * - Storing data related to the PS Game Engine, like sound effects, item LIB, and so on.
 * - Providing functions related to the PS Game Engine, like Shop(), Church(), Hospital(), and so on.
 */
public class PSGame {

	private static final Logger log = LogManager.getLogger(PSGame.class);

	//private static final String BASE_FOLDER = "ps";
	public static final String BASE_FOLDER = "demos/ps";

	static JFileChooser fileChooser = new JFileChooser();
	
	// Algol -> Planet -> Cities, Dungeons -> Chests
	public enum Planet { 
		PALMA ("maps/Palma.map", PS1Music.PALMA), 
		MOTAVIA ("maps/Motavia.map", PS1Music.MOTAVIA), 
		DEZORIS ("maps/Dezoris.map", PS1Music.DEZORIS);
		
		String mapPath;
		PS1Music music;
		
		Planet(String mapPath, PS1Music music) {
			this.mapPath = mapPath;
			this.music = music;
		}
		String getPath() {
			return this.mapPath;
		}
		public PS1Music getMusic() {
			return music;
		}		
	};
	
	public enum GameType {PS_ORIGINAL, PS_START_AS_ODIN, PS_START_AS_NOAH, PS_PARTY, PS_EXTENDED, PS_ARENA};
	public enum ScreenSize {SCREEN_320_240, SCREEN_640_480};

	public static GameData gameData;

	private static HashMap<Integer, Item> itemLIB;
	private static HashMap<GenericEnemy, Enemy> enemyLIB;
	private static HashMap<PS1Sound, VSound> soundLIB;
	private static HashMap<PS1Image, VImage> imageLIB;
	private static HashMap<PS1CHR, CHR> animLIB;
	
	public static boolean canTransport;
	public static PSDungeon currentDungeon;
	
	private static City fromCity, toCity; // For spaceship routine

	// Game flags
	public enum Flags {
		VISIT_SUELO,
		VISIT_NEKISE,
		SCION_INSIST_1,
		SCION_INSIST_2,
		GOT_MYAU,
		GOT_ODIN,
		INFO_KEY,
		GOVERNOR_CAKE,
		MET_GOVERNOR,		
		GOT_NOAH,
		LUVENO_INSIST_1,
		LUVENO_INSIST_2,
		LUVENO_FREE,
		GOT_ASSISTANT,
		LUVENO_FEE,
		LUVENO_WAIT1,
		LUVENO_WAIT2,
		LUVENO_WAIT3,
		LUVENO_READY,
		DEFEAT_DRMAD,
		GOT_HAPSBY,
		LUVENO_BOARD,
		SPACESHIP_AREA,
		INFO_FLUTE,
		GOT_FLUTE,		
		INFO_HOVER, 
		INFO_PERSEUS,
		GOT_TORCH,
		DEFEAT_TAJIMA,
		DEFEAT_GOLD_DRAKE,
		DEFEAT_SHADOW,
		DEFEAT_LASSIC,
		DEFEAT_DARKFALZ,
		
		MONSTER_IALA_SKELETON,
		MONSTER_MEDUSA,
		MONSTER_NAHARU_DRAGON,
		MONSTER_CASBA_RD_DRAGON,
		MONSTER_CASBA_BL_DRAGON,
		MONSTER_TRIADA_SKELETON,
		MONSTER_TRIADA_ROBOTCOP,
		MONSTER_LOST_ISLAND_DRAGON,
		MONSTER_PRISON_ROBOTCOP,
		MONSTER_SKY_SERPENT,  	
		
		// New
		MONSTER_TONOE_SACCUBUS,
		INFO_TONOE_DAUGHTER, 
		INFO_GOTHIC_NECRO,
		
		// Odin Quest
		ODIN_MEDUSA_HISS,
		ODIN_MEDUSA_COMPASS,
		
	}; 

	// Chest flags
	public enum Chest {
		WAREHOUSE_CHEST1,
		WAREHOUSE_CHESTKEY,
		
		ODIN_CHEST1,
		ODIN_CHEST2,
		ODIN_COMPASS,

		IALA_CAVE_CHEST1,
		IALA_CAVE_CHEST2,
		IALA_CAVE_CHEST3,
		IALA_CAVE_CHEST4,
		IALA_CAVE_CHEST5,
		IALA_CAVE_CHEST6,
		IALA_CAVE_CHEST7,
		IALA_CAVE_CHEST8,
		IALA_CAVE_CHEST9,
		IALA_CAVE_CHEST10,
		IALA_CAVE_CHEST11,
		IALA_CAVE_CHEST12,
		IALA_CAVE_CHEST13,
		IALA_CAVE_CHEST14,
		IALA_CAVE_CHEST15,
		IALA_CAVE_CHEST16,
		IALA_CAVE_CHEST17, // skeleton		
		
		NAULA_CHEST1,
		NAULA_CHEST2,
		NAULA_CHEST3,

		DR_MAD_CHEST,
		
		MIRROR_SHIELD,
		
		MEDUSA_TOWER_CHEST1,		
		MEDUSA_TOWER_CHEST2,		
		MEDUSA_TOWER_CHEST3,		
		MEDUSA_TOWER_CHEST4,		
		MEDUSA_TOWER_CHEST5,		
		MEDUSA_TOWER_CHEST6,		
		MEDUSA_TOWER_CHEST7,		
		MEDUSA_TOWER_CHEST8,		
		MEDUSA_TOWER_CHEST9,		
		MEDUSA_TOWER_CHEST10,		
		MEDUSA_TOWER_CHEST11,		
		MEDUSA_TOWER_CHEST12,		
		MEDUSA_TOWER_CHEST13,		
		MEDUSA_TOWER_CHEST14,		
		MEDUSA_TOWER_CHEST15,		
		MEDUSA_TOWER_CHEST16,		
		MEDUSA_TOWER_CHEST17,		
		MEDUSA_TOWER_CHEST18,		
		MEDUSA_TOWER_CHEST19,		
		MEDUSA_TOWER_CHEST20,
		MEDUSA_TOWER_CHEST21,	// medusa	

		LOST_ISLAND_CHEST1,
		LOST_ISLAND_CHEST2,
		LOST_ISLAND_CHEST3,
		LOST_ISLAND_CHEST4,
		LOST_ISLAND_CHEST5,
		LOST_ISLAND_CHEST6,
		LOST_ISLAND_CHEST7,
		LOST_ISLAND_CHEST8,
		LOST_ISLAND_CHEST9,
		LOST_ISLAND_CHEST10,
		LOST_ISLAND_CHEST11,
		LOST_ISLAND_CHEST12,
		LOST_ISLAND_CHEST13,
		LOST_ISLAND_CHEST14,
		LOST_ISLAND_CHEST15, // red dragon
		
		NAHARU_CHEST1,
		NAHARU_CHEST2,
		NAHARU_CHEST3,
		NAHARU_CHEST4,
		NAHARU_CHEST5,
		NAHARU_CHEST6,
		NAHARU_CHEST7,
		NAHARU_CHEST8, 
		NAHARU_CHEST9,	// red dragon	
		
		CASBA_CAVE_CHEST1,
		CASBA_CAVE_CHEST2,		
		CASBA_CAVE_CHEST3,		
		CASBA_CAVE_CHEST4,		
		CASBA_CAVE_CHEST5,
		CASBA_CAVE_CHEST6, // bl dragon
		CASBA_CAVE_CHEST7, // red dragon

		TAJIMA_CAVE_CHEST1,		
		TAJIMA_CAVE_CHEST2,		
		TAJIMA_CAVE_CHEST3,		
		TAJIMA_CAVE_CHEST4,		
		TAJIMA_CAVE_CHEST5,		
		TAJIMA_CAVE_CHEST6,		
		TAJIMA_CAVE_CHEST7,		
		TAJIMA_CAVE_CHEST8,		
		TAJIMA_CAVE_CHEST9,		
		TAJIMA_CAVE_CHEST10,		
		TAJIMA_CAVE_CHEST11,		
		TAJIMA_CAVE_CHEST12,		
		TAJIMA_CAVE_CHEST13,		
		
		BORTEVO_CHEST1, 
		BORTEVO_CHEST2,		
		BORTEVO_CHEST3, 
		BORTEVO_CHEST4,

		ABION_CHEST1,
		ABION_CHEST2, 
		
		SKURE_CHEST, 
		
		DEZO_CAVE1_CHEST1,
		DEZO_CAVE1_CHEST2,
		
		DEZO_CAVE3_CHEST,
		
		CORONA_CAVE_CHEST1,		
		CORONA_CAVE_CHEST2,		
		CORONA_CAVE_CHEST3,		
		CORONA_CAVE_CHEST4,		
		CORONA_CAVE_CHEST5,		
		CORONA_CAVE_CHEST6,		
		CORONA_CAVE_CHEST7,		
		CORONA_CAVE_CHEST8,		
		CORONA_CAVE_CHEST9,
		
		PRISM_CAVE_CHEST1,
		PRISM_CAVE_CHEST2,	// titan	
		
		GUARON_MORGUE_CHEST1,
		GUARON_MORGUE_CHEST2, 
		
		FROST_DUNGEON_CHEST1,		
		FROST_DUNGEON_CHEST2,		
		FROST_DUNGEON_CHEST3,		
		FROST_DUNGEON_CHEST4,		
		FROST_DUNGEON_CHEST5,		
		FROST_DUNGEON_CHEST6,
		
		BAYA_MALAY_CHEST1,		
		BAYA_MALAY_CHEST2,		
		BAYA_MALAY_CHEST3,		
		BAYA_MALAY_CHEST4,		
		BAYA_MALAY_CHEST5,		
		BAYA_MALAY_CHEST6,		
		BAYA_MALAY_CHEST7,		
		BAYA_MALAY_CHEST8,		
		BAYA_MALAY_CHEST9,		
		BAYA_MALAY_CHEST10,		
		BAYA_MALAY_CHEST11,		
		BAYA_MALAY_CHEST12,		
		BAYA_MALAY_CHEST13,		
		BAYA_MALAY_CHEST14,		
		BAYA_MALAY_CHEST15,		
		BAYA_MALAY_CHEST16,		
		BAYA_MALAY_CHEST17,		
		BAYA_MALAY_CHEST18,		
		BAYA_MALAY_CHEST19,		
		BAYA_MALAY_CHEST20,		
		BAYA_MALAY_CHEST21,		
		BAYA_MALAY_CHEST22,		
		BAYA_MALAY_CHEST23,		
		BAYA_MALAY_CHEST24,		
		BAYA_MALAY_CHEST25,		
		BAYA_MALAY_CHEST26,
		
		TONOE_MINE_CHEST1,
		TONOE_MINE_CHEST2,
		TONOE_MINE_CHEST3,
		TONOE_MINE_CHEST4,
		TONOE_MINE_CHEST5,
		TONOE_MINE_CHEST6,
		
	}

	// Trap flags
	public enum Trap {
		BAYA_MALAY_TRAP1,				INFO_BAYA_MALAY_TRAP1, 
		BAYA_MALAY_TRAP2,               INFO_BAYA_MALAY_TRAP2, 
		BAYA_MALAY_TRAP3,               INFO_BAYA_MALAY_TRAP3, 
		BAYA_MALAY_TRAP4,               INFO_BAYA_MALAY_TRAP4, 
		                       
		CORONA_TRAP1,                   INFO_CORONA_TRAP1,     
		CORONA_TRAP2,                   INFO_CORONA_TRAP2,     
		CORONA_TRAP3,                   INFO_CORONA_TRAP3,     
		CORONA_TRAP4,                   INFO_CORONA_TRAP4,     
		CORONA_TRAP5,                   INFO_CORONA_TRAP5,     
		CORONA_TRAP6,                   INFO_CORONA_TRAP6,     
		                       
		DARKFALZ_TRAP1,                 INFO_DARKFALZ_TRAP1,   
		DARKFALZ_TRAP2,                 INFO_DARKFALZ_TRAP2,   
		                       
		FROST_CAVE_TRAP1,               INFO_FROST_CAVE_TRAP1, 
		FROST_CAVE_TRAP2,               INFO_FROST_CAVE_TRAP2, 
		FROST_CAVE_TRAP3,               INFO_FROST_CAVE_TRAP3, 
		FROST_CAVE_TRAP4,               INFO_FROST_CAVE_TRAP4, 
		FROST_CAVE_TRAP5,               INFO_FROST_CAVE_TRAP5, 
		FROST_CAVE_TRAP6,               INFO_FROST_CAVE_TRAP6, 
		                       
		GUARON_TRAP1,                   INFO_GUARON_TRAP1,     
		GUARON_TRAP2,                   INFO_GUARON_TRAP2,     
		                       
		IALA_TRAP1,                     INFO_IALA_TRAP1,       
		IALA_TRAP2,                     INFO_IALA_TRAP2,       
		IALA_TRAP3,                     INFO_IALA_TRAP3,       
		IALA_TRAP4,                     INFO_IALA_TRAP4,       
		                       
		LOST_ISLAND_TRAP1,              INFO_LOST_ISLAND_TRAP1,
		LOST_ISLAND_TRAP2,              INFO_LOST_ISLAND_TRAP2,
		LOST_ISLAND_TRAP3,              INFO_LOST_ISLAND_TRAP3,
		LOST_ISLAND_TRAP4,              INFO_LOST_ISLAND_TRAP4,
		                       
		MEDUSA_TRAP1,                   INFO_MEDUSA_TRAP1,     
		MEDUSA_TRAP2,                   INFO_MEDUSA_TRAP2,     
		                       
		NAHARU_TRAP,                    INFO_NAHARU_TRAP;       
	}
	
	
	private PSGame() { }
	
	// Main code that initialize Gamedata and Menu
	public static void initGameScreen(ScreenSize screenSize) {
		gameData = new GameData();
		gameData.setScreenSize(screenSize);

		gameData.locale = new Locale("en", "US");
		GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", gameData.locale);
		
		soundLIB = new HashMap<PS1Sound, VSound>();
		imageLIB = new HashMap<PS1Image, VImage>();
		animLIB = new HashMap<PS1CHR, CHR>();
		
		PSMenu.initPSMenu(screenSize);
	}
	
	// Main code that initializes Chars, Items, Enemies, Scenes
	public static void initPSGame(GameType gameType) {

		gameData.setGameType(gameType);
		
//		if(gameType == PSGame.GameType.PS_ORIGINAL || gameType == PSGame.GameType.PS_BATTLE 
	//			|| gameType == PSGame.GameType.PS_START_AS_ODIN || gameType == PSGame.GameType.PS_START_AS_NOAH) {
			itemLIB = PSLibItem.initializeOriginalItems();
			enemyLIB = PSLibEnemy.initializeOriginalEnemies();
	//	}
		
		gameData.setParty(new Party(gameType));
	}

	public static void setgotoxy(int x, int y) {
		gameData.gotox = x;
		gameData.gotoy = y;
	}
	public static int getgotox() {
		return gameData.gotox;
	}
	public static int getgotoy() {
		return gameData.gotoy;
	}
	public static GameType getGameType() {
		return gameData.getGameType();
	}

	public static void changeSoundVolume(int i) {
		PSGame.gameData.soundVolume = i;
	}

	public static void playSound(PS1Sound sound) {
		if(sound == null || soundLIB == null || TEST_SIMULATION) {
			if(!TEST_SIMULATION)
				log.error("Sound or soundLIB is null.");
			return;
		}
		if(!soundLIB.containsKey(sound)) {
			soundLIB.put(sound, new VSound(load(sound.getUrl())));
		}
		Script.playsound(soundLIB.get(sound), PSGame.gameData.soundVolume);
	}
	
	public static void changeMusicVolume(int i) {
		PSGame.gameData.musicVolume = i;
		Script.setMusicVolume(i);
	}
	
	public static void playMusic(PS1Music music) {
		if(music == null) {
			log.error("Music is null.");
			return;
		}
		//if(gameData == null || !gameData.fmMusic) {
			Script.playmusic(load(music.getUrl()), gameData==null ? 50 : gameData.musicVolume);
//		} FM Not yet else {
	//		Script.playmusic(load(music.getFmUrl()));
		//}
	}
	
	public static void findAndPlayMusic() {
		if(gameData == null) {
			return;
		}
		if(getCurrentDungeon() != Dungeon.NONE) {
			playMusic(getCurrentDungeon().getMusic());
		}
		else if (gameData.current_city != null) {
			playMusic(gameData.current_city.getMusic());
		} 
		else if (gameData.current_planet != null) {
			if(gameData.onGroundVehicle || gameData.onWaterVehicle) {
				playMusic(PS1Music.VEHICLE);	
			}
			else {
				playMusic(gameData.current_planet.getMusic());
			}
		}
		else if(gameData.getGameType() == null) {
			playMusic(PS1Music.TITLE);
		}
		else {
			playMusic(PS1Music.STORY);
		}
	}

	
	public static Item getItem(PSLibItem.OriginalItem index) {
		if(itemLIB == null) {
			log.error("Item LIB not initialized.");
			return null;
		}
		return itemLIB.get(index.ordinal());
	}

	public static Enemy getEnemy(GenericEnemy index) {
		if(enemyLIB == null) {
			log.error("Enemy LIB not initialized.");
			return null;
		}
		return enemyLIB.get(index);
	}
	
	public static HashMap<GenericEnemy, Enemy> getEnemyLib() {
		return enemyLIB;
	}
	
	
	static void mapswitch(String mapname, int x, int y, boolean fade) {
		setentitiespaused(true);
		setgotoxy(x, y);
		unpress(9);
		transportOff(); // unless activated on the world map
		
		if(fade && !Script.TEST_SIMULATION) {
			screen.fadeOut(30, true);
		}
		setentitiespaused(false);
		map(mapname);
	}
	public static void mapswitch(City city, int x, int y) {
		if(gameData.current_dungeon != Dungeon.NONE && !TEST_SIMULATION) {
			PSMenu.setMapOff();
		}
		gameData.onGroundVehicle = false;
		gameData.current_dungeon = Dungeon.NONE;
		gameData.current_city = city;
		gameData.current_planet = city.planet;
		gameData.visitedCities.add(city);
		mapswitch(city.getPath(), x, y, true);
		playMusic(city.getMusic());
	}
	public static void mapswitch(Planet planet, int x, int y) {
		if(gameData.current_dungeon != Dungeon.NONE && !TEST_SIMULATION) {
			PSMenu.setMapOff();
		}
		//PSMenu.instance.transportActive = false;
		//gameData.onGroundVehicle = false;
		
		gameData.current_dungeon = Dungeon.NONE;
		gameData.current_city = null;
		gameData.current_planet = planet;
		mapswitch(planet.getPath(), x, y, true);
		PSGame.playMusic(planet.getMusic());
	}
	public static void mapswitchShip(Planet planet, int x, int y) {
		gameData.current_dungeon = Dungeon.NONE;
		gameData.current_city = null;
		gameData.current_planet = planet;
		if(!Script.TEST_SIMULATION) {
			PSMenu.setMapOff();
			screen.paintBlack();
		}
		mapswitch(planet.getPath(), x, y, false);
		Script.stopmusic(); 		// don't play music
	}	

	public static void mapswitch(Dungeon dungeon) {
		gameData.current_dungeon = dungeon;
		gameData.current_city = null;
		gameData.onGroundVehicle = false;
		gameData.dungeonFloor = 0;
		currentDungeon = new PSDungeon();
		currentDungeon.setAlreadyInside(false);
		mapswitch(dungeon.getPath(), dungeon.getX(), dungeon.getY(), dungeon!=Dungeon.DARKFALZ_DUNGEON);
		playMusic(dungeon.getMusic());
	}
	public static void mapswitch(Dungeon dungeon, int posx, int posy) {
		gameData.current_dungeon = dungeon;
		gameData.current_city = null;
		gameData.onGroundVehicle = false;
		currentDungeon = new PSDungeon();
		currentDungeon.setAlreadyInside(false);
		mapswitch(dungeon.getPath(), posx, posy, true);
		playMusic(dungeon.getMusic());
	}
	
	
	public static void transportOff() {
		canTransport = false;
		//gameData.onWaterVehicle = false;
		hookbutton(1, "");
	}
	
	public static void transportOn() {
		canTransport = true;
		String base = BASE_FOLDER.replace("/", ".");
		hookbutton(1, base + ".oo.PSGame.verifyTransport");
	}
	
	public static void verifyTransport() {
		if(getCurrentDungeon() != Dungeon.NONE || gameData.current_city != null || PSMenu.instance.hasMenu()) {
			return;
		}
		unpress(1);
		
		if(PSGame.gameData.current_planet == Planet.DEZORIS) {
			if(!gameData.onGroundVehicle) {
				if(!icedigger()) {
					landrover();
				}
			} else {
				disembark();
				current_map.setMethodZone(WEAK_ICE_ZONE, true);
			}
			return;
		}
				
		if(gameData.onWaterVehicle) {
			hovercraft(false); // try to disembark
		} else 
		if(!hovercraft(true)) {
			if(!gameData.onGroundVehicle) {
				landrover();
			}
			else {
				disembark();
			}
		}
	}
	
	private static void disembark() {
		getParty().disembark(entities.get(player).getx() /16, entities.get(player).gety() /16);
		gameData.onGroundVehicle = false;
		PSGame.findAndPlayMusic();
	}

	public static boolean isOnTransport() {
		return gameData.onGroundVehicle || gameData.onWaterVehicle;
	}
	
	public static boolean landrover() {
		if(!getParty().hasQuestItem(getItem(OriginalItem.Vehicle_LandMaster))) {
			return false;
		}
		int x = 0, y = 0;
		if(player != -1) {
			x = entities.get(player).getx() /16;
			y = entities.get(player).gety() /16;
		}
		else {
			// Just loaded the game
			x = gameData.gotox;
			y = gameData.gotoy;
		}
		
		if(isWater(x, y) || isWater(x+1, y) || isWater(x-1, y) || isWater(x, y-1) || isWater(x, y+1)) {
			return false;
		}
		
		getParty().embark(x, y, "chars/Landrover.chr");
		gameData.onGroundVehicle = true;
		playMusic(PS1Music.VEHICLE);
		return true;
	}
	
	public static boolean hovercraft(boolean enter) {
		if(!getParty().hasQuestItem(getItem(OriginalItem.Vehicle_FlowMover))) {
			return false;
		}
		
		int x = 0, y = 0;
		if(player != -1) {
			Entity e = entities.get(player);
			switch(entities.get(player).getFace()) {
				case Entity.NORTH: x = e.getx()/16; y = (e.gety()-17)/16;break;
				case Entity.WEST: x = (e.getx()-17)/16; y = e.gety()/16;break;
				case Entity.SOUTH: x = e.getx()/16; y = (e.gety()+40)/16;break;
				case Entity.EAST: x = (e.getx()+33)/16; y = e.gety()/16;break;
			}		
		} else {
			// Just loaded the game
			x = gameData.gotox;
			y = gameData.gotoy;
		}
		
		if(!isWater(x, y)) {
			log.info("Not water: " + x + ", " + y);
		}
		if(enter && isWater(x, y)) {
			getParty().embark(x, y, "chars/Hover.chr");
			gameData.onWaterVehicle = true;
			gameData.onGroundVehicle = false;
			playMusic(PS1Music.VEHICLE);
			return true;
		}

		if(!enter && !isWater(x, y) && !current_map.getobs(x, y)) {
			getParty().disembark(x, y);
			gameData.onWaterVehicle = false;
			PSGame.findAndPlayMusic();
			return true;
		}
		
		return false;
	}

	public static boolean isWater(int x, int y) {
		int tile = current_map.gettile(x,  y,  0) - 1;
		//log.info(tile);
		if(tile == 7 || tile == 230 || tile == 231 || tile == 250 || tile == 251 ||
				(tile>=180 && tile<=189) ||
				(tile>=200 && tile<=209) ||
				(tile>=260 && tile<=269) ||
				(tile>=280 && tile<=289) ||
				(tile>=554 && tile<=557) ||
				(tile>=574 && tile<=577)) 
		{
				 	return true;
		}
		return false;
	}
	
	public static boolean icedigger() {
		if(!getParty().hasQuestItem(getItem(OriginalItem.Vehicle_IceDecker))) {
			return false;
		}

		int x = 0, y = 0;
		if(player != -1) {
			x = entities.get(player).getx() /16;
			y = entities.get(player).gety() /16;
		} else {
			// Just loaded the game
			x = gameData.gotox;
			y = gameData.gotoy;
		}
		
		getParty().embark(x, y, "chars/IceDigger.chr");
		current_map.setMethodZone(WEAK_ICE_ZONE, false);
		gameData.onGroundVehicle = true;
		playMusic(PS1Music.VEHICLE);
		return true;
	}		
	
	public static final int ICE_FLOCK = 165;
	public static final int WEAK_ICE_ZONE = 1;

	public static void breakIce() {
		if(gameData.onGroundVehicle && PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Vehicle_IceDecker))) {
			
			Entity e = entities.get(player);
			int x1 = 0, y1 = 0;
			int x2 = 0, y2 = 0;
			switch(e.getFace()) {
				case Entity.NORTH: 
					x1= e.getx()/16; 	y1 = e.gety()/16-1*1;
					x2= e.getx()/16+1; 	y2 = e.gety()/16-1*1;
					break;
				case Entity.WEST: 
					x1 = e.getx()/16-1*1; y1 = e.gety()/16;
					x2 = e.getx()/16-1*1; y2 = e.gety()/16+1;
					break;
				case Entity.SOUTH: 
					x1 = e.getx()/16; 	y1 = e.gety()/16+1*2;
					x2 = e.getx()/16+1; y2 = e.gety()/16+1*2;
					break;
				case Entity.EAST: 
					x1 = e.getx()/16+1*2;	y1 = e.gety()/16;
					x2 = e.getx()/16+1*2;	y2 = e.gety()/16+1;
					break;
			}
			
			boolean sound = false;
			int zone =  current_map.getzone(x1, y1);
			if(zone == WEAK_ICE_ZONE) {
				//current_map.setobs(x1, y1, 0);
				current_map.settile(x1, y1, 0, ICE_FLOCK);
				sound = true;
			}
			zone =  current_map.getzone(x2, y2);
			if(zone == WEAK_ICE_ZONE) {
				//current_map.setobs(x2, y2, 0);
				current_map.settile(x2, y2, 0, ICE_FLOCK);
				sound = true;
			}
			if(sound) {
				PSGame.playSound(PS1Sound.TCHAC);				
			}
		}
	}
	
	// Wrapper to Shop Menu
	public static void Shop(String greetings, boolean sellOption, Item[] items) {
		PSGame.playMusic(PS1Music.SHOP);
		PSMenuShop.Shop(greetings, sellOption, getParty(), items);
		findAndPlayMusic();
	}
	
	public static void Church(int costMultiplier) {
		PSGame.playMusic(PS1Music.CHURCH);
		
		MenuLabelBox mstBox = PSMenu.instance.createOneLabelBox(200, 10, "MST " + getParty().mst, true);
		PSMenu.instance.push(mstBox);
		
		boolean resurrected = false;
		int option = PSMenu.Prompt(PSGame.getString("Church_Welcome"), getYesNo());
		if(option == 1) { // Yes
			
			if(getParty().partySize() == 1) {
				PSMenu.StextNext(PSGame.getString("Church_Alive", "<player>", getParty().getMember(0).getName()));
			} else {

				int reviveWho = PSMenu.PromptNext(PSGame.getString("Church_Who"), getParty().listMembers());
				while(reviveWho > 0) {
					PartyMember p = getParty().getMember(reviveWho-1);
					
					if(p.getHp() > 0) {
						PSMenu.StextNext(PSGame.getString("Church_Alive", "<player>", p.getName()));						
					}
					else {
						int cost = p.getLevel() * 20 * costMultiplier;
						int optRevive = PSMenu.PromptNext(PSGame.getString("Church_Pay", "<number>", Integer.toString(cost)), getYesNo());
						if(optRevive == 1) { // Yes
							if(getParty().mst >= cost) {
								PSMenu.StextNext(PSGame.getString("Church_Choose"));
								PSGame.playSound(PS1Sound.REVIVE);
								PSMenu.StextNext(PSGame.getString("Church_Incantation"));
								getParty().mst -= cost;
								mstBox.updateText(0, "MST " + getParty().mst);
								p.heal();
								resurrected = true;
							} else {
								PSMenu.StextNext(PSGame.getString("Church_Choose"));
								PSMenu.StextNext(PSGame.getString("Church_Fail"));
								PSMenu.StextNext(PSGame.getString("Church_Apologies"));
							}
						}
					}
					reviveWho = PSMenu.PromptNext(PSGame.getString("Church_Other"), getParty().listMembers());
				}
			}
		}
		
		PSMenu.StextNext(PSGame.getString("Church_End"));
		PSMenu.StextNext(PSGame.getString("Church_LevelBegin"));
		for(int i=0; i<getParty().partySize(); i++) {
			PartyMember p = getParty().getMember(i); 
			if(p.getHp() > 0) {
				int remainingXp = p.getJob().listXp(p.getLevel() + 1) - p.xp;
				if(i+1 < getParty().partySize()) {
					PSMenu.StextNext(PSGame.getString("Church_LevelUp", "<player>", p.getName(), "<number>", Integer.toString(remainingXp)));
				} else {
					PSMenu.StextLast(PSGame.getString("Church_LevelUp", "<player>", p.getName(), "<number>", Integer.toString(remainingXp)));
				}
			}
		}

		PSMenu.instance.pop(); // mstBox
		
		if(resurrected) {
			getParty().reallocate();
		}
		
		findAndPlayMusic();		
	}
	
	public static void Hospital(int costMultiplier) {
		MenuLabelBox mstBox = PSMenu.instance.createOneLabelBox(200, 10, "MST " + getParty().mst, true);
		PSMenu.instance.push(mstBox);

		int option = PSMenu.Prompt(PSGame.getString("Hospital_Welcome"), getYesNo());
		if(option == 1) { // Yes
		
			if(getParty().partySize() == 1) {
				
				int hpMpDiff = (getParty().getMember(0).getMaxHp() - getParty().getMember(0).getHp()) + 
								(getParty().getMember(0).getMaxMp() - getParty().getMember(0).mp); 
				if(hpMpDiff <= 0) {
					PSMenu.StextNext(PSGame.getString("Hospital_Healthy")); 
				} else {
					int cost = hpMpDiff * costMultiplier;
					int optCure = PSMenu.PromptNext(PSGame.getString("Hospital_Cost", "<number>", Integer.toString(cost)), getYesNo());
					if(optCure == 1) { // Yes
						if(getParty().mst >= cost) {
							getParty().mst-= cost;
							mstBox.updateText(0, "MST " + getParty().mst);
							getParty().getMember(0).heal();
							PSGame.playSound(PS1Sound.CURE);
							PSMenu.StextLast(PSGame.getString("Hospital_Cure"));
							PSMenu.instance.pop(); // mstBox
							return;
						} else {
							PSMenu.StextLast(PSGame.getString("Shop_Not_Enough_Money"));
							PSMenu.instance.pop(); // mstBox
							return;
						}
					}
				}
			} else { // Partysize > 1
				int cureWho = PSMenu.PromptNext(PSGame.getString("Hospital_Who"), getParty().listMembers());
				while(cureWho > 0) {
					if(getParty().getMember(cureWho-1).getHp() <= 0) {
						PSMenu.StextNext(PSGame.getString("Hospital_Dead", "<player>", getParty().getMember(cureWho-1).getName()));
					}
					else {
						int hpMpDiff = (getParty().getMember(cureWho-1).getMaxHp() - getParty().getMember(cureWho-1).getHp()) + 
									(getParty().getMember(cureWho-1).getMaxMp() - getParty().getMember(cureWho-1).mp);
						if(hpMpDiff <= 0) {
							PSMenu.StextNext(PSGame.getString("Hospital_Player_Healthy", "<player>", getParty().getMember(cureWho-1).getName()));
						} else {
							int cost = hpMpDiff * costMultiplier;
							int optCure = PSMenu.PromptNext(PSGame.getString("Hospital_Cost", "<number>", Integer.toString(cost)), getYesNo());
							if(optCure == 1) { // Yes
								if(getParty().mst >= cost) {
									getParty().mst-= cost;
									mstBox.updateText(0, "MST " + getParty().mst);
									getParty().getMember(cureWho-1).heal();
									PSGame.playSound(PS1Sound.CURE);
									PSMenu.StextNext(PSGame.getString("Hospital_Cure"));
								} else {
									PSMenu.StextLast(PSGame.getString("Shop_Not_Enough_Money"));
									PSMenu.instance.pop(); // mstBox
									return;
								}
							}						
						}
					}
					
					cureWho = PSMenu.PromptNext(PSGame.getString("Hospital_Other"), getParty().listMembers());
				}
			}
			
		}
		PSMenu.StextLast(PSGame.getString("Hospital_End"));
		PSMenu.instance.pop(); // mstBox		
	}
	
	// Through Gothic
	public static void toSpaceportSecret() {
		mapswitch(City.SPACEPORT1, 2, 18);
	}
	
	public static void spaceportTransition(int direction, int whenStop, City destiny, int gotox, int gotoy) {
		setentitiespaused(true);
		PSMenu.menuOff();
		PSGame.transportOff();
		Entity e = null;
		int count = 0;
		while(true) {
			
			if(direction == Entity.WEST && entities.get(player).getx()/16 < whenStop) break;
			if(direction == Entity.EAST && entities.get(player).getx()/16 > whenStop) break;
			if(direction == Entity.NORTH && entities.get(player).gety()/16 < whenStop) break;
			if(direction == Entity.SOUTH && entities.get(player).gety()/16 > whenStop) break;
			if(b1) break;
			
			for(int j=0;j<getParty().partySize();j++) {
				if(j==0) {
					e = entities.get(player);
				}
				else if (e!=null) {
					e = e.getFollower();
				}
				
				if(e!=null && count==0) { // setup it first time
					e.setFace(direction);
					e.setSpecframe(e.getChr().getIdle()[e.getFace()]);
					
					if(direction == Entity.SOUTH || direction == Entity.NORTH) { // adjust X position
						e.incx(4);
					}
					
				}
				if(e!=null && count > j*Entity.FOLLOWDISTANCE) { // leave FOLLOWDISTANCE between each char 
					switch(direction) {
						case Entity.WEST: e.incx(-1); break;
						case Entity.EAST: e.incx(1); break;
						case Entity.NORTH: e.incy(-1); break;
						case Entity.SOUTH: e.incy(1); break;
					}
				}
			}
			screen.render();
			showpage();
			count++;
		}
		PSMenu.menuOn();
		PSGame.mapswitch(destiny, gotox, gotoy);
	}

	static int tmpEntSpeed;
	
	public static void EntStart() {
		PSMenu.menuOff();
		if(event_entity >= 0 && event_entity < entities.size()) {
			tmpEntSpeed = entities.get(event_entity).getSpeed();
			entities.get(event_entity).setSpeed(0);
		}
		pauseplayerinput();	
	}

	public static void EntFinish() {
		PSMenu.menuOn();
		if(event_entity >= 0 && event_entity < entities.size()) {
			entities.get(event_entity).setSpeed(tmpEntSpeed);
		}
		unpauseplayerinput();
	}	

	public static void warp(int i, int j, boolean rendermap) {
		screen.fadeOut(30, rendermap);
		entities.get(player).setxy(i*16, j*16);
	}
	
	
	public static String getString(String s) {
		try {
			return gameData.rb.getString(s);
		} catch(Exception e) {
			log.error("String " + s + " not found.");
			return s; 
		}
	}

	public static String getString(String mainString, String var1, String replace1) {
		return getString(mainString).replaceAll(var1, replace1);
	}
	
	public static String getString(String mainString, String var1, String replace1,	String var2, String replace2) {
		return getString(mainString).replaceAll(var1, replace1).replaceAll(var2, replace2);
	}
	public static String getString(String mainString, String var1, String replace1,	String var2, String replace2, String var3, String replace3) {
		return getString(mainString).replaceAll(var1, replace1).replaceAll(var2, replace2).replaceAll(var3, replace3);
	}
	
	
	public static String[] getYesNo() {
		return new String[]{getString("Menu_Choice_Yes"), getString("Menu_Choice_No")};
	}

	// Put party together
	public static void regroup(int xAdjust, int yAdjust) {
		if(TEST_SIMULATION || entities == null || player==-1 || entities.get(player) == null) {
			return;
		}
		int x = (entities.get(player).getx()+16*xAdjust)/16;
		int y = (entities.get(player).gety()+16*yAdjust)/16;
		entities.get(player).setxy(x*16, y*16);
		entities.get(player).setFace(Entity.SOUTH);
	}

	public static boolean hasFlag(Flags flag) {
		return gameData.flags.contains(flag);
	}

	public static void setFlag(Flags flag) {
		gameData.flags.add(flag);
	}
	
	public static Party getParty() {
		if(gameData == null) {
			return null;
		}
		return gameData.getParty();
	}

	public static int getDungeonFace() {
		return gameData.dungeonFace;
	}
	
	public static City getToCity() {
		return toCity;
	}

	public static void setToCity(City toCity) {
		PSGame.toCity = toCity;
	}

	public static City getFromCity() {
		return fromCity;
	}

	public static void setFromCity(City fromCity) {
		PSGame.fromCity = fromCity;
	}

	public enum Trapped {NO_TRAP, EXPLOSION, ARROW};
	
	/** This method starts a chest routine, if it's not previously opened
	 */
	public static void chestFlag(Chest flag, int mesetas, Trapped trapped, Item item) {
		if(gameData.chestFlags.contains(flag)) {
			return;
		} else {
			if(chest(mesetas, trapped, item)) {
				gameData.chestFlags.add(flag);
			}
		}
	}
	
	public static boolean chest(int mesetas, Trapped trapped, Item item) {
		PSMenu.menuOff();
		boolean chestOpen = false;
		MenuCHR chest = new MenuCHR(128, 112, PSGame.getCHR(PS1CHR.CHEST)); // TODO Make coordinates variable
		PSMenu.instance.push(chest);
		
		PSMenu.StextFirst(getString("Chest_Found"));
		
		List<PartyMember> membersWhoKnowTrap = new ArrayList<PartyMember>();
		for(PartyMember p: getParty().getMembers()) {
			if(p.spells.contains(PS1Spell.TRAP)) {
				membersWhoKnowTrap.add(p);
			}
		}
		
		int openChest = 0;
		boolean trapSpell = false;
		if(membersWhoKnowTrap.size() > 0) {
			openChest = PSMenu.PromptNext(getString("Chest_Open"), 
					new String[]{getString("Menu_Choice_Yes"), getString("Spell_Untrap"), getString("Menu_Choice_No")});
			if(openChest == 2) {
			
				PartyMember chosenMember = null;
				chosenMember = membersWhoKnowTrap.get(0);
				int counter = 0;
				while(chosenMember.getMp() < PS1Spell.TRAP.getMpCost() && counter < membersWhoKnowTrap.size()-1) {
					chosenMember = membersWhoKnowTrap.get(++counter);
				}
				
				PSEffect effect = PSLibSpell.prepareSpell(PS1Spell.TRAP, chosenMember);
				if(effect != null) {
					effect.setEffect(Effect.TRAP_CHEST);
					PSLibSpell.castSpell(PS1Spell.TRAP, effect);
					trapSpell = true;
				}
				else {
					openChest = 3;
				}
			}
		} else {
			openChest = PSMenu.PromptNext(getString("Chest_Open"), PSGame.getYesNo());			
		}
				
		if(openChest == 1 || (openChest==2 && membersWhoKnowTrap.size() > 0)) {
			PSGame.playSound(PS1Sound.CHEST);

			if(trapSpell) {
				if(trapped == Trapped.NO_TRAP) {
					PSMenu.StextLast(getString("Dungeon_No_Trap"));
				} else {
					PSMenu.StextLast(getString("Dungeon_Trap"));
				}
				chest.animate(MenuType.State.ANIM1);
			}
			else if(trapped == Trapped.NO_TRAP) {
				chest.animate(MenuType.State.ANIM1);
			}
			else if(trapped == Trapped.EXPLOSION) {
				chest.animate(MenuType.State.ANIM1);
				PSMenu.instance.waitAnimationEnd(chest);
				
				chest.animate(MenuType.State.ANIM2);
				PSGame.playSound(PS1Sound.TRAP_EXPLOSION);				
				// Damage all alive members
				for(PartyMember member: PSGame.getParty().getMembers()) {
					if(member.getHp() > 0) {
						member.setHp(Math.max(1, member.getHp() - random(10, 25) - ((member.getMaxHp()*random(20, 30))/100)));
					}
				}
			}
			else if(trapped == Trapped.ARROW) {
				chest.animate(MenuType.State.ANIM1);
				PSMenu.instance.waitAnimationEnd(chest);	

				chest.animate(MenuType.State.ANIM3);
				PSGame.playSound(PS1Sound.TRAP_ARROW);
				
				// Damage one alive member
				PartyMember randomMember = PSGame.getParty().getMember(random(0, PSGame.getParty().getMembers().size()-1));
				while(randomMember.getHp() <= 0) {
					randomMember = PSGame.getParty().getMember(random(0, PSGame.getParty().getMembers().size()-1));
				}
				randomMember.setHp(Math.max(1, randomMember.getHp() - random(5, 15) - ((randomMember.getMaxHp()*random(10, 15))/100)));
			}
 				
			PSMenu.instance.waitAnimationEnd(chest);
			
			chestOpen = true;
			if(mesetas > 0) {
				if(item==null) {
					PSMenu.StextLast(getString("Chest_Mesetas", "<number>", Integer.toString(mesetas)));
				} else {
					PSMenu.StextNext(getString("Chest_Mesetas", "<number>", Integer.toString(mesetas)));
				}
				getParty().mst+=mesetas;
			}
			if(item != null) {
				PSMenu.StextLast(getString("Chest_Item", "<item>", item.getName()));
				if(item.type == ItemType.QUEST) {
					getParty().addQuestItem(item);
				} else {
					chestOpen = getParty().checkForFullAndAddItem(item);
				}
			}
			if(mesetas == 0 && item==null) {
				PSMenu.StextLast(getString("Chest_Empty"));
			}
		}
		
		PSMenu.instance.pop();
		PSMenu.menuOn();
		return chestOpen;
	}
	
	public static boolean loadGame() {
		fileChooser.setFileFilter(new FileNameExtensionFilter(".SAV Files", "sav"));
		fileChooser.setApproveButtonText(getString("Menu_Load"));

		int returnVal = fileChooser.showOpenDialog(Phantasy.getGUI()); 		
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			File file = fileChooser.getSelectedFile();
			Object loaded = GameData.load(file);
			if(loaded != null) {
				gameData = (GameData) loaded;
				GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", gameData.locale);
				if(getCurrentDungeon() != Dungeon.NONE) {
					mapswitch(getCurrentDungeon(), gameData.gotox, gameData.gotoy);
					currentDungeon.setAlreadyInside(true);
					return true;
				} 
				else if (gameData.current_city != null) {
					mapswitch(gameData.current_city, gameData.gotox, gameData.gotoy);
					return true;
				} 
				else {
					log.info("RBP\t" + gameData.onGroundVehicle);
					mapswitch(gameData.current_planet, gameData.gotox, gameData.gotoy);
					return true;
				}
				
				
			} else {
				PSMenu.Stext(getString("Menu_Load_Failed"));
			}
		}
		return false;
	}
	
	public static void saveGame() {
		//gameData.currentMap = current_map.getFilename();
		gameData.gotox = entities.get(player).getx()/16;
		gameData.gotoy = entities.get(player).gety()/16;

		if(getCurrentDungeon() != Dungeon.NONE) {
			if(!currentDungeon.getAlreadyInside()) {
				return;
			}
			gameData.dungeonFace = entities.get(player).getFace();
		}
		
		//http://docs.oracle.com/javase/tutorial/uiswing/components/filechooser.html
		fileChooser.setApproveButtonText(getString("Menu_Save"));
		fileChooser.setFileFilter(new FileNameExtensionFilter(".SAV Files", "sav"));

		int returnVal = fileChooser.showSaveDialog(Phantasy.getGUI());
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			File file = fileChooser.getSelectedFile();
			String filePath = file.getPath();
			if(!filePath.toLowerCase().endsWith(".sav"))
			{
				file = new File(filePath + ".sav");
			}
		
			GameData.save(gameData, file);
			PSMenu.Stext(getString("Menu_Save_Success"));
		}
	}

	public static boolean findItemWithParty(OriginalItem inventoryItem, boolean remove) {
		for(PartyMember pm: PSGame.getParty().getMembers()) {
			if(pm.getItems().contains(getItem(inventoryItem))) {
				if(remove) {
					pm.getItems().remove(getItem(inventoryItem));
				}
				return true;
		
			}
		}
		return false;
	}

	public static void spaceshipRoutineStart(City from, City to) {
		setFromCity(from);
		setToCity(to);

		switch(getFromCity()) {
			case CAMINEET:
				mapswitchShip(Planet.PALMA, 70, 46);
				break;
			case PASEO:
				mapswitchShip(Planet.MOTAVIA, 79, 43);
				break;
			case GOTHIC:
				mapswitchShip(Planet.PALMA, 52, 56);
				break;
			case UZO:
				mapswitchShip(Planet.MOTAVIA, 92, 64);
				break;
			case SKURE:
				mapswitchShip(Planet.DEZORIS, 171, 72);
				break;
			default:
		}
	}
	
	public static void spaceshipRoutineAnimation(String chrSpaceship) {
		
		PSGame.getParty().embark(getgotox(), getgotoy(), chrSpaceship);
		playSound(PS1Sound.SPACESHIP);
		setentitiespaused(true);
		PSMenu.menuOff();
		PSGame.transportOff();
		Entity e = entities.get(player);
		
		int velocity = 0;
		while(velocity++ < 320) {
			
			if(velocity > 150 && b1) {
				unpress(1);
				break;
			}
			
			e.incy(-(velocity/25));
			if(velocity % 5 == 0 || velocity % 16 == 0) {
				velocity++;
			}
			
			screen.render();

			if(velocity > 300) {
				setlucent(5 * (320 - velocity));
				screen.paintBlack();
				setlucent(0);	
			}
			
			showpage();
		}
		
		setgotoxy(9, 93);
		playMusic(PS1Music.VEHICLE);
		map("space/Space.map");
	}
	
	public static void spaceshipRoutineEnd() {
		
		if(getFromCity() == City.CAMINEET || getFromCity() == City.PASEO) {
			PSGame.getParty().embark(getgotox(), getgotoy(), "space/spaceship1.chr");
		}
		else {
			PSGame.getParty().embark(getgotox(), getgotoy(), "space/spaceship2.chr");
		}
		screen.fadeIn(30, true);
		int count = 0;
		while(count++ < 300) {
			
			if(b1) {
				unpress(1);
				break;
			}
			if(count > 15) {
				entities.get(player).incy(-5);
			}
			screen.render();
			showpage();
		}
		
		switch(getToCity()) {
			case CAMINEET: 
				mapswitch(City.SPACEPORT1,7,6);
				break;
			case PASEO: 
				PSGame.gameData.visitedCities.add(City.PASEO);
				mapswitch(City.SPACEPORT2,17,18);
				break;
			case GOTHIC: 
				mapswitch(City.GOTHIC,4,21);
				break;
			case UZO: 
				mapswitch(City.UZO,30,19);
				break;
			case SKURE: 
				PSGame.gameData.visitedCities.add(City.SKURE);
				mapswitch(City.SKURE_ENTRANCE, 20, 14);
				break;
			default:
		}
	}

	public static Dungeon getCurrentDungeon() {
		if(gameData == null || gameData.current_dungeon == null)  {
			return Dungeon.NONE;
		}
		return gameData.current_dungeon;
	}
	
	public static String format(Integer value, int len) {
		return format(Integer.toString(value), len, false);
	}

	public static String format(String string, int len, boolean alignLeft) {
		for(int i=string.length(); i<len; i++) {
			if(alignLeft)
				string = string + " ";
			else
				string = " " + string;
		}
		return string;
	}	
	
	
	
	public static void hapsbyRoutine(City city) {
		
		int numCity = 0;
		switch(city) {
			case GOTHIC: numCity = 1; break;
			case UZO: numCity = 2; break;
			case SKURE: numCity = 3; break;
			default:
		}
		
		String options[] = new String[]{	
				getString("City_Gothic"),
				getString("City_Uzo"),
				getString("City_Skure")};
		int opt = 0;
		while(true) {
			opt = PSMenu.PromptNext(getString("Hapsby_Travel"), options);
			if(opt == 0) {
				break;
			}
			if(opt == numCity) {
				switch (city) {
					case GOTHIC: PSMenu.StextNext(getString("Hapsby_Already_Gothic"));break;
					case UZO: PSMenu.StextNext(getString("Hapsby_Already_Uzo"));break;
					case SKURE: PSMenu.StextNext(getString("Hapsby_Already_Skure"));break;
					default:
				}
			}
			else if(opt == 1) {
				if(PSMenu.PromptNext(getString("Hapsby_Choice_Gothic"), getYesNo()) == 1) {
					break;
				}
			}
			else if(opt == 2) {
				if(PSMenu.PromptNext(getString("Hapsby_Choice_Uzo"), getYesNo()) == 1) {
					break;
				}
			}
			else if(opt == 3) {
				if(PSMenu.PromptNext(getString("Hapsby_Choice_Skure"), getYesNo()) == 1) {
					break;
				}
			}
		}

		if (opt!=0) {
			switch(opt) {
				case 1: spaceshipRoutineStart(city, City.GOTHIC);break;
				case 2: spaceshipRoutineStart(city, City.UZO);break;
				case 3: spaceshipRoutineStart(city, City.SKURE);break;
					default:
			}
		}
	}

	public static void gameOverRoutine() {
		Script.stopmusic();
		PSGame.playMusic(PS1Music.GAMEOVER);
		if(PSGame.getParty().getMembers().size() > 1) {
			PSMenu.StextNext(PSGame.getString("Battle_Lost"));
		}
		PSMenu.StextLast(PSGame.getString("Battle_End_Game", "<player>", PSGame.getParty().getMember(0).getName()));
		PSMenu.setMapOff();
		mapswitch("Title.map", 0, 0, false);
	}

	public static boolean checkAlive() {
		for(PartyMember member: getParty().getMembers()) {
			if(member.hp > 0) {
				return true;
			}
		}
		return false;
	}

	// For Lava and Gas
	public static void damageParty(int damage, Scene scene) {
		// FLASH EFFECT
		VImage tempScreen = new VImage(screen.width, screen.height);
    	tempScreen.blit(0, 0, screen);
   		screen.rectfill(0, 0, screen.width, screen.height, Color.WHITE);
   		Script.showpage();
   		screen.blit(0, 0, tempScreen);
   		Script.showpage();

   		boolean sceneStarted = false;
   		for(PartyMember p: PSGame.getParty().getMembers()) {
   			if(p.getHp() > 0) {
   				if(p.getHp() <= damage) {
   					p.setHp(0);
   					if(!sceneStarted) {
   						PSMenu.startScene(scene, SpecialEntity.NONE);
   	   					sceneStarted = true;
   					}
   					PSMenu.StextLast(PSGame.getString("Battle_Player_Died", "<player>", p.getName()));
   				}
   				else {
   					p.setHp(p.getHp() - damage);
   				}
   			}
   		}
		if(sceneStarted) {
			PSMenu.endScene();
			
			if(!PSGame.checkAlive()) {
				PSGame.gameOverRoutine();
			}
			else if (!gameData.onGroundVehicle){
				PSGame.getParty().reallocate();
			}
		}
	}

	public static VImage getImage(Scene scene) {
		return getImage(PS1Image.valueOf(scene.name()));
	}
	public static VImage getImage(PS1Image image) {
		if(image == null || imageLIB == null) {
			log.error("Image or imageLIB is null.");
			return null;
		}
		if(!imageLIB.containsKey(image)) {
			imageLIB.put(image, new VImage(load(image.getUrl())));
		}
		return imageLIB.get(image);
	}
	
	public static CHR getCHR(PS1CHR anim) {
		if(anim == null || animLIB == null) {
			log.error("Anim or animLIB is null.");
			return null;
		}
		try {
			if(!animLIB.containsKey(anim)) {
				animLIB.put(anim, CHR.loadChr(load(anim.getUrl())));
			}
			return animLIB.get(anim);
		} catch(Exception e) {
			log.error("Error loading CHR.");
			return null;
		}

	}
	

	public static void getOutOfCurrentZone() {
		if(Script.TEST_SIMULATION) {
			return;
		}
		int curx = entities.get(player).getx()/16;
		int cury = entities.get(player).gety()/16;
		int curz = Script.event_zone;

		if(current_map.getzone(curx, cury) != curz) {
			// Do nothing
		} else if(current_map.getzone(curx, cury+1) != curz) {
			cury = cury + 1;
		} else if(current_map.getzone(curx-1, cury+1) != curz) {
			curx = curx - 1;
			cury = cury + 1;
		} else if(current_map.getzone(curx-1, cury) != curz) {
			curx = curx - 1;
		} else if(current_map.getzone(curx-1, cury-1) != curz) {
			curx = curx - 1;
			cury = cury - 1;
		} else if(current_map.getzone(curx, cury-1) != curz) {
			cury = cury - 1;
		} else if(current_map.getzone(curx+1, cury-1) != curz) {
			curx = curx + 1;
			cury = cury - 1;
		} else if(current_map.getzone(curx+1, cury) != curz) {
			curx = curx + 1;
		} else if(current_map.getzone(curx+1, cury+1) != curz) {
			curx = curx + 1;
			cury = cury + 1;
		}
		entities.get(player).setxy(curx*16, cury*16);
	}	

	public static void languageMenu(int posx, int posy) {
		PSMenu.instance.push(PSMenu.instance.createPromptBox(posx, posy, 
				new String[]{	PSGame.getString("Title_Options_Language_English_Ext"),
								PSGame.getString("Title_Options_Language_English"),
								PSGame.getString("Title_Options_Language_Portuguese_Ext"),
								PSGame.getString("Title_Options_Language_Portuguese"),
								//PSGame.getString("Title_Options_Language_French")
								}, true));		
		int opt = PSMenu.instance.waitOpt(Cancellable.TRUE);
		
		switch(opt) {
		case 0: 
			PSGame.gameData.locale = new Locale("en", "US");
			GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", PSGame.gameData.locale);
			break;
		case 1: 
			PSGame.gameData.locale = new Locale("se");
			GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", PSGame.gameData.locale);
			break;
		case 2: 
			PSGame.gameData.locale = new Locale("pt", "BR");
			GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", PSGame.gameData.locale);
			break;
		case 3: 
			PSGame.gameData.locale = new Locale("tt");
			GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", PSGame.gameData.locale);
			break;
		case 4: 
			PSGame.gameData.locale = new Locale("fr");
			GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", PSGame.gameData.locale);
			break;
		case 5: 
			PSGame.gameData.locale = new Locale("de");
			GameData.rb = ResourceBundle.getBundle(BASE_FOLDER + "/lang/Script", PSGame.gameData.locale);
			break;
			
		default:
			break;
		}
		PSMenu.instance.pop();
	}

	public static void trapRoutine(Trap trap, Trap infoTrap, int warpx, int warpy) {
		// If cast spell
		if(currentDungeon.getTrapEffect()) {
		
			// Disarm trap
			if(!gameData.trapFlags.contains(trap)) {
				PSMenu.Stext(getString("Dungeon_Trap"));	
				gameData.trapFlags.add(trap);
				currentDungeon.setTrapEffect(false);
			}
			return;
		}
		
		// If didn't cast spell		
		if(gameData.trapFlags.contains(trap)) {
			return;
		} 
		else if(gameData.trapFlags.contains(infoTrap)) {
			PSMenu.Stext(getString("Dungeon_Trap_Info"));
			currentDungeon.turnBack();
		}
		else {
			gameData.trapFlags.add(infoTrap);
			PSGame.playSound(PS1Sound.TRAP_FALL);
			PSGame.gameData.dungeonFloor--;
			PSGame.warp(warpx, warpy, false);
			currentDungeon.setZoneCheck();
		}
	}

	// Allocate on Transport or normal party (called by Palma, Motavia and Dezoris)
	public static void planetAllocate() {
		if(PSGame.gameData.onGroundVehicle) {
			PSGame.gameData.onGroundVehicle = false;
			PSGame.verifyTransport();
		} else if(PSGame.gameData.onWaterVehicle) {
			PSGame.gameData.onWaterVehicle = false;
			PSGame.verifyTransport();
		}
		else {
			PSGame.getParty().allocate(PSGame.getgotox(), PSGame.getgotoy());
		}
	}

	public static void randomBattle(Scene scene, GenericEnemy[] enemies) {
		
		// Diminish battle frequency when on transport
		if(isOnTransport() && random(1, 2) == 1) {
			return;
		}
		
		Enemy enemy;
		int rand = random(0, enemies.length-1);
		enemy = PSGame.getEnemy(enemies[rand]);
		if(enemies[rand] instanceof PS1Enemy) {
			PSGame.gameData.visitedEnemies.add((PS1Enemy) enemies[rand]);
		}

		// Remove easy fights when on transport
		if(isOnTransport() && enemy.getMaxHp() < 40) {
			return;
		}
		
		int num = random(1, Math.min(enemy.getMaxNum(), PSGame.getParty().getMembers().size()*2));
		// Max number of dungeon enemies = 4
		if(getCurrentDungeon() != Dungeon.NONE && num > 4) {
			num = 4;
		}
		
		PSBattle battle = new PSBattle();
		battle.battleScene(scene, enemy, num);
	}

	public static void fixedBattle(Scene scene, GenericEnemy[] enemies) {

		// Diminish battle frequency when on transport
		if(isOnTransport() && random(1, 2) == 1) {
			return;
		}
		
		PSBattle battle = new PSBattle();
		Enemy fenemies[] = new Enemy[enemies.length];
		for(int i=0; i<enemies.length; i++) {
			fenemies[i] = PSGame.getEnemy(enemies[i]);
			if(enemies[i] instanceof PS1Enemy) {
				PSGame.gameData.visitedEnemies.add((PS1Enemy) enemies[i]);
			}
		}
		battle.battleScene(scene, fenemies);
	}

	public static void endGameRoutine() {
		PSMenu.startScene(Scene.BAYA, SpecialEntity.NONE);
		playMusic(PS1Music.ENDING);

		PSMenu.instance.back.changeColor(new Color(PSMenu.instance.back.readPixel(0, 0)), new Color(0, 10, 255));
		for(int i=0; i<24;i++) {
			showpage();	PSMenu.instance.waitDelay(3);
			PSMenu.instance.back.changeColor(new Color(0, (i+1)*10, 255), new Color(0, (i+2)*10, 255));
		}
		
		PSMenu.Stext(getString("Cinematic_Ending_1"));

		PSMenu.instance.back = new VImage(screen.width, screen.height); //.paintBlack();
		PSMenu.startScene(Scene.CORRIDOR, SpecialEntity.NONE);
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{PSGame.getString("Cinematic_Ending_2")});
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ODIN), new String[]{PSGame.getString("Cinematic_Ending_3")});
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_NOAH), new String[]{PSGame.getString("Cinematic_Ending_4")});
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_MYAU), new String[]{PSGame.getString("Cinematic_Ending_5")});
		
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{PSGame.getString("Cinematic_Ending_6")});
		PSMenu.endScene();
		
		PSMenu.startScene(Scene.ENDING, SpecialEntity.NONE);
		PSMenu.instance.waitAnyButton();
		PSMenu.endScene();
		
		PSMenu.setMapOff();
		mapswitch("Title.map", 0, 0, false);
	}

	public static int getDungeonDelay() {
		return gameData == null ? 3: gameData.dungeonDelay;
	}

	public static boolean getDisplayMessages() {
		return gameData == null ? true: gameData.battleInformation;
	}

	/*public static void musicMenu(int posx, int posy) {
		PSMenu.instance.push(PSMenu.instance.createPromptBox(posx, posy, 
				new String[]{	PSGame.getString("Title_Options_Music_Normal"),
								PSGame.getString("Title_Options_Music_FM_Chip")}, true));		
		int opt = PSMenu.instance.waitOpt(Cancellable.TRUE);
		
		switch(opt) {
		case 0: 
			PSGame.gameData.fmMusic = false;
			findAndPlayMusic();
			break;
		case 1: 
			PSGame.gameData.fmMusic = true;
			findAndPlayMusic();
			break;
			
		default:
			break;
		}
		PSMenu.instance.pop();
	}*/
	
	
	
}
