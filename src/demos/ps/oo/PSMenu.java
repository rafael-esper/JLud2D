package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;
import static demos.ps.oo.PSGame.BASE_FOLDER;
import static demos.ps.oo.menuGUI.MenuStack.getMaxTextLength;

import java.awt.Color;
import java.awt.Font;
import java.util.List;

import core.Script;
import demos.ps.PSDungeon;
import demos.ps.oo.PSGame.ScreenSize;
import demos.ps.oo.PSLibCHR.PS1CHR;
import demos.ps.oo.menuGUI.MenuCHR;
import demos.ps.oo.menuGUI.MenuImageBox;
import demos.ps.oo.menuGUI.MenuScrollerText;
import demos.ps.oo.menuGUI.MenuStack;
import demos.ps.oo.menuGUI.MenuTextBox;
import domain.CHR;
import domain.VImage;

public class PSMenu {

	private static final Logger log = LogManager.getLogger(PSMenu.class);

	public static MenuStack instance = new MenuStack();

	public enum Scene {BLACK, BLUE_HOUSE, YELLOW_HOUSE, HOSPITAL, CHURCH, SHOP_CENTRAL, SHOP_FOOD, SHOP_HAND, SHOP_WEAPON,
							VILLAGE_HOUSE, SHOP_FOOD_VILLAGE, SHOP_HAND_VILLAGE, SHOP_WEAPON_VILLAGE, HOSPITAL_VILLAGE, CHURCH_VILLAGE,
							RUINED_HOUSE, SPACESHIP, PALACE, VILLA, CITY, BAYA, ALTAR, SCREEN, SCREEN_NOFADE, TITLE, ENDING,
							DUNGEON, CORRIDOR, FOREST, FIELDS, DESERT, ARTIC, PINES, SKY, BEACH, SEA, LAVA, GAS, CAVE};
	
	public enum EntityType {CITY_MAN_BLOND, CITY_WMN_BLOND, VILLA_MAN_BLOND, VILLA_WMN_BLOND,
								CITY_MAN_BROWN, CITY_WMN_BROWN, VILLA_MAN_BROWN, VILLA_WMN_BROWN,
								CITY_MAN_BLUE, CITY_WMN_BLUE, VILLA_MAN_BLUE, VILLA_WMN_BLUE, 
								CITY_MAN_CUSTOM, CITY_WMN_CUSTOM, MOTA_NOCAP, MOTA_CAP, 
								MOTA_MASK, MOTA_CUSTOM, DEZO, NECRO, SPECIAL};
		
	public enum EntityClothes {RED, GREEN, BLUE, WHITE};
	public enum MotaCape {GREEN, RED, YELLOW, BROWN};
	public enum DezoType {REGULAR, HEAD, BLUE, TORCH};
	public enum NecroType {PALMAN, DEZO, ESPER, SKULL};
	
	public enum SpecialEntity {NONE, OLDMAN, BEGGAR, ROBOTCOP, PRIEST, LUVENO, HASHIM, DEZOMAN, DEZO_PRIEST};
	public enum LargeEntity {NOAH, JUNK, HAPSBY, GOVERNOR, MYAU, ALIS, LAERMA1, LAERMA2, SORCERER}; 
	
	public enum Cancellable {TRUE, FALSE};
	public enum Position {TOP_LEFT, TOP_CENTER, TOP_RIGHT, BOTTOM_ROW};
	public enum Outcome { NO_FADE, FADE, FADE_HOUSE, FADE_DUNGEON}; 
	
	public static void initPSMenu(ScreenSize screenSize) {
		
		if(screenSize == ScreenSize.SCREEN_320_240) {
			instance.MAX_SCREEN_X = 320;
			instance.MAX_SCREEN_Y = 240;
			MenuStack.menu_font = new Font("Monospaced", Font.BOLD, 12);
			//MenuStack.menu_font = new Font("Sans Serif", Font.PLAIN, 13);
			//MenuStack.menu_font = new Font("Helvetica", Font.PLAIN, 12);

			MenuStack.fontXSize = 7;
			MenuStack.fontYSize = 11;
		} else if(screenSize == ScreenSize.SCREEN_640_480) {
			instance.MAX_SCREEN_X = 640;
			instance.MAX_SCREEN_Y = 480;
			MenuStack.menu_font = new Font("Monospaced", Font.BOLD, 16);
			MenuStack.fontXSize = 16;
			MenuStack.fontYSize = 16;
		}
		
		screen.g.setFont(MenuStack.menu_font);
		instance.moreIcon = new VImage(load("/" + BASE_FOLDER + "/oo/menuGUI/Next_Icon.png"));
		
		instance.STEXT_BOTTOM_X = instance.MAX_SCREEN_X / 14;
		instance.STEXT_BOTTOM_Y = (int) (instance.MAX_SCREEN_Y / 1.4);

		instance.STEXT_BOTTOM_WX = instance.MAX_SCREEN_X - instance.STEXT_BOTTOM_X*2;
		instance.STEXT_BOTTOM_WY = 16*2 + 10;
	}
	
