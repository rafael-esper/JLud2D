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

    let a: number, ho: number = 0, vo: number = 0;

    if (this.condition == Condition.STAR)
      vo = 6;
    if (this.condition == Condition.MOTO || this.condition == Condition.SURF)
      ho = 4;

    if (this.condition == Condition.WALK || this.condition == Condition.MOTO || this.condition == Condition.SURF) { // normal
      if (direction == AkMovement.WEST) {
        for (a = 7 + vo; a < 28; a += 2) {
          if (this.tiledMap.getobspixel(player.getx() + 8,
              player.gety() + a))
            return true;
        }
      } // left
      if (direction == AkMovement.EAST) {
        for (a = 7 + vo; a < 28; a += 2) {
          if (this.tiledMap.getobspixel(player.getx() + 24,
              player.gety() + a))
            return true;
        }
      } // right

      if (direction == AkMovement.NORTH && this.processZones() == 12)
        return false; // end of stair
      if (direction == AkMovement.NORTH) {
        for (a = 11; a < 20; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a,
              (player.gety()) + (6 + vo)))
            return true;
        }
      } // up

      if (direction == AkMovement.SOUTH) {
        for (a = 11 - ho; a < 20 + ho; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a,
              (player.gety()) + (28)))
            return true;
        }
      } // down
      if (direction == AkMovement.SOUTH && this.condition == Condition.SURF) {
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
      if (direction == AkMovement.WEST) {
        for (a = 12; a < 24; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + 7,
              (player.gety()) + a))
            return true;
        }
      }
      if (direction == AkMovement.EAST) {
        for (a = 12; a < 24; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + 25,
              (player.gety()) + a))
            return true;
        }
      }
      if (direction == AkMovement.NORTH) {
        for (a = 8; a < 22; a += 2) {
          if (this.tiledMap.getzone(((player.getx()) + a) >> 4,
              ((player.gety()) + 8) >> 4) == 6)
            return true;
        }
      }
      if (direction == AkMovement.NORTH) {
        for (a = 8; a < 26; a += 2) {
          if (this.tiledMap.getobspixel((player.getx()) + a,
              (player.gety()) + (8)))
            return true;
        }
      }
      if (direction == AkMovement.SOUTH) {
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