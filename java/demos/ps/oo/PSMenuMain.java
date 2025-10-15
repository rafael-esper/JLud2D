package demos.ps.oo;

import static core.Script.current_map;
import static core.Script.entities;
import static core.Script.load;
import static core.Script.player;
import static core.Script.unpress;
import static core.MainEngine.syncAfterLoading;
import static demos.ps.oo.PSGame.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.oo.Enemy.Type;
import demos.ps.oo.Item.EquipPlace;
import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PSEffect.EffectOutcome;
import demos.ps.oo.PSEffect.EffectPlace;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSLibSpell.Spell;
import demos.ps.oo.PSMenu.Cancellable;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.menuGUI.MenuCHR;
import demos.ps.oo.menuGUI.MenuLabelBox;
import demos.ps.oo.menuGUI.MenuPromptBox;
import demos.ps.oo.menuGUI.MenuType.State;
import domain.CHR;

public class PSMenuMain {

	private static final Logger log = LogManager.getLogger(PSMenuMain.class);

	// SYSTEM.JAVA
	public static void menu() {
		
		unpress(4);
		PSMenu.menuOff();
		PSMenu.instance.checkPreMenu();
		
		// For robustness
		while(PSMenu.instance.hasMenu()) {
			log.error("A Menu was open before opening the Main Menu.");
			PSMenu.instance.pop();
		}
		
		// Mstbox
		PSMenu.instance.push(PSMenu.instance.createOneLabelBox(10, 200, "MST " + PSGame.getParty().mst, true));
		
		MenuLabelBox statusLabelBox = PSMenu.instance.createLabelBox(200, 10, getBasicStats(), true);
		PSMenu.instance.push(statusLabelBox);
		
		// Main Menu
		MenuPromptBox mainMenu = PSMenu.instance.createPromptBox(10, 10, new String[]{
				PSGame.getString("Menu_Stats"),		PSGame.getString("Menu_Magic"),
				PSGame.getString("Menu_Items"),		PSGame.getString("Menu_Quest"),
				PSGame.getString("Menu_Talk"),		PSGame.getString("Menu_Options"),
				PSGame.getString("Menu_Load"),		PSGame.getString("Menu_Save")}, true);
		PSMenu.instance.push(mainMenu);
		
		//if(PSGame.getGameType() == GameType.PS_ORIGINAL) {
			mainMenu.setDisabled(4);
		//}
		
		while(true) {
			log.info("Menu!");
			int opt = PSMenu.instance.waitOpt(Cancellable.TRUE) + 1;

			if(opt==0) {
				break;
			}
			
			if(opt==1) {
				statMenu();
			}

			if(opt==2) { 
				if(magicMenu(statusLabelBox)) {
					break;
				}
			}
			
			if(opt==3) {
				if(itemMenu(statusLabelBox)) {
					break;
				}
			}
			
			if(opt==4) { 
				questMenu();
			}
			
			// 
			if(opt == 5) {
				// talk
			}
			
			// OPTIONS MENU
			if(opt == 6) {
				if(optionsMenu()) {
					break;
				}
			}
			
			// LOAD
			if(opt == 7) {
				PSGame.loadGame();
				syncAfterLoading();
				break;
			}
			// SAVE
			if(opt == 8) {
				PSGame.saveGame();
				syncAfterLoading();
			}
			
		}

		log.info("EndMenu!");
		PSMenu.instance.pop(); // Menu
		PSMenu.instance.pop(); // Chars
		PSMenu.instance.pop(); // Mst
		
		PSMenu.menuOn();
		PSMenu.instance.checkPosMenu();
	}


