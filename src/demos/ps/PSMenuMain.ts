/**
 * PSMenuMain - Phantasy Star Main Menu System
 * Direct port of PSMenuMain.java - Handles the main game menu interface
 */

import { MenuStack, PSOutcome, PSCancellable } from './menu/MenuStack';
import { MenuPromptBox } from './menu/MenuPromptBox';
import { MenuLabelBox } from './menu/MenuLabelBox';
import { ScriptEngine } from '../../core/ScriptEngine';
import { PSGame } from './PSGame';
import { PSMenu } from './PSMenu';
import { Party } from './game/Party';
import { PartyMember } from './game/PartyMember';
import { PSLibSpell } from './game/PSLibSpell';
import { PSLibItem } from './game/PSLibItem';
import { PS1Sound } from './game/PSLibSound';
import { Item, EquipPlace } from './game/Item';
import { Enemy } from './game/Enemy';
import { City } from './game/City';
import { PSEffect, EffectOutcome, EffectPlace } from './game/PSEffect';
import { Spell } from './game/PSLibSpell';
import { Planet } from './game/GameData';

export class PSMenuMain {

  /**
   * Main menu entry point - direct port of Java menu()
   */
  public static async menu(): Promise<void> {
    // Disable menu hook and prepare
    PSMenu.menuOff();
    PSMenu.instance.checkPreMenu();

    // Clear any existing menus for robustness
    while (PSMenu.instance.hasMenu()) {
      console.error('A Menu was open before opening the Main Menu.');
      PSMenu.instance.pop();
    }

    // MST display box
    const mstBox = PSMenu.instance.createOneLabelBox(10, 200, `MST ${PSGame.getParty().getMst()}`, true);
    PSMenu.instance.push(mstBox);

    // Basic status display
    const statusLabelBox = PSMenu.instance.createLabelBox(200, 10, PSMenuMain.getBasicStats(), true);
    PSMenu.instance.push(statusLabelBox);

    // Main menu options
    const mainMenu = PSMenu.instance.createPromptBox(10, 10, [
      PSGame.getString('Menu_Stats'),
      PSGame.getString('Menu_Magic'),
      PSGame.getString('Menu_Items'),
      PSGame.getString('Menu_Quest'),
      PSGame.getString('Menu_Talk'),
      PSGame.getString('Menu_Options'),
      PSGame.getString('Menu_Load'),
      PSGame.getString('Menu_Save')
    ], true);
    PSMenu.instance.push(mainMenu);

    // Disable talk option for PS Original
    mainMenu.setDisabled(4);

    // Main menu loop
    while (true) {
      console.log('Menu!');
      const opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;

      if (opt === 0) {
        break;
      }

      switch (opt) {
        case 1: // Stats
          await PSMenuMain.statMenu();
          break;

        case 2: // Magic
          if (await PSMenuMain.magicMenu(statusLabelBox)) {
            return; // Close all menus
          }
          break;

        case 3: // Items
          if (await PSMenuMain.itemMenu(statusLabelBox)) {
            return; // Close all menus
          }
          break;

        case 4: // Quest
          await PSMenuMain.questMenu();
          break;

        case 5: // Talk
          // Not implemented for PS Original
          break;

        case 6: // Options
          if (await PSMenuMain.optionsMenu()) {
            return; // Exit to title screen
          }
          break;

        case 7: // Load
          PSGame.loadGame();
          // TODO: syncAfterLoading();
          return;

        case 8: // Save
          PSGame.saveGame();
          // TODO: syncAfterLoading();
          break;
      }
    }

    console.log('EndMenu!');
    PSMenu.instance.pop(); // Main menu
    PSMenu.instance.pop(); // Status
    PSMenu.instance.pop(); // MST

    PSMenu.menuOn();
    PSMenu.instance.checkPosMenu();
  }

