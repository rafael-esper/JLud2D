package core;

import static core.Controls.*;
import static core.MainEngine.*;

import java.awt.Color;
import java.awt.color.ColorSpace;
import java.awt.image.BufferedImage;
import java.awt.image.BufferedImageOp;
import java.awt.image.ColorConvertOp;
import java.awt.image.RescaleOp;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import audio.VMusic;
import domain.Entity;
import domain.Map;
import domain.VImage;
import domain.VSound;

public class Script {

	private static final Logger log = LogManager.getLogger(Script.class);

	// For Testing purposes (simulations)
	public static boolean TEST_SIMULATION = false;
	public static int TEST_POS = 0;
	public static int[] TEST_OPTIONS;

	/**
	 * This is a hardcoded image handle for the screen. It is a pointer to a
	 * bitmap of the screen's current dimensions (set in conig.json or by
	 * SetResolution() function at runtime). Anything you want to appear in the
	 * engine window should be blitted here with one of the graphics functions.
	 * When ShowPage() is called the screen bitmap is transfered to the display.
	 */
	public static VImage screen;
	
	/** read-only timer variable constantly increasing*/
	public static int systemtime;

	/** read/write timer variable*/
	public static int timer;

	public enum ColorFilter {CF_GRAY, CF_INV_GRAY, CF_INV, CF_RED, CF_GREEN, CF_BLUE, CF_CUSTOM};	
	
	// internal use only
	static int vctimer = 0;
	static int hooktimer = 0;

	// FIXME Change public to private and add acessor methods
	public static List<Entity> entities = new ArrayList<Entity>();
	public static Entity myself = null;

	/**
	 * The number of entities currently on the map. Use this an the upper bound
	 * any time you need to loop through and check entites for something.
	 */
	public static int numentities;

	public static int player;
	public static int playerstep = 1;
	public static boolean playerdiagonals = true;
	public static boolean smoothdiagonals = true; // [Rafael]

	public static int xwin, ywin;
	public static Map current_map = null;

	public static int cameratracking = 1;
	public static int cameratracker = 0;
	public static int lastplayerdir = 0;

	public static boolean entitiespaused = false;
	
	// END OF ENGINE VARIABLES
	
	public static String renderfunc, timerfunc; // was Callback (struct)

	public static DefaultPalette palette = new DefaultPalette();
	public static int transcolor = -65281; // Color(255, 0, 255);
	public static int currentLucent = 255;
	
	public static int event_tx;
	public static int event_ty;
	public static int event_zone;
	public static int event_entity;
	public static int event_param;
	public static int event_sprite;
	public static int event_entity_hit;
	public static int actor_index;
	
	private static VMusic musicplayer; 
	
	public static int invc;

	public static String _trigger_onStep = "", _trigger_afterStep = "";
	public static String _trigger_beforeEntityScript = "", _trigger_afterEntityScript = "";
	public static String _trigger_onEntityCollide = "";
	public static String _trigger_afterPlayerMove = "";

	static void hooktimer()
	{
		// To prevent hooktimer from happening before the script engine is loaded.
		//if(se == null) return;

		while (hooktimer != 0)
		{
			callfunction(timerfunc);
			hooktimer--;
		}
	}

	public static void hooktimer(String cb) {
		hooktimer = 0;
		timerfunc = cb;
	}
	
	public static void hookretrace()
	{
		if(renderfunc != null) {
			callfunction(renderfunc);
		}
	}

	public static void hookretrace(String cb) {
		renderfunc = cb;
	}

	
	// Rafael: Changed to ExecuteFunctionString 
	/*public void ExecuteCallback(String function, boolean callingFromLibrary) */
	
	public static void exit(String message) { 
		log.error(message);
		System.exit(0); 
	}

	/* Rafael: TODO Implement this.
	 public static void SetButtonJB(int b, int jb) {
		switch (b)
		{
			case 1: j_b1 = jb; break;
			case 2: j_b2 = jb; break;
			case 3: j_b3 = jb; break;
			case 4: j_b4 = jb; break;
		}
	}*/

