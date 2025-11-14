/**
 * BattlePosition - Battle Position Management
 * Handles positioning of entities in battle scenes
 */

export enum SceneType {
  OPEN,
  CLOSE
}

export class SceneTypeHelper {
  private static readonly screenSizes = new Map<SceneType, number>([
    [SceneType.OPEN, 320],
    [SceneType.CLOSE, 200]
  ]);

  public static getScreenSize(sceneType: SceneType): number {
    return this.screenSizes.get(sceneType) || 320;
  }
}

enum Size {
  NANO,  MICRO, TINY, SMALL, MEDIUM, BIG, LARGE, HUGE
}

class SizeHelper {
  private static readonly sizeConfigs = new Map<Size, { maxNumOpen: number, maxNumClose: number }>([
    [Size.NANO, { maxNumOpen: 8, maxNumClose: 7 }],
    [Size.MICRO, { maxNumOpen: 7, maxNumClose: 6 }],
    [Size.TINY, { maxNumOpen: 6, maxNumClose: 5 }],
    [Size.SMALL, { maxNumOpen: 5, maxNumClose: 4 }],
    [Size.MEDIUM, { maxNumOpen: 4, maxNumClose: 3 }],
    [Size.BIG, { maxNumOpen: 3, maxNumClose: 2 }],
    [Size.LARGE, { maxNumOpen: 2, maxNumClose: 1 }],
    [Size.HUGE, { maxNumOpen: 1, maxNumClose: 1 }]
  ]);

  public static maxSize(size: Size, screenSize: number, scene: SceneType): number {
    return Math.floor(screenSize / this.maxNum(size, scene));
  }

  public static maxNum(size: Size, scene: SceneType): number {
    const config = this.sizeConfigs.get(size);
    if (!config) {
      throw new Error(`Invalid size: ${size}`);
    }

    if (scene === SceneType.OPEN) {
      return config.maxNumOpen;
    }
    return config.maxNumClose;
  }

  public static getAllSizes(): Size[] {
    return [Size.NANO, Size.MICRO, Size.TINY, Size.SMALL, Size.MEDIUM, Size.BIG, Size.LARGE, Size.HUGE];
  }
}

export class BattlePosition {
  private pos: number;

  constructor(pos: number = 0) {
    this.pos = pos;
  }

  /**
   * Calculate front row position
   */
  private static frontPosition(index: number, num: number, screenSize: number, scene: SceneType): number {
    if (num <= 0 || num > SizeHelper.maxNum(Size.NANO, scene)) {
      throw new Error(`Front row can't have ${num} objects.`);
    }
    if (index < 0 || index >= SizeHelper.maxNum(Size.NANO, scene)) {
      throw new Error(`Invalid index for front row: ${index}`);
    }

    const sizes = SizeHelper.getAllSizes();
    const sizeIndex = SizeHelper.maxNum(Size.NANO, scene) - num;
    const size = sizes[sizeIndex];

    return Math.round(SizeHelper.maxSize(size, screenSize, scene) / 2 + (index * SizeHelper.maxSize(size, screenSize, scene)));
  }

  /**
   * Get size based on width
   */
  private static getSize(wSize: number, screenSize: number, scene: SceneType): Size {
    let mSize = Size.HUGE;

    for (const size of SizeHelper.getAllSizes()) {
      if (wSize <= SizeHelper.maxSize(size, screenSize, scene) && mSize === Size.HUGE) {
        mSize = size;
      }
    }

    return mSize;
  }

  /**
   * Distribute positions for entities
   */
  public static distributePositions(wSize: number, num: number, scene: SceneType): number[] {
    const screenSize = SceneTypeHelper.getScreenSize(scene);
    const mSize = this.getSize(wSize, screenSize, scene);

    console.log(`size: ${wSize}\t${mSize}\t${screenSize}`);

    const numFrontRow = Math.min(num, SizeHelper.maxNum(mSize, scene));

    if (num > numFrontRow) {
      console.log(`Too much objects: ${num}. Max permitted: ${numFrontRow}`);
    }

    const ret: number[] = new Array(num);

    for (let i = 0; i < num; i++) {
      // 320, was Script.screen.getWidth()
      ret[i] = Math.floor((320 - screenSize) / 2) + this.frontPosition(i, num, screenSize, scene);
      console.log(`\t${i} on position ${ret[i]}`);
    }

    return ret;
  }

  // Getter/Setter for pos
  public getPos(): number {
    return this.pos;
  }

  public setPos(pos: number): void {
    this.pos = pos;
  }
}