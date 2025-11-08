package demos.ps.oo;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.EnumSet;
import java.util.Locale;
import java.util.ResourceBundle;

import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.ScreenSize;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSLibEnemy.PS1Enemy;

/**
 * Class responsible for:
 * - Storing data related to an instance of a PS Game, like: Game type, Party, Flags, chosen Locale
 * - Providing functions for saving and loading a game
 */

public class GameData implements Serializable {

	public static final long serialVersionUID = -1837320767426406783L;
	
	// Options
	int musicVolume = 30; // 0-100
	int soundVolume = 50; // 0-100
	int dungeonDelay = 4; // varies between 1-4
	boolean battleInformation = true;
	Locale locale;
	static ResourceBundle rb;
	//boolean fmMusic = false;

	
	public EnumSet<Flags> flags = EnumSet.noneOf(Flags.class);
	public EnumSet<Chest> chestFlags = EnumSet.noneOf(Chest.class);
	public EnumSet<Trap> trapFlags = EnumSet.noneOf(Trap.class);
	public EnumSet<City> visitedCities = EnumSet.noneOf(City.class);
	public EnumSet<PS1Enemy> visitedEnemies = EnumSet.noneOf(PS1Enemy.class);
	
	private GameType gameType;
	private ScreenSize screenSize;
	
	public Planet current_planet;
	public Dungeon current_dungeon;
	public City current_city;
	
	private Party party;

	public boolean onWaterVehicle;
	public boolean onGroundVehicle;

	public int gotox, gotoy;
	public int dungeonFace;
	public int dungeonFloor;

	public boolean enableCheats;
	
	public Party getParty() {
		return party;
	}
	
	public void setParty(Party party) {
		this.party = party;
	}


	public GameType getGameType() {
		return gameType;
	}
	public void setGameType(GameType gameType) {
		this.gameType = gameType;
	}
	public ScreenSize getScreenSize() {
		return screenSize;
	}
	public void setScreenSize(ScreenSize screenSize) {
		this.screenSize = screenSize;
	}
	
	
	public static void save(Object object, File file) {

	    try { 
		FileOutputStream saveFile = new FileOutputStream(file);
		ObjectOutputStream stream = new ObjectOutputStream(saveFile);

		stream.writeObject(object);

		stream.close();
	    } catch (Exception e) {
	    	e.printStackTrace();
	    }
    }
	
	public static Object load(File file) {

		Object object = null;
		
		try {
			FileInputStream restFile = new FileInputStream(file);
			ObjectInputStream stream = new ObjectInputStream(restFile);

			object = stream.readObject();

			stream.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return object;
	}

	
}


 