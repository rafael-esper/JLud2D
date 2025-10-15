package demos.demo1;

import static core.Script.*;

import java.awt.Color;
import java.awt.Font;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import core.MainEngine;
import domain.VImage;

/** This Golden Axe Warrior demo tests:
 * (a) Camera tracking mode: Screen Transition
 * (b) Partial screen rendering (not anymore)
 * (c) S3m music
 * (d) map, vsp, chr and cfg formats
 * 
 * @author Rafael
 *
 */
public class Demo1 extends MainEngine {

	private static final Logger log = LogManager.getLogger(Demo1.class);
	
	public static void main(String args[]) {
		
		setSystemPath(new Demo1().getClass());
		initMainEngine(args);
	}
	
	static int gotox, gotoy;
	static Font font = new Font("Serif", Font.PLAIN, 7);
	
	public static void autoexec() {
		setAppName("Island World");
	}
	
	public static void mapinit()   {

		if(gotox==0 && gotoy==0) {
			gotox = current_map.getStartX();
			gotoy = current_map.getStartY();
		}
		
		setplayer(entityspawn(gotox, gotoy, "maxim.anim.json"));
		//setplayer(entityspawn(gotox, gotoy, "xOrc_Male1.chr"));
		
		// Center camera
		cameratracking = 1;
		screen.render();
		//getVirtualScreen().render();

		playerstep = 4;
		entities.get(player).setSpeed(200);
		
		//fadein(30, true);
		log.info("Demo2::mapinit");
	}
	
	
}
