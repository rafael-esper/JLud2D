package demos.ps.oo.menuGUI;

import java.awt.Color;
import java.awt.Font;
import java.util.Stack;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import core.Script;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu.Cancellable;
import demos.ps.oo.PSMenu.Outcome;
import demos.ps.oo.menuGUI.MenuType.*;
import domain.CHR;
import domain.Entity;
import domain.VImage;
import domain.VSound;
import static core.Script.*;
import static core.Controls.*;

public class MenuStack {

	private static final Logger log = LogManager.getLogger(MenuStack.class);
	
	public static int fontXSize;
	public static int fontYSize;
	public static Font menu_font;
	
	public static VImage moreIcon;
	
	public int STEXT_BOTTOM_X;
	public int STEXT_BOTTOM_Y;
	public int STEXT_BOTTOM_WX;
	public int STEXT_BOTTOM_WY;
	public int MAX_SCREEN_X;
	public int MAX_SCREEN_Y;
	public static int BETWEEN_ROWS_SPACE = 4;
	

	//public static Font menu_font = new Font(load("smallfont.gif"));
	protected static Color LIGHT_GRAY = new Color(90,90,90);
	protected static Color DARK_GRAY = new Color(60,60,60);
	protected static Color BACK_COLOR = new Color(0,32,100);

	private Stack<MenuType> menus = new Stack<MenuType>();
	
	public Outcome outcome;
	
	private boolean transportActive;
	
	public VImage back;
	public MenuCHR backAnim; // obs: not on the stack
	
	public CHR npc;
	public VImage entitySprite;
	public int entityX, entityY;
	
	int waitDelay = 0;

	public boolean showPlayers;

	public boolean hasMenu() {
		if(menus.size() > 0) {
			return true;
		}
		return false;
	}
	
	public void push(MenuType menu) {
		menus.push(menu);
	}
	
	public void pop() {
		MenuType m = menus.pop(); //pop();
		//m.state = State.CLOSE;
		//m.drawDelay = MAX_DELAY;
		//if(m instanceof MenuPromptBox) {
			//return ((MenuPromptBox) m).selected;
		//}
		//return 0;
	}
	
	// PS1 Generations: [i][j] matrix: Define for a group of i players, in which j position it appears on scenes 
	final static int[][] playerOrder = new int[][]{	
			new int[]{0},
			new int[]{0,1},
			new int[]{1,0,2},
			new int[]{1,2,0,3},
			new int[]{2,1,3,0,4}};
	
	public void drawMenus() {
		if(Script.TEST_SIMULATION) {
			return;
		}

		if(back == null && backAnim == null) {
			if(screen!=null) {
				screen.render();
			}
		}
		else {

			if(backAnim != null) {
				backAnim.draw(true);
			}

			if(back!= null && back.getImage() != null) {
				screen.blit(0, 0, back.getImage());
			}
			
			if(entitySprite != null) {
				screen.tblit(entityX, entityY, entitySprite);
			}

			int downPos = 190;
			if(npc != null) { // Show .chr NPC
				screen.blitentityframe(308, downPos, npc, 1);
			}
			
			if(showPlayers) { // Show .chr Players
				int numPlayers = countParty(player);
				//int playersSpace = ( * 40) /2;
				
				Entity e = entities.get(player);
				for(int i=0;i<numPlayers;i++) {
					screen.blitentityframe(308 - (countParty(player)-1)*20 + (playerOrder[numPlayers-1][i]*40), downPos+64, e.getChr(), e.getChr().getIdle()[1]);
					e = e.getFollower();
				}
			}
			
			
		}
		
		// If there is a waiting delay, don't draw menus, just the scene
		if (waitDelay > 0) {
			waitDelay--;
			return;
		}
			
		// Draw each menu.
		for(MenuType m: menus) {
			if(m.drawDelay > 0) { // Draw just the opening menu
				m.draw(true);
				break;
			}
			if(menus.lastElement().equals(m)) { // Last menu is active
				m.draw(true);
			}
			else {
				m.draw(false); // Others are inactive
			}			
		}
	}
	

	public MenuLabelBox createOneLabelBox(int xpos, int ypos, String text, boolean delay) {
		log.debug(text);
		return new MenuLabelBox(xpos, ypos, new String[]{text}, delay, false);
	}

	public MenuLabelBox createCenteredLabelBox(int xpos, int ypos, String text, boolean delay) {
		log.debug(text);
		return new MenuLabelBox(xpos, ypos, new String[]{text}, delay, true);
	}
	
	public MenuLabelBox createLabelBox(int xpos, int ypos, String text[], boolean delay) {
		for(String s: text) {
			log.debug(s);
		}
		return new MenuLabelBox(xpos, ypos, text, delay, false);
	}
	
	public MenuImageBox createImageBox(int xpos, int ypos, VImage image, boolean delay) {
		return new MenuImageBox(xpos, ypos, image, delay);
	}
	
	
	public MenuTextBox createTextBox(int x, int y, int wx, int wy, String r1, String r2, boolean hasDelay, boolean hasMore) {
		log.debug(r1 + ("".equals(r2) ? "" : " " + r2.trim()));
		return new MenuTextBox(x, y, wx, wy, r1, r2, hasDelay, hasMore);
	}