	// Overkill (2007-08-25): HookButton is supposed to start at 1, not 0.
	// It's meant to be consistent with Unpress().
	public static void hookbutton(int b, String s) {
		if (b<1 || b>4) return;
		bindbutton[b-1] = s;
	}

	public static void hookkey(int k, String s) {
		if (k<0 || k>127) return;
		bindarray[k] = s;
	}

	/*
	static void MessageBox(String msg) { showMessageBox(msg); }*/

	public static int random(int min, int max) { 
		if(min > max) {
			return random(max, min);
		}
		Random r = new Random(); // TODO Use unique random instance
		return r.nextInt(max+1-min) + min; 
	}
	
	
	public static void setAppName(String s) { 
		getGUI().setTitle(s);
	}

	public static void unpress(int n) {
		switch (n)
		{
			case 0: 
				if (b1) UnB1(); 
				if (b2) UnB2(); 
				if (b3) UnB3(); 
				if (b4) UnB4(); 	
				break;
			case 1: if (b1) UnB1(); break;
			case 2: if (b2) UnB2(); break;
			case 3: if (b3) UnB3(); break;
			case 4: if (b4) UnB4(); break;
			case 5: if (up) UnUp(); break;
			case 6: if (down) UnDown(); break;
			case 7: if (left) UnLeft(); break;
			case 8: if (right) UnRight(); break;
			case 9: 
				if (b1) UnB1(); 
				if (b2) UnB2(); 
				if (b3) UnB3(); 
				if (b4) UnB4();
				if (up) UnUp();
				if (down) UnDown();
				if (left) UnLeft();
				if (right) UnRight();
				break;
		}
	}

	public static void updateControls() { 
		Controls.UpdateControls(); 
	}

	public static int asc(String s) { 
		if(s.length() == 0) 
			return 0; 
		else 
			return (int)s.charAt(0); 
	}
	
	public static String chr(int c) { 
		return Character.toString((char) c);
	}
	
	public static String gettoken(String s, String d, int i) { // Reimplemented by [Rafael]
		String[] retorno = s.split(d);
		if(retorno.length <= i)
			return "";
		
		return retorno[i];
	}
	public static String left(String str, int len) { 
		return str.substring(0, str.length()>len?len:str.length());
	}
	
	public static int len(String s) { 
		return s.length(); 
	}
	
	public static String mid(String str, int pos, int len) { 
		return str.substring(pos, pos+len);
	}
	
	public static String right(String str, int len) { 
		return len > str.length() ? str : str.substring(str.length() - len);
	}
	
	public static String str(int d) { 
		return Integer.toString(d);
	}
	
	public static boolean strcmp(String s1, String s2) { 
		return s1.equals(s2); // ? 1 : 0;
	}
	
	public static String capitalize(String s) { // [Rafael]
		if (s.length() == 0) return s;
		return s.substring(0, 1).toUpperCase() + s.substring(1);		
	}
	
	public static String strdup(String s, int times) {
		String ret = "";
		for (int i=0; i<times; i++)
			ret = ret.concat(s);
		return ret;
	}
	
	public static int tokencount(String s, String d) {
		String[] retorno = s.split(d);
		return retorno.length;
	}
	
	public static String trim(String s) { 
		return s.trim(); 
	}
	
	public static String tolower(String str) { 
		return str.toLowerCase();
	}

	public static String toupper(String str) {
		return str.toUpperCase();
	}

	public static int val(String s) { 
		if(s==null || s.isEmpty() || s.trim().equals("-"))
			return 0;
		
		return Integer.valueOf(s.replace('+', ' ').trim());
	}

	//VI.d. Map Functions
	public static void map(String map) {
		mapname = map;
		die = true;
		done = true;

		/* Hookretrace carries over between maps!
		/ According to http://verge-rpg.com/docs/the-verge-3-manual/general-utility-functions/hookretrace/
		  hookretrace(""); */ 
	}
	
