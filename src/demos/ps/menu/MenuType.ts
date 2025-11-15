/**
 * MenuType - Base Menu Type
 * Direct port of MenuType.java - Base class for all menu components
 */

export enum MenuState {
  OPEN,
  TEXT,
  READY,
  CLOSE,
  END,
  ANIM1,
  ANIM2,
  ANIM3
}

export class MenuStateHelper {
  private static readonly stateConfigs = new Map<MenuState, { animIndex: number }>([
    [MenuState.OPEN, { animIndex: 0 }],
    [MenuState.TEXT, { animIndex: 0 }],
    [MenuState.READY, { animIndex: 1 }],
    [MenuState.CLOSE, { animIndex: 0 }],
    [MenuState.END, { animIndex: 0 }],
    [MenuState.ANIM1, { animIndex: 2 }],
    [MenuState.ANIM2, { animIndex: 3 }],
    [MenuState.ANIM3, { animIndex: 4 }]
  ]);

  public static getAnimIndex(state: MenuState): number {
    return this.stateConfigs.get(state)?.animIndex || 0;
  }
}

export abstract class MenuType {
  public static readonly MAX_DELAY: number = 12;

  public drawDelay: number = 0;
  public state: MenuState = MenuState.OPEN;

  /**
   * Abstract draw method - must be implemented by subclasses
   * @param active - Whether this menu is the active (top) menu
   */
  public abstract draw(active: boolean): void;
}