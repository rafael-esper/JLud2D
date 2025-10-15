package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibEnemy.PS1Enemy;

public class Dezo_cave_aukba {

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.WYVERN, PS1Enemy.SNOW_LION, PS1Enemy.BATALION});
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.LICH, PS1Enemy.BATALION});
		dungeon.startDungeon();
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,172,50);
	}
	public static void nextArea() {
		PSGame.mapswitch(Planet.DEZORIS,179,34);
	}

}