	//VI.e. Entity Functions
	public static void changeCHR(int e, String c) {
		if (e<0 || e >= numentities) return;
		else entities.get(e).set_chr(c);
	}
	public static void entitymove(int e, String s) {
		if (e<0 || e >= numentities) return;
		else entities.get(e).setMoveScript(s);
	}
	public static void entitysetwanderdelay(int e, int d) {
		if (e<0 || e >= numentities) return;
		else entities.get(e).setWanderDelay(d);
	}
	public static void entitysetwanderrect(int e, int x1, int y1, int x2, int y2) {
		if (e<0 || e >= numentities) return;
		else entities.get(e).setWanderBox(x1, y1, x2, y2);
	}
	public static void entitysetwanderzone(int e) {
		if (e<0 || e >= numentities) return;
		else entities.get(e).setWanderZone();
	}
	public static int entityspawn(int x, int y, String s) { 
		return AllocateEntity(x*16,y*16,s); 
	}
	public static int countParty(int first) {
		if (first<0 || first >= numentities) return 0;
		int num = 1;
		Entity e = entities.get(first);
		while(e.getFollower() != null) {
			e = e.getFollower();
			num++;
		}
			
		return num;
	}
	
	public static void entitystalk(int stalker, int stalkee) {
		if (stalker<0 || stalker>=numentities)
			return;
		if (stalkee<0 || stalkee>=numentities)
		{
			entities.get(stalker).clear_stalk();
			return;
		}
		entities.get(stalker).setx(entities.get(stalkee).getx()); // [Rafael]
		entities.get(stalker).sety(entities.get(stalkee).gety()); // [Rafael]
		entities.get(stalker).stalk(entities.get(stalkee));
	}
	public static void entitystop(int e) {
		if (e<0 || e >= numentities) return;
		else entities.get(e).setMotionless();
	}
	public static void hookentityrender(int i, String s) {
		if (i<0 || i>=numentities) 
			log.printf(Level.ERROR, "vc_HookEntityRender() - no such entity %d", i);
		entities.get(i).setHookrender(s);
	}
	
	public static void playermove(String s) {
		if (myself==null) 
			return;
		myself.setMoveScript(s);

		int current_invc = invc;
		invc=1;//Rafael
		while(myself.getMovecode() != 0 )
		{
			screen.render();
			showpage();
		}
		invc=current_invc;//Rafael

		playerentitymovecleanup();
	}

	public static void playerentitymovecleanup() {
		if (myself==null) return;

		myself.setMovecode(0);
		//[Rafael] implementar afterPlayerMove();
	}

	public static void pauseplayerinput() { // [Rafael]
		invc = 1;
	}
	public static void unpauseplayerinput() { // [Rafael]
		invc = 0;
	}
	
	public static void setentitiespaused(boolean b) {
		entitiespaused = b;
		if (!entitiespaused)
			lastentitythink = systemtime;
	}
	
	public static Entity setplayer(int e) {
		if (e<0 || e>=numentities)
		{
			player = -1;
			myself = null;
			log.error("invalid Player.");
			return null;
		}
		myself = entities.get(e);
		player = e;
		myself.setMotionless();
		myself.setObstructable(true);
		return myself;
	}

	public static int getplayer()
	{
		return player;
	}
	
/*
	//VI.g. Sprite Functions
	static int GetSprite() { return GetSprite(); }
	static void ResetSprites() { return ResetSprites(); }

	//VI.h. Sound/Music Functions
	static void FreeSong(int handle) { FreeSong(handle); }
	static void FreeSound(int slot) { FreeSample((void*)slot); }
	static int GetSongPos(int handle) { return GetSongPos(handle); }
	static int GetSongVolume(int handle) { return GetSongVol(handle); }
	static int LoadSong(String fn) { return LoadSong(fn); }
	static int LoadSound(String fn) { return (int)LoadSample(fn); }*/
	public static void playsound(VSound sound) {
		playsound(sound, 100);
	}
	public static void playsound(VSound sound, int volume) {
		if(sound==null || MainEngine.config.getNoSound())
			return;

		if (volume < 0)
			volume = 0;
		else if (volume > 100)
			volume = 100;
		sound.start(volume);
	}

