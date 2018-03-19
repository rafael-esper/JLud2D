package demos.ps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


import static core.Script.*;
import static core.MainEngine.die;
import static demos.ps.oo.PSGame.getString;

import java.awt.Color;
import java.util.HashMap;
import java.util.Map;

import demos.ps.oo.Dungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import core.GUI;
import core.Script;
import domain.Entity;
import domain.VImage;
import domain.VImage.FlipType;
import static demos.ps.oo.PSGame.BASE_FOLDER;

public class PSDungeon {

	private static final Logger log = LogManager.getLogger(PSDungeon.class);

	//private static final int VERTICAL_POSITION = 16;
	
	private static final int WALL = 0;
	private static final int FLOOR = 1;
	private static final int STAIRS_UP = 2;
	private static final int STAIRS_DOWN = 3;
	private static final int OPEN_DOOR = 4;
	private static final int DOOR = 5;
	private static final int LOCKED_DOOR = 6;
	private static final int MAGIC_DOOR = 7;
	private static final int OPEN_MAGIC_DOOR = 8;
	private static final int ROOM = 10;
	
	public enum DungeonType {
		FIRE	("/" + BASE_FOLDER + "/images/original/dungeon/Fire/"),
		GREY	("/" + BASE_FOLDER + "/images/original/dungeon/Grey/"),
		GREEN	("/" + BASE_FOLDER + "/images/original/dungeon/Green/"),
		YELLOW	("/" + BASE_FOLDER + "/images/original/dungeon/Yellow/"),
		BLUE	("/" + BASE_FOLDER + "/images/original/dungeon/Blue/"),
		ILLUSION("/" + BASE_FOLDER + "/images/original/dungeon/Illusion/"),
		COLOR	("/" + BASE_FOLDER + "/images/original/dungeon/Color/"),
		MOTA	("/" + BASE_FOLDER + "/images/original/dungeon/Mota/"),
		ORANGE	("/" + BASE_FOLDER + "/images/original/dungeon/Orange/"),
		EMERALD	("/" + BASE_FOLDER + "/images/original/dungeon/Emerald/"),
		DARK	("/" + BASE_FOLDER + "/images/original/dungeon/Dark/"),
		RUBY	("/" + BASE_FOLDER + "/images/original/dungeon/Ruby/"),
		COLD	("/" + BASE_FOLDER + "/images/original/dungeon/Cold/"),
		;
		
		String path;
		DungeonType(String path) {
			this.path = path;
		}
	}

	Map<Integer, GenericEnemy[]> enemyRandomArray;
	Map<Integer, GenericEnemy[]> enemyFixedArray;
	
	VImage backDungeon;
	Color backColor;
	int TOTAL_XSIZE, TOTAL_YSIZE;
	
	VImage img_dungeon_door, img_dungeon_ldoor, img_dungeon_doorAnim, img_dungeon_odoor;
	VImage img_dungeon_mdoor, img_dungeon_mdoorAnim, img_dungeon_modoor;
	
	VImage img_dungeon_wall1,  img_dungeon_wall2;
	VImage img_dungeon_room, img_dungeon_stup, img_dungeon_stdn;
	
	VImage img_dungeon_back[] = new VImage[7];
	
	VImage img_dungeon_curve[] = new VImage[4], img_dungeon_corner[] = new VImage[4], img_dungeon_curl[] = new VImage[7];
	VImage img_dungeon_walla[] = new VImage[6], img_dungeon_wallb[] = new VImage[6], img_dungeon_wallc[] = new VImage[3];
	VImage img_dungeon_enca[] = new VImage[6], img_dungeon_encb[] = new VImage[6], img_dungeon_encc[] = new VImage[6];
	VImage img_dungeon_enda[] = new VImage[6], img_dungeon_endb[] = new VImage[6], img_dungeon_endc[] = new VImage[6];
	VImage img_dungeon_doora[] = new VImage[6], img_dungeon_doorb[] = new VImage[6], img_dungeon_doorc[] = new VImage[6];
	VImage img_dungeon_lena[] = new VImage[6], img_dungeon_lenb[] = new VImage[6], img_dungeon_lenc[] = new VImage[6];
	
	
	private boolean showDungeon = true;
	private boolean walkingBack = false;
	
	private boolean isDark = true;
	private boolean openEffect = false;
	private boolean trapEffect = false;
	private boolean alreadyInside = false;
	private boolean zoneCheck = true;
	
