package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;
import static core.MainEngine.ObstructAt;
import static core.MainEngine.ProcessControls;

import com.fasterxml.jackson.annotation.JsonIgnore;

import core.Script;

// Merge of g_entity.cpp and g_entity.h
public class EntityImpl implements Entity {

	static final Logger log = LogManager.getLogger(EntityProperties.class);

	// Loaded inside the map 
	
	@JsonIgnore
	private CHR chr; 
	
	private int x, y; // Unsigned short
	private int id;
	private String name;

	private EntityProperties properties = new EntityProperties();

	public class EntityProperties {

		// TILED Custom Properties
		Boolean autoface = true;
		Integer face;
		String activationEvent;
		String chrname = ""; // filename
		Boolean obstruction = true;
		Boolean obstructable = true;
		Integer speed;
		Integer movecode;
		Integer wanderDelay;
		Integer wx1;
		Integer wy1;
		Integer wx2;
		Integer wy2;	
	}	
	
	private Boolean visible = true;

	@JsonIgnore
	private boolean active = true;
	
	@JsonIgnore
	private int lucent;
	
	@JsonIgnore
	private int waypointx, waypointy;
	
	@JsonIgnore
	private int speedct;
	
	@JsonIgnore
	private int delay, framect, specframe, frame, movemult;

	@JsonIgnore
	private String hookrender;
	
	@JsonIgnore
	private String movescript, movestr;

	@JsonIgnore
	private int moveofs;	

	private int index;
	
	private Entity follower, follow;
	private int pathx[] = new int[FOLLOWDISTANCE]; 
	private int pathy[] = new int[FOLLOWDISTANCE];
	private int pathf[] = new int[FOLLOWDISTANCE];	

	
	@Override
	public int getx() {
		if(current_map!=null && current_map.getHorizontalWrappable() &&
				(this.x/16 > current_map.getWidth()<<4 || this.x < 0)) {
					this.x = (this.x + (current_map.getWidth()<<8)) % (current_map.getWidth()<<8);
					this.waypointx = (this.waypointx + (current_map.getWidth()<<4)) % (current_map.getWidth()<<4);
				}		
		return this.x/16;	}
	
	@Override
	public int gety() { 
		if(current_map!=null && current_map.getVerticalWrappable() &&
			(this.y/16 > current_map.getHeight()<<4 || this.y < 0)) {
				this.y = (this.y + (current_map.getHeight()<<8)) % (current_map.getHeight()<<8);
				this.waypointy = (this.waypointy + (current_map.getHeight()<<4)) % (current_map.getHeight()<<4);
			}		
		return this.y/16; 	}
	
	private int getOriginalX() {
		return this.x;
	}
	private int getOriginalY() {
		return this.y;
	}
	private void setoriginalx(int x) {
		this.x = x;
		getx();
	}
	private void setoriginaly(int y) {
		this.y = y;
		gety();
	}
	
	//[Rafael]
	@Override
	public void setx(int x) {
		this.x = x * 16;
		clear_waypoints();
	}
	@Override
	public void sety(int y) {
		this.y = y * 16;
		clear_waypoints();
	}
	@Override
	public void incx() {
		this.incx(1);
	}
	@Override
	public void incy() {
		this.incy(1);
	}
	@Override
	public void incx(int i) {
		this.x+= i * 16;
	}
	@Override
	public void incy(int i) {
		this.y+= i * 16;
	}
	@Override
	public void clear_waypoints() {
		set_waypoint(getx(), gety());
		delay = 0;
	}
	
	// END [Rafael]

	@Override
	public int getwaypointx() { 
		return this.waypointx; 
	}
	@Override
	public int getwaypointy() { 
		return this.waypointy; 
	}
	void setwaypointx(int waypointx) {
		this.waypointx = waypointx;
	}
	void setwaypointy(int waypointy) {
		this.waypointy = waypointy;
	}
	
	@Override
	public Entity getFollower() {
		return this.follower;
	}

