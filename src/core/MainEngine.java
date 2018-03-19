package core;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Controls.*;
import static core.Script.*;
import static domain.Entity.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import domain.*;

public class MainEngine extends Thread {

	private static final Logger log = LogManager.getLogger(MainEngine.class);

	public static boolean done, inscroller = false;
	public static int px, py;

	public static int lastentitythink;
	public static int lastspritethink = 0;

	public static boolean die;

	static GUI gui;

	public static GUI getGUI() {
		return gui;
	}

	/****************************** data ******************************/

	// Rafael: new code
	protected static Config config = null;
	public static Class<?> systemclass;

	protected static String mapname;

	/****************************** code ******************************/

	// main engine code

	static int AllocateEntity(int x, int y, String chr) {
		Entity e = new EntityImpl(x, y, chr);
		e.setIndex(numentities);
		entities.add(e);
		return numentities++;
	}

	protected static class EntityComparator implements Comparator<Entity> {
		public int compare(Entity ent1, Entity ent2) {
			return ent1.gety() - ent2.gety();
		}
	}

	public static void RenderEntities(VImage dest) {
		List<Entity> entidx = new ArrayList<Entity>();
		int entnum = 0;

		// Build a list of entities that are visible.
		// FIXME: Make it actually only be entities that are onscreen
		for (int i = 0; i < numentities; i++) {
			entidx.add(entities.get(i));
			entnum++;
		}

		// Ysort that list, then draw.
		Collections.sort(entidx, new EntityComparator());
		// qsort(entidx, entnum, 1, cmpent);
		for (int i = 0; i < entnum; i++) {
			setlucent(entidx.get(i).getLucent());
			entidx.get(i).draw(dest);
			setlucent(0);
		}
	}

	static void ProcessEntities() {
		if (entitiespaused)
			return;
		for (int i = 0; i < numentities; i++) {
			entities.get(i).think();
		}
	}

	static int EntityAt(int x, int y) {
		for (int i = 0; i < numentities; i++) {
			if (entities.get(i).isActive()
					&& x >= entities.get(i).getx()
					&& x < entities.get(i).getx()
							+ entities.get(i).getChr().getHw()
					&& y >= entities.get(i).gety()
					&& y < entities.get(i).gety()
							+ entities.get(i).getChr().getHh())
				return i;
		}
		return -1;
	}

	static int EntityObsAt(int x, int y) {
		for (int i = 0; i < numentities; i++) {
			if (entities.get(i).isActive()
					&& entities.get(i).isObstruction()
					&& x >= entities.get(i).getx()
					&& x < entities.get(i).getx()
							+ entities.get(i).getChr().getHw()
					&& y >= entities.get(i).gety()
					&& y < entities.get(i).gety()
							+ entities.get(i).getChr().getHh())
				return i;
		}
		return -1;
	}

	static boolean isEntityCollisionCapturing() {
		return !_trigger_onEntityCollide.isEmpty();
	}

	int __obstructionHappened = 0;

	public static boolean ObstructAt(int x, int y) {
		if (current_map.getobspixel(x, y)) {

			if (isEntityCollisionCapturing()) {
				event_tx = x / 16;
				event_ty = y / 16;
				event_entity = actor_index;
				event_zone = current_map.getzone(x / 16, y / 16);
				event_entity_hit = -1;
				onEntityCollision();
			}

			return true;
		}

		int ent_idx = EntityObsAt(x, y);

		if (ent_idx > -1) {

			if (isEntityCollisionCapturing()) {
				event_tx = x / 16;
				event_ty = y / 16;
				event_entity = actor_index;
				event_zone = -1;
				event_entity_hit = ent_idx;
				onEntityCollision();
			}

			return true;
		}

		return false;
	}

