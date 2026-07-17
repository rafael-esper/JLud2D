/**
 * Direct port of test/demos/ps/PSMenuShopTest.java — exercises PSMenuShop.Shop()
 * end-to-end (buy/sell flows) under ScriptEngine.TEST_SIMULATION. No real
 * Phaser scene is needed: MenuStack is given a stub scene, since none of the
 * menu classes touch it while TEST_SIMULATION short-circuits the wait loops
 * that would otherwise create real Phaser text/graphics objects.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ScriptEngine } from '../../../src/core/ScriptEngine';
import { PSMenu } from '../../../src/demos/ps/PSMenu';
import { MenuStack } from '../../../src/demos/ps/menu/MenuStack';
import { Party } from '../../../src/demos/ps/game/Party';
import { PartyMember, Gender } from '../../../src/demos/ps/game/PartyMember';
import { Job } from '../../../src/demos/ps/game/Job';
import { Specie } from '../../../src/demos/ps/game/Specie';
import { Item, ItemType } from '../../../src/demos/ps/game/Item';
import { Effect } from '../../../src/demos/ps/game/PSEffect';
import { PSMenuShop } from '../../../src/demos/ps/PSMenuShop';

function createPartyMemberRhys(): PartyMember {
  const rhys = new PartyMember(Gender.MALE, Specie.PALMAN, Job.ADVENTURER, 'Rhys', '');
  rhys.items = [
    new Item('Landrover', 1200, ItemType.VEHICLE, 0, Effect.NONE),
    new Item('Cola', 10, ItemType.ITEM, 0, Effect.NONE),
    new Item('Trimate', 100, ItemType.ITEM, 0, Effect.NONE),
  ];
  return rhys;
}

describe('PSMenuShop.Shop (port of PSMenuShopTest.java)', () => {
  let party: Party;
  let itemList: Item[];

  beforeEach(() => {
    ScriptEngine.TEST_SIMULATION = true;
    PSMenu.instance = new MenuStack({} as any, {} as any);

    party = new Party();
    party.addMember(createPartyMemberRhys());
    party.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.HUNTER, 'Cache', ''));
    party.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, 'Best', ''));

    itemList = [
      new Item('Monomate', 10, ItemType.ITEM, 0, Effect.NONE),
      new Item('Dimate', 40, ItemType.ITEM, 0, Effect.NONE),
      new Item('Trimate', 100, ItemType.ITEM, 0, Effect.NONE),
    ];
  });

  async function shop(options: number[], mst: number, sellOption = true, items = itemList): Promise<void> {
    ScriptEngine.resetTestSimulation(options);
    party.mst = mst;
    await PSMenuShop.Shop('Store House', sellOption, party, items);
  }

  it('just enters, sees the buy list, then cancels twice', async () => {
    await shop([1, 0, 0], 1000);
    expect(party.mst).toBe(1000);
  });

  it('tries to buy item 1 without enough money', async () => {
    await shop([1, 1], 1);
    expect(party.mst).toBe(1);
  });

  it('tries to buy item 2 without enough money', async () => {
    await shop([1, 2], 35);
    expect(party.mst).toBe(35);
  });

  it('tries to buy item 3 without enough money', async () => {
    await shop([1, 3], 99);
    expect(party.mst).toBe(99);
  });

  it('buys everything until money is spent', async () => {
    await shop([1, 1, 0, 2, 3, 1, 1, 2], 50);
    expect(party.mst).toBe(0);
  });

  it('unique member buys everything until money is spent', async () => {
    party.getMembers().length = 0;
    party.addMember(createPartyMemberRhys());
    await shop([1, 1, 1, 1, 1, 1, 1, 1], 30);
    expect(party.mst).toBe(0);
  });

  it('sells nothing', async () => {
    await shop([2, 1, 0, 2, 0, 3, 0, 0, 0], 50);
    expect(party.mst).toBe(50);
  });

  it('sells Cola', async () => {
    await shop([2, 1, 2, 1, 0, 0, 0], 50);
    expect(party.mst).toBe(55);
  });

  it('sells without items', async () => {
    await shop([2, 2, 2, 1, 0, 0, 0], 50);
    expect(party.mst).toBe(50);
  });

  it('unique member sells Cola', async () => {
    party.getMembers().length = 0;
    party.addMember(createPartyMemberRhys());
    await shop([2, 2, 1, 0, 0, 0], 50);
    expect(party.mst).toBe(55);
    expect(party.getMember(0)!.items.length).toBe(2);
  });

  it("unique member can't sell a vehicle item", async () => {
    party.getMembers().length = 0;
    party.addMember(createPartyMemberRhys());
    await shop([2, 1, 0, 0, 0], 50);
    expect(party.mst).toBe(50);
    expect(party.getMember(0)!.items.length).toBe(3);
  });

  it('unique member has nothing to sell', async () => {
    party.getMembers().length = 0;
    party.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, 'Hahn', ''));
    await shop([2, 0, 0], 50);
    expect(party.mst).toBe(50);
    expect(party.getMember(0)!.items.length).toBe(0);
  });

  it('buys Dimate for player 2 then sells it back', async () => {
    await shop([1, 2, 2, 0, 2, 2, 1, 1, 0, 0], 50);
    expect(party.mst).toBe(30);
    expect(party.getMember(1)!.items.length).toBe(0);
  });

  it('weapon shop: buys nothing', async () => {
    const weaponItems = [
      new Item('Gloves', 100, ItemType.GLOVES, 0, Effect.NONE),
      new Item('Barrier', 400, ItemType.BARRIER, 0, Effect.NONE),
      new Item('Mail', 1000, ItemType.MAIL, 0, Effect.NONE),
    ];
    await shop([0], 150, false, weaponItems);
    expect(party.mst).toBe(150);
    expect(party.getMember(0)!.items.length).toBe(3);
  });

  it('weapon shop: buys and equips an item', async () => {
    const weaponItems = [
      new Item('Sword', 100, ItemType.SWORD, 35, Effect.NONE),
      new Item('Barrier', 400, ItemType.BARRIER, 35, Effect.NONE),
      new Item('Mail', 1000, ItemType.MAIL, 25, Effect.NONE),
    ];
    const initialAttack = party.getMember(0)!.getAtk();
    await shop([1, 1, 1, 0], 150, false, weaponItems);
    expect(party.mst).toBe(50);
    expect(party.getMember(0)!.items.length).toBe(3);
    expect(party.getMember(0)!.getAtk()).toBe(initialAttack + 35);
  });

  it("weapon shop: buys but doesn't equip an item", async () => {
    const weaponItems = [
      new Item('Sword', 100, ItemType.SWORD, 35, Effect.NONE),
      new Item('Barrier', 400, ItemType.BARRIER, 35, Effect.NONE),
      new Item('Mail', 1000, ItemType.MAIL, 25, Effect.NONE),
    ];
    const initialAttack = party.getMember(0)!.getAtk();
    await shop([1, 1, 2, 0], 150, false, weaponItems);
    expect(party.mst).toBe(50);
    expect(party.getMember(0)!.items.length).toBe(4);
    expect(party.getMember(0)!.getAtk()).toBe(initialAttack);
  });

  it('weapon shop: buys and equips all three slots', async () => {
    const weaponItems = [
      new Item('Sword', 1000, ItemType.SWORD, 35, Effect.NONE),
      new Item('Shield', 3000, ItemType.LIGHT_SHIELD, 50, Effect.NONE),
      new Item('Mail', 2000, ItemType.MAIL, 25, Effect.NONE),
    ];
    const initialAttack = party.getMember(0)!.getAtk();
    const initialDefense = party.getMember(0)!.getDef();
    await shop([1, 1, 1, 2, 1, 1, 3, 1, 1, 0], 16000, false, weaponItems);
    expect(party.mst).toBe(10000);
    expect(party.getMember(0)!.items.length).toBe(3);
    expect(party.getMember(0)!.getAtk()).toBe(initialAttack + 35);
    expect(party.getMember(0)!.getDef()).toBe(initialDefense + 50 + 25);
  });

  it("weapon shop: buys an item the class can't equip, cancels", async () => {
    const weaponItems = [
      new Item('Axe', 100, ItemType.AXE, 0, Effect.NONE),
      new Item('Barrier', 400, ItemType.BARRIER, 0, Effect.NONE),
      new Item('Mail', 1000, ItemType.MAIL, 0, Effect.NONE),
    ];
    await shop([1, 1, 0, 0], 150, false, weaponItems);
    expect(party.mst).toBe(150);
    expect(party.getMember(0)!.items.length).toBe(3);
  });

  it("weapon shop: buys an item the class can't equip, keeps it anyway", async () => {
    const weaponItems = [
      new Item('Axe', 100, ItemType.AXE, 0, Effect.NONE),
      new Item('Barrier', 400, ItemType.BARRIER, 0, Effect.NONE),
      new Item('Mail', 1000, ItemType.MAIL, 0, Effect.NONE),
    ];
    await shop([1, 1, 1, 0, 0], 150, false, weaponItems);
    expect(party.mst).toBe(50);
    expect(party.getMember(0)!.items.length).toBe(4);
  });
});