	private static void questMenu() {

		int opt = 0;
		MenuPromptBox questMenu = PSMenu.instance.createPromptBox(70, 30, 
				new String[]{	PSGame.getString("Menu_Quest_Items"), 
								PSGame.getString("Menu_Quest_Enemies"), 
								PSGame.getString("Menu_Quest_Dungeons"), 
								PSGame.getString("Menu_Quest_Log"), 
								PSGame.getString("Menu_Order")}, true);
		PSMenu.instance.push(questMenu);		
		questMenu.setDisabled(2); // TODO Implement Menu Quest_Dungeons
		questMenu.setDisabled(3); // TODO Implement Menu Quest_Log
		
		while(opt != -1) {
			opt = PSMenu.instance.waitOpt(Cancellable.TRUE);
	
			if(opt == -1) {
				PSMenu.instance.pop();
				return;
			}
			
			if(opt == 0) {
				if(PSGame.getParty().listQuestItems().size() == 0) {
					PSMenu.Stext(getString("Menu_No_Quest_Items"));
				}
				else {
					// TODO If quest items size > 12, then make multiple windows
					String[] items = spacedList(Item.toString(PSGame.getParty().listQuestItems(), false)); 
					PSMenu.instance.push(PSMenu.instance.createLabelBox(100, 10, items, true));
					PSMenu.instance.waitAnyButton();
					PSMenu.instance.pop();
				}
			}
			
			if(opt == 1) {
				PSMenu.instance.push(PSMenu.instance.createPromptBox(150, 60, 
						new String[]{"Palma", "Motavia", "Dezoris", "Undead", "Special"}, true));
				int type = PSMenu.instance.waitOpt(Cancellable.TRUE);
				switch(type) {
					case 0: listVisitedEnemies(Enemy.Type.PALMA);break;
					case 1: listVisitedEnemies(Enemy.Type.MOTAVIA);break;
					case 2: listVisitedEnemies(Enemy.Type.DEZORIS);break;
					case 3: listVisitedEnemies(Enemy.Type.UNDEAD);break;
					case 4: listVisitedEnemies(Enemy.Type.SPECIAL);break;
					default:
						break;
				}

				PSMenu.instance.pop();
			}
			
			if(opt == 4) {
				orderMenu();
			}
		}
		
	}


