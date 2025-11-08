package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;

public class Dezo_cave3 {

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.WT_DRAGN});
		dungeon.startDungeon();
	}
	
	public static void chest() {
		PSGame.chestFlag(Chest.DEZO_CAVE3_CHEST, 0, Trapped.EXPLOSION, null);
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,145,70);
	}
	public static void nextArea() {
		PSGame.mapswitch(Planet.DEZORIS,143,60);
	}

}
