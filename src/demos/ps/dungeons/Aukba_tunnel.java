package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSLibEnemy.PS1Enemy;

public class Aukba_tunnel {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.BL_SLIME, PS1Enemy.VAMPIRE_LORD, PS1Enemy.EVILHEAD, PS1Enemy.DEZO_PRIEST});
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.EVILHEAD, PS1Enemy.DEZO_PRIEST});
		dungeon.startDungeon();
	}
	
	public static void exit() {
		PSGame.mapswitch(City.AUKBA_ENTRANCE,13,14);
	}
	public static void aukba() {
		PSGame.mapswitch(City.AUKBA,21,21);
	}
	
}
