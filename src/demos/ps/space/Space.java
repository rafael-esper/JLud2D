package demos.ps.space;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;
import demos.ps.oo.City;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.SpecialEntity;
import core.Script;
import domain.Entity;
import domain.VImage;

public class Space {

	private static final Logger log = LogManager.getLogger(Space.class);

	public static void startmap() {

		// INTRO
		if(PSGame.getFromCity() == null) {
			intro();
			return;
		}

		cameratracking = 1;
		
		if(PSGame.getFromCity() == City.CAMINEET || PSGame.getFromCity() == City.GOTHIC) {
			int ent = entityspawn(5, 96, "space/Palma.chr");
			entities.get(ent).setFace (Entity.NORTH);
		}
		if(PSGame.getFromCity() == City.PASEO || PSGame.getFromCity() == City.UZO) {
			int ent = entityspawn(5, 96, "space/Mota.chr");
			entities.get(ent).setFace (Entity.NORTH);
		}
		if(PSGame.getFromCity() == City.SKURE) {
			int ent = entityspawn(5, 96, "space/Dezo.chr");
			entities.get(ent).setFace (Entity.NORTH);
		}
		
		if(PSGame.getToCity() == City.CAMINEET || PSGame.getToCity() == City.GOTHIC) {
			int ent = entityspawn(5, 0, "space/Palma.chr");
			entities.get(ent).setFace (Entity.SOUTH);
		}
		if(PSGame.getToCity() == City.PASEO || PSGame.getToCity() == City.UZO) {
			int ent = entityspawn(5, 0, "space/Mota.chr");
			entities.get(ent).setFace (Entity.SOUTH);
		}
		if(PSGame.getToCity() == City.SKURE) {
			int ent = entityspawn(5, 0, "space/Dezo.chr");
			entities.get(ent).setFace (Entity.SOUTH);
		}		

		PSGame.spaceshipRoutineEnd();
	}
	
	
	public static void intro() {
		int ent = entityspawn(5, 96, "space/Palma.chr");
		entities.get(ent).setFace (Entity.NORTH);

		PSGame.playMusic(PS1Music.INTRO);
		
		cameratracking = 0;
		
		Script.xwin = 0;
		Script.ywin = 1200;
		int count = 0;
		while(count++ < 250) {
			ywin++;
			screen.render();
			showpage();
		}
		
		if(PSGame.getGameType() == GameType.PS_ORIGINAL) {
			alisIntro();
		}
		else if(PSGame.getGameType() == GameType.PS_START_AS_ODIN) {
			odinIntro();
		}
		else if(PSGame.getGameType() == GameType.PS_START_AS_NOAH) {
			noahIntro();
		}
		
	}


	private static void alisIntro() {
		PSMenu.startScene(Scene.CITY, SpecialEntity.NONE);
		PSMenu.instance.push(PSMenu.instance.createOneLabelBox(15, 20, PSGame.getString("Intro_Time"), true));
		PSMenu.instance.waitDelay(20);
		PSMenu.instance.push(PSMenu.instance.createOneLabelBox(15, 50, PSGame.getString("Intro_Place"), true));
		PSMenu.instance.waitDelay(150);
		PSMenu.instance.pop();
		PSMenu.instance.pop();
		//PSMenu.Stext( + "\n" + PSGame.getString("Intro_Place"));
		PSMenu.setMapOff();

		screen.fadeOut(25, false);
		PSMenu.instance.back = new VImage(screen.width, screen.height); ;
		//screen.paintBlack();
		
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_NERO1), 
				new String[]{PSGame.getString("Cinematic_Intro_1"), PSGame.getString("Cinematic_Intro_2"), PSGame.getString("Cinematic_Intro_3")});

		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_NERO2), 
				new String[]{PSGame.getString("Cinematic_Intro_4"), PSGame.getString("Cinematic_Intro_5")});

		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_PROMISE), 
				new String[]{PSGame.getString("Cinematic_Intro_6")});

		PSMenu.endScene();
		


		PSGame.gameData.current_planet = Planet.PALMA;
		PSGame.mapswitch(City.CAMINEET, 29, 9); // Alis's house
	}
	

	private static void odinIntro() {
		screen.fadeOut(25, false);
		PSMenu.setMapOff();
		PSMenu.instance.back = new VImage(screen.width, screen.height); ;
		//screen.paintBlack();
		
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_INTRO1), 
				new String[]{PSGame.getString("Cinematic_Intro_Odin_1")});

		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_INTRO2), 
				new String[]{PSGame.getString("Cinematic_Intro_Odin_2"), PSGame.getString("Cinematic_Intro_Odin_3")});
		
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ODIN2), 
				new String[]{PSGame.getString("Cinematic_Intro_Odin_4")});

		PSMenu.endScene();		
		
		PSGame.setFlag(Flags.GOT_ODIN);
		PSGame.gameData.current_planet = Planet.PALMA;
		PSGame.mapswitch(City.SCION, 9, 16);
	}

	private static void noahIntro() {
		screen.fadeOut(25, false);
		PSMenu.setMapOff();
		PSMenu.instance.back = new VImage(screen.width, screen.height); ;
		//screen.paintBlack();
		
		//PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_INTRO1), 
		//		new String[]{PSGame.getString("Cinematic_Intro_Odin_1")});

		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_INTRO2), 
				new String[]{PSGame.getString("Cinematic_Intro_Odin_2"), PSGame.getString("Cinematic_Intro_Odin_3")});
		
		//PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ODIN2), 
			//	new String[]{PSGame.getString("Cinematic_Intro_Odin_4")});

		PSMenu.endScene();		
		
		PSGame.gameData.current_planet = Planet.MOTAVIA;
		PSGame.mapswitch(Planet.MOTAVIA, 82, 34);
		
	}
	
	
	
}
