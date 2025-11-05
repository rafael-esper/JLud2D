/**
 * AkMovement - Movement system for Alex Kidd
 * Handles player movement, physics, and collision detection
 */

import { InputManager } from '../../config/Controls';
import { MainEngine } from '../../core/MainEngine';
import { AkActions } from './AkActions';
import { AkCore } from './AkCore';

// Enums for movement system
export enum Condition { WALK, SWIM, MOTO, SURF, HELI, FLY, STAR, ROPE }
export enum Status { STOPPED, WALKING, JUMPING, FALLING, DUCKING }
export enum Action { NONE, PUNCHING, TREMBLING }

export class AkMovement {
  // Movement physics state (keep these in AkMovement as they're physics-specific)
  private velocity: number = 0;
  private friction: number = 5;
  private vertical: number = 0;
  private alt: number = 0;

  // Zone tracking
  private static zonecalled: number = 0;
  private tdelay: number = 0;

  // Debug/cheat variables
  private gameSpeed: number = 1.0; // Default speed (normal)

  // Physics constants
  private static readonly SPEED: number = 3;
  private static readonly MAXJUMP: number = 48;
  private static readonly MAXVEL: number = 15;
  private static readonly FALL: number = 6;
  private static readonly GRAV_EF: number = 40;
  private static readonly GRAV: number = 4;

  // Swimming/Flying/Vehicle constants
  private static readonly MAXSWIM: number = 8;
  private static readonly MAXRSWIM: number = 12;  // Fast swimming when punching
  private static readonly MAXHELI: number = 10;
  private static readonly MAXFLY: number = 6;
  private static readonly MAXSTAR: number = 14;

  // Vehicle constants
  private static readonly MINMOTO: number = 12;
  private static readonly MAXMOTO: number = 26;
  private static readonly ALTMOTO: number = 56; // max jumping height with moto
  private static readonly MINSURF: number = 10;
  private static readonly MAXSURF: number = 25;
  private static readonly ALTSURF: number = 50;

  // Direction constants
  private static readonly WEST: number = 0;
  private static readonly EAST: number = 1;
  private static readonly NORTH: number = 2;
  private static readonly SOUTH: number = 3;

  private tiledMap: any;
  private inputManager: InputManager;

  constructor(tiledMap: any, inputManager: InputManager) {
    this.tiledMap = tiledMap;
    this.inputManager = inputManager;
  }

  // Getters and setters for state - delegate to AkCore
  getCondition(): Condition { return AkCore.getCondition(); }
  setCondition(condition: Condition): void { AkCore.setCondition(condition); }

  getState(): Status { return AkCore.getState(); }
  setState(state: Status): void { AkCore.setState(state); }

  getAction(): Action { return AkCore.getAction(); }
  setAction(action: Action): void { AkCore.setAction(action); }

  getVelocity(): number { return this.velocity; }
  getGameSpeed(): number { return this.gameSpeed; }
  setVelocity(velocity: number): void { this.velocity = velocity; }

  getFriction(): number { return this.friction; }
  getVertical(): number { return this.vertical; }
  getAlt(): number { return this.alt; }

  // Debug getters
  getGameSpeed(): number { return this.gameSpeed; }
  static getDebug(): boolean { return AkCore.getDebug(); }
  static getInvencible(): number { return AkCore.getInvincible(); }

  // Debug setters - delegate to AkCore
  static setDebug(value: boolean): void { AkCore.setDebug(value); }
  static setInvencible(value: number): void { AkCore.setInvincible(value); }

  // Main movement update method
  update(): void {
    // Decrement invincibility frames
    AkCore.decrementInvincible();

    if (this.getCondition() == Condition.WALK || this.getCondition() == Condition.MOTO || this.getCondition() == Condition.SURF) {
      this.movePlayer();
    } else if (this.getCondition() == Condition.SWIM || this.getCondition() == Condition.HELI || this.getCondition() == Condition.FLY || this.getCondition() == Condition.STAR) {
      this.movePlayerSwim();
    }
  }

