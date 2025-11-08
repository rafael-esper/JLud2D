package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibEnemy.PS1Enemy;

public class Dezo_cave4 {

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.WYVERN, PS1Enemy.SNOW_LION, PS1Enemy.BATALION});
		dungeon.startDungeon();
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,95,46);
	}
	public static void nextArea() {
		PSGame.mapswitch(Planet.DEZORIS,95,37);
	}
	public static void stairs_1_2() {
		PSGame.warp(7, 8, false);
	}
	public static void stairs_2_1() {
		PSGame.warp(3, 8, false);
	}
	public static void stairs_2_3() {
		PSGame.warp(8, 3, false);
	}
	public static void stairs_3_2() {
		PSGame.warp(8, 7, false);
	}



}
