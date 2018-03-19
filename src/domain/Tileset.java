package domain;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;

import java.awt.Font;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.gson.Gson;

public class Tileset {

	private static final Logger log = LogManager.getLogger(Tileset.class);

	public static final int ANIM_MODE_FORWARD   = 0;
	public static final int ANIM_MODE_BACKWARD  = 1;
	public static final int ANIM_MODE_RANDOM    = 2;
	public static final int ANIM_MODE_PINGPONG  = 3;

	public static int mytimer;
	
	// .vsp format: 	https://github.com/Bananattack/v3tiled/wiki/.vsp-file
	
	//private int tileSize = 16;
	private int tilewidth;
	private int tileheight;
	private int tilecount = 0;
	
	private byte[] obsPixels = new byte[16*16]; // width * height * 1 bytes!
	private static int NUMOBS = 20;
	//int numobs;
	
	@JsonIgnore
	int vadelay[], tileidx[];
	
	@JsonIgnore
	private BufferedImage [] tilesImg;

	// For export
	private Integer columns; // = 20;
	private Integer spacing; // = 0;
	private String type; // = "tileset";
    private Integer firstgid = 1;
    private String image; // = "ps1.vsp.tile.png";
    private String source;
    private String name; // = "Tiles"; // TODO Change name
	private java.util.Map<String, TileProperties> tiles;
	private java.util.Map<String, ZoneProperties> tileproperties = new TreeMap<String, ZoneProperties>();
	
	public Tileset() {
		
	}
	
	public static Tileset loadTileset(String vspname) {
		try {
			//this.load(urlpath.openStream());
			return loadTileset(load(vspname.replace(".vsp", ".tiles.json")));
		} catch (IOException e) {
			log.error("VSP::IOException : " + e.getMessage());
			e.printStackTrace();
			return null;
		}
	}
	
	
	public static Tileset loadTileset(URL url) throws IOException {
		Scanner s = new Scanner(url.openStream()).useDelimiter("\\A");
		String result = s.hasNext() ? s.next() : "";
		Gson gson = new Gson();
		Tileset vsp = gson.fromJson(result, Tileset.class);
		log.info("Loading tileset: " + vsp.name);
		// Load tiles from Image
		vsp.loadTiles(url);
		
		return vsp;
	}
	

	public void loadTiles(URL url) {
		// Load tiles
		URL imageUrl = VImage.findInSameDir(url, this.image);
		VImage[] tilesFromImage = VImage.loadFramesFromImage(0, 0, this.tilewidth, this.tileheight, 0, 0, 
				this.columns, this.getTilecount(), this.getSpacing(), new VImage(imageUrl));
		this.tilesImg = new BufferedImage[this.getTilecount()];
		this.obsPixels = new byte[NUMOBS * 16 * 16]; // TODO Adjust for other sizes
		for(int i=0; i<this.getTilecount(); i++) {
			this.tilesImg[i] = tilesFromImage[i].image;
			
			// Obspixels based on image
			if(i < NUMOBS) {
				for(int pix=0; pix<16; pix++) {
					for(int piy=0; piy<16; piy++) {
						if(tilesImg[i].getRGB(pix, piy) == 2138964094 || tilesImg[i].getRGB(pix, piy) == 0) {
							this.obsPixels[i*256 + piy*16 + pix] = 0;
						} else {
							this.obsPixels[i*256 + piy*16 + pix] = 1;
						}
					}
				}
			}
		}
		
		// initialize tile anim stuff
		this.tileidx = new int[this.getTilecount()+1];
		this.vadelay = new int[this.getTilecount()+1];
		for (int i=0; i<this.getTilecount(); i++)
		{
			this.vadelay[i] = 0;
			this.tileidx[i] = (i - firstgid) > 0 ? (i-firstgid) : 0;
		}
		mytimer = systemtime;
	}

	public void exportToClipboard(int tiles_per_row) {
		
		int row_size = tiles_per_row*16;
		VImage clipboard = new VImage(row_size, (this.getTilecount()/tiles_per_row+1) * 16);
		Font font = new Font("Serif", Font.PLAIN, 7);
		
		for(int i=0; i<this.getTilecount(); i++) {
			clipboard.blit((i*16)%row_size, i/tiles_per_row*16, getTilesImg()[i]);
			//if(i%tiles_per_row == 0)
				//clipboard.printstring(0, i/tiles_per_row*16+7, font, Integer.toString(i/tiles_per_row)); 
		}
		clipboard.copyImageToClipboard();

	}
	
	
	public int getTilecount() {
		return tilecount;
	}

	public BufferedImage [] getTilesImg() {
		return tilesImg;
	}

	boolean GetObs(int t, int x, int y)
	{
		t = t - firstgid;
		//log.info("Checking " + t);
		if (t==0) return false;
		if (t>=NUMOBS || t<0) return true;
		if (x<0 || y<0 || x>15 || y>15) return true;
//		if(t > 0 && t < 20) {
//			for(int i=0; i<16; i++) {
//				for(int j=0; j<16; j++) {
//					System.out.print(obsPixels[(t*256)+(i*16)+j]+",");
//				}
//				log.info();
//			}
//		}
		return obsPixels[(t*256)+(y*16)+x] == 0 ? false: true;
	}
	
