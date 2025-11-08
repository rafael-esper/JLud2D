package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.load;
import static demos.ps.oo.PSGame.BASE_FOLDER;

public class PSLibImage {

	private static final Logger log = LogManager.getLogger(PSLibImage.class);

		public enum PS1Image {

			// Scenes
			BLUE_HOUSE ("/" + BASE_FOLDER + "/images/original/scene/C_House1.png"),
			YELLOW_HOUSE ("/" + BASE_FOLDER + "/images/original/scene/C_House1.png"),
			VILLAGE_HOUSE ("/" + BASE_FOLDER + "/images/original/scene/C_House2.png"),
			RUINED_HOUSE ("/" + BASE_FOLDER + "/images/original/scene/C_Ruined.png"),
			SHOP_FOOD ("/" + BASE_FOLDER + "/images/original/scene/C_Food1.png"),
			SHOP_HAND ("/" + BASE_FOLDER + "/images/original/scene/C_Hand1.png"),
			SHOP_WEAPON ("/" + BASE_FOLDER + "/images/original/scene/C_Weap1.png"),
			HOSPITAL ("/" + BASE_FOLDER + "/images/original/scene/C_Hosp1.png"),
			CHURCH ("/" + BASE_FOLDER + "/images/original/scene/C_Church1.png"),
			SHOP_FOOD_VILLAGE ("/" + BASE_FOLDER + "/images/original/scene/C_Food2.png"),
			SHOP_HAND_VILLAGE ("/" + BASE_FOLDER + "/images/original/scene/C_Hand2.png"),
			SHOP_WEAPON_VILLAGE ("/" + BASE_FOLDER + "/images/original/scene/C_Weap2.png"),
			HOSPITAL_VILLAGE ("/" + BASE_FOLDER + "/images/original/scene/C_Hosp2.png"),
			CHURCH_VILLAGE ("/" + BASE_FOLDER + "/images/original/scene/C_Church2.png"),
			SPACESHIP ("/" + BASE_FOLDER + "/images/original/scene/C_Space.png"),
			PALACE ("/" + BASE_FOLDER + "/images/original/scene/C_Palace.png"),
			VILLA ("/" + BASE_FOLDER + "/images/original/scene/C_Villa.png"),
			CITY ("/" + BASE_FOLDER + "/images/original/scene/C_Town.png"),
			BAYA ("/" + BASE_FOLDER + "/images/original/scene/C_Baya.png"),

			// Battle scenes
			FOREST ("/" + BASE_FOLDER + "/images/original/scene/C_Forest.png"),
			FIELDS ("/" + BASE_FOLDER + "/images/original/scene/C_Fields.png"),
			DESERT ("/" + BASE_FOLDER + "/images/original/scene/C_Desert.png"),
			ARTIC ("/" + BASE_FOLDER + "/images/original/scene/C_Artic.png"),
			PINES ("/" + BASE_FOLDER + "/images/original/scene/C_Pines.png"),
			SKY ("/" + BASE_FOLDER + "/images/original/scene/C_Sky.png"),
			ALTAR ("/" + BASE_FOLDER + "/images/original/scene/C_Altar.png"),
			CAVE ("/" + BASE_FOLDER + "/images/original/scene/C_Cave.png"),
			
			// Cinematics
			CINE_ALIS ("/" + BASE_FOLDER + "/images/original/cine/S_Alis.png"),
			CINE_MYAU ("/" + BASE_FOLDER + "/images/original/cine/S_Myau.png"),
			CINE_ODIN ("/" + BASE_FOLDER + "/images/original/cine/S_Odin.png"),
			CINE_NOAH ("/" + BASE_FOLDER + "/images/original/cine/S_Noah.png"),
			CINE_NERO1 ("/" + BASE_FOLDER + "/images/original/cine/S_Nero1.png"),
			CINE_NERO2 ("/" + BASE_FOLDER + "/images/original/cine/S_Nero2.png"),
			CINE_PROMISE ("/" + BASE_FOLDER + "/images/original/cine/S_Promise.png"),
			CINE_BEAST1 ("/" + BASE_FOLDER + "/images/original/cine/S_Beast1.png"),
			CINE_BEAST2 ("/" + BASE_FOLDER + "/images/original/cine/S_Beast2.png"),
			
			CINE_INTRO1("/" + BASE_FOLDER + "/images/original/cine/S_Intro1.png"),
			CINE_INTRO2("/" + BASE_FOLDER + "/images/original/cine/S_Intro2.png"),
			CINE_ODIN2 ("/" + BASE_FOLDER + "/images/original/cine/S_Odin2.png"),
			
			// CREDITS
			CINE_CREDIT1 ("/" + BASE_FOLDER + "/images/original/credits/Credits1.png"),
			CINE_CREDIT2 ("/" + BASE_FOLDER + "/images/original/credits/Credits2.png"),
			CINE_CREDIT3 ("/" + BASE_FOLDER + "/images/original/credits/Credits3.png"),
			CINE_CREDIT4 ("/" + BASE_FOLDER + "/images/original/credits/Credits4.png"),
			CINE_CREDIT5 ("/" + BASE_FOLDER + "/images/original/credits/Credits5.png"),
			
			
			// Portraits
			PORTRAIT_ALIS ("/" + BASE_FOLDER + "/images/original/portraits/Alis.png"),
			PORTRAIT_MYAU ("/" + BASE_FOLDER + "/images/original/portraits/Myau.png"),
			PORTRAIT_ODIN ("/" + BASE_FOLDER + "/images/original/portraits/Odin.png"),
			PORTRAIT_NOAH ("/" + BASE_FOLDER + "/images/original/portraits/Noah.png"),
			IMG_TALK_ALIS ("/" + BASE_FOLDER + "/images/original/portraits/S_Alis.png"),
			IMG_TALK_MYAU ("/" + BASE_FOLDER + "/images/original/portraits/S_Myau.png"),
			IMG_TALK_ODIN ("/" + BASE_FOLDER + "/images/original/portraits/S_Odin.png"),
			IMG_TALK_NOAH ("/" + BASE_FOLDER + "/images/original/portraits/S_Noah.png"),
			
			TITLE ("/" + BASE_FOLDER + "/images/original/Title.png"),
			ENDING("/" + BASE_FOLDER + "/images/original/Ending.png");
			
			private String url;
			
			PS1Image(String s) {
				this.url = s;
			}
			
			public String getUrl() {
				return this.url;
			}
		};
		
		
	
	
}
