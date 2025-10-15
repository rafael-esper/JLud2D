package demos.ps.dungeons;

import static core.Script.current_map;
import static demos.ps.oo.PSGame.getItem;
import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.getYesNo;

import java.util.ArrayList;
import java.util.List;

import demos.ps.PSDungeon;
import demos.ps.oo.Battler;
import demos.ps.oo.City;
import demos.ps.oo.Enemy;
import demos.ps.oo.EnemyBattler;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Lassic_castle {
	

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP, PS1Enemy.GIANT, PS1Enemy.RD_DRAGN});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.WYVERN, PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.WYVERN, PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN});
		dungeon.setRandomEnemies(-3, new PS1Enemy[]{PS1Enemy.MANTICORE, PS1Enemy.SKELETON_GUARD, PS1Enemy.DEATH_KNIGHT, PS1Enemy.GR_DRAGN});
		dungeon.setRandomEnemies(-4, new PS1Enemy[]{PS1Enemy.GR_SLIME, PS1Enemy.DEATH_KNIGHT});		

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.WYVERN, PS1Enemy.MAGICIAN});
		dungeon.setFixedEnemies(-3, new PS1Enemy[]{PS1Enemy.SKELETON_GUARD, PS1Enemy.DEATH_KNIGHT});
		dungeon.setFixedEnemies(-4, new PS1Enemy[]{PS1Enemy.MARAUDER, PS1Enemy.REAPER});		
		
		dungeon.startDungeon();
	}

	public static void shadow() {
		if(!PSGame.hasFlag(Flags.DEFEAT_SHADOW)) {
			Enemy shadow = PSGame.getEnemy(PS1Enemy.SHADOW);
			PSMenu.startScene(Scene.CORRIDOR, shadow.getChr());
			PSMenu.Stext(getString("Dark_Castle_Shadow"));
			PSBattle battle = new PSBattle();
			if(battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SHADOW), 1) == BattleOutcome.WIN) {
				PSMenu.Stext(getString("Dark_Castle_Shadow_Defeat"));
				PSGame.setFlag(Flags.DEFEAT_SHADOW);
			}
			PSMenu.endScene();
		}
	}
	
	public static void lassic() {
		if(!PSGame.hasFlag(Flags.DEFEAT_LASSIC)) {
			Enemy lassic = PSGame.getEnemy(PS1Enemy.LASSIC);
			PSMenu.startScene(Scene.ALTAR, lassic.getChr());
			if(PSMenu.Prompt(getString("Dark_Castle_Lassic"), getYesNo()) == 1) {
				PSMenu.StextLast(getString("Dark_Castle_LassicYes"));
			} else {
				PSMenu.StextLast(getString("Dark_Castle_LassicNo"));
			}
																																	
			PSMenu.instance.entitySprite = null;
			PSBattle battle = new PSBattle();
			BattleOutcome outcome = battle.startBattle(new Enemy[]{lassic}, PS1Music.LASSIC);
			
			if(outcome == BattleOutcome.WIN) {
				// If Alis is Dead
				if(PSGame.getParty().getMember(0).getHp() <=0) {
					PSMenu.Stext(getString("Baya_Malay_Nero"));
					PSGame.getParty().getMember(0).setHp(1);
				}
				
				PSMenu.Stext(getString("Dark_Castle_LassicVictory"));
				PSGame.setFlag(Flags.DEFEAT_LASSIC);
			}
			PSMenu.endScene();
		}
		else {
			PSMenu.startScene(Scene.ALTAR, SpecialEntity.NONE);
			PSMenu.instance.waitAnyButton();
			PSMenu.endScene();
		}
		
	}

	public static void stairs_1_down() {
		PSGame.warp(19, 6, false);
	}
	public static void stairs_1_up() {
		PSGame.warp(4, 4, false);
	}
	public static void stairs_2_down() {
		PSGame.warp(4, 24, false);
	}
	public static void stairs_2_up() {
		PSGame.warp(19, 10, false);
	}
	public static void stairs_3_down() {
		PSGame.warp(19, 27, false);
	}
	public static void stairs_3_up() {
		PSGame.warp(2, 27, false);
	}
	public static void stairs_4_down() {
		PSGame.warp(11, 41, false);
	}
	public static void stairs_4_up() {
		PSGame.warp(19, 23, false);
	}
	public static void stairs_5_down() {
		PSGame.warp(17, 41, false);
	}
	public static void stairs_5_up() {
		PSGame.warp(25, 23, false);
	}
	public static void stairs_6_down() {
		PSGame.warp(26, 27, false);
	}
	public static void stairs_6_up() {
		PSGame.warp(9, 27, false);
	}
	public static void stairs_7_down() {
		PSGame.warp(11, 24, false);
	}
	public static void stairs_7_up() {
		PSGame.warp(26, 10, false);
	}
	public static void stairs_8_down() {
		PSGame.warp(26, 6, false);
	}
	public static void stairs_8_up() {
		PSGame.warp(11, 4, false);
	}
	
	public static void exit() {
		PSGame.mapswitch(City.SKY_CASTLE,21,10);
	}
}