	public MenuPromptBox createPromptBox(int x, int y, String[] options, boolean hasDelay) {
		for(String s: options) {
			log.debug("\t" + s);
		}
		return new MenuPromptBox(x, y, options, hasDelay);
	}
	
	
	/** Returns the length of the longest string in the String array
	 */
	public static int getMaxSize(String[] options) {
		int max = 0;
		for(String s: options) {
			if(s!=null && s.length() > max)
				max = s.length();
		}	
		return max;
	}
	
	public static int getMaxTextLength(String[] options) {
		int max = 0;
		for(String s: options) {
			if(s!=null && screen!= null && screen.g.getFontMetrics().stringWidth(s) > max)
				max = screen.g.getFontMetrics().stringWidth(s);
		}	
		return max;
	}	
	
	public static int getTextLength(String s) {
		return screen.g.getFontMetrics().stringWidth(s);
	}
	
	
	public static void drawTextBox(int x, int y, String text) {
		drawBox(x, y, 10+text.length()*fontXSize, fontYSize + 6);
		screen.g.setFont(MenuStack.menu_font);
		screen.g.setColor(Color.WHITE);
		screen.g.drawString(text, x+4+fontXSize, y+7);	
	}

	static void drawBox(int x, int y, int wx, int wy) {
		setlucent(15);
		screen.rectfill(x+5,y+5,wx+x,wy+y,BACK_COLOR);
		screen.rect(x+4,y+4,wx+x-4,wy+y-4,DARK_GRAY);
		screen.rect(x+3,y+3,wx+x-3,wy+y-3,LIGHT_GRAY);
		screen.rect(x+2,y+2,wx+x-2,wy+y-2,LIGHT_GRAY);
		screen.rect(x+1,y+1,wx+x-1,wy+y-1,DARK_GRAY);
		screen.rect(x,y,wx+x,wy+y,BACK_COLOR);
		setlucent(0);
	}
	
	public void waitB1() {
		if(Script.TEST_SIMULATION) {
			return;
		}
		checkPreMenu();
		while(!b1) {
			drawMenus();
			//colorfilter(1, screen);
			showpage();
		}
		unpress(1);
		checkPosMenu();
	}
	
	public boolean waitAnyButton() {
		if(Script.TEST_SIMULATION) {
			return true;
		}

		boolean actionPressed = false;
		checkPreMenu();
		while(!b1 && !b2 && !b3) {
			drawMenus();
			//colorfilter(1, screen);
			showpage();
		}
		if(b1) {
			actionPressed = true;
		}
		unpress(1);
		unpress(2);
		checkPosMenu();
		return actionPressed;
	}
	
	
	public int waitOpt(Cancellable cancellable) {
		if(Script.TEST_SIMULATION) {
			log.info(Integer.toString(TEST_OPTIONS[TEST_POS]));
			return TEST_OPTIONS[TEST_POS++];
		}
		
		unpress(9);
		checkPreMenu();
		
		// Find last MenuPromptBox
		MenuPromptBox box = null;
		for(MenuType m: menus) {
			if(m instanceof MenuPromptBox) {
				box = (MenuPromptBox) m;
			}
		}
		
		while(true) {
			if(b1) {
				if(!box.enabled[box.selected]) {
					// TODO Sound?
				}
				else {
					break;
				}
			}
			if(up) {
				PSGame.playSound(PS1Sound.MENU);
				box.previousOption();
				UnUp();
			}
			if(down) {
				PSGame.playSound(PS1Sound.MENU);
				box.nextOption();
				UnDown();
			}
			if(b3 && cancellable.equals(Cancellable.TRUE)) {
				unpress(3);
				setentitiespaused(false);
				//unpauseplayerinput();
				return -1;
			}
			
			drawMenus();
			showpage();
		}
		unpress(1);
		checkPosMenu();
		return box.selected;
	}

	public void setdelay(int i) {
		waitDelay = i;
	}

	public void waitReady(MenuType menu) {
		checkPreMenu();
		while(menu.state != State.READY) {
			drawMenus();
			showpage();
		}
		unpress(1);
		checkPosMenu();	
	}

	public void waitAnimationEnd(MenuType menu) {
		if(Script.TEST_SIMULATION) {
			return;
		}

		checkPreMenu();
		while(menu.state != State.CLOSE) {
			drawMenus();
			showpage();
		}
		checkPosMenu();
	}

	public void waitDelay(int i) {
		if(Script.TEST_SIMULATION) {
			return;
		}

		checkPreMenu();
		timer = 0;
		while(timer < i) {
			drawMenus();
			showpage();
		}
		checkPosMenu();
	}

	public void waitB1OrTimeout(MenuType menu) {
		checkPreMenu();
		while(!b1 && menu.state != State.CLOSE) {
			drawMenus();
			showpage();
		}
		unpress(1);
		checkPosMenu();
	}

	public void checkPreMenu() {
		setentitiespaused(true);
		if(PSGame.canTransport) {
			transportActive = true;
		}
		PSGame.transportOff();		
	}	
	
	public void checkPosMenu() {
		setentitiespaused(false);
		if(transportActive) {
			PSGame.transportOn();
		}
	}	

}


