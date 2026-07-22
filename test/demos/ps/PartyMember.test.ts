/**
 * Direct port of test/demos/ps/PartyMemberTest.java — pure item/equip logic,
 * no Phaser scene involved.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Party } from '../../../src/demos/ps/game/Party';
import { PartyMember, Gender } from '../../../src/demos/ps/game/PartyMember';
import { Job } from '../../../src/demos/ps/game/Job';
import { Specie } from '../../../src/demos/ps/game/Specie';
import { Item, ItemType } from '../../../src/demos/ps/game/Item';
import { Effect } from '../../../src/demos/ps/game/PSEffect';

describe('PartyMember item/equip logic (port of PartyMemberTest.java)', () => {
  let party: Party;
  let initialAttack: number;

  beforeEach(() => {
    party = new Party();

    const rhys = new PartyMember(Gender.MALE, Specie.PALMAN, Job.ADVENTURER, 'Rhys', '');
    rhys.getItems().push(new Item('Landrover', 1200, ItemType.VEHICLE, 0, Effect.NONE));
    rhys.getItems().push(new Item('Cola', 10, ItemType.ITEM, 0, Effect.NONE));
    rhys.getItems().push(new Item('Trimate', 100, ItemType.ITEM, 0, Effect.NONE));

    initialAttack = rhys.getAtk();

    party.addMember(rhys);
  });

  it('adds an item then equips it by index, removing it from the inventory', () => {
    const rhys = party.getMember(0)!;

    rhys.addItem(new Item('Short Sword', 200, ItemType.SWORD, 35, Effect.NONE));
    expect(rhys.getItems().length).toBe(4);

    rhys.equipItemByIndex(3);
    expect(rhys.getItems().length).toBe(3);
    expect(rhys.getAtk()).toBe(initialAttack + 35);
  });

  it('replaces an already-equipped item, returning the old one to the inventory', () => {
    const rhys = party.getMember(0)!;

    rhys.equipItem(new Item('Short Sword', 100, ItemType.SWORD, 25, Effect.NONE));
    expect(rhys.getAtk()).toBe(initialAttack + 25);

    rhys.equipItem(new Item('Medium Sword', 200, ItemType.SWORD, 40, Effect.NONE));

    expect(rhys.getItems().length).toBe(4);
    expect(rhys.getAtk()).toBe(initialAttack + 40);
  });

  it('adding the same item twice and removing it once nets a single net addition', () => {
    const rhys = party.getMember(0)!;
    const initialSize = rhys.getNumItems();
    const monomate = new Item('Monomate', 10, ItemType.ITEM, 0, Effect.NONE);

    rhys.addItem(monomate);
    rhys.addItem(monomate);
    expect(rhys.getItems().length).toBe(initialSize + 2);

    rhys.removeItem(initialSize + 1);
    expect(rhys.getItems().length).toBe(initialSize + 1);

    rhys.removeItem(initialSize);
    expect(rhys.getItems().length).toBe(initialSize);
  });
});
