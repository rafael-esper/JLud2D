package domain;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.load;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;
import java.util.Scanner;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.gson.Gson;

public class CHR {

	private static final Logger log = LogManager.getLogger(CHR.class);

	private int totalframes;					// total # of frames.
	private int fxsize;					// frame x/y dimensions
	private int fysize;
	private int hx;						// x/y obstruction hotspot
	private int hy;
	private int hw;							// hotspot width/height
	private int hh;
    private int idle[] = new int[5];			// idle frames

	@JsonIgnore
	private BufferedImage [] frames;

    @JsonIgnore
	private int anims[][]; // = new int[9][];

	//String filename;                        // the filename this was loaded from
	
	// Loaded from JSON
	private String[] animbuf; // = new String[9];
	private String imageName;
	private int columns = 1;
	private int spacing = 1;	
	
	public CHR() { }
	
	public static CHR loadChr(String chrname) {
		try {
			return loadChr(load(chrname
					.replace(".CHR", ".anim.json")
					.replace(".Chr", ".anim.json")
					.replace(".chr", ".anim.json")));
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	public static CHR loadChr(URL url) throws IOException {
		log.info("Loading CHR: " + url);
		if(url == null) 
			return new CHR();
		
		Scanner s = new Scanner(url.openStream()).useDelimiter("\\A");
		String result = s.hasNext() ? s.next() : "";
		Gson gson = new Gson();
		CHR chr = gson.fromJson(result, CHR.class);
		
		// Parse animations
		// Creates an array with size equal to the total "wait" time of the animation
		// Each index in the anims array points to a frame
		// So a F1W5F2W5 will insert in the array the values 1 1 1 1 1 2 2 2 2 2
		// TODO Diagonal ignored, order was changed from export
		//int indexes[] = { 0, Entity.NORTH, Entity.SOUTH, Entity.WEST, Entity.EAST, 0, 0, 0, 0}; 
		if(chr.getAnims() == null) {
			chr.anims = new int[chr.animbuf.length][];
		}
		for(int b=0; b<chr.animbuf.length; b++) {
			int totalLength = chr.GetAnimLength(chr.getAnimbuf()[b]);
			chr.getAnims()[b] = new int[totalLength == 0 ? 1 : totalLength];
			chr.ParseAnimation(b, chr.getAnimbuf()[b]);
		}		

		// Load images
		URL imageUrl = VImage.findInSameDir(url, chr.imageName);
		chr.loadCHRFromImage(imageUrl);
		
		return chr;
	}

	public static CHR loadChrFromImage(URL url, int total, int xSize, int ySize, int columns, int spacing) {
		log.info("Loading CHR from Image: " + url);
		CHR chr = new CHR();
		chr.fxsize = xSize;
		chr.fysize = ySize;
		chr.columns = columns;
		chr.totalframes = total;
		chr.spacing = spacing;
		chr.anims = new int[0][0];

		if(url == null) {
			return chr;
		}

		chr.imageName = url.getFile().substring(url.getFile().lastIndexOf('/')+1, url.getFile().length());
		chr.loadCHRFromImage(url);
		
		return chr;
	}
	
	private void loadCHRFromImage(URL url) {
		VImage[] framesFromImage = VImage.loadFramesFromImage(0, 0, fxsize, fysize, 0, 0, 
				columns, totalframes, getSpacing(), new VImage(url));
		setFrames(new BufferedImage[getTotalframes()]);
		for(int i=0; i<getTotalframes(); i++) {
			getFrames()[i] = framesFromImage[i].image;
		}
	}

	/// Method to make easier to export CHRs from images
	public void setAnimBufs(String[] animbufs) {
//		int lengths[] = new int[animbufs.length];
//		for(int i=0; i<lengths.length; i++) {
//			lengths[i] = animbufs[i].length();
//		}
		this.setAnimbuf(animbufs);
	}
	
	public void render(int x, int y, int frame, VImage dest) {
		
		x -= getHx();
		y -= getHy();
		if (frame <0 || frame >= getTotalframes())
			log.printf(Level.ERROR, "CHR::render(), frame requested is undefined (%d of %d)", frame, getTotalframes());
		
		dest.tblit(x, y, this.getFrames()[frame]);
	}
	
	
	public int getAnimSize(int animIndex) { //[Rafael]
		if (animIndex<0 || animIndex >= getAnims().length) {
			log.printf(Level.ERROR, "CHR::getAnimSize() - invalid direction %d", animIndex);
			return 0;
		}
		return getAnims()[animIndex].length; //return animsize[animIndex];
	}
	
	public int getFrame(int d, int framect)
	{
		if (d<0 || d >= getAnims().length) {
			log.printf(Level.ERROR, "CHR::GetFrame() - invalid direction %d", d);
			return 0;
		}
		//framect %= animsize[d];
		try {
			return getAnims()[d][framect % getAnims()[d].length];
		} catch(Exception e) {
			log.printf(Level.ERROR, "CHR::Invalid frame: direction %d, framect %d", d, framect);
			return 0;
		}
	}
	
	int GetFrameConst(int d, int framect)
	{
		if (d<0 || d >= getAnims().length) {
			log.printf(Level.ERROR, "CHR::GetFrame() - invalid direction %d", d);
			return 0;
		}
		return getAnims()[d][framect % getAnims()[d].length]; //animsize[d]];
	}
	
	void ParseAnimation(int d, String parsestr)
	{
		if(parsestr == null) {
			return;
		}
		int frame=0, len, i, ofs=0, parsecount = 0;
		while (parsecount < parsestr.length())
		{
			switch (parsestr.charAt(parsecount))
			{
				case 'f':
				case 'F':
					parsecount++;
					frame = GetArg(parsestr.substring(parsecount));
					parsecount+=Integer.toString(frame).length();
					//log.info("Anim(F" + frame + "), resting " + parsestr.substring(parsecount));
					break;
				case 'w':
				case 'W':
					parsecount++;
					len = GetArg(parsestr.substring(parsecount));
					for (i=ofs; i<ofs+len; i++)
						this.getAnims()[d][i] = frame;
					ofs += len;
					parsecount+=Integer.toString(len).length();
					//log.info("Anim(W" + len + "), resting " + parsestr.substring(parsecount));
					break;
				default:
					log.printf(Level.ERROR, "CHR::ParseAnimation() - invalid animscript command! %c\n", parsestr.charAt(parsecount));
					return;
			}
		}
	}
	
	int GetAnimLength(String parsestr)
	{
		if(parsestr == null) {
			return 0;
		}
		int length = 0;
		int parsecount = 0;
		while (parsecount < parsestr.length())
		{
			switch (parsestr.charAt(parsecount))
			{
				case 'f':
				case 'F':
					parsecount++;
					int frame = GetArg(parsestr.substring(parsecount));
					parsecount+=Integer.toString(frame).length();
					//log.info("Parse(F):" + frame + ", sobrou " + parsestr.substring(parsecount));
					break;
				case 'w':
				case 'W':
					parsecount++;
					int wait = GetArg(parsestr.substring(parsecount));
					length+=wait;
					parsecount+=Integer.toString(wait).length();
					//log.info("Parse(W):" + wait + ", sobrou " + parsestr.substring(parsecount));					
					break;
				default:
					log.printf(Level.ERROR, "CHR::GetAnimLength() - invalid animscript command! %c\n", parsestr.charAt(parsecount));
					return 0;
			}
		}
		return length;
	}
	
	int GetArg(String str)
	{
		String retorno = "";
	
		int parsecount = 0;
		while (str.charAt(parsecount) == ' ' && parsecount < str.length())
			parsecount++;
	
		while (parsecount < str.length() && str.charAt(parsecount) >= '0' && str.charAt(parsecount) <= '9')
			retorno = retorno.concat(Character.toString(str.charAt(parsecount++)));
	
		if(retorno.trim().equals("")) // [Rafael]
			return 0;
		return Integer.parseInt(retorno);
	}
	
	public int getFxsize() {
		return fxsize;
	}

	public void setFxsize(int fxsize) {
		this.fxsize = fxsize;
	}

	public int getFysize() {
		return fysize;
	}

	public void setFysize(int fysize) {
		this.fysize = fysize;
	}

	public int getHx() {
		return hx;
	}

	public void setHx(int hx) {
		this.hx = hx;
	}

	public int getHy() {
		return hy;
	}

	public int setHy(int hy) {
		this.hy = hy;
		return hy;
	}

	public int getHw() {
		return hw;
	}

	public int setHw(int hw) {
		this.hw = hw;
		return hw;
	}

	public int getTotalframes() {
		return totalframes;
	}

	public void setTotalframes(int totalframes) {
		this.totalframes = totalframes;
	}

	public int[] getIdle() {
		return idle;
	}

	public void setIdle(int idle[]) {
		this.idle = idle;
	}

	public int[][] getAnims() {
		return anims;
	}

	public void setAnims(int anims[][]) {
		this.anims = anims;
	}

	public BufferedImage [] getFrames() {
		return frames;
	}

	public void setFrames(BufferedImage [] frames) {
		this.frames = frames;
	}

	public int getHh() {
		return hh;
	}

	public int setHh(int hh) {
		this.hh = hh;
		return hh;
	}

	public String[] getAnimbuf() {
		return animbuf;
	}
	public void setAnimbuf(String[] animbuf) {
		this.animbuf = animbuf;
	}
	public String getImageName() {
		return imageName;
	}
	public void setImageName(String imageName) {
		this.imageName = imageName;
	}

	public int getColumns() {
		return columns;
	}

	public void setColumns(int columns) {
		this.columns = columns;
	}

	public int getSpacing() {
		return spacing;
	}
	public void setSpacing(int spacing) {
		this.spacing = spacing;
	}

}
