package demos.ps.oo;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibMusic.PS1Music;

enum Flyable {YES, NO};

public enum City { 
	CAMINEET	(83, 49, Planet.PALMA, Flyable.YES, PS1Music.TOWN),
	PAROLIT		(73, 58, Planet.PALMA, Flyable.YES, PS1Music.TOWN),
	SCION		(101, 46, Planet.PALMA, Flyable.YES, PS1Music.TOWN),
	EPPI		(85, 80, Planet.PALMA, Flyable.YES, PS1Music.VILLAGE),
	GOTHIC		(53, 58, Planet.PALMA, Flyable.YES, PS1Music.VILLAGE),
	BORTEVO		(25, 51, Planet.PALMA, Flyable.YES, PS1Music.VILLAGE),
	LOAR		(65, 31, Planet.PALMA, Flyable.YES, PS1Music.VILLAGE),
	ABION		(13, 18, Planet.PALMA, Flyable.YES, PS1Music.VILLAGE),
	DRASGOW		(118, 81, Planet.PALMA, Flyable.YES, PS1Music.TOWN),

	SPACEPORT1	(0, 0, Planet.PALMA, Flyable.NO, PS1Music.TOWN),
	SPACEPORT2	(0, 0, Planet.MOTAVIA, Flyable.NO, PS1Music.TOWN),
	
	PASEO		(78, 31, Planet.MOTAVIA, Flyable.YES, PS1Music.TOWN),
	UZO			(93, 64, Planet.MOTAVIA, Flyable.YES, PS1Music.VILLAGE),
	CASBA		(68, 86, Planet.MOTAVIA, Flyable.YES, PS1Music.VILLAGE),
	SOPIA		(18, 32, Planet.MOTAVIA, Flyable.YES, PS1Music.VILLAGE),
	TONOE		(39, 84, Planet.MOTAVIA, Flyable.YES, PS1Music.VILLAGE),

	SKURE_ENTRANCE	(172, 73, Planet.DEZORIS, Flyable.NO, PS1Music.DEZORIS),
	SKURE			(172, 73, Planet.DEZORIS, Flyable.YES, PS1Music.TOWN),
	AUKBA_ENTRANCE	(184, 34, Planet.DEZORIS, Flyable.NO, PS1Music.DEZORIS),
	AUKBA			(184, 34, Planet.DEZORIS, Flyable.YES, PS1Music.VILLAGE), 	
	
	SKY_CASTLE	(0, 0, Planet.PALMA, Flyable.NO, PS1Music.TOWN), 	
	;
	
	private int x, y;
	Planet planet;
	Flyable flyable;
	PS1Music music;
	
	private City(int x, int y, Planet planet, Flyable flyable, PS1Music music) {
		this.x = x;
		this.y = y;
		this.planet = planet;
		this.flyable = flyable;
		this.music = music;
	}
	
	public static List<City> getVisitedCitiesFromPlanet(Planet chosenPlanet, EnumSet<City> visitedCities) {
		List<City> lstCities = new ArrayList<City>();
		for(City city: City.values()) {
			if(city.planet == chosenPlanet && city.flyable == Flyable.YES && 
					(visitedCities == null || visitedCities.contains(city))) {
				lstCities.add(city);
			}
		}
		return lstCities;
	}
	
	@Override
	public String toString() {
		String s = super.toString();
		return PSGame.getString("City_" + s.substring(0, 1) + s.substring(1).toLowerCase());
	}

	public int getX() {
		return x;
	}
	public int getY() {
		return y;
	}
	public PS1Music getMusic() {
		return music;
	}
	public String getPath() {
		String s = this.name().substring(0, 1) + this.name().substring(1).toLowerCase() + ".map";
		return "maps/" + s;
	}
};



