package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.EntFinish;
import static demos.ps.oo.PSGame.EntStart;
import static demos.ps.oo.PSGame.Shop;
import static demos.ps.oo.PSGame.getItem;
import static demos.ps.oo.PSGame.getString;
import static demos.ps.oo.PSGame.getYesNo;
import static demos.ps.oo.PSGame.mapswitch;
import demos.ps.oo.City;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Bortevo {

	private static final Logger log = LogManager.getLogger(Bortevo.class);

	
	public static void house() {
		PSMenu.startScene(Scene.RUINED_HOUSE, SpecialEntity.BEGGAR);
		PSMenu.Stext(getString("Bortevo_People_Man_2"));
		PSMenu.endScene();
	}

	public static void hapsby() {
		if(!PSGame.hasFlag(Flags.GOT_HAPSBY)) {
			PSMenu.startScene(Scene.RUINED_HOUSE, LargeEntity.JUNK);
		} else {
			PSMenu.startScene(Scene.RUINED_HOUSE, SpecialEntity.NONE);
		}
		
		PSMenu.instance.waitB1();
		if(!PSGame.hasFlag(Flags.GOT_HAPSBY) && PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Polymeteral))) {
			PSMenu.Stext(getString("Bortevo_House_Hapsby"));
			PSMenu.startScene(Scene.SCREEN_NOFADE, LargeEntity.HAPSBY);
			PSMenu.instance.waitDelay(30);
			PSMenu.Stext(getString("Bortevo_Hapsby_Free"));
			PSMenu.StextNext(getString("Bortevo_Hapsby"));
			PSGame.getParty().removeItem(getItem(OriginalItem.Quest_Polymeteral));
			PSGame.setFlag(Flags.GOT_HAPSBY);
			
		} else {
			PSMenu.Stext(getString("Chest_Search"));
		}
		PSMenu.endScene();
	}
	
	public static void junk() {
		PSMenu.startScene(Scene.RUINED_HOUSE, LargeEntity.JUNK);
		PSMenu.instance.waitB1();
		PSMenu.Stext(getString("Chest_Search"));
		PSMenu.endScene();
	}	
	
	public static void hovercraft() {
		PSMenu.startScene(Scene.RUINED_HOUSE, LargeEntity.JUNK);
		PSMenu.instance.waitB1();
		if(PSGame.hasFlag(Flags.INFO_HOVER) && !PSGame.getParty().hasQuestItem(getItem(OriginalItem.Vehicle_FlowMover))) {
			PSMenu.Stext(getString("Bortevo_House_Hovercraft"));
			PSGame.getParty().addQuestItem(getItem(OriginalItem.Vehicle_FlowMover));
		} else {
			PSMenu.Stext(getString("Chest_Search"));
		}
		PSMenu.endScene();
	}

	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Bortevo_People_Man_1"));
		EntFinish();
	}

	public static void exit() {
		mapswitch(Planet.PALMA, City.BORTEVO.getX(), City.BORTEVO.getY());		
	}

	
	
}
