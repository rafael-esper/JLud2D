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

  // Previous frame states for edge detection
  private prevUp: boolean = false;
  private prevDown: boolean = false;
  private prevLeft: boolean = false;
  private prevRight: boolean = false;
  private prevB1: boolean = false;
  private prevB2: boolean = false;
  private prevB3: boolean = false;
  private prevB4: boolean = false;

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

    // Create WASD keys
    this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D,SPACE,ESC,ENTER,SHIFT,CTRL');
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
    this.b1 = this.wasd.SPACE.isDown || this.wasd.ENTER.isDown;
    this.b2 = this.wasd.SHIFT.isDown;
    this.b3 = this.wasd.CTRL.isDown;
    this.b4 = this.wasd.ESC.isDown;
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
  public justPressed(key: 'up' | 'down' | 'left' | 'right' | 'b1' | 'b2' | 'b3' | 'b4'): boolean {
    switch (key) {
      case 'up': return this.up && !this.prevUp;
      case 'down': return this.down && !this.prevDown;
      case 'left': return this.left && !this.prevLeft;
      case 'right': return this.right && !this.prevRight;
      case 'b1': return this.b1 && !this.prevB1;
      case 'b2': return this.b2 && !this.prevB2;
      case 'b3': return this.b3 && !this.prevB3;
      case 'b4': return this.b4 && !this.prevB4;
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
}

export default ControlsConfig;