	// returns distance possible to move up to
	// the first obstruction in the given direction
	static int MaxPlayerMove(int d, int max) {
		actor_index = myself.getIndex();

		int x, y;
		int ex = myself.getx();
		int ey = myself.gety();

		// check to see if the player is obstructable at all
		if (!myself.isObstructable())
			return max;

		for (int check = 1; check <= max + 1; check++) {
			switch (d) {
			case NORTH:
				for (x = ex; x < ex + myself.getChr().getHw(); x++)
					if (ObstructAt(x, ey - check))
						return check - 1;
				break;
			case SOUTH:
				for (x = ex; x < ex + myself.getChr().getHw(); x++)
					if (ObstructAt(x, ey + myself.getChr().getHh() + check - 1))
						return check - 1;
				break;
			case WEST:
				for (y = ey; y < ey + myself.getChr().getHh(); y++)
					if (ObstructAt(ex - check, y))
						return check - 1;
				break;
			case EAST:
				for (y = ey; y < ey + myself.getChr().getHh(); y++)
					if (ObstructAt(ex + myself.getChr().getHw() + check - 1, y))
						return check - 1;
				break;
			case NW:
				for (x = ex; x < ex + myself.getChr().getHw(); x++)
					if (ObstructAt(x - check, ey - check))
						return check - 1;
				for (y = ey; y < ey + myself.getChr().getHh(); y++)
					if (ObstructAt(ex - check, y - check))
						return check - 1;
				break;
			case SW:
				for (x = ex; x < ex + myself.getChr().getHw(); x++)
					if (ObstructAt(x - check, ey + myself.getChr().getHh()
							+ check - 1))
						return check - 1;
				for (y = ey; y < ey + myself.getChr().getHh(); y++)
					if (ObstructAt(ex - check, y + check))
						return check - 1;
				break;
			case NE:
				for (x = ex; x < ex + myself.getChr().getHw(); x++)
					if (ObstructAt(x + check, ey - check))
						return check - 1;
				for (y = ey; y < ey + myself.getChr().getHh(); y++)
					if (ObstructAt(ex + myself.getChr().getHw() + check - 1, y
							- check))
						return check - 1;
				break;
			case SE:
				for (x = ex; x < ex + myself.getChr().getHh(); x++)
					if (ObstructAt(x + check, ey + myself.getChr().getHh()
							+ check - 1))
						return check - 1;
				for (y = ey; y < ey + myself.getChr().getHh(); y++)
					if (ObstructAt(ex + myself.getChr().getHw() + check - 1, y
							+ check))
						return check - 1;
				break;
			}
		}
		return max;
	}

	static void onStep() {
		if (!_trigger_onStep.isEmpty()) {
			Script.callfunction(_trigger_onStep);
		}
	}

	static void afterStep() {
		if (!_trigger_afterStep.isEmpty()) {
			Script.callfunction(_trigger_afterStep);
		}
	}

	static void afterPlayerMove() {
		if (!_trigger_afterPlayerMove.isEmpty()) {
			Script.callfunction(_trigger_afterPlayerMove);
		}
	}

	static void beforeEntityActivation() {
		if (!_trigger_beforeEntityScript.isEmpty()) {
			Script.callfunction(_trigger_beforeEntityScript);
		}
	}

	static void afterEntityActivation() {
		if (!_trigger_afterEntityScript.isEmpty()) {
			Script.callfunction(_trigger_afterEntityScript);
		}
	}

	static void onEntityCollision() {
		if (isEntityCollisionCapturing()) {
			Script.callfunction(_trigger_onEntityCollide);
		}
	}

