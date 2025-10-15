package demos.ps;

import static core.Script.cameratracking;
import static core.Script.screen;
import static core.Script.setSystemPath;
import static core.Script.setAppName;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.oo.PSGame;
import demos.ps.oo.PSMenu;
import core.MainEngine;
import core.Script;

public class Phantasy extends MainEngine {

	private static final Logger log = LogManager.getLogger(Phantasy.class);

	public static void main(String args[]) {
		
		setSystemPath(new Phantasy().getClass());
		initMainEngine(args);
	}
	
	public static void autoexec() {
		setAppName("Phantasy Star Extended v1.06");
	}


	// Generic startmap function
	public static void startmap()   {
		
		log.info("PS::startmap");
		cameratracking=1;

		PSGame.getParty().allocate(PSGame.getgotox(), PSGame.getgotoy());
		
		screen.fadeIn(30, true);
		
		PSMenu.menuOn();
		PSGame.transportOff();
		
		//current_map.horizontalWrapable = current_map.verticalWrapable = true;
	}
	
}
