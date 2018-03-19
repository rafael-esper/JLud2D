package util;

import static core.Script.current_map;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import domain.Map;
import domain.MapTiledJSON;
import domain.VImage;

public class AutoTiling {

	private static final Logger log = LogManager.getLogger(AutoTiling.class);


	/* Marching Squares algorithm
	 * http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/

0	..	None			8	..	Down
	..						.Q	

1	Q.	Up				9	Q.	Up | Down
	..						.Q	

2	.Q	Right			10	.Q	Down
	..						.Q	

3	QQ	Right			11	QQ	Down
	..						.Q	

4	..	Left			12	..	Left
	Q.						QQ	

5	Q.	Up				13	Q.	Up
	Q.						QQ	

6	.Q	Left | Right	14	.Q	Left
	Q.						QQ	

7	QQ	Right			15	QQ	None
	Q.						QQ	

	 * 
	 */
	private enum StepDirection
	  {
	    None,
	    Up,
	    Left,
	    Down,
	    Right
	  }
	
	  // The direction we previously stepped
	  private static StepDirection previousStep;
	 
	  // Our next step direction:
	  private static StepDirection nextStep;
	  
	  // Determines if a single pixel is solid (we test against
	  // alpha values, you can write your own test if you want
	  // to test for a different color.)
	  private static boolean IsTileSolid(Map m, int x, int y)
	  {
	    // Make sure we don't pick a point outside our
	    // image boundary!
	    if (x < 0 || y < 0 ||
	        x >= m.getWidth() || y >= m.getHeight())
	        return false;
	 
	    // Check if the tile is a water one
	    if (m.gettile(x, y, 0) == 245)
	        return false;
	 
	    // Otherwise, it's solid
	    return true;
	  }	
	
	// Determines and sets the state of the 4 pixels that
	  // represent our current state, and sets our current and
	  // previous directions
	  private static void Step(Map m, int x, int y)
	  {
	    // Scan our 4 pixel area
	    boolean upLeft = IsTileSolid(m, x-1, y-1);
	    boolean upRight = IsTileSolid(m, x, y-1);
	    boolean downLeft = IsTileSolid(m, x-1, y);
	    boolean downRight = IsTileSolid(m, x, y);
	 
	    // Store our previous step
	    previousStep = nextStep;
	 
	    // Determine which state we are in
	    int state = 0;
	 
	    if (upLeft)
	       state |= 1;
	    if (upRight)
	       state |= 2;
	    if (downLeft)
	       state |= 4;
	    if (downRight)
	       state |= 8;
	 
	    // State now contains a number between 0 and 15
	    // representing our state.
	    // In binary, it looks like 0000-1111 (in binary)
	 
	    // An example. Let's say the top two pixels are filled,
	    // and the bottom two are empty.
	    // Stepping through the if statements above with a state
	    // of 0b0000 initially produces:
	    // Upper Left == true ==>  0b0001
	    // Upper Right == true ==> 0b0011
	    // The others are false, so 0b0011 is our state
	    // (That's 3 in decimal.)
	 
	    // Looking at the chart above, we see that state
	    // corresponds to a move right, so in our switch statement
	    // below, we add a case for 3, and assign Right as the
	    // direction of the next step. We repeat this process
	    // for all 16 states.
	 
	    // So we can use a switch statement to determine our
	    // next direction based on
	    //log.info("State: " + state + ". ");
	    switch (state )
	    {
	      case 1: nextStep = StepDirection.Up; break;
	      case 2: nextStep = StepDirection.Right; break;
	      case 3: nextStep = StepDirection.Right; break;
	      case 4: nextStep = StepDirection.Left; break;
	      case 5: nextStep = StepDirection.Up; break;
	      case 6:
	        if (previousStep== StepDirection.Up)
	        {
	          nextStep = StepDirection.Left;
	        }
	        else
	        {
	          nextStep = StepDirection.Right;
	        }
	        break;
	      case 7: nextStep = StepDirection.Right; break;
	      case 8: nextStep = StepDirection.Down; break;
	      case 9:
	        if (previousStep== StepDirection.Right)
	        {
	          nextStep = StepDirection.Up;
	        }
	        else
	        {
	          nextStep = StepDirection.Down;
	        }
	        break;
	      case 10: nextStep = StepDirection.Down;  break;
	      case 11: nextStep = StepDirection.Down; break;
	      case 12: nextStep = StepDirection.Left; break;
	      case 13: nextStep = StepDirection.Up; break;
	      case 14: nextStep = StepDirection.Left; break;
	      default:
	        nextStep = StepDirection.None;
	        break;
	      }
	  }	  
	  
