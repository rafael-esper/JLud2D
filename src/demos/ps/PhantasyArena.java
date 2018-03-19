package demos.ps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;

import java.util.ArrayList;
import java.util.List;

import demos.ps.oo.Enemy;
import demos.ps.oo.Item;
import demos.ps.oo.Job;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleMode;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PartyMember;
import demos.ps.oo.PartyMember.Gender;
import demos.ps.oo.menuGUI.MenuLabelBox;
import demos.ps.oo.Specie;

public class PhantasyArena {

	private static final Logger log = LogManager.getLogger(PhantasyArena.class);

	/* ***** PHANTASY STAR ARENA GAME ******* */
	static final int ALIS = 0;
	static final int MYAU = 1;
	static final int ODIN = 2;
	static final int NOAH = 3;
	static final int HAPSBY = 4;
	
	public static void PhantasyArenaGame() {
		
		PSBattle battle = new PSBattle(BattleMode.AUTO_ACTION);
		BattleOutcome outcome = null;

		int weaponIndex = 0;
		int shieldIndex = 0;
		int armorIndex = 0;
		int numRevives = 0;
		int expLevel = 0;
		// TODO Remove this and add some support for items
		PSGame.getParty().getMember(ALIS).addItem(getItem(OriginalItem.Inventory_Escape_Cloth));
		PSGame.getParty().getMember(ALIS).addItem(getItem(OriginalItem.Inventory_Dimate));
		
		final int END = 180;
		
		for(int i=0; i<=END; i++) {
			//if(i<=0) {i=170; expLevel=15;weaponIndex=14;armorIndex=12;shieldIndex=12;cheat();}
			switch(i) {
			
				case 0:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.SWORM), 1);
					break;
				case 1:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.SWORM), 3);
					break;
				case 2:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.MANEATER), 2);
					break;