  // Control input processing
  processControls(): void {
    // Process debug controls first
    this.processDebugControls();

    if (this.inputManager.right && this.inputManager.left && this.getState() == Status.WALKING) {
      this.setState(Status.STOPPED);
      this.velocity = 0;
    }

    this.processZones();

    switch (this.getCondition()) {
      case Condition.WALK:
        this.controlWalk();
        break;

      case Condition.SWIM:
        this.controlSwim();
        break;

      case Condition.MOTO:
        this.controlVehicle(AkMovement.MINMOTO, AkMovement.MAXMOTO, AkMovement.ALTMOTO);
        this.vehicleAttack();
        break;

      case Condition.SURF:
        this.controlVehicle(AkMovement.MINSURF, AkMovement.MAXSURF, AkMovement.ALTSURF);
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

    // Handle punch controls after condition switch
    const punchResult = AkActions.handlePunchControls(
      this.getCondition(),
      this.inputManager.justPressed('b1'),
      this.inputManager.left,
      this.inputManager.right,
      this.getState(),
      this.velocity,
      this.friction,
      this.getAction()
    );

    this.setState(punchResult.state);
    this.velocity = punchResult.velocity;
    this.setAction(punchResult.action);

    if (!this.inputManager.left && !this.inputManager.right && this.getState() == Status.WALKING && this.getCondition() != Condition.SURF) {
      this.setState(Status.STOPPED);
      this.velocity = this.friction * this.velocity / 10;
    }

    // Handle trembling action
    if (this.getAction() == Action.TREMBLING || this.tdelay > 0) {
      this.tremble();
    }
  }

  // WALKING control method
  private controlWalk(): void {
    if (this.getAction() != Action.TREMBLING) { // not trembling
      if (this.getState() != Status.DUCKING) {
        if (this.inputManager.right) {
          this.velocity += 10 * AkMovement.SPEED / this.friction;
          if (this.getState() == Status.STOPPED)
            this.setState(Status.WALKING);
          if (MainEngine.getPlayer()?.getFace() != AkMovement.EAST) {
            MainEngine.getPlayer()?.setFace(AkMovement.EAST);
            this.velocity = this.friction * this.velocity / 10;
          }
        }
        if (this.inputManager.left) {
          this.velocity -= 10 * AkMovement.SPEED / this.friction;
          if (this.getState() == Status.STOPPED)
            this.setState(Status.WALKING);
          if (MainEngine.getPlayer()?.getFace() != AkMovement.WEST) {
            MainEngine.getPlayer()?.setFace(AkMovement.WEST);
            this.velocity = this.friction * this.velocity / 10;
          }
        }
      }

      if (this.inputManager.down && Math.abs(this.velocity) < 1)
        this.setState(Status.DUCKING);
      else if (!this.inputManager.down && this.getState() == Status.DUCKING)
        this.setState(Status.STOPPED);
    }

    this.checkJumpFalling(AkMovement.MAXJUMP);
    this.velocityCheck(AkMovement.MAXVEL);
  }

  private controlSwim(): void {
    // SWIMMING, HELI AND STAR control (ported from Java)
    if (this.getAction() == Action.TREMBLING)
      return;

    const player = MainEngine.getPlayer();
    if (!player) return;

    // Right movement
    if (this.inputManager.right) {
      this.velocity += AkMovement.SPEED;
      if (player.getFace() != AkMovement.EAST) {
        player.setFace(AkMovement.EAST);
        this.velocity = this.velocity >> 2;
      }
    }

    // Left movement
    if (this.inputManager.left) {
      this.velocity -= AkMovement.SPEED;
      if (player.getFace() != AkMovement.WEST) {
        player.setFace(AkMovement.WEST);
        this.velocity = this.velocity >> 2;
      }
    }

    // Up movement
    if (this.inputManager.up) {
      this.vertical -= 2; // condition.ordinal() / 2 in Java
    }

    // Down movement
    if (this.inputManager.down) {
      if (this.getCondition() == Condition.SWIM || this.getCondition() == Condition.FLY)
        this.vertical += 2;
      if (this.getCondition() == Condition.HELI)
        this.vertical++;
      if (this.getCondition() == Condition.STAR)
        this.vertical += 3;
    }

    // Velocity decay when not pressing movement keys
    if (!this.inputManager.right && this.velocity > 0)
      this.velocity--;
    if (!this.inputManager.left && this.velocity < 0)
      this.velocity++;
    if (!this.inputManager.up && this.vertical < 0)
      this.vertical = 0;

    // Destroy helicopter if obstacle over it
    if (this.getCondition() == Condition.HELI && this.getObsd(AkMovement.NORTH)) {
      AkActions.addSprite(player.getx() - 24 + player.getFace() * 32, player.gety(), 4);
      this.setNormalCondition(Condition.WALK);
      this.setState(Status.JUMPING);
      player.incy(16);
      return;
    }

    // Swimming specific logic
    if (this.getCondition() == Condition.SWIM) {
      if (this.vertical <= -3)
        this.vertical = -2;
      if (!this.inputManager.down && this.vertical > 0)
        this.vertical--;
      if (this.inputManager.b1 && this.getAction() == Action.NONE)
        this.velocityCheck(AkMovement.MAXRSWIM);
      else
        this.velocityCheck(AkMovement.MAXSWIM);
    }
    // Helicopter logic
    else if (this.getCondition() == Condition.HELI) {
      this.velocityCheck(AkMovement.MAXHELI);
    }
    // Flying logic
    else if (this.getCondition() == Condition.FLY) {
      this.velocityCheck(AkMovement.MAXFLY);
      this.vertical = this.sgn(this.vertical);
    }
    // Star logic
    else if (this.getCondition() == Condition.STAR) {
      this.velocityCheck(AkMovement.MAXSTAR);
    }

    // Vertical limits
    if (this.vertical > 3)
      this.vertical = 3;
    if (this.vertical < -3)
      this.vertical = -3;
  }

  private vehicleAttack(): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    let punchResult: { zone: number, actualZx: number, actualZy: number };
    const HoOffset1 = player.getFace() * 32;
    const HoOffset2 = player.getFace() * 40;

    // Calculate zone coordinates for first check
    const zx1 = (player.getx() + HoOffset1) >> 4;
    const zy1 = (player.gety() + 16) >> 4;

    punchResult = AkActions.getpunch(HoOffset1, this.getCondition(), zx1, zy1);

    if (punchResult.zone == 0) {
      // Calculate zone coordinates for second check
      const zx2 = (player.getx() + HoOffset2) >> 4;
      const zy2 = (player.gety() + 16) >> 4;
      punchResult = AkActions.getpunch(HoOffset2, this.getCondition(), zx2, zy2);
    }

    if (punchResult.zone >= 3 && punchResult.zone <= 8) { // Events processed by the vehicle (Rock=3, Star=4, Rice=5, Swim=6, Item=7, Skull=8)
      AkActions.callEvent(punchResult.zone, punchResult.actualZx, punchResult.actualZy);
    }
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
    if (this.getAction() != Action.TREMBLING && this.inputManager.up) { // not trembling and not upRope
      if (this.getState() != Status.JUMPING && this.getState() != Status.FALLING && this.getObsd(AkMovement.SOUTH)) {
        this.setState(Status.JUMPING);
        this.vertical = 0;
        this.alt = MaxAlt;
      }
      if (this.getState() == Status.JUMPING && this.alt > -20) {
        this.vertical -= this.alt / AkMovement.FALL;
        if (this.vertical < -MaxAlt)
          this.vertical = -MaxAlt;
      }

      if (this.alt > 0) {
        this.alt -= AkMovement.FALL;
      } else {
        this.setState(Status.FALLING);
        this.alt = 0;
        this.unpress(5);
      }
    }

    // Gravity and falling logic
    if (!this.getObsd(AkMovement.SOUTH) && this.getState() != Status.JUMPING) {
      this.setState(Status.FALLING);
      if (this.vertical < AkMovement.GRAV_EF)
        this.vertical += (AkMovement.GRAV + 1);
    }
    if (!this.inputManager.up && this.getState() == Status.JUMPING) {
      this.setState(Status.FALLING);
      this.alt = 0;
    }
  }