	public static void ProcessControls() {
		Controls.UpdateControls();
		// No player movement can be done if there's no ready player, or if
		// there's a script active.
		if (myself == null || !myself.ready() || invc != 0) {
			return;
		}

		if (myself.getMovecode() == 3) {
			// ScriptEngine::
			playerentitymovecleanup();
		}

		// kill contradictory input
		if (up && down)
			up = down = false;
		if (left && right)
			left = right = false;

		// if we're not supposed to be using diagonals,
		// prevent that, too.
		// We keep track of the last direction we moved in
		// and if we have diagonal input, we move along the same
		// axis of movement as before the conflict (horiz or vert.)
		// - Jesse 22-10-05
		if (!playerdiagonals) {
			if ((up || down) && (left || right) && !smoothdiagonals) {
				if (lastplayerdir == WEST || lastplayerdir == EAST)
					up = down = false;
				else
					left = right = false;
			} else {
				if (left) {
					lastplayerdir = WEST;
				} else if (right) {
					lastplayerdir = EAST;
				} else if (up) {
					lastplayerdir = NORTH;
				} else if (down) {
					lastplayerdir = SOUTH;
				} else {
					lastplayerdir = 0;
				}
			}
		}

		// check diagonals first
		if (left && up) {
			myself.setFace(WEST);
			int dist = MaxPlayerMove(NW, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(-1 * dist, -1 * dist, true);
				return;
			}
		}
		if (right && up) {
			myself.setFace(EAST);
			int dist = MaxPlayerMove(NE, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(dist, -1 * dist, true);
				return;
			}
		}
		if (left && down) {
			myself.setFace(WEST);
			int dist = MaxPlayerMove(SW, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(-1 * dist, dist, true);
				return;
			}
		}
		if (right && down) {
			myself.setFace(EAST);
			int dist = MaxPlayerMove(SE, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(dist, dist, true);
				return;
			}
		}

		// check four cardinal directions last
		if (up) {
			myself.setFace(NORTH);
			int dist = MaxPlayerMove(NORTH, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(0, -1 * dist, true);
				return;
			}

			if (playerdiagonals) {
				// check for sliding along walls if we permit diagonals
				dist = MaxPlayerMove(NW, playerstep);
				if (dist != 0) {
					myself.setFace(WEST);
					myself.set_waypoint_relative(-1 * dist, -1 * dist, true);
					return;
				}

				dist = MaxPlayerMove(NE, playerstep);
				if (dist != 0) {
					myself.setFace(EAST);
					myself.set_waypoint_relative(dist, -1 * dist, true);
					return;
				}
			}
		}
		if (down) {
			myself.setFace(SOUTH);
			int dist = MaxPlayerMove(SOUTH, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(0, dist, true);
				return;
			}

			if (playerdiagonals) {
				// check for sliding along walls if we permit diagonals
				dist = MaxPlayerMove(SW, playerstep);
				if (dist != 0) {
					myself.setFace(WEST);
					myself.set_waypoint_relative(-1 * dist, 1 * dist, true);
					return;
				}

				dist = MaxPlayerMove(SE, playerstep);
				if (dist != 0) {
					myself.setFace(EAST);
					myself.set_waypoint_relative(dist, dist, true);
					return;
				}
			}
		}
		if (left) {
			myself.setFace(WEST);
			int dist = MaxPlayerMove(WEST, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(-1 * dist, 0, true);
				return;
			}

			if (playerdiagonals) {
				// check for sliding along walls if we permit diagonals
				dist = MaxPlayerMove(NW, playerstep);
				if (dist != 0) {
					myself.setFace(WEST);
					myself.set_waypoint_relative(-1 * dist, -1 * dist, true);
					return;
				}

				dist = MaxPlayerMove(SW, playerstep);
				if (dist != 0) {
					myself.setFace(WEST);
					myself.set_waypoint_relative(-1 * dist, 1 * dist, true);
					return;
				}
			}
		}
		if (right) {
			myself.setFace(EAST);
			int dist = MaxPlayerMove(EAST, playerstep);
			if (dist != 0) {
				myself.set_waypoint_relative(dist, 0, true);
				return;
			}

			if (playerdiagonals) {
				// check for sliding along walls if we permit diagonals
				dist = MaxPlayerMove(NE, playerstep);
				if (dist != 0) {
					myself.setFace(EAST);
					myself.set_waypoint_relative(dist, -1 * dist, true);
					return;
				}

				dist = MaxPlayerMove(SE, playerstep);
				if (dist != 0) {
					myself.setFace(EAST);
					myself.set_waypoint_relative(dist, dist, true);
					return;
				}
			}
		}

		// Check for entity/zone activation
		if (b1) {
			int ex = 0, ey = 0;
			UnB1();
			switch (myself.getFace()) // face
			{
			case NORTH:
				ex = myself.getx() + (myself.getChr().getHw() / 2);
				ey = myself.gety() - 1;
				break;
			case SOUTH:
				ex = myself.getx() + (myself.getChr().getHw() / 2);
				ey = myself.gety() + myself.getChr().getHh() + 1;
				break;
			case WEST:
				ex = myself.getx() - 1;
				ey = myself.gety() + (myself.getChr().getHh() / 2);
				break;
			case EAST:
				ex = myself.getx() + myself.getChr().getHw() + 1;
				ey = myself.gety() + (myself.getChr().getHh() / 2);
				break;
			}

			int i = EntityAt(ex, ey);
			if (i != -1) { // FIXME && entity.get(i).movescript.length() > 0) {
				if (entities.get(i).isAutoface()) { // FIXME &&
													// entity.get(i).ready()) {
					switch (myself.getFace()) // face
					{
					case NORTH:
						entities.get(i).setFace(SOUTH);
						break;
					case SOUTH:
						entities.get(i).setFace(NORTH);
						break;
					case WEST:
						entities.get(i).setFace(EAST);
						break;
					case EAST:
						entities.get(i).setFace(WEST);
						break;
					default:
						System.err
								.println("ProcessControls() - uwahh? invalid myself.face parameter");
					}
				}

				event_tx = entities.get(i).getx() / 16;
				event_ty = entities.get(i).gety() / 16;
				event_entity = i;
				int cur_timer = timer;
				beforeEntityActivation();
				Script.callfunction(entities.get(i).getActivationEvent());
				entities.get(i).clear_waypoints(); // Rafael
				afterEntityActivation();
				timer = cur_timer;
				return;
			}

			int cz = current_map.getzone(ex / 16, ey / 16);
			if (cz > 0 && current_map.getScriptZone(cz).length() > 0
					&& current_map.getMethodZone(cz) > 0) {
				int cur_timer = timer;

				event_zone = cz;
				event_tx = ex / 16;
				event_ty = ey / 16;
				event_entity = i;

				Script.callfunction(current_map.getScriptZone(cz));
				timer = cur_timer;
			}
		}
	}

