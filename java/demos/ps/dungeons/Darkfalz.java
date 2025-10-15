package demos.ps.dungeons;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.maps.Paseo;
import demos.ps.oo.City;
import demos.ps.oo.Enemy;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.Scene;

public class Darkfalz {

	private static final Logger log = LogManager.getLogger(Darkfalz.class);
	
	public static void startmap() {
		PSMenu.menuOn();
		PSDungeon dungeon = PSGame.currentDungeon;

		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP, PS1Enemy.RD_DRAGN});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.NESSIE, PS1Enemy.NANO_COP, PS1Enemy.SORCERER, PS1Enemy.MAGICIAN});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.NESSIE, PS1Enemy.NANO_COP, PS1Enemy.SORCERER, PS1Enemy.MAGICIAN});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP, PS1Enemy.NANO_COP});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.MAGICIAN});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.NESSIE, PS1Enemy.MAGICIAN});
		
		dungeon.startDungeon();
	}
	
	public static void trap1() {
		PSGame.trapRoutine(Trap.DARKFALZ_TRAP1, Trap.INFO_DARKFALZ_TRAP1, 25, 1);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.DARKFALZ_TRAP2, Trap.INFO_DARKFALZ_TRAP2, 16, 23);
	}
	public static void darkfalz() {
		PSMenu.setMapOff();
		PSGame.playMusic(PS1Music.DARKFALZ);
		PSMenu.startScene(Scene.BLACK, SpecialEntity.NONE);
		PSMenu.instance.waitDelay(200);
		PSBattle battle = new PSBattle();
		
		BattleOutcome outcome = battle.startBattle(new Enemy[]{PSGame.getEnemy(PS1Enemy.DARKFALZ)}, PS1Music.DARKFALZ);
		if(outcome == BattleOutcome.DEFEAT) {
			PSGame.gameOverRoutine();
		}
		else {
			PSMenu.instance.waitDelay(200);
			PSGame.setFlag(Flags.DEFEAT_DARKFALZ);
			Paseo.governor();
		}
		
		//PSMenu.endScene();
		
	}
	
	public static void exit() {
		PSGame.mapswitch(City.PASEO,20,7);
	}
}
