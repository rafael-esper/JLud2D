package core;

import static core.Script.*;

import java.awt.Point;
import java.awt.event.*;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Controls 
implements MouseListener, MouseMotionListener, FocusListener, KeyListener, WindowListener
{

	private static final Logger log = LogManager.getLogger(Controls.class);
	
	public static boolean kill_up, kill_down, kill_left, kill_right;
	public static boolean kill_b1, kill_b2, kill_b3, kill_b4;

	public static String bindbutton[] = new String[4];
	public static String bindarray[] = new String [128];
	
	public static void UnUp() { kill_up = true; up = false; }
	public static void UnDown() { kill_down = true; down = false; }
	public static void  UnLeft() { kill_left = true; left = false; }
	public static void  UnRight() { kill_right = true; right = false; }
	public static void  UnB1() { kill_b1 = true; b1 = false; }
	public static void  UnB2() { kill_b2 = true; b2 = false; }
	public static void  UnB3() { kill_b3 = true; b3 = false; }
	public static void  UnB4() { kill_b4 = true; b4 = false; }
	
	/*[Rafael] Use interface instead 
	 * boolean k_b1 = SCAN_ENTER,
	     k_b2 = SCAN_ALT,
		 k_b3 = SCAN_ESC,
		 k_b4 = SCAN_SPACE;

	// Overkill (2006-06-25): Customizable directionals on the keyboard.
	byte k_up = SCAN_UP,
		 k_down = SCAN_DOWN,
		 k_left = SCAN_LEFT,
		 k_right = SCAN_RIGHT;*/

	byte j_b1=0, j_b2=1, j_b3=2, j_b4=3;

	/***************************** code *****************************/
	//int _input_killswitch;
	
	public static void UpdateControls()
	{
		//[Rafael] HandleMessages();

		/*[Rafael] if( _input_killswitch ) {
			b4 = b3 = b2 = b1 = right = left = down = up = false;
			return;
		}*/

		/* [Rafael] Use JGame implementation
		joy_Update();
		mouse_Update();
		UpdateKeyboard();
*/
		boolean oldb1 = b1,
			 oldb2 = b2,
		     oldb3 = b3,
			 oldb4 = b4;

		// Overkill (2006-06-25):
		// The following four ifs have been altered to allow custom directional keys.
		if (getKey(KeyUp)) up = true; else up = false;
		if (getKey(KeyLeft)) left = true; else left = false;
		if (getKey(KeyDown)) down = true; else down = false;
		if (getKey(KeyRight)) right = true; else right = false;

		if (getKey(KeyEnter)) b1 = true; else b1 = false;
		if (getKey(KeyAlt)) b2 = true; else b2 = false;
		if (getKey(KeyEsc)) b3 = true; else b3 = false;
		if (getKey(KeyFire)) b4 = true; else b4 = false;

		if (!up && kill_up) kill_up = false;
		if (!down && kill_down) kill_down = false;
		if (!left && kill_left) kill_left = false;
		if (!right && kill_right) kill_right = false;

		if (!b1 && kill_b1) kill_b1 = false;
		if (!b2 && kill_b2) kill_b2 = false;
		if (!b3 && kill_b3) kill_b3 = false;
		if (!b4 && kill_b4) kill_b4 = false;

		if (up && kill_up) up = false;
		if (down && kill_down) down = false;
		if (left && kill_left) left = false;
		if (right && kill_right) right = false;

		if (b1 && kill_b1) b1 = false;
		if (b2 && kill_b2) b2 = false;
		if (b3 && kill_b3) b3 = false;
		if (b4 && kill_b4) b4 = false;

		//mbg 9/5/05 todo removed for psp
		// TODO LUA
		if (b1 && !oldb1) callfunction(bindbutton[0]);
		if (b2 && !oldb2) callfunction(bindbutton[1]);
		if (b3 && !oldb3) callfunction(bindbutton[2]);
		if (b4 && !oldb4) callfunction(bindbutton[3]);
		
		// Rafael (2014: new)
		for(int i=0; i<bindarray.length; i++) {
			if(getKey(i) && bindarray[i] != null && !bindarray[i].isEmpty()) {
				callfunction(bindarray[i]);
			}
		}
	}

	// JGAME STUFF **** /////////////////////////////////////////////
	
	void updateMouse(MouseEvent e,boolean pressed, boolean released, boolean inside) {
				mousepos = e.getPoint();
				/* [Rafael] mousepos.x = (int)(mousepos.x/el.x_scale_fac);
				mousepos.y = (int)(mousepos.y/el.y_scale_fac); */
				mouseinside=inside;
				int button=0;
				if ((e.getModifiers()&InputEvent.BUTTON1_MASK)!=0) button=1;
				if ((e.getModifiers()&InputEvent.BUTTON2_MASK)!=0) button=2;
				if ((e.getModifiers()&InputEvent.BUTTON3_MASK)!=0) button=3;
				if (button==0) return;
				if (pressed)  {
					mousebutton[button]=true;
					keymap[255+button]=true;
					/* [Rafael] if (wakeup_key==-1 || wakeup_key==255+button) {
						if (!eng.isRunning()) {
							eng.start();
							// mouse button is cleared when it is used as wakeup key
							mousebutton[button]=false;
							keymap[255+button]=false;
						}
					}*/
				}
				if (released) {
					mousebutton[button]=false;
					keymap[255+button]=false;
				}
			}

			public void mouseClicked(MouseEvent e) {
				// part of the "official" method of handling keyboard focus
				// some people think it's a bug.
				// http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4362074
				if (!has_focus) MainEngine.getGUI().getCanvas().requestFocus();
				updateMouse(e,false,false,true); 
			}
			public void mouseEntered(MouseEvent e) {
				updateMouse(e,false,false,true); 
			}
			public void mouseExited(MouseEvent e) {
				updateMouse(e,false,false,false); 
			}
			public void mousePressed(MouseEvent e) {
				updateMouse(e,true,false,true); 
			}
			public void mouseReleased(MouseEvent e) {
				updateMouse(e,false,true,true); 
			}
			public void mouseDragged(MouseEvent e) {
				updateMouse(e,false,false,true); 
			}
			public void mouseMoved(MouseEvent e) {
				updateMouse(e,false,false,true);
				//MainEngine.getGUI().menuBar.setVisible(MainEngine.getGUI().menuBar.isVisible() || (e.getY() < 50 && MainEngine.getGUI().isUndecorated()));
			}
			public void focusGained(FocusEvent e) {
				has_focus=true;
			}
			public void focusLost(FocusEvent e) {
				has_focus=false;
			}

			/* Standard Wimp event handlers */
			public void keyPressed(KeyEvent e) {
				char keychar = e.getKeyChar();
				int keycode = e.getKeyCode();
				if (keycode>=0 && keycode < 256) {
					keymap[keycode]=true;
					lastkey=keycode;
					lastkeychar=keychar;
				/* [Rafael]	if (wakeup_key==-1 || wakeup_key==keycode) {
						if (!eng.isRunning()) {
							eng.start();
							// key is cleared when it is used as wakeup key
							keymap[keycode]=false;
						}
					}*/
				}
				/* shift escape = exit */
				if (e.isShiftDown () 
				&& e.getKeyCode () == KeyEvent.VK_ESCAPE) {
				// [Rafael]&& !eng.isApplet()) {
					System.exit(0);
				}
				//log.info(e+" keychar"+e.getKeyChar());
			}

			/* handle keys, shift-escape patch by Jeff Friesen */
			public void keyReleased (KeyEvent e) {
				char keychar = e.getKeyChar ();
				int keycode = e.getKeyCode ();
				if (keycode >= 0 && keycode < 256) {
					keymap [keycode] = false;
				}
			}
			public void keyTyped (KeyEvent e) { }
	
			/* WindowListener handlers */

			public void windowActivated(WindowEvent e) {}
			public void windowClosed(WindowEvent e) {
				log.info("Window closed");
			}
			public void windowClosing(WindowEvent e) {
				log.info("Window closed; exiting.");
				MainEngine.getGUI().closeWindow();
			}
			public void windowDeactivated(WindowEvent e) {}
			public void windowDeiconified(WindowEvent e) {}
			public void windowIconified(WindowEvent e) {}
			public void windowOpened(WindowEvent e) {}
			
			

	/** Cursor keys for both regular and mobile keyboard. */
	public static final int KeyUp=38,KeyDown=40,KeyLeft=37,KeyRight=39;
	/** On a mobile, the cursor control Fire is the same as shift. */
	public static final int KeyShift=16;
	/** Fire stands for a mobile key, indicating the fire button of the cursor
	 * controls.  It is equivalent to KeyShift. */
	public static final int KeyFire=16;
	public static final int KeyCtrl=17;
	public static final int KeyAlt=18;
	public static final int KeyEsc=27;
	/** On a mobile, pressing "*" also triggers KeyEnter. */
	public static final int KeyEnter=10;
	/** The mobile Star key, equal to '*'. */
	public static final int KeyStar='*';
	/** The mobile Pound key, equal to '#'. */
	public static final int KeyPound='#';
	public static final int KeyBackspace=8; /* is it different sometimes? */
	public static final int KeyTab=9;
	/** Keymap equivalent of mouse button. */
	public static final int KeyMouse1=256, KeyMouse2=257, KeyMouse3=258;
	
	public static final int KeyF1=112;
	public static final int KeyF2=113;
	public static final int KeyF3=114;
	public static final int KeyF4=115;
	public static final int KeyF5=116;
	public static final int KeyF6=117;
	public static final int KeyF7=118;
	public static final int KeyF8=119;
	public static final int KeyF9=120;
	public static final int KeyF10=121;
	public static final int KeyF11=122;
	public static final int KeyF12=123;
	
	
	
	/* mouse */

	boolean has_focus=false;
	Point mousepos = new Point(0,0);
	boolean [] mousebutton = new boolean[] {false,false,false,false};
	boolean mouseinside=false;

	/* keyboard */

	/** The codes 256-258 are the mouse buttons */
	static boolean [] keymap = new boolean [256+3];
	static int lastkey=0;
	static char lastkeychar=0;
	int wakeup_key=0;

	public void clearKeymap() {
		for (int i=0; i<256+3; i++) keymap[i]=false;
	}

	public void wakeUpOnKey(int key) { wakeup_key=key; }

	/* input */

	// get methods unnecessary, variables accessed directly from JGEngine

	public int getMousePosX() { return mousepos.x; }
	public int getMousePosY() { return mousepos.y; }
	public int getMouseX() { return mousepos.x; }
	public int getMouseY() { return mousepos.y; }

	public boolean getMouseButton(int nr) { return mousebutton[nr]; }
	public void clearMouseButton(int nr) { mousebutton[nr]=false; }
	public void setMouseButton(int nr) { mousebutton[nr]=true; }
	public boolean getMouseInside() { return mouseinside; }

	public static boolean getKey(int key) { return keymap[key]; }
	public static void clearKey(int key) { keymap[key]=false; }
	public static void setKey(int key) { keymap[key]=true; }

	public static int getLastKey() { return lastkey; }
	public static char getLastKeyChar() { return lastkeychar; }


	public static void clearLastKey() {
		lastkey=0;
		lastkeychar=0;
	}

	public static String getKeyDescStatic(int key) {
		if (key==32) return "space";
		if (key==0) return "(none)";
		if (key==KeyEnter) return "enter";
		if (key==KeyEsc) return "escape";
		if (key==KeyUp) return "cursor up";
		if (key==KeyDown) return "cursor down";
		if (key==KeyLeft) return "cursor left";
		if (key==KeyRight) return "cursor right";
		if (key==KeyShift) return "shift";
		if (key==KeyAlt) return "alt";
		if (key==KeyCtrl) return "control";
		if (key==KeyMouse1) return "left mouse button";
		if (key==KeyMouse2) return "middle mouse button";
		if (key==KeyMouse3) return "right mouse button";
		if (key==27) return "escape";
		if (key >= 33 && key <= 95)
			return new String(new char[] {(char)key});
		return "keycode "+key;
	}

	public static int getKeyCodeStatic(String keydesc) {
		// tab, enter, backspace, insert, delete, home, end, pageup, pagedown
		// escape
		keydesc = keydesc.toLowerCase().trim();
		if (keydesc.equals("space")) {
			return 32;
		} else if (keydesc.equals("escape")) {
			return KeyEsc;
		} else if (keydesc.equals("(none)")) {
			return 0;
		} else if (keydesc.equals("enter")) {
			return KeyEnter;
		} else if (keydesc.equals("cursor up")) {
			return KeyUp;
		} else if (keydesc.equals("cursor down")) {
			return KeyDown;
		} else if (keydesc.equals("cursor left")) {
			return KeyLeft;
		} else if (keydesc.equals("cursor right")) {
			return KeyRight;
		} else if (keydesc.equals("shift")) {
			return KeyShift;
		} else if (keydesc.equals("alt")) {
			return KeyAlt;
		} else if (keydesc.equals("control")) {
			return KeyCtrl;
		} else if (keydesc.equals("left mouse button")) {
			return KeyMouse1;
		} else if (keydesc.equals("middle mouse button")) {
			return KeyMouse2;
		} else if (keydesc.equals("right mouse button")) {
			return KeyMouse3;
		} else if (keydesc.startsWith("keycode")) {
			return Integer.parseInt(keydesc.substring(7));
		} else if (keydesc.length() == 1) {
			return keydesc.charAt(0);
		}
		return 0;
	}
	
	
	
	
}
