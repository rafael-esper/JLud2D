/**
 * Controls Configuration
 * TypeScript port of Java Controls system
 * Manages input handling and key bindings
 */

export interface IControlsConfig {
  // Movement keys
  keyUp: string;
  keyDown: string;
  keyLeft: string;
  keyRight: string;

  // Action keys
  keyAction1: string;  // B1 in Java (primary action)
  keyAction2: string;  // B2 in Java (secondary action)
  keyAction3: string;  // B3 in Java (tertiary action)
  keyAction4: string;  // B4 in Java (menu/cancel)

  // System keys
  keyMenu: string;
  keyPause: string;
  keyFullscreen: string;
  keyScreenshot: string;

  // Gamepad settings
  gamepadDeadzone: number;
  gamepadSensitivity: number;

  // Touch settings
  touchEnabled: boolean;
  virtualDPad: boolean;
}

export class ControlsConfig implements IControlsConfig {
  // Movement keys (WASD + Arrow keys)
  public keyUp: string = 'UP,W';
  public keyDown: string = 'DOWN,S';
  public keyLeft: string = 'LEFT,A';
  public keyRight: string = 'RIGHT,D';

  // Action keys
  public keyAction1: string = 'SPACE,Z,ENTER';
  public keyAction2: string = 'X,SHIFT';
  public keyAction3: string = 'C,CTRL';
  public keyAction4: string = 'ESC,ALT';

  // System keys
  public keyMenu: string = 'ESC,M';
  public keyPause: string = 'P,PAUSE';
  public keyFullscreen: string = 'F11,F';
  public keyScreenshot: string = 'F12,PRINT_SCREEN';

  // Gamepad settings
  public gamepadDeadzone: number = 0.2;
  public gamepadSensitivity: number = 1.0;

  // Touch settings
  public touchEnabled: boolean = true;
  public virtualDPad: boolean = true;

  constructor(controlsData?: Partial<IControlsConfig>) {
    if (controlsData) {
      Object.assign(this, controlsData);
    }
  }

  /**
   * Parse key string into array of key codes
   */
  public parseKeys(keyString: string): string[] {
    return keyString.split(',').map(key => key.trim().toUpperCase());
  }

  /**
   * Get all movement keys as arrays
   */
  public getMovementKeys() {
    return {
      up: this.parseKeys(this.keyUp),
      down: this.parseKeys(this.keyDown),
      left: this.parseKeys(this.keyLeft),
      right: this.parseKeys(this.keyRight)
    };
  }

  /**
   * Get all action keys as arrays
   */
  public getActionKeys() {
    return {
      action1: this.parseKeys(this.keyAction1),
      action2: this.parseKeys(this.keyAction2),
      action3: this.parseKeys(this.keyAction3),
      action4: this.parseKeys(this.keyAction4)
    };
  }

  /**
   * Export controls configuration as JSON string
   */
  public exportToJson(): string {
    return JSON.stringify(this, null, 2);
  }
}

/**
 * Input Manager class for handling real-time input
 */
export class InputManager {
  private scene: Phaser.Scene;
  private config: ControlsConfig;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: any;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;

  // Input states (Java equivalent)
  public up: boolean = false;
  public down: boolean = false;
  public left: boolean = false;
  public right: boolean = false;
  public b1: boolean = false;  // action1
  public b2: boolean = false;  // action2
  public b3: boolean = false;  // action3
  public b4: boolean = false;  // action4

  // Number keys
  public key1: boolean = false;
  public key2: boolean = false;
  public key3: boolean = false;
  public key4: boolean = false;
  public key5: boolean = false;

  // Letter keys
  public keyO: boolean = false;
  public keyB: boolean = false;
  public keyF: boolean = false;
  public keyH: boolean = false;
  public keyI: boolean = false;
  public keyK: boolean = false;
  public keyL: boolean = false;
  public keyM: boolean = false;
  public keyN: boolean = false;
  public keyP: boolean = false;
  public keyT: boolean = false;

  // Previous frame states for edge detection
  private prevUp: boolean = false;
  private prevDown: boolean = false;
  private prevLeft: boolean = false;
  private prevRight: boolean = false;
  private prevB1: boolean = false;
  private prevB2: boolean = false;
  private prevB3: boolean = false;
  private prevB4: boolean = false;

