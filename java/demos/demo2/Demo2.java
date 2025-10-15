package demos.demo2;

import static core.Script.*;

import java.awt.Color;
import java.awt.Font;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import core.MainEngine;
import core.Script;
import domain.Entity;
import domain.VSound;

/** This Demo1 (Golden Axe Warrior) tests:
 * (a) Camera tracking mode: Screen Transition
 * (b) map, tileset, anim and config JSON formats
 * (c) S3m music
 * (d) VFont based on image
 * (e) VSound (WAV)
 * (f) Simple Menu, hookButton and hookRetrace
 * (g) Settile, Gettile, Setobs
 * (h) FadeIn and FadeOut
 * 
 * @author Rafael
 *
 */
public class Demo2 extends MainEngine {

	public static int TREE = 107;
	public static int FIELD = 39;
	
	private static final Logger log = LogManager.getLogger(Demo2.class);
	
	public static void main(String args[]) {
		
		setSystemPath(new Demo2().getClass());
		initMainEngine(args);
	}
	
	static int gotox, gotoy;
	static Font font = new Font("Serif", Font.PLAIN, 7);
	static Color bluelish = new Color(0, 0, 255, 160);
	static VSound axeSwing;
	
	public static void autoexec() {
		setAppName("Golden Axe Warrior");
		
		axeSwing = new VSound(load("axe swing.wav"));
		
		//hookretrace("drawMenu"); It only works this way if Java class name = Map name
		hookretrace("demos.demo2.Demo2.drawMenu");
		hookbutton(1, "demos.demo2.Demo2.cutTree");
		
	}
	
	public static void drawMenu() {
		screen.rectfill(5, 5, 40, 25, bluelish);
		screen.printString(7, 12, font,  "HP  16");
		screen.printString(7, 22, font, "MP   0");
	}
	
	public static void cutTree() {
		if(entities.get(player) != null) {
			
			//pauseplayerinput();
			playsound(axeSwing);
			int xx = entities.get(player).getx() >> 4;
			int yy = entities.get(player).gety() >> 4;
			switch(entities.get(player).getFace()) {
			
			case Entity.NORTH:
				if(current_map.gettile(xx, yy-1, 0) == TREE) {
					current_map.settile(xx, yy-1, 0, FIELD);
					current_map.setobs(xx, yy-1, 0);
				}
				playermove("Z12 W3 Z13 W3 Z14 W3 Z15 W6 H");
				break;

			case Entity.SOUTH:
				if(current_map.gettile(xx, yy+1, 0) == TREE) {
					current_map.settile(xx, yy+1, 0, FIELD);
					current_map.setobs(xx, yy+1, 0);
				}
				playermove("Z20 W3 Z21 W3 Z22 W3 Z23 W6 H");
				break;

			case Entity.WEST:
				if(current_map.gettile(xx-1, yy, 0) == TREE) {
					current_map.settile(xx-1, yy, 0, FIELD);
					current_map.setobs(xx-1, yy, 0);
				}
				playermove("Z16 W3 Z17 W3 Z18 W3 Z19 W6 H");
				break;
				
			case Entity.EAST:
				if(current_map.gettile(xx+1, yy, 0) == TREE) {
					current_map.settile(xx+1, yy, 0, FIELD);
					current_map.setobs(xx+1, yy, 0);
				}
				playermove("Z24 W3 Z25 W3 Z26 W3 Z27 W6 H");
				break;
			}
			entities.get(player).setSpecframe(0);
			//unpauseplayerinput();
		}
	}
	
	public static void mapinit()   {

		if(gotox==0 && gotoy==0) {
			gotox = current_map.getStartX();
			gotoy = current_map.getStartY();
		}
		
		setplayer(entityspawn(gotox, gotoy, "warrior.anim.json"));
		
		// Center camera
		cameratracking = 1;
		screen.render();
		//getVirtualScreen().render();

		
		playerstep = 4;
		entities.get(player).setSpeed(170);
		
		//fadein(30, true);
		cameratracking = 3;
		log.info("Gw::mapinit");
	}
	
}