	public static URL getmusic() {
		if(MainEngine.config==null || MainEngine.config.getNoSound() || musicplayer==null)
			return null;
		
		return VMusic.getPlay();
		
	}
	
	public static void playmusic(URL fn) {
		playmusic(fn, 100);
	}
	
	public static void playmusic(URL fn, int volume) { 
		if(fn==null || MainEngine.config==null || MainEngine.config.getNoSound())
			return;
		
		if(musicplayer!=null) {
			// If same music is playing, does nothing
			if(musicplayer.getPlay().equals(fn)) {
				return;
			}
			musicplayer.stop();
		}
		try {
			musicplayer = new VMusic(volume);
			log.info("Playing..." + fn);
			musicplayer.start(fn);
		}
		catch(Exception e) {
			log.error("Error when playing " + fn);
		}
	}
	
	/*
	static void PlaySong(int handle) { PlaySong(handle); }*/
	/*public static int playsound(String name, int volume) { 
		return 0;
		//return PlaySample((void*) slot, volume * 255 / 100); 
	}*/
	
	public static void setMusicVolume(int v) { 
		if(MainEngine.config==null || MainEngine.config.getNoSound())
			return;
		
		if(musicplayer!=null) {
			musicplayer.setVolume(v);
		} else {
			musicplayer = new VMusic(v);
		}
		
	}

	/*static void StopSong(int handle) { StopSong(handle); }
	static void StopSound(int chan) { StopSound(chan); }
*/
	
	/*static void SetSongPaused(int h, int p) { SetPaused(h,p); }
	static void SetSongPos(int h, int p) { SetSongPos(h,p); }
	static void SetSongVolume(int h, int v) { SetSongVol(h,v); } */
	public static void stopmusic() { 
		if(musicplayer!=null) {
			musicplayer.stop();
		}
	}

	// Graphics
	
	public static void setcustomcolorfilter(Color c1, Color c2) {
		/*GetColor(c1, cf_r1, cf_g1, cf_b1);
		GetColor(c2, cf_r2, cf_g2, cf_b2);
		cf_rr = cf_r2 - cf_r1;
		cf_gr = cf_g2 - cf_g1;
		cf_br = cf_b2 - cf_b1;*/
		// TODO [Rafael] Implement this
		graycolorfilter(screen.getImage());
		log.error("Non implemented function: setcustomcolorfilter");
	}
	
	public static void setlucent(int p) { 
		if(p < 0 || p > 100)
			return;
		currentLucent = (100-p) * 255 / 100;
		if(getGUI()!=null)
			getGUI().setAlpha ((float)(100-p) / 100);
	}

	static int lastchangetime = 0;

	public static void showpage() {
		lastchangetime = 0;
		Controls.UpdateControls();
		
		DefaultTimer();//[Rafael]
		GUI.paintFrame();

		/*if(toClipboard) {
			toClipboard = false;
			screen.copyImageToClipboard();
		}*/
	}
	

	public static void lightfilter(int scalefactor, VImage vimage) {
		RescaleOp op = new RescaleOp((float)scalefactor/100, 0, null);
		op.filter(vimage.image, vimage.image);
	}
	
	private static BufferedImageOp op = null;
	