  // Obstruction detection method
  getObsd(direction: number): boolean {
    const player = MainEngine.getPlayer();
    if (!player) return false;

		let startX = 8;
		let startY = 6;
		let endX = startX + 16;
		let endY = startY + 22; 

		if(this.getCondition() == Condition.SWIM) { // FIXME Swim Zone NORTH
			startX-=2; endX+=1;
			startY+=3; endY-=3;
		}
		
		if(this.getCondition() == Condition.HELI) {
			startX-=2; endX+=4;
			startY--; endY+=9;			
		}

    let tolerance = 1;

		if (direction == AkMovement.WEST) {
			for (let py = startY + tolerance; py < endY - tolerance; py += 2) {
				if (this.tiledMap.getobspixel((player.getx() + startX), player.gety() + py))
					return true;
			}
		} // left
		if (direction == AkMovement.EAST) {
			for (let py = startY + tolerance; py < endY - tolerance; py += 2) {
				if (this.tiledMap.getobspixel((player.getx() + endX), player.gety() + py))
					return true;
			}
		} // right

		if (direction == AkMovement.NORTH) {
			for (let px = startX + tolerance; px < endX - tolerance; px += 2) {
				if (this.tiledMap.getobspixel((player.getx() + px), player.gety() + startY))
					return true;
				if(this.tiledMap.getzone((player.getx() + px)>>4, (player.gety() + startY)>>4) == AkActions.ZONE_SWIM)
					return true;
			}
		} // up

		if (direction == AkMovement.SOUTH) {
			for (let px = startX + tolerance; px < endX - tolerance; px += 2) {
				if (this.tiledMap.getobspixel((player.getx() + px), player.gety() + endY))
					return true;
			}
		} // down

		return false;
  }

