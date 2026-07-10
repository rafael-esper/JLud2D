/**
 * Gothic Village Script
 * TypeScript port of Gothic.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, LargeEntity, NecroType, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
import { PSOutcome } from '../menu/MenuStack';
import { MainEngine } from '../../../core/MainEngine';
import { EntityDirection } from '../../../domain/Entity';

// NecroType values act as the "clothes" frame offset, same numeric slot as EntityClothes.
const necro = (n: NecroType): EntityClothes => n as unknown as EntityClothes;

export class Gothic {

  public static async startmap(): Promise<void> {
    // Base map initialization is handled by the engine when the map loads.
    // Java: when SPACESHIP_AREA is set, remove the obstacle at (13,14) and
    // nudge entity 0 away (entitymove "L1 U1 F0" approximated with a direct offset)
    if (PSGame.hasFlag(Flags.SPACESHIP_AREA)) {
      MainEngine.getCurrentMap()?.setobs(13, 14, 0);
      Gothic.nudgeSpaceshipEntity();
    }
  }

  private static nudgeSpaceshipEntity(): void {
    const e = MainEngine.getEntity(0);
    if (e) {
      e.setxy(e.getx() - 16, e.gety() - 16);
      e.setFace(EntityDirection.NORTH);
    }
  }

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BLOND, EntityClothes.WHITE);
    await PSGame.Hospital(1);
    await PSMenu.endScene();
  }

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH_VILLAGE, SpecialEntity.PRIEST);
    await PSGame.Church(1);
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Flash),
      PSGame.getItem(OriginalItem.Inventory_TranCarpet),
      PSGame.getItem(OriginalItem.Inventory_Light_Pendant)
    ]);
    await PSMenu.endScene();
  }

  public static async house(): Promise<void> {
    if (!PSGame.hasFlag(Flags.INFO_GOTHIC_NECRO)) {
      await PSMenu.startScene(PSSceneType.RUINED_HOUSE, SpecialEntity.NONE);
      await PSMenu.instance.waitAnyButton();
    } else {
      await PSMenu.startScene(PSSceneType.RUINED_HOUSE, EntityType.NECRO, necro(NecroType.PALMAN));
      if (await PSMenu.Prompt(PSGame.getString("Gothic_Necro_Palman"), PSGame.getYesNo()) === 1) {
        await PSMenu.StextLast(PSGame.getString("Gothic_Necro_Palman_Yes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Gothic_Necro_Palman_No"));
      }
    }
    await PSMenu.endScene();
  }

  public static async luveno(): Promise<void> {
    if (!PSGame.hasFlag(Flags.LUVENO_FREE)) {
      await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.NONE);
      await PSMenu.instance.waitB1();
    } else {
      await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.LUVENO);
      if (!PSGame.hasFlag(Flags.GOT_ASSISTANT)) {
        await PSMenu.Stext(PSGame.getString("Gothic_House_Luveno"));
      } else {
        if (!PSGame.hasFlag(Flags.LUVENO_FEE)) {
          if (await PSMenu.Prompt(PSGame.getString("Gothic_House_Luveno_pos_Assistant"), PSGame.getYesNo()) === 1) {
            if (PSGame.getParty().mst < 1200) {
              await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_fee_NotEnough"));
            } else {
              PSGame.getParty().mst -= 1200;
              await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_fee_Yes"));
              PSGame.setFlag(Flags.LUVENO_FEE);
            }
          } else {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_fee_No"));
          }
        } else { // Has paid Luveno already
          if (!PSGame.hasFlag(Flags.LUVENO_WAIT1)) {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_work1"));
            PSGame.setFlag(Flags.LUVENO_WAIT1);
          } else if (!PSGame.hasFlag(Flags.LUVENO_WAIT2)) {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_work2"));
            PSGame.setFlag(Flags.LUVENO_WAIT2);
          } else if (!PSGame.hasFlag(Flags.LUVENO_WAIT3)) {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_work3"));
            PSGame.setFlag(Flags.LUVENO_WAIT3);
          } else if (!PSGame.hasFlag(Flags.LUVENO_READY)) {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_ready"));
            PSGame.setFlag(Flags.LUVENO_READY);
          } else if (!PSGame.hasFlag(Flags.GOT_HAPSBY)) {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_before_hapsby"));
          } else if (!PSGame.hasFlag(Flags.LUVENO_BOARD)) {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_with_hapsby"));
            PSGame.setFlag(Flags.LUVENO_BOARD);
          } else {
            await PSMenu.StextLast(PSGame.getString("Gothic_House_Luveno_after_hapsby"));
          }
        }
      }
    }
    await PSMenu.endScene();
  }

  public static async assist(): Promise<void> {
    if (!PSGame.hasFlag(Flags.GOT_ASSISTANT)) {
      await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.NONE);
      await PSMenu.instance.waitB1();
    } else {
      await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.WHITE);
      await PSMenu.Stext(PSGame.getString("Spaceport_Passage_Assistant"));
    }
    await PSMenu.endScene();
  }

  public static async beggar1(): Promise<void> {
    PSGame.EntStart();
    if (!PSGame.hasFlag(Flags.LUVENO_BOARD)) {
      await PSMenu.Stext(PSGame.getString("Gothic_People_Ent3"));
    } else {
      await PSMenu.Stext(PSGame.getString("Gothic_People_Ent3_hapsby"));
      if (!PSGame.hasFlag(Flags.SPACESHIP_AREA)) {
        MainEngine.getCurrentMap()?.setobs(13, 14, 0);
        Gothic.nudgeSpaceshipEntity();
      }
      PSGame.setFlag(Flags.SPACESHIP_AREA);
    }
    PSGame.EntFinish();
  }

  public static async beggar2(): Promise<void> {
    PSGame.EntStart();
    if (await PSMenu.Prompt(PSGame.getString("Gothic_People_Ent1"), PSGame.getYesNo()) === 1) {
      const foundCola = PSGame.findItemWithParty(OriginalItem.Inventory_Monomate, true);
      if (foundCola) {
        await PSMenu.StextLast(PSGame.getString("Gothic_People_Ent1Yes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Gothic_People_EntNotEnoughCola"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Gothic_People_Ent1No"));
    }
    PSGame.EntFinish();
  }

  public static async beggar3(): Promise<void> {
    PSGame.EntStart();
    if (await PSMenu.Prompt(PSGame.getString("Gothic_People_Ent2"), PSGame.getYesNo()) === 1) {
      const foundCola = PSGame.findItemWithParty(OriginalItem.Inventory_Monomate, true);
      if (foundCola) {
        await PSMenu.StextLast(PSGame.getString("Gothic_People_Ent2Yes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Gothic_People_EntNotEnoughCola"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Gothic_People_Ent2No"));
    }
    PSGame.EntFinish();
  }

  public static async tunnel(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.GOTHIC_PASSAGEWAY_OUT);
  }

  public static async spaceship(): Promise<void> {
    await PSMenu.startSceneWithLargeEntity(PSSceneType.FOREST, LargeEntity.HAPSBY);
    await PSGame.hapsbyRoutine(City.GOTHIC);
    await PSMenu.endSceneWithOutcome(PSOutcome.FADE_HOUSE);
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.GOTHIC), CityHelper.getY(City.GOTHIC));
  }

  public static async flute(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLA, SpecialEntity.NONE);
    await PSMenu.instance.waitB1();
    if (PSGame.hasFlag(Flags.INFO_FLUTE) && !PSGame.hasFlag(Flags.GOT_FLUTE)) {
      const flute = PSGame.getItem(OriginalItem.Inventory_Soothe_Flute);
      await PSMenu.StextLast(PSGame.getString("Chest_Item", "<item>", flute.getName()));
      if (PSGame.getParty().checkForFullAndAddItem(flute)) {
        PSGame.setFlag(Flags.GOT_FLUTE);
      }
    }
    await PSMenu.endScene();
  }
}