	public static void graycolorfilter(BufferedImage img) {
		if(op==null)
			op = new ColorConvertOp (ColorSpace.getInstance(ColorSpace.CS_GRAY), null);
		img = op.filter(img, img);
		return;
	}
	
	
	public static void colorfilter(ColorFilter filter, VImage img) { 
		if(filter== ColorFilter.CF_GRAY) {
			if(op==null)
				op = new ColorConvertOp (ColorSpace.getInstance(ColorSpace.CS_GRAY), null);
			op.filter(img.getImage(), img.getImage());
			return;
		}
		
		int rr, gg, bb, z; Color c = null;

		int x1,x2,y1,y2;
		// [Rafael] img.GetClip(x1,y1,x2,y2);
		x1 = y1 = 0;
		x2 = img.width;
		y2 = img.height;

		//PT ptr = (PT)img.data;
		//PT data = (PT)&ptr[(y1 * img.pitch) + x1];

		for (int y=y1; y<y2; y++)
		{
			//int* data_end = data+x2+1;
			for(int x=x1;x<x2;x++) {
				int rgb = img.getImage().getRGB(x, y);
				//Color col = new Color(img.getImage().getRGB(x, y));
				if (rgb == transcolor) continue; // Overkill (2006-07-27): Ignore trans pixels
				rr = (rgb >> 16) & 0x000000FF;				
				gg = (rgb >>8 ) & 0x000000FF;
				bb = (rgb) & 0x000000FF;
				//GetColor(col, rr, gg, bb);
				//if(filter==2) System.out.printf("%d %d %d %d\n", rr, gg, bb, 255-((rr+gg+bb)/3));
				switch (filter)
				{
					case CF_GRAY: z = (rr+gg+bb)/3; c = new Color(z,z,z); break; // GRAY
					case CF_INV_GRAY: z = 255-((rr+gg+bb)/3); c = new Color(z,z,z); break;
					case CF_INV: c = new Color(255-rr, 255-gg, 255-bb); break;
					case CF_RED: z = (rr+gg+bb)/3; c = new Color(z, 0, 0); break; // RED
					case CF_GREEN: z = (rr+gg+bb)/3; c = new Color(0, z, 0); break; // GREEN
					case CF_BLUE: z = (rr+gg+bb)/3; c = new Color(0, 0, z); break; // BLUE
					case CF_CUSTOM: // FIXME Not Implemented 
						//z = (rr+gg+bb)/3; c = new Color(cf_r1+((cf_rr*z)>>8), cf_g1+((cf_gr*z)>>8), cf_b1+((cf_br*z)>>8)).getRGB(); break;
				}
				img.setPixel(x, y, c);
			}
		}
	}	
	
	public static Color RGB(int r, int g, int b) {
		return new Color(r, g, b);
	}

	public static Color mixcolor(Color c1, Color c2, int p) {
		if (p>255) p=255;
		if (p<0) p=0;

		int r1 = c1.getRed();
		int g1 = c1.getGreen();
		int b1 = c1.getBlue();
		int r2 = c2.getRed();
		int g2 = c2.getGreen();
		int b2 = c2.getBlue();

		return new Color((r1*(255-p)/255)+(r2*p/255), (g1*(255-p)/255)+(g2*p/255), (b1*(255-p)/255)+(b2*p/255));
	}	


	public static int getB(int c) {
		return palette.getColor(c, currentLucent).getBlue();
	}
	public static int getG(int c) {
		return palette.getColor(c, currentLucent).getGreen();
	}
	public static int getR(int c) {
		return palette.getColor(c, currentLucent).getRed(); 
	}	
	
	/*

	static int HSV(int h, int s, int v) { return HSVtoColor(h,s,v); }
	static int GetH(int col) {
		int h, s, v;
		GetHSV(col, h, s, v);
		return h;
	}
	static int GetS(int col) {
		int h, s, v;
		GetHSV(col, h, s, v);
		return s;
	}
	static int GetV(int col) {
		int h, s, v;
		GetHSV(col, h, s, v);
		return v;
	}
	static void HueReplace(int hue_find, int hue_tolerance, int hue_replace, int image) {
		HueReplace(hue_find, hue_tolerance, hue_replace, ImageForHandle(image));
	}
	static void ColorReplace(int find, int replace, int image)
	{
		ColorReplace(find, replace, ImageForHandle(image));
	}
*/
	