	public boolean UpdateAnimations()
	{
		boolean animated = false;
		while (mytimer < systemtime)
		{
			animated = AnimateTiles();
			mytimer++;
		}
		return animated;
	}
	public void Blit(int x, int y, int index, VImage dest)
	{
		// tileidx[index] = the actual pointer to a tile, can change due to VSP animation
		if (index >= tileidx.length || tileidx[index] > getTilecount()) {
			log.printf(Level.ERROR, "VSP::BlitTile(), tile %d exceeds %d", index, getTilecount());
			return;
		}
		//if(systemtime%3!=0) 
		dest.blit(x, y, current_map.getTilesets()[0].getTilesImg()[tileidx[index]]);
		//dest.g.drawImage(current_map.tileset.tiles[index], x, y, Color.BLACK, null);
		// Faster, but doesn't support animations
		/*Graphics2D g2 = (Graphics2D) dest.g;
		g2.setPaint(new TexturePaint(current_map.tileset.tiles[index], new Rectangle(x,y,16,16)));
		g2.fillRect(x,y,16,16);*/
		
		
	}

	public void TBlit(int x, int y, int index, VImage dest)
	{
		/*while (mytimer < systemtime)
		{
			AnimateTiles();
			mytimer++;
		}*/
		//if (index >= numtiles) err("VSP::BlitTile(), tile %d exceeds %d", index, numtiles);
		if (index >= tileidx.length || tileidx[index] > getTilecount()) {
			log.printf(Level.ERROR, "VSP::TBlitTile(), tile %d exceeds %d: Check your map!\n", index, getTilecount());
			return;
		}
		dest.tblit(x, y, current_map.getTilesets()[0].getTilesImg()[tileidx[index]]);
		//dest.g.drawImage(current_map.tileset.tiles[index], x, y, null);
	}

	void BlitObs(int x, int y, int index, VImage dest)
	{
		if (index > NUMOBS) return;
		//[Rafael] char c[] = (char) obs + (index * 256);
		//[Rafael] int white = MakeColor(255,255,255);
		for (int yy=0; yy<16; yy++)
			for (int xx=0; xx<16; xx++)
				;//[Rafael] if (c[(yy*16)+xx]>0) PutPixel(x+xx, y+yy, white, dest);
	}

	boolean AnimateTiles()
	{
		if(this.tiles == null) {
			return true;
		}
		boolean animated = false;
		for(String key: this.tiles.keySet()) {
			Integer i = Integer.parseInt(key) + firstgid;
			TileProperties tp = this.tiles.get(key);
			if(tp == null || tp.animation == null || vadelay == null) {
				return false;
			}
			animated = false;
			int animPosition = 0;
			// Find current animation`s tile position
			for(AnimationJSON anim: tp.animation) {
				animPosition+= anim.getDuration();
				if (vadelay[i] < animPosition) {
					tileidx[i] = anim.getTileid();
					vadelay[i]++;
					animated = true;
					break;
				}
			}
			if(!animated) { // back to start
				tileidx[i] = i;
				vadelay[i] = 0;
			}
		}

		return animated;
	}

	
	public Integer getTilewidth() {
		return tilewidth;
	}
	public Integer getTileheight() {
		return tileheight;
	}
	public Integer getColumns() {
		return columns;
	}
	public void setColumns(Integer columns) {
		this.columns = columns;
	}
	public Integer getSpacing() {
		return spacing;
	}
	public void setSpacing(Integer spacing) {
		this.spacing = spacing;
	}

	public String exportVSPToJSON(String strImageName) {
		this.setImage(strImageName);
		ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
		try {
			return ow.writeValueAsString(this);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
			return null;			
		}
	}

	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public String getType() {
		return type;
	}
	public int getFirstgid() {
		return firstgid;
	}
	public String getName() {
		return name;
	}
	public String getSource() {
		return source;
	}
	public void setFirstgid(Integer firstgid) {
		this.firstgid = firstgid;
	}
	public void setSource(String source) {
		this.source = source;
	}
	public void setTilewidth(Integer tilewidth) {
		this.tilewidth = tilewidth;
	}
	public void setTileheight(Integer tileheight) {
		this.tileheight = tileheight;
	}
	public void setTilecount(Integer tilecount) {
		this.tilecount = tilecount;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	public java.util.Map<String, TileProperties> getTiles() {
		return tiles;
	}
	public void setTiles(java.util.Map<String, TileProperties> tiles) {
		this.tiles = tiles;
	}
	public java.util.Map<String, ZoneProperties> getTileproperties() {
		return tileproperties;
	}
	public void setTileproperties(java.util.Map<String, ZoneProperties> tileproperties) {
		this.tileproperties = tileproperties;
	}
	
	class TileProperties {
		AnimationJSON animation[];

		public AnimationJSON[] getAnimation() {
			return animation;
		}

		public void setAnimation(AnimationJSON[] animation) {
			this.animation = animation;
		}
	
	}
	
	class AnimationJSON {
		Integer duration;
		Integer tileid;
		
		public Integer getDuration() {
			return duration;
		}
		public void setDuration(Integer duration) {
			this.duration = duration;
		}
		public Integer getTileid() {
			return tileid;
		}
		public void setTileid(Integer tileid) {
			this.tileid = tileid;
		}
		
	}	
	
}