  // Process zones method (ported from Java)
  private processZones(): number {

    const player = MainEngine.getPlayer();
    const currentMap = MainEngine.getCurrentMap();

    if (!player || !currentMap) {
      return 0;
    }

    let c: number = 0, z: number = 0;
    let zx: number, zy: number;

    if (this.getCondition() == Condition.WALK)
      c = 8; // walking
    if (this.getCondition() == Condition.SWIM)
      c = 12; // swimming

    for (let a = 13; a < 17; a += 2) {
      for (let b = c; b < 26; b += 2) {
        zx = (player.getx() + a) >> 4;
        zy = (player.gety() + b) >> 4;
        if (this.getAction() == Action.PUNCHING)
          zx = (player.getx() + a + 8) >> 4;
        z = currentMap.getzone(zx, zy);

        if (z != 0 && AkMovement.zonecalled != z) {
          AkMovement.zonecalled = z;
          const resultAction = AkActions.callEvent(z, zx, zy);
          if (resultAction) {
            this.setAction(resultAction);
          }
          return z;
        }
        if (z == 0 && AkMovement.zonecalled != 0) {
          AkMovement.zonecalled = 0;
        }
      }
    }

    return z;
  }

  private unpress(key: number): void {
    this.inputManager.unpress(key);
  }

