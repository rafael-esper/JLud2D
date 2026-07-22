# JLud2D Phaser Port — Task List

Priority: **Phantasy Star demo is the main goal** — it must be playable from title screen to end credits, matching the original Java version.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## 1. Infrastructure / Core Engine

- [ ] **Demo2 – tree-cutting mechanic**: Implement `setupTreeCuttingMechanic()` in `Demo2Scene.ts` (line 100). Java reference: `Demo2.java` — player presses action button adjacent to a tree tile, plays axe swing SFX, replaces tree tile with stump, spawns item drop.
- [ ] **ScriptEngine – entity interaction hooks**: Wire up `onEntityInteract` callback in `MainEngine.ts` so map event zones and NPC collisions trigger properly. Java reference: `Script.java` `onEntityInteract`.
- [ ] **InputManager – gamepad deadzone**: Verify gamepad analog stick → directional input mapping works consistently across demos.

---

## 2. Phantasy Star — Game Loop (BLOCKER for everything else)

The main overworld game loop in `GameScene.ts` is a stub. Without it nothing works.

- [ ] **Implement overworld update loop**: In `GameScene.ts`, wire the Phaser `update()` to:
  - Move player entity with directional input
  - Detect zone/event tiles from the map (walk-on triggers, talk triggers)
  - Trigger random battles based on step counter and zone encounter rate
  - Play footstep or area ambient SFX
  - Java reference: `Phantasy.java` `startmap()`, `PSGame.java` main loop section
- [ ] **Party display**: Show lead character sprite walking on the overworld. Sprite asset already loaded; just needs to follow player entity position.
- [ ] **Zone event callbacks**: Connect map zone properties (from `.map.json` `zoneid` fields) to `PSGame.ts` event handlers. Pattern is already established in `Camineet.ts` — replicate for all maps.
- [ ] **NPC interaction**: When player presses action button facing an NPC entity, open dialog via `PSMenu` text box. Java reference: `PSGame.java` `startInteract()`.
- [ ] **Transport detection** (`PSGame.ts` line 185): Implement transport mode detection — when player walks onto a spaceship/land rover/hovercraft tile, switch to appropriate vehicle mode and update movement speed/passability.
- [ ] **Transport activation** (`PSGame.ts` lines 1165–1174): Implement `activateTransport()` — boarding/dismounting vehicles, updating player sprite and movement rules.

---

## 3. Phantasy Star — Missing City / World Maps

8 TypeScript map classes exist; 16 are missing. Each missing map needs a `.ts` class (copy pattern from `Camineet.ts`) that defines:
- `preload()` with map JSON + tileset
- Zone events (doors, NPCs, shop entrances, dungeon entrances, map transitions)
- Music assignment

**Missing maps** (Java originals in `public/ps/oo/cities/`):
- [ ] `Abion.ts`
- [ ] `Aukba.ts`
- [ ] `Aukba_entrance.ts`
- [ ] `Bortevo.ts`
- [ ] `Casba.ts`
- [ ] `Dezoris.ts` (planet overworld — needed for Noah/Extended start)
- [ ] `Drasgow.ts`
- [ ] `Eppi.ts`
- [ ] `Gothic.ts`
- [ ] `Loar.ts`
- [ ] `Skure.ts`
- [ ] `Skure_entrance.ts`
- [ ] `Sky_castle.ts`
- [ ] `Sopia.ts`
- [ ] `Tonoe.ts`
- [ ] `Uzo.ts`

- [ ] **Register all new maps** in `GameScene.ts` preload and in the `PSGame.ts` `mapswitch()` routing table.

---

## 4. Phantasy Star — Dungeon System

35 of 36 dungeon TypeScript classes are missing. `Warehouse.ts` is the reference implementation.

- [ ] **PSDungeon rendering — scaled depth images**: Implement proper perspective-scaled wall/door/enemy rendering so distant tiles appear smaller. Java reference: `PSDungeon.java` image scaling section.
- [ ] **Dungeon enemy encounters**: When player steps on an encounter tile, trigger battle transition. Java reference: `PSDungeon.java` encounter logic.
- [ ] **Darkness mechanic**: If player lacks the Light Pendant item, dungeon renders dark — only 1 tile visible. Already partially implemented; needs item-flag check from `PSGame.ts`.
- [ ] **Trap tiles**: Walking on trap tiles deals damage to party. Java reference: `PSDungeon.java` trap handling.