	public String toString() {
		return "Entity (" + getx() + ", " + gety() + ") dir:" + getFace() + " isObsT:" + isObstructable() + " isObs:" + isObstruction() + " autoF:" + isAutoface() + " " +
				" speed:" + getSpeed() + " movMode:" + getMovecode() + " wanders: (" + getWx1() +","+ getWy1() +"," + getWx2() +"," + getWy2() + ") wDelay:" + getWdelay() +
				" movescript:" + movescript + " filename:" + getChrname() + " actEvent:" + getActivationEvent();
	}	
	
	public EntityImpl() {

	}
	
	// Used by the engine
	public EntityImpl(int x, int y, String chrfn) {
		//log.info("New entity: " + x + ", " + y + ": " + chrfn);
		follower = null;
		follow = null;
		delay = 0;
		lucent = 0;
		setWdelay(75);
		setxy(x, y);
		setSpeed(100);
		speedct = 0;
		setChrname(chrfn);
		if(chrfn!=null) // [Rafael]
			chr = CHR.loadChr(chrfn); // RequestCHR(chrfn);
		visible = true;
		active = true;
		specframe = 0;
		setMovecode(0);
		moveofs = 0;
		framect = 0;
		frame = 0;
		setFace(SOUTH);
		hookrender = "";
		setActivationEvent("");
		setObstructable(true);
		setObstruction(true);
		for (int i=0; i<FOLLOWDISTANCE; i++) {
			pathx[i] = x*16;
			pathy[i] = y*16;
			pathf[i] = SOUTH;
		}
	
	}
	
	@Override
	public void setxy(int x1, int y1) {
		setoriginalx(x1 * 16);
		setoriginaly(y1 * 16);
		if (follower != null) follower.setxy(x1, y1);
		set_waypoint(x1, y1);
		for (int i=0; i<FOLLOWDISTANCE; i++) {
			pathx[i] = getOriginalX();
			pathy[i] = getOriginalY();
			pathf[i] = SOUTH;
		}
	}

	@Override
	public void set_waypoint(int x1, int y1)
	{
		setwaypointx(x1);
		setwaypointy(y1);

		switch ((int) Math.signum(y1-gety()))
		{
			case -1: setFace(NORTH); break;
			case 0:  break;
			case 1:  setFace(SOUTH); break;
		}
		switch ((int)Math.signum(x1-getx()))
		{
			case -1: setFace(WEST); break;
			case 0:  break;
			case 1:  setFace(EAST); break;
		}
	}

	@Override
	public void set_waypoint_relative(int x1, int y1, boolean changeface)
	{
		setwaypointx(getwaypointx() + x1);
		setwaypointy(getwaypointy() + y1);
		
		if(changeface) {
			switch ((int) Math.signum(y1))
			{
				case -1: setFace(NORTH); break;
				case 0:  break;
				case 1:  setFace(SOUTH); break;
			}
			switch ((int) Math.signum(x1))
			{
				case -1: setFace(WEST); break;
				case 0:  break;
				case 1:  setFace(EAST); break;
			}
		}
	}

	@Override
	public boolean ready() { 
		return (getx() == getwaypointx() && gety() == getwaypointy()); 
	}

	private boolean leaderidle() {

		if (follow!=null) {
			return ((EntityImpl)follow).leaderidle();
		}
		return (getx() == getwaypointx() && gety() == getwaypointy());
	}

	// called to sync up with leader's frame
	// of course, if the two people have different-
	// length walk cycles, they might have the same framect,
	// but they won't sync visually, which is OK
	private int get_leader_framect()
	{
	    if(follow!=null) 
	    	return ((EntityImpl)follow).get_leader_framect();
	    return framect;
	}

	private void set_framect_follow(int f)
	{
	    if(follower!=null) {
	    	((EntityImpl)follower).set_framect_follow(f);
	    }
	    framect = f;
	}

