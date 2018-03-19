package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.screen;
import static demos.ps.oo.PSGame.EntFinish;
import static demos.ps.oo.PSGame.EntStart;
import static demos.ps.oo.PSGame.Shop;
import static demos.ps.oo.PSGame.getItem;
import static demos.ps.oo.PSGame.getParty;
import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.getYesNo;
import static demos.ps.oo.PSGame.mapswitch;
import core.Script;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.Enemy;
import demos.ps.oo.Item;
import demos.ps.oo.Job;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PartyMember;
import demos.ps.oo.Specie;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.PartyMember.Gender;
import domain.VImage;

public class Paseo {

	private static final Logger log = LogManager.getLogger(Paseo.class);

	
	public static void hospital() {
		PSMenu.startScene(Scene.HOSPITAL, EntityType.CITY_WMN_BROWN, EntityClothes.WHITE);
		PSGame.Hospital(1);
		PSMenu.endScene();
	}

	public static void church() {
		PSMenu.startScene(Scene.CHURCH, SpecialEntity.PRIEST);
		PSGame.Church(1);
		PSMenu.endScene();
	}
	
	public static void weap_shop() {
		PSMenu.startScene(Scene.SHOP_WEAPON, EntityType.CITY_MAN_BROWN, EntityClothes.RED);
		Shop(getString("Shop_Weapon_Welcome"), false, new Item[]{	getItem(OriginalItem.Shield_Light_Barrier),
																	getItem(OriginalItem.Armor_Spiky_Fur),
																	getItem(OriginalItem.Armor_Zirconian_Mail)}); // changed
		PSMenu.endScene();
	}	
	
	public static void hand_shop() {
		PSMenu.startScene(Scene.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.BLUE);
		Shop(getString("Shop_Tool_Welcome"), true, new Item[]{	getItem(OriginalItem.Inventory_Flash),
																	getItem(OriginalItem.Inventory_Escape_Cloth),
																	getItem(OriginalItem.Inventory_TranCarpet)});
		PSMenu.endScene();
	}	
	
