package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.MainEngine.*;
import static core.Script.*;

import java.awt.Color;
import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

public abstract class MapAbstract implements Map {

	private static final Logger log = LogManager.getLogger(MapProperties.class);
	
	protected Tileset[] tilesets;
	
	protected MapProperties properties = new MapProperties();
	
	public String getRenderstring() {
		if(properties != null) {
			return properties.renderString;
		} else return "1,R";
	}
	public void setRenderstring(String renderstring) {
		this.properties.renderString = renderstring;
	}
	@JsonIgnore
	public String getMusicname() {
		if(properties != null) {
			return properties.musicName;
		}
		else return null;
	}
	public void setMusicname(String musicname) {
		properties.musicName = musicname;
	}
	@JsonIgnore
	public String getStartupscript() {
		return properties.startEvent;
	}
	public void setStartupscript(String startupscript) {
		properties.startEvent = startupscript;
	}
	public String getMapname() {
		return properties.title;
	}
	public void setMapname(String mapname) {
		properties.title = mapname;
	}
	public int getStartX() {
		return properties.startX;
	}
	public void setStartX(int startX) {
		properties.startX = startX;
	}
	public int getStartY() {
		return properties.startY;
	}
	public void setStartY(int startY) {
		properties.startY = startY;
	}
	public boolean getHorizontalWrappable() {
		return properties.horizontalWrappable;
	}
	public boolean getVerticalWrappable() {
		return properties.verticalWrappable;
	}
	public void setHorizontalWrappable(boolean b) {
		properties.horizontalWrappable = b;
	}
	public void setVerticalWrappable(boolean b) {
		properties.verticalWrappable = b;
	}
	
	public Tileset[] getTilesets() {
		return tilesets;
	}
	public void setTilesets(Tileset[] tilesets) {
		this.tilesets = tilesets;
	}

	
	public void render(int x, int y, VImage dest) {
		boolean first = true;
		int tx = (dest.width / 16) + 2;
		int ty = (dest.height / 16) + 2;

		for (int i = 0; i < getRenderstring().length(); i++) {
			char token = getRenderstring().charAt(i);
			if (token == ',') {
				continue;
			}

			if (token == 'E') {
				RenderEntities(dest);
				continue;
			}
			if (token == 'R') {
				hookretrace();
				continue;
			}
			if (Character.isDigit(token)) {
				int layer = Integer.parseInt(Character.toString(token))-1;
				if (first) {
					
					// Rafael: For an unknown reason, it's better to draw the first layer as a
					// transparent one than the original code drawing it non-transparent (2x FPS)
					//dest.rectfill(0,0,dest.width,dest.height,java.awt.Color.BLACK);
					blitLayer(true, layer, tx, ty, x, y, dest);
					first = false;
					continue;
				}
				blitLayer(true, layer, tx, ty, x, y, dest);
			}
		}
		//dest.g.drawString(myself.getx()/16 + "/" + getWidth(), 0, 30);
	}

