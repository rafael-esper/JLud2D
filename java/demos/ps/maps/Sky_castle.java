package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.mapswitch;
import demos.ps.oo.Dungeon;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Sky_castle {

	public static void house1() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.GREEN);
		PSMenu.Stext(getString("Air_Castle_House_1"));
		PSMenu.endScene();
	}

	public static void house2() {
		PSMenu.startScene(Scene.BLUE_HOUSE, SpecialEntity.OLDMAN);
		PSMenu.Stext(getString("Air_Castle_House_2"));
		PSMenu.endScene();
	}

	public static void house3() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.GREEN);
		PSMenu.Stext(getString("Air_Castle_House_3"));
		PSMenu.endScene();
	}
	
	public static void house4() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
		PSMenu.Stext(getString("Air_Castle_House_4"));
		PSMenu.endScene();
	}

	public static void house5() {
		if(!PSGame.hasFlag(Flags.MONSTER_SKY_SERPENT)) {
			PSBattle battle = new PSBattle();
			BattleOutcome outcome = battle.battleScene(Scene.BLUE_HOUSE, PSGame.getEnemy(PS1Enemy.SERPENT), 1);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_SKY_SERPENT);
			}
		} else {
			PSMenu.startScene(Scene.BLUE_HOUSE, SpecialEntity.NONE);
			PSMenu.instance.waitAnyButton();
			PSMenu.endScene();
		}
		
		
	}

	public static void castle() {
		mapswitch(Dungeon.LASSIC_CASTLE);		
	}

	
	
}
