package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.BASE_FOLDER;

public class PSLibCHR {

	private static final Logger log = LogManager.getLogger(PSLibCHR.class);

		public enum PS1CHR {

			// Misc 
			CHEST ("/" + BASE_FOLDER + "/images/original/chest.anim.json"),
			SKY_CASTLE("/" + BASE_FOLDER + "/images/original/sky_castle.anim.json"),
			ODIN_STATUE("/" + BASE_FOLDER + "/images/original/odin_stone.anim.json"),
			MYAU_FLAPPING("/" + BASE_FOLDER + "/images/original/myau_flapping.anim.json"),
			
			// Battle Animations
			ENEMY_FIRE ("/" + BASE_FOLDER + "/battle/enemy_fire.anim.json"),
			ENEMY_THUNDER ("/" + BASE_FOLDER + "/battle/enemy_thunder.anim.json"),
			PLAYER_FIRE ("/" + BASE_FOLDER + "/battle/pl_fire.anim.json"),
			PLAYER_WIND ("/" + BASE_FOLDER + "/battle/pl_wind.anim.json"),
			PLAYER_THUNDER("/" + BASE_FOLDER + "/battle/pl_thunder.anim.json"),
			PLAYER_GIFIRE("/" + BASE_FOLDER + "/battle/pl_gifire.anim.json"),
			
			// Scenes
			ANIM_BEACH ("/" + BASE_FOLDER + "/images/original/scene/Beach.anim.json"),
			ANIM_SEA ("/" + BASE_FOLDER + "/images/original/scene/Sea.anim.json"),
			ANIM_LAVA ("/" + BASE_FOLDER + "/images/original/scene/Lava.anim.json"),
			ANIM_GAS ("/" + BASE_FOLDER + "/images/original/scene/Gas.anim.json"),

			// Entities
			IMG_ENTITIES ("/" + BASE_FOLDER + "/images/original/entities.anim.json"),
			IMG_ENTITIES_LARGE ("/" + BASE_FOLDER + "/images/original/lentities.anim.json");
			
			private String url;
			
			PS1CHR(String s) {
				this.url = s;
			}
			
			public String getUrl() {
				return this.url;
			}
		};
		
		
	
	
}