  // Process debug controls (ported from Java)
  private processDebugControls(): void {
    // Game speed controls (1-5 keys)
    if (this.inputManager.justPressed('1')) {
      this.gameSpeed = 0.35;
      console.log("Game speed set to 0.35x");
    }
    if (this.inputManager.justPressed('2')) {
      this.gameSpeed = 0.50;
      console.log("Game speed set to 0.50x");
    }
    if (this.inputManager.justPressed('3')) {
      this.gameSpeed = 0.75;
      console.log("Game speed set to 0.75x");
    }
    if (this.inputManager.justPressed('4')) {
      this.gameSpeed = 1.00;
      console.log("Game speed set to 1.00x (normal)");
    }
    if (this.inputManager.justPressed('5')) {
      this.gameSpeed = 1.25;
      console.log("Game speed set to 1.25x");
    }

    // Debug mode toggle (O key)
    if (this.inputManager.justPressed('O')) {
      AkMovement.debug = !AkMovement.debug;
      console.log(`Debug mode ${AkMovement.debug ? 'activated' : 'deactivated'}`);
    }

    // Enable bracelet (B key)
    if (this.inputManager.justPressed('B')) {
      AkCore.setHasBrac(true);
      console.log("Bracelet enabled");
    }

    // Fly condition (F key)
    if (this.inputManager.justPressed('F')) {
      this.setCondition(Condition.FLY);
      this.setState(Status.STOPPED);
      console.log("Fly condition activated");
    }

    // Helicopter condition (H key)
    if (this.inputManager.justPressed('H')) {
      this.setCondition(Condition.HELI);
      console.log("Helicopter condition activated");
      MainEngine.playmusic('swim');
    }

    // Invincibility (I key)
    if (this.inputManager.justPressed('I')) {
      AkMovement.invencible = 100000;
      console.log("Invincibility activated");
    }

    // Motorcycle condition (J key)
    if (this.inputManager.justPressed('J')) {
      this.setCondition(Condition.SWIM);
      console.log("Swim condition activated");
      MainEngine.playmusic('swim');
    }

    // Kill player (K key)
    if (this.inputManager.justPressed('K')) {
      console.log("Kill player triggered");
      // TODO: hitPlayer(2)
    }

    // Level menu (L key)
    if (this.inputManager.justPressed('L')) {
      console.log("Level menu triggered");
      // TODO: Prog = selectLevelMenu(6, 4); DoLevel();
    }

    // Motorcycle condition (M key)
    if (this.inputManager.justPressed('M')) {
      this.setCondition(Condition.MOTO);
      console.log("Motorcycle condition activated");
      MainEngine.playmusic('moto');
    }

    // Normal condition with gold (N key)
    if (this.inputManager.justPressed('N')) {
      AkCore.addGold(200);
      this.setNormalCondition(Condition.WALK);
      console.log(`Normal condition with +200 gold. Total: ${AkCore.getGold()}`);
    }

    // Print/screenshot (P key)
    if (this.inputManager.justPressed('P')) {
      console.log("Screenshot triggered");
      // TODO: Implement screenshot functionality
      // Original: copyimagetoclipboard(screen) or VImage implementation
    }

    // Star condition (T key, using T instead of S since S conflicts with movement)
    if (this.inputManager.justPressed('T')) {
      this.setCondition(Condition.STAR);
      console.log("Star condition activated");
    }
  }

  // Helper method to set normal condition
  public setNormalCondition(newCondition: Condition): void {
    MainEngine.stopmusic();
    // TODO: unpress(0);
    AkCore.setNormalCondition(newCondition);
    this.setState(Status.STOPPED);
    this.setAction(Action.NONE);
    this.vertical = 0;
    this.alt = 0;
    AkCore.setHasBrac(false);

    const player = MainEngine.getPlayer();
    if (player) {
      player.setFace(AkMovement.EAST);
    }

    this.velocity = 0;
    AkActions.resetPunchDelay(); // pdelay = 0
    AkActions.setTdelay(0); // tdelay = 0

    // Play default field music when returning to normal condition
    MainEngine.playmusic('field');
  }

  // Trembling action (ported from Java)
  private tremble(): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    this.velocity = 0;
    this.setAction(Action.TREMBLING);
    this.tdelay++;

    if (this.tdelay % 2 == 0)
      player.incx(1);
    else
      player.incx(-1);

    if (this.tdelay >= 30) {
      this.tdelay = 0;
      if (this.getAction() == Action.TREMBLING)
        this.setAction(Action.NONE);
    }
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

    if (this.getState() != Status.WALKING && this.getCondition() != Condition.MOTO && this.getCondition() != Condition.SURF) {
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
    if (this.getObsd(AkMovement.NORTH) && this.getState() == Status.JUMPING) {
      this.setState(Status.FALLING);
      this.vertical = 0;
    }

    // Landing collision
    if (this.getObsd(AkMovement.SOUTH) && this.getState() == Status.FALLING) {
      this.setState(Status.STOPPED);
      this.vertical = 0;
      if (this.getCondition() != Condition.MOTO && this.getCondition() != Condition.SURF) {
        this.velocity = 0;
      }
    }

    // Jumping movement
    if (this.getState() == Status.JUMPING) {
      for (let i = 0; i < this.abs(this.vertical); i += AkMovement.FALL) {
        if (!this.getObsd(AkMovement.NORTH)) {
          player.incy(this.sgn(this.vertical));
        }
      }
    }

    // Falling movement
    if (this.getState() == Status.FALLING) {
      for (let i = 0; i < this.abs(this.vertical); i += AkMovement.FALL) {
        if (this.sgn(this.vertical) == 1 && !this.getObsd(AkMovement.SOUTH)) {
          player.incy(1);
        }
        if (this.sgn(this.vertical) == -1 && !this.getObsd(AkMovement.NORTH)) {
          player.incy(-1);
        }
      }
    }
  }

