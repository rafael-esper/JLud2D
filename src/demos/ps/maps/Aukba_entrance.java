package demos.ps.maps;

import static demos.ps.oo.PSGame.mapswitch;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.PSGame.Planet;

public class Aukba_entrance {


	public static void tunnel() {
		mapswitch(Dungeon.AUKBA_TUNNEL_IN);
	}
	
	public static void exit() {
		mapswitch(Planet.DEZORIS, City.AUKBA_ENTRANCE.getX(),City.AUKBA_ENTRANCE.getY());
	}

}