	  public static List<Point> WalkPerimeter(Map m, int startX, int startY)
	  {
	    // Do some sanity checking, so we aren't
	    // walking outside the image
	    if (startX< 0)
	      startX= 0;
	    if (startX> m.getWidth())
	      startX= m.getWidth();
	    if (startY< 0)
	      startY= 0;
	    if (startY> m.getHeight())
	      startY= m.getHeight();
	   
	    // Set up our return list
	    List<Point> pointList = new ArrayList<Point>();
	   
	    // Our current x and y positions, initialized
	    // to the init values passed in
	    int x = startX;
	    int y = startY;
	   
	    // The main while loop, continues stepping until
	    // we return to our initial points
	    do
	    {
	      // Evaluate our state, and set up our next direction
	      Step(m, x, y);
	   
	      // If our current point is within our image
	      // add it to the list of points
	      if (x >= 0 &&
	          x < m.getWidth() &&
	          y >= 0 &&
	          y < m.getHeight())
	           	  pointList.add(new Point(x, y));
	   
	      switch (nextStep)
	      {
	        case Up:    y--; break;
	        case Left:  x--; break;
	        case Down:  y++; break;
	        case Right: x++; break;
	        default:
	          break;
	      }
	    } while (x != startX|| y != startY);
	   
	    return pointList;
	  }	  
	
	
	// 0=Water, 1=Sand, 2=Grass  
	  static final int WATER=0;
	  static final int SAND=1;
	  static final int GRASS=2;
	  
	// OBS: Don't repeat any tile!
	static final int[] SAND_WATER = new int[]{244, 257, 252, 198, 239, 203, 10000, 270, 234, 10001, 221, 275, 216, 288, 293, 245};
	static final int[] SAND_GRASS = new int[]{244, 229, 228, 128, 211, 195, 10002, 208, 210, 10003, 177, 209, 146, 226, 227, 131};

	// Returns the bit of the index tile located in tiles[], either firstTile or secondTile 
	//http://www.codeproject.com/Articles/106884/Implementing-Auto-tiling-Functionality-in-a-Tile-M
	static int getBit(int[] tiles, int index, int bit, int firstTile, int lastTile) {
		int pos = 0;
		for(; pos<tiles.length; pos++) {
			if(index==tiles[pos])
				break;
		}
		if(pos==tiles.length)
			return -1; // Not found
		
		//log.error("bit: " + bit + " = pos " + pos + " & " + (1<<bit));
		if((pos & 1<<bit) == 0) 
			return firstTile;
		else
			return lastTile;
	}
	
	// Returns the tile type of one of its 4 bits.  
	static int getBit(int tile, int bit) {
		  // Search for selected tile into SAND_WATER array
		  int b = getBit(SAND_WATER, tile, bit, SAND, WATER);
		  if(b>=0) {
			  return b;
		  }
		  // Search for selected tile into SAND_GRASS array
		  b = getBit(SAND_GRASS, tile, bit, SAND, GRASS);
		  if(b>=0) {
			  return b;
		  }
		log.info("TILE: " + tile + " bit: " + bit);
		return -1; // error
	}
	
