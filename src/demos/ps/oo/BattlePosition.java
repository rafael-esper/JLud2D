package demos.ps.oo;

import core.Script;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class BattlePosition {

	private static final Logger log = LogManager.getLogger(BattlePosition.class);
	
	public enum SceneType {OPEN (320), CLOSE (200); 
	
		int screenSize;
		
		SceneType(int size) {
			this.screenSize = size;
		}
		public int getScreenSize() {
			return this.screenSize;
		}
	};
	
	enum Size { // how much it is comported on OPEN and CLOSE scenes
		NANO (8, 7), MICRO (7, 6), TINY(6, 5), SMALL(5, 4), MEDIUM(4, 3), BIG(3, 2), LARGE(2, 1), HUGE(1, 1);
		
		private int maxNumOpen;
		private int maxNumClose;
		private Size(int maxOpen, int maxClose) {
			this.maxNumOpen = maxOpen;
			this.maxNumClose = maxClose;
		}
		public int maxSize(int screenSize, SceneType scene) {
			return screenSize / maxNum(scene);
		}
		public int maxNum(SceneType scene) {
			if(scene.equals(SceneType.OPEN)) {
				return this.maxNumOpen;
			}
			return this.maxNumClose;
		}
		
	};

	private static int frontPosition(int index, int num, int screenSize, SceneType scene) {
		if(num <= 0 || num > Size.NANO.maxNum(scene)) {
			throw new IllegalArgumentException("Front row can't have " + num + " objects.");
		}
		if(index < 0 || index >= Size.NANO.maxNum(scene)) {
			throw new IllegalArgumentException("Invalid index for front row: " + index);
		}
		
		Size size = Size.values()[Size.NANO.maxNum(scene)-num];
		return Math.round(size.maxSize(screenSize, scene) /2 + (index * size.maxSize(screenSize, scene)));
	}	
	
	private static Size getSize(int wSize, int screenSize, SceneType scene) {
		Size mSize = Size.HUGE;
		for(Size size: Size.values()) {
			if(wSize <= size.maxSize(screenSize, scene) && mSize.equals(Size.HUGE)) {
				mSize = size;
			}
		}
		return mSize;
	}	
	
	public static int[] distributePositions(int wSize, int num, SceneType scene) {
		Size mSize = getSize(wSize, scene.getScreenSize(), scene);
		log.info("size: " + wSize + "\t" + mSize + "\t" + scene.getScreenSize());
		
		int numFrontRow = Math.min(num, mSize.maxNum(scene));
		
		if(num > numFrontRow) {
			log.info("Too much objects: " + num + ". Max permitted: " + (numFrontRow));
		}
		
		int[] ret = new int[num];
		
		for(int i=0; i<num; i++) {
			// 320, was Script.screen.getWidth()
			ret[i] = ((320 - scene.getScreenSize()) /2) +  frontPosition(i, num, scene.getScreenSize(), scene);
			log.info("\t" + i + " on position " + ret[i]);
		}
		
		return ret;
	}
	

	int pos;
	
	public static void main(String args[]) {

		// 1:	160 (50%) 												-> Up to 320 total size
		// 2:	 80 (25%), 240 (75%)									-> Up to 160 total size
		// 3:	 53	(xx%), 160 (xx%), 266 (xx%)							-> Up to 106 total size 
		// 4:	 40 (xx%), 120 (xx%), 200 (xx%), 280 (xx%)				-> Up to 80 total size
		// 5:	 32 (xx%),  96 (xx%), 160 (xx%), 224 (xx%), 288 (xx%) 	-> Up to 64 total size
		
		/*log.info(Size.TINY.maxSize(320));	// 5 + 4	= 9
		log.info(Size.SMALL.maxSize(320));	// 4 + 3	= 7
		log.info(Size.MEDIUM.maxSize(320));	// 3 + 2	= 5
		log.info(Size.BIG.maxSize(320));		// 2 + 1	= 3
		log.info(Size.HUGE.maxSize(320));		// 1 + 0	= 1*/
		
		/*for(int i=1; i<=320; i++) {
			distributePositions(i, 0, 320);
		}*/
		SceneType scene = SceneType.OPEN;
		
		distributePositions(40, 9,scene);
		distributePositions(48, 9,scene);
		distributePositions(64, 9,scene);
		distributePositions(64, 8,scene);
		distributePositions(64, 7,scene);
		distributePositions(64, 6,scene);
		distributePositions(64, 5,scene);
		distributePositions(64, 4,scene);
		distributePositions(64, 3,scene);
		distributePositions(64, 2,scene);
		distributePositions(64, 1,scene);
		
		distributePositions(80, 4,scene);
		distributePositions(80, 3,scene);
		distributePositions(80, 2,scene);
		distributePositions(80, 1,scene);
		
		distributePositions(100, 1,scene);
		
		distributePositions(155, 3,scene);
		
		distributePositions(270, 1,scene);
		
	}
	
	/*
1-2-3-4
5-6-7-8-9


Open	9/7/5/3/1	= 4-5, 3-4, 2-3, 1-2, 1
Dung	7/5/3/1/0	= 3-4, 2-3, 1-2, 1

Open	Tiny/Small/Medium/Big/Huge
Dung	Tiny/Small/Medium/Big/None

isBackRow()
isFrontRow()
	 */
}
