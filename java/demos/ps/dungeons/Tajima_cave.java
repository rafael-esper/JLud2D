package demos.ps.dungeons;

import static demos.ps.oo.PSGame.getItem;

import java.util.ArrayList;
import java.util.List;

import demos.ps.PSDungeon;
import demos.ps.oo.Battler;
import demos.ps.oo.Enemy;
import demos.ps.oo.EnemyBattler;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PartyMember;

public class Tajima_cave {
	
// Monsters (1): owl bear, red slime, e.farmer, tarantul
// Monsters (2): wight, sphinx, serpent, batallion
// Monsters (3): skeleton, vampire, amundsen, red dragon

	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.DRAINER_CRAB, PS1Enemy.MOTA_SHOOTER, PS1Enemy.SKULL_EN});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.SPHINX, PS1Enemy.NESSIE, PS1Enemy.ZOMBIE, PS1Enemy.DRAINER_CRAB});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.DRAINER_CRAB, PS1Enemy.AMUNDSEN, PS1Enemy.RD_DRAGN, PS1Enemy.WIZARD});

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.SKULL_EN, PS1Enemy.SKULL_EN});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.BATALION, PS1Enemy.ZOMBIE});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.DRAINER_CRAB, PS1Enemy.WIZARD, PS1Enemy.DRAINER_CRAB});

		
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST1, 0, Trapped.NO_TRAP, getItem(OriginalItem.Armor_White_Cloak));
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST2, 3000, Trapped.NO_TRAP, null);
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST3, 0, Trapped.NO_TRAP, getItem(OriginalItem.Weapon_Wood_Cane));
	}
	public static void chest4() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST4, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST5, 0, Trapped.EXPLOSION, null);
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST6, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Flash));
	}
	public static void chest7() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST7, 0, Trapped.NO_TRAP, getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest8() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST8, 500, Trapped.NO_TRAP, null);
	}
	public static void chest9() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST9, 0, Trapped.EXPLOSION, null);
	}
	public static void chest10() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST10, 0, Trapped.ARROW, null);
	}
	public static void chest11() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST11, 100, Trapped.NO_TRAP, null);
	}
	public static void chest12() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST12, 0, Trapped.NO_TRAP, getItem(OriginalItem.Weapon_Titanium_Sword));
	}
	public static void chest13() {
		PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST13, 0, Trapped.EXPLOSION, null);
	}

	public static void tajima() {
		
		Enemy tajima = PSGame.getEnemy(PS1Enemy.TARZIMAL);
		PartyMember noah = PSGame.getParty().getMember(3); 
		PSMenu.startScene(Scene.CORRIDOR, tajima.getChr());
		
		if(PSGame.hasFlag(Flags.DEFEAT_TAJIMA)) {
			PSMenu.StextLast(PSGame.getString("Tajim_Return"));
		}
		else {
			// If Noah is dead
			if(noah.getHp() <= 0) { 
				if(PSMenu.Prompt(PSGame.getString("Tajim_WithoutLutz"), PSGame.getYesNo()) == 1) {
					PSMenu.StextLast(PSGame.getString("Tajim_WithoutLutzYes"));
				}
				else {
					PSMenu.StextLast(PSGame.getString("Tajim_WithoutLutzNo"));
				}
			}
			// If Noah is alive
			else {
				PSMenu.StextLast(PSGame.getString("Tajim_Intro"));
				PSGame.playMusic(PS1Music.BATTLE);
				PSBattle battle = new PSBattle();
				List<Battler> battlerList = new ArrayList<Battler>();
				battlerList.add(noah);
				battlerList.add(new EnemyBattler(tajima));
				PSMenu.instance.entitySprite = null;
				BattleOutcome battleResult = battle.startBattle(battlerList);
				PSMenu.startScene(Scene.CORRIDOR, tajima.getChr());
				if(battleResult == BattleOutcome.WIN) {
					PSMenu.StextLast(PSGame.getString("Tajim_Victory"));
					noah.addItem(PSGame.getItem(OriginalItem.Armor_Frad_Cloak));
					PSGame.setFlag(Flags.DEFEAT_TAJIMA);
				} 
				else {
					PSMenu.StextLast(PSGame.getString("Tajim_Defeat"));
					noah.setHp(1);
				}
			}
		}
		
		PSMenu.endScene();
	}

	public static void stairs_1_2() {
		PSGame.warp(23, 12, false);
	}
	public static void stairs_2_1() {
		PSGame.warp(5, 12, false);
	}
	public static void stairs_2_3() {
		PSGame.warp(20, 26, false);
	}
	public static void stairs_3_2() {
		PSGame.warp(28, 12, false);
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.MOTAVIA,20,73);
	}
}
