/**
 * AkMovement - Movement system for Alex Kidd
 * Handles player movement, physics, and collision detection
 */

import { InputManager } from '../../config/Controls';
import { MainEngine } from '../../core/MainEngine';
import { AkActions } from './AkActions';

// Enums for movement system
export enum Condition { WALK, SWIM, MOTO, SURF, HELI, FLY, STAR, ROPE }
export enum Status { STOPPED, WALKING, JUMPING, FALLING, DUCKING }
export enum Action { NONE, PUNCHING, TREMBLING }

export class AkMovement {
  // Movement state
  private condition: Condition = Condition.WALK;
  private state: Status = Status.STOPPED;
  private action: Action = Action.NONE;
  private velocity: number = 0;
  private friction: number = 5;
  private vertical: number = 0;
  private alt: number = 0;

  // Zone tracking
  private static zonecalled: number = 0;

  // Physics constants
  private static readonly SPEED: number = 3;
  private static readonly MAXJUMP: number = 48;
  private static readonly MAXVEL: number = 15;
  private static readonly FALL: number = 6;
  private static readonly GRAV_EF: number = 40;
  private static readonly GRAV: number = 4;

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

  // Getters and setters for state
  getCondition(): Condition { return this.condition; }
  setCondition(condition: Condition): void { this.condition = condition; }

  getState(): Status { return this.state; }
  setState(state: Status): void { this.state = state; }

  getAction(): Action { return this.action; }
  setAction(action: Action): void { this.action = action; }

  getVelocity(): number { return this.velocity; }
  setVelocity(velocity: number): void { this.velocity = velocity; }

  getFriction(): number { return this.friction; }
  getVertical(): number { return this.vertical; }
  getAlt(): number { return this.alt; }

  // Main movement update method
  update(): void {
    if (this.condition == Condition.WALK || this.condition == Condition.MOTO || this.condition == Condition.SURF) {
      this.movePlayer();
    }
  }

  // Control input processing
  processControls(): void {
    if (this.inputManager.right && this.inputManager.left && this.state == Status.WALKING) {
      this.state = Status.STOPPED;
      this.velocity = 0;
    }

    this.processZones();

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

    // Handle punch controls after condition switch
    const punchResult = AkActions.handlePunchControls(
      this.condition,
      this.inputManager.justPressed('b1'),
      this.inputManager.left,
      this.inputManager.right,
      this.state,
      this.velocity,
      this.friction,
      this.action
    );

    this.state = punchResult.state;
    this.velocity = punchResult.velocity;
    this.action = punchResult.action;

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
          this.velocity += 10 * AkMovement.SPEED / this.friction;
          if (this.state == Status.STOPPED)
            this.state = Status.WALKING;
          if (MainEngine.getPlayer()?.getFace() != AkMovement.EAST) {
            MainEngine.getPlayer()?.setFace(AkMovement.EAST);
            this.velocity = this.friction * this.velocity / 10;
          }
        }
        if (this.inputManager.left) {
          this.velocity -= 10 * AkMovement.SPEED / this.friction;
          if (this.state == Status.STOPPED)
            this.state = Status.WALKING;
          if (MainEngine.getPlayer()?.getFace() != AkMovement.WEST) {
            MainEngine.getPlayer()?.setFace(AkMovement.WEST);
            this.velocity = this.friction * this.velocity / 10;
          }
        }
      }

      if (this.inputManager.down && this.velocity == 0)
        this.state = Status.DUCKING;
      else if (!this.inputManager.down && this.state == Status.DUCKING)
        this.state = Status.STOPPED;
    }

    this.checkJumpFalling(AkMovement.MAXJUMP);
    this.velocityCheck(AkMovement.MAXVEL);
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
      if (this.state != Status.JUMPING && this.state != Status.FALLING && this.getObsd(AkMovement.SOUTH)) {
        this.state = Status.JUMPING;
        this.vertical = 0;
        this.alt = MaxAlt;
      }
      if (this.state == Status.JUMPING && this.alt > -20) {
        this.vertical -= this.alt / AkMovement.FALL;
        if (this.vertical < -MaxAlt)
          this.vertical = -MaxAlt;
      }

      if (this.alt > 0) {
        this.alt -= AkMovement.FALL;
      } else {
        this.state = Status.FALLING;
        this.alt = 0;
        this.unpress(5);
      }
    }

    // Gravity and falling logic
    if (!this.getObsd(AkMovement.SOUTH) && this.state != Status.JUMPING) {
      this.state = Status.FALLING;
      if (this.vertical < AkMovement.GRAV_EF)
        this.vertical += (AkMovement.GRAV + 1);
    }
    if (!this.inputManager.up && this.state == Status.JUMPING) {
      this.state = Status.FALLING;
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

		if(this.condition == Condition.SWIM) { // FIXME Swim Zone NORTH
			startX-=4; endX+=2;
			startY+=5; //endY--;
		}
		
		if(this.condition == Condition.HELI) {
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

    if (this.condition == Condition.WALK)
      c = 8; // walking
    if (this.condition == Condition.SWIM)
      c = 12; // swimming

    for (let a = 13; a < 17; a += 2) {
      for (let b = c; b < 26; b += 2) {
        zx = (player.getx() + a) >> 4;
        zy = (player.gety() + b) >> 4;
        if (this.action == Action.PUNCHING)
          zx = (player.getx() + a + 8) >> 4;
        z = currentMap.getzone(zx, zy);

        if (z != 0 && AkMovement.zonecalled != z) {
          AkMovement.zonecalled = z;
          AkActions.callEvent(z, zx, zy);
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
    if (this.getObsd(AkMovement.NORTH) && this.state == Status.JUMPING) {
      this.state = Status.FALLING;
      this.vertical = 0;
    }

    // Landing collision
    if (this.getObsd(AkMovement.SOUTH) && this.state == Status.FALLING) {
      this.state = Status.STOPPED;
      this.vertical = 0;
      if (this.condition != Condition.MOTO && this.condition != Condition.SURF) {
        this.velocity = 0;
      }
    }

    // Jumping movement
    if (this.state == Status.JUMPING) {
      for (let i = 0; i < this.abs(this.vertical); i += AkMovement.FALL) {
        if (!this.getObsd(AkMovement.NORTH)) {
          player.incy(this.sgn(this.vertical));
        }
      }
    }

    // Falling movement
    if (this.state == Status.FALLING) {
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
}