	//VI.j. Math Functions
	//helper:
	public static int abs(int i) {
		return Math.abs(i);
	}
	public static int sgn(int i) {
		return (int) Math.signum(i);
	}
	public static int pow(int a, int b) {
		return (int) Math.pow((double)a, (double)b);
	}
	public static int sqrt(int val) {
		return (int) (float) Math.sqrt((float) val);
	}

	// Util Functions 

	private static boolean isLetterDigitOrSignal(char c) {
		if(Character.isLetterOrDigit(c) || c=='+' || c=='-')
			return true;
		return false;
	}
	
	// Split String in trimmed words
	public static List<String> splitTextIntoWords(String text) { 
		int initial = 0;
		List<String> words = new ArrayList<String>();
		if(text==null) 
			return words;
		
		for(int i=0; i<text.length(); i++) {
			while(i<text.length() && (isLetterDigitOrSignal(text.charAt(i)) || text.charAt(i) == '\'')) {
				i++;
			}
			while(i<text.length() && !isLetterDigitOrSignal(text.charAt(i))) {
				i++;
			}
			words.add(text.substring(initial, i).trim());
			initial = i;
		}
		return words;
	}	

	// Split list of words into rows 
	public static List<String> splitTextIntoRows(String text, int maxperrow) {
		
		List<String> words = splitTextIntoWords(text);
		List<String> rows = new ArrayList<String>();
		int i = 0;
		String str;
		while (i < words.size()) {
			str = words.get(i);
		    while (i < words.size()-1 && str.length()+ 1 + words.get(i+1).length() <= maxperrow) {
		       str = str.concat(" " + words.get(i+1));
		       i += 1;
			}
	    	rows.add(str);
		    str = "";i+=1;
		}
		return rows;
	}	

	public static boolean up, down, left, right;
	public static boolean b1, b2, b3, b4;
	
	public static final int SCAN_A = java.awt.event.KeyEvent.VK_A;
	public static final int SCAN_B = java.awt.event.KeyEvent.VK_B;
	public static final int SCAN_C = java.awt.event.KeyEvent.VK_C;
	public static final int SCAN_D = java.awt.event.KeyEvent.VK_D;
	public static final int SCAN_E = java.awt.event.KeyEvent.VK_E;
	public static final int SCAN_F = java.awt.event.KeyEvent.VK_F;
	public static final int SCAN_G = java.awt.event.KeyEvent.VK_G;
	public static final int SCAN_H = java.awt.event.KeyEvent.VK_H;
	public static final int SCAN_I = java.awt.event.KeyEvent.VK_I;
	public static final int SCAN_J = java.awt.event.KeyEvent.VK_J;
	public static final int SCAN_K = java.awt.event.KeyEvent.VK_K;
	public static final int SCAN_L = java.awt.event.KeyEvent.VK_L;
	public static final int SCAN_M = java.awt.event.KeyEvent.VK_M;
	public static final int SCAN_N = java.awt.event.KeyEvent.VK_N;
	public static final int SCAN_O = java.awt.event.KeyEvent.VK_O;
	public static final int SCAN_P = java.awt.event.KeyEvent.VK_P;
	public static final int SCAN_Q = java.awt.event.KeyEvent.VK_Q;
	public static final int SCAN_R = java.awt.event.KeyEvent.VK_R;
	public static final int SCAN_S = java.awt.event.KeyEvent.VK_S;
	public static final int SCAN_T = java.awt.event.KeyEvent.VK_T;
	public static final int SCAN_U = java.awt.event.KeyEvent.VK_U;
	public static final int SCAN_V = java.awt.event.KeyEvent.VK_V;
	public static final int SCAN_W = java.awt.event.KeyEvent.VK_W;
	public static final int SCAN_X = java.awt.event.KeyEvent.VK_X;
	public static final int SCAN_Y = java.awt.event.KeyEvent.VK_Y;
	public static final int SCAN_Z = java.awt.event.KeyEvent.VK_Z;
	public static final int SCAN_0 = java.awt.event.KeyEvent.VK_0;
	public static final int SCAN_1 = java.awt.event.KeyEvent.VK_1;
	public static final int SCAN_2 = java.awt.event.KeyEvent.VK_2;
	public static final int SCAN_3 = java.awt.event.KeyEvent.VK_3;
	public static final int SCAN_4 = java.awt.event.KeyEvent.VK_4;
	public static final int SCAN_5 = java.awt.event.KeyEvent.VK_5;
	public static final int SCAN_6 = java.awt.event.KeyEvent.VK_6;
	public static final int SCAN_7 = java.awt.event.KeyEvent.VK_7;
	public static final int SCAN_8 = java.awt.event.KeyEvent.VK_8;
	public static final int SCAN_9 = java.awt.event.KeyEvent.VK_9;	
	
