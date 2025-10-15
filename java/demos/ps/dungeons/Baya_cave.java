package demos.ps.dungeons;

import static core.Script.current_map;
import demos.ps.PSDungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Planet;

public class Baya_cave {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.startDungeon();
	}
	
	public static void drmad() {
		// Nonsense: Dr.Mad is not here anymore
	}
	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,121,16);
	}
	public static void nextArea() {
		PSGame.mapswitch(Planet.PALMA,116,9);
	}

}
