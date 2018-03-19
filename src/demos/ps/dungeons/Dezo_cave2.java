package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibEnemy.PS1Enemy;

public class Dezo_cave2 {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.ZOMBIE});
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.ZOMBIE, PS1Enemy.BATALION, PS1Enemy.ZOMBIE, PS1Enemy.ZOMBIE});
		dungeon.startDungeon();
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,159,86);
	}
	public static void nextArea() {
		PSGame.mapswitch(Planet.DEZORIS,150,80);
	}
	
}