  /**
   * Quest menu - direct port of Java questMenu()
   */
  private static async questMenu(): Promise<void> {
    const questMenu = PSMenu.instance.createPromptBox(70, 30, [
      PSGame.getString('Menu_Quest_Items'),
      PSGame.getString('Menu_Quest_Enemies'),
      PSGame.getString('Menu_Quest_Dungeons'),
      PSGame.getString('Menu_Quest_Log'),
      PSGame.getString('Menu_Order')
    ], true);
    PSMenu.instance.push(questMenu);

    // Disable unimplemented options
    questMenu.setDisabled(2); // Dungeons
    questMenu.setDisabled(3); // Log

    let opt = 0;
    while (opt !== -1) {
      opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

      if (opt === -1) {
        PSMenu.instance.pop();
        return;
      }

      switch (opt) {
        case 0: // Quest Items
          const questItems = PSGame.getParty().listQuestItems();
          if (questItems.length === 0) {
            await PSMenu.Stext(PSGame.getString('Menu_No_Quest_Items'));
          } else {
            const items = PSMenuMain.spacedList(Item.toString(questItems, false));
            const itemBox = PSMenu.instance.createLabelBox(100, 10, items, true);
            PSMenu.instance.push(itemBox);
            await PSMenu.instance.waitAnyButton();
            PSMenu.instance.pop();
          }
          break;

        case 1: // Enemies
          const enemyTypeMenu = PSMenu.instance.createPromptBox(150, 60, [
            'Palma', 'Motavia', 'Dezoris', 'Undead', 'Special'
          ], true);
          PSMenu.instance.push(enemyTypeMenu);

          const type = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
          switch (type) {
            case 0:
              await PSMenuMain.listVisitedEnemies(Enemy.Type.PALMA);
              break;
            case 1:
              await PSMenuMain.listVisitedEnemies(Enemy.Type.MOTAVIA);
              break;
            case 2:
              await PSMenuMain.listVisitedEnemies(Enemy.Type.DEZORIS);
              break;
            case 3:
              await PSMenuMain.listVisitedEnemies(Enemy.Type.UNDEAD);
              break;
            case 4:
              await PSMenuMain.listVisitedEnemies(Enemy.Type.SPECIAL);
              break;
          }
          PSMenu.instance.pop();
          break;

        case 4: // Order
          await PSMenuMain.orderMenu();
          break;
      }
    }
  }

  /**
   * Options menu - direct port of Java optionsMenu()
   */
  private static async optionsMenu(): Promise<boolean> {
    const optionsMenu = PSMenu.instance.createPromptBox(100, 30, [
      `${PSGame.getString('Menu_Options_Sound')}: ${PSGame.gameData.soundVolume}`,
      `${PSGame.getString('Menu_Options_Music')}: ${PSGame.gameData.musicVolume}`,
      `${PSGame.getString('Menu_Options_Messages')}: ${PSGame.gameData.battleInformation ? PSGame.getString('Menu_Choice_Yes') : PSGame.getString('Menu_Choice_No')}`,
      `${PSGame.getString('Menu_Options_Delay')}: ${PSGame.gameData.dungeonDelay}`,
      PSGame.getString('Menu_Language'),
      PSGame.getString('Title_Screen')
    ], true);
    PSMenu.instance.push(optionsMenu);

    const opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

    switch (opt) {
      case 0: // Sound Volume
        const soundMenu = PSMenu.instance.createPromptBox(130, 50, [
          '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'
        ], true);
        PSMenu.instance.push(soundMenu);
        const optSound = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        PSMenu.instance.pop();
        if (optSound >= 0) {
          PSGame.changeSoundVolume(optSound * 10);
        }
        break;

      case 1: // Music Volume
        const musicMenu = PSMenu.instance.createPromptBox(130, 50, [
          '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'
        ], true);
        PSMenu.instance.push(musicMenu);
        const optMusic = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        PSMenu.instance.pop();
        if (optMusic >= 0) {
          PSGame.changeMusicVolume(optMusic * 10);
        }
        break;

      case 2: // Battle Messages
        const optInfo = await PSMenu.Prompt(
          PSGame.getString('Menu_Options_Messages_Desc'),
          PSGame.getYesNo()
        );
        if (optInfo > 0) {
          PSGame.gameData.battleInformation = (optInfo === 1);
        }
        break;

      case 3: // Dungeon Delay
        const delay = await PSMenu.Prompt(
          PSGame.getString('Menu_Options_Delay_Desc'),
          [
            PSGame.getString('Menu_Options_Delay_4'),
            PSGame.getString('Menu_Options_Delay_3'),
            PSGame.getString('Menu_Options_Delay_2'),
            PSGame.getString('Menu_Options_Delay_1')
          ]
        );
        if (delay > 0) {
          PSGame.gameData.dungeonDelay = 5 - delay;
        }
        break;

      case 4: // Language
        await PSGame.languageMenu(100, 30);
        break;

      case 5: // Title Screen
        const confirmExit = await PSMenu.Prompt(
          PSGame.getString('Menu_Exit_Prompt'),
          PSGame.getYesNo()
        );
        if (confirmExit === 1) {
          PSMenu.setMapOff();
          PSGame.mapswitch('Title.map', 0, 0, false);
          PSMenu.instance.pop();
          return true;
        }
        break;
    }

    PSMenu.instance.pop();
    return false;
  }