	// Get a tile number depending on the tile type of each bit
	static int getTile(Map m, int bit0, int bit1, int bit2, int bit3) {
		
		int min = Math.min(bit0, Math.min(bit1, Math.min(bit2, bit3)));
		//int max = Math.max(bit0, Math.max(bit1, Math.max(bit2, bit3)));
		int result = 0;
		if(min==WATER) {
			bit0 = bit0 == SAND ? 0: 1;
			bit1 = bit1 == SAND ? 0: 1;
			bit2 = bit2 == SAND ? 0: 1;
			bit3 = bit3 == SAND ? 0: 1;
			result = SAND_WATER[bit0 + bit1*2 + bit2*4 + bit3*8];
		}
		else {
			bit0 = bit0 == SAND ? 0: 1;
			bit1 = bit1 == SAND ? 0: 1;
			bit2 = bit2 == SAND ? 0: 1;
			bit3 = bit3 == SAND ? 0: 1;
			result = SAND_GRASS[bit0 + bit1*2 + bit2*4 + bit3*8];
		}

		if(result==10000) { // hack due to missing tile
			return 270;
		}
		if(result>=10002) { // hack due to missing tile
			return 211;
		}
		
		return result;
	}
	  
	
	public static void main(String args[]) throws MalformedURLException {

		Map m = MapTiledJSON.loadMap(new URL("file:///C:\\Temp\\teste.map"),
				new URL("file:///C:\\Temp\\ps1.vsp"));
		  current_map = m;

		List<Point> lista = WalkPerimeter(m, 7, 4);
		  for(Point p: lista) {

			  // Place tile SAND at the specific point and adjust its neighbors
			  placeTile(m, p.x, p.y, SAND);
			  
			  //VImage img = new VImage(m.getWidth()*16, m.getHeight()*16);
			  //m.render(0, 0, img);
			  //img.copyImageToClipboard();
		  }

		  VImage img = new VImage(m.getWidth()*16, m.getHeight()*16);
		  m.render(0, 0, img);
		  img.copyImageToClipboard();
		  		
	}

	private static void placeTile(Map m, int x, int y, int type) {
		  m.settile(x, y, 0, getTile(m, type, type, type, type));

		  // Autotiling algorithm
		  // http://www.codeproject.com/Articles/106884/Implementing-Auto-tiling-Functionality-in-a-Tile-M

		  // Edges
		  m.settile(x-1, y, 0, getTile(m,
					getBit(m.gettile(x-1, y, 0), 0), type,
					getBit(m.gettile(x-1, y, 0), 2), type));

		  m.settile(x, y+1, 0, getTile(m,
					type, type,
					getBit(m.gettile(x, y+1, 0), 2),
					getBit(m.gettile(x, y+1, 0), 3)));

		  m.settile(x+1, y, 0, getTile(m,
					type, getBit(m.gettile(x+1, y, 0), 1),
					type, getBit(m.gettile(x+1, y, 0), 3)));

		  m.settile(x, y-1, 0, getTile(m,
					getBit(m.gettile(x, y-1, 0), 0),
					getBit(m.gettile(x, y-1, 0), 1),
					type, type));


		  // Corners
		  m.settile(x-1, y+1, 0, getTile(m,
					getBit(m.gettile(x-1, y+1, 0), 0),
					type,
					getBit(m.gettile(x-1, y+1, 0), 2),
					getBit(m.gettile(x-1, y+1, 0), 3)));

		  m.settile(x+1, y-1, 0, getTile(m,
					getBit(m.gettile(x+1, y-1, 0), 0),
					getBit(m.gettile(x+1, y-1, 0), 1),
					type,
					getBit(m.gettile(x+1, y-1, 0), 3)));

		  m.settile(x+1, y+1, 0, getTile(m,
					type,
					getBit(m.gettile(x+1, y+1, 0), 1),
					getBit(m.gettile(x+1, y+1, 0), 2),
					getBit(m.gettile(x+1, y+1, 0), 3)));

		  m.settile(x-1, y-1, 0, getTile(m,
					getBit(m.gettile(x-1, y-1, 0), 0),
					getBit(m.gettile(x-1, y-1, 0), 1),
					getBit(m.gettile(x-1, y-1, 0), 2),
					type));
	}
	
}
