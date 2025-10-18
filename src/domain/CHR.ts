/**
 * CHR (Character) System
 * TypeScript port of Java CHR.java - handles sprite animations and rendering
 * Loads animation data from JSON and manages frame sequences
 */

export interface CHRData {
  totalframes: number;
  fxsize: number;
  fysize: number;
  hx: number;
  hy: number;
  hw: number;
  hh: number;
  idle: number[];
  animbuf: (string | null)[];
  imageName: string;
  columns: number;
  spacing: number;
}

export class CHR {
  private totalframes: number = 0;
  private fxsize: number = 16;
  private fysize: number = 32;
  private hx: number = 0;
  private hy: number = 16;
  private hw: number = 16;
  private hh: number = 16;
  private idle: number[] = [0, 0, 0, 0, 0];

  private frames: Phaser.Textures.Frame[] = [];
  private anims: number[][] = [];

  // JSON data
  private animbuf: (string | null)[] = [];
  private imageName: string = '';
  private columns: number = 1;
  private spacing: number = 1;

  /**
   * Load CHR from JSON file (like maxim.anim.json)
   */
  public static async loadChr(scene: Phaser.Scene, chrname: string, basePath: string): Promise<CHR> {
    const chr = new CHR();

    try {
      // Load the JSON animation data
      const animName = chrname.replace('.chr', '.anim.json').replace('.CHR', '.anim.json');
      const response = await fetch(`${basePath}/${animName}`);

      if (!response.ok) {
        console.error(`Failed to load CHR: ${animName}`);
        return chr;
      }

      const data: CHRData = await response.json();
      chr.loadFromData(data);

      // Load the sprite image if not already loaded
      const imageKey = `chr-${data.imageName.replace('.png', '')}`;
      if (!scene.textures.exists(imageKey)) {
        // Load image with transparency support for magenta (255, 0, 255)
        scene.load.image(imageKey, `${basePath}/${data.imageName}`);

        // Wait for the image to load
        await new Promise<void>((resolve) => {
          const onComplete = () => {
            scene.load.off('complete', onComplete);
            resolve();
          };
          scene.load.on('complete', onComplete);
          scene.load.start();
        });
      }

      // Extract frames from the sprite sheet
      chr.extractFrames(scene, imageKey);

      console.log(`CHR loaded: ${chrname}`, {
        totalframes: chr.totalframes,
        size: `${chr.fxsize}x${chr.fysize}`,
        animations: chr.anims.length,
        imageKey: imageKey
      });

    } catch (error) {
      console.error('Error loading CHR:', error);
    }

    return chr;
  }

  /**
   * Load CHR data from JSON structure
   */
  private loadFromData(data: CHRData): void {
    this.totalframes = data.totalframes;
    this.fxsize = data.fxsize;
    this.fysize = data.fysize;
    this.hx = data.hx;
    this.hy = data.hy;
    this.hw = data.hw;
    this.hh = data.hh;
    this.idle = data.idle;
    this.animbuf = data.animbuf;
    this.imageName = data.imageName;
    this.columns = data.columns;
    this.spacing = data.spacing;

    // Parse animations from animbuf strings
    this.parseAnimations();
  }

  /**
   * Parse animation strings like "F2W10F3W15" into frame arrays
   */
  private parseAnimations(): void {
    this.anims = [];

    for (let i = 0; i < this.animbuf.length; i++) {
      const animStr = this.animbuf[i];
      if (animStr === null || animStr === undefined) {
        this.anims[i] = [0]; // Default idle frame
        continue;
      }

      const totalLength = this.getAnimLength(animStr);
      this.anims[i] = new Array(totalLength === 0 ? 1 : totalLength);
      this.parseAnimation(i, animStr);
    }
  }

  /**
   * Parse single animation string into frame array
   */
  private parseAnimation(animIndex: number, parsestr: string): void {
    if (!parsestr) return;

    let frame = 0;
    let ofs = 0;
    let parsecount = 0;

    while (parsecount < parsestr.length) {
      const char = parsestr.charAt(parsecount).toLowerCase();

      switch (char) {
        case 'f':
          parsecount++;
          frame = this.getArg(parsestr.substring(parsecount));
          parsecount += frame.toString().length;
          break;

        case 'w':
          parsecount++;
          const len = this.getArg(parsestr.substring(parsecount));
          for (let i = ofs; i < ofs + len; i++) {
            this.anims[animIndex][i] = frame;
          }
          ofs += len;
          parsecount += len.toString().length;
          break;

        default:
          console.error(`CHR::ParseAnimation() - invalid command: ${char}`);
          return;
      }
    }
  }