	@Override
	public void stalk(Entity e)
	{
		follow = e;
		e.setFollower(this);
		
		/* Rafael,the Esper: obsolete code: this is resolved in new Entity()
		 * for (int i=0; i<FOLLOWDISTANCE; i++) {
			pathx[i] = follow.pathx[FOLLOWDISTANCE-1];
			pathy[i] = follow.pathy[FOLLOWDISTANCE-1];
			pathf[i] = SOUTH;
		}*/
		//setoriginalx(follow.pathx[FOLLOWDISTANCE-1]);
		//setoriginaly(follow.pathy[FOLLOWDISTANCE-1]);

		set_waypoint(getx(), gety());

		setMovecode(0);
		setObstruction(false);
		setObstructable(false);
	    // clear delay info from wandering
	    delay = 0;
	    // sync our (and followers') framect with the leader
	    set_framect_follow(get_leader_framect());
	}

	// This is called when we are going to change
	// to a kind of movement that isn't stalking to
	// ensure we are not trying to stalk at the same time
	@Override
	public void clear_stalk()
	{
	    if(follow!=null) {
	        follow.setFollower(null);
	        follow = null;
	    }
	}

	public void move_tick()
	{
		int dx = getwaypointx() - getx();
		int dy = getwaypointy() - gety();

		if (this != myself && follow==null && isObstructable())
		{
			// do obstruction checking */

			switch (getFace())
			{
				case NORTH: if (ObstructDirTick(NORTH)) return; break;
				case SOUTH: if (ObstructDirTick(SOUTH)) return; break;
				case WEST: if (ObstructDirTick(WEST)) return; break;
				case EAST: if (ObstructDirTick(EAST)) return; break;
				default: // Rafael: Do nothing. error("move_tick() - bad face value!!");
			}
		}
		framect++;

		// update pathxy for following
		for (int i=pathx.length-2; i>=0; i--) {
			pathx[i+1] = pathx[i];
			pathy[i+1] = pathy[i];
			pathf[i+1] = pathf[i];
		}
		pathx[0] = getOriginalX();
		pathy[0] = getOriginalY();
		pathf[0] = getFace();

		// if following, grab new position from leader
	    // We now keep track of our own framect, (rather
	    // than using the leader's framect)
	    // which is synced with the leader in stalk(),
	    // but then runs free after that so animations
	    // of different lengths are ok in a stalking chain.
		if (follow != null)
		{
			EntityImpl followE = (EntityImpl) follow;
			
			setoriginalx(followE.pathx[FOLLOWDISTANCE-1]);
			setoriginaly(followE.pathy[FOLLOWDISTANCE-1]);
			setFace(followE.pathf[FOLLOWDISTANCE-1]);
			set_waypoint(getx(), gety());
			if (follower != null)
				follower.move_tick();
			return;
		}

		// else move
		if (dx != 0){
			setoriginalx((int) (getOriginalX() + (Math.signum(dx) * 16)));
		}

		if (dy != 0)
			setoriginaly((int) (getOriginalY() + (Math.signum(dy) * 16)));

		if (follower != null)
			follower.move_tick();
	}

	@Override
	public void think()
	{
		int num_ticks;
		if (!active) 
			return;

		if (delay>systemtime) {
			framect = 0;
			return;
		}

		speedct += getSpeed();
		num_ticks = speedct / 100;
		speedct %= 100;

		while (num_ticks > 0) {
			num_ticks--;

			if (ready()) {
				switch (getMovecode()) {
					case 0: if (this == myself && invc==0) ProcessControls(); break;
					case 1: do_wanderzone(); break;
					case 2: do_wanderbox(); break;
					case 3: do_movescript(); break;
					default: log.error("think(), unknown movecode value");
				}
			}
			if (!ready())
				move_tick();
		}
	}

	boolean ObstructDirTick(int d)
	{
		actor_index = this.index;

		int x, y;
		int ex = getx();
		int ey = gety();

		if (!isObstructable()) return false;
		switch (d)
		{
			case NORTH:
				for (x=ex; x<ex+chr.getHw(); x++)
					if (ObstructAt(x, ey-1)) return true;
				break;
			case SOUTH:
				for (x=ex; x<ex+chr.getHw(); x++)
					if (ObstructAt(x, ey+chr.getHh())) return true;
				break;
			case WEST:
				for (y=ey; y<ey+chr.getHh(); y++)
					if (ObstructAt(ex-1, y)) return true;
				break;
			case EAST:
				for (y=ey; y<ey+chr.getHh(); y++)
					if (ObstructAt(ex+chr.getHw(), y)) return true;
				break;
		}
		return false;
	}

	boolean ObstructDir(int d)
	{
		actor_index = this.index;

		int i, x, y;
		int ex = getx();
		int ey = gety();

		if (!isObstructable()) 
			return false;
		
		switch (d)
		{
			case NORTH:
				for (i=0; i<chr.getHh(); i++)
					for (x=ex; x<ex+chr.getHw(); x++)
						if (ObstructAt(x, ey-i-1)) return true;
				break;
			case SOUTH:
				for (i=0; i<chr.getHh(); i++)
					for (x=ex; x<ex+chr.getHw(); x++)
						if (ObstructAt(x, ey+i+chr.getHh())) return true;
				break;
			case WEST:
				for (i=0; i<chr.getHw(); i++)
					for (y=ey; y<ey+chr.getHh(); y++)
						if (ObstructAt(ex-i-1, y)) return true;
				break;
			case EAST:
				for (i=0; i<chr.getHw(); i++)
					for (y=ey; y<ey+chr.getHh(); y++)
						if (ObstructAt(ex+chr.getHw()+i, y)) return true;
				break;
		}
		return false;
	}

	void do_wanderzone()
	{
		boolean ub=false, db=false, lb=false, rb=false;
		int ex = getx()/16;
		int ey = gety()/16;
		int myzone = current_map.getzone(ex, ey);

		if (ObstructDir(EAST) || current_map.getzone(ex+1, ey) != myzone) rb=true;
		if (ObstructDir(WEST) || current_map.getzone(ex-1, ey) != myzone) lb=true;
		if (ObstructDir(SOUTH) || current_map.getzone(ex, ey+1) != myzone) db=true;
		if (ObstructDir(NORTH) || current_map.getzone(ex, ey-1) != myzone) ub=true;

		if (rb && lb && db && ub) return; // Can't move in any direction

		move_wander(rb, lb, db, ub); // Rafael (refactoring to avoid duplicate code)
	}

	void do_wanderbox()
	{
		boolean ub=false, db=false, lb=false, rb=false;
		int ex = getx()/16;
		int ey = gety()/16;

		if (ObstructDir(EAST) || ex+1 > getWx2()) rb=true;
		if (ObstructDir(WEST) || ex-1 < getWx1()) lb=true;
		if (ObstructDir(SOUTH) || ey+1 > getWy2()) db=true;
		if (ObstructDir(NORTH) || ey-1 < getWy1()) ub=true;

		if (rb && lb && db && ub) return; // Can't move in any direction

		move_wander(rb, lb, db, ub);
	}
	
	// Method by Rafael, to avoid duplicate code and add some specific behavior.
	private void move_wander(boolean rb, boolean lb, boolean db, boolean ub) {
		delay = systemtime + (Script.random(1, 3) == 1 ? 0 : getWdelay()); // Rafael (Added random chance of stopping)
		
		while (true)
		{
			int i = Script.random(1, 4 + 4); // Rafael: changed to 1-4 + (extra),
			if(i>4) { // keep the same direction, with (extra)/(extra+4) % chance
				i = getFace();
			}
			switch (i)
			{
				case EAST:
					if (rb) break;
					set_waypoint_relative(16, 0, true);
					return;
				case WEST:
					if (lb) break;
					set_waypoint_relative(-16, 0, true);
					return;
				case SOUTH:
					if (db) break;
					set_waypoint_relative(0, 16, true);
					return;
				case NORTH:
					if (ub) break;
					set_waypoint_relative(0, -16, true);
					return;
			}
		}
	}
	

	private void do_movescript() {
		char vc2me[] = { 2, 1, 3, 4 };
		int arg;

		// movements factors
		// These are set to -1,0 or 1 to signify in
		// which directions movement should occur
		int vertfac = 0, horizfac = 0;


	    // reset to tile-based at the start of a movestring
	    if(moveofs == 0) {
	        movemult = 16;
	    } else if (moveofs >= movestr.length()) {
	    	setMovecode(0); framect = 0; // [Rafael]
	    }
	    
	    
	    
	    if(movestr==null || movestr.trim().isEmpty() || moveofs >= movestr.length()) // last if by [Rafael]
	    	return;
	    
		while (moveofs < movestr.length() && ( // [Rafael]
				(movestr.charAt(moveofs) >= '0' && movestr.charAt(moveofs) <= '9') || movestr.charAt(moveofs) == ' ' || movestr.charAt(moveofs) == '-'))
			moveofs++;

		boolean done = false;
		int found_move = 0; // number of LRUD letters we found
		while(!done && found_move < 2 && moveofs < movestr.length()) {
			switch(Character.toUpperCase(movestr.charAt(moveofs)))
			{
				case 'L':
					if(found_move==0 && getFace() != WEST) setFace(WEST);
					moveofs++;
					horizfac = -1;
					found_move++;
					break;
				case 'R':
					if(found_move==0 && getFace() != EAST) setFace(EAST);
					moveofs++;
					horizfac = 1;
					found_move++;
					break;
				case 'U':
					if(found_move==0 && getFace() != NORTH) setFace(NORTH);
					moveofs++;
					vertfac = -1;
					found_move++;
					break;
				case 'D':
					if(found_move==0 && getFace() != SOUTH) setFace(SOUTH);
					moveofs++;
					vertfac = 1;
					found_move++;
					break;
				default:
					done = true;
			}
		}

		if(!(moveofs < movestr.length()))
			return;
		
		if(found_move!=0) {
			
			arg = get_int(movestr, moveofs);
			
			// we've already set facing, don't do it again
			set_waypoint_relative(horizfac*arg*movemult, vertfac*arg*movemult, false);

		} else {
			// no directions, check other possible letters:
			switch(Character.toUpperCase(movestr.charAt(moveofs))) {
				case 'S': moveofs++;
					setSpeed(get_int(movestr, moveofs));
					break;
				case 'W': moveofs++;
					delay = systemtime + get_int(movestr, moveofs);
					break;
				case 'F': moveofs++;
					setFace(vc2me[get_int(movestr, moveofs)]);
					break;
				case 'B': moveofs = 0; break;
				case 'X': moveofs++;
					arg = get_int(movestr, moveofs);
					set_waypoint(arg*16, gety());
					break;
				case 'Y': moveofs++;
					arg = get_int(movestr, moveofs);
					set_waypoint(getx(), arg*16);
					break;
				case 'Z': moveofs++;
					specframe = get_int(movestr, moveofs);
					break;
				case 'P': movemult = 1;
					moveofs++;
					break;
				case 'T': movemult = 16;
					moveofs++;
					break;
				case 'H':
				case '0':  
					movemult = 0; moveofs = 0; properties.movecode = 0; framect = 0; 
					return;
				default: log.error("do_movescript(), unidentify movescript command");
			}
		}

	}

	private int get_int(String s, int offset) {
		int digit_size = 0; //[Rafael]
		if(Character.isDigit(s.charAt(offset))) { 
			digit_size++; 
			if(offset+1 < s.length() && Character.isDigit(s.charAt(offset+1))) {
				digit_size++;
				if(offset+2 < s.length() && Character.isDigit(s.charAt(offset+2))) { 
					digit_size++;
					if(offset+3 < s.length() && Character.isDigit(s.charAt(offset+3))) {
						digit_size++;
					}
				}
			}
		}
		int ret = Integer.parseInt(movestr.substring(moveofs, moveofs+digit_size).trim());
		moveofs+=digit_size;
		return ret;
	}
	
	@Override
	public void set_chr(String fname) {
	    chr = CHR.loadChr(fname); // [Rafael] RequestCHR(fname);
		specframe = 0;
		framect = 0;
		frame = 0;
	}

	@Override
	public void draw(VImage dest) {
		if (!visible) 
			return;

	    // if we're idle, reset the framect
		//if ((follow==null && ready()) || (follow!=null && leaderidle()))
			//framect = 0;	// Commented by Rafael (Why is this useful?)

		if (specframe > 0)
			frame = specframe;
		else
		{
			if (follow==null)
			{
				if (ready() || framect == 0) { // framect condition by Rafael
					frame = chr.getIdle()[getFace()];
				}
				else { 
					frame = chr.getFrame(getFace(), framect);
				}
			}
			else
			{
				if (leaderidle()) {
					frame = chr.getIdle()[getFace()];
				}
				else {
					frame = chr.getFrame(getFace(), framect);
				}
			}
		}

		int zx = getx() - xwin,
			zy = gety() - ywin;

		// Adapted by [Rafael]
		if(current_map != null && current_map.getHorizontalWrappable())
			zx = (zx + (current_map.getWidth()<<4)) % (current_map.getWidth()<<4);
		if(current_map != null && current_map.getVerticalWrappable())	
			zy = (zy + (current_map.getHeight()<<4)) % (current_map.getHeight()<<4);
		
		//log.info(this.chrname + " " + zx + "," + zy + " " + getx() + "," + gety() + " " + xwin + "," + ywin);
		
		if (hookrender != null && !hookrender.isEmpty())
		{
			event_entity = index;
			callfunction(hookrender);
			return;
		}

		if (chr != null) 
			chr.render(zx, zy, frame, dest);
		//if(this.y < 1600 && (this.chrname.contains("ent") || this.chrname.contains("ENT")))
			//log.info("RBP " + ready() + " " + frame + ", " + this.framect);		
	}

	@Override
	public void setWanderZone()	{
	    clear_stalk();
		set_waypoint(getx(), gety());
		setMovecode(1);
	}

	@Override
	public void setWanderBox(int x1, int y1, int x2, int y2) {
	    clear_stalk();
		set_waypoint(getx(), gety());
		setWx1(x1);
		setWy1(y1);
		setWx2(x2);
		setWy2(y2);
		setMovecode(2);
	}

	@Override
	public void setMoveScript(String s) {
	    clear_stalk();
		set_waypoint(getx(), gety());
		movestr = s;
		moveofs = 0;
		setMovecode(3);
	}

	@Override
	public void setWanderDelay(int n) {
		setWdelay(n);
	}

	@Override
	public void setMotionless() {
	    clear_stalk();
		set_waypoint(getx(), gety());
		setMovecode(0);
		delay = 0;
	}

	@Override
	@JsonIgnore
	public int getHotX() {
		return this.chr.getHx();
	}

	@Override
	@JsonIgnore
	public int getHotY() {
		return this.chr.getHy();
	}

	@Override
	@JsonIgnore
	public int getHotW() {
		return this.chr.getHw();
	}

	@Override
	@JsonIgnore
	public int getHotH() {
		return this.chr.getHh();
	}

	// For export
	void loadChr() {
		this.chr = CHR.loadChr(properties.chrname);
	}
	
	@Override
	@JsonIgnore
	public int getWdelay() {
		return properties.wanderDelay;
	}

	@Override
	public void setWdelay(int wdelay) {
		properties.wanderDelay = wdelay;
	}

	@Override
	@JsonIgnore
	public int getWx1() {
		return properties.wx1;
	}

	@Override
	public void setWx1(int wx1) {
		this.properties.wx1 = wx1;
	}

	@Override
	@JsonIgnore
	public int getWx2() {
		return properties.wx2;
	}

	@Override
	public void setWx2(int wx2) {
		this.properties.wx2 = wx2;
	}

	@Override
	@JsonIgnore
	public int getWy1() {
		return properties.wy1;
	}