	public static void menuOn() {
		String base = BASE_FOLDER.replace("/", ".");
		hookbutton(4, base + ".oo.PSMenuMain.menu");
		if(PSGame.gameData != null && PSGame.gameData.enableCheats) {
			hookkey(Script.SCAN_M, base + ".oo.PSMenuMain.cheatMenu");
		}
	}

	public static void menuOff() {
		hookbutton(4, "");
		hookkey(Script.SCAN_M, "");
	}
	
	// This is PS1 Generations: Showing entities
	public static void startScene(Scene scene, String strChar) {
		// Big Screen has Players in the Scene graphics
		if(PSGame.gameData.getScreenSize() == ScreenSize.SCREEN_640_480) {
			instance.npc = CHR.loadChr(strChar);
			instance.showPlayers = true;
		} else {
			instance.npc = null;
			instance.showPlayers = false;
		}

		startScene(scene);
	}
	
	public static void startScene(Scene scene, EntityType entityType, Enum<?> en) {
		startScene(scene, entityType, en.ordinal());
	}	
	
	
	public static void startScene(Scene scene, SpecialEntity specialEntity) {
		if(!Script.TEST_SIMULATION) {
			if(specialEntity == SpecialEntity.NONE) {
				instance.entitySprite = null;
				startScene(scene);
				return;
			}
			startScene(scene, EntityType.SPECIAL, specialEntity.ordinal()-1);
		}
	}	
	
	public static void startScene(Scene scene, LargeEntity largeEntity) {
		if(!Script.TEST_SIMULATION) {
			instance.entitySprite = new VImage(56, 112);
			instance.entitySprite.image = PSGame.getCHR(PS1CHR.IMG_ENTITIES_LARGE).getFrames()[largeEntity.ordinal()];
			instance.entityY = 210 - instance.entitySprite.height;
		}
		
		startScene(scene);
	}
	
	public static void startScene(Scene scene, CHR chr) {
		if(!Script.TEST_SIMULATION) {
			instance.entitySprite = new VImage(chr.getFxsize(), chr.getFysize());
			instance.entitySprite.image = chr.getFrames()[0];
			instance.entityY = 183 - instance.entitySprite.height;
		}
		startScene(scene);
	}
	
	private static void startScene(Scene scene, EntityType entityType, int numIndex) {
		if(Script.TEST_SIMULATION) {
			return;
		}
		
		instance.entitySprite = null;
		instance.entitySprite = new VImage(35, 90);
		
		boolean isHalf = false;
		if(scene.name().startsWith("SHOP") || scene.name().startsWith("HOSP") || scene.name().startsWith("CHURCH")) {
			isHalf = true;
		}
		Color transC = Color.MAGENTA; //new Color(PSGame.getCHR(PS1CHR.IMG_ENTITIES).getFrames()[0].getRGB(0, 0));	
		instance.entitySprite.tgrabRegion(0, 0, 35, isHalf ? 51 : 90, 0, 0, transC, PSGame.getCHR(PS1CHR.IMG_ENTITIES).getFrames()[(entityType.ordinal())*4 + numIndex]);
		instance.entityY = 183 - instance.entitySprite.height;
		
		if(!isHalf && (entityType == EntityType.MOTA_CAP || entityType == EntityType.MOTA_MASK || 
				entityType == EntityType.MOTA_NOCAP || entityType == EntityType.MOTA_CUSTOM)) {
			instance.entityY+=20;	
		}

		startScene(scene);
	}
	
