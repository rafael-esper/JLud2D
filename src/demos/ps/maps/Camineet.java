package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.EntFinish;
import static demos.ps.oo.PSGame.EntStart;
import static demos.ps.oo.PSGame.Shop;
import static demos.ps.oo.PSGame.getItem;
import static demos.ps.oo.PSGame.getParty;
import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.getYesNo;
import static demos.ps.oo.PSGame.mapswitch;
import demos.ps.oo.Dungeon;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Camineet {

	private static final Logger log = LogManager.getLogger(Camineet.class);

	public static void alis() {
		if(PSGame.getGameType() == GameType.PS_ORIGINAL) {		
			PSMenu.startScene(Scene.YELLOW_HOUSE, SpecialEntity.NONE);
			PSMenu.Stext(getString("Camineet_House_Alis"));
			PSMenu.endScene();		
		}
		else {
			PSMenu.startScene(Scene.YELLOW_HOUSE, LargeEntity.ALIS);
			PSMenu.Stext(getString("Camineet_House_Alis_Odin"));
			PSMenu.endScene();		
		}
	}

	public static void warehouse() {
		PSGame.mapswitch(Dungeon.WAREHOUSE);
	}
	
	public static void church() {
		PSMenu.startScene(Scene.CHURCH, SpecialEntity.PRIEST);
		PSGame.Church(1);
		PSMenu.endScene();
	}
	
	public static void yellow() { // house
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
		PSMenu.Stext(getString("Camineet_House_Man"));
		PSMenu.endScene();
	}

	public static void oldman() { // house
		PSMenu.startScene(Scene.BLUE_HOUSE, SpecialEntity.OLDMAN);
		if(PSMenu.Prompt(getString("Camineet_House_Oldman"), getYesNo()) == 1) {
			PSMenu.StextLast(getString("Camineet_House_Oldman_Yes"));
		}
		else {
			PSMenu.StextNext(getString("Camineet_House_Oldman_No"));
			PSMenu.StextLast(getString("Camineet_House_Oldman_NoCrisis"));
		}
		
		PSMenu.endScene();
	}
	
	public static void nekise() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
		if(PSGame.getGameType() == GameType.PS_ORIGINAL) {
			if(!PSGame.hasFlag(Flags.VISIT_NEKISE)) {
				PSGame.setFlag(Flags.VISIT_NEKISE);
				PSMenu.StextFirst(getString("Camineet_House_Nekise_intro"));
				PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Laconian_Pot));
				PSMenu.StextLast(getString("Camineet_House_Nekise_greet"));
			}
			else {
				PSMenu.Stext(getString("Camineet_House_Nekise_greet"));
			}
		}
		else {
			PSMenu.Stext(getString("Camineet_House_Nekise_Odin"));
		}
		PSMenu.endScene();
	}
	
	public static void suelo() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.RED);
		
		if(PSGame.getGameType() == GameType.PS_ORIGINAL) {
			if(!PSGame.hasFlag(Flags.VISIT_SUELO)) {
				PSGame.setFlag(Flags.VISIT_SUELO);
				PSMenu.StextFirst(getString("Camineet_House_Suelo_intro1"));
				PSMenu.StextNext(getString("Camineet_House_Suelo_intro2"));
				PSMenu.StextNext(getString("Camineet_House_Suelo_intro3"));
				PSMenu.StextLast(getString("Camineet_House_Suelo_greet"));
			}
			else {
				PSMenu.Stext(getString("Camineet_House_Suelo_greet"));			
			}
			PSGame.playSound(PS1Sound.CURE);
			getParty().healAll(false);
		}
		else {
			PSMenu.Stext(getString("Camineet_House_Suelo_Odin"));
		}
		PSMenu.endScene();
	}
	
	public static void weap_shop() {
		PSMenu.startScene(Scene.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
		Shop(getString("Shop_Weapon_Welcome"), false, new Item[]{	getItem(OriginalItem.Shield_Leather_Shield),
																		getItem(OriginalItem.Shield_Iron_Shield),
																		getItem(OriginalItem.Shield_Ceramic_Shield)});
		PSMenu.endScene();
	}
	public static void food_shop() {
		PSMenu.startScene(Scene.SHOP_FOOD, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		Shop(getString("Shop_Pharmacy_Welcome"), false, new Item[]{	getItem(OriginalItem.Inventory_Monomate),
																		getItem(OriginalItem.Inventory_Dimate)});
		PSMenu.endScene();
	}
	public static void hand_shop() {
		PSMenu.startScene(Scene.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
		Shop(getString("Shop_Tool_Welcome"), true, new Item[]{	getItem(OriginalItem.Inventory_Flash),
																	getItem(OriginalItem.Inventory_Escape_Cloth),
																	getItem(OriginalItem.Inventory_TranCarpet)});
		PSMenu.endScene();
	}	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Camineet_People_Ent1"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Camineet_People_Ent2"));
		EntFinish();
	}
	public static void ent3() {
		EntStart();
		PSMenu.Stext(getString("Camineet_People_Ent3"));
		EntFinish();
	}
	public static void ent4() {
		EntStart();
		PSMenu.Stext(getString("Camineet_People_Ent4"));
		EntFinish();
	}
	public static void exit1() {
		mapswitch(Planet.PALMA,84,49);		
	}
	public static void exit2() {
		mapswitch(Planet.PALMA,82,49);		
	}	

	public static void spaceport() {
		if(!PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Road_Pass))) {
			PSMenu.Stext(getString("Camineet_People_Cop_No_Pass"));
		} else {
			PSMenu.Stext(getString("Camineet_People_Cop_Pass"));
			mapswitch(Planet.PALMA,81,46);
		}
	}
	
	public static void robot1() {
		EntStart();
		PSMenu.Stext(getString("Camineet_People_Cop1"));
		EntFinish();
	}
	public static void robot2() {
		EntStart();
		PSMenu.Stext(getString("Camineet_People_Cop2"));
		EntFinish();
	}
	
	
}