  /**
   * Character stats menu - direct port of Java statMenu()
   */
  private static async statMenu(): Promise<void> {
    let partySel = 1;

    // Character selection if multiple party members
    if (PSGame.getParty().partySize() > 1) {
      const charMenu = PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true);
      PSMenu.instance.push(charMenu);
      partySel = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;
      if (partySel === 0) {
        PSMenu.instance.pop();
        return;
      }
    }

    const member = PSGame.getParty().getMember(partySel - 1);

    // Character portrait
    const portraitBox = PSMenu.instance.createImageBox(88, 10, PSGame.getImage(member.getPortrait()), true);
    PSMenu.instance.push(portraitBox);

    // Basic info
    const infoList = [
      ` ${member.getName().toUpperCase()}`,
      '',
      ` ${member.getSpecie().toString()}`,
      ` ${member.getJob().toString()}`,
      '',
      ` ${PSGame.getString('Stats_Level')} ${member.getLevel()}`,
      ` ${PSGame.getString('Stats_HP')}:${PSMenuMain.format(member.getHp(), 4)}/${PSMenuMain.format(member.getMaxHp(), 4)}`,
      ` ${PSGame.getString('Stats_MP')}:${PSMenuMain.format(member.getMp(), 4)}/${PSMenuMain.format(member.getMaxMp(), 4)}`
    ];
    const infoBox = PSMenu.instance.createLabelBox(200, 10, infoList, true);
    PSMenu.instance.push(infoBox);

    // Stats
    const statsList = [
      `${PSMenuMain.format(PSGame.getString('Stats_Strength'), 8, true)}: ${PSMenuMain.format(member.getStrength(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Agility'), 8, true)}: ${PSMenuMain.format(member.getAgility(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Mental'), 8, true)}: ${PSMenuMain.format(member.getMental(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Attack'), 8, true)}: ${PSMenuMain.format(member.getAttack(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Defense'), 8, true)}: ${PSMenuMain.format(member.getDefense(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Exp'), 4, true)}: ${PSMenuMain.format(member.getXp(), 7)}`
    ];
    const statsBox = PSMenu.instance.createLabelBox(200, 110, statsList, true);
    PSMenu.instance.push(statsBox);

    // Equipment
    const equipList: string[] = [];
    const equipPlaces = Object.values(EquipPlace);
    for (let i = 0; i < equipPlaces.length; i++) {
      if (equipList.length > 0) {
        equipList.push(PSMenuMain.format('', 15, false));
      }
      const equipment = member.getEquipment()[i];
      if (equipment) {
        equipList.push(equipment.getName());
      } else {
        equipList.push(PSMenuMain.format('', 15, false));
      }
    }
    const equipBox = PSMenu.instance.createLabelBox(70, 130, equipList, true);
    PSMenu.instance.push(equipBox);

    await PSMenu.instance.waitAnyButton();

    // Show spells if character has them
    const spells = member.getSpells();
    if (spells && spells.length > 0) {
      const worldSpells = member.listSpells(EffectPlace.WORLD);
      const battleSpells = member.listSpells(EffectPlace.BATTLE);

      const worldSpellBox = PSMenu.instance.createLabelBox(55, 80, PSMenuMain.spacedList(worldSpells), true);
      const battleSpellBox = PSMenu.instance.createLabelBox(160, 80, PSMenuMain.spacedList(battleSpells), true);
      PSMenu.instance.push(worldSpellBox);
      PSMenu.instance.push(battleSpellBox);

      await PSMenu.instance.waitAnyButton();

      PSMenu.instance.pop();
      PSMenu.instance.pop();
    }

    // Clean up all menu boxes
    PSMenu.instance.pop(); // Equipment
    PSMenu.instance.pop(); // Stats
    PSMenu.instance.pop(); // Info
    PSMenu.instance.pop(); // Portrait

