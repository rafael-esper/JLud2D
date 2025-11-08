package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.Outcome;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Skure_entrance {


	public static void tunnel() {
		mapswitch(Dungeon.SKURE_TUNNEL_IN);
	}
	
	public static void exit() {
		mapswitch(Planet.DEZORIS, City.SKURE_ENTRANCE.getX(),City.SKURE_ENTRANCE.getY());
	}
	
	public static void spaceship() {
		PSMenu.startScene(Scene.ARTIC, LargeEntity.HAPSBY);
		PSGame.hapsbyRoutine(City.SKURE);
		PSMenu.endScene(Outcome.FADE_HOUSE);
	}
	
	
}
