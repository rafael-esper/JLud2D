package demos.ps.dungeons;

import static demos.ps.oo.PSGame.getItem;
import demos.ps.PSDungeon;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;

public class Prism_cave {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.TITAN, PS1Enemy.FROSTMAN, PS1Enemy.WT_DRAGN});
		dungeon.startDungeon();
	}
	
	public static void chest() {
		PSGame.chestFlag(Chest.PRISM_CAVE_CHEST1, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Magic_Hat));
	}
	
	public static void woman() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.VILLA_WMN_BLUE, EntityClothes.RED);
		PSMenu.Stext(PSGame.getString("Cave_Deep_Dezo_Woman"));
		PSMenu.endScene();
	}

	public static void titan() {
		if(!PSGame.gameData.chestFlags.contains(Chest.PRISM_CAVE_CHEST2)) {
			PSBattle battle = new PSBattle();
			BattleOutcome outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.CYCLOP), 2);
			if(outcome == BattleOutcome.WIN) {
				PSGame.chestFlag(Chest.PRISM_CAVE_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Aeroprism));
			}
		}
	}

	public static void exit() {
		PSGame.mapswitch(Planet.DEZORIS,71,86);
	}
}