	// General Scene 
	private static void startScene(Scene scene) {
		unpress(9);

		if(instance.entitySprite != null) {
			instance.entityX = 320 /2 - (instance.entitySprite.width/2);
			if(scene == Scene.DUNGEON || scene == Scene.CORRIDOR) {
				instance.entityY+= 13;
			}
				//instance.entityY = 196 - instance.entitySprite.height;
				//instance.entityY = 151 - instance.entitySprite.height/2; //196 - instance.entitySprite.height; //Was 106
				
				//else
				//instance.entityY = 183 - instance.entitySprite.height;
				//instance.entityY = 138 - instance.entitySprite.height/2; //183 - instance.entitySprite.height; //Was 93
		}
		
		setentitiespaused(true);
		PSMenu.menuOff();
		
		if(scene == Scene.DUNGEON || scene == Scene.SCREEN || scene == Scene.BLACK || scene == Scene.ALTAR) {
			screen.fadeIn(25, false);
		} else if (scene == Scene.CORRIDOR || scene == Scene.SCREEN_NOFADE) {
			// do nothing
		} else {
			screen.fade(25, true);
			instance.back = null; 
			instance.backAnim = null;
		}

		instance.setdelay(20);
		switch(scene) {

			case BLUE_HOUSE:			case YELLOW_HOUSE:			case SHOP_FOOD: 
			case SHOP_HAND: 			case SHOP_WEAPON:			case HOSPITAL:
			case CHURCH:				case VILLAGE_HOUSE:			case SHOP_FOOD_VILLAGE: 
			case SHOP_HAND_VILLAGE: 	case SHOP_WEAPON_VILLAGE:	case HOSPITAL_VILLAGE:
			case CHURCH_VILLAGE:		case RUINED_HOUSE:			case SPACESHIP:
			case PALACE:				case VILLA:					case CITY:
			case TITLE:					case ENDING:

				instance.back = PSGame.getImage(scene);
				instance.outcome = Outcome.FADE_HOUSE;
				break;

			case CAVE:					case FOREST:				case FIELDS:			case DESERT:				
			case ARTIC:					case PINES:					case SKY:				

				instance.back = PSGame.getImage(scene);
				instance.outcome = Outcome.FADE;
				break;
				
			case BAYA:				
				instance.setdelay(0);
				instance.back = PSGame.getImage(scene);
				instance.outcome = Outcome.FADE;
				break;
				
			case LAVA:
				instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_LAVA));
				instance.outcome = Outcome.FADE;
				break;
			case BEACH:
				instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_BEACH));
				instance.outcome = Outcome.FADE;
				break;
			case SEA:
				instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_SEA));
				instance.outcome = Outcome.FADE;
				break;
			case GAS:
				instance.backAnim = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ANIM_GAS));
				instance.outcome = Outcome.FADE;
				break;				
				
			case ALTAR:
				instance.back = PSGame.getImage(scene);
				instance.outcome = Outcome.FADE_DUNGEON;
				break;
				
			case DUNGEON:				// instance.back already set	
				instance.outcome = Outcome.FADE_DUNGEON;
				break;
			
			case CORRIDOR: 				// instance.back already set
				instance.outcome = Outcome.NO_FADE;
				break;
			
			case SCREEN:	case SCREEN_NOFADE:				// instance.back already set
				instance.outcome = Outcome.FADE_HOUSE;
				instance.setdelay(0);
				break;
				
			default: 
				instance.back = new VImage(screen.width, screen.height);
				instance.outcome = Outcome.FADE_HOUSE;
		}
		
		
	}
	
	
	public static void endScene() {
		endScene(instance.outcome);
	}
	
	public static void endScene(Outcome outcome) {
		if(TEST_SIMULATION) {
			return;
		}
		//unpress(9);
		instance.npc = null;
		instance.entitySprite = null;
		instance.backAnim = null;
		
		if(outcome == Outcome.FADE_HOUSE || outcome == Outcome.FADE) {
			instance.back = null;
			
			if(outcome == Outcome.FADE_HOUSE) {
				Script.pauseplayerinput();
				PSGame.regroup(0, +1); 
				screen.fade(25, false);
				Script.unpauseplayerinput();
			}
			if(outcome == Outcome.FADE) {
				Script.pauseplayerinput();
				if(!PSGame.isOnTransport()) {
					PSGame.regroup(0, 0);
				}
				screen.fadeOut(50, false);
				Script.unpauseplayerinput();
			}
			setentitiespaused(false);			
		}
		else {
			if(outcome == Outcome.FADE_DUNGEON) {
				screen.fadeOut(25, false);
				PSDungeon.warpBack(2);
			}
		}
		PSMenu.menuOn();
	}
	

	public static void cinematicText(VImage portrait, String[] texts) {
		
		instance.push(MenuImageBox.MenuImage(32, 22, portrait));

		for(int t=0; t<texts.length; t++) {
			List<String> rows = splitTextIntoRows(texts[t], 30);
			
			for(int i=0; i<=(rows.size()-1)/4; i++) {
				String[] strText = new String[Math.min (4, rows.size() -  i*4)]; 
				
				for(int j=0; j<strText.length; j++) {
					strText[j] = rows.get(i*4 + j); //.toUpperCase();
					log.info(strText[j]); 
				}
	
				MenuScrollerText menuScrollerText = new MenuScrollerText(35, 22+113+15, strText);
				instance.push(menuScrollerText);
				
				//instance.drawMenus();
				//screen.fadein(25,  false);
				if(!TEST_SIMULATION) {
					instance.waitReady(menuScrollerText);
					instance.waitB1();

					// If last chunck of text, fade out
					if(t==texts.length-1 && i+1 > (rows.size()-1)/4) {
						screen.fadeOut(25, false);
					}
				}	

				instance.pop();
			}
		}
		 
		instance.pop();
	}
	
	public static int Prompt(String text, String[] choices) {
		return Prompt(text, choices, true);
	}
	public static int PromptNext(String text, String[] choices) {
		return Prompt(text, choices, false);
	}
	
	
	private static int Prompt(String text, String[] choices, boolean isFirst) {
		List<String> rows = splitTextIntoRows(text, 37);

		// Show multiples textboxes with at most two rows for the text
		MenuTextBox textBox = null;
		for(int j=0; j<rows.size(); j++) {		

			String r2 = "";
			if(j+1 < rows.size()) // If the second row is necessary
				r2 = rows.get(j+1);
			
			textBox = instance.createTextBox(instance.STEXT_BOTTOM_X, instance.STEXT_BOTTOM_Y, instance.STEXT_BOTTOM_WX, instance.STEXT_BOTTOM_WY, rows.get(j), r2, (j<2) && isFirst, (j+2 > rows.size()));

			instance.push(textBox);
			if(j+2 < rows.size()) {
				if(!TEST_SIMULATION) {
					instance.waitB1();
					if(textBox.endTextDelay()) {
						instance.waitB1();	
					}
				}
			} else { // issue prompt
				if(!TEST_SIMULATION) {
					instance.waitReady(textBox);
				}
				
				instance.push(instance.createPromptBox(instance.MAX_SCREEN_X*3/4 - getMaxTextLength(choices),    //MenuStack.getMaxSize(choices)*MenuStack.fontXSize), 
						instance.STEXT_BOTTOM_Y-15-choices.length*(MenuStack.fontYSize+MenuStack.BETWEEN_ROWS_SPACE), choices, true));
				
				int ret = 0;
				if(!TEST_SIMULATION) {
					ret = instance.waitOpt(Cancellable.TRUE);
				} else {
					log.info(Integer.toString(TEST_OPTIONS[TEST_POS]));
					return TEST_OPTIONS[TEST_POS++];
				}

				instance.pop();
				instance.pop();
				return ret+1; // Start counting options from 1
			}
			j++;
			instance.pop();
		}
		return 0;	
	}


	/**
	 * @param text: the text to be broken into one or more text boxes
	 * @param isFirst: if this is the first dialogue on a row
	 * @param hasNext: if there is going to be a new SText afterwards
	 */
	private static void Stext(String text, boolean isFirst, boolean hasNext, boolean timeout) {
		boolean first = isFirst;
		List<String> rows = splitTextIntoRows(text, 37); // was 45
		
		// Show multiples textboxes with at most two rows for the text
		for(int j=0; j<rows.size(); j++) {
			
			String r2 = "";
			if(j+1 < rows.size()) // If the second row is necessary
				r2 = rows.get(j+1);
			
			boolean next = false;
			if(j+2 < rows.size() || hasNext) {
				next = true;
			}
				
			MenuTextBox textBox = instance.createTextBox(instance.STEXT_BOTTOM_X, instance.STEXT_BOTTOM_Y, instance.STEXT_BOTTOM_WX, instance.STEXT_BOTTOM_WY, rows.get(j), r2, first, next);
			instance.push(textBox);
			first = false;
			if(!TEST_SIMULATION) {
				if(timeout) {
					instance.waitB1OrTimeout(textBox);
				} else {
					instance.waitB1();
				}
				if(textBox.endTextDelay()) {
					if(timeout) {
						instance.waitB1OrTimeout(textBox);
					} else {
						instance.waitB1();
					}
				}
			}
			instance.pop();
			j++;
		}
	}
	
	public static void StextTimeout(String text) {
		Stext(text, true, false, true);
	}
	
	/* Default for opening a conversation */ 
	public static void Stext(String text) {
		Stext(text, true, false, false);
	}
	/* Use it to open a conversation that you know has other text */
	public static void StextFirst(String text) {
		Stext(text, true, true, false);
	}
	/* Use it on an ongoing conversation when you know has other text */
	public static void StextNext(String text) {
		Stext(text, false, true, false);
	}	
	/* Use it on an ongoing conversation and last stream of text */
	public static void StextLast(String text) {
		Stext(text, false, false, false);
	}

	public static void setMapOff() {
		if(current_map != null) {
			current_map.setRenderstring("R");
		}
	}	

}