	static void MapScroller(VImage dest) {
		inscroller = true;
		int oldx = xwin;
		int oldy = ywin;
		int oldtimer = timer;
		int oldcamera = cameratracking;
		cameratracking = 0;
		clearLastKey(); // lastpressed = 0;

		while (getLastKeyChar() != 41) {
			if (getKey(KeyUp))
				ywin--;
			if (getKey(KeyDown))
				ywin++;
			if (getKey(KeyLeft))
				xwin--;
			if (getKey(KeyRight))
				xwin++;
			Controls.UpdateControls();
			RenderMap(dest);
			showpage();
		}

		clearLastKey(); // lastpressed = 0;
		clearKey(41); // keys[41] = 0;
		cameratracking = oldcamera;
		timer = oldtimer;
		ywin = oldy;
		xwin = oldx;
		inscroller = false;
	}

	private static void complyToLimits(VImage dest, int mapRight, int mapDown) {

		if (!current_map.getHorizontalWrappable()) { // Rafael: new code
			if (xwin + dest.width >= mapRight)
				xwin = mapRight - dest.width;
			if (xwin < 0)
				xwin = 0;
		}
		if (!current_map.getVerticalWrappable()) { // Rafael: new code
			if (ywin + dest.height >= mapDown)
				ywin = mapDown - dest.height;
			if (ywin < 0)
				ywin = 0;
		}
	}

	public static final int CAMERA_STATIC = 0;
	public static final int CAMERA_PLAYER = 1;
	public static final int CAMERA_ENTITY = 2;
	public static final int CAMERA_TRANSITION = 3;

	public static void RenderMap(VImage dest) {
		if (current_map == null) {
			return;
		}
		if (!inscroller && getLastKeyChar() == 41)
			MapScroller(dest);

		int rmap = (current_map.getWidth() * 16);
		int dmap = (current_map.getHeight() * 16);

		switch (cameratracking) {
		case CAMERA_STATIC:
			complyToLimits(dest, rmap, dmap);
			break;
		case CAMERA_PLAYER:
			if (myself != null) {
				xwin = (myself.getx() + myself.getChr().getHw() / 2)
						- (dest.width / 2) - 8;
				ywin = (myself.gety() + myself.getChr().getHh() / 2)
						- (dest.height / 2) - 24;
			} else {
				xwin = 0;
				ywin = 0;
			}
			complyToLimits(dest, rmap, dmap);
			break;
		case CAMERA_ENTITY:
			if (cameratracker >= numentities || cameratracker < 0) {
				xwin = 0;
				ywin = 0;
			} else {
				xwin = (entities.get(cameratracker).getx() + 8)
						- (dest.width / 2);
				ywin = (entities.get(cameratracker).gety() + 8)
						- (dest.height / 2);
			}
			complyToLimits(dest, rmap, dmap);
			break;

		case CAMERA_TRANSITION: // Rafael: New camera tracking mode = scrolling
								// transition (Zelda-like)

			if (myself != null) {

				if (myself.getx() - xwin <= -8) { // scroll left
					setentitiespaused(true);
					myself.setx((myself.getx() / 16) * 16);
					xwin = (xwin / dest.width) * dest.width - 4;
					while (xwin % dest.width != 0) {
						xwin -= 4;
						current_map.render(xwin, ywin, dest);
						showpage();
					}
					setentitiespaused(false);
				}
				if (myself.getx() - xwin >= dest.width) { // scroll right
					setentitiespaused(true);
					xwin = (xwin / dest.width) * dest.width + 4;
					while (xwin % dest.width != 0) {
						xwin += 4;
						current_map.render(xwin, ywin, dest);
						showpage();
					}
					setentitiespaused(false);
				}
				if (myself.gety() - ywin <= -8) { // scroll up
					setentitiespaused(true);
					myself.sety((myself.gety() / 16) * 16);
					ywin = (ywin / dest.height) * dest.height - 4;
					while (ywin % dest.height != 0) {
						ywin -= 4;
						current_map.render(xwin, ywin, dest);
						showpage();
					}
					setentitiespaused(false);
				}
				if (myself.gety() - ywin >= dest.height) { // scroll down
					setentitiespaused(true);
					ywin = (ywin / dest.height) * dest.height + 4;
					while (ywin % dest.height != 0) {
						ywin += 4;
						current_map.render(xwin, ywin, dest);
						showpage();
					}
					setentitiespaused(false);
				}
			} else {
				xwin = 0;
				ywin = 0;
			}

			complyToLimits(dest, rmap, dmap);
			break;

		}

		// Doesn't work if systemtime is not updated! // RBP Map rendering skip
		// to accelerate drawing
		// if(framecount>=2) {
		current_map.render(xwin, ywin, dest);
		// framecount=0;
		// }
		// framecount++;

	}

	// static int framecount = 0;

	static void CheckZone() {
		int cur_timer = timer;
		int cz = current_map.getzone(px, py);
		// the following line is probably now correct, since .percent is in
		// [0,255]
		// and so the max rnd() will produce is 254, which will still always
		// trigger
		// if .percent is 255, and the lowest is 0, which will never trigger,
		// even if
		// .percent is 0
		int rnd = (int) (255 * Math.random());
		if (rnd < current_map.getPercentZone(cz)) {
			event_zone = cz;
			Script.callfunction(current_map.getScriptZone(cz));
		}
		timer = cur_timer;
	}

