package demos.ps.dungeons;

import static core.Script.current_map;
import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.getYesNo;
import demos.ps.PSDungeon;
import demos.ps.oo.Enemy;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.DezoType;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Prison {

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.startDungeon();
	}
	
	public static void room1() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_1"));
		PSMenu.endScene();
	}
	public static void room2() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.DEZO, DezoType.REGULAR);
		if(PSMenu.Prompt(getString("Gate_Baya_Malay_Dezorian"), getYesNo()) == 1) {
			PSMenu.StextLast(getString("Gate_Baya_Malay_DezorianYes"));
		} else {
			PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_DezorianNo"));
		}
		PSMenu.endScene();
	}

	
	public static void room3() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_2"));
		PSMenu.endScene();
	}
	public static void room4() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_3"));
		PSMenu.endScene();
	}
	public static void room5() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.VILLA_WMN_BLOND, EntityClothes.BLUE);
		PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Woman_1"));
		PSMenu.endScene();
	}
	public static void room6() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_4"));
		PSMenu.endScene();
	}
	public static void room7() {
		PSMenu.startScene(Scene.DUNGEON, EntityType.CITY_MAN_BLUE, EntityClothes.BLUE);
		PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Man_5"));
		PSMenu.endScene();
	}
	public static void oldman() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.OLDMAN);
		PSMenu.StextLast(PSGame.getString("Gate_Baya_Malay_Prisoner"));
		PSMenu.endScene();
	}

	public static void stairs_down() {
		PSGame.warp(2, 19, false);
	}
	public static void stairs_up() {
		PSGame.warp(8, 19, false);
	}


	public static void robot() {
		if(!PSGame.hasFlag(Flags.MONSTER_PRISON_ROBOTCOP)) {
			BattleOutcome outcome = BattleOutcome.TALK;
			
			Enemy robotcop = PSGame.getEnemy(PS1Enemy.ROBOTCOP);
			PSMenu.startScene(Scene.CORRIDOR, robotcop.getChr());
	
			if(PSMenu.Prompt(getString("Gate_Baya_Malay_Robot"), getYesNo()) == 1) {
				PSMenu.StextLast(getString("Gate_Baya_Malay_RobotYes"));
				PSGame.warp(11, 21, false);
			}
			else {
				PSMenu.StextLast(getString("Gate_Baya_Malay_RobotNo"));
				PSBattle battle = new PSBattle();
				outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.ROBOTCOP), 3); // Changed to 3
			}
	
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_PRISON_ROBOTCOP);
			}
		
			PSMenu.endScene();
		}
	}	
	
	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,105, 35);
	}
	public static void nextArea() {
		PSGame.mapswitch(Planet.PALMA,105,32);
	}
}
