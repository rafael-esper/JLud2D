package demos.ps.dungeons;

import static core.Script.current_map;
import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Trapped;

public class Abion_dungeon {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.ABION_CHEST1, 20, Trapped.NO_TRAP, null);
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.ABION_CHEST2, 30, Trapped.NO_TRAP, null);
	}

	public static void exit() {
		PSGame.mapswitch(City.ABION,7,16);
	}
	public static void dr_mad() {
		PSGame.mapswitch(City.ABION,21,16);
	}
	
}