	private void blitLayer(boolean transparent, int l, int tx, int ty, int xwin, int ywin, VImage dest) {
		if(l >= this.getNumLayers()) 
			return; //[Rafael] 
		
		// we add offsets here because if the parallax changes while the
		// xwin and ywin are non-zero, we would jump unless we compensate
		//int oxw = this.layers[l].x_offset + (int) ((float) xwin * this.layers[l].parallax_x);
		//int oyw = this.layers[l].y_offset + (int) ((float) ywin * this.layers[l].parallax_y);
		int oxw = xwin; // TODO Change this simplification to the code above
		int oyw = ywin; // Same to-do as above
		int xofs = -(oxw & 15);
		int yofs = -(oyw & 15);
		int xtc = oxw >> 4;
		int ytc = oyw >> 4;

		if (transparent)
			if (this.getLayerLucent(l) != 0)
				setlucent(this.getLayerLucent(l)); 

		if(getCurrentTileset().UpdateAnimations()) { // TODO Use for multiple Tilesets?
			resetCacheArray();
		}

		// Initialize cache arrays
		if(imgcache.length < this.getNumLayers()) {
			xcache = getCacheArray(getNumLayers());
			ycache = getCacheArray(getNumLayers());
			imgcache = new VImage[getNumLayers()];
		}
		
		if(imgcache[l]==null) {
			imgcache[l] = new VImage(dest.width+16, dest.height+16);
		}
		
		// Draw layer into the cache
		if(xtc!=xcache[l] || ytc!=ycache[l]) {
			if(transparent) {
				imgcache[l].g.setBackground(new Color(255, 255, 255, 0));
				imgcache[l].g.clearRect(0, 0, imgcache[l].width, imgcache[l].height);
			}
			for (int y = 0; y < ty+1; y++) {
				for (int x = 0; x < tx+1; x++) {
					int c = 0;
					if(getHorizontalWrappable() && getVerticalWrappable())  // Changed by [Rafael]
						c = gettile((xtc + x+getWidth())%(getWidth()), (ytc + y+getHeight())%(getHeight()), l);
					else if(!getHorizontalWrappable() && getVerticalWrappable())
						c = gettile((xtc + x), (ytc + y+getHeight())%(getHeight()), l);
					else if(getHorizontalWrappable() && !getVerticalWrappable())
						c = gettile((xtc + x+getWidth())%(getWidth()), (ytc + y), l);
					else if(!getHorizontalWrappable() && !getVerticalWrappable())
						c = gettile(xtc + x, ytc + y, l);
					
					if (transparent) { // TODO getTilesets(n) instead of 0?
						if (c != 0 || l==0) {
							getCurrentTileset().TBlit((x * 16), (y * 16), c, imgcache[l]);
							//tileset.TBlit((x * 16) + xofs, (y * 16) + yofs, c, dest);
						}
					} else {
							getCurrentTileset().Blit((x * 16), (y * 16), c, imgcache[l]);
							//tileset.Blit((x * 16) + xofs, (y * 16) + yofs, c, dest);
					}
				}
			}
		}

		// New code to allow blitting the whole image, instead of tile per tile
		if(transparent)
			dest.tblit(xofs, yofs, imgcache[l]);
		else
			dest.blit(xofs, yofs, imgcache[l]);
		xcache[l] = xtc;
		ycache[l] = ytc;

		
		//if (dest == screen) {
			// TODO Uncomment RenderLayerSprites(l);
		//}

		if (transparent)
			setlucent(0);
	}

	private Tileset getCurrentTileset() {
		return (Tileset) this.getTilesets()[0];
	}

	static int[] xcache = getCacheArray(1);
	static int[] ycache = getCacheArray(1);
	static VImage[] imgcache = new VImage[1];
	

	private static int[] getCacheArray(int size) {
		int[] ret = new int[size];
		for(int i=0; i<ret.length; i++)
			ret[i] = -1;
		return ret;
	}
	protected static void resetCacheArray() {
		xcache = getCacheArray(1);
		ycache = getCacheArray(1);
		imgcache = new VImage[1];
	}	

	public class MapProperties {

		String title;
		
		String musicName;
		
		String startEvent;
		
		Integer startX;
		
		Integer startY;
		
		String renderString; // New from v3tiled!
		
		Boolean horizontalWrappable = false; // New!
		
		Boolean verticalWrappable = false; // New!

		public String getTitle() {
			return title;
		}

		public String getMusicName() {
			return musicName;
		}

		public String getStartEvent() {
			return startEvent;
		}

		public Integer getStartX() {
			return startX;
		}

		public Integer getStartY() {
			return startY;
		}

		public String getRenderString() {
			return renderString;
		}

		public Boolean getHorizontalWrappable() {
			return horizontalWrappable;
		}

		public Boolean getVerticalWrappable() {
			return verticalWrappable;
		}
		
	}

	public MapProperties getProperties() {
		return properties;
	}

	public void setProperties(MapProperties properties) {
		this.properties = properties;
	}
	
}