	public static boolean getkey(int key) {
		return Controls.getKey(key);
	}

	/*
	// Overkill (2006-06-30): Gets the contents of the key buffer.
	// TODO: Implement for other platforms.
	static String GetKeyBuffer()
	{
		//#ifdef __WIN32__
			return keybuffer;
		//#else 
			//err("The function GetKeyBuffer() is not defined for this platform.");
			//return String();
		//#endif
	}

	// Overkill (2006-06-30): Clears the contents of the key buffer.
	// TODO: Implement for other platforms.
	static void FlushKeyBuffer()
	{
		//#ifdef __WIN32__
			FlushKeyBuffer();
		//#else 
			//err("The function FlushKeyBuffer() is not defined for this platform.");
		//#endif
	}

	// Overkill (2006-06-30): Sets the delay in centiseconds before key repeat.
	// TODO: Implement for other platforms.
	static void SetKeyDelay(int d)
	{
		if (d < 0)
		{
			d = 0;
		}
		//#ifdef __WIN32__
			key_input_delay = d;
		//#else 
		//	err("The function SetKeyDelay() is not defined for this platform.");
		//#endif
	}	
	*/

	// Function (method) calling
	
	public static boolean functionexists(String function) {
		return executefunction(function, true);
	}
	
	/** Check methods in the following order:
	 * 
	 * 1. Direct Class-method (ex: sully.vc.v1_menu.Menu_System.DrawMenu)
	 * 2. System Lib (executed class, ex: Sully.class + method)
	 * 3. Loaded Map Class (ex: Bumsville.class + method)
	 *
	 * The called function must be public and without parameters.
	 * The capitalized version is also checked (ex: "entStart" checks also for "EntStart") 
	 * If the function is not found, nothing happens
	 * 	 
	 */
	public static void callfunction(String function) {
		executefunction(function, false);
	}
	