**Missing dungeon classes** (Java + map JSON in `public/ps/oo/dungeons/`):
- [ ] `Abion_dungeon.ts`
- [ ] `Aukba_tunnel.ts`
- [ ] `Baya_cave.ts`
- [ ] `Baya_malay.ts`
- [ ] `Blueberry.ts`
- [ ] `Bortevo_cave.ts`
- [ ] `Casba_cave.ts`
- [ ] `Corona.ts`
- [ ] `Darkfalz.ts`
- [ ] `Dezo_cave1.ts` through `Dezo_cave4.ts` (4 files)
- [ ] `Dezo_cave_aukba.ts`
- [ ] `Drasgow_dungeon.ts`
- [ ] `Frost_cave.ts`
- [ ] `Gothic_passageway.ts`
- [ ] `Governor.ts`
- [ ] `Guaron_morgue.ts`
- [ ] `Iala.ts`
- [ ] `Lassic_castle.ts`
- [ ] `Lost_island.ts`
- [ ] `Medusa_tower.ts`
- [ ] `Naharu.ts`
- [ ] `Naula.ts`
- [ ] `Odin_cave.ts`
- [ ] `Prism_cave.ts`
- [ ] `Prison.ts`
- [ ] `Skure_tunnel.ts`
- [ ] `Tajima_cave.ts`
- [ ] `Triada.ts`

- [ ] **Register all dungeons** in the `PSDungeon.ts` dungeon-type routing and in `PSGame.ts` dungeon entry points.

---

## 5. Phantasy Star — Battle System (BLOCKER for dungeon and overworld completion)

`PSBattle.ts` has class structure but no combat logic. Java reference: `PhantasyArena.java` (~25k lines).

- [ ] **Battle scene setup**: Transition from overworld/dungeon to battle background image, display party and enemy sprites at `BattlePosition` slots.
- [ ] **Turn order**: Implement speed-based turn ordering for player characters and enemies.
- [ ] **Player actions**: Hook up Attack, Spell, Item, Guard, Flee commands in `PSMenuMain.ts` battle mode.
- [ ] **Physical attack**: Calculate damage using attacker ATK vs defender DEF with variance. Apply to target HP. Display damage number.
- [ ] **Magic / spells**: Implement all PS1 spell effects (Res, Sar, Gi Res, Gires, Megid, Ryuka, Telele, Foi, Gifoi, Tsu, Gitsu, Nares, Deban, etc.). Java reference: `PSLibSpell.java` and `PhantasyArena.java` spell resolution.
- [ ] **Enemy AI**: Each enemy has attack patterns. Basic pattern: random attack or special move based on enemy data. Java reference: `PSLibEnemy.java` and `PhantasyArena.java`.
- [ ] **Experience and Meseta rewards**: On victory, distribute XP and Meseta to surviving party members.
- [ ] **Level-up logic**: When XP threshold reached, increment level, increase stats, learn new spells. Java reference: `PartyMember.java` levelup.
- [ ] **Party damage** (`PSGame.ts` lines 1258–1262): Implement `damageAllParty()` and `damageRandomPartyMember()`.
- [ ] **Game over**: When all party members reach 0 HP, trigger game over screen. Java reference: `PSGame.java` line 1151 area.
- [ ] **Battle animations**: Play attack/spell/damage sprite animations during battle turns. Animation JSON files already exist in `src/demos/ps/battle/`.
- [ ] **Item use in battle**: Allow using healing items during battle via Item command.
- [ ] **Flee mechanic**: Implement escape calculation (chance based on party speed vs enemy speed).

---

## 6. Phantasy Star — Menu System Completion

- [ ] **PSMenuMain – character status display**: Show HP/MP/stats correctly for all 4 characters using live `PartyMember` data.
- [ ] **PSMenuMain – equipment menu**: Equipping/unequipping items must update `PartyMember` stats in real time. Java reference: `PSMenu.java` equipment section.
- [ ] **PSMenuMain – formation menu**: Reordering party members changes battle positions and defense bonuses.
- [ ] **PSMenuShop – buy/sell**: Verify Meseta deduction on buy, item addition to inventory, and correct stock display per city.
- [ ] **Button hook integration** (`PSMenu.ts`): Complete button hook wiring so A/B/Start/Back map consistently to confirm/cancel/menu-open inside all menu contexts.
- [ ] **Map rendering control** (`PSMenu.ts` TODO): When a full-screen menu is open, pause map/entity updates.
- [ ] **In-game save/load**: Implement save slots (browser localStorage or IndexedDB). Java reference: `PSGame.java` save/load section.