    if (PSGame.getParty().partySize() > 1) {
      PSMenu.instance.pop(); // Character selection
      await PSMenuMain.statMenu(); // Loop back for next character
    }
  }

  /**
   * Magic menu - direct port of Java magicMenu()
   */
  private static async magicMenu(statusLabelBox: MenuLabelBox): Promise<boolean> {
    let outcome = EffectOutcome.NONE;
    let partySel = 1;

    // Character selection if multiple party members
    if (PSGame.getParty().partySize() > 1) {
      const charMenu = PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true);
      PSMenu.instance.push(charMenu);
    }

    do {
      if (PSGame.getParty().partySize() > 1) {
        partySel = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;
        if (partySel === 0) {
          break;
        }
      }

      const chosenMember = PSGame.getParty().getMember(partySel - 1);

      if (chosenMember.getHp() <= 0) {
        await PSMenu.Stext(PSGame.getString('Battle_Player_Dead', '<player>', chosenMember.getName()));
      } else if (chosenMember.getSpells(EffectPlace.WORLD).length === 0) {
        await PSMenu.Stext(PSGame.getString('Magic_NotLearned', '<player>', chosenMember.getName()));
      } else {
        // Show spell menu
        const spellMenu = PSMenu.instance.createPromptBox(100, 50, chosenMember.listSpells(EffectPlace.WORLD), true);
        PSMenu.instance.push(spellMenu);

        const chosenSpell = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        if (chosenSpell !== -1) {
          const spell = chosenMember.getSpells(EffectPlace.WORLD)[chosenSpell];
          const effect = PSLibSpell.prepareSpell(spell, chosenMember);
          if (effect) {
            outcome = await PSLibSpell.castSpell(spell, effect);
            statusLabelBox.updateText(PSMenuMain.getBasicStats());
          }
        }
        PSMenu.instance.pop();
      }

    } while (PSGame.getParty().partySize() > 1 && outcome !== EffectOutcome.CLOSE_ALL);

    if (PSGame.getParty().partySize() > 1) {
      PSMenu.instance.pop();
    }

    return outcome === EffectOutcome.CLOSE_ALL;
  }

  /**
   * Item menu - direct port of Java itemMenu()
   */
  private static async itemMenu(statusLabelBox: MenuLabelBox): Promise<boolean> {
    let outcome = EffectOutcome.NONE;
    let partySel = 1;

    // Character selection if multiple party members
    if (PSGame.getParty().partySize() > 1) {
      const charMenu = PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true);
      PSMenu.instance.push(charMenu);
    }

    do {
      if (PSGame.getParty().partySize() > 1) {
        partySel = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;
        if (partySel === 0) {
          break;
        }
      }

      const chosenMember = PSGame.getParty().getMember(partySel - 1);

      if (chosenMember.getHp() <= 0) {
        await PSMenu.Stext(PSGame.getString('Battle_Player_Dead', '<player>', chosenMember.getName()));
      } else if (chosenMember.getItems().length === 0) {
        await PSMenu.Stext(PSGame.getString('Menu_No_Items', '<player>', chosenMember.getName()));
      } else {
        // Item list
        const itemMenu = PSMenu.instance.createPromptBox(100, 10, Item.toString(chosenMember.getItems(), false), true);
        PSMenu.instance.push(itemMenu);

        const optItem = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        if (optItem >= 0) {
          const chosenItem = chosenMember.getItems()[optItem];

          // Item action menu
          const actionOptions = PSGame.getParty().partySize() > 1
            ? [
                PSGame.getString('Menu_Select_Item_Use'),
                PSGame.getString('Menu_Select_Item_Equip'),
                PSGame.getString('Menu_Select_Item_Drop'),
                PSGame.getString('Menu_Select_Item_Give')
              ]
            : [
                PSGame.getString('Menu_Select_Item_Use'),
                PSGame.getString('Menu_Select_Item_Equip'),
                PSGame.getString('Menu_Select_Item_Drop')
              ];

          const actionMenu = PSMenu.instance.createPromptBox(130, 80, actionOptions, true);
          PSMenu.instance.push(actionMenu);

          const itemAction = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

          switch (itemAction) {
            case 0: // USE
              const effect = PSLibItem.prepareItem(chosenItem, chosenMember);
              if (effect) {
                await PSMenu.Stext(PSGame.getString('Item_Use', '<item>', chosenItem.getName(), '<player>', chosenMember.getName()));
                outcome = await effect.callEffect();
                if (outcome === EffectOutcome.NONE || outcome === EffectOutcome.FAIL) {
                  await PSMenu.StextLast(PSGame.getString('Item_NoEffect'));
                } else {
                  statusLabelBox.updateText(PSMenuMain.getBasicStats());
                  if (chosenItem.getCost() > 0) {
                    chosenMember.removeItem(chosenItem);
                  }
                }
              }
              break;

            case 1: // EQUIP
              if (!chosenItem.isEquippable()) {
                await PSMenu.StextLast(PSGame.getString('Item_Dont_Equip'));
              } else if (!chosenMember.canEquip(chosenItem.getType())) {
                await PSMenu.StextLast(PSGame.getString('Item_Cant_Equip', '<item>', chosenItem.getName(), '<player>', chosenMember.getName()));
              } else {
                chosenMember.equipItem(chosenItem);
                await PSMenu.StextLast(PSGame.getString('Item_Equip', '<item>', chosenItem.getName(), '<player>', chosenMember.getName()));
                chosenMember.removeItem(chosenItem);
              }
              break;

            case 2: // DROP
              if (chosenItem.getCost() > 0) {
                await PSMenu.StextLast(PSGame.getString('Item_Discarded', '<player>', chosenMember.getName(), '<item>', chosenItem.getName()));
                chosenMember.removeItem(chosenItem);
              } else {
                await PSMenu.StextLast(PSGame.getString('Item_Cant_Drop', '<item>', chosenItem.getName()));
              }
              break;

            case 3: // GIVE
              const giveToWhom = await PSMenu.Prompt(
                PSGame.getString('Item_Give_Whom', '<item>', chosenItem.getName()),
                PSGame.getParty().listMembers()
              );
              if (giveToWhom !== 0) {
                const receiver = PSGame.getParty().getMember(giveToWhom - 1);
                if (!receiver.equals(chosenMember)) {
                  if (receiver.isFull()) {
                    await PSMenu.StextLast(PSGame.getString('Item_Give_Player_Full', '<player>', receiver.getName()));
                  } else {
                    await PSMenu.StextLast(PSGame.getString('Item_Give_Player', '<player>', chosenMember.getName(), '<item>', chosenItem.getName(), '<receiver>', receiver.getName()));
                    receiver.addItem(chosenItem);
                    chosenMember.removeItem(chosenItem);
                  }
                }
              }
              break;
          }

          PSMenu.instance.pop(); // Action menu
        }

        PSMenu.instance.pop(); // Item menu
      }

    } while (PSGame.getParty().partySize() > 1 && outcome !== EffectOutcome.CLOSE_ALL);

    if (PSGame.getParty().partySize() > 1) {
      PSMenu.instance.pop();
    }

    return outcome === EffectOutcome.CLOSE_ALL;
  }

  /**
   * Party order menu - direct port of Java orderMenu()
   */
  private static async orderMenu(): Promise<void> {
    if (PSGame.getParty().partySize() === 1) {
      await PSMenu.Stext('You have only one member in the party!');
      return;
    }

    const order: number[] = new Array(PSGame.getParty().partySize());

    // Left side: party members, Right side: empty slots
    const strLeft = [...PSGame.getParty().listMembers()];
    const strRight = new Array(PSGame.getParty().partySize()).fill('> -- <');

    const lblBox = PSMenu.instance.createLabelBox(75, 130, strRight, true);
    PSMenu.instance.push(lblBox);

    let chosen = 0;
    while (chosen < strRight.length) {
      const memberMenu = PSMenu.instance.createPromptBox(10, 130, strLeft, chosen === 0);
      PSMenu.instance.push(memberMenu);

      const opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

      if (opt === -1) {
        // Cancel: return without changing order
        PSMenu.instance.pop();
        PSMenu.instance.pop();
        return;
      } else {
        if (strLeft[opt] !== '') { // Only if not previously chosen
          lblBox.updateText(chosen, strLeft[opt]);
          order[chosen] = opt;
          strLeft[opt] = '';
          chosen++;
        }
      }
      PSMenu.instance.pop();
    }

    PSGame.getParty().setOrder(order);
    PSGame.getParty().reallocate();
    PSMenu.instance.pop();
  }

  /**
   * List visited enemies by type - direct port of Java listVisitedEnemies()
   */
  private static async listVisitedEnemies(type: Enemy.Type): Promise<void> {
    const enemyList: string[] = [];

    for (const [genericEnemy, enemy] of PSGame.getEnemyLib()) {
      if (enemy.getType() === type) {
        if (PSGame.gameData.visitedEnemies.has(genericEnemy)) {
          enemyList.push(enemy.getName());
        } else {
          enemyList.push('???');
        }
      }
    }

    const maxSize = 12;
    const pages = Math.ceil(enemyList.length / maxSize);

    for (let i = 0; i < pages; i++) {
      const startIndex = i * maxSize;
      const endIndex = Math.min(startIndex + maxSize, enemyList.length);
      const pageEnemies = enemyList.slice(startIndex, endIndex);

      const enemyMenu = PSMenu.instance.createPromptBox(100 + i * 40, 5, pageEnemies, true);
      PSMenu.instance.push(enemyMenu);
      await PSMenu.instance.waitOpt(PSCancellable.TRUE);
    }

    for (let i = 0; i < pages; i++) {
      PSMenu.instance.pop();
    }
  }

  /**
   * Cheat menu - direct port of Java cheatMenu()
   */
  public static async cheatMenu(): Promise<void> {
    PSMenu.menuOff();

    const cheatMenu = PSMenu.instance.createPromptBox(100, 30, [
      'Level up',
      'Kill',
      PSGame.getString('Spell_Fly'),
      'Immaterial',
      'Mesetas',
      'Equip',
      'Item',
      PSGame.getString('Spell_Light'),
      'Battle'
    ], true);
    PSMenu.instance.push(cheatMenu);

    const opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

    switch (opt) {
      case 0: // Level up
        for (let i = 0; i < PSGame.getParty().listMembers().length; i++) {
          for (let j = 0; j < 11; j++) {
            PSGame.getParty().getMember(i).advanceLevel();
          }
          PSGame.getParty().getMember(i).heal();
        }
        break;

      case 1: // Kill
        const killWho = await PSMenu.Prompt('Kill who?', PSGame.getParty().listMembers());
        if (killWho > 0) {
          PSGame.getParty().getMember(killWho - 1).setHp(0);
        }
        if (!PSGame.checkAlive()) {
          PSGame.gameOverRoutine();
        } else {
          PSGame.getParty().reallocate();
        }
        break;

      case 2: // Ryuka (Fly)
        const cities = [
          ...City.getVisitedCitiesFromPlanet(Planet.PALMA),
          ...City.getVisitedCitiesFromPlanet(Planet.MOTAVIA),
          ...City.getVisitedCitiesFromPlanet(Planet.DEZORIS)
        ];
        const cityNames = cities.map(city => city.toString());

        const cityMenu = PSMenu.instance.createPromptBox(140, 5, cityNames, true);
        PSMenu.instance.push(cityMenu);
        const cityOpt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        PSMenu.instance.pop();

        if (cityOpt >= 0) {
          const chosenCity = cities[cityOpt];
          PSGame.mapswitchToPlanet(chosenCity.getPlanet(), chosenCity.getX(), chosenCity.getY());
        }
        break;

      // Add other cheat options as needed...
    }

    PSMenu.instance.pop();
    PSMenu.menuOn();
  }

  // Helper methods

  /**
   * Create spaced list for display - direct port of Java spacedList()
   */
  private static spacedList(listString: string[]): string[] {
    const result: string[] = [];
    for (let i = 0; i < listString.length; i++) {
      if (i !== 0) {
        result.push('            ');
      }
      result.push(listString[i]);
    }
    return result;
  }

  /**
   * Get basic party stats for display - direct port of Java getBasicStats()
   */
  private static getBasicStats(): string[] {
    const stats: string[] = [];
    const members = PSGame.getParty().getMembers();

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const isDead = member.getHp() <= 0;
      const prefix = isDead ? '<RED>' : '';

      stats.push(`${prefix}${PSMenuMain.format(member.getName(), 6, true)}${PSMenuMain.format(` LV ${member.getLevel()}`, 7, false)}`);
      stats.push(`${prefix} HP:${PSMenuMain.format(member.getHp(), 4)}/${PSMenuMain.format(member.getMaxHp(), 4)}`);
      stats.push(`${prefix} MP:${PSMenuMain.format(member.getMp(), 4)}/${PSMenuMain.format(member.getMaxMp(), 4)}`);

      if (i < members.length - 1) {
        stats.push('');
      }
    }

    return stats;
  }

  /**
   * Format string/number for display - direct port of Java format()
   */
  private static format(value: string | number, length: number, leftAlign: boolean = false): string {
    const str = value.toString();
    if (str.length >= length) {
      return str.substring(0, length);
    }

    const padding = ' '.repeat(length - str.length);
    return leftAlign ? str + padding : padding + str;
  }
}