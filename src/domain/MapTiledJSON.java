package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;

import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.Scanner;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.gson.Gson;

import core.Script;

public class MapTiledJSON extends MapAbstract implements Map {

	static final Logger log = LogManager.getLogger(MapTiledJSON.class);

	public static final int META_LAYER = 2;
	public static final int ENTITY_LAYER = 1;
	public static final int ZONE_OFFSET = 19;

	private String filename = "";

	@JsonIgnore
	private String vspname = "";

	private Layer[] layers;
	
	//private byte[] obsLayer;  -> Migrated to META Layer
	//private int[] zoneLayer; 	-> Migrated to META Layer
	
	//private Entity[] entities;

	// For TILED export
	private String orientation = "orthogonal";
	private String renderorder = "right-down";
	private String tiledversion = "2017.07.26";
	private Integer tileheight = 16;
	private Integer tilewidth = 16;
	private String type = "map";
	private Integer version = 1;

	
	public static MapTiledJSON loadMap(String strFilename) {
		return loadMap(Script.load(strFilename), strFilename);
	}
	
	public static MapTiledJSON loadMap(URL url, String strFilename) {
		try {
			if(url==null)
				throw new IOException();
			
			MapTiledJSON map = loadMap(url);
			map.filename = strFilename; // url.getFile().substring( url.getFile().lastIndexOf('/')+1);

			//FileInputStream fis = new FileInputStream(path + "\\" + filename);
			//this.load(fis);
			
			// Load the vsp (map URL minus the map file plus the vsp file)
			//URL vspUrl = new URL(url.toString().substring(0, url.toString().lastIndexOf('/')+1) + map.vspname);
			URL vspUrl = new URL(url.toString().substring(0, url.toString().lastIndexOf('/')+1) 
					+ map.tilesets[0].getSource());
			
			log.info(vspUrl);

			for(Tileset tileset: map.getTilesets()) {
				// Load tileset from Source
				if(tileset.getSource() != null) {
					log.info("Loading tileset from Source: " + tileset.getSource());
					map.getTilesets()[0] = Tileset.loadTileset(vspUrl);
				}
				// Load just image of embedded tileset
				else {
					log.info("Loading tiles from Image: " + tileset.getImage());
					tileset.loadTiles(vspUrl);
				}
			}
			
			//Default map.getTilesets()[1] = Tileset.loadTileset(vspUrl);
			
			// Diassociated with loading the map
			//startMap();
			
			return map;
			
		} catch (IOException ioe) {
			log.error("MAP::IOException (" + strFilename + "), url = " + url);
			return null;
		}
	}

	public static MapTiledJSON loadMap(URL mapUrl, URL vspUrl) {
		try {
			MapTiledJSON map = loadMap(mapUrl);
			// TODO Generalize for other Vsps
			map.tilesets = new Tileset[2];
			map.getTilesets()[0] = Tileset.loadTileset(vspUrl);
			return map;
		} catch (IOException e) {
			log.error("MAP::IOException (mapUrl = " + mapUrl + "), vspurl = " + vspUrl);
			return null;
		}
	}

	/**
	 * Loads a Map from an InputStream
	 * @throws IOException 
	 * 
	 */
	public static MapTiledJSON loadMap(URL url) throws IOException {

		Scanner s = new Scanner(url.openStream()).useDelimiter("\\A");
		String result = s.hasNext() ? s.next() : "";
		Gson gson = new Gson(); //Builder().
		
		MapTiledJSON map = gson.fromJson(result, MapTiledJSON.class);
		
		return map;
	}