---

## 7. Phantasy Star — Title Screen Completion

- [ ] **Odin start**: Implement `startmap("space/Space.map")` path — space overworld scene. Java reference: `Title.java` Odin branch.
- [ ] **Noah start**: Same space map, different starting position. Java reference: `Title.java` Noah branch.
- [ ] **Extended start**: `mapswitch()` to Dezoris starting location. Needs `Dezoris.ts` map (see §3).
- [ ] **PSArena mode**: Wire `PhantasyArena` standalone battle mode. This can be a separate Phaser scene.

---

## 8. Phantasy Star — Transport / Space Travel

- [ ] **Land Rover**: Vehicle mode on Motavia, bypasses certain terrain. Speed change, passability rules.
- [ ] **Hovercraft**: Water/land movement on Palma.
- [ ] **Spaceship**: Interplanetary travel — launches space overworld map, allows flying between Palma/Motavia/Dezoris. Java reference: `PSGame.java` transport section.
- [ ] **Space overworld map**: Load and render `space/Space.map` with planet landing zones.

---

## 9. AK Demo (Alex Kidd Platformer)

- [ ] **Player physics**: Implement gravity, velocity, ground collision in `AkMovement.ts`. Java reference: `AK.java` physics section.
- [ ] **Jumping**: Jump with variable height (tap vs hold). Land detection.
- [ ] **Enemy AI**: Basic enemy patrol/bounce movement in `AkEnemies.ts`. Java reference: `AK.java` enemy loop.
- [ ] **Rock punch mechanic**: Player can punch rocks; rock fragments fly and destroy enemies.
- [ ] **Player states**: Implement additional states — swim, moto, helicopter, flying. Java reference: `AK.java` condition constants.
- [ ] **Scoring and gold**: Collect gold bags, display score. Java reference: `AK.java` scoring section.
- [ ] **Level completion**: Reach end of level → transition to next level via `MapScene`.
- [ ] **Power-ups**: Bracelet and other pick-ups. Java reference: `AK.java` powerup section.
- [ ] **Dynamic music per level**: Music selection based on level from `music-manifest.ts`. Java reference: `AK.java` music loading.

---

## 10. Testing

- [ ] **Demo1**: Walk around island map, verify camera scrolling and animation. ✓ Already working.
- [ ] **Demo2**: Tree cutting — chop all visible trees, verify tile replacement and SFX.
- [ ] **Demo3**: Play each of the 10 VGM/VGZ files; verify play/stop/file-switch with keyboard and mobile buttons.
- [ ] **PS Title**: Cycle all menu options; verify Credits slideshow, Language switch, Load game (empty state).
- [ ] **PS Overworld – Camineet**: Walk full city, enter/exit all buildings, talk to all NPCs, trigger shop.
- [ ] **PS Overworld – all 24 maps**: Visit each city, verify music change, map transitions, NPC dialog.
- [ ] **PS Dungeon – Warehouse**: Enter, navigate all floors, test darkness (with/without pendant), open locked doors, reach bottom.
- [ ] **PS Dungeon – all 36 dungeons**: Enter each dungeon, navigate at least one floor, verify correct wall/floor graphics.
- [ ] **PS Battle**: Trigger overworld random battle, complete one full combat round with all 4 characters, verify XP/level-up.
- [ ] **PS Battle – spells**: Cast at least one of each spell category (attack, heal, support, instant-kill).
- [ ] **PS Battle – game over**: Allow all party members to die, verify game over screen and return to title.
- [ ] **PS Save/Load**: Save game mid-progress, reload page, load save, verify state restored.
- [ ] **PS Full playthrough**: Complete the game from Alis start — reach Lassic, defeat Dark Falz, see ending. (Final acceptance test.)
- [ ] **AK Demo**: Complete level 1 from start to end without dying.
- [ ] **Mobile controls**: Test joystick + all buttons on a touch device for each demo.
- [ ] **Gamepad**: Verify gamepad input works for PS demo menus and overworld movement.
