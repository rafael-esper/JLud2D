/**
 * Controls Configuration
 * TypeScript port of Java Controls system
 * Manages input handling and key bindings
 */

export interface IControlsConfig {
  // Movement keys (directional arrows + WASD)
  keyUp: string;
  keyDown: string;
  keyLeft: string;
  keyRight: string;

  // Action buttons (up to 6 buttons)
  keyB1: string;  // Primary action button
  keyB2: string;  // Secondary action button
  keyB3: string;  // Tertiary action button
  keyB4: string;  // Fourth action button
  keyB5: string;  // Fifth action button
  keyB6: string;  // Sixth action button

  // System keys
  keyStart: string;    // Start button
  keyMenu: string;     // Menu/Pause button
  keyFullscreen: string;
  keyScreenshot: string;

  // Demo settings
  maxButtons: number;  // How many buttons this demo uses (default 2)

  // Gamepad settings
  gamepadDeadzone: number;
  gamepadSensitivity: number;

  // Touch settings
  touchEnabled: boolean;
  virtualDPad: boolean;
}

export class ControlsConfig implements IControlsConfig {
  // Movement keys (Arrow keys + WASD)
  public keyUp: string = 'UP,W';
  public keyDown: string = 'DOWN,S';
  public keyLeft: string = 'LEFT,A';
  public keyRight: string = 'RIGHT,D';

  // Action buttons (default joystick mapping)
  public keyB1: string = 'J,Z';      // Primary action
  public keyB2: string = 'K,X';      // Secondary action
  public keyB3: string = 'L,C';      // Tertiary action
  public keyB4: string = 'I';        // Fourth action
  public keyB5: string = 'U';        // Fifth action
  public keyB6: string = 'O';        // Sixth action

  // System keys
  public keyStart: string = 'ENTER';     // Start button
  public keyMenu: string = 'ESC';        // Menu/Pause button
  public keyFullscreen: string = 'F11';
  public keyScreenshot: string = 'F12';

  // Demo settings
  public maxButtons: number = 2;         // Default: use 2 buttons

  // Gamepad settings
  public gamepadDeadzone: number = 0.2;
  public gamepadSensitivity: number = 1.0;

  // Touch settings
  public touchEnabled: boolean = true;
  public virtualDPad: boolean = true;

  /** localStorage key holding the user's rebinds from the Controls panel */
  public static readonly STORAGE_KEY = 'jlud2d-controls';

  /** The fields the Controls panel can rebind */
  public static readonly BINDING_KEYS = [
    'keyUp', 'keyDown', 'keyLeft', 'keyRight',
    'keyB1', 'keyB2', 'keyB3', 'keyB4', 'keyB5', 'keyB6',
    'keyStart', 'keyMenu'
  ] as const;

  constructor(controlsData?: Partial<IControlsConfig>) {
    if (controlsData) {
      Object.assign(this, controlsData);
    }
    // User rebinds win over both defaults and per-demo overrides
    ControlsConfig.applySavedBindings(this);
  }

  /** Merge rebinds saved by the emulator UI Controls panel into a config */
  public static applySavedBindings(config: ControlsConfig): void {
    try {
      const saved = localStorage.getItem(ControlsConfig.STORAGE_KEY);
      if (!saved) return;
      const overrides = JSON.parse(saved);
      for (const key of ControlsConfig.BINDING_KEYS) {
        if (typeof overrides[key] === 'string' && overrides[key].length > 0) {
          (config as any)[key] = overrides[key];
        }
      }
    } catch (error) {
      console.warn('ControlsConfig: could not apply saved bindings', error);
    }
  }

  /** Persist a single rebind (e.g. keyB1 -> 'J,Z') */
  public static saveBinding(bindingKey: string, value: string): void {
    try {
      const saved = localStorage.getItem(ControlsConfig.STORAGE_KEY);
      const overrides = saved ? JSON.parse(saved) : {};
      overrides[bindingKey] = value;
      localStorage.setItem(ControlsConfig.STORAGE_KEY, JSON.stringify(overrides));
    } catch (error) {
      console.warn('ControlsConfig: could not save binding', error);
    }
  }

