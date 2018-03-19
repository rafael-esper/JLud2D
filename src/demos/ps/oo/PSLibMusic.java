package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class PSLibMusic {

	private static final Logger log = LogManager.getLogger(PSLibMusic.class);

		public enum PS1Music {

			PALMA("music/Palma.vgz"),
			MOTAVIA("music/Motavia.vgz"),
			DEZORIS("music/Dezoris.vgz"),

			CAVE("music/Cave.vgz"),
			PALACE("music/Dungeon.vgz"),
			TOWER("music/Tower.vgz"),

			TOWN("music/Town.vgz"),
			VILLAGE("music/Village.vgz"),
			CHURCH("music/Church.vgz"),
			SHOP("music/Shop.vgz"),

			BATTLE("music/Battle.vgz"),
			LASSIC("music/Lassic.vgz"),
			DARKFALZ("music/DarkFalz.vgz"),
			GAMEOVER("music/GameOver.vgz"),

			TITLE("music/Title.vgz"),
			INTRO("music/Intro.vgz"),
			STORY ("music/Story.vgz"),
			ENDING("music/Ending.vgz"),
			
			VEHICLE("music/Vehicle.vgz");
			
			private String url;
			
			PS1Music(String path) {
				this.url = path;
			}
			
			public String getUrl() {
				return this.url;
			}

		};
		
		
	
	
}
