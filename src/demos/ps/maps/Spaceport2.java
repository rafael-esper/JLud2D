package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;
import static core.Script.playermove;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu.*;

public class Spaceport2 {

	
	public static void paseo() {
		PSMenu.Stext(getString("Paseo_People_Cop_Pass"));
		mapswitch(Planet.MOTAVIA,78,42);
	}
	

	public static void spaceship() {
		PSMenu.startScene(Scene.SPACESHIP, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		if(PSMenu.Prompt(getString("Paseo_Spaceport_Shuttle"), getYesNo()) == 1) {
			PSGame.spaceshipRoutineStart(City.PASEO, City.CAMINEET);
		}
		PSMenu.endScene(Outcome.FADE_HOUSE);
	}	
	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Paseo_Spaceport_Ent1"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Paseo_Spaceport_Ent2"));
		EntFinish();
	}
	public static void ent3() {
		EntStart();
		PSMenu.Stext(getString("Paseo_Spaceport_Ent3"));
		EntFinish();
	}
	
}