	public void startDungeon() {
		
		Dungeon curDungeon = PSGame.getCurrentDungeon();

		PSMenu.instance.back = new VImage(screen.width, screen.height);
		PSMenu.instance.push(PSMenu.instance.createOneLabelBox(100, 100, PSGame.getString("Dungeon_Loading"), false));
		PSMenu.instance.waitDelay(2);
		
		log.info("Log: Dungeon init, timer: " + timer + "\t" + GUI.cycleTime);
		initDungeonImages(curDungeon.getType().path);
		log.info("Log: Dungeon end, timer: " + timer + "\t" + GUI.cycleTime);

		PSMenu.instance.pop();
		
		Entity e = setplayer(entityspawn(PSGame.getgotox(), PSGame.getgotoy(), PSGame.getParty().getMember(0).getCharPath()));
		e.setFace(curDungeon.getDir());

		cameratracking=1;
		screen.render();
		screen.fadeIn(5, false);
		
		int pos = 0;
		
		
		PSMenu.instance.back = new VImage(screen.getWidth(), screen.getHeight());
		backDungeon = new VImage(TOTAL_XSIZE, TOTAL_YSIZE);
		backColor = new java.awt.Color(img_dungeon_back[0].readPixel(img_dungeon_back[0].width-1, img_dungeon_back[0].height-1));

		if(getAlreadyInside()) {
			entities.get(player).setFace(PSGame.getDungeonFace());
			isDark = false;
		}
		else {
			isDark = curDungeon.isDark() && !PSGame.findItemWithParty(OriginalItem.Inventory_Light_Pendant, false);
			// IT'S PITCHY BLACK ROUTINE
			if(isDark) {
				PSMenu.startScene(Scene.BLACK, SpecialEntity.NONE);
				PSMenu.Stext(getString("Dungeon_Black"));
				PSMenu.menuOn();
			}
		}

		// Infinite loop until mapswitch is called
		while(!die) {
			setentitiespaused(true);
			
			// Show Dungeon
			if(showDungeon && !isDark) {
				drawDungeon(e, pos);
			} else {
				screen.paintBlack();
			}
			if(zoneCheck) {
				zoneCheck = false;
				callZone(e, 1);
				callZone(e, 0);
				
				// Check for battles
				if(getfronttile(e, 1) == FLOOR) {
					enemyBattle();
				}
			}
			
			// Dungeon Controls
			if(isDark && (up || left || right || down)) {
				int zone = getfrontzone(entities.get(player), -1);
				callfunction(current_map.getScriptZone(zone));
				break;
				//callfunction("exit");
			}
			
			if(!isDark && !getAlreadyInside()) {
				setAlreadyInside(true);
			}
			else if(b3 && PSGame.gameData.enableCheats) {
				showDungeon = !showDungeon;
				unpress(3);
			}

			else if(b1) {
				switch(e.getFace()) {
				case Entity.NORTH: open(e.getx(), e.gety()-16);break;
				case Entity.WEST: open(e.getx()-16, e.gety());break;
				case Entity.SOUTH: open(e.getx(), e.gety()+16);break;
				case Entity.EAST: open(e.getx()+16, e.gety());break;
				}
				unpress(9);				
			}
			
			else if(left || right) {
				turnRoutine(e, right);
				zoneCheck = true;
			}

			else if(up) {
				int tile = getfronttile(e, 1);
				if(showDungeon && tile == FLOOR) {
					for(int i=0;i<=5;i++) {
						drawDungeon(e, i);
						delayScreen();
					}
				}
				walkup(e, 1);
				walkingBack = false;
				if(!showDungeon)
					unpress(9);

				switch(tile) {
					case STAIRS_DOWN:
						PSGame.playSound(PS1Sound.STAIRS);
						PSGame.gameData.dungeonFloor--;
						callfunction(current_map.getScriptZone(current_map.getzone(e.getx()/16, e.gety()/16)));
						break;
						
					case STAIRS_UP:
						PSGame.playSound(PS1Sound.STAIRS);
						PSGame.gameData.dungeonFloor++;
						callfunction(current_map.getScriptZone(current_map.getzone(e.getx()/16, e.gety()/16)));
						break;
				}
				zoneCheck = true;
			}
			
			else if(down) {
				int tile = getfronttile(e, -1);
				if(tile == FLOOR) {
					walkup(e, -1);
				}
				else if(tile == WALL && getlefttile(e, 0) == FLOOR) {
					turnRoutine(e, true);
					tile = FLOOR;
					walkup(e, -1);
				} else if(tile == WALL && getrighttile(e, 0) == FLOOR) {
					turnRoutine(e, false);
					tile = FLOOR;
					walkup(e, -1);
				} else {
					delayScreen();
					log.info("Ouch.");
				}
				
				walkingBack = true;
				if(showDungeon && tile == FLOOR) {
					for(int i=5;i>=0;i--) {
						drawDungeon(e, i);
						delayScreen();
					}
				}				
				if(!showDungeon) {
					unpress(9);
				}
				zoneCheck = true;
			}
			
			if(!showDungeon && !isDark) {
				screen.render();
			}
			
			showpage();
		}
		PSMenu.instance.back = null;
		setentitiespaused(false);
	}
	
