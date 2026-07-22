/**
 * Space - interplanetary travel map script
 * TypeScript port of Space.java. Reached from the Hapsby spaceship launch
 * (spaceshipRoutineAnimation); also plays the new-game intro when no
 * departure city is set.
 */

import { PSGame } from '../PSGame';
import { GameType, Flags } from '../game/GameData';
import { Planet, City } from '../game/City';
import { PS1Image } from '../game/PSLibImage';
import { PS1Music } from '../game/PSLibMusic';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { MainEngine } from '../../../core/MainEngine';
import { ScriptEngine } from '../../../core/ScriptEngine';
import { EntityDirection } from '../../../domain/Entity';

const SPACE_BASE = 'src/demos/ps/space';

export class Space {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Space);

    // INTRO
    if (PSGame.getFromCity() === null) {
      await Space.intro();
      return;
    }

    MainEngine.setCameraTracking(1);

    const currentScene = PSGame.getCurrentScene();
    if (!currentScene) return;

    if (PSGame.getFromCity() === City.CAMINEET || PSGame.getFromCity() === City.GOTHIC) {
      const ent = await MainEngine.entityspawn(currentScene, 5, 96, 'Palma.anim.json', SPACE_BASE);
      MainEngine.getEntity(ent)?.setFace(EntityDirection.NORTH);
    }
    if (PSGame.getFromCity() === City.PASEO || PSGame.getFromCity() === City.UZO) {
      const ent = await MainEngine.entityspawn(currentScene, 5, 96, 'Mota.anim.json', SPACE_BASE);
      MainEngine.getEntity(ent)?.setFace(EntityDirection.NORTH);
    }
    if (PSGame.getFromCity() === City.SKURE) {
      const ent = await MainEngine.entityspawn(currentScene, 5, 96, 'Dezo.anim.json', SPACE_BASE);
      MainEngine.getEntity(ent)?.setFace(EntityDirection.NORTH);
    }

    if (PSGame.getToCity() === City.CAMINEET || PSGame.getToCity() === City.GOTHIC) {
      const ent = await MainEngine.entityspawn(currentScene, 5, 0, 'Palma.anim.json', SPACE_BASE);
      MainEngine.getEntity(ent)?.setFace(EntityDirection.SOUTH);
    }
    if (PSGame.getToCity() === City.PASEO || PSGame.getToCity() === City.UZO) {
      const ent = await MainEngine.entityspawn(currentScene, 5, 0, 'Mota.anim.json', SPACE_BASE);
      MainEngine.getEntity(ent)?.setFace(EntityDirection.SOUTH);
    }
    if (PSGame.getToCity() === City.SKURE) {
      const ent = await MainEngine.entityspawn(currentScene, 5, 0, 'Dezo.anim.json', SPACE_BASE);
      MainEngine.getEntity(ent)?.setFace(EntityDirection.SOUTH);
    }

    await PSGame.spaceshipRoutineEnd();
  }

  public static async intro(): Promise<void> {
    const currentScene = PSGame.getCurrentScene();
    if (!currentScene) return;

    const ent = await MainEngine.entityspawn(currentScene, 5, 96, 'Palma.anim.json', SPACE_BASE);
    MainEngine.getEntity(ent)?.setFace(EntityDirection.NORTH);

    await PSGame.playMusic(PS1Music.INTRO);

    MainEngine.setCameraTracking(0);

    // Java: ywin scrolls from 1200 downward for 250 frames (b2 skips ahead).
    // The Java renderer clamps ywin to the map edge, so the scroll saturates
    // with the planet at the bottom of the screen; Phaser's setScroll doesn't
    // clamp, so do it here or the camera overshoots and centers the planet.
    const camera = currentScene.cameras.main;
    const inputManager = (currentScene as any)?.inputManager;
    const map = MainEngine.getCurrentMap();
    const maxScrollY = map ? map.getHeight() * map.getTileHeight() - 240 : 1360;
    camera.setScroll(0, 1200);
    await ScriptEngine.fadein(1, true);
    for (let count = 0; count < 250; count++) {
      if (inputManager?.b2) {
        inputManager.unpress(6); // b2 — held press must not leak into the next part
        camera.setScroll(0, Math.min(1200 + 249, maxScrollY));
        break;
      }
      camera.setScroll(0, Math.min(1200 + count, maxScrollY));
      await PSGame.waitFrames(1);
    }

    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      await Space.alisIntro();
    } else if (PSGame.getGameType() === GameType.PS_START_AS_ODIN) {
      await Space.odinIntro();
    } else if (PSGame.getGameType() === GameType.PS_START_AS_NOAH) {
      await Space.noahIntro();
    }
  }

  private static async alisIntro(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CITY, SpecialEntity.NONE);
    PSMenu.instance.push(PSMenu.instance.createOneLabelBox(15, 20, PSGame.getString("Intro_Time"), true));
    await PSMenu.instance.waitDelay(20, true);
    PSMenu.instance.push(PSMenu.instance.createOneLabelBox(15, 50, PSGame.getString("Intro_Place"), true));
    await PSMenu.instance.waitDelay(150, true);
    PSMenu.instance.pop();
    PSMenu.instance.pop();
    PSMenu.setMapOff();

    // Java: PSMenu.instance.back = new VImage(...) — black backdrop. A camera
    // fade would sit on TOP of the portraits (all we'd see is black), so swap
    // in the backdrop and clear the fade with an instant fadein (see Paseo).
    await ScriptEngine.fadeout(25, false);
    PSMenu.instance.setBlackBackground();
    await ScriptEngine.fadein(1, false);

    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_NERO1),
      [PSGame.getString("Cinematic_Intro_1"), PSGame.getString("Cinematic_Intro_2"), PSGame.getString("Cinematic_Intro_3")], true);

    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_NERO2),
      [PSGame.getString("Cinematic_Intro_4"), PSGame.getString("Cinematic_Intro_5")], true);

    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_PROMISE),
      [PSGame.getString("Cinematic_Intro_6")], true);

    // Java's endScene(FADE_HOUSE) ran after a deferred mapswitch, so its
    // fade-in landed on the new map; here endScene would flash the Space map
    // before Camineet loads — close to black and let the mapswitch reveal.
    await PSMenu.endSceneToBlack();

    PSGame.gameData.current_planet = Planet.PALMA;
    await PSGame.mapswitchToCity(City.CAMINEET, 29, 9); // Alis's house
  }

  private static async odinIntro(): Promise<void> {
    await ScriptEngine.fadeout(25, false);
    PSMenu.setMapOff();
    // Java: black-VImage backdrop; camera fade must be cleared or it covers
    // the portraits (see alisIntro)
    PSMenu.instance.setBlackBackground();
    await ScriptEngine.fadein(1, false);

    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_INTRO1),
      [PSGame.getString("Cinematic_Intro_Odin_1")], true);

    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_INTRO2),
      [PSGame.getString("Cinematic_Intro_Odin_2"), PSGame.getString("Cinematic_Intro_Odin_3")], true);

    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ODIN2),
      [PSGame.getString("Cinematic_Intro_Odin_4")], true);

    // Close to black — endScene would flash the Space map (see alisIntro)
    await PSMenu.endSceneToBlack();

    PSGame.setFlag(Flags.GOT_ODIN);
    PSGame.gameData.current_planet = Planet.PALMA;
    await PSGame.mapswitchToCity(City.SCION, 9, 16);
  }

  private static async noahIntro(): Promise<void> {
    await ScriptEngine.fadeout(25, false);
    PSMenu.setMapOff();
    // Java: black-VImage backdrop; camera fade must be cleared or it covers
    // the portraits (see alisIntro)
    PSMenu.instance.setBlackBackground();
    await ScriptEngine.fadein(1, false);

    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_INTRO2),
      [PSGame.getString("Cinematic_Intro_Odin_2"), PSGame.getString("Cinematic_Intro_Odin_3")], true);

    // Close to black — endScene would flash the Space map (see alisIntro)
    await PSMenu.endSceneToBlack();

    PSGame.gameData.current_planet = Planet.MOTAVIA;
    await PSGame.mapswitchToPlanet(Planet.MOTAVIA, 82, 34);
  }
}
