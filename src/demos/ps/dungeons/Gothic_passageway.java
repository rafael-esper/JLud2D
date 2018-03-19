package demos.ps.dungeons;

import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Gothic_passageway {
	
	public static void startmap() {
		
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE});
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE});
		dungeon.startDungeon();
	}
	
	public static void exit() {
		PSGame.toSpaceportSecret();
	}
	public static void gothic() {
		PSGame.mapswitch(City.GOTHIC,31,8);
	}	
	public static void assistant() {
		if(PSGame.hasFlag(Flags.GOT_ASSISTANT)) {
			PSMenu.startScene(Scene.DUNGEON, SpecialEntity.NONE);
			PSMenu.instance.waitAnyButton();
		} else {
			PSMenu.startScene(Scene.DUNGEON, EntityType.CITY_MAN_BLOND, EntityClothes.WHITE);
			if(!PSGame.hasFlag(Flags.LUVENO_FREE)) {
				PSMenu.StextLast(PSGame.getString("Spaceport_Passage_Assistant"));
			} else {
				PSMenu.StextLast(PSGame.getString("Spaceport_Passage_Assistant_pos_Luveno"));
				PSGame.setFlag(Flags.GOT_ASSISTANT);
			}
		}
		PSMenu.endScene();
	}
}