	private void turnRoutine(Entity e, boolean counter) {
		int fromTile = getfronttile(e,  1);
		e.setFace(nextDirection(e.getFace(), counter));
		int destTile = getfronttile(e,  1);
		
		if(showDungeon) {
			if(fromTile != FLOOR && destTile != FLOOR) {
				doAnimation(img_dungeon_curve, true, counter); 
			}
			else if(fromTile == FLOOR && destTile != FLOOR) {
				doAnimation(img_dungeon_curl, false, counter);
			}
			else if(fromTile != FLOOR && destTile == FLOOR) {
				doReverseAnimation(img_dungeon_curl, !counter);
			}				
			else if(fromTile == FLOOR && destTile == FLOOR) {
				doAnimation(img_dungeon_corner, true, !counter);
			}
		}
		else {
			unpress(9);
		}
	}

	private void callZone(Entity e, int distance) {
		int curTile = getfronttile(e, distance);
		if(distance > 0 && curTile != FLOOR) {
				return;
		}
		else if (distance == 0 && curTile == ROOM) {
			putimage(img_dungeon_room, 0, 0);
			drawImageToScreen();
		}
		int zone = getfrontzone(e, distance);

		// Adjacent zones with distance=1 and non-adjacent with distance=0
		if(zone != 0 && distance == current_map.getMethodZone(zone)) {
			callfunction(current_map.getScriptZone(zone));		
		}
	}

	private void drawDungeon(Entity e, int pos) {
		// JUST IN FRONT
		switch(getfronttile(e, 1)) {
			case WALL: putwallimage(img_dungeon_wall2);break;
			case DOOR: putwallimage(img_dungeon_door);break;
			case OPEN_DOOR: putwallimage(img_dungeon_odoor);break;
			case STAIRS_UP: putwallimage(img_dungeon_stup);break;
			case STAIRS_DOWN: putwallimage(img_dungeon_stdn);break;
			case MAGIC_DOOR: putwallimage(img_dungeon_mdoor);break;
			case OPEN_MAGIC_DOOR: putwallimage(img_dungeon_modoor);break;
			case LOCKED_DOOR: putwallimage(img_dungeon_ldoor);break;
			case FLOOR:

				// Finds floor front depth to nearest wall 
				int depth = 0;
				while(depth < 5 && getfronttile(e, 2 + depth++)==FLOOR);
				
				for(int flipped=0; flipped<=1; flipped++) { // one time for each side

					if(depth == 1) {
						int offset = pos < 3 ? putimage(img_dungeon_wallc[pos], flipped) : 0;
						if(getfronttile(e, 2) == WALL) {
							putimage(getsidetile(e, 1, flipped) == FLOOR ? img_dungeon_encc[pos] : img_dungeon_endc[pos], offset, flipped);
						}
						else {
							// TODO: For the future: scaled images of doors/stairs
							putimage(img_dungeon_doorc[pos], offset, flipped);	
						}
					}
					else if (depth == 2) {
						int offset = 0;
						if(getsidetile(e, 1, flipped) == FLOOR) {
							offset = pos < 3 ? putimage(img_dungeon_wallc[pos], flipped) : 0;
							offset = putimage(img_dungeon_lenc[pos], offset, flipped);
						}
						else {
							offset = putimage(img_dungeon_wallb[pos], flipped);
						}
						if(getsidetile(e, 2, flipped) == FLOOR) {
							putimage(img_dungeon_encb[pos], offset, flipped);
						}
						else {
							putimage(getfronttile(e, 3) == WALL ? img_dungeon_endb[pos] : img_dungeon_doorb[pos], offset, flipped);
						}
						
					}
					else {
						int offset = 0;
						if(getsidetile(e, 1, flipped) == FLOOR) {
							offset = putimage(img_dungeon_walla[pos], flipped);
							putimage(img_dungeon_lenc[pos], pos < 3 ? putimage(img_dungeon_wallc[pos], flipped) : 0, flipped);
						}
						else if(getsidetile(e, 2, flipped) == FLOOR) {
							offset = putimage(img_dungeon_wallb[pos], flipped);
							offset = putimage(img_dungeon_lenb[pos], offset, flipped);
						}
						else {
							offset = putimage(img_dungeon_walla[pos], flipped);
						}
						
						if(depth == 3) {
							if(getsidetile(e, 3, flipped) == FLOOR) {
								putimage(img_dungeon_enca[pos], offset, flipped);
							}
							else {
								putimage(getfronttile(e, 4) == WALL ? img_dungeon_enda[pos] : img_dungeon_doora[pos], offset, flipped);
							}	
						}
						else { // depth > 3
							if(getsidetile(e, 3, flipped) == FLOOR) {
								putimage(img_dungeon_lena[pos], offset, flipped);
							}
							else {
								putimage(img_dungeon_back[pos], offset, flipped);
							}								
						}
						
						
					}
				}
		}
	
		drawImageToScreen();
		//PSMenu.instance.back.getImage().scalesprite(0, 0, )
		//screen.scaleblit(0, 0, 320, 240, PSMenu.instance.back.getImage());
		
	}

