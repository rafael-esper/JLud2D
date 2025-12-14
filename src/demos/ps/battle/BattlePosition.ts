/**
 * BattlePosition - Battle Enemy Positioning System
 * TypeScript port of BattlePosition.java - Calculates enemy positions based on size and scene type
 */

export enum SceneType {
  OPEN = 320,
  CLOSE = 200
}

enum Size {
  NANO = 'NANO',
  MICRO = 'MICRO',
  TINY = 'TINY',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  BIG = 'BIG',
  LARGE = 'LARGE',
  HUGE = 'HUGE'
}

interface SizeConfig {
  maxNumOpen: number;
  maxNumClose: number;
}

const SIZE_CONFIG: Record<Size, SizeConfig> = {
  [Size.NANO]: { maxNumOpen: 8, maxNumClose: 7 },
  [Size.MICRO]: { maxNumOpen: 7, maxNumClose: 6 },
  [Size.TINY]: { maxNumOpen: 6, maxNumClose: 5 },
  [Size.SMALL]: { maxNumOpen: 5, maxNumClose: 4 },
  [Size.MEDIUM]: { maxNumOpen: 4, maxNumClose: 3 },
  [Size.BIG]: { maxNumOpen: 3, maxNumClose: 2 },
  [Size.LARGE]: { maxNumOpen: 2, maxNumClose: 1 },
  [Size.HUGE]: { maxNumOpen: 1, maxNumClose: 1 }
};

export class BattlePosition {
  /**
   * Get maximum size for a given screen size and scene type
   */
  private static maxSize(size: Size, screenSize: number, scene: SceneType): number {
    return screenSize / this.maxNum(size, scene);
  }

  /**
   * Get maximum number for a given scene type
   */
  private static maxNum(size: Size, scene: SceneType): number {
    const config = SIZE_CONFIG[size];
    return scene === SceneType.OPEN ? config.maxNumOpen : config.maxNumClose;
  }

  /**
   * Calculate front row position for given parameters
   */
  private static frontPosition(index: number, num: number, screenSize: number, scene: SceneType): number {
    const maxNumAllowed = this.maxNum(Size.NANO, scene);

    if (num <= 0 || num > maxNumAllowed) {
      throw new Error(`Front row can't have ${num} objects.`);
    }
    if (index < 0 || index >= maxNumAllowed) {
      throw new Error(`Invalid index for front row: ${index}`);
    }

    // Get appropriate size enum for the number of enemies
    const sizeIndex = maxNumAllowed - num;
    const sizeValues = Object.values(Size);
    const size = sizeValues[sizeIndex];

    const maxSizeValue = this.maxSize(size, screenSize, scene);
    return Math.round(maxSizeValue / 2 + (index * maxSizeValue));
  }

  /**
   * Get appropriate size enum for given width and scene parameters
   */
  private static getSize(wSize: number, screenSize: number, scene: SceneType): Size {
    let mSize = Size.HUGE;

    for (const size of Object.values(Size)) {
      if (wSize <= this.maxSize(size, screenSize, scene) && mSize === Size.HUGE) {
        mSize = size;
      }
    }

    return mSize;
  }

  /**
   * Distribute positions for enemies based on their size and scene type
   * Main public method that calculates enemy positions
   */
  public static distributePositions(wSize: number, num: number, scene: SceneType): number[] {
    const mSize = this.getSize(wSize, scene, scene);
    console.log(`BattlePosition: size: ${wSize}\t${mSize}\t${scene}`);

    const maxAllowed = this.maxNum(mSize, scene);
    const numFrontRow = Math.min(num, maxAllowed);

    if (num > numFrontRow) {
      console.log(`BattlePosition: Too many objects: ${num}. Max permitted: ${numFrontRow}`);
    }

    const ret: number[] = new Array(num);

    for (let i = 0; i < num; i++) {
      // Calculate position with screen centering
      ret[i] = ((320 - scene) / 2) + this.frontPosition(i, num, scene, scene);
      console.log(`\tBattlePosition: ${i} on position ${ret[i]}`);
    }

    return ret;
  }

  /**
   * Test method for position distribution (equivalent to Java main method)
   */
  public static test(): void {
    const scene = SceneType.OPEN;

    console.log("Testing BattlePosition distribution:");

    // Test various enemy sizes and quantities
    const testCases = [
      { size: 40, num: 9 },
      { size: 48, num: 9 },
      { size: 64, num: 8 },
      { size: 64, num: 7 },
      { size: 64, num: 6 },
      { size: 64, num: 5 },
      { size: 64, num: 4 },
      { size: 64, num: 3 },
      { size: 64, num: 2 },
      { size: 64, num: 1 },
      { size: 80, num: 4 },
      { size: 80, num: 3 },
      { size: 80, num: 2 },
      { size: 80, num: 1 },
      { size: 100, num: 1 },
      { size: 155, num: 3 },
      { size: 270, num: 1 }
    ];

    for (const testCase of testCases) {
      console.log(`\n--- Testing size: ${testCase.size}, num: ${testCase.num} ---`);
      this.distributePositions(testCase.size, testCase.num, scene);
    }
  }
}