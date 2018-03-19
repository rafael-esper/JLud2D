package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;

public class Parolit {

	private static final Logger log = LogManager.getLogger(Parolit.class);

	
	public static void hospital() {
		PSMenu.startScene(Scene.HOSPITAL, EntityType.CITY_WMN_BROWN, EntityClothes.WHITE);
		PSGame.Hospital(1);
		PSMenu.endScene();
	}

	public static void weap_shop() {
		PSMenu.startScene(Scene.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
		Shop(getString("Shop_Weapon_Welcome"), false, new Item[]{	getItem(OriginalItem.Weapon_Iron_Sword),
																		getItem(OriginalItem.Weapon_Titanium_Sword),
																		getItem(OriginalItem.Weapon_Ceramic_Sword)});
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
	
	public static void house1() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_WMN_BLOND, EntityClothes.RED);		
		PSMenu.Stext(getString("Parolit_House_1"));
		PSMenu.endScene();
	}

	public static void house2() {
		PSMenu.startScene(Scene.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
		PSMenu.Stext(getString("Parolit_House_2"));
		PSMenu.endScene();
	}

	public static void house3() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
		PSMenu.Stext(getString("Parolit_House_3"));
		PSMenu.endScene();
	}
	
	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Parolit_People_Ent1"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Parolit_People_Ent2"));
		EntFinish();
	}
	public static void ent3() {
		EntStart();
		PSMenu.Stext(getString("Parolit_People_Ent3"));
		EntFinish();
	}

	public static void spaceport() {
		if(!PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Road_Pass))) {
			PSMenu.Stext(getString("Parolit_People_Cop_No_Pass"));
		} else {
			PSMenu.Stext(getString("Parolit_People_Cop_Pass"));
			mapswitch(Planet.PALMA,70,57);
		}
	}
	
	public static void robot1() {
		EntStart();
		PSMenu.Stext(getString("Parolit_People_Cop1"));
		EntFinish();
	}
	public static void robot2() {
		EntStart();
		PSMenu.Stext(getString("Parolit_People_Cop2"));
		EntFinish();
	}

	public static void exit() {
		mapswitch(Planet.PALMA,City.PAROLIT.getX(),City.PAROLIT.getY());
	}
	
	
	
}