//				case 3: // REMOVE
//					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.SWORM), 1);
//					break;
//				case 4: // REMOVE
//					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.MANEATER), 1);
//					break;
//				case 5: // REMOVE
//					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.MANEATER), 1);
//					break;
//				case 6: // REMOVE
//					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.MANEATER), 1);
//					break;

				case 3:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.SCORPION), 2);
					break;
				case 4:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.WING_EYE), 5);
					break;
				case 9:
					outcome = battle.battleScene(Scene.FIELDS, new Enemy[]{PSGame.getEnemy(PS1Enemy.SWORM), PSGame.getEnemy(PS1Enemy.SCORPION), PSGame.getEnemy(PS1Enemy.SWORM)});
					break;
				case 10:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.GR_SLIME), 3);
					break;
				case 11:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.SCORPION), 4);
					break;
				case 12:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.MANEATER), 5);
					break;
				case 13:
					outcome = battle.battleScene(Scene.FOREST, new Enemy[]{PSGame.getEnemy(PS1Enemy.SWORM), PSGame.getEnemy(PS1Enemy.OWL_BEAR), PSGame.getEnemy(PS1Enemy.OWL_BEAR), PSGame.getEnemy(PS1Enemy.SWORM)});
					break;
				case 14:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.G_SCORPI), 4);
					break;
				case 16:
					outcome = battle.battleScene(Scene.ARTIC, PSGame.getEnemy(PS1Enemy.SCORPIUS), 2);
					break;
				case 18:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.OWL_BEAR), 4);
					break;
				case 20:
					outcome = battle.battleScene(Scene.CAVE, new Enemy[]{PSGame.getEnemy(PS1Enemy.WING_EYE), PSGame.getEnemy(PS1Enemy.GOLDLENS), PSGame.getEnemy(PS1Enemy.WING_EYE)});
					break;
				case 23:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.DEADTREE), 3);
					break;
				case 24:
					outcome = battle.battleScene(Scene.LAVA, PSGame.getEnemy(PS1Enemy.GIANTFLY), 2);
					break;
				case 25:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.GOLDLENS), 3);
					break;
				case 26:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.RD_SLIME), 3);
					break;
				case 27:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.EVILDEAD), 3);
					break;
				case 28:
					outcome = battle.battleScene(Scene.ARTIC, PSGame.getEnemy(PS1Enemy.SCORPIUS), 4);
					break;
				case 29:
					outcome = battle.battleScene(Scene.LAVA, PSGame.getEnemy(PS1Enemy.GIANTFLY), 4);
					break;
				case 30:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.N_FARMER), 5);
					break;
				case 31:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.ANT_LION), 1);
					break;
				case 32:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.CRAWLER), 3);
					break;
				case 33:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.E_FARMER), 5);
					break;
				case 34:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.BL_SLIME), 3);
					break;
				case 118:
					outcome = battle.battleScene(Scene.BEACH, PSGame.getEnemy(PS1Enemy.FISHMAN), 5);
					break;
				case 119:
					outcome = battle.battleScene(Scene.BEACH, PSGame.getEnemy(PS1Enemy.BIG_CLUB), 2);
					break;
				case 120:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.TARANTUL), 2);
					break;
				case 121:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.WEREBAT), 4);
					break;
				case 122:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.WIGHT), 3);
					break;
				case 123:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.SKELETON), 5);
					break;
				case 124:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.BARBRIAN), 8);
					break;
				case 125:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.SKULL_EN), 3);
					break;
				case 126:
					outcome = battle.battleScene(Scene.LAVA, PSGame.getEnemy(PS1Enemy.MARMAN), 6);
					break;
				case 127:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.LICH), 4);
					break;
				case 128:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.MANTICORE), 3);
					break;
				case 129:
					outcome = battle.battleScene(Scene.ARTIC, PSGame.getEnemy(PS1Enemy.EXECUTER), 3);
					break;
				case 130:
					outcome = battle.battleScene(Scene.SEA, PSGame.getEnemy(PS1Enemy.SHELFISH), 4);
					break;
				case 132:
					outcome = battle.battleScene(Scene.PINES, PSGame.getEnemy(PS1Enemy.VAMPIRE), 3);
					break;
				case 133:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.GHOUL), 3);
					break;
				case 134:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.LEECH), 4);
					break;
				case 135:
					outcome = battle.battleScene(Scene.ARTIC, PSGame.getEnemy(PS1Enemy.DEZORIAN), 5);
					break;
				case 136:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.SPHINX), 4);
					break;
				case 137:
					outcome = battle.battleScene(Scene.PINES, PSGame.getEnemy(PS1Enemy.STALKER), 4);
					break;
				case 138:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.SERPENT), 2);
					break;
				case 139:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.SANDWORM), 3);
					break;
				case 140:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.ELEPHANT), 5);
					break;
				case 141:
					outcome = battle.battleScene(Scene.ARTIC, new Enemy[]{PSGame.getEnemy(PS1Enemy.EVILHEAD), PSGame.getEnemy(PS1Enemy.DEZORIAN), PSGame.getEnemy(PS1Enemy.EVILHEAD), PSGame.getEnemy(PS1Enemy.DEZORIAN), PSGame.getEnemy(PS1Enemy.EVILHEAD)});
					break;
				case 142:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.ZOMBIE), 3);
					break;
				case 143:
					outcome = battle.battleScene(Scene.ARTIC, PSGame.getEnemy(PS1Enemy.AMMONITE), 3);
					break;
				case 144:
					outcome = battle.battleScene(Scene.SEA, PSGame.getEnemy(PS1Enemy.OCTOPUS), 2);
					break;
				case 145:
					outcome = battle.battleScene(Scene.SEA, PSGame.getEnemy(PS1Enemy.NESSIE), 2);
					break;
				case 146:
					outcome = battle.battleScene(Scene.PINES, PSGame.getEnemy(PS1Enemy.BATALION), 4);
					break;
				case 147:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.ROBOTCOP), 1);
					break;
				case 149:
					outcome = battle.battleScene(Scene.SEA, new Enemy[]{PSGame.getEnemy(PS1Enemy.SWORM), PSGame.getEnemy(PS1Enemy.WYVERN), PSGame.getEnemy(PS1Enemy.WYVERN), PSGame.getEnemy(PS1Enemy.SWORM)});
					break;
				case 150:
					outcome = battle.battleScene(Scene.LAVA, new Enemy[]{PSGame.getEnemy(PS1Enemy.GIANTFLY), PSGame.getEnemy(PS1Enemy.TENTACLE), PSGame.getEnemy(PS1Enemy.GIANTFLY)});
					break;
				case 151:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.ANDROCOP), 2);
					break;
				case 152:
					outcome = battle.battleScene(Scene.FIELDS, PSGame.getEnemy(PS1Enemy.GIANT), 2);
					break;
				case 153:
					outcome = battle.battleScene(Scene.DESERT, new Enemy[]{PSGame.getEnemy(PS1Enemy.SORCERER), PSGame.getEnemy(PS1Enemy.TARZIMAL), PSGame.getEnemy(PS1Enemy.SORCERER)});
					break;
				case 154:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.HORSEMAN), 2);
					break;
				case 155:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.AMUNDSEN), 2);
					break;
				case 156:
					outcome = battle.battleScene(Scene.PINES, new Enemy[]{PSGame.getEnemy(PS1Enemy.SKELETON), PSGame.getEnemy(PS1Enemy.MARAUDER), PSGame.getEnemy(PS1Enemy.SKELETON)});
					break;
				case 157:
					outcome = battle.battleScene(Scene.ARTIC, new Enemy[]{PSGame.getEnemy(PS1Enemy.SKULL_EN), PSGame.getEnemy(PS1Enemy.MAGICIAN), PSGame.getEnemy(PS1Enemy.SKULL_EN)});
					break;
				case 158:
					outcome = battle.battleScene(Scene.ARTIC, PSGame.getEnemy(PS1Enemy.FROSTMAN), 2);
					break;
				case 159:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.GOLEM), 2);
					break;
				case 160:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.GR_DRAGN), 1);
					break;
				case 161:
					outcome = battle.battleScene(Scene.FIELDS, new Enemy[]{PSGame.getEnemy(PS1Enemy.HORSEMAN), PSGame.getEnemy(PS1Enemy.CENTAUR), PSGame.getEnemy(PS1Enemy.HORSEMAN)});
					break;
				case 162:
					outcome = battle.battleScene(Scene.FOREST, PSGame.getEnemy(PS1Enemy.RD_DRAGN), 2);
					break;
				case 163:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.DR_MAD), 1);
					break;
				case 164:
					outcome = battle.battleScene(Scene.ARTIC, PSGame.getEnemy(PS1Enemy.MAMMOTH), 5);
					break;
				case 165:
					outcome = battle.battleScene(Scene.GAS, new Enemy[]{PSGame.getEnemy(PS1Enemy.REAPER), PSGame.getEnemy(PS1Enemy.MARAUDER)});
					break;
				case 166:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.SHADOW), 1);
					break;
				case 167:
					outcome = battle.battleScene(Scene.DESERT, PSGame.getEnemy(PS1Enemy.BL_DRAGN), 2);
					break;
				case 168:
					outcome = battle.battleScene(Scene.PINES, PSGame.getEnemy(PS1Enemy.TITAN), 2);
					break;
				case 169:
					outcome = battle.battleScene(Scene.PINES, PSGame.getEnemy(PS1Enemy.WT_DRAGN), 2);
					break;
				case 170:
					outcome = battle.battleScene(Scene.CAVE, PSGame.getEnemy(PS1Enemy.MEDUSA), 1);
					break;
				case 171:
					outcome = battle.battleScene(Scene.SKY, PSGame.getEnemy(PS1Enemy.GD_DRAGN), 1);
					break;
				case 172:
					outcome = battle.battleScene(Scene.BLACK, PSGame.getEnemy(PS1Enemy.SACCUBUS), 3);
					continue;
					//outcome = battle.battleScene(Scene.ALTAR, PSGame.getEnemy(PS1Enemy.LASSIC), 1);
					//outcome = battle.battleScene(Scene.BLACK, PSGame.getEnemy(PS1Enemy.DARKFALZ), 1);

				case END:

					// Compute Score
					List<String> scoreResult = new ArrayList<String>();
					int score = 0;
					for(PartyMember p: PSGame.getParty().getMembers()) {
						score+= p.getXp();
					}
					scoreResult.add("Total EXP earned (x1)" + ": " + score);
					
					score+= PSGame.getParty().mst;
					scoreResult.add("Total MST earned (x1)" + ": " + PSGame.getParty().mst);
					
					score+= weaponIndex * 500;
					score+= shieldIndex * 500;
					score+= armorIndex * 500;
					
					scoreResult.add("");
					
					scoreResult.add("Weapons Earned (x500)" + ": " + weaponIndex * 500);
					if(weaponIndex >= 14) {
						score+=50000;
						scoreResult.add("All Weapons Bonus" + ": " + 50000);
					}
					scoreResult.add("Shields Earned (x500)" + ": " + shieldIndex * 500);
					if(shieldIndex >= 12) {
						score+=50000;
						scoreResult.add("All Shields Bonus" + ": " + 50000);
					}
					
					scoreResult.add("Armors  Earned (x500)" + ": " + armorIndex * 500);
					if(armorIndex >= 12) {
						score+=50000;
						scoreResult.add("All Armors Bonus" + ": " + 50000);
					}
					
					scoreResult.add("");
					scoreResult.add("Revive (x5000)" + ": -" + numRevives * 5000);
					score-= numRevives*5000;
					
					scoreResult.add("");
					scoreResult.add("TOTAL SCORE" + ": " + score);
					
					// RANKING: 	160000 -> SUPERB (1 revive, 1 cure, all equip)
					// Total exp+mst = ~150000 + 14166. Gear: 1500+1200+1200
					// Add full gear bonus
					// After Change = 150000 + 14166 + 7500+25000(Weapon)+6000+25000(Shields)+6000+25000(Armor)-5000(Rev) = 253.666
					
					// NO ESCAPE, NO REVIVE, FIRST EXP, THEN SHIELDS, THEN WEAPONS, THEN EXP => 311250 (No Armor Bonus)
					// Exp (284.384) + Exp (14.166) + 1500+5000(Weapon) + 1200+5000(Shields) => 311250
					// After Change: 284.384 + 14.166 + 7500+25000(Weapon)+6000+25000(Shields) => 362.050
					
					PSMenu.instance.push(PSMenu.instance.createLabelBox(5, 5, scoreResult.toArray(new String[0]), true));
					
					PSMenu.Stext(PSGame.getString("PS_Battle_End"));

					PSMenu.instance.pop();
					continue;
					
				default:
					continue;
			}


			if(outcome == BattleOutcome.DEFEAT) {
				log.info("Battle lost!");
				break;
			}
			
			if(i==0) {
				PSMenu.Stext(PSGame.getString("PS_Battle_Myau"));
				PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), "chars/myau.chr"));
			}
			if(i==1) {
				PSMenu.Stext(PSGame.getString("PS_Battle_Odin"));
				PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, PSGame.getString("Name_Odin"), "chars/odin.chr"));
			}
			if(i==2) {
				PSMenu.Stext(PSGame.getString("PS_Battle_Noah"));
				PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, PSGame.getString("Name_Noah"), "chars/noah.chr"));
			}
			if(i==3) {
				PSMenu.Stext(PSGame.getString("PS_Battle_Hapsby"));
				PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.ANDROID, Job.ROBOT, PSGame.getString("Item_Quest_Hapsby"), "chars/alis.chr"));
			}
			
			boolean chosen = false;
			while(!chosen) {
				int opt = PSMenu.Prompt(PSGame.getString("PS_Battle_Reward"), 
						new String[]{	expLevel >= expLevels.length ? 
											PSGame.getString("PS_Battle_LevelUp") : 
											expLevels[expLevel] + " " + PSGame.getString("PS_Battle_ExpPoints"),
										PSGame.getString("PS_Battle_Weapon"),
										PSGame.getString("PS_Battle_Armor"),
										PSGame.getString("PS_Battle_Shield"),
										PSGame.getString("PS_Battle_Cure"),
										PSGame.getString("PS_Battle_Revive")});
				if(opt == 1) {
					if(expLevel >= expLevels.length) {
						getLevelup();
					}
					else {
						getExp(expLevel);
						expLevel++;
					}
					chosen = true;
				} 
				else if(opt == 2) {
					if(getBattleWeapon(weaponIndex)) {
						weaponIndex++;
						chosen = true;
					}
				}
				else if(opt == 3) {
					if(getBattleArmor(armorIndex)) {
						armorIndex++;
						chosen = true;
					}
				}
				else if(opt == 4) {
					if(getBattleShield(shieldIndex)) {
						shieldIndex++;
						chosen = true;
					}
				}
				else if(opt == 5) {
					PSGame.playSound(PS1Sound.CURE);
					PSGame.getParty().healAll(false);
					PSMenu.StextLast(PSGame.getString("PS_Battle_Cure_OK"));
					chosen = true;
				}
				else if(opt == 6) {
					numRevives++;
					for(PartyMember p: PSGame.getParty().getMembers()) {
						if(p.getHp() <=0) {
							p.setHp(p.getMaxHp());
						}
					}
					PSGame.playSound(PS1Sound.REVIVE);
					PSMenu.StextLast(PSGame.getString("PS_Battle_Revive_OK"));
					chosen = true;
				}
				
			}
		}
	}

	static int expLevels[] = new int[]{
		20,		35,		50,		65,		85,		105,	125,	150,	175,	205,	
		235,	265,	295,	335,	375,	415,	455,	505,	555,	605,	
		655,	715,	775,	835,	895,	970,	1045,	1120,	1195,	1270,	
		1345,	1445,	1545,	1645,	1745,	1845,	1945,	2070,	2195,	2320,	
		2445,	2570,	2720,	2870,	3020,	3170,	3370,	3600};

	private static void getExp(int expLevel) {
		for(PartyMember p: PSGame.getParty().getMembers()) {
			p.giveExp(expLevels[expLevel]);
		}
	}
	
	private static void getLevelup() {
		PSGame.playSound(PS1Sound.LEVEL_UP);
		PSMenu.StextNext(PSGame.getString("PS_Battle_LevelUp_Ok"));		

		for(PartyMember p: PSGame.getParty().getMembers()) {
			if(p.advanceLevel()) { 
				PSMenu.StextNext(PSGame.getString("Battle_Learn_Spell", "<player>", p.getName()));	
			}
		}
	}

	public static boolean getBattleWeapon(int index) {
		
		Item item = null;
		int toChar = 0;
		
		switch(index) {
			case 0:
				item = getItem(OriginalItem.Weapon_Iron_Sword);
				toChar = ALIS; break;
			case 1:
				item = getItem(OriginalItem.Weapon_Titanium_Sword);
				toChar = ODIN; break;
			case 2:
				item = getItem(OriginalItem.Weapon_Psycho_Wand);
				toChar = NOAH; break;
			case 3:
				item = getItem(OriginalItem.Weapon_Needle_Gun);
				toChar = HAPSBY; break;
			case 4:
				item = getItem(OriginalItem.Weapon_Titanium_Sword);
				toChar = ALIS; break;
			case 5:
				item = getItem(OriginalItem.Weapon_Saber_Claw);
				toChar = MYAU; break;
			case 6:
				item = getItem(OriginalItem.Weapon_Ceramic_Sword);
				toChar = ODIN; break;
			case 7:
				item = getItem(OriginalItem.Weapon_Ceramic_Sword);
				toChar = ALIS; break;
			case 8:
				item = getItem(OriginalItem.Weapon_Heat_Gun);
				toChar = HAPSBY; break;
			case 9:
				item = getItem(OriginalItem.Weapon_Light_Saber);
				toChar = ODIN; break;
			case 10:
				item = getItem(OriginalItem.Weapon_Light_Saber);
				toChar = ALIS; break;
			case 11:
				item = getItem(OriginalItem.Weapon_Silver_Tusk);
				toChar = MYAU; break;
			case 12:
				item = getItem(OriginalItem.Weapon_Laser_Gun);
				toChar = HAPSBY; break;
			case 13:
				item = getItem(OriginalItem.Weapon_Laconian_Sword);
				toChar = ALIS; break;
			case 14:
				item = getItem(OriginalItem.Weapon_Laconian_Axe);
				toChar = ODIN; break;
			default:
				break;
		}

		if(item != null) {
			PSGame.getParty().getMember(toChar).equipItem(item);
			PSGame.playSound(PS1Sound.ITEM);
			PSMenu.StextLast(PSGame.getString("Item_Equip", "<item>", item.getName(), "<player>", PSGame.getParty().getMember(toChar).getName()));
			return true;
		} else {
			PSMenu.StextNext(PSGame.getString("PS_Battle_Weapons_Left"));
			return false;
		}
	}

	public static boolean getBattleArmor(int index) {
		
		Item item = null;
		int toChar = 0;
		
		switch(index) {
			case 0:
				item = getItem(OriginalItem.Armor_Light_Suit);
				toChar = ALIS; break;
			case 1:
				item = getItem(OriginalItem.Armor_Spiky_Fur);
				toChar = MYAU; break;
			case 2:
				item = getItem(OriginalItem.Armor_Titanium_Mail);
				toChar = ODIN; break;
			case 3:
				item = getItem(OriginalItem.Armor_Iron_Armor);
				toChar = HAPSBY; break;
			case 4:
				item = getItem(OriginalItem.Armor_Titanium_Mail);
				toChar = ALIS; break;
			case 5:
				item = getItem(OriginalItem.Armor_Zirconian_Mail);
				toChar = ODIN; break;
			case 6:
				item = getItem(OriginalItem.Armor_Zirconian_Mail);
				toChar = ALIS; break;
			case 7:
				item = getItem(OriginalItem.Armor_Frad_Cloak);
				toChar = NOAH; break;
			case 8:
				item = getItem(OriginalItem.Armor_Saber_Fur);
				toChar = MYAU; break;
			case 9:
				item = getItem(OriginalItem.Armor_Diamond_Mail);
				toChar = ODIN; break;
			case 10:
				item = getItem(OriginalItem.Armor_Diamond_Mail);
				toChar = ALIS; break;
			case 11:
				item = getItem(OriginalItem.Armor_Laconian_Armor);
				toChar = ODIN; break;
			default:
				break;
		}

		if(item != null) {
			PSGame.getParty().getMember(toChar).equipItem(item);
			PSGame.playSound(PS1Sound.ITEM);
			PSMenu.StextLast(PSGame.getString("Item_Equip", "<item>", item.getName(), "<player>", PSGame.getParty().getMember(toChar).getName()));
			return true;
		} else {
			PSMenu.StextNext(PSGame.getString("PS_Battle_Armors_Left"));
			return false;
		}
	}
	
	public static boolean getBattleShield(int index) {
		
		Item item = null;
		int toChar = 0;
		
		switch(index) {
			case 0:
				item = getItem(OriginalItem.Shield_Leather_Shield);
				toChar = ALIS; break;
			case 1:
				item = getItem(OriginalItem.Shield_Iron_Shield);
				toChar = ODIN; break;
			case 2:
				item = getItem(OriginalItem.Shield_Bronze_Shield);
				toChar = ODIN; break;
			case 3:
				item = getItem(OriginalItem.Shield_Ceramic_Shield);
				toChar = ALIS; break;
			case 4:
				item = getItem(OriginalItem.Shield_Ceramic_Shield);
				toChar = ODIN; break;
			case 5:
				item = getItem(OriginalItem.Shield_Laser_Barrier);
				toChar = HAPSBY; break;
			case 6:
				item = getItem(OriginalItem.Shield_Laser_Barrier);
				toChar = NOAH; break;
			case 7:
				item = getItem(OriginalItem.Shield_Laser_Barrier);
				toChar = ODIN; break;
			case 8:
				item = getItem(OriginalItem.Shield_Laser_Barrier);
				toChar = ALIS; break;
			case 9:
				item = getItem(OriginalItem.Shield_Animal_Glove);
				toChar = MYAU; break;
			case 10:
				item = getItem(OriginalItem.Shield_Mirror_Shield);
				toChar = ODIN; break;
			case 11:
				item = getItem(OriginalItem.Shield_Laconian_Shield);
				toChar = ALIS; break;
			default:
				break;
		}

		if(item != null) {
			PSGame.getParty().getMember(toChar).equipItem(item);
			PSGame.playSound(PS1Sound.ITEM);
			PSMenu.StextLast(PSGame.getString("Item_Equip", "<item>", item.getName(), "<player>", PSGame.getParty().getMember(toChar).getName()));
			return true;
		} else {
			PSMenu.StextNext(PSGame.getString("PS_Battle_Shield_Left"));
			return false;
		}
	}	
	
	public static void cheat() {
		PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, "Myau", "chars/myau.chr"));
		PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, "Odin", "chars/odin.chr"));
		PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, "Noah", "chars/noah.chr"));
		PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.ANDROID, Job.ROBOT, "Hapsby", "chars/alis.chr"));
		PSGame.getParty().getMember(ALIS).equipItem(getItem(OriginalItem.Weapon_Laconian_Sword));
		PSGame.getParty().getMember(ODIN).equipItem(getItem(OriginalItem.Weapon_Laconian_Axe));
		PSGame.getParty().getMember(HAPSBY).equipItem(getItem(OriginalItem.Weapon_Laser_Gun));
		PSGame.getParty().getMember(MYAU).equipItem(getItem(OriginalItem.Shield_Animal_Glove));
		PSGame.getParty().getMember(ALIS).equipItem(getItem(OriginalItem.Shield_Laser_Barrier));
		PSGame.getParty().getMember(ODIN).equipItem(getItem(OriginalItem.Shield_Mirror_Shield));
		PSGame.getParty().getMember(NOAH).equipItem(getItem(OriginalItem.Shield_Laser_Barrier));
		PSGame.getParty().getMember(HAPSBY).equipItem(getItem(OriginalItem.Shield_Laser_Barrier));
		getLevelup();getLevelup();getLevelup();getLevelup();getLevelup();
		getLevelup();getLevelup();getLevelup();getLevelup();getLevelup();
		getLevelup();getLevelup();getLevelup();getLevelup();getLevelup();
		getLevelup();getLevelup();getLevelup();getLevelup();getLevelup();
		PSGame.getParty().healAll(false);
	}
	
	
}
