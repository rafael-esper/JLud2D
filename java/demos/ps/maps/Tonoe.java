package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.Enemy;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.MotaCape;
import demos.ps.oo.PSMenu.Outcome;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Tonoe {

	private static final Logger log = LogManager.getLogger(Tonoe.class);

	public static void church() {
		PSMenu.startScene(Scene.CHURCH_VILLAGE, EntityType.MOTA_CAP, MotaCape.YELLOW);
		PSGame.Church(1);
		PSMenu.endScene();
	}	
	
	public static void food_shop() {
		PSMenu.startScene(Scene.SHOP_FOOD_VILLAGE, EntityType.MOTA_CAP, MotaCape.YELLOW);
		Shop(getString("Shop_Pharmacy_Welcome"), false, new Item[]{	getItem(OriginalItem.Inventory_Monomate),
																	getItem(OriginalItem.Inventory_Dimate),
																	getItem(OriginalItem.Inventory_Trimate)});
		PSMenu.endScene();
	}	
	public static void hand_shop() {
		PSMenu.startScene(Scene.SHOP_HAND_VILLAGE, EntityType.MOTA_NOCAP, MotaCape.GREEN);
		Shop(getString("Shop_Tool_Welcome"), true, new Item[]{	getItem(OriginalItem.Quest_Alsuline)});
		PSMenu.endScene();
	}	
	
	
	public static void chief_house() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.MOTA_CUSTOM, MotaCape.RED);
		PSMenu.Stext(getString("Tonoe_House_Chief"));
		PSMenu.endScene();		 
	}
	
	public static void house1() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.MOTA_NOCAP, MotaCape.YELLOW);
		if(PSMenu.Prompt(getString("Tonoe_House_1"), getYesNo()) == 1) {
			PSMenu.StextLast(getString("Tonoe_House_1Yes"));
		} else {
			PSMenu.StextLast(getString("Tonoe_House_1No"));
		}
		PSMenu.endScene();
	}
	public static void house2() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.MOTA_CAP, MotaCape.RED);
		PSMenu.Stext(getString("Tonoe_House_2"));
		PSMenu.endScene();
	}
	public static void house3() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.MOTA_MASK, MotaCape.GREEN);
		if(!PSGame.hasFlag(Flags.INFO_TONOE_DAUGHTER)) {
			PSMenu.Stext(getString("Tonoe_House_3"));	
		}
		else {
			PSMenu.Stext(getString("Tonoe_House_3_Rescue"));
			PSGame.playSound(PS1Sound.CURE);
			getParty().healAll(false);
		}
		PSMenu.endScene();
	}
	public static void house4() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.MOTA_MASK, MotaCape.BROWN);
		PSMenu.Stext(getString("Tonoe_House_4"));
		PSMenu.endScene();
	}
	public static void house5() {
		PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.MOTA_CUSTOM, MotaCape.GREEN);
		PSMenu.Stext(getString("Tonoe_House_5"));
		PSMenu.endScene();
	}
	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Tonoe_People_Ent1"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Tonoe_People_Ent2"));
		EntFinish();
	}
	public static void ent3() {
		EntStart();
		PSMenu.Stext(getString("Tonoe_People_Ent3"));
		EntFinish();
	}
	
	public static void exit() {
		mapswitch(Planet.MOTAVIA, City.TONOE.getX(), City.TONOE.getY());
	}

	public static void cave() {
		mapswitch(Dungeon.BLUEBERRY_MINE);
	}

	
	
}