  /**
   * Get total length of animation string
   */
  private getAnimLength(parsestr: string): number {
    if (!parsestr) return 0;

    let length = 0;
    let parsecount = 0;

    while (parsecount < parsestr.length) {
      const char = parsestr.charAt(parsecount).toLowerCase();

      switch (char) {
        case 'f':
          parsecount++;
          const frame = this.getArg(parsestr.substring(parsecount));
          parsecount += frame.toString().length;
          break;

        case 'w':
          parsecount++;
          const wait = this.getArg(parsestr.substring(parsecount));
          length += wait;
          parsecount += wait.toString().length;
          break;

        default:
          console.error(`CHR::GetAnimLength() - invalid command: ${char}`);
          return 0;
      }
    }

    return length;
  }

  /**
   * Extract numeric argument from string
   */
  private getArg(str: string): number {
    let result = '';
    let parsecount = 0;

    // Skip whitespace
    while (parsecount < str.length && str.charAt(parsecount) === ' ') {
      parsecount++;
    }

    // Extract digits
    while (parsecount < str.length &&
           str.charAt(parsecount) >= '0' &&
           str.charAt(parsecount) <= '9') {
      result += str.charAt(parsecount++);
    }

    return result.trim() === '' ? 0 : parseInt(result);
  }

  /**
   * Extract frames from sprite sheet texture
   */
  private extractFrames(scene: Phaser.Scene, imageKey: string): void {
    const texture = scene.textures.get(imageKey);
    this.frames = [];

    for (let i = 0; i < this.totalframes; i++) {
      const row = Math.floor(i / this.columns);
      const col = i % this.columns;

      // Add 1 pixel offset for the border at the start of the sprite sheet
      const x = 1 + col * (this.fxsize + this.spacing);
      const y = 1 + row * (this.fysize + this.spacing);

      // Create frame manually since we need specific extraction
      const frameKey = `${imageKey}_frame_${i}`;

      if (!texture.frames[frameKey]) {
        texture.add(frameKey, 0, x, y, this.fxsize, this.fysize);
      }

      this.frames[i] = texture.frames[frameKey];
    }
  }

  /**
   * Render character frame at position
   */
  public render(sprite: Phaser.GameObjects.Sprite, x: number, y: number, frame: number): void {
    if (frame < 0 || frame >= this.totalframes) {
      console.error(`CHR::render() - invalid frame ${frame} of ${this.totalframes}`);
      return;
    }

    // Set position accounting for hotspot
    sprite.setPosition(x - this.hx, y - this.hy);

    // Set the frame from our extracted frames
    const frameKey = `chr-${this.imageName.replace('.png', '')}_frame_${frame}`;

    try {
      sprite.setFrame(frameKey);
    } catch (error) {
      console.warn(`Could not set frame ${frameKey}, using frame 0`);
      const fallbackKey = `chr-${this.imageName.replace('.png', '')}_frame_0`;
      sprite.setFrame(fallbackKey);
    }
  }

  /**
   * Get frame for direction and animation counter
   */
  public getFrame(direction: number, framect: number): number {
    if (direction < 0 || direction >= this.anims.length) {
      console.error(`CHR::getFrame() - invalid direction ${direction}`);
      return 0;
    }

    if (this.anims[direction].length === 0) {
      return 0;
    }

    return this.anims[direction][framect % this.anims[direction].length];
  }

  /**
   * Get animation size for direction
   */
  public getAnimSize(animIndex: number): number {
    if (animIndex < 0 || animIndex >= this.anims.length) {
      console.error(`CHR::getAnimSize() - invalid direction ${animIndex}`);
      return 0;
    }

    return this.anims[animIndex].length;
  }

  // Getters
  public getTotalframes(): number { return this.totalframes; }
  public getFxsize(): number { return this.fxsize; }
  public getFysize(): number { return this.fysize; }
  public getHx(): number { return this.hx; }
  public getHy(): number { return this.hy; }
  public getHw(): number { return this.hw; }
  public getHh(): number { return this.hh; }
  public getImageName(): string { return this.imageName; }
}