  /** Drop all rebinds, returning every config to defaults */
  public static clearSavedBindings(): void {
    localStorage.removeItem(ControlsConfig.STORAGE_KEY);
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
      b1: this.parseKeys(this.keyB1),
      b2: this.parseKeys(this.keyB2),
      b3: this.parseKeys(this.keyB3),
      b4: this.parseKeys(this.keyB4),
      b5: this.parseKeys(this.keyB5),
      b6: this.parseKeys(this.keyB6)
    };
  }

  /**
   * Get system keys as arrays
   */
  public getSystemKeys() {
    return {
      start: this.parseKeys(this.keyStart),
      menu: this.parseKeys(this.keyMenu)
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
  public b1: boolean = false;  // Primary action button
  public b2: boolean = false;  // Secondary action button
  public b3: boolean = false;  // Tertiary action button
  public b4: boolean = false;  // Fourth action button
  public b5: boolean = false;  // Fifth action button
  public b6: boolean = false;  // Sixth action button
  public start: boolean = false;  // Start button
  public menu: boolean = false;   // Menu/Pause button

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
  public keyJ: boolean = false;
  public keyK: boolean = false;
  public keyL: boolean = false;
  public keyM: boolean = false;
  public keyN: boolean = false;
  public keyP: boolean = false;
  public keyT: boolean = false;
  public keyV: boolean = false;

  // Previous frame states for edge detection
  private prevUp: boolean = false;
  private prevDown: boolean = false;
  private prevLeft: boolean = false;
  private prevRight: boolean = false;
  private prevB1: boolean = false;
  private prevB2: boolean = false;
  private prevB3: boolean = false;
  private prevB4: boolean = false;
  private prevB5: boolean = false;
  private prevB6: boolean = false;
  private prevStart: boolean = false;
  private prevMenu: boolean = false;

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
  private prevKeyJ: boolean = false;
  private prevKeyK: boolean = false;
  private prevKeyL: boolean = false;
  private prevKeyM: boolean = false;
  private prevKeyN: boolean = false;
  private prevKeyP: boolean = false;
  private prevKeyT: boolean = false;
  private prevKeyV: boolean = false;

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

    // Register the default/debug keys plus every key the current bindings
    // reference, so user rebinds from the emulator UI actually work
    const keyNames = new Set(
      'W,S,A,D,ESC,ENTER,Z,X,C,I,J,K,L,U,O,ONE,TWO,THREE,FOUR,FIVE,F,H,M,N,P,T,B,V'.split(',')
    );
    const bindings = [
      this.config.keyUp, this.config.keyDown, this.config.keyLeft, this.config.keyRight,
      this.config.keyB1, this.config.keyB2, this.config.keyB3,
      this.config.keyB4, this.config.keyB5, this.config.keyB6,
      this.config.keyStart, this.config.keyMenu
    ];
    for (const binding of bindings) {
      for (const key of this.config.parseKeys(binding)) {
        // Arrow keys are handled by the cursor keys object
        if (key && !['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key)) {
          keyNames.add(key);
        }
      }
    }
    this.wasd = this.scene.input.keyboard.addKeys(Array.from(keyNames).join(','));
  }

  private setupGamepad(): void {
    if (!this.scene.input.gamepad) return;

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
    this.prevB5 = this.b5;
    this.prevB6 = this.b6;
    this.prevStart = this.start;
    this.prevMenu = this.menu;

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
    this.prevKeyJ = this.keyJ;
    this.prevKeyK = this.keyK;
    this.prevKeyL = this.keyL;
    this.prevKeyM = this.keyM;
    this.prevKeyN = this.keyN;
    this.prevKeyP = this.keyP;
    this.prevKeyT = this.keyT;
    this.prevKeyV = this.keyV;

    // Update keyboard states
    this.updateKeyboard();

    // Update gamepad states
    this.updateGamepad();

    // Update mobile controls states
    this.updateMobileControls();
  }

  private updateKeyboard(): void {
    if (!this.cursors || !this.wasd) return;

    // Movement - use configured key mappings
    const movementKeys = this.config.getMovementKeys();
    this.up = this.isAnyKeyDown(movementKeys.up);
    this.down = this.isAnyKeyDown(movementKeys.down);
    this.left = this.isAnyKeyDown(movementKeys.left);
    this.right = this.isAnyKeyDown(movementKeys.right);

    // Action buttons - use configured key mappings
    const actionKeys = this.config.getActionKeys();
    this.b1 = this.isAnyKeyDown(actionKeys.b1);
    this.b2 = this.isAnyKeyDown(actionKeys.b2);
    this.b3 = this.isAnyKeyDown(actionKeys.b3);
    this.b4 = this.isAnyKeyDown(actionKeys.b4);
    this.b5 = this.isAnyKeyDown(actionKeys.b5);
    this.b6 = this.isAnyKeyDown(actionKeys.b6);

    // System buttons - use configured key mappings
    const systemKeys = this.config.getSystemKeys();
    this.start = this.isAnyKeyDown(systemKeys.start);
    this.menu = this.isAnyKeyDown(systemKeys.menu);

    // Debug/letter keys (keep hardcoded for compatibility)
    this.key1 = this.wasd.ONE?.isDown || false;
    this.key2 = this.wasd.TWO?.isDown || false;
    this.key3 = this.wasd.THREE?.isDown || false;
    this.key4 = this.wasd.FOUR?.isDown || false;
    this.key5 = this.wasd.FIVE?.isDown || false;

    this.keyO = this.wasd.O?.isDown || false;
    this.keyB = this.wasd.B?.isDown || false;
    this.keyF = this.wasd.F?.isDown || false;
    this.keyH = this.wasd.H?.isDown || false;
    this.keyI = this.wasd.I?.isDown || false;
    this.keyJ = this.wasd.J?.isDown || false;
    this.keyK = this.wasd.K?.isDown || false;
    this.keyL = this.wasd.L?.isDown || false;
    this.keyM = this.wasd.M?.isDown || false;
    this.keyN = this.wasd.N?.isDown || false;
    this.keyP = this.wasd.P?.isDown || false;
    this.keyT = this.wasd.T?.isDown || false;
    this.keyV = this.wasd.V?.isDown || false;
  }

  /**
   * Check if any key in the array is currently pressed
   */
  private isAnyKeyDown(keys: string[]): boolean {
    for (const key of keys) {
      if (key === 'UP' && this.cursors?.up.isDown) return true;
      if (key === 'DOWN' && this.cursors?.down.isDown) return true;
      if (key === 'LEFT' && this.cursors?.left.isDown) return true;
      if (key === 'RIGHT' && this.cursors?.right.isDown) return true;

      // Check WASD keys
      const wasdKey = this.wasd?.[key];
      if (wasdKey?.isDown) return true;
    }
    return false;
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

    // Action buttons (map to 6 buttons)
    this.b1 = this.b1 || this.gamepad.A;      // Primary
    this.b2 = this.b2 || this.gamepad.B;      // Secondary
    this.b3 = this.b3 || this.gamepad.X;      // Tertiary
    this.b4 = this.b4 || this.gamepad.Y;      // Fourth
    this.b5 = this.b5 || this.gamepad.L1 > 0; // Fifth (left shoulder)
    this.b6 = this.b6 || this.gamepad.R1 > 0; // Sixth (right shoulder)

    // System buttons
    // Standard gamepad mapping: button 9 = start/menu, button 8 = select/back
    this.start = this.start || (this.gamepad.buttons[9]?.pressed ?? false);
    this.menu = this.menu || (this.gamepad.buttons[8]?.pressed ?? false);
  }

  private updateMobileControls(): void {
    // Get mobile controls manager from global window object
    const mobileControls = (window as any).mobileControls;
    if (!mobileControls) return;

    const joyState = mobileControls.getJoystickState();
    const deadzone = 10; // px deadzone for joystick

    // Movement from joystick
    if (Math.abs(joyState.dx) > deadzone) {
      if (joyState.dx < 0) this.left = true;
      else this.right = true;
    }
    if (Math.abs(joyState.dy) > deadzone) {
      if (joyState.dy < 0) this.up = true;
      else this.down = true;
    }

    // Action buttons
    this.b1 = this.b1 || mobileControls.getButtonState('b1');
    this.b2 = this.b2 || mobileControls.getButtonState('b2');
    this.b3 = this.b3 || mobileControls.getButtonState('b3');
    this.b4 = this.b4 || mobileControls.getButtonState('b4');
    this.b5 = this.b5 || mobileControls.getButtonState('b5');
    this.b6 = this.b6 || mobileControls.getButtonState('b6');
    this.start = this.start || mobileControls.getButtonState('start');
    this.menu = this.menu || mobileControls.getButtonState('pause');
  }

  /**
   * Set required buttons for mobile controls
   * This should be called by each demo to specify which buttons it needs
   */
  public setMobileButtons(buttons: string[]): void {
    const mobileControls = (window as any).mobileControls;
    if (mobileControls) {
      // Ensure 'start' is always included
      const activeButtons = [...buttons];
      if (!activeButtons.includes('start')) {
        activeButtons.push('start');
      }
      mobileControls.setActiveButtons(activeButtons);
    }
  }

  /**
   * Check if key was just pressed this frame
   */
  public justPressed(key: 'up' | 'down' | 'left' | 'right' | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'start' | 'menu' | '1' | '2' | '3' | '4' | '5' | 'O' | 'B' | 'F' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'P' | 'T' | 'V'): boolean {
    switch (key) {
      case 'up': return this.up && !this.prevUp;
      case 'down': return this.down && !this.prevDown;
      case 'left': return this.left && !this.prevLeft;
      case 'right': return this.right && !this.prevRight;
      case 'b1': return this.b1 && !this.prevB1;
      case 'b2': return this.b2 && !this.prevB2;
      case 'b3': return this.b3 && !this.prevB3;
      case 'b4': return this.b4 && !this.prevB4;
      case 'b5': return this.b5 && !this.prevB5;
      case 'b6': return this.b6 && !this.prevB6;
      case 'start': return this.start && !this.prevStart;
      case 'menu': return this.menu && !this.prevMenu;
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
      case 'J': return this.keyJ && !this.prevKeyJ;
      case 'K': return this.keyK && !this.prevKeyK;
      case 'L': return this.keyL && !this.prevKeyL;
      case 'M': return this.keyM && !this.prevKeyM;
      case 'N': return this.keyN && !this.prevKeyN;
      case 'P': return this.keyP && !this.prevKeyP;
      case 'T': return this.keyT && !this.prevKeyT;
      case 'V': return this.keyV && !this.prevKeyV;
      default: return false;
    }
  }

  /**
   * Check if key was just released this frame
   */
  public justReleased(key: 'up' | 'down' | 'left' | 'right' | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'start' | 'menu'): boolean {
    switch (key) {
      case 'up': return !this.up && this.prevUp;
      case 'down': return !this.down && this.prevDown;
      case 'left': return !this.left && this.prevLeft;
      case 'right': return !this.right && this.prevRight;
      case 'b1': return !this.b1 && this.prevB1;
      case 'b2': return !this.b2 && this.prevB2;
      case 'b3': return !this.b3 && this.prevB3;
      case 'b4': return !this.b4 && this.prevB4;
      case 'b5': return !this.b5 && this.prevB5;
      case 'b6': return !this.b6 && this.prevB6;
      case 'start': return !this.start && this.prevStart;
      case 'menu': return !this.menu && this.prevMenu;
      default: return false;
    }
  }

  /**
   * Clear all input states (Java equivalent: UnB1, etc.)
   */
  public clearInputs(): void {
    this.up = this.down = this.left = this.right = false;
    this.b1 = this.b2 = this.b3 = this.b4 = this.b5 = this.b6 = false;
    this.start = this.menu = false;
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
      case 5: // b1
        this.b1 = false;
        break;
      case 6: // b2
        this.b2 = false;
        break;
      case 7: // b3
        this.b3 = false;
        break;
      case 8: // b4
        this.b4 = false;
        break;
      case 9: // b5
        this.b5 = false;
        break;
      case 10: // b6
        this.b6 = false;
        break;
      case 11: // start
        this.start = false;
        break;
      case 12: // menu
        this.menu = false;
        break;
    }
  }

}

export default ControlsConfig;