	public static void myau_shop() {
		PSMenu.startScene(Scene.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
		if(PSGame.hasFlag(Flags.GOT_MYAU)) {
			PSMenu.Stext(getString("Paseo_Shop_MyauAfter"));	
		} else {
			if(PSMenu.Prompt(getString("Paseo_Shop_Myau"), getYesNo()) == 1) {
				PSMenu.StextLast(getString("Paseo_Shop_MyauYes"));
			}
			else {
				if(!PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Laconian_Pot))) {
					PSMenu.StextLast(getString("Paseo_Shop_MyauTradeNo"));
				}
				else {
					if(PSMenu.PromptNext(getString("Paseo_Shop_MyauNo"), getYesNo()) == 1) {
						PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Alsuline));
						PSMenu.StextLast(getString("Paseo_Shop_MyauTradeYes"));
						PSGame.getParty().removeItem(getItem(OriginalItem.Quest_Laconian_Pot));
						PSGame.setFlag(Flags.GOT_MYAU);
						
						PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), PS1Image.PORTRAIT_MYAU, "chars/myau.chr"));
						PSGame.getParty().getMember(1).advanceLevel();
						PSGame.getParty().getMember(1).advanceLevel();
						PSGame.getParty().getMember(1).heal();

						PSMenu.instance.back = new VImage(screen.width, screen.height); //.paintBlack();
						PSMenu.instance.entitySprite = null;
						PSGame.playMusic(PS1Music.STORY);
						screen.fadeOut(75, false);
				
						PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{getString("Cinematic_Myau_1")});
						PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_MYAU), new String[]{getString("Cinematic_Myau_2")});
						PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{getString("Cinematic_Myau_3")});
						PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_MYAU), new String[]{getString("Cinematic_Myau_4")});
						PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{getString("Cinematic_Myau_5")});
						PSGame.findAndPlayMusic();
						PSGame.getParty().reallocate();
					}
					else {
						PSMenu.StextLast(getString("Paseo_Shop_MyauTradeNo"));
					}
				}
			}
			
		}
		PSMenu.endScene();
	}
	
	public static void house1() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BROWN, EntityClothes.BLUE);
		PSMenu.Stext(getString("Paseo_House_1"));
		PSMenu.endScene();
	}

	public static void house2() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_WMN_BROWN, EntityClothes.GREEN);
		PSMenu.Stext(getString("Paseo_House_2"));
		PSMenu.endScene();
	}

	public static void house3() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
		PSMenu.Stext(getString("Paseo_House_3"));
		PSMenu.endScene();
	}
	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Paseo_People_Ent1"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Paseo_People_Ent2"));
		EntFinish();
	}
	public static void ent3() {
		EntStart();
		PSMenu.Stext(getString("Paseo_People_Ent3"));
		EntFinish();
	}
	public static void ent4() {
		EntStart();
		PSMenu.Stext(getString("Paseo_People_Ent4"));
		EntFinish();
	}

	public static void tunnel_1() {
		mapswitch(Dungeon.GOVERNOR_IN);
	}
	public static void tunnel_2() {
		mapswitch(Dungeon.GOVERNOR_OUT);		
	}

	public static void rest_house() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_WMN_BROWN, EntityClothes.GREEN);
		PSMenu.Stext(getString("Paseo_Governor_RestHouseBefore"));
		PSGame.playSound(PS1Sound.RESTHOUSE);
		screen.fadeOut(100, false);
		getParty().healAll(false);
		PSGame.playSound(PS1Sound.CURE);
		PSMenu.Stext(getString("Paseo_Governor_RestHouseAfter"));
		PSMenu.endScene();
	}
	
	public static void governor() {
		
		if(PSGame.hasFlag(Flags.DEFEAT_DARKFALZ)) {
			PSGame.playMusic(PS1Music.PALACE);
			PSMenu.startScene(Scene.PALACE, LargeEntity.GOVERNOR);
			PSMenu.Stext(getString("Paseo_Governor_Darkfalz"));
			if(PSMenu.PromptNext(getString("Paseo_Governor_End"), getYesNo()) == 1) {
				PSMenu.StextNext(getString("Paseo_Governor_EndYes"));	
			} else {
				PSMenu.StextNext(getString("Paseo_Governor_EndNo"));
			}
			PSMenu.StextLast(getString("Paseo_Governor_EndOk"));
			
			PSGame.endGameRoutine();
			return;
		}
		else if(PSGame.hasFlag(Flags.DEFEAT_LASSIC)) {
			PSMenu.startScene(Scene.PALACE, SpecialEntity.NONE);
			PSMenu.Stext(getString("Paseo_Mansion_Darkfalz"));
			PSGame.playSound(PS1Sound.TRAP_FALL);
			screen.fadeOut(25, false);
			PSMenu.instance.back = new VImage(screen.width, screen.height);
			PSGame.mapswitch(Dungeon.DARKFALZ_DUNGEON);
			return;
		}
		
		PSMenu.startScene(Scene.PALACE, LargeEntity.GOVERNOR);
		if(!PSGame.hasFlag(Flags.MET_GOVERNOR)) {
			PSMenu.StextNext(getString("Paseo_Governor_Intro"));
			PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Governor_Letter));
			PSMenu.StextLast(getString("Paseo_Governor_Rest"));

			// Resting and dream
			getParty().healAll(false);
			PSGame.playSound(PS1Sound.RESTHOUSE);
			screen.fadeOut(50, false);
			VImage palace = PSMenu.instance.back; 
			PSMenu.instance.back = new VImage(screen.width, screen.height);
			PSMenu.startScene(Scene.SCREEN, SpecialEntity.NONE);
			PSMenu.StextLast(getString("Paseo_Governor_Dream"));
			PSBattle battle = new PSBattle();
			battle.startBattle(new Enemy[]{PSGame.getEnemy(PS1Enemy.SACCUBUS)}, PS1Music.BATTLE);
			getParty().healAll(true);
			PSMenu.StextLast(getString("Paseo_Governor_BadDream"));
			
			PSMenu.instance.back = palace;
			PSMenu.startScene(Scene.SCREEN, LargeEntity.GOVERNOR);	
			PSMenu.StextLast(getString("Paseo_Governor_Greet"));
			PSGame.setFlag(Flags.MET_GOVERNOR);
			
		} else {
			if(PSGame.hasFlag(Flags.GOT_NOAH)) {	
				PSMenu.StextNext(getString("Paseo_Governor_Return"));
				PSMenu.StextLast(getString("Paseo_Governor_Greet"));
			} else {
				PSMenu.StextLast(getString("Paseo_Governor_Greet_BeforeLutz"));				
			}
		}
		
		PSMenu.endScene();
	}
	
	
	public static void robot_sleep() {
		EntStart();
		PSMenu.Stext(getString("Paseo_People_Cop_Passage"));
		EntFinish();
	}
	public static void robot_exit() {
		EntStart();
		PSMenu.Stext(getString("Paseo_People_Cop_Exit"));
		EntFinish();
	}	
	
	public static void motavia() {
		mapswitch(Planet.MOTAVIA, City.PASEO.getX(),City.PASEO.getY());
	}

	public static void spaceport() {
		if(PSGame.hasFlag(Flags.GOT_HAPSBY)) {
			PSMenu.Stext(getString("Spaceport_People_Cop_Closed"));
			if(PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Passport))) {
				PSMenu.StextLast(getString("Spaceport_People_Cop_TakePassport"));
				PSGame.getParty().removeItem(getItem(OriginalItem.Quest_Passport));
			}
			return;
		}
		if(!PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Road_Pass))) {
			PSMenu.Stext(getString("Camineet_People_Cop_No_Pass"));
		} else {
			PSMenu.Stext(getString("Paseo_People_Cop_Pass"));
			mapswitch(Planet.MOTAVIA,78,35);
		}
	}

	
	
}
