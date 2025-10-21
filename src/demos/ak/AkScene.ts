/**
 * Ak Scene - Alex Kidd Platformer Demo
 * Port of Java AK.java with side-scrolling platformer mechanics
 * Features: Physics-based movement, multiple player states, tile-based collision
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { FPSDisplay } from '../../utils/FPSDisplay';
import { MainEngine } from '../../core/MainEngine';
import { DemoUI } from '../../utils/DemoUI';

// Enums (TypeScript equivalent of Java static enums)
enum Condition { WALK, SWIM, MOTO, SURF, HELI, FLY, STAR, ROPE }
enum Status { STOPPED, WALKING, JUMPING, FALLING, DUCKING }
enum Action { NONE, PUNCHING, TREMBLING }

export class AkScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private fpsDisplay: FPSDisplay;
  private tiledMap: any = null;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  private condition: Condition = Condition.WALK;
  private state: Status = Status.STOPPED;
  private action: Action = Action.NONE;
  private velocity: number = 0;
  private friction: number = 5;
  private vertical: number = 0;
  private alt: number = 0;

  // Player animation and collision dimensions
  private playerframe: number = 0;
  private akidd_px: number = 0;
  private akidd_py: number = 0;
  private akidd_vx: number = 0;
  private akidd_vy: number = 0;

  // Physics constants
  private static readonly SPEED: number = 3;
  private static readonly MAXJUMP: number = 48;
  private static readonly MAXVEL: number = 15;
  private static readonly FALL: number = 6;
  private static readonly GRAV_EF: number = 50;
  private static readonly GRAV: number = 5;

  // Direction constants
  private static readonly WEST: number = 0;
  private static readonly EAST: number = 1;
  private static readonly NORTH: number = 2;
  private static readonly SOUTH: number = 3;

  constructor() {
    super({ key: 'AkScene' });
  }

  preload() {
    this.load.tilemapTiledJSON('level01-map', 'src/demos/ak/level01.map.json');
    this.load.json('ak-anim', 'src/demos/ak/Ak.anim.json');

    DemoUI.createLoadingText(this, 'Loading Alex Kidd Demo...');
  }

  async init(data: { demoPath: string }) {
    MainEngine.setSystemPath(data.demoPath);
    const { config } = await MainEngine.initMainEngine();
    this.config = config;
  }

  async create() {
    this.inputManager = new InputManager(this, new ControlsConfig());
    this.fpsDisplay = new FPSDisplay(this);

    // Set FPS to 30 for Alex Kidd demo (matching original)
    this.game.loop.targetFps = 30;

    MainEngine.setCurrentScene(this, this.config);

    // Load map and initialize player
    this.tiledMap = await MainEngine.loadAndInitMap(this, 'level01.map.json', 'src/demos/ak');
    await MainEngine.mapinit(this, 'Ak.anim.json', 'src/demos/ak');

    // Set camera to follow player
    MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();

    // Create debug graphics for player rectangle
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(1000); // High depth to render on top

    this.fpsDisplay.setVisible(this.config.showFPS);
  }

   update(delta: number): void {
    this.inputManager.updateControls();
    this.fpsDisplay.update();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }
    

    this.controlKeys();

    if (this.condition == Condition.WALK || this.condition == Condition.MOTO || this.condition == Condition.SURF) {
      this.movePlayer();
    }

    const playerFrame = this.showPlayer();

    // Update player sprite frame (Phaser equivalent of screen.render/showpage)
    const player = MainEngine.getPlayer();
    if (player && player.getChr()) {
      player.setSpecframe(playerFrame);
    }

    if (player) {
      // Force entity to update its sprite position
      player.draw();
    }

    // Debug: Draw blue rectangle around player
    if (this.config.debug && player && this.debugGraphics) {
      this.debugGraphics.clear();

      // Draw simple rectangle around player sprite (32x32 frame size from Ak.anim.json)
      const rectX = this.akidd_px;
      const rectY = this.akidd_py;
      const rectWidth = this.akidd_vx;  // Frame width from Ak.anim.json
      const rectHeight = this.akidd_vy; // Frame height from Ak.anim.json
      this.debugGraphics.lineStyle(2, 0x0000ff, 1); // Blue outline
      this.debugGraphics.strokeRect(rectX, rectY, rectWidth, rectHeight);
    }

    // Update engine
    //MainEngine.updateEntities();
    //MainEngine.handleCameraTracking();

    //MainEngine.updateEngine(this.inputManager);

    // Back to menu
    if (this.inputManager.justPressed('b4')) {
      MainEngine.cleanup();
      this.scene.start('MenuScene', { config: this.config });
    }
  }

  controlKeys() {
    if (this.inputManager.right && this.inputManager.left && this.state == Status.WALKING) {
      this.state = Status.STOPPED;
      this.velocity = 0;
    }

    switch (this.condition) {
      case Condition.WALK:
        this.controlWalk();
        break;

      case Condition.SWIM:
        this.controlSwim();
        break;

      case Condition.MOTO:
        this.controlVehicle();
        this.vehicleAttack();
        break;

      case Condition.SURF:
        this.controlVehicle();
        break;

      case Condition.HELI:
      case Condition.FLY:
        this.controlSwim();
        break;

      case Condition.STAR:
        this.controlSwim();
        this.vehicleAttack();
        break;

      case Condition.ROPE:
        this.controlRope();
        break;
    }

    if (!this.inputManager.left && !this.inputManager.right && this.state == Status.WALKING && this.condition != Condition.SURF) {
      this.state = Status.STOPPED;
      this.velocity = this.friction * this.velocity / 10;
    }
  }

  // WALKING control method
  private controlWalk(): void {

    if (this.action != Action.TREMBLING) { // not trembling
      if (this.state != Status.DUCKING) {
        if (this.inputManager.right) { 
          this.velocity += 10 * AkScene.SPEED / this.friction;
          if (this.state == Status.STOPPED)
            this.state = Status.WALKING;
          if (MainEngine.getPlayer()?.getFace() != AkScene.EAST) {
            MainEngine.getPlayer()?.setFace(AkScene.EAST);
            this.velocity = this.friction * this.velocity / 10;
          }
        }
        if (this.inputManager.left) {
          this.velocity -= 10 * AkScene.SPEED / this.friction;
          if (this.state == Status.STOPPED)
            this.state = Status.WALKING;
          if (MainEngine.getPlayer()?.getFace() != AkScene.WEST) {
            MainEngine.getPlayer()?.setFace(AkScene.WEST);
            this.velocity = this.friction * this.velocity / 10;
          }
        }
      }

      if (this.inputManager.down && this.velocity == 0)
        this.state = Status.DUCKING;
      else if (!this.inputManager.down && this.state == Status.DUCKING)
        this.state = Status.STOPPED;
    }

    this.checkJumpFalling(AkScene.MAXJUMP);
    this.velocityCheck(AkScene.MAXVEL);
  }

  private controlSwim(): void {
    console.log("controlSwim - Non-implemented yet");
  }

  private controlVehicle(): void {
    console.log("controlVehicle - Non-implemented yet");
  }

  private vehicleAttack(): void {
    console.log("vehicleAttack - Non-implemented yet");
  }

  private controlRope(): void {
    console.log("controlRope - Non-implemented yet");
  }

  // Velocity check method
  private velocityCheck(maxv: number): void {
    if (this.velocity > maxv)
      this.velocity = maxv;
    if (this.velocity < -maxv)
      this.velocity = -maxv;
  }

  // Jump and falling logic
  private checkJumpFalling(MaxAlt: number): void {
    if (this.action != Action.TREMBLING && this.inputManager.up) { // not trembling and not upRope
      if (this.state != Status.JUMPING && this.state != Status.FALLING && this.getObsd(AkScene.SOUTH)) {
        this.state = Status.JUMPING;
        this.vertical = 0;
        this.alt = MaxAlt;
      }
      if (this.state == Status.JUMPING && this.alt > -20) {
        this.vertical -= this.alt / AkScene.FALL;
        if (this.vertical < -MaxAlt)
          this.vertical = -MaxAlt;
      }

      if (this.alt > 0) {
        this.alt -= AkScene.FALL;
      } else {
        this.state = Status.FALLING;
        this.alt = 0;
        this.unpress(5);
      }
    }

    // Gravity and falling logic
    if (!this.getObsd(AkScene.SOUTH) && this.state != Status.JUMPING) {
      this.state = Status.FALLING;
      if (this.vertical < AkScene.GRAV_EF)
        this.vertical += (AkScene.GRAV + 1);
    }
    if (!this.inputManager.up && this.state == Status.JUMPING) {
      this.state = Status.FALLING;
      this.alt = 0;
    }


  }

  // Obstruction detection method
  private getObsd(direction: number): boolean {
    const player = MainEngine.getPlayer();
    if (!player) return false;

    let a: number, ho: number = 0, vo: number = 0;

    if (this.condition == Condition.STAR)
      vo = 6;
    if (this.condition == Condition.MOTO || this.condition == Condition.SURF)
      ho = 4;

    if (this.condition == Condition.WALK || this.condition == Condition.MOTO || this.condition == Condition.SURF) { // normal
      if (direction == AkScene.WEST) {
        console.log("DEBUG left: Player position - X: " + player.getx() + ", Y: " + player.gety());
        for (a = 7 + vo; a < 28; a += 2) {
          if (this.tiledMap.getobspixel(player.getx() + 8,
              player.gety() + a))
            return true;
        }
      } // left
      if (direction == AkScene.EAST) {
        console.log("DEBUG right: Player position - X: " + player.getx() + ", Y: " + player.gety());
        for (a = 7 + vo; a < 28; a += 2) {
          if (this.tiledMap.getobspixel(player.getx() + 24,
              player.gety() + a))
            return true;
        }
      } // right

      if (direction == AkScene.NORTH && this.processZones() == 12)
        return false; // end of stair
      if (direction == AkScene.NORTH) {
        for (a = 11; a < 20; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a,
              (player.gety()) + (6 + vo)))
            return true;
        }
      } // up

      if (direction == AkScene.SOUTH) {
        for (a = 11 - ho; a < 20 + ho; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a,
              (player.gety()) + (28)))
            return true;
        }
      } // down
      if (direction == AkScene.SOUTH && this.condition == Condition.SURF) {
        for (a = 11 - ho; a < 20; a += 2) {
          if (this.tiledMap.getzone(((player.getx()) + a) >> 4,
              ((player.gety()) + 28) >> 4) == 6)
            return true;
        }
      }

      if (direction == 4) {
        for (a = 11; a < 20; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a - 6,
              ((player.gety()) + 28 + 6)))
            return true;
        }
      } // face0 + lack of floor
      if (direction == 5) {
        for (a = 11; a < 20; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a + 16,
              ((player.gety()) + 28 + 6)))
            return true;
        }
      } // face1 + lack of floor

    } else if (this.condition == Condition.SWIM) { // swimming
      if (direction == AkScene.WEST) {
        for (a = 12; a < 24; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + 7,
              (player.gety()) + a))
            return true;
        }
      }
      if (direction == AkScene.EAST) {
        for (a = 12; a < 24; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + 25,
              (player.gety()) + a))
            return true;
        }
      }
      if (direction == AkScene.NORTH) {
        for (a = 8; a < 22; a += 2) {
          if (this.tiledMap.getzone(((player.getx()) + a) >> 4,
              ((player.gety()) + 8) >> 4) == 6)
            return true;
        }
      }
      if (direction == AkScene.NORTH) {
        for (a = 8; a < 26; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a,
              (player.gety()) + (8)))
            return true;
        }
      }
      if (direction == AkScene.SOUTH) {
        for (a = 8; a < 26; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a,
              (player.gety()) + (25)))
            return true;
        }
      }
    }
    return false;
  }

  // Placeholder for processZones
  private processZones(): number {
    //console.log("processZones - Non-implemented yet");
    return 0;
  }

  private unpress(key: number): void {
    this.inputManager.unpress(key);
  }

  // Set player collision dimensions
  private setDimensions(px: number, py: number, vx: number, vy: number): void {
    this.akidd_px = px;
    this.akidd_py = py;
    this.akidd_vx = vx;
    this.akidd_vy = vy;
  }

  // Helper functions for movement calculations
  private abs(value: number): number {
    return Math.abs(value);
  }

  private sgn(value: number): number {
    return value > 0 ? 1 : value < 0 ? -1 : 0;
  }

  // Move player with physics
  private movePlayer(): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    // entities.get(player).incy(-wind); // Wind effect - commented out for now

    if (this.state != Status.WALKING && this.condition != Condition.MOTO && this.condition != Condition.SURF) {
      if (this.velocity > 0)
        this.velocity--;
      if (this.velocity < 0)
        this.velocity++;
    }

    // Horizontal movement
    for (let i = 0; i < this.abs(this.velocity >> 2); i++) {
      if (!this.getObsd(player.getFace())) {
        player.incx(this.sgn(this.velocity));
      }
    }

    // Jump collision with ceiling
    if (this.getObsd(AkScene.NORTH) && this.state == Status.JUMPING) {
      this.state = Status.FALLING;
      this.vertical = 0;
    }

    // Landing collision
    if (this.getObsd(AkScene.SOUTH) && this.state == Status.FALLING) {
      this.state = Status.STOPPED;
      this.vertical = 0;
      if (this.condition != Condition.MOTO && this.condition != Condition.SURF) {
        this.velocity = 0;
      }
    }

    // Jumping movement
    if (this.state == Status.JUMPING) {
      for (let i = 0; i < this.abs(this.vertical); i += AkScene.FALL) {
        if (!this.getObsd(AkScene.NORTH)) {
          player.incy(this.sgn(this.vertical));
        }
      }
    }

    // Falling movement
    if (this.state == Status.FALLING) {
      for (let i = 0; i < this.abs(this.vertical); i += AkScene.FALL) {
        if (this.sgn(this.vertical) == 1 && !this.getObsd(AkScene.SOUTH)) {
          player.incy(1);
        }
        if (this.sgn(this.vertical) == -1 && !this.getObsd(AkScene.NORTH)) {
          player.incy(-1);
        }
      }
    }
  }

  // Show player animation and set collision dimensions
  private showPlayer(): number {
    this.playerframe++;
    if (this.playerframe >= 6)
      this.playerframe = 0;

    const player = MainEngine.getPlayer();
    if (!player) return 0;

    if (this.state == Status.STOPPED) {
      if (this.condition == Condition.WALK || this.condition == Condition.FLY) { // idle
        this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
        return 1 - player.getFace();
      }
    }

    if (this.state == Status.DUCKING || this.condition == Condition.STAR) { // ducking
      this.setDimensions(player.getx() + 12, player.gety() + 12, 8, 16);
      return 40 - player.getFace();
    }

    if (this.condition == Condition.WALK && this.state == Status.WALKING) { // running
      this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
      return 9 - (3 * player.getFace()) + (this.playerframe >> 1);
    }

    if (this.condition == Condition.SWIM) { // swimming
      this.setDimensions(player.getx() + 10, player.gety() + 11, 13, 12);
      return 15 - (3 * player.getFace()) + Math.floor(this.playerframe / 3);
    }

    if (this.condition == Condition.WALK && (this.state == Status.JUMPING || this.state == Status.FALLING)) {
      this.setDimensions(player.getx() + 10, player.gety() + 8, 12, 20);
      return 3 - player.getFace();
    }

    return 0;
  }

}