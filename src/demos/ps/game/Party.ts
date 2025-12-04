/**
 * Party - Party Management System
 * Direct port of Party.java - Manages party members, quest items, and party formation
 */

import { PartyMember, Gender } from './PartyMember';
import { Item, ItemType } from './Item';
import { Job } from './Job';
import { Specie } from './Specie';
import { GameType } from './GameData';
import { PS1Image } from './PSLibImage';
import { PS1Sound } from './PSLibSound';
import { OriginalItem } from './PSLibItem';
import { PSGame } from '../PSGame';
import { MainEngine } from '../../../core/MainEngine';

// Forward declarations for types that will be implemented later
export interface Entity {
  // Will be defined when we port Entity system
  getx(): number;
  gety(): number;
  getFace(): number;
  setSpeed(speed: number): void;
  setFace(direction: number): void;
  setActive(active: boolean): void;
  setVisible(visible: boolean): void;
  getFollower(): Entity | null;
}

export class Party {
  public static readonly TRANSPORT_SPEED: number = 400;
  public static readonly WALKING_SPEED: number = 200;

  public mst: number = 0; // Mesetas (currency)
  private members: PartyMember[] = [];
  private questItems: Item[] = [];
  private order: number[] = [];

  constructor(gametype?: GameType) {
    console.log(`Party constructor: gametype = ${gametype}, GameType.PS_ORIGINAL = ${GameType.PS_ORIGINAL}`);

    if (gametype === undefined) {
      // Empty constructor
      console.log('Party constructor: No gametype provided');
      return;
    }

    console.log(`Party constructor: Creating party for gametype ${gametype}`);

    switch (gametype) {
      case GameType.PS_ORIGINAL:
        console.log('Party constructor: Creating PS_ORIGINAL party with Alis');
        this.addMember(new PartyMember(
          Gender.FEMALE,
          Specie.PALMAN,
          Job.ADVENTURER,
          PSGame.getString("Name_Alis"),
          PS1Image.PORTRAIT_ALIS,
          "Alis.anim.json"
        ));
        console.log(`Party constructor: Added member, party size now ${this.members.length}`);

        // Add Road Pass for debugging spaceport transitions
        this.addQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass));
        console.log('Party constructor: Added Road Pass for debugging');

        // Commented out additional members from original
        // this.addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), "chars/myau.chr"));
        // this.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, PSGame.getString("Name_Odin"), "chars/odin.chr"));
        // this.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, PSGame.getString("Name_Noah"), "chars/noah.chr"));
        // this.setOrder([0, 3, 2, 1]);
        break;

      case GameType.PS_PARTY:
        // Note: Would need PartyCreator implementation
        // this.members = PartyCreator.createParty(5);
        console.warn('PS_PARTY gametype not yet implemented - requires PartyCreator');
        break;

      case GameType.PS_ARENA:
        this.addMember(new PartyMember(
          Gender.FEMALE,
          Specie.PALMAN,
          Job.ADVENTURER,
          PSGame.getString("Name_Alis"),
          "chars/Alis.chr"
        ));
        break;

      case GameType.PS_START_AS_ODIN:
        this.addMember(new PartyMember(
          Gender.MALE,
          Specie.PALMAN,
          Job.FIGHTER,
          PSGame.getString("Name_Odin"),
          PS1Image.PORTRAIT_ODIN,
          "chars/Odin.chr"
        ));
        break;

      case GameType.PS_START_AS_NOAH:
        this.addMember(new PartyMember(
          Gender.MALE,
          Specie.PALMAN,
          Job.ESPER,
          PSGame.getString("Name_Noah"),
          PS1Image.PORTRAIT_NOAH,
          "chars/Noah.chr"
        ));
        this.getMember(0)?.advanceLevel();
        this.getMember(0)?.advanceLevel();
        this.getMember(0)?.heal();

        this.addMember(new PartyMember(
          Gender.MALE,
          Specie.PALMAN,
          Job.ESPER,
          "Tajim",
          PS1Image.PORTRAIT_NOAH,
          "chars/Tarzimal.chr"
        ));
        // Advance Tajim to level 16
        for (let i = 0; i < 15; i++) {
          this.getMember(1)?.advanceLevel();
        }
        this.getMember(1)?.heal();
        // Note: Would need PSGame.getItem implementation
        // this.getMember(1)?.equipItem(PSGame.getItem(OriginalItem.Armor_Frad_Cloak));
        // this.getMember(1)?.equipItem(PSGame.getItem(OriginalItem.Weapon_Psycho_Wand));
        break;

