package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.annotation.JsonIgnore;

import domain.Entity;

/**
 * A map is an object that groups tiles, obstructions, zones and entities. 
 * Each map has one tileset.
 * Each map points to N entities.
 * 
 *     --------       -------       ---------
 *     |Entity| N...1 | Map | 1...1 |TileSet|
 *     --------       -------       ---------
 */

public interface Map {

	// Default map size
	static final int DEFAULT_X = 30;
	static final int DEFAULT_Y = 20;

	int getWidth();
	int getHeight();

	@JsonIgnore
	String getMapname();

	@JsonIgnore
	int getNumLayers();

	@JsonIgnore
	int getStartX();
	
	@JsonIgnore
	int getStartY();

	@JsonIgnore
	int gettile(int x, int y, int i);
	void settile(int x, int y, int i, int z);

	@JsonIgnore
	boolean getobs(int x, int y);
	void setobs(int x, int y, int t);

	@JsonIgnore
	boolean getobspixel(int x, int y);
	
	void render(int x, int y, VImage dest);
	
	@JsonIgnore
	String getFilename(); // ??
	
	Tileset[] getTilesets();

	@JsonIgnore
	boolean getHorizontalWrappable();
	@JsonIgnore
	boolean getVerticalWrappable();
	void setHorizontalWrappable(boolean b);
	void setVerticalWrappable(boolean b);
	
	Entity[] getEntities();

	@JsonIgnore
	String getRenderstring();
	void setRenderstring(String string);

	// Methods related to zones
	int getzone(int x, int y);
	void setzone(int x, int y, int z);

	String getScriptZone(int zone);
	int getPercentZone(int zone);
	int getMethodZone(int zone);
	void setMethodZone(int zone, boolean value);

	// Methods related to layers
	int getLayerLucent(int layer);
		
	void startMap();
}
