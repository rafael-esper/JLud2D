package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.Outcome;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Uzo {

	private static final Logger log = LogManager.getLogger(Uzo.class);

	public static void hospital() {
		PSMenu.startScene(Scene.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BROWN, EntityClothes.WHITE);
		PSGame.Hospital(1);
		PSMenu.endScene();
	}
	
	public static void church() {
		PSMenu.startScene(Scene.CHURCH_VILLAGE, SpecialEntity.PRIEST);
		PSGame.Church(1);
		PSMenu.endScene();
	}	
	
	public static void food_shop() {
		PSMenu.startScene(Scene.SHOP_FOOD_VILLAGE, EntityType.VILLA_WMN_BROWN, EntityClothes.BLUE);
		Shop(getString("Shop_Pharmacy_Welcome"), false, new Item[]{	getItem(OriginalItem.Inventory_Monomate),
																	getItem(OriginalItem.Inventory_Dimate)});
		PSMenu.endScene();
	}	
	public static void weap_shop() {
		PSMenu.startScene(Scene.SHOP_WEAPON_VILLAGE, EntityType.VILLA_MAN_BROWN, EntityClothes.RED);
		Shop(getString("Shop_Weapon_Welcome"), false, new Item[]{	getItem(OriginalItem.Weapon_Silver_Tusk), // CHANGED
																	getItem(OriginalItem.Weapon_Light_Saber),
																	getItem(OriginalItem.Armor_Saber_Fur)}); // NEW!
		PSMenu.endScene();
	}	
	
	
	public static void house1() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.BLUE);
		if(PSMenu.Prompt(getString("Uzo_House_1"), getYesNo()) == 1) {
			PSMenu.StextLast(getString("Uzo_House_1Yes"));
		} else {
			PSMenu.StextLast(getString("Uzo_House_1No"));
			PSGame.setFlag(Flags.INFO_FLUTE);
		}
		PSMenu.endScene();
	}
	public static void house2() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.GREEN);
		PSMenu.Stext(getString("Uzo_House_2"));
		PSMenu.endScene();
	}
	public static void house3() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.VILLA_WMN_BROWN, EntityClothes.RED);
		PSMenu.Stext(getString("Uzo_House_3"));
		PSMenu.endScene();
	}
	public static void house4() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.VILLA_MAN_BROWN, EntityClothes.GREEN);
		PSMenu.Stext(getString("Uzo_House_4"));
		PSMenu.endScene();
	}

	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Uzo_People_Ent2"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Uzo_People_Ent1"));
		EntFinish();
	}
	
	public static void exit() {
		mapswitch(Planet.MOTAVIA, City.UZO.getX(), City.UZO.getY());
	}

	public static void spaceship() {
		PSMenu.startScene(Scene.DESERT, LargeEntity.HAPSBY);
		PSGame.hapsbyRoutine(City.UZO);
		PSMenu.endScene(Outcome.FADE_HOUSE);
	}

	
	
}
