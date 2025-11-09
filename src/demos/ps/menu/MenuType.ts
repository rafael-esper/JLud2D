/**
 * MenuType - Base Menu Type
 * Direct port of MenuType.java - Base class for all menu components
 */

export enum MenuState {
  OPEN = 'OPEN',
  TEXT = 'TEXT',
  READY = 'READY',
  CLOSE = 'CLOSE',
  END = 'END',
  ANIM1 = 'ANIM1',
  ANIM2 = 'ANIM2',
  ANIM3 = 'ANIM3'
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