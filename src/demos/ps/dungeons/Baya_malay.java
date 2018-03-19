package demos.ps.dungeons;

import static demos.ps.oo.PSGame.getItem;
import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.getYesNo;
import static core.Script.*;

import java.awt.Color;

import demos.ps.PSDungeon;
import demos.ps.oo.City;
import demos.ps.oo.Enemy;
import demos.ps.oo.Job;
import demos.ps.oo.PSBattle;
import demos.ps.oo.Specie;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibCHR.PS1CHR;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.PartyMember;
import demos.ps.oo.menuGUI.MenuCHR;
import demos.ps.oo.menuGUI.MenuType;
import demos.ps.oo.menuGUI.MenuType.State;
import core.Script;
import domain.CHR;
import domain.VImage;

public class Baya_malay {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.CENTAUR, PS1Enemy.GIANT});
		dungeon.setRandomEnemies(1, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.STALKER, PS1Enemy.GIANT});
		dungeon.setRandomEnemies(2, new PS1Enemy[]{PS1Enemy.REAPER, PS1Enemy.GR_SLIME});
		dungeon.setRandomEnemies(3, new PS1Enemy[]{PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN});
		//dungeon.setEnemies(4, null);
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.ANDROCOP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN});
		dungeon.setRandomEnemies(-2, new PS1Enemy[]{PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN, PS1Enemy.WYVERN});
		dungeon.setRandomEnemies(-3, new PS1Enemy[]{PS1Enemy.ANDROCOP, PS1Enemy.HORSEMAN, PS1Enemy.WYVERN, PS1Enemy.GIANTFLY});		

		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.CENTAUR});
		dungeon.setFixedEnemies(1, new PS1Enemy[]{PS1Enemy.STALKER, PS1Enemy.SORCERER, PS1Enemy.STALKER});
		dungeon.setFixedEnemies(2, new PS1Enemy[]{PS1Enemy.REAPER, PS1Enemy.SORCERER});
		dungeon.setFixedEnemies(3, new PS1Enemy[]{PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.MAGICIAN, PS1Enemy.HORSEMAN});
		dungeon.setFixedEnemies(-2, new PS1Enemy[]{PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP});
		dungeon.setFixedEnemies(-3, new PS1Enemy[]{PS1Enemy.WYVERN, PS1Enemy.GIANTFLY});		
		
		
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST2, 50, Trapped.ARROW, null);
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST3, 0, Trapped.NO_TRAP, null);
	}
	public static void chest4() { 
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Light_Pendant)); 
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST5, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate)); 
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST6, 500, Trapped.NO_TRAP, null);
	}
	public static void chest7() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST7, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
	}
	public static void chest8() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST8, 0, Trapped.EXPLOSION, null);
	}
	public static void chest9() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST9, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest10() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST10, 500, Trapped.NO_TRAP, null);
	}
	public static void chest11() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST11, 20, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest12() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST12, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Iron_Sword));
	}
	public static void chest13() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST13, 0, Trapped.ARROW, PSGame.getItem(OriginalItem.Weapon_Short_Sword));
	}
	public static void chest14() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST14, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Light_Saber));
	}
	public static void chest15() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST15, 0, Trapped.EXPLOSION, PSGame.getItem(OriginalItem.Quest_Miracle_Key));
	}
	public static void chest16() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST16, 20, Trapped.NO_TRAP, null);
	}
	public static void chest17() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST17, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest18() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST18, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest19() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST19, 100, Trapped.NO_TRAP, null);
	}
	public static void chest20() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST20, 0, Trapped.ARROW, null);
	}
	public static void chest21() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST21, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Iron_Axe));
	}
	public static void chest22() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST22, 0, Trapped.EXPLOSION, null);
	}
	public static void chest23() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST23, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest24() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST24, 0, Trapped.ARROW, null);
	}
	public static void chest25() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST25, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest26() {
		PSGame.chestFlag(Chest.BAYA_MALAY_CHEST26, 0, Trapped.EXPLOSION, null);
	}

	public static void stairs_1_up() {
		PSGame.warp(30, 4, false);
	}
	public static void stairs_1_down() {
		PSGame.warp(14, 2, false);
	}
	public static void stairs_2_up() {
		PSGame.warp(26, 10, false);
	}
	public static void stairs_2_down() {
		PSGame.warp(12, 10, false);
	}
	public static void stairs_3_up() {
		PSGame.warp(29, 12, false);
	}
	public static void stairs_3_down() {
		PSGame.warp(11, 12, false);
	}
	public static void stairs_4_up() {
		PSGame.warp(10, 19, false);
	}
	public static void stairs_4_down() {
		PSGame.warp(26, 5, false);
	}
	public static void stairs_5_up() {
		PSGame.warp(8, 24, false);
	}
	public static void stairs_5_down() {
		PSGame.warp(26, 8, false);
	}
	public static void stairs_6_up() {
		PSGame.warp(3, 25, false);
	}
	public static void stairs_6_down() {
		PSGame.warp(19, 11, false);
	}
	public static void stairs_7_up() {
		PSGame.warp(14, 25, false);
	}
	public static void stairs_7_down() {
		PSGame.warp(30, 11, false);
	}
	public static void stairs_8_up() {
		PSGame.warp(5, 29, false);
	}
	public static void stairs_8_down() {
		PSGame.warp(21, 11, false);
	}
	public static void stairs_9_up() {
		PSGame.warp(30, 20, false);
	}
	public static void stairs_9_down() {
		PSGame.warp(14, 18, false);
	}
	public static void stairs_10_up() {
		PSGame.warp(17, 27, false);
	}
	public static void stairs_10_down() {
		PSGame.warp(1, 25, false);
	}
	public static void stairs_11_up() {
		PSGame.warp(26, 30, false);
	}
	public static void stairs_11_down() {
		PSGame.warp(8, 30, false);
	}
	public static void stairs_12_up() {
		PSGame.warp(7, 35, false);
	}
	public static void stairs_12_down() {
		PSGame.warp(25, 19, false);
	}
	public static void stairs_13_up() {
		PSGame.warp(7, 42, false);
	}
	public static void stairs_13_down() {
		PSGame.warp(23, 28, false);
	}
	public static void stairs_14_up() {
		PSGame.warp(11, 42, false);
	}
	public static void stairs_14_down() {
		PSGame.warp(27, 28, false);
	}
	public static void stairs_15_up() {
		PSGame.warp(14, 45, false);
	}
	public static void stairs_15_down() {
		PSGame.warp(30, 27, false);
	}
	public static void stairs_16_up() {
		PSGame.warp(26, 33, false);
	}
	public static void stairs_16_down() {
		PSGame.warp(8, 33, false);
	}
	public static void stairs_17_up() {
		PSGame.warp(28, 36, false);
	}
	public static void stairs_17_down() {
		PSGame.warp(12, 38, false);
	}
	public static void stairs_18_up() {
		PSGame.warp(19, 44, false);
	}
	public static void stairs_18_down() {
		PSGame.warp(3, 42, false);
	}
	public static void stairs_19_up() {
		PSGame.warp(17, 43, false);
	}
	public static void stairs_19_down() {
		PSGame.warp(1, 45, false);
	}
	public static void stairs_20_up() {
		PSGame.warp(6, 50, false);
	}
	public static void stairs_20_down() {
		PSGame.warp(20, 33, false);
	}
	public static void stairs_21_up() {
		PSGame.warp(13, 50, false);
	}
	public static void stairs_21_down() {
		PSGame.warp(27, 33, false);
	}
	public static void stairs_22_up() {
		PSGame.warp(28, 55, false);
	}
	public static void stairs_22_down() {
		PSGame.warp(10, 55, false);
	}
	public static void stairs_23_up() {
		PSGame.warp(28, 57, false);
	}
	public static void stairs_23_down() {
		PSGame.warp(10, 57, false);
	}
	public static void stairs_24_up() {
		PSGame.warp(28, 61, false);
	}
	public static void stairs_24_down() {
		PSGame.warp(10, 61, false);
	}
	public static void stairs_25_up() {
		PSGame.warp(18, 63, false);
	}
	public static void stairs_25_down() {
		PSGame.warp(4, 63, false);
	}
	
	public static void trap1() {
		PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP1, Trap.INFO_BAYA_MALAY_TRAP1, 12, 9);
	}
	public static void trap2() {
		PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP2, Trap.INFO_BAYA_MALAY_TRAP2, 26, 8);
	}
	public static void trap3() {
		PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP3, Trap.INFO_BAYA_MALAY_TRAP3, 20, 12);
	}
	public static void trap4() {
		PSGame.trapRoutine(Trap.BAYA_MALAY_TRAP4, Trap.INFO_BAYA_MALAY_TRAP4, 1, 22);
	}
	
	public static void oldman() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.OLDMAN);
		if(PSMenu.Prompt(getString("Baya_Malay_Tower_Questioner"), getYesNo()) == 1) {
			PSMenu.StextLast(getString("Baya_Malay_Tower_Questioner_Yes"));
		} else {
			PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_Questioner_No"));
		}
		PSMenu.endScene();
	}
	public static void damor() {
		PSMenu.startScene(Scene.DUNGEON, SpecialEntity.OLDMAN);
		// Question 1
		if(PSMenu.Prompt(getString("Baya_Malay_Tower_DamorIntro"), getYesNo()) == 1) {
			PSMenu.StextNext(getString("Baya_Malay_Tower_DamorYes"));

			// If already has crystal, end here
			if(PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Damoa_Crystal))) {
				PSMenu.StextLast(getString("Baya_Malay_Tower_DamorCorrectYes"));				
			}
			else {
				// Question 2
				if(PSMenu.PromptNext(getString("Baya_Malay_Tower_DamorSearch"), getYesNo()) == 1) {
					PSMenu.StextNext(getString("Baya_Malay_Tower_DamorYes"));
					
					// Question 3
					if(PSMenu.PromptNext(getString("Baya_Malay_Tower_DamorAlex"), getYesNo()) == 1) {
						PSMenu.StextNext(getString("Baya_Malay_Tower_DamorYes"));
						
						// Question 4
						if(PSMenu.PromptNext(getString("Baya_Malay_Tower_DamorCorrect"), getYesNo()) == 1) {
							PSMenu.StextLast(getString("Baya_Malay_Tower_DamorCorrectYes"));
						}
						else {
							// Question 5						
							if(PSMenu.PromptNext(getString("Baya_Malay_Tower_DamorCorrectNo"), getYesNo()) == 1) {
								PSMenu.StextLast(getString("Baya_Malay_Tower_DamorContradictYes"));
							}
							else {
								PSMenu.StextLast(getString("Baya_Malay_Tower_DamorContradictNo"));
								PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Damoa_Crystal));
							}
						}
					} else {
						PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorCorrectYes"));	// Question 3: Then come again
					}
				} else {
					PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorCorrectYes"));	// Question 2: Then come again
				}
			}
				
		} else {
			PSMenu.StextLast(PSGame.getString("Baya_Malay_Tower_DamorNo")); // Question 1
		}
			
		PSMenu.endScene();
	}

	public static void skull() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SKULL_EN), Script.random(1, 3));
	}
	// Changed monster to Palma correspondent
	public static void bluescorpion() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SCORPION), Script.random(2, 4));
	}
	public static void stalker1() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SKELETON_GUARD), Script.random(1, 3));
	}
	public static void stalker2() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SKELETON_GUARD), Script.random(2, 3));
	}

	public static void sky() {
		PSMenu.setMapOff();
		PSMenu.startScene(Scene.BAYA, SpecialEntity.NONE);
		if(!PSMenu.instance.waitAnyButton()) {
			PSMenu.endScene();			
		}
		else {
			if(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Aeroprism))) {
				PSMenu.endScene();
				return;
			}
			
			int alivePlayer = PSGame.getParty().getFirstAlivePlayer();
			PSMenu.Stext(getString("Item_TookOut", 
					"<player>", PSGame.getParty().getMember(alivePlayer).getName(),
					"<item>", PSGame.getItem(OriginalItem.Quest_Aeroprism).getName()));

			PSGame.playMusic(PS1Music.PALACE);
			
			// Animation to change screen color
			PSMenu.instance.back.changeColor(new Color(PSMenu.instance.back.readPixel(0, 0)), Color.RED);
			showpage();	PSMenu.instance.waitDelay(6);
			PSMenu.instance.back.changeColor(Color.RED, Color.GREEN);
			showpage();	PSMenu.instance.waitDelay(6);
			PSMenu.instance.back.changeColor(Color.GREEN, Color.YELLOW);
			showpage();	PSMenu.instance.waitDelay(6);
			PSMenu.instance.back.changeColor(Color.YELLOW, Color.GRAY);
			showpage();	PSMenu.instance.waitDelay(6);
			PSMenu.instance.back.changeColor(Color.GRAY, Color.CYAN);
			showpage();	PSMenu.instance.waitDelay(6);
			PSMenu.instance.back.changeColor(Color.CYAN, Color.MAGENTA);
			showpage();	PSMenu.instance.waitDelay(6);
			PSMenu.instance.back.changeColor(Color.MAGENTA, Color.ORANGE);
			showpage();	PSMenu.instance.waitDelay(6);
			PSMenu.instance.back.changeColor(Color.ORANGE, Color.BLUE);
			showpage();	PSMenu.instance.waitDelay(6);
			
			// Make castle appear
			MenuCHR castle = new MenuCHR(125, 55, PSGame.getCHR(PS1CHR.SKY_CASTLE));
			PSMenu.instance.push(castle);
			castle.animate(State.ANIM1);
			PSMenu.instance.waitAnimationEnd(castle);
			castle.animate(MenuType.State.ANIM2);
			
			PartyMember muskCat = null;
			for(PartyMember p: PSGame.getParty().getMembers()) {
				if(p.getSpe() == Specie.MUSK_CAT) {
					muskCat = p;
					break;
				}
			}
			
			if(PSMenu.instance.waitAnyButton() && muskCat!= null && muskCat.getHp() > 0) {
				
				boolean flyToBaya = false;

				if(PSGame.hasFlag(Flags.DEFEAT_GOLD_DRAKE)) {
					flyToBaya = true;
				}
				else
				if(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laerma_Berries))) {
					flyToBaya = true;
					PSMenu.Stext(PSGame.getString("Baya_Malay_Myau_Eat"));
					PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Laerma_Berries));				
					PSMenu.instance.pop();
				
					PSGame.playMusic(PS1Music.STORY);
					PSMenu.startScene(Scene.CORRIDOR, SpecialEntity.NONE);
					PSMenu.instance.back = new VImage(screen.width, screen.height); //.paintBlack();
					PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_BEAST1), new String[]{PSGame.getString("Cinematic_Baya_Malay_1")});
					PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_BEAST2), new String[]{PSGame.getString("Cinematic_Baya_Malay_2")});
				}
				
				if(flyToBaya) {
				
					PSMenu.startScene(Scene.BAYA, SpecialEntity.NONE);
					PSMenu.instance.push(castle);
					castle.animate(MenuType.State.ANIM2);
					
					MenuCHR flyingBeast = new MenuCHR(295, 225, true, PSGame.getCHR(PS1CHR.MYAU_FLAPPING));
					PSMenu.instance.push(flyingBeast);
					flyingBeast.animate(State.ANIM1);
					PSGame.playSound(PS1Sound.FLAPPING);
					
					for(int i=0; i<140; i++) {
						flyingBeast.changePosition(295-i, 225-i/2);
						showpage();	PSMenu.instance.waitDelay(1);
					}
					
					PSMenu.instance.pop(); // Myau flapping
					PSMenu.instance.pop(); // Castle
					
					if(!PSGame.hasFlag(Flags.DEFEAT_GOLD_DRAKE)) {
						PSBattle battle = new PSBattle();
						PSMenu.startScene(Scene.SKY, SpecialEntity.NONE);
						BattleOutcome battleResult = battle.startBattle(new Enemy[]{PSGame.getEnemy(PS1Enemy.GD_DRAGN)}, PS1Music.BATTLE);
						if(battleResult == BattleOutcome.DEFEAT) {
							PSGame.gameOverRoutine();
							PSMenu.endScene();
							return;
						}
						// If Myau is dead
						else if(muskCat.getHp() <= 0) {
							PSMenu.StextFirst(PSGame.getString("Baya_Malay_Myau_Fall"));
							PSGame.gameOverRoutine();
							PSMenu.endScene();
							return;
						}
						else {
							PSGame.setFlag(Flags.DEFEAT_GOLD_DRAKE);
						}
					}
				}
				
				PSMenu.endScene();
				PSGame.mapswitch(City.SKY_CASTLE,22,25);

			}
			else {
				PSMenu.instance.pop();
				PSMenu.endScene();
			}
		}
	}
	

	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,105,22);
	}
}
