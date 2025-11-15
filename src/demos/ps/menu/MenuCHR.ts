/**
 * MenuCHR - CHR Animation Menu Component
 * Direct port of MenuCHR.java - Handles animated sprites in menus
 */

import { CHR } from '../../../domain/CHR';
import { MenuType, MenuState, MenuStateHelper } from './MenuType';
import { ScriptEngine } from '../../../core/ScriptEngine';

export class MenuCHR extends MenuType {
  public static readonly DONE: number = 2;

  private chr: CHR;
  private x: number;
  private y: number;
  private framect: number;
  private beginDelay: number;
  private loopable: boolean = false;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, chr: CHR);
  constructor(scene: Phaser.Scene, x: number, y: number, loopable: boolean, chr: CHR);
  constructor(scene: Phaser.Scene, x: number, y: number, chrOrLoopable: CHR | boolean, chr?: CHR) {
    super();

    this.scene = scene;
    this.x = x;
    this.y = y;

    if (typeof chrOrLoopable === 'boolean') {
      // Second constructor variant with loopable parameter
      this.loopable = chrOrLoopable;
      this.chr = chr!;
    } else {
      // First constructor variant
      this.chr = chrOrLoopable;
    }

    this.state = MenuState.READY;
    this.framect = 0;
    this.beginDelay = Math.floor(MenuType.MAX_DELAY / 2);
  }

  public draw(active: boolean): void {
    if (this.beginDelay-- > 0) {
      return;
    }

    switch (this.state) {
      case MenuState.READY:
        ScriptEngine.blitEntityFrame(this.x, this.y, this.chr, this.chr.getFrame(MenuStateHelper.getAnimIndex(this.state), this.framect));
        break;

      case MenuState.ANIM1:
      case MenuState.ANIM2:
      case MenuState.ANIM3:
        ScriptEngine.blitEntityFrame(this.x, this.y, this.chr, this.chr.getFrame(MenuStateHelper.getAnimIndex(this.state), this.framect));
        if (this.framect + 1 >= this.chr.getAnimSize(MenuStateHelper.getAnimIndex(this.state))) {
          if (!this.loopable) {
            this.state = MenuState.CLOSE;
          } else {
            this.framect = 0;
          }
        }
        break;

      case MenuState.CLOSE:
        ScriptEngine.blitEntityFrame(this.x, this.y, this.chr, this.chr.getIdle()[MenuCHR.DONE]);
        break;

      default:
        break;
    }

    this.framect++;
  }

  public animate(anim: MenuState): void {
    this.framect = 0;
    this.state = anim;
  }

  public changePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

}