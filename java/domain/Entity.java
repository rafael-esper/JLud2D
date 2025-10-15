package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import domain.EntityImpl.EntityProperties;

public interface Entity {

	public final static int NORTH = 1;
	public final static int SOUTH = 2;
	public final static int WEST = 3;
	public final static int EAST = 4;
	public final static int NW = 5;
	public final static int NE = 6;
	public final static int SW = 7;
	public final static int SE = 8;
	public final static int ENT_AUTOFACE = 1;
	public final static int ENT_OBSTRUCTS = 2;
	public final static int ENT_OBSTRUCTED = 4;
	public final static int ENT_MOTIONLESS = 0;
	public final static int ENT_MOVESCRIPT = 1;
	public final static int ENT_WANDERZONE = 2;
	public final static int ENT_WANDERBOX = 3;
	public static int FOLLOWDISTANCE = 16;

	int getx();
	int gety();

	void setx(int x);
	void sety(int y);

	void incx();
	void incy();

	void incx(int i);
	void incy(int i);

	void clear_waypoints();

	int getwaypointx();
	int getwaypointy();

	Entity getFollower();

	void setxy(int x1, int y1);

	void set_waypoint(int x1, int y1);

	void set_waypoint_relative(int x1, int y1, boolean changeface);

	boolean ready();

	void stalk(Entity e);

	void clear_stalk();
	
	void think();

	void set_chr(String fname);

	void draw(VImage dest);

	void setWanderZone();

	void setWanderBox(int x1, int y1, int x2, int y2);

	void setMoveScript(String s);

	void setWanderDelay(int n);

	void setMotionless();

	int getHotX();
	int getHotY();

	int getHotW();
	int getHotH();

	int getWdelay();

	void setWdelay(int wdelay);

	int getWx1();
	void setWx1(int wx1);

	int getWx2();
	void setWx2(int wx2);

	int getWy1();
	void setWy1(int wy1);

	int getWy2();
	void setWy2(int wy2);

	CHR getChr();

	boolean isActive();
	void setActive(boolean b);

	boolean isObstruction();
	void setObstruction(boolean b);

	int getMovecode();
	void setMovecode(int i);
	
	String getMovescript();
	void setMovescript(String string);
	
	int getIndex();
	void setIndex(int numentities);
	
	boolean isObstructable();
	void setObstructable(boolean b);
	
	int getFace();
	void setFace(int i);

	boolean isAutoface();
	void setAutoface(boolean b);

	String getActivationEvent();
	void setActivationEvent(String string);

	int getLucent();

	void setHookrender(String s);

	void setFollower(Entity e);

	void move_tick();

	void setChr(CHR chr);

	String getChrname();

	void setSpecframe(int showplayer);

	void setSpeed(int i);
	int getSpeed();

	Boolean getVisible();
	void setVisible(boolean b);
	
	void setChrname(String string);

	
	// Exclusively for Tiled
	int getId();
	void setid(int i);
	String getType();
	int getWidth();
	int getHeight();
	String getName();
	void setName(String name);
	EntityProperties getProperties();
	void setProperties(EntityProperties properties);
	

}