	// Rafael: Code disassociated with map loading
	public void startMap() {

		if(getMusicname() != null && !getMusicname().trim().isEmpty())
			playmusic(Script.load(getMusicname()));
		
		current_map = this;
		//se.LoadMapScript(f, mapfname);
		
		if(current_map.getEntities() != null) {
			for(int i=0; i<current_map.getEntities().length; i++) {
				Entity e = current_map.getEntities()[i];
				
				if(e.getChrname() == null || "".equals(e.getChrname())) {
					log.error("Null chr: " + i);	
				} else {
					e.setChr(CHR.loadChr(e.getChrname())); //RequestCHR(e.chrname);
				}
				
				e.setx(e.getx()*16); // New JLud2d
				e.sety(e.gety()*16); // New Jlud2d
				
				// TODO Is it necessary to call some initialization, see EntityImpl(int x, int y, String chrfn)
				/*	switch(e.getMovecode()) {
					case 0: e.setMotionless(); break;
					case 1: e.setWanderZone(); break;
					case 2: e.setWanderBox(e.getWx1(), e.getWy1(), e.getWx2(), e.getWy2()); break;
					case 3: e.setMoveScript(e.getMovescript()); break;				
				}
				 */
				
				e.setIndex(Script.numentities++);
	
				entities.add(e);
			}
		}
		
		if(getStartupscript() != null && !getStartupscript().trim().equals(""))
			callfunction(getStartupscript());

	}
	
	
	// Use

	public int getzone(int x, int y) {
		if (x < 0 || y < 0 || x >= getWidth() || y >= getHeight() )
			return 0;
		int t =  (layers[layers.length - META_LAYER].getTile(x, y));
		if(!isZone(t)) {
			return 0;
		}
		//log.info("Tile was: " + t + ", adjusted it was zone: " + tileToZone(t));
		return tileToZone(t);
		//return zoneLayer[(y * getWidth()) + x];
	}

	// Zone Tiles start at 20 and goes until 220
	// This returns 0 (no zone) to 200.
	private int tileToZone(int t) {
		int firstGid = getMetaTileset().getFirstgid();
		return (t - firstGid - ZONE_OFFSET);
	}
	private int zoneToTile(int zone) {
		if(zone == 0) { 
			return 0;
		}
		int firstGid = getMetaTileset().getFirstgid();
		return (zone + firstGid + ZONE_OFFSET);
	}

	
	public boolean getobs(int x, int y) {
		if (x < 0 || y < 0 || x >= getWidth() || y >= getHeight())
			return true;
		int t = layers[layers.length - META_LAYER].getTile(x, y);
		return isObs(t);
	}

	public boolean getobspixel(int x, int y) { // modified by [Rafael]
		if (!getHorizontalWrappable() && (x < 0 || (x >> 4) >= getWidth()))
				return true;
		if (!getVerticalWrappable() && (y < 0 || (y >> 4) >= getHeight()))
				return true;
		if(getHorizontalWrappable() && x < 0)
			x+= (getWidth() *16); 
		if(getHorizontalWrappable() && (x >> 4) >= getWidth())
			x-= (getWidth() *16);
		if(getVerticalWrappable() && y < 0)
			y+= (getHeight() *16); 
		if(getVerticalWrappable() && (y >> 4) >= getHeight())
			y-= (getHeight() *16);

		//int t = obsLayer[((y >> 4) * getWidth()) + (x >> 4)];
		int t = layers[layers.length - META_LAYER].getTile(x>> 4, y>>4);
		if(!isObs(t)) {
			return false;
		}
		return getMetaTileset().GetObs(t, x&15, y&15); 
	}
	
	private boolean isObs(int t) {
		int firstGid = getMetaTileset().getFirstgid();
		if(t >= firstGid + 1 && t <= firstGid + ZONE_OFFSET) { // TODO < or <= ?
			return true;
		}
		if(isZone(t) && getMethodZone(tileToZone(t))==1) {
			return true;
		}
		
		return false;
	}

	private boolean isZone(int t) {
		int tZone = tileToZone(t);
		if(tZone > 0) {
			return true;
		}
		return false;
	}
	
	public int gettile(int x, int y, int i) { 
		if(i>=this.layers.length) 
			return 0; 
		return this.layers[i].getTile(x,y); 
	}

	public void setzone(int x, int y, int z) {
		if (x < 0 || y < 0 || x >= getWidth() || y >= getHeight())
			return;
		this.layers[layers.length - META_LAYER].setTile(x,y, z==0 ? 0: zoneToTile(z));
		//log.info("Setted zone " + z + " into tile " + zoneToTile(z));
		//zoneLayer[(y * getWidth()) + x] = z;
	}

	public void setobs(int x, int y, int t) {
		if (x < 0 || y < 0 || x >= getWidth() || y >= getHeight())
			return;
		//if (t >= ((Tileset)getTilesets()[0]).numobs && t!=0)  // TODO Point to OBS Tileset
			//return;
		this.layers[layers.length - META_LAYER].setTile(x,y,t);
		//obsLayer[(y * getWidth()) + x] = (byte) t;
	}
	
	public void settile(int x, int y, int layer, int index) { 
		if(layer>=this.layers.length) {
			return;
		}
		this.layers[layer].setTile(x,y, index == 0 ? 0: index+1); 
		resetCacheArray();
	}
	
	public int getWidth() {
		if (layers != null && layers[0] != null) {
			return layers[0].width;
		}
		return 0;
	}

	public int getHeight() {
		if (layers != null && layers[0] != null) {
			return layers[0].height;
		}
		return 0;
	}
	
	public String getFilename() {
		return this.filename;
	}

	@JsonIgnore
	public Entity[] getEntities() {
		return this.layers[layers.length - ENTITY_LAYER].objects;
		//return this.entities;
	}

	private Tileset getMetaTileset() {
		return this.getTilesets()[this.getTilesets().length-1];
	}
	
	private ZoneProperties getZoneProperties(int tile) {
		java.util.Map<String, ZoneProperties> properties = getMetaTileset().getTileproperties();
		return properties.get(Integer.toString(tile + ZONE_OFFSET)); // Min = 20, Max = 200
	}
	
	public String getScriptZone(int zone) {
		ZoneProperties zp = getZoneProperties(zone);
		if(zp == null) { 
			return "";
		}
		return zp.getActivationEvent();
	}

	public int getPercentZone(int zone) {
		ZoneProperties zp = getZoneProperties(zone);
		if(zp == null) { 
			return 0;
		}
		return zp.getActivationChance();
	}

	public int getMethodZone(int zone) {
		ZoneProperties zp = getZoneProperties(zone);
		if(zp == null) { 
			return 0;
		}
		return zp.getIsObstruction() ? 1 : 0;
	}
	
	public void setMethodZone(int zone, boolean value) {
		ZoneProperties zp = getZoneProperties(zone);
		if(zp == null) { 
			return;
		}
		zp.setIsObstruction(value);
	}	

	public int getNumLayers() {
		return this.layers.length;
	}

	public int getLayerLucent(int layer) {
		return layers[layer].getOpacity();
	}

	public String getOrientation() {
		return orientation;
	}
	public String getRenderorder() {
		return renderorder;
	}
	public String getTiledversion() {
		return tiledversion;
	}
	public Integer getTileheight() {
		return tileheight;
	}
	public Integer getTilewidth() {
		return tilewidth;
	}
	public String getType() {
		return type;
	}
	public Integer getVersion() {
		return version;
	}
	
	public String getVspname() {
		return vspname;
	}

	public void setVspname(String vspname) {
		this.vspname = vspname;
	}

	public Layer[] getLayers() {
		return layers;
	}

	public void setLayers(Layer[] layers) {
		this.layers = layers;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public void setEntities(EntityImpl[] entities) {
		this.layers[layers.length - ENTITY_LAYER].objects = entities;
	}
	
	
	public String toString() {
		return "Mapname: " + filename + "; vspFile:" + vspname + "; music:"
				+ getMusicname() + "; render:" + getRenderstring() + "; startEvent: "
				+ getStartupscript() + "; start:" + getStartX() + "," + getStartY();
	}	
	
	/*
	 * 
	 */
	public class Layer {

			public static final int DEFAULT_X = 30;
			public static final int DEFAULT_Y = 20;
			
			public int width = DEFAULT_X; // Unsigned short
			public int height = DEFAULT_Y;
			private int opacity; // Unsigned Byte

			private LayerProperties properties;// = new LayerProperties(); 
			
			// For export
			private String name;
			private String type = "tilelayer";
			private boolean visible = true;

			public int[] data; // = new int[DEFAULT_X*DEFAULT_Y]; // width * height Unsigned shorts!

			private EntityImpl[] objects;
			private String color = "#99ff00"; 
			
			
			public int[] getData() { 
				if(data == null) { 
					return null;
				}
				return Arrays.stream(data)
						.map(n -> (n==0 ? 0 : n+1)) // Increment by 1 for export?
						.toArray();
			}

			public int getTile(int x, int y) {
				if (x<0 || y<0 || x>=width || y>=height) return 0;
				return data[(y*width)+x];
			}

			public void setTile(int x, int y, int t) {
				if (x<0 || y<0 || x>=width || y>=height) return;
				data[(y*width)+x] = t;
			}
			
			void setParallaxX(double p, int xwin) { // [Rafael]: changed to receive xwin
			    // increase the x_offset to the current layer pos given the current parallax
			    //x_offset += (int) ((float) xwin * getParallax_x());

			    // then reduce it by what the parallax will be
			    //x_offset -= (int) ((float) xwin * p);

			    // then we can set the parallax
			    setParallax_x(p);
			}

			void setParallaxY(double p, int ywin) { // [Rafael]: changed to receive ywin
			    // increase the x_offset to the current layer pos given the current parallax
			    //y_offset += (int) ((float) ywin * getParallax_y());

			    // then reduce it by what the parallax will be
			    //y_offset -= (int) ((float) ywin * p);

			    // then we can set the parallax
			    setParallax_y(p);
			}
			
			public String toString() {
				return "Layer " + name + ": (" + getParallax_x() + ", " + getParallax_y() + ") (" + width + ", " + height + ") " + opacity + " Data: " + data;
			}

			@JsonIgnore
			public double getParallax_x() {
				return properties.getParallax_x();
			}

			public void setParallax_x(double parallax_x) {
				this.properties.setParallax_x(parallax_x);
			}
			@JsonIgnore
			public double getParallax_y() {
				return properties.getParallax_y();
			}
			public void setParallax_y(double parallax_y) {
				this.properties.setParallax_y(parallax_y);
			}

			public int getOpacity() {
				return 1 - this.opacity;
			}
			public String getType() {
				return type;
			}
			public boolean isVisible() {
				return visible;
			}

			public LayerProperties getProperties() {
				return properties;
			}

			public String getName() {
				return name;
			}

			public int getWidth() {
				return width;
			}

			public void setWidth(int width) {
				this.width = width;
			}

			public int getHeight() {
				return height;
			}

			public void setHeight(int height) {
				this.height = height;
			}

			public void setOpacity(int opacity) {
				this.opacity = opacity;
			}

			public void setName(String name) {
				this.name = name;
			}

			public void setType(String type) {
				this.type = type;
			}

			public void setVisible(boolean visible) {
				this.visible = visible;
			}

			public void setData(int[] data) {
				this.data = data;
			}
			public Entity[] getObjects() {
				return objects;
			}
			public void setObjects(EntityImpl[] objects) {
				this.objects = objects;
			}
			public String getColor() {
				return color;
			}
			public void setColor(String color) {
				this.color = color;
			}
			
	}
	
	public class LayerProperties
	{
	    private int id;
	    private double parallax_y = 0;
	    private double parallax_x = 0;

		public int getId() {
			return id;
		}

		public void setId(int id) {
			this.id = id;
		}

		public double getParallax_y() {
			return parallax_y;
		}

		public void setParallax_y(double parallax_y) {
			this.parallax_y = parallax_y;
		}

		public double getParallax_x() {
			return parallax_x;
		}

		public void setParallax_x(double parallax_x) {
			this.parallax_x = parallax_x;
		}

	}
	
	public String exportMAPToJSON() {
		ObjectMapper mapper = new ObjectMapper();
		mapper.setSerializationInclusion(Include.NON_NULL);
		ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
		try {
			return ow.writeValueAsString(this);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
			return null;			
		}
	}
	
}