	@Override
	public void setWy1(int wy1) {
		this.properties.wy1 = wy1;
	}

	@Override
	@JsonIgnore
	public int getWy2() {
		return properties.wy2;
	}

	@Override
	public void setWy2(int wy2) {
		this.properties.wy2 = wy2;
	}

	@Override
	public CHR getChr() {
		return this.chr;
	}

	@Override
	public boolean isActive() {
		return this.active;
	}

	@Override
	@JsonIgnore
	public boolean isObstruction() {
		return properties.obstruction;
	}

	@Override
	@JsonIgnore
	public int getMovecode() {
		return properties.movecode;
	}

	@Override
	public void setMovecode(int i) {
		properties.movecode = i;
	}

	@Override
	@JsonIgnore
	public int getIndex() {
		return this.index;
	}

	@Override
	public void setIndex(int ind) {
		this.index = ind;
	}

	@Override
	@JsonIgnore
	public boolean isObstructable() {
		return properties.obstructable;
	}

	@Override
	public void setObstructable(boolean b) {
		properties.obstructable = b;
	}

	@Override
	@JsonIgnore
	public int getFace() {
		return this.properties.face;
	}

	@Override
	@JsonIgnore
	public boolean isAutoface() {
		return this.properties.autoface;
	}

	@Override
	@JsonIgnore
	public String getActivationEvent() {
		return properties.activationEvent;
	}

	@Override
	public int getLucent() {
		return this.lucent;
	}

	@Override
	public void setHookrender(String s) {
		this.hookrender = s;
	}

	@Override
	public void setFollower(Entity e) {
		this.follower = e;
	}

	@Override
	public void setChr(CHR chr) {
		this.chr = chr;
	}

	@Override
	@JsonIgnore
	public String getChrname() {
		if(properties.chrname.toLowerCase().endsWith("chr")) {
			return properties.chrname
					.replace(".CHR", ".anim.json")
					.replace(".Chr", ".anim.json")
					.replace(".chr", ".anim.json");
		}
		return properties.chrname;
	}

	@Override
	public void setFace(int i) {
		this.properties.face = i;
	}

	@Override
	public void setSpecframe(int sf) {
		this.specframe = sf;
	}

	@Override
	public void setSpeed(int s) {
		properties.speed = s;
	    // We don't reset the speedct here, because
	    // 1) Is is keeping track of distance already moved but not acted on
	    //    (ie any partial movement made but not turned into a tick)
	    // 2) If we reset speedct, setting the speed frequently will slow
	    //    the character down by discarding the partial bits

		if (follower != null) follower.setSpeed(s);
	}

	@Override
	@JsonIgnore
	public int getSpeed() {
		return properties.speed;
	}

	@Override
	public void setActive(boolean b) {
		this.active = b;
	}

	@Override
	public Boolean getVisible() {
		return this.visible;
	}

	@Override
	public void setVisible(boolean b) {
		this.visible = b;
	}

	@Override
	public void setObstruction(boolean b) {
		properties.obstruction = b;
	}

	@Override
	@JsonIgnore
	public String getMovescript() {
		return this.movescript;
	}

	@Override
	public void setMovescript(String string) {
		this.movescript = string;
	}

	@Override
	public void setAutoface(boolean b) {
		this.properties.autoface = b;
	}

	@Override
	public void setActivationEvent(String string) {
		properties.activationEvent = string;
	}

	@Override
	public void setChrname(String string) {
		properties.chrname = string;
	}

	
	// Exclusively for Tiled
	@Override
	public int getId() {
		return id;
	}
	@Override
	public void setid(int i) {
		this.id = i;
	}
	@Override
	public String getType() {
		return "entity";
	}
	public int getWidth() {
		return 16;
	}
	public int getHeight() {
		return 16;
	}
	public String getName() {
		if(name == null || "".equals(this.name)) {
			return "Entity " + id;
		}
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public EntityProperties getProperties() {
		return this.properties;
	}
	public void setProperties(EntityProperties properties) {
		this.properties = properties;
	}
}