	private static boolean executefunction(String function, boolean justCheck) {
		
		if(function==null || function.isEmpty()) 
			return false;

		Class path = null;
		// This means that it is a direct class-method
		if (function.lastIndexOf(".") != -1) {
			String s = function.substring(function.lastIndexOf(".") + 1);
			String t = function.substring(0, function.lastIndexOf("."));
			try { 
				path = systemclass.forName(t);
			}
			catch(ClassNotFoundException cnfe) {
				log.error("Class " + path + " not found for direct execution (" + function + ")");
				return false;
			}
			invokeMethod(path, s, justCheck);
			return true;
		}
		else { // Try to find the class in the current_map
			 boolean notFoundInMap = false;
			 StringBuilder cName = new StringBuilder();
			 if(current_map != null && current_map.getFilename() != null) {
				 	cName.append(systemclass.getPackage().getName() + ".");
				 	
				 	int pos = current_map.getFilename().lastIndexOf('\\');
				 	if(pos==-1)
				 		pos = 0;
			 		StringBuilder b = new StringBuilder(current_map.getFilename().toLowerCase());
			 		b.replace(pos, pos+1, String.valueOf(Character.toUpperCase(b.charAt(pos))));
			 		String s = b.toString().substring(0, b.indexOf(".map")).replace('\\', '.');
			 		cName.append(s);
			 		
			 		try {
			 			path = systemclass.forName(cName.toString());
			 		}
					catch(ClassNotFoundException cnfe) {
						// FIXME Solve this mess, also use toUppercase and Capitalize first letter to avoid error on .MAP
		 				b = new StringBuilder(systemclass.getPackage().getName() + "." + mapname);
				 		s = b.toString().substring(0, b.lastIndexOf(".map")).replace('\\', '.').replace('/', '.');
				 		try {
							path = systemclass.forName(s);
						} catch (ClassNotFoundException e) {
							log.info("Class " + path + " not found for map execution.");
							notFoundInMap = true; //return;
						}	
					}
					if(path!=null) {
						if (!invokeMethod(path, function, justCheck))
							notFoundInMap = true;
						else
							return true; // Success
					}
			 }
			
			 // Try to find the method directly in the System class
			 if(current_map == null || current_map.getFilename() == null || notFoundInMap) {
			 
				 path = systemclass;
				 if (invokeMethod(path, function, justCheck)) {
					 return true; // Success
				 }
				 else {
					 log.error("Error invoking " + function + " in path " + path);
				 }
			 }
		}
		return false;
	}
	
	private static boolean invokeMethod(Class c, String function, boolean justCheck) { 

		Method[] allMethods = c.getDeclaredMethods();
		for (Method m : allMethods) {
			String mname = m.getName();
			if(mname.equals(function) || mname.equals(capitalize(function))) {

				if(justCheck)
					return true;
				
				try {
					//log.info("Found method " + mname + " in path " + c); // just for debug
					m.invoke(null);
					return true;
				} catch (IllegalArgumentException e) {
					e.printStackTrace();
				} catch (IllegalAccessException e) {
					e.printStackTrace();
				} catch (InvocationTargetException e) {
					e.printStackTrace();
				}
			}
		}
		return false;
	}
	
	/**
	 * Method for loading resources from the classpath, like images, fonts, sounds, etc 
	 */
	public static URL load(String url) {
		if(TEST_SIMULATION) // [Rafael]
			return null;
		
		log.info("(" + systemclass + ")" + ", reading: " + url);
		URL resource = systemclass.getResource(url);
		
		// Optional code, a little robustness to avoid case-sensitive issues
		if(resource == null) { // try to capitalize
			String newUrl;
			if(url.lastIndexOf('/') != -1) 
				newUrl = url.substring(0, url.lastIndexOf('/')+1) +
					capitalize(url.substring( url.lastIndexOf('/')+1));
			else
				newUrl = capitalize(url);
			log.info("WARNING! Resource not found. Trying to read: " + newUrl);
			resource = systemclass.getResource(newUrl);
			
			if(resource==null) { // try uppercase 
				if(url.lastIndexOf('/') != -1) 
					newUrl = url.substring(0,  url.lastIndexOf('/')+1) +
						url.substring( url.lastIndexOf('/')+1).toUpperCase();
				else
					newUrl = url.toUpperCase();
				log.info("WARNING! Resource not found. Trying to read: " + newUrl);
				resource = systemclass.getResource(newUrl);				
			}
			
			if(resource==null) { // try lowercase 
				if(url.lastIndexOf('/') != -1) 
					newUrl = url.substring(0,  url.lastIndexOf('/')+1) +
						url.substring( url.lastIndexOf('/')+1).toLowerCase();
				else
					newUrl = url.toLowerCase();
				log.info("WARNING! Resource not found. Trying to read: " + newUrl);
				resource = systemclass.getResource(newUrl);				
			}			
			
			if(resource==null) {
				log.error("ERROR! Resource not found: " + url);
			}
			
		}
		syncAfterLoading(); // Rafael
		return resource;
	}
	public static void setSystemPath(Class c) {
		systemclass = c;
	}
	
}