	private void doAnimation(VImage[] vImages, boolean goBack, boolean flipped) {
		// Normal animation
		if(!goBack) {
			for(int i=0; i<vImages.length; i++) {
				putimage(vImages[i], flipped ? 1: 0);
				delayScreen();
			}
		}
		// Flip back algorithm
		else {
			for(int i=0; i<vImages.length-1; i++) {
				putimage(vImages[i], flipped ? 1: 0);
				delayScreen();
			}
			putimage(vImages[vImages.length-1], 0);
			putimage(vImages[vImages.length-1], 1);
			delayScreen();
			for(int i=vImages.length-2; i>=0; i--) {
				putimage(vImages[i], !flipped ? 1: 0);
				delayScreen();
			}			
		}
	}
	
	private void doReverseAnimation(VImage[] vImages, boolean flipped) {
		for(int i=vImages.length-1; i>=0; i--) {
			putimage(vImages[i], flipped ? 1: 0);
			delayScreen();
		}
	}

	private int putimage(VImage img, int offset, int flipped) {
		if(flipped == 0) {
			backDungeon.blit(offset, 0, img);
		}
		else {
			backDungeon.flipBlit(TOTAL_XSIZE - offset - img.width, 0, FlipType.FLIP_HORIZONTALLY, img);
		}
		return offset + img.width;
	}

	private int putimage(VImage img, int flipped) {
		return putimage(img, 0, flipped);
	}

	private void putwallimage(VImage img) {
		int offset = putimage(img_dungeon_wall1, 0, 0);
		offset = putimage(img, offset, 0);
		putimage(img, img_dungeon_wall1.width, 1);		
		putimage(img_dungeon_wall1, 0, 1);
	}	

	public static int gettile(int x, int y) {
		return current_map.gettile(x/16, y/16, 0) == 0? 0: current_map.gettile(x/16, y/16, 0) - 1;
	}
	
	private static int getfronttile(Entity e, int pos) {
		switch(e.getFace()) {
		case Entity.NORTH: return gettile(e.getx(), e.gety()-16*pos);
		case Entity.WEST: return gettile(e.getx()-16*pos, e.gety());
		case Entity.SOUTH: return gettile(e.getx(), e.gety()+16*pos);
		case Entity.EAST: return gettile(e.getx()+16*pos, e.gety());
		}
		return 0;
	}
	private static int getfrontzone(Entity e, int pos) {
		switch(e.getFace()) {
		case Entity.NORTH: return current_map.getzone(e.getx()/16, e.gety()/16-1*pos);
		case Entity.WEST: return current_map.getzone(e.getx()/16-1*pos, e.gety()/16);
		case Entity.SOUTH: return current_map.getzone(e.getx()/16, e.gety()/16+1*pos);
		case Entity.EAST: return current_map.getzone(e.getx()/16+1*pos, e.gety()/16);
		}
		return 0;
	}

	private static int getsidetile(Entity e, int distance, int flipped) {
		if(flipped == 1)
			return getrighttile(e, distance);
		
		return getlefttile(e, distance);
	}
	
	private static int getrighttile(Entity e, int pos) {
		switch(e.getFace()) {
		case Entity.NORTH: return gettile(e.getx()+16, e.gety()-16*pos);
		case Entity.WEST: return gettile(e.getx()-16*pos, e.gety()-16);
		case Entity.SOUTH: return gettile(e.getx()-16, e.gety()+16*pos);
		case Entity.EAST: return gettile(e.getx()+16*pos, e.gety()+16);
		}
		return 0;
	}
	private static int getlefttile(Entity e, int pos) {
		switch(e.getFace()) {
		case Entity.NORTH: return gettile(e.getx()-16, e.gety()-16*pos);
		case Entity.WEST: return gettile(e.getx()-16*pos, e.gety()+16);
		case Entity.SOUTH: return gettile(e.getx()+16, e.gety()+16*pos);
		case Entity.EAST: return gettile(e.getx()+16*pos, e.gety()-16);
		}
		return 0;
	}
	
	private void walkup(Entity e, int i) {
		int inc = 16 * i;
		switch(e.getFace()) {
			case Entity.NORTH: walkTo(e, e.getx(), e.gety()-inc, i < 0);break;
			case Entity.WEST: walkTo(e, e.getx()-inc, e.gety(), i < 0);break;
			case Entity.SOUTH:  walkTo(e, e.getx(), e.gety()+inc, i < 0);break;
			case Entity.EAST: walkTo(e, e.getx()+inc, e.gety(), i < 0);break;
		}
	}

	private void walkTo(Entity e, int xpos, int ypos, boolean walkbackwards) {
		if(gettile(xpos, ypos) != WALL) {
			
			// Can't traverse stairs or doors when walking backwards
			if(walkbackwards && gettile(xpos, ypos) != FLOOR)
				return;
			// Can't traverse an locked door
			if(gettile(xpos, ypos) > 4 && gettile(xpos, ypos) < 8)
				return;			
			
			e.setxy(xpos,  ypos);
			
			// If it's over an open door, advance one tile
			if(gettile(e.getx(), e.gety()) == OPEN_DOOR || 
				gettile(e.getx(), e.gety()) == OPEN_MAGIC_DOOR ) {
				if(showDungeon) {
					screen.fadeOut(25, false);
				}
				walkup(e, 1);
				
				// And after if the current tile is a stairs up/down, call its zone (EXIT) or room
				switch(gettile(e.getx(), e.gety())) {
					case STAIRS_UP:
					case STAIRS_DOWN:
					case ROOM:
						callZone(e, 0);
						break;
				}
			}
			
			
		}
	}
	
	private void open(int xpos, int ypos) {
		int tile = gettile(xpos, ypos);
		switch(tile) {
			case DOOR:
			case LOCKED_DOOR:
				if(tile==LOCKED_DOOR && !PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Dungeon_Key))) {
					PSMenu.Stext(PSGame.getString("Dungeon_Locked_Door"));
					break;
				}
				
				current_map.settile(xpos/16, ypos/16, 0, OPEN_DOOR);	
				if(showDungeon) {
					PSGame.playSound(PS1Sound.DOOR);
					putwallimage(img_dungeon_doorAnim);
					delayScreen();
				}
				break;
				
