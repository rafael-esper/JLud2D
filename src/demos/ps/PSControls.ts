/**
 * PSControls - Phantasy Star key layout
 * Button semantics follow the SMS manual:
 *   b1 - investigates, opens containers/doors, talks, selects in menus
 *   b2 - cancels in menus, continues conversations
 *   b3 - calls up the menu, selects in menus, continues conversations
 * Keyboard rows put b1 on the right: Z/J = b3, X/K = b2, C/L = b1.
 * User rebinds from the Controls panel still win (applied in the constructor).
 */

import { ControlsConfig } from '../../config/Controls';

export function createPSControlsConfig(): ControlsConfig {
  return new ControlsConfig({
    keyB1: 'L,C',
    keyB2: 'K,X',
    keyB3: 'J,Z'
  });
}
