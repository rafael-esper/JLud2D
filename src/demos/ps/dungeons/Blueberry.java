package demos.ps.dungeons;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.MotaCape;
import demos.ps.oo.PSMenu.NecroType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import static core.Script.*;

public class Blueberry {

	private static final Logger log = LogManager.getLogger(Blueberry.class);

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.DRAINER_CRAB, PS1Enemy.WIGHT, PS1Enemy.SKULL_EN});
		dungeon.setRandomEnemies(1, new PS1Enemy[]{PS1Enemy.WIZARD, PS1Enemy.SPHINX, PS1Enemy.NESSIE});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.DRAINER_CRAB, PS1Enemy.WIZARD, PS1Enemy.DRAINER_CRAB});
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.SKULL_EN, PS1Enemy.RD_DRAGN, PS1Enemy.SKULL_EN});
		
		dungeon.startDungeon();
	}
	
	public static void exit() {
		PSGame.mapswitch(City.TONOE,29,23);
	}

	public static void stairup1() {
		PSGame.warp(20, 4, false);
	}
	
	public static void stairdown1() {
		PSGame.warp(4, 9, false);
	}
	
	public static void stairup2() {
		PSGame.warp(10, 1, false);
	}
	
	public static void stairdown2() {
		PSGame.warp(16, 11, false);
	}	

	public static void stairup3() {
		PSGame.warp(6, 1, false);
	}
	
	public static void stairdown3() {
		PSGame.warp(12, 11, false);
	}	

	public static void chest1() {
		PSGame.chestFlag(Chest.TONOE_MINE_CHEST1, 0, Trapped.NO_TRAP, null);
	}	
	public static void chest2() {
		PSGame.chestFlag(Chest.TONOE_MINE_CHEST2, 1000, Trapped.EXPLOSION, null);
	}	
	public static void chest3() {
		PSGame.chestFlag(Chest.TONOE_MINE_CHEST3, 1000, Trapped.ARROW, null);
	}	
	public static void chest4() {
		PSGame.chestFlag(Chest.TONOE_MINE_CHEST4, 0, Trapped.ARROW, null);
	}	
	public static void chest5() {
		PSGame.chestFlag(Chest.TONOE_MINE_CHEST5, 1000, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Trimate));
	}
	
	public static void man() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.NECRO, NecroType.ESPER);
		PSMenu.StextLast(PSGame.getString("Tonoe_Mines_Necro_Esper"));
		PSGame.setFlag(Flags.INFO_GOTHIC_NECRO);
		PSMenu.endScene();
	}
	public static void mota() {
		if(!PSGame.hasFlag(Flags.INFO_TONOE_DAUGHTER)) {
			PSMenu.startScene(Scene.DUNGEON, EntityType.MOTA_CUSTOM, MotaCape.YELLOW);
			PSMenu.StextLast(PSGame.getString("Tonoe_People_Rescue"));
			PSGame.setFlag(Flags.INFO_TONOE_DAUGHTER);
		}
		else {
			PSMenu.startScene(Scene.DUNGEON, SpecialEntity.NONE);
			PSMenu.instance.waitAnyButton();
		}
		PSMenu.endScene();
	}
	public static void nightmare() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.hasFlag(Flags.MONSTER_TONOE_SACCUBUS)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SACCUBUS), 1);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_TONOE_SACCUBUS);
			}
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.TONOE_MINE_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Armor_Laconian_Mail));
		}
		
	}
	
	
}