  // Move player for swimming conditions (ported from Java swimPlayer)
  private movePlayerSwim(): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    let aa: number = 0;

    // Condition-specific vertical movement
    if (this.getCondition() == Condition.SWIM && !this.getObsd(AkMovement.NORTH))
      player.incy(-1);
    if (this.getCondition() == Condition.HELI && !this.getObsd(AkMovement.SOUTH))
      player.incy(1);

    // Horizontal movement
    for (let i = 0; i < this.abs(this.velocity >> 2); i++) {
      if (!this.getObsd(player.getFace()))
        player.incx(this.sgn(this.velocity));
    }

    // Vertical movement based on vertical velocity
    if (this.vertical > 0)
      aa = AkMovement.SOUTH;
    if (this.vertical < 0)
      aa = AkMovement.NORTH;

    for (let i = 0; i < this.abs(this.vertical); i++) {
      if (!this.getObsd(aa))
        player.incy(this.sgn(this.vertical));
    }
  }

  // Vehicles: Moto and Surf (ported from Java controlVehicle)
  private controlVehicle(minVehicle: number, maxVehicle: number, altVehicle: number): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    if (this.getState() == Status.STOPPED)
      this.setState(Status.WALKING);

    if (this.velocity == 0) {
      if (player.getFace() == AkMovement.WEST)
        this.velocity = -minVehicle;
      if (player.getFace() == AkMovement.EAST)
        this.velocity = minVehicle;
    }

    if (this.inputManager.right && this.velocity > 0)
      this.velocity += AkMovement.SPEED;
    if (this.inputManager.down && this.velocity > 0)
      this.velocity -= AkMovement.SPEED;

    if (this.inputManager.down && this.velocity < 0)
      this.velocity += AkMovement.SPEED;
    if (this.inputManager.left && this.velocity < 0)
      this.velocity -= AkMovement.SPEED;

    // Invert direction
    if (this.inputManager.left && this.velocity > 0 && this.getState() == Status.WALKING) {
      this.velocity = -this.velocity;
      player.setFace(AkMovement.WEST);
    } else if (this.inputManager.right && this.velocity < 0 && this.getState() == Status.WALKING) {
      this.velocity = -this.velocity;
      player.setFace(AkMovement.EAST);
    }

    // Destroy vehicle
    if (this.getObsd(player.getFace())) {
      // Check if punch area is clear
      const HoOffset = player.getFace() * 32;
      const zx = (player.getx() + HoOffset) >> 4;
      const zy = (player.gety() + 16) >> 4;

      if (AkActions.getpunch(HoOffset, this.getCondition(), zx, zy).zone == 0) {
        // Add destruction sprite
        // TODO: addSprite equivalent
        console.log(`Vehicle destroyed at (${player.getx() - 24 + player.getFace() * 32}, ${player.gety()})`);

        if (this.getCondition() == Condition.MOTO) {
          this.setNormalCondition(Condition.WALK);
          this.setState(Status.JUMPING);
          return;
        } else {
          // Handle SURF destruction
          AkActions.callEvent(6, zx, zy); // callEvent(6)
          player.incy(24);
          return;
        }
      }
    }

    this.checkJumpFalling(altVehicle + this.abs(this.velocity) - maxVehicle);

    // Limit max Speed
    if (this.abs(this.velocity) > maxVehicle)
      this.velocity = this.sgn(this.velocity) * maxVehicle;
    if (this.abs(this.velocity) < minVehicle)
      this.velocity = this.sgn(this.velocity) * minVehicle;
  }


  public static decrementInvencible(): void {
    AkCore.decrementInvincible();
  }

  public static getEnergy(): number {
    return AkCore.getEnergy();
  }

  public static setEnergy(value: number): void {
    AkCore.setEnergy(value);
  }

  public static decrementEnergy(): void {
    AkCore.decrementEnergy();
  }

  public static isInvincible(): boolean {
    return AkCore.getInvincible() > 0;
  }
}