package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenuShop;

public class Scion {

	private static final Logger log = LogManager.getLogger(Scion.class);

	
	public static void hospital() {
		PSMenu.startScene(Scene.HOSPITAL, EntityType.CITY_WMN_BLOND, EntityClothes.WHITE);
		PSGame.Hospital(1);
		PSMenu.endScene();
	}

	public static void weap_shop() {
		PSMenu.startScene(Scene.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
		Shop(getString("Shop_Weapon_Welcome"), false, new Item[]{	getItem(OriginalItem.Armor_Light_Suit),
																	getItem(OriginalItem.Armor_Iron_Armor),
																	getItem(OriginalItem.Armor_Titanium_Mail)}); // changed
		PSMenu.endScene();
	}	
	
	
	public static void hand_shop() {
		PSMenu.startScene(Scene.SHOP_HAND, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
		
		if(PSGame.getGameType() == GameType.PS_ORIGINAL) {
		
			if(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
				Shop(getString("Shop_Tool_Welcome"), true, new Item[]{	getItem(OriginalItem.Inventory_Flash),
																		getItem(OriginalItem.Inventory_Escape_Cloth),
																		getItem(OriginalItem.Quest_Secret_Thing)});
			}
			else {
				Shop(getString("Shop_Tool_Welcome"), true, new Item[]{	getItem(OriginalItem.Inventory_Flash),
																		getItem(OriginalItem.Inventory_Escape_Cloth)});
			}
		}
		else if(PSGame.getGameType() == GameType.PS_START_AS_ODIN) {
			Shop(getString("Shop_Tool_Welcome"), true, new Item[]{	getItem(OriginalItem.Inventory_Flash),
																	getItem(OriginalItem.Inventory_Escape_Cloth),
																	getItem(OriginalItem.Quest_Compass)});
		}
		
			
			PSMenu.endScene();
	}
	
	public static void secret_item() {

		if(!PSGame.hasFlag(Flags.SCION_INSIST_1)) {
			PSMenu.StextLast(PSGame.getString("Scion_Second_Hand_Shop_Secret1"));
			PSGame.setFlag(Flags.SCION_INSIST_1);
		}
		else if(!PSGame.hasFlag(Flags.SCION_INSIST_2)) {
			PSMenu.StextLast(PSGame.getString("Scion_Second_Hand_Shop_Secret2"));
			PSGame.setFlag(Flags.SCION_INSIST_2);
		} 
		else {
			PSGame.getParty().mst -= PSGame.getItem(OriginalItem.Quest_Secret_Thing).getCost();
			PSMenuShop.mstBox.updateText(0, "MST " + PSGame.getParty().mst);
			PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass));
			PSMenu.StextLast(PSGame.getString("Scion_Second_Hand_Shop_Secret3"));
		}
	}
	
	public static void house1() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		PSMenu.Stext(getString("Scion_House_1"));
		PSMenu.endScene();
	}

	public static void house2() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_WMN_BLOND, EntityClothes.GREEN);
		PSMenu.Stext(getString("Scion_House_2"));
		PSMenu.endScene();
	}

	public static void house3() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		PSMenu.Stext(getString("Scion_House_3"));
		PSMenu.endScene();
	}

	public static void house4() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
		if(!PSGame.hasFlag(Flags.GOT_MYAU) && PSGame.getGameType() == GameType.PS_ORIGINAL) {
			PSMenu.Stext(getString("Scion_House_4_PreMyau"));
		} else {
			PSMenu.Stext(getString("Scion_House_4_AfterMyau"));
		}
		PSMenu.endScene();
	}

	public static void house5() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
		PSMenu.Stext(getString("Scion_House_5"));
		PSMenu.endScene();
	}

	public static void house6() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
		if(!PSGame.hasFlag(Flags.GOT_MYAU) && PSGame.getGameType() == GameType.PS_ORIGINAL) {
			PSMenu.Stext(getString("Scion_House_6_PreMyau"));
		} else {
			PSMenu.Stext(getString("Scion_House_6_AfterMyau"));
		}
		PSMenu.endScene();
	}

	public static void house7() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		PSMenu.Stext(getString("Scion_House_7"));
		PSMenu.endScene();
	}
	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Scion_People_Ent1"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Scion_People_Ent2"));
		EntFinish();
	}

	public static void exit() {
		mapswitch(Planet.PALMA, City.SCION.getX(),City.SCION.getY());
	}
	
}