	public static void TimedProcessEntities() {
		if (entitiespaused)
			return;

		while (lastentitythink < systemtime) {
			if (done)
				break;
			if (myself != null) {
				px = (myself.getx() + (myself.getChr().getHw() / 2)) / 16;
				py = (myself.gety() + (myself.getChr().getHh() / 2)) / 16;
			}
			ProcessEntities();
			if (invc == 0)
				ProcessControls();
			if (myself != null && invc == 0) {

				if ((px != (myself.getx() + (myself.getChr().getHw() / 2)) / 16)
						|| (py != (myself.gety() + (myself.getChr().getHh() / 2)) / 16)) {
					px = (myself.getx() + (myself.getChr().getHw() / 2)) / 16;
					py = (myself.gety() + (myself.getChr().getHh() / 2)) / 16;

					event_tx = px;
					event_ty = py;

					onStep();
					CheckZone();
					afterStep();
				}
			}
			lastentitythink++;
		}
	}

	public void run() {

		callfunction("autoexec");

		while (mapname != null && !mapname.isEmpty()) {
			log.info("Entering: " + mapname);
			engine_start();

			// Game Loop
			while (!done) {
				updateControls();
				// TimedProcessEntities();
				while (!die) {
					updateControls();

					screen.render();

					if (!die) // redundant?
						showpage();
				}
			}
		}

	}

	public static void engine_start() {
		numentities = 0;
		entities.clear();
		player = -1;
		myself = null;
		xwin = ywin = 0;
		done = false;
		die = false;
		// Fix .map to .json
		if (mapname.toLowerCase().endsWith(".map")) {
			log.warn("Warning: .map file instead of expected JSON: " + mapname);
			mapname = mapname.replace(".map", ".map.json")
					.replace(".Map", ".map.json").replace(".MAP", ".map.json");
		}

		current_map = MapTiledJSON.loadMap(mapname);
		current_map.startMap(); // Rafael

		// CleanupCHRs();
		timer = 0;

		lastentitythink = systemtime;
		lastspritethink = systemtime;

	}

	static int timeIncrement = 1;

	protected static void DefaultTimer() {

		systemtime += timeIncrement;
		// if (engine_paused) // Rafael: Used only in debug
		// return;
		timer += timeIncrement;
		hooktimer += timeIncrement;
	}

	public static void setTimeIncrement(int i) { // Used to speed up some game
		timeIncrement = i;
	}

	// RBP Avoid FPS getting higher than needed, after spending lot of time
	// loading
	public static void syncAfterLoading() {
		GUI.cycleTime = System.currentTimeMillis();
	}

	public static void initMainEngine(String[] args) {

		if (args != null && args.length != 0) {
			mapname = args[0];
		}

		// Config (startup)
		config = Config.loadConfig(load(Config.CONFIG_FILENAME));

		// If the program is called without a particular map to execute, run
		// the default mapname specified in the Config file
		if (mapname == null || mapname.isEmpty()) {
			mapname = config.getMapName();
			log.info("Mapname from config file: " + mapname);
		}

		// [Rafael]: See
		// http://www.cap-lore.com/code/java/JavaPixels.html
		// config.v3_xres = config.v3_xres * 2;
		// config.v3_yres = config.v3_yres * 2;

		screen = new VImage(config.getxRes(), config.getyRes());

		// Unused: useful for frameskipping
		// finalScreen = new VImage(config.getV3_xres(), config.getV3_yres());

		if (config.getWindowMode()) {
			gui = new GUI(config.getxRes(), config.getyRes());
		} else {
			gui = new GUI(0, 0);
		}

		getGUI().updateCanvasSize();
	}

}