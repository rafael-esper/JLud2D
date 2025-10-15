package demos.ps.dungeons;

import static core.Script.current_map;
import static demos.ps.oo.PSGame.getItem;
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
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Outcome;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Triada {

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.startDungeon();
	}
	
	public static void luveno() {
		if(!PSGame.hasFlag(Flags.LUVENO_FREE)) {
				PSMenu.startScene(Scene.DUNGEON, SpecialEntity.LUVENO);
		} else {
			PSMenu.startScene(Scene.DUNGEON, SpecialEntity.NONE);
		}
		
		if(!PSGame.hasFlag(Flags.LUVENO_INSIST_1)) {
			PSMenu.StextLast(getString("Triada_Luveno_1"));
			PSGame.setFlag(Flags.LUVENO_INSIST_1);
		} else if(!PSGame.hasFlag(Flags.LUVENO_INSIST_2)) {
			PSMenu.StextLast(getString("Triada_Luveno_2"));
			PSGame.setFlag(Flags.LUVENO_INSIST_2);
		} else if(!PSGame.hasFlag(Flags.LUVENO_FREE)) {
			if(PSMenu.Prompt(getString("Triada_Luveno_3"), getYesNo()) == 1) {
				PSMenu.StextLast(getString("Triada_Luveno_3Yes"));	
				PSGame.setFlag(Flags.LUVENO_FREE);
			} else {
				PSMenu.StextLast(getString("Triada_Luveno_3No"));	
			}
		
		} else {
			PSMenu.instance.waitAnyButton();	
		}
		
		PSMenu.endScene();
	}
	
	public static void man1() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		if(PSMenu.Prompt(getString("Triada_Man_1"), getYesNo()) == 1) {
			
			boolean foundCola = PSGame.findItemWithParty(OriginalItem.Inventory_Monomate, true);
			if(foundCola) {
				PSMenu.StextLast(getString("Triada_Man_1Yes"));				
			} else {
				PSMenu.StextLast(getString("Gothic_People_EntNotEnoughCola"));
			}
		} else {
			PSMenu.StextLast(getString("Triada_Man_1No"));	
		}

		PSMenu.endScene();
	}
	public static void man2() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.StextLast(PSGame.getString("Triada_Man_2"));
		PSMenu.endScene();
	}
	public static void man3() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		if(PSMenu.Prompt(getString("Triada_Man_3"), getYesNo()) == 1) {
			PSMenu.StextLast(getString("Triada_Man_3Yes"));	
		} else {
			PSMenu.StextLast(getString("Triada_Man_3No"));	
		}	
		PSMenu.endScene();
	}
	public static void man4() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		if(PSMenu.Prompt(getString("Triada_Man_4"), getYesNo()) == 1) {
			PSMenu.StextLast(getString("Triada_Man_4Yes"));	
		} else {
			PSMenu.StextLast(getString("Triada_Man_4No"));	
		}	
		PSMenu.endScene();
	}
	public static void man5() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.BEGGAR);
		PSMenu.StextLast(PSGame.getString("Triada_Man_5"));
		PSMenu.endScene();
	
	}
	public static void tarantul() {
		Enemy tarantul = PSGame.getEnemy(PS1Enemy.TARANTUL);
		PSMenu.startScene(Scene.CORRIDOR, tarantul.getChr());
		PSMenu.StextLast(PSGame.getString("Triada_Spider"));
		PSMenu.endScene(Outcome.FADE_DUNGEON);
	}

	public static void robot() {
		if(!PSGame.hasFlag(Flags.MONSTER_TRIADA_ROBOTCOP)) {
			BattleOutcome outcome = BattleOutcome.TALK;
			PSBattle battle = new PSBattle();
			
			Enemy robotcop = PSGame.getEnemy(PS1Enemy.ROBOTCOP);
			PSMenu.startScene(Scene.CORRIDOR, robotcop.getChr());
			if(PSMenu.Prompt(getString("Triada_Robot"), getYesNo()) == 1) {
				if(PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Road_Pass))) {
					PSMenu.StextLast(getString("Triada_RobotYes"));
				}
				else {
					PSMenu.StextLast(getString("Spaceport_People_Cop_YesLie"));
					outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.ROBOTCOP), 1);
				}
			}
			else {
				PSMenu.StextLast(getString("Triada_RobotNo"));
				outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.ROBOTCOP), 1);
			}
	
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_TRIADA_ROBOTCOP);
			}
			
			PSMenu.endScene();
		}
	}	
	
	public static void skeleton() {
		if(!PSGame.hasFlag(Flags.MONSTER_TRIADA_SKELETON)) {
			PSBattle battle = new PSBattle();
			BattleOutcome outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SKELETON), 3);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_TRIADA_SKELETON);
			}
		}
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,51,83);
	}
}