			case MAGIC_DOOR:
				if(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Miracle_Key)) && !openEffect) {
					PSMenu.Stext(PSGame.getString("Dungeon_Magic_Door"));
					break;
				}
				
				openEffect = false;
				current_map.settile(xpos/16, ypos/16, 0, OPEN_MAGIC_DOOR);
				if(showDungeon) {
					PSGame.playSound(PS1Sound.DOOR);
					putwallimage(img_dungeon_mdoorAnim);
					delayScreen();
				}
				break;
			default:
		}
		
	}

	private static int[] directions = new int[]{Entity.NORTH, Entity.EAST, Entity.SOUTH, Entity.WEST};
	private int nextDirection (int from, boolean clockwise) {
		int pos = 0;
		while(directions[pos]!=from)
			pos++;
		if(clockwise) {
			return directions[(pos+1)%4];
		} else {
			return directions[(pos+3)%4];
		}
	}

	public void delayScreen()	{
		timer = 0;
		while (timer<PSGame.getDungeonDelay()) {
			//screen.render();
			drawImageToScreen();
			showpage();
		}
	}

	void drawImageToScreen() {
		if(PSMenu.instance.back == null) {
			return;
		}
		PSMenu.instance.back.rectfill(0, 0, 320, 240, backColor);
		PSMenu.instance.back.scaleblit(0, 16, 320, 208, backDungeon);

		screen.blit(0, 0, PSMenu.instance.back.getImage());
		//screen.rectfill(0, 0, 320, 31, screen.readpixel(319, 207));
	}

	public static void warpBack(int shift) {
		Entity e = entities.get(player); 
		switch(e.getFace()) {
			case Entity.NORTH: e.incy(shift*16);break;
			case Entity.WEST: e.incx(shift*16);break;
			case Entity.SOUTH: e.incy(-shift*16);break;
			case Entity.EAST: e.incx(-shift*16);break;
		}		
	}
	
	public void turnBack() {
		if(!walkingBack) {
			Script.down = true;
		} else {
			Script.up = true;
		}
		
	}
	
	public void setLight() {
		isDark = false;
	}
	public void setOpen() {
		openEffect = true;
	}		

	public boolean deadEnd() {
		Entity e = entities.get(player);
		if(getfronttile(e, -1) != FLOOR
			&& getlefttile(e, 0) != FLOOR
			&& getrighttile(e, 0) != FLOOR) {
			return true;
		}
		return false;
	}

	public boolean getAlreadyInside() {
		return alreadyInside;
	}
	
	public void setAlreadyInside(boolean al) {
		this.alreadyInside = al;
	}

	public void setZoneCheck() {
		this.zoneCheck = true;
	}

	public boolean getTrapEffect() {
		return this.trapEffect;
	}

	public void setTrapEffect(boolean b) {
		this.trapEffect = b;
	}

	public boolean checkTrapEffect() {
		int zone = getfrontzone(entities.get(player), 1);
		trapEffect = true;
		if(current_map.getScriptZone(zone).startsWith("trap")) {
			callfunction(current_map.getScriptZone(zone));
			if(trapEffect == false) {
				return true;
			}
		}
			
		trapEffect = false;
		return false;
	}
	
	
	public void initDungeonImages(String dungeonPath) {
		img_dungeon_door = new VImage(load(dungeonPath + "DOOR1.PNG"));
		img_dungeon_ldoor = new VImage(load(dungeonPath + "DOOR2.PNG"));
		img_dungeon_doorAnim = new VImage(load(dungeonPath + "DOOR3.PNG"));
		img_dungeon_odoor = new VImage(load(dungeonPath + "DOOR4.PNG")); 
		img_dungeon_mdoor = new VImage(load(dungeonPath + "DOOR5.PNG"));
		img_dungeon_mdoorAnim = new VImage(load(dungeonPath + "DOOR6.PNG"));
		img_dungeon_modoor = new VImage(load(dungeonPath + "DOOR7.PNG"));
		
		img_dungeon_wall1 = new VImage(load(dungeonPath + "WALL1.PNG"));
		img_dungeon_wall2 = new VImage(load(dungeonPath + "WALL2.PNG"));
		img_dungeon_room = new VImage(load(dungeonPath + "ROOM.PNG"));
		
		// Hack to fix Room image
		/*try {
			VImage saidaImage = new VImage(640, 416);
			saidaImage.blit(0, 0, img_dungeon_room);
			saidaImage.flipblit(320, 0, FlipType.FLIP_HORIZONTALLY, img_dungeon_room);
			saidaImage.tgrabregion(82, 0, 320, 322, 320, 0, Color.MAGENTA, img_dungeon_room);
			while(!b1) {
				screen.scaleblit(0,0,320,208,saidaImage);
				showpage();
			}
			ImageIO.write(saidaImage.getImage(), "png", new java.io.File("C:\\javaref\\workspace\\Phantasy\\src\\" + dungeonPath + "ROOM2.PNG"));
		} catch(Exception e) {
			log.error(e);
		}*/
		
		img_dungeon_stup = new VImage(load(dungeonPath + "STAIRSUP.PNG"));
		img_dungeon_stdn = new VImage(load(dungeonPath + "STAIRSDN.PNG"));
		
		for(int i=0; i<4; i++) {
			img_dungeon_curve[i] = new VImage(load(dungeonPath + "CURVE" + (i+1) + ".PNG"));
			img_dungeon_corner[i] = new VImage(load(dungeonPath + "CORNER" + (i+1) + ".PNG"));
		}

		for(int i=0; i<7; i++) {
			img_dungeon_curl[i] = new VImage(load(dungeonPath + "CURL" + (i+1) + ".PNG"));
		}
		for(int i=0; i<6; i++) {
			img_dungeon_back[i] = new VImage(load(dungeonPath + "BACK" + (i+1) + ".PNG"));
			
			img_dungeon_walla[i] = new VImage(load(dungeonPath + "WALLA" + (i+1) + ".PNG"));
			img_dungeon_wallb[i] = new VImage(load(dungeonPath + "WALLB" + (i+1) + ".PNG"));
			if(i<3)
				img_dungeon_wallc[i] = new VImage(load(dungeonPath + "WALLC" + (i+1) + ".PNG"));

			img_dungeon_enca[i] = new VImage(load(dungeonPath + "ENCA" + (i+1) + ".PNG"));
			img_dungeon_encb[i] = new VImage(load(dungeonPath + "ENCB" + (i+1) + ".PNG"));
			img_dungeon_encc[i] = new VImage(load(dungeonPath + "ENCC" + (i+1) + ".PNG"));
			
			img_dungeon_enda[i] = new VImage(load(dungeonPath + "ENDA" + (i+1) + ".PNG"));
			img_dungeon_endb[i] = new VImage(load(dungeonPath + "ENDB" + (i+1) + ".PNG"));
			img_dungeon_endc[i] = new VImage(load(dungeonPath + "ENDC" + (i+1) + ".PNG"));

			img_dungeon_doora[i] = new VImage(load(dungeonPath + "DOORA" + (i+1) + ".PNG"));
			img_dungeon_doorb[i] = new VImage(load(dungeonPath + "DOORB" + (i+1) + ".PNG"));
			img_dungeon_doorc[i] = new VImage(load(dungeonPath + "DOORC" + (i+1) + ".PNG"));

			img_dungeon_lena[i] = new VImage(load(dungeonPath + "LENA" + (i+1) + ".PNG"));
			img_dungeon_lenb[i] = new VImage(load(dungeonPath + "LENB" + (i+1) + ".PNG"));
			img_dungeon_lenc[i] = new VImage(load(dungeonPath + "LENC" + (i+1) + ".PNG"));			
		}
		
		TOTAL_XSIZE = img_dungeon_room.width;
		TOTAL_YSIZE = img_dungeon_room.height;
	}

	public void setRandomEnemies(int floor, GenericEnemy[] enemies) {
		if(enemyRandomArray == null) {
			enemyRandomArray = new HashMap<Integer, GenericEnemy[]>();
		}
		enemyRandomArray.put(floor, enemies);
	}

	public void setFixedEnemies(int floor, GenericEnemy[] enemies) {
		if(enemyFixedArray == null) {
			enemyFixedArray = new HashMap<Integer, GenericEnemy[]>();
		}
		enemyFixedArray.put(floor, enemies);
	}	
	
	private void enemyBattle() {
		// TODO Make it dependable of difficulty

		int chance = random(0, 255);
		// Small chance of fixed battle (more than one enemy)
		if(chance < 4) {
			if(enemyFixedArray == null || enemyFixedArray.isEmpty()) {
				return;
			}
			GenericEnemy[] psEnemies = enemyFixedArray.get(PSGame.gameData.dungeonFloor);
			if(psEnemies != null) {
				PSGame.fixedBattle(Scene.CORRIDOR, psEnemies);
			}			
		// Greater chance of random battle (one enemy) 
		} else if (chance < 20) {
			if(enemyRandomArray == null || enemyRandomArray.isEmpty()) {
				return;
			}
			GenericEnemy[] psEnemies = enemyRandomArray.get(PSGame.gameData.dungeonFloor);
			if(psEnemies != null) {
				PSGame.randomBattle(Scene.CORRIDOR, psEnemies);
			}			
		}
	}
	
}