	private static boolean optionsMenu() {
		PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 30, new String[]{
				PSGame.getString("Menu_Options_Sound") + ": " + PSGame.gameData.soundVolume,
				PSGame.getString("Menu_Options_Music") + ": " + PSGame.gameData.musicVolume,
				PSGame.getString("Menu_Options_Messages") + ": " + (PSGame.gameData.battleInformation ? getString("Menu_Choice_Yes") : getString("Menu_Choice_No")),
				PSGame.getString("Menu_Options_Delay") + ": " + PSGame.gameData.dungeonDelay,
				PSGame.getString("Menu_Language"),
				PSGame.getString("Title_Screen")
		}, true));
		
		int opt = PSMenu.instance.waitOpt(Cancellable.TRUE);
		switch(opt) {

			case 0:
				// TODO Change to MenuBlitSlider (Sully Menu_Option.java)
				PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 50, new String[]{"0","10","20","30","40","50","60","70","80","90","100"}, true));
				int optSound = PSMenu.instance.waitOpt(Cancellable.TRUE);
				PSMenu.instance.pop();
				if(optSound >= 0) {
					PSGame.changeSoundVolume(optSound * 10);
				}				
				
				break;
			case 1:
				PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 50, new String[]{"0","10","20","30","40","50","60","70","80","90","100"}, true));
				int optMusic = PSMenu.instance.waitOpt(Cancellable.TRUE);
				PSMenu.instance.pop();
				if(optMusic >= 0) {
					PSGame.changeMusicVolume(optMusic * 10);
				}				
				break;
			case 2:
				int optInfo = PSMenu.Prompt(PSGame.getString("Menu_Options_Messages_Desc"), getYesNo());
				if(optInfo > 0) {
					PSGame.gameData.battleInformation = (optInfo == 1 ? true : false);
				}				
				break;
			case 3:
				int delay = PSMenu.Prompt(PSGame.getString("Menu_Options_Delay_Desc"), 
						new String[]{	PSGame.getString("Menu_Options_Delay_4"), 
										PSGame.getString("Menu_Options_Delay_3"), 
										PSGame.getString("Menu_Options_Delay_2"), 
										PSGame.getString("Menu_Options_Delay_1")});
				if(delay > 0) {
					PSGame.gameData.dungeonDelay = 5 - delay;
				}
				break;
			case 4:
				PSGame.languageMenu(100, 30);
				break;
			case 5:
				if(PSMenu.Prompt(PSGame.getString("Menu_Exit_Prompt"), PSGame.getYesNo())==1) {
					PSMenu.setMapOff();
					PSGame.mapswitch("Title.map", 0, 0, false);
					PSMenu.instance.pop();
					return true;
				}
				break;
		}
		
		PSMenu.instance.pop();
		return false;
	}


	/**
	 *	Display the player stats 
	 */
	private static void statMenu() {
		int partySel = 1;
		if(PSGame.getParty().partySize() > 1) {
			PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true));
			partySel = PSMenu.instance.waitOpt(Cancellable.TRUE) + 1;
			if(partySel == 0) {
				PSMenu.instance.pop();
				return;
			}
		}
		
		PartyMember p = PSGame.getParty().getMember(partySel-1);
			
		PSMenu.instance.push(PSMenu.instance.createImageBox(88, 10, PSGame.getImage(p.portrait), true));					
			
		List<String> infoList = new ArrayList<String>();				
		infoList.add(" " + p.getName().toUpperCase());
		infoList.add("");
		infoList.add(format(" " + p.getSpe().toString(), 10, true));
		infoList.add(format(" " + p.getJob().toString(), 10, true));
		infoList.add("");
		infoList.add(format(" " + PSGame.getString("Stats_Level") + " " + p.level, 10, false));
		infoList.add(" " + PSGame.getString("Stats_HP") + ":" + format(p.hp, 4) + "/" + format(p.getMaxHp(), 4));
		infoList.add(" " + PSGame.getString("Stats_MP") + ":" + format(p.mp, 4) + "/" + format(p.getMaxMp(), 4));			
			
		PSMenu.instance.push(PSMenu.instance.createLabelBox(200, 10, infoList.toArray(new String[0]), true));
			
		List<String> statsList = new ArrayList<String>();	
		statsList.add(format(PSGame.getString("Stats_Strength"), 8, true) + ": " + format(p.getStr(), 3));
		statsList.add("");
		statsList.add(format(PSGame.getString("Stats_Agility"), 8, true) + ": " + format(p.getAgi(), 3));
		statsList.add("");
		statsList.add(format(PSGame.getString("Stats_Mental"), 8, true)  + ": " + format(p.getMental(), 3));
		statsList.add("");
		statsList.add(format(PSGame.getString("Stats_Attack"), 8, true)  + ": " + format(p.getAtk(), 3));
		statsList.add("");
		statsList.add(format(PSGame.getString("Stats_Defense"), 8, true) + ": " + format(p.getDef(), 3));
		statsList.add("");
		statsList.add(format(PSGame.getString("Stats_Exp"), 4, true) + ": " + format(p.xp, 7));
			
		PSMenu.instance.push(PSMenu.instance.createLabelBox(200, 110, statsList.toArray(new String[0]), true));

		List<String> equipList = new ArrayList<String>();
		for(int i=0; i<EquipPlace.values().length; i++) {
			if(!equipList.isEmpty()) {
				equipList.add(format("", 15, false));	
			}
			if(p.equipment[i] != null) {
				equipList.add(p.equipment[i].getName());
			} else {
				equipList.add(format("", 15, false));
			}
		}
		
		PSMenu.instance.push(PSMenu.instance.createLabelBox(70, 130, equipList.toArray(new String[0]), true));
			
		PSMenu.instance.waitAnyButton();
			
		if(p.spells != null && p.spells.size() > 0) {
			PSMenu.instance.push(PSMenu.instance.createLabelBox(55, 80, spacedList(p.listSpells(EffectPlace.WORLD)), true));
			PSMenu.instance.push(PSMenu.instance.createLabelBox(160, 80, spacedList(p.listSpells(EffectPlace.BATTLE)), true));
			PSMenu.instance.waitAnyButton();
			PSMenu.instance.pop();
			PSMenu.instance.pop();
		}
			
		PSMenu.instance.pop();
		PSMenu.instance.pop();
		PSMenu.instance.pop();
		PSMenu.instance.pop();
		
		if(PSGame.getParty().partySize() > 1) {
			PSMenu.instance.pop();
			statMenu();
		}
	}

	/** Opens up a magic menu, if the selected player is capable of casting spells 
	 * 
	 * @param statusLabelBox (so it can update it after specific magic effects)
	 * @return boolean (true if must close all screens, like 'Fly' effect; false, otherwise)
	 */
	private static boolean magicMenu(MenuLabelBox statusLabelBox) {
		EffectOutcome outcome = EffectOutcome.NONE;
		int partySel = 1;

		if(PSGame.getParty().partySize() > 1) {
			PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true));
		}
		
		do {
			if(PSGame.getParty().partySize() > 1) {
				partySel = PSMenu.instance.waitOpt(Cancellable.TRUE) + 1;
				if(partySel == 0) {
					break;
				}
			}
	
			PartyMember chosenMember = PSGame.getParty().getMember(partySel-1);
			if(chosenMember.hp <= 0) {
				PSMenu.Stext(PSGame.getString("Battle_Player_Dead", "<player>", chosenMember.getName()));
			}
			else if(chosenMember.getSpells(EffectPlace.WORLD).size() == 0) {
				PSMenu.Stext(PSGame.getString("Magic_NotLearned", "<player>", chosenMember.getName()));
			}
			else {
				PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 50, chosenMember.listSpells(EffectPlace.WORLD), true));
				int chosenSpell = PSMenu.instance.waitOpt(Cancellable.TRUE);
				if(chosenSpell != -1) {
					Spell spell = chosenMember.getSpells(EffectPlace.WORLD).get(chosenSpell);
					PSEffect effect = PSLibSpell.prepareSpell(spell, chosenMember);
					if(effect != null) {
						outcome = PSLibSpell.castSpell(spell, effect);
						statusLabelBox.updateText(getBasicStats());
					}
				}
				PSMenu.instance.pop();
			}
	
		} while (PSGame.getParty().partySize() > 1 && outcome != EffectOutcome.CLOSE_ALL);

		if(PSGame.getParty().partySize() > 1) {
			PSMenu.instance.pop();
		}
		
		if(outcome == EffectOutcome.CLOSE_ALL) {
			return true;
		}
		return false;
	}
	

	private static boolean itemMenu(MenuLabelBox statusLabelBox) {
		EffectOutcome outcome = EffectOutcome.NONE;
		int partySel = 1;

		if(PSGame.getParty().partySize() > 1) {
			PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true));
		}
		
		do {
			if(PSGame.getParty().partySize() > 1) {
				partySel = PSMenu.instance.waitOpt(Cancellable.TRUE) + 1;
				if(partySel == 0) {
					break;
				}
			}

			PartyMember chosenMember = PSGame.getParty().getMember(partySel-1);
			if(chosenMember.hp <= 0) {
				PSMenu.Stext(PSGame.getString("Battle_Player_Dead", "<player>", chosenMember.getName()));
			}
			else if(chosenMember.items.size() == 0) {
				PSMenu.Stext(PSGame.getString("Menu_No_Items", "<player>", chosenMember.getName()));
			}
			else {
				// Item list
				PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 10, Item.toString(chosenMember.items, false), true));
				int optItem = PSMenu.instance.waitOpt(Cancellable.TRUE);
				
				if(optItem >= 0) {

					Item chosenItem = chosenMember.items.get(optItem);
					// Item action
					if(PSGame.getParty().partySize() > 1) {
						PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 80, 
								new String[]{PSGame.getString("Menu_Select_Item_Use"),
										PSGame.getString("Menu_Select_Item_Equip"),
										PSGame.getString("Menu_Select_Item_Drop"),
										PSGame.getString("Menu_Select_Item_Give")}, true));
					} else {
						PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 80, 
								new String[]{PSGame.getString("Menu_Select_Item_Use"),
										PSGame.getString("Menu_Select_Item_Equip"),
										PSGame.getString("Menu_Select_Item_Drop")}, true));
					}
					
					int itemAction = PSMenu.instance.waitOpt(Cancellable.TRUE);

					if(itemAction == 0) { // USE
						
						PSEffect effect = PSLibItem.prepareItem(chosenItem, chosenMember);
						if(effect != null) {
							PSMenu.Stext(PSGame.getString("Item_Use", "<item>", chosenItem.getName(), "<player>", chosenMember.getName()));
							outcome = effect.callEffect();
							if(outcome == EffectOutcome.NONE || outcome == EffectOutcome.FAIL) {
								PSMenu.StextLast(PSGame.getString("Item_NoEffect"));
							} else {
								statusLabelBox.updateText(getBasicStats());
								if(chosenItem.getCost() > 0) {
									chosenMember.items.remove(chosenItem);
								}
							}
						}
						
					} else if (itemAction == 1) { // EQUIP
						
						if (!chosenItem.isEquippable()) {
							PSMenu.StextLast(PSGame.getString("Item_Dont_Equip"));
						} else if (!chosenMember.canEquip(chosenItem.type)) {
							PSMenu.StextLast(PSGame.getString("Item_Cant_Equip", "<item>", chosenItem.getName(), "<player>", chosenMember.getName()));
						} else {
							chosenMember.equipItem(chosenItem);
							PSMenu.StextLast(PSGame.getString("Item_Equip", "<item>", chosenItem.getName(), "<player>", chosenMember.getName()));
							chosenMember.items.remove(chosenItem);
						}
					} else if (itemAction == 2) { // DROP
						if(chosenItem.getCost() > 0) {
							PSMenu.StextLast(PSGame.getString("Item_Discarded", "<player>", chosenMember.getName(), "<item>", chosenItem.getName()));
							chosenMember.items.remove(chosenItem);
						} else {
							PSMenu.StextLast(PSGame.getString("Item_Cant_Drop", "<item>", chosenItem.getName()));
						}
					} else if (itemAction == 3) { // GIVE
						int giveToWhom = PSMenu.Prompt(PSGame.getString("Item_Give_Whom", "<item>", chosenItem.getName()), getParty().listMembers());
						if (giveToWhom != 0) {
							
							PartyMember receiver = getParty().getMember(giveToWhom-1);
							if(!receiver.equals(chosenMember)) {
								
								if(receiver.isFull()) {
									PSMenu.StextLast(PSGame.getString("Item_Give_Player_Full", "<player>", receiver.getName()));
								}
								else {
									PSMenu.StextLast(PSGame.getString("Item_Give_Player", "<player>", chosenMember.getName(), "<item>", chosenItem.getName(), "<receiver>", receiver.getName()));
									receiver.items.add(chosenItem);
									chosenMember.items.remove(chosenItem);
								}
							}
						}
					}
					
					PSMenu.instance.pop(); // item action
				}
				
				PSMenu.instance.pop(); // item list
			}

		} while (PSGame.getParty().partySize() > 1 && outcome != EffectOutcome.CLOSE_ALL);


		if(PSGame.getParty().partySize() > 1) {
			PSMenu.instance.pop();					
		}
		
		if(outcome == EffectOutcome.CLOSE_ALL) {
			return true;
		}
		return false;
	}
	

	private static <T> String[] spacedList(String[] listString) {
		String[] s = new String[listString.length*2 -1];
		int pos = 0;
		for(String i: listString) {
			if(pos!=0) {
				s[pos++] = "            ";
			}
			s[pos++] = i; 
		}
		return s;
	}

	private static String[] getBasicStats() {
		// Basic Status screen
		int pos = 0;
		String[] s = new String[PSGame.getParty().partySize()*4-1];
		for(PartyMember p: PSGame.getParty().getMembers()) {
			boolean isDead = p.getHp() <= 0;
			s[pos++] = (isDead ? "<RED>" : "") + format(p.getName(), 6, true) + format(" LV " + p.level, 7, false);
			s[pos++] = (isDead ? "<RED>" : "") + " HP:" + format(p.hp, 4) + "/" + format(p.getMaxHp(), 4);
			s[pos++] = (isDead ? "<RED>" : "") + " MP:" + format(p.mp, 4) + "/" + format(p.getMaxMp(), 4);			
			if(pos<s.length)
				s[pos++] = "";
		}
		return s;
	}

	private static void orderMenu() {
		
		if(PSGame.getParty().partySize() == 1) {
			PSMenu.Stext("You have only one member in the party!");			
			return;
		}

		int order[] = new int[PSGame.getParty().partySize()];

		// Left are the full party, right are empty slots
		String strLeft[] = PSGame.getParty().listMembers();
		String strRight[] = new String[PSGame.getParty().partySize()];
		for(int i=0; i<strRight.length;i++) {
			strRight[i] = "> -- <"; // FOR Max of 6-name length
		}

		MenuLabelBox lblBox = PSMenu.instance.createLabelBox(75, 130, strRight, true);
		PSMenu.instance.push(lblBox);
		
		int chosen = 0;
		while(chosen < strRight.length) {
			PSMenu.instance.push(PSMenu.instance.createPromptBox(10, 130, strLeft, chosen==0));
			int opt = PSMenu.instance.waitOpt(Cancellable.TRUE);
			
			if(opt==-1) { // Cancel: return without changing the order
				PSMenu.instance.pop();
				PSMenu.instance.pop();
				return;
			} else {
				if(!strLeft[opt].equals("")) { // Just if not previously chosen
					lblBox.updateText(chosen, strLeft[opt]);
					order[chosen] = opt;
					strLeft[opt] = "";
					chosen++;
				}
			}
			PSMenu.instance.pop();
		}
		PSGame.getParty().setOrder(order);
		PSGame.getParty().reallocate();
		
		PSMenu.instance.pop();
	}
	
	private static void listVisitedEnemies(Type type) {
		
		List<String> l = new ArrayList<String>();
		for(GenericEnemy e: PSGame.getEnemyLib().keySet()) {
			Enemy en = PSGame.getEnemyLib().get(e);
			if(en.type == type) {
				if(PSGame.gameData.visitedEnemies.contains(e)) {				
					l.add(en.getName());
				}
				else {
					l.add("???");
				}
			} 
		}
		int maxSize = 12;
		for(int i=0; i<=l.size()/maxSize; i++) {
			String[] strEnemies = new String[Math.min(maxSize, l.size()-i*maxSize)];
			for(int li=0; li<strEnemies.length; li++) {
				strEnemies[li] = l.get(i*maxSize + li);
			}
			
			PSMenu.instance.push(PSMenu.instance.createPromptBox(100+i*40, 5, strEnemies, true));
			PSMenu.instance.waitOpt(Cancellable.TRUE);
		}
		for(int i=0; i<=l.size()/maxSize; i++) {
			PSMenu.instance.pop();
		}
		
		
	}

	public static void cheatMenu() {
		PSMenu.menuOff();
		PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 30, new String[]{
				"Level up", 
				"Kill", 
				PSGame.getString("Spell_Fly"), 
				"Immaterial", 
				"Mesetas",
				"Equip",
				"Item",
				PSGame.getString("Spell_Light"), 
				"Battle"
		}, true));
		
		int opt = PSMenu.instance.waitOpt(Cancellable.TRUE);
		switch(opt) {

			case 0: // Level up 
				for(int i=0;i<PSGame.getParty().listMembers().length;i++) {
					for(int j=0;j<11;j++) {
						PSGame.getParty().getMember(i).advanceLevel();
					}
					PSGame.getParty().getMember(i).heal();
				}
				break;
				
			case 1: // Kill
				int killwho = PSMenu.Prompt("Kill who?", PSGame.getParty().listMembers());
				if(killwho > 0) {
					PSGame.getParty().getMember(killwho-1).hp = 0;
				}
				if(!PSGame.checkAlive()) {
					PSGame.gameOverRoutine();
				}
				else {
					PSGame.getParty().reallocate();
				}
			
				break;
			
			case 2: // Ryuka
				List<City> lstCities = City.getVisitedCitiesFromPlanet(Planet.PALMA, null);
				lstCities.addAll(City.getVisitedCitiesFromPlanet(Planet.MOTAVIA, null));
				lstCities.addAll(City.getVisitedCitiesFromPlanet(Planet.DEZORIS, null));
				String[] strCities = new String[lstCities.size()];
				for(int i=0; i<lstCities.size(); i++) {
					strCities[i] = lstCities.get(i).toString();
				}
				
				PSMenu.instance.push(PSMenu.instance.createPromptBox(140, 5, strCities, true));
				opt = PSMenu.instance.waitOpt(Cancellable.TRUE);
				PSMenu.instance.pop();
				if(opt >= 0) {
					City chosenCity = lstCities.get(opt);
					PSGame.mapswitch(chosenCity.planet, chosenCity.getX(), chosenCity.getY());
				}
				
				break;
			
			case 3: 
				entities.get(player).setObstructable(!entities.get(player).isObstructable());
				break;
			
			case 4:
				PSGame.chest(10000, Trapped.EXPLOSION, null);
				return;
				
			case 5: 
				PSGame.getParty().getMember(0).equipItem(PSGame.getItem(OriginalItem.Weapon_Laconian_Sword));
				PSGame.getParty().getMember(0).equipItem(PSGame.getItem(OriginalItem.Armor_Diamond_Mail));
				PSGame.getParty().getMember(0).equipItem(PSGame.getItem(OriginalItem.Shield_Laconian_Shield));

				if(PSGame.getParty().getMembers().size() > 1) {
					PSGame.getParty().getMember(1).equipItem(PSGame.getItem(OriginalItem.Weapon_Silver_Tusk));
					PSGame.getParty().getMember(1).equipItem(PSGame.getItem(OriginalItem.Armor_Saber_Fur));
					PSGame.getParty().getMember(1).equipItem(PSGame.getItem(OriginalItem.Shield_Animal_Glove));
				}
				
				if(PSGame.getParty().getMembers().size() > 2) {
					PSGame.getParty().getMember(2).equipItem(PSGame.getItem(OriginalItem.Weapon_Laser_Gun));
					PSGame.getParty().getMember(2).equipItem(PSGame.getItem(OriginalItem.Weapon_Laconian_Axe));
					PSGame.getParty().getMember(2).equipItem(PSGame.getItem(OriginalItem.Armor_Laconian_Armor));
					PSGame.getParty().getMember(2).equipItem(PSGame.getItem(OriginalItem.Shield_Mirror_Shield));
				}
				
				if(PSGame.getParty().getMembers().size() > 3) {				
					PSGame.getParty().getMember(3).equipItem(PSGame.getItem(OriginalItem.Weapon_Psycho_Wand));
					PSGame.getParty().getMember(3).equipItem(PSGame.getItem(OriginalItem.Armor_Frad_Cloak));
					PSGame.getParty().getMember(3).equipItem(PSGame.getItem(OriginalItem.Shield_Laser_Barrier));
				}

				break;
			
			case 6: // Item 
				PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Road_Pass));
				PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Passport));
				PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Dungeon_Key));

				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Monomate));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Dimate));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Trimate));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_TranCarpet));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Flash));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Light_Pendant));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Telepathy_Ball));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Magic_Hat));
				PSGame.getParty().getMember(0).items.add(getItem(OriginalItem.Inventory_Escape_Cloth));
				
				break;
			
			case 7:
				PSGame.currentDungeon.setLight();
				break;
				
			case 8: 
				PSMenu.instance.pop();
				PSMenu.instance.pop();
				PSMenu.instance.pop();
				PSMenu.instance.pop();
				PSBattle battle = new PSBattle();
				battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.SORCERER), 2);
				return;
				
			default:
				break;
		}
		
		PSMenu.instance.pop();
		PSMenu.menuOn();
	}
	
	
	
}