  // Previous frame states for debug keys
  private prevKey1: boolean = false;
  private prevKey2: boolean = false;
  private prevKey3: boolean = false;
  private prevKey4: boolean = false;
  private prevKey5: boolean = false;
  private prevKeyO: boolean = false;
  private prevKeyB: boolean = false;
  private prevKeyF: boolean = false;
  private prevKeyH: boolean = false;
  private prevKeyI: boolean = false;
  private prevKeyK: boolean = false;
  private prevKeyL: boolean = false;
  private prevKeyM: boolean = false;
  private prevKeyN: boolean = false;
  private prevKeyP: boolean = false;
  private prevKeyT: boolean = false;

  constructor(scene: Phaser.Scene, config: ControlsConfig) {
    this.scene = scene;
    this.config = config;
    this.setupKeyboard();
    this.setupGamepad();
  }

  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;

    // Create cursor keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Create keyboard keys
    this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D,SPACE,ESC,ENTER,SHIFT,CTRL,Z,X,C,ONE,TWO,THREE,FOUR,FIVE,O,F,H,I,K,L,M,N,P,T,B');
  }

  private setupGamepad(): void {
    this.scene.input.gamepad.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
      console.log('Gamepad connected:', pad.id);
    });

    this.scene.input.gamepad.on('disconnected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      if (this.gamepad === pad) {
        this.gamepad = undefined;
        console.log('Gamepad disconnected');
      }
    });
  }

  /**
   * Update input states (call every frame)
   * Java equivalent: UpdateControls()
   */
  public updateControls(): void {
    // Store previous states
    this.prevUp = this.up;
    this.prevDown = this.down;
    this.prevLeft = this.left;
    this.prevRight = this.right;
    this.prevB1 = this.b1;
    this.prevB2 = this.b2;
    this.prevB3 = this.b3;
    this.prevB4 = this.b4;

    // Store previous states for debug keys
    this.prevKey1 = this.key1;
    this.prevKey2 = this.key2;
    this.prevKey3 = this.key3;
    this.prevKey4 = this.key4;
    this.prevKey5 = this.key5;
    this.prevKeyO = this.keyO;
    this.prevKeyB = this.keyB;
    this.prevKeyF = this.keyF;
    this.prevKeyH = this.keyH;
    this.prevKeyI = this.keyI;
    this.prevKeyK = this.keyK;
    this.prevKeyL = this.keyL;
    this.prevKeyM = this.keyM;
    this.prevKeyN = this.keyN;
    this.prevKeyP = this.keyP;
    this.prevKeyT = this.keyT;

    // Update keyboard states
    this.updateKeyboard();

    // Update gamepad states
    this.updateGamepad();
  }

  private updateKeyboard(): void {
    if (!this.cursors || !this.wasd) return;

    // Movement
    this.up = this.cursors.up.isDown || this.wasd.W.isDown;
    this.down = this.cursors.down.isDown || this.wasd.S.isDown;
    this.left = this.cursors.left.isDown || this.wasd.A.isDown;
    this.right = this.cursors.right.isDown || this.wasd.D.isDown;

    // Actions
    this.b1 = this.wasd.SPACE.isDown || this.wasd.ENTER.isDown || this.wasd.Z.isDown;
    this.b2 = this.wasd.SHIFT.isDown || this.wasd.X.isDown;
    this.b3 = this.wasd.CTRL.isDown || this.wasd.C.isDown;
    this.b4 = this.wasd.ESC.isDown;

    // Number keys
    this.key1 = this.wasd.ONE.isDown;
    this.key2 = this.wasd.TWO.isDown;
    this.key3 = this.wasd.THREE.isDown;
    this.key4 = this.wasd.FOUR.isDown;
    this.key5 = this.wasd.FIVE.isDown;

    // Letter keys
    this.keyO = this.wasd.O.isDown;
    this.keyB = this.wasd.B.isDown;
    this.keyF = this.wasd.F.isDown;
    this.keyH = this.wasd.H.isDown;
    this.keyI = this.wasd.I.isDown;
    this.keyK = this.wasd.K.isDown;
    this.keyL = this.wasd.L.isDown;
    this.keyM = this.wasd.M.isDown;
    this.keyN = this.wasd.N.isDown;
    this.keyP = this.wasd.P.isDown;
    this.keyT = this.wasd.T.isDown;
  }

  private updateGamepad(): void {
    if (!this.gamepad) return;

    const deadzone = this.config.gamepadDeadzone;

    // Movement (left stick)
    const leftStick = this.gamepad.leftStick;
    this.up = this.up || leftStick.y < -deadzone;
    this.down = this.down || leftStick.y > deadzone;
    this.left = this.left || leftStick.x < -deadzone;
    this.right = this.right || leftStick.x > deadzone;

    // D-pad
    this.up = this.up || this.gamepad.up;
    this.down = this.down || this.gamepad.down;
    this.left = this.left || this.gamepad.left;
    this.right = this.right || this.gamepad.right;

    // Action buttons
    this.b1 = this.b1 || this.gamepad.A;
    this.b2 = this.b2 || this.gamepad.B;
    this.b3 = this.b3 || this.gamepad.X;
    this.b4 = this.b4 || this.gamepad.Y;
  }

  /**
   * Check if key was just pressed this frame
   */
  public justPressed(key: 'up' | 'down' | 'left' | 'right' | 'b1' | 'b2' | 'b3' | 'b4' | '1' | '2' | '3' | '4' | '5' | 'O' | 'B' | 'F' | 'H' | 'I' | 'K' | 'L' | 'M' | 'N' | 'P' | 'T'): boolean {
    switch (key) {
      case 'up': return this.up && !this.prevUp;
      case 'down': return this.down && !this.prevDown;
      case 'left': return this.left && !this.prevLeft;
      case 'right': return this.right && !this.prevRight;
      case 'b1': return this.b1 && !this.prevB1;
      case 'b2': return this.b2 && !this.prevB2;
      case 'b3': return this.b3 && !this.prevB3;
      case 'b4': return this.b4 && !this.prevB4;
      case '1': return this.key1 && !this.prevKey1;
      case '2': return this.key2 && !this.prevKey2;
      case '3': return this.key3 && !this.prevKey3;
      case '4': return this.key4 && !this.prevKey4;
      case '5': return this.key5 && !this.prevKey5;
      case 'O': return this.keyO && !this.prevKeyO;
      case 'B': return this.keyB && !this.prevKeyB;
      case 'F': return this.keyF && !this.prevKeyF;
      case 'H': return this.keyH && !this.prevKeyH;
      case 'I': return this.keyI && !this.prevKeyI;
      case 'K': return this.keyK && !this.prevKeyK;
      case 'L': return this.keyL && !this.prevKeyL;
      case 'M': return this.keyM && !this.prevKeyM;
      case 'N': return this.keyN && !this.prevKeyN;
      case 'P': return this.keyP && !this.prevKeyP;
      case 'T': return this.keyT && !this.prevKeyT;
      default: return false;
    }
  }

  /**
   * Check if key was just released this frame
   */
  public justReleased(key: 'up' | 'down' | 'left' | 'right' | 'b1' | 'b2' | 'b3' | 'b4'): boolean {
    switch (key) {
      case 'up': return !this.up && this.prevUp;
      case 'down': return !this.down && this.prevDown;
      case 'left': return !this.left && this.prevLeft;
      case 'right': return !this.right && this.prevRight;
      case 'b1': return !this.b1 && this.prevB1;
      case 'b2': return !this.b2 && this.prevB2;
      case 'b3': return !this.b3 && this.prevB3;
      case 'b4': return !this.b4 && this.prevB4;
      default: return false;
    }
  }

  /**
   * Clear all input states (Java equivalent: UnB1, etc.)
   */
  public clearInputs(): void {
    this.up = this.down = this.left = this.right = false;
    this.b1 = this.b2 = this.b3 = this.b4 = false;
  }

  /**
   * Force unpress a specific key (Java equivalent: unpress method)
   */
  public unpress(key: number): void {
    switch (key) {
      case 1: // up
        this.up = false;
        break;
      case 2: // down
        this.down = false;
        break;
      case 3: // left
        this.left = false;
        break;
      case 4: // right
        this.right = false;
        break;
      case 5: // b1/action1
        this.b1 = false;
        break;
      case 6: // b2/action2
        this.b2 = false;
        break;
      case 7: // b3/action3
        this.b3 = false;
        break;
      case 8: // b4/action4
        this.b4 = false;
        break;
    }
  }

}

export default ControlsConfig;