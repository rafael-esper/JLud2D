package demos.ps.dungeons;

import static demos.ps.oo.PSGame.getItem;
import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibItem.OriginalItem;

public class Warehouse {

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.WAREHOUSE_CHEST1, 50, Trapped.NO_TRAP, null);
	}
	
	public static void chestKey() {
		if(PSGame.hasFlag(Flags.INFO_KEY)) {
			PSGame.chestFlag(Chest.WAREHOUSE_CHESTKEY, 0, Trapped.NO_TRAP, getItem(OriginalItem.Quest_Dungeon_Key));
		}
	}	
	
	public static void exit() {
		PSGame.mapswitch(City.CAMINEET,32,7);
	}
	
	public static void trap() {
		//PSGame.chestFlag(Chest.WAREHOUSE_CHEST1, 50, Trapped.EXPLOSION, null);
		
		// PSGame.randomBattle(Scene.CORRIDOR, new PS1Enemy[]{PS1Enemy.SWORM});
		//PSGame.trapRoutine(Trap.NAHARU_TRAP, Trap.INFO_NAHARU_TRAP, 11, 6);
	}
}