      default:
        console.error(`Party constructor: Unknown gametype ${gametype}`);
        break;
    }

    // Set initial mesetas
    this.mst = 259;

    console.log(`Party constructor completed: ${this.members.length} members, order: [${this.order}], ${this.mst} MST`);
  }

  public partySize(): number {
    return this.members.length;
  }

  public getMember(member: number): PartyMember | null {
    if (!this.members || member >= this.members.length) {
      return null;
    }
    return this.members[member];
  }

  public getMembers(): PartyMember[] {
    return this.members;
  }

  public listMembers(): string[] {
    const names: string[] = new Array(this.members.length);
    for (let i = 0; i < names.length; i++) {
      names[i] = this.members[i].getName();
    }
    return names;
  }

  public addMember(member: PartyMember): void {
    this.members.push(member);
    if (!this.order) {
      this.order = [0];
    } else {
      const tmpOrder: number[] = new Array(this.order.length + 1);
      for (let i = 0; i < this.order.length; i++) {
        tmpOrder[i] = this.order[i];
      }
      tmpOrder[this.order.length] = this.order.length;
      this.order = tmpOrder;
    }
  }

  // Set party order, like [0,1,2,3] or [0,3,2,1] - direct port from Java
  public setOrder(orders: number[]): void {
    let sum = 0;
    for (let i = 0; i < orders.length; i++) { // Check if order is valid
      sum += i;
      sum -= orders[i];
    }
    if (sum !== 0) {
      console.error("Party::Invalid Party order.");
      return;
    }
    this.order = orders;
  }

  public healAll(revive: boolean): void {
    for (const member of this.members) {
      if (member.getHp() > 0 || revive) {
        member.heal();
      }
    }
  }

  public addQuestItem(item: Item): void {
    if (!this.hasQuestItem(item)) {
      PSGame.playSound(PS1Sound.ITEM);
      this.questItems.push(item);
    }
  }

  public removeItem(item: Item): void {
    const index = this.questItems.findIndex(i => i.equals(item));
    if (index !== -1) {
      this.questItems.splice(index, 1);
    }
  }

  public listQuestItems(): Item[] {
    return this.questItems;
  }

  public hasQuestItem(item: Item): boolean {
    return this.questItems.some(i => i.equals(item));
  }

  // Entity allocation methods (simplified for now - would need full Entity system)

  /**
   * Allocate party entities in the map - direct port from Java
   */
  public async allocate(gotox: number, gotoy: number): Promise<void> {
    console.log(`Party.allocate: Allocating ${this.members.length} party members at (${gotox}, ${gotoy})`);
    console.log(`Party.allocate: Order array:`, this.order);
    console.log(`Party.allocate: Members:`, this.members.map(m => m.getName()));

    const currentScene = PSGame.getCurrentScene();
    if (!currentScene) {
      console.error('Party.allocate: No current scene available');
      return;
    }

    let last = -1;
    for (let i = this.members.length - 1; i >= 0; i--) {
      const player = this.members[this.order[i]];

      if (player.getHp() <= 0) {
        console.log(`Party.allocate: Skipping dead member ${player.getName()}`);
        continue;
      }

      console.log(`Party.allocate: Spawning ${player.getName()} with chr ${player.getCharPath()}`);
      console.log(`Party.allocate: Expected charPath should be "Alis", got:`, player.getCharPath());

      if (last === -1) {
        // First party member (usually the player character)
        last = await MainEngine.entityspawn(currentScene, gotox, gotoy, player.getCharPath(), 'src/demos/ps/chars');
        console.log(`Party.allocate: First member spawned at index ${last}`);
      } else {
        const previous = last;
        last = await MainEngine.entityspawn(currentScene, gotox, gotoy, player.getCharPath(), 'src/demos/ps/chars');
        MainEngine.entitystalk(previous, last);
        console.log(`Party.allocate: Member spawned at index ${last}, stalking ${previous}`);
      }
    }

    if (last !== -1) {
      // Set the last spawned entity as the player
      const playerEntity = MainEngine.setplayer(last);
      if (playerEntity) {
        playerEntity.setSpeed(Party.WALKING_SPEED);
        console.log(`Party.allocate: Player set to entity ${last} with speed ${Party.WALKING_SPEED}`);
      }
    }

    // Set player movement preferences
    MainEngine.setPlayerDiagonals(true);
    MainEngine.setSmoothDiagonals(true);
    console.log('Party.allocate: Player movement settings configured');
  }

  /**
   * Reallocate party according to new order or after members killed
   */
  public reallocate(): void {
    // Note: This would need full Entity system implementation
    console.warn('Party.reallocate() not fully implemented - requires Entity system');

    /*
    if (entities.isEmpty()) {
      return;
    }
    const x = Math.floor(entities.get(player).getx() / 16);
    const y = Math.floor(entities.get(player).gety() / 16);

    this.deallocate();
    this.allocate(x, y);
    */
  }

  public deallocate(): void {
    // Note: This would need full Entity system implementation
    console.warn('Party.deallocate() not fully implemented - requires Entity system');

    /*
    if (player === -1) {
      return;
    }
    let e = entities.get(player);
    while (e !== null) {
      e.setActive(false);
      e.setVisible(false);
      e = e.getFollower();
    }
    */
  }

  public embark(x: number, y: number, strChar: string): void {
    // Note: This would need full Entity system implementation
    console.warn('Party.embark() not fully implemented - requires Entity system');

    /*
    const direction = player === -1 ? Entity.NORTH : entities.get(player).getFace();
    this.deallocate();

    playerdiagonals = false;
    smoothdiagonals = false;

    setplayer(entityspawn(x, y, strChar));
    entities.get(player).setSpeed(Party.TRANSPORT_SPEED);
    entities.get(player).setFace(direction);
    */
  }

  public disembark(x: number, y: number): void {
    // Note: This would need full Entity system implementation
    console.warn('Party.disembark() not fully implemented - requires Entity system');

    /*
    entities.get(player).setSpeed(Party.WALKING_SPEED);
    entities.get(player).setActive(false);
    entities.get(player).setVisible(false);

    this.allocate(x, y);
    */
  }

  public getFirstAlivePlayer(): number {
    for (let i = 0; i < this.getMembers().length; i++) {
      if (this.getMember(i)!.getHp() > 0) {
        return i;
      }
    }
    return 0;
  }

  public checkForFullAndAddItem(item: Item): boolean {
    // Check for full inventory space
    let member = -1;
    for (let i = 0; i < this.getMembers().length; i++) {
      if (this.getMember(i)!.getItems().length < PartyMember.ITEMS_SIZE) {
        member = i;
        break;
      }
    }

    if (member === -1) {
      // Note: Would need PSMenu implementation
      // PSMenu.StextLast(PSGame.getString("Shop_Full"));
      console.warn('Inventory full!');
      return false;
    } else {
      this.getMember(member)!.addItem(item);
      PSGame.playSound(PS1Sound.ITEM);
      return true;
    }
  }

  // Utility methods for party management
  public getTotalLevel(): number {
    return this.members.reduce((total, member) => total + member.getLevel(), 0);
  }

  public getAverageLevel(): number {
    if (this.members.length === 0) return 0;
    return Math.floor(this.getTotalLevel() / this.members.length);
  }

  public isAnyoneDead(): boolean {
    return this.members.some(member => member.getHp() <= 0);
  }

  public isEveryoneDead(): boolean {
    return this.members.every(member => member.getHp() <= 0);
  }

  public getAliveMembers(): PartyMember[] {
    return this.members.filter(member => member.getHp() > 0);
  }

  public getDeadMembers(): PartyMember[] {
    return this.members.filter(member => member.getHp() <= 0);
  }

  // Currency management
  public addMesetas(amount: number): void {
    this.mst += amount;
  }

  public removeMesetas(amount: number): boolean {
    if (this.mst >= amount) {
      this.mst -= amount;
      return true;
    }
    return false;
  }

  public getMesetas(): number {
    return this.mst;
  }
}