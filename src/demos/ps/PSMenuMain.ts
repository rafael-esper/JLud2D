/**
 * PSMenuMain - Phantasy Star Main Menu System
 * Direct port of PSMenuMain.java - Handles the main game menu interface
 */

import { PSCancellable } from './menu/MenuStack';
import { MenuLabelBox } from './menu/MenuLabelBox';
import { PSGame } from './PSGame';
import { PSMenu, PSSceneType } from './PSMenu';
import { PartyMember } from './game/PartyMember';
import { PSLibSpell } from './game/PSLibSpell';
import { PSLibItem, OriginalItem } from './game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from './game/PSLibEnemy';
import { Item, EquipPlace } from './game/Item';
import { EnemyType } from './battle/Enemy';
import { City, CityHelper, Planet } from './game/City';
import { EffectOutcome, EffectPlace } from './game/PSEffect';
import { Trapped } from './game/GameData';
import { Specie } from './game/Specie';
import { Job } from './game/Job';
import { MainEngine } from '../../core/MainEngine';

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
    PSMenu.instance.push(PSMenu.instance.createOneLabelBox(10, 200, `MST ${PSGame.getParty().mst}`, true));

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

      if (opt === 1) { // Stats
        await PSMenuMain.statMenu();
      }

      if (opt === 2) { // Magic
        if (await PSMenuMain.magicMenu(statusLabelBox)) {
          break; // Close all menus (e.g. Fly effect)
        }
      }

      if (opt === 3) { // Items
        if (await PSMenuMain.itemMenu(statusLabelBox)) {
          break; // Close all menus
        }
      }

      if (opt === 4) { // Quest
        await PSMenuMain.questMenu();
      }

      if (opt === 5) {
        // Talk - not implemented for PS Original
      }

      if (opt === 6) { // Options
        if (await PSMenuMain.optionsMenu()) {
          break; // Exit to title screen
        }
      }

      if (opt === 7) { // Load
        await PSGame.loadGame();
        // TODO: syncAfterLoading();
        break;
      }

      if (opt === 8) { // Save
        await PSGame.saveGame();
        // TODO: syncAfterLoading();
      }
    }

    console.log('EndMenu!');
    PSMenu.instance.pop(); // Menu
    PSMenu.instance.pop(); // Chars
    PSMenu.instance.pop(); // Mst

    // Robustness: the stack must be empty here or the game loop stays paused
    while (PSMenu.instance.hasMenu()) {
      console.error('A Menu was left open when closing the Main Menu.');
      PSMenu.instance.pop();
    }

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

    // TODO Implement Menu Quest_Dungeons and Menu Quest_Log
    questMenu.setDisabled(2);
    questMenu.setDisabled(3);

    let opt = 0;
    while (opt !== -1) {
      opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

      if (opt === -1) {
        PSMenu.instance.pop();
        return;
      }

      if (opt === 0) { // Quest Items
        const questItems = PSGame.getParty().listQuestItems();
        if (questItems.length === 0) {
          await PSMenu.Stext(PSGame.getString('Menu_No_Quest_Items'));
        } else {
          // TODO If quest items size > 12, then make multiple windows
          const items = PSMenuMain.spacedList(Item.toString(questItems, false));
          PSMenu.instance.push(PSMenu.instance.createLabelBox(100, 10, items, true));
          await PSMenu.instance.waitAnyButton();
          PSMenu.instance.pop();
        }
      }

      if (opt === 1) { // Enemies
        PSMenu.instance.push(PSMenu.instance.createPromptBox(150, 60, [
          'Palma', 'Motavia', 'Dezoris', 'Undead', 'Special'
        ], true));

        const type = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        switch (type) {
          case 0:
            await PSMenuMain.listVisitedEnemies(EnemyType.PALMA);
            break;
          case 1:
            await PSMenuMain.listVisitedEnemies(EnemyType.MOTAVIA);
            break;
          case 2:
            await PSMenuMain.listVisitedEnemies(EnemyType.DEZORIS);
            break;
          case 3:
            await PSMenuMain.listVisitedEnemies(EnemyType.UNDEAD);
            break;
          case 4:
            await PSMenuMain.listVisitedEnemies(EnemyType.SPECIAL);
            break;
        }
        PSMenu.instance.pop();
      }

      if (opt === 4) { // Order
        await PSMenuMain.orderMenu();
      }
    }
  }

  /**
   * Options menu - direct port of Java optionsMenu()
   * @returns true if the game left to the title screen (close all menus)
   */
  private static async optionsMenu(): Promise<boolean> {
    PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 30, [
      `${PSGame.getString('Menu_Options_Sound')}: ${PSGame.gameData.soundVolume}`,
      `${PSGame.getString('Menu_Options_Music')}: ${PSGame.gameData.musicVolume}`,
      `${PSGame.getString('Menu_Options_Messages')}: ${PSGame.gameData.battleInformation ? PSGame.getString('Menu_Choice_Yes') : PSGame.getString('Menu_Choice_No')}`,
      `${PSGame.getString('Menu_Options_Delay')}: ${PSGame.gameData.dungeonDelay}`,
      PSGame.getString('Menu_Language'),
      PSGame.getString('Title_Screen')
    ], true));

    const opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

    switch (opt) {
      case 0: { // Sound Volume
        // TODO Change to MenuBlitSlider (Sully Menu_Option.java)
        PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 50,
          ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], true));
        const optSound = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        PSMenu.instance.pop();
        if (optSound >= 0) {
          PSGame.changeSoundVolume(optSound * 10);
        }
        break;
      }

      case 1: { // Music Volume
        PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 50,
          ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], true));
        const optMusic = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        PSMenu.instance.pop();
        if (optMusic >= 0) {
          PSGame.changeMusicVolume(optMusic * 10);
        }
        break;
      }

      case 2: { // Battle Messages
        const optInfo = await PSMenu.Prompt(
          PSGame.getString('Menu_Options_Messages_Desc'),
          PSGame.getYesNo()
        );
        PSMenu.instance.pop(); // text box left by Prompt
        if (optInfo > 0) {
          PSGame.gameData.battleInformation = (optInfo === 1);
        }
        break;
      }

      case 3: { // Dungeon Delay
        const delay = await PSMenu.Prompt(
          PSGame.getString('Menu_Options_Delay_Desc'),
          [
            PSGame.getString('Menu_Options_Delay_4'),
            PSGame.getString('Menu_Options_Delay_3'),
            PSGame.getString('Menu_Options_Delay_2'),
            PSGame.getString('Menu_Options_Delay_1')
          ]
        );
        PSMenu.instance.pop(); // text box left by Prompt
        if (delay > 0) {
          PSGame.gameData.dungeonDelay = 5 - delay;
        }
        break;
      }

      case 4: // Language
        await PSGame.languageMenu(PSMenu.instance);
        break;

      case 5: { // Title Screen
        const confirmExit = await PSMenu.Prompt(
          PSGame.getString('Menu_Exit_Prompt'),
          PSGame.getYesNo()
        );
        PSMenu.instance.pop(); // text box left by Prompt
        if (confirmExit === 1) {
          PSMenu.setMapOff();
          PSMenu.instance.pop();
          await PSGame.exitToTitle();
          return true;
        }
        break;
      }
    }

    PSMenu.instance.pop();
    return false;
  }

  /**
   * Display the player stats - direct port of Java statMenu()
   */
  private static async statMenu(): Promise<void> {
    let partySel = 1;
    if (PSGame.getParty().partySize() > 1) {
      PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true));
      partySel = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;
      if (partySel === 0) {
        PSMenu.instance.pop();
        return;
      }
    }

    const p = PSGame.getParty().getMember(partySel - 1);
    if (!p) {
      return;
    }

    // Character portrait (default PS_ORIGINAL members may not have one set yet)
    let hasPortrait = false;
    if (p.portrait !== null) {
      const portrait = await PSGame.getVImage(p.portrait);
      PSMenu.instance.push(PSMenu.instance.createImageBox(88, 10, portrait, true));
      hasPortrait = true;
    }

    const infoList: string[] = [
      ` ${p.getName().toUpperCase()}`,
      '',
      PSMenuMain.format(` ${Specie[p.getSpe()]}`, 10, true),
      PSMenuMain.format(` ${Job[p.getJob()]}`, 10, true),
      '',
      PSMenuMain.format(` ${PSGame.getString('Stats_Level')} ${p.level}`, 10, false),
      ` ${PSGame.getString('Stats_HP')}:${PSMenuMain.format(p.hp, 4)}/${PSMenuMain.format(p.getMaxHp(), 4)}`,
      ` ${PSGame.getString('Stats_MP')}:${PSMenuMain.format(p.mp, 4)}/${PSMenuMain.format(p.getMaxMp(), 4)}`
    ];
    PSMenu.instance.push(PSMenu.instance.createLabelBox(200, 10, infoList, true));

    const statsList: string[] = [
      `${PSMenuMain.format(PSGame.getString('Stats_Strength'), 8, true)}: ${PSMenuMain.format(p.getStr(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Agility'), 8, true)}: ${PSMenuMain.format(p.getAgi(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Mental'), 8, true)}: ${PSMenuMain.format(p.getMental(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Attack'), 8, true)}: ${PSMenuMain.format(p.getAtk(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Defense'), 8, true)}: ${PSMenuMain.format(p.getDef(), 3)}`,
      '',
      `${PSMenuMain.format(PSGame.getString('Stats_Exp'), 4, true)}: ${PSMenuMain.format(p.xp, 7)}`
    ];
    PSMenu.instance.push(PSMenu.instance.createLabelBox(200, 110, statsList, true));

    // Equipment
    const equipList: string[] = [];
    const equipPlaceCount = Object.keys(EquipPlace).filter(k => isNaN(Number(k))).length;
    for (let i = 0; i < equipPlaceCount; i++) {
      if (equipList.length > 0) {
        equipList.push(PSMenuMain.format('', 15, false));
      }
      const equipment = p.equipment[i];
      if (equipment) {
        equipList.push(equipment.getName());
      } else {
        equipList.push(PSMenuMain.format('', 15, false));
      }
    }
    PSMenu.instance.push(PSMenu.instance.createLabelBox(70, 130, equipList, true));

    await PSMenu.instance.waitAnyButton();

    // Show spells if the character has them
    if (p.spells && p.spells.length > 0) {
      PSMenu.instance.push(PSMenu.instance.createLabelBox(55, 80, PSMenuMain.spacedList(p.listSpells(EffectPlace.WORLD)), true));
      PSMenu.instance.push(PSMenu.instance.createLabelBox(160, 80, PSMenuMain.spacedList(p.listSpells(EffectPlace.BATTLE)), true));
      await PSMenu.instance.waitAnyButton();
      PSMenu.instance.pop();
      PSMenu.instance.pop();
    }

    PSMenu.instance.pop(); // Equipment
    PSMenu.instance.pop(); // Stats
    PSMenu.instance.pop(); // Info
    if (hasPortrait) {
      PSMenu.instance.pop(); // Portrait
    }

    if (PSGame.getParty().partySize() > 1) {
      PSMenu.instance.pop(); // Character selection
      await PSMenuMain.statMenu(); // Loop back for next character
    }
  }

  /**
   * Opens up a magic menu, if the selected player is capable of casting spells
   *
   * @param statusLabelBox (so it can update it after specific magic effects)
   * @returns true if all screens must close (like 'Fly' effect); false otherwise
   */
  private static async magicMenu(statusLabelBox: MenuLabelBox): Promise<boolean> {
    let outcome = EffectOutcome.NONE;
    let partySel = 1;

    if (PSGame.getParty().partySize() > 1) {
      PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true));
    }

    do {
      if (PSGame.getParty().partySize() > 1) {
        partySel = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;
        if (partySel === 0) {
          break;
        }
      }

      const chosenMember = PSGame.getParty().getMember(partySel - 1)!;

      if (chosenMember.hp <= 0) {
        await PSMenu.Stext(PSGame.getString('Battle_Player_Dead', '<player>', chosenMember.getName()));
      } else if (chosenMember.getSpells(EffectPlace.WORLD).length === 0) {
        await PSMenu.Stext(PSGame.getString('Magic_NotLearned', '<player>', chosenMember.getName()));
      } else {
        PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 50, chosenMember.listSpells(EffectPlace.WORLD), true));
        const chosenSpell = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        if (chosenSpell !== -1) {
          const spell = chosenMember.getSpells(EffectPlace.WORLD)[chosenSpell];
          const effect = await PSLibSpell.prepareSpell(spell, chosenMember);
          if (effect) {
            outcome = await PSLibSpell.castSpell(spell, effect);
            statusLabelBox.updateTextArray(PSMenuMain.getBasicStats());
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

    if (PSGame.getParty().partySize() > 1) {
      PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, PSGame.getParty().listMembers(), true));
    }

    do {
      if (PSGame.getParty().partySize() > 1) {
        partySel = await PSMenu.instance.waitOpt(PSCancellable.TRUE) + 1;
        if (partySel === 0) {
          break;
        }
      }

      const chosenMember = PSGame.getParty().getMember(partySel - 1)!;

      if (chosenMember.hp <= 0) {
        await PSMenu.Stext(PSGame.getString('Battle_Player_Dead', '<player>', chosenMember.getName()));
      } else if (chosenMember.items.length === 0) {
        await PSMenu.Stext(PSGame.getString('Menu_No_Items', '<player>', chosenMember.getName()));
      } else {
        // Item list
        PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 10, Item.toString(chosenMember.items, false), true));
        const optItem = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

        if (optItem >= 0) {
          const chosenItem = chosenMember.items[optItem];

          // Item action
          if (PSGame.getParty().partySize() > 1) {
            PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 80, [
              PSGame.getString('Menu_Select_Item_Use'),
              PSGame.getString('Menu_Select_Item_Equip'),
              PSGame.getString('Menu_Select_Item_Drop'),
              PSGame.getString('Menu_Select_Item_Give')
            ], true));
          } else {
            PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 80, [
              PSGame.getString('Menu_Select_Item_Use'),
              PSGame.getString('Menu_Select_Item_Equip'),
              PSGame.getString('Menu_Select_Item_Drop')
            ], true));
          }

          const itemAction = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

          if (itemAction === 0) { // USE

            const effect = await PSLibItem.prepareItem(chosenItem, chosenMember);
            if (effect) {
              await PSMenu.Stext(PSGame.getString('Item_Use', '<item>', chosenItem.getName(), '<player>', chosenMember.getName()));
              outcome = await effect.callEffect();
              if (outcome === EffectOutcome.NONE || outcome === EffectOutcome.FAIL) {
                await PSMenu.StextLast(PSGame.getString('Item_NoEffect'));
              } else {
                statusLabelBox.updateTextArray(PSMenuMain.getBasicStats());
                if (chosenItem.getCost() > 0) {
                  PSMenuMain.removeItem(chosenMember, chosenItem);
                }
              }
            }

          } else if (itemAction === 1) { // EQUIP

            if (!chosenItem.isEquippable()) {
              await PSMenu.StextLast(PSGame.getString('Item_Dont_Equip'));
            } else if (!chosenMember.canEquip(chosenItem.type)) {
              await PSMenu.StextLast(PSGame.getString('Item_Cant_Equip', '<item>', chosenItem.getName(), '<player>', chosenMember.getName()));
            } else {
              chosenMember.equipItem(chosenItem);
              await PSMenu.StextLast(PSGame.getString('Item_Equip', '<item>', chosenItem.getName(), '<player>', chosenMember.getName()));
              PSMenuMain.removeItem(chosenMember, chosenItem);
            }

          } else if (itemAction === 2) { // DROP

            if (chosenItem.getCost() > 0) {
              await PSMenu.StextLast(PSGame.getString('Item_Discarded', '<player>', chosenMember.getName(), '<item>', chosenItem.getName()));
              PSMenuMain.removeItem(chosenMember, chosenItem);
            } else {
              await PSMenu.StextLast(PSGame.getString('Item_Cant_Drop', '<item>', chosenItem.getName()));
            }

          } else if (itemAction === 3) { // GIVE

            const giveToWhom = await PSMenu.Prompt(
              PSGame.getString('Item_Give_Whom', '<item>', chosenItem.getName()),
              PSGame.getParty().listMembers()
            );
            PSMenu.instance.pop(); // text box left by Prompt
            if (giveToWhom !== 0) {
              const receiver = PSGame.getParty().getMember(giveToWhom - 1)!;
              if (receiver !== chosenMember) {
                if (receiver.isFull()) {
                  await PSMenu.StextLast(PSGame.getString('Item_Give_Player_Full', '<player>', receiver.getName()));
                } else {
                  await PSMenu.StextLast(PSGame.getString('Item_Give_Player', '<player>', chosenMember.getName(), '<item>', chosenItem.getName(), '<receiver>', receiver.getName()));
                  receiver.items.push(chosenItem);
                  PSMenuMain.removeItem(chosenMember, chosenItem);
                }
              }
            }
          }

          PSMenu.instance.pop(); // item action
        }

        PSMenu.instance.pop(); // item list
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

    // Left are the full party, right are empty slots
    const strLeft = [...PSGame.getParty().listMembers()];
    const strRight: string[] = new Array(PSGame.getParty().partySize()).fill('> -- <'); // FOR Max of 6-name length

    const lblBox = PSMenu.instance.createLabelBox(75, 130, strRight, true);
    PSMenu.instance.push(lblBox);

    let chosen = 0;
    while (chosen < strRight.length) {
      PSMenu.instance.push(PSMenu.instance.createPromptBox(10, 130, strLeft, chosen === 0));
      const opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);

      if (opt === -1) { // Cancel: return without changing the order
        PSMenu.instance.pop();
        PSMenu.instance.pop();
        return;
      } else {
        if (strLeft[opt] !== '') { // Just if not previously chosen
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
  private static async listVisitedEnemies(type: EnemyType): Promise<void> {
    const l: string[] = [];
    for (const [genericEnemy, enemy] of PSGame.getEnemyLib()) {
      if (enemy.type === type) {
        if (PSGame.gameData.visitedEnemies.has(genericEnemy as PS1Enemy)) {
          l.push(enemy.getName());
        } else {
          l.push('???');
        }
      }
    }

    const maxSize = 12;
    let pushed = 0;
    for (let i = 0; i * maxSize < l.length; i++) {
      const strEnemies = l.slice(i * maxSize, Math.min((i + 1) * maxSize, l.length));
      PSMenu.instance.push(PSMenu.instance.createPromptBox(100 + i * 40, 5, strEnemies, true));
      pushed++;
      await PSMenu.instance.waitOpt(PSCancellable.TRUE);
    }

    for (let i = 0; i < pushed; i++) {
      PSMenu.instance.pop();
    }
  }

  /**
   * Cheat menu - direct port of Java cheatMenu()
   */
  public static async cheatMenu(): Promise<void> {
    PSMenu.menuOff();
    PSMenu.instance.push(PSMenu.instance.createPromptBox(100, 30, [
      'Level up',
      'Kill',
      PSGame.getString('Spell_Fly'),
      'Immaterial',
      'Mesetas',
      'Equip',
      'Item',
      PSGame.getString('Spell_Light'),
      'Battle'
    ], true));

    let opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
    switch (opt) {

      case 0: // Level up
        for (let i = 0; i < PSGame.getParty().listMembers().length; i++) {
          for (let j = 0; j < 11; j++) {
            PSGame.getParty().getMember(i)?.advanceLevel();
          }
          PSGame.getParty().getMember(i)?.heal();
        }
        break;

      case 1: { // Kill
        const killwho = await PSMenu.Prompt('Kill who?', PSGame.getParty().listMembers());
        PSMenu.instance.pop(); // text box left by Prompt
        if (killwho > 0) {
          PSGame.getParty().getMember(killwho - 1)!.hp = 0;
        }
        if (!PSGame.checkAlive()) {
          PSMenu.instance.pop();
          await PSGame.gameOverRoutine();
          PSMenu.menuOn();
          return;
        } else {
          PSGame.getParty().reallocate();
        }
        break;
      }

      case 2: { // Ryuka (Fly)
        const lstCities: City[] = [
          ...CityHelper.getVisitedCitiesFromPlanet(Planet.PALMA),
          ...CityHelper.getVisitedCitiesFromPlanet(Planet.MOTAVIA),
          ...CityHelper.getVisitedCitiesFromPlanet(Planet.DEZORIS)
        ];
        const strCities = lstCities.map(city => CityHelper.toString(city));

        PSMenu.instance.push(PSMenu.instance.createPromptBox(140, 5, strCities, true));
        opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
        PSMenu.instance.pop();
        if (opt >= 0) {
          const chosenCity = lstCities[opt];
          PSMenu.instance.pop();
          PSMenu.menuOn();
          await PSGame.mapswitchToPlanet(
            CityHelper.getPlanet(chosenCity),
            CityHelper.getX(chosenCity),
            CityHelper.getY(chosenCity)
          );
          return;
        }
        break;
      }

      case 3: { // Immaterial
        const player = MainEngine.getPlayer();
        if (player) {
          player.setObstructable(!player.isObstructable());
        }
        break;
      }

      case 4: // Mesetas
        PSMenu.instance.pop();
        PSMenu.menuOn();
        await PSGame.chest(10000, Trapped.EXPLOSION);
        return;

      case 5: { // Equip
        const party = PSGame.getParty();
        party.getMember(0)?.equipItem(PSGame.getItem(OriginalItem.Weapon_Laconian_Sword));
        party.getMember(0)?.equipItem(PSGame.getItem(OriginalItem.Armor_Diamond_Mail));
        party.getMember(0)?.equipItem(PSGame.getItem(OriginalItem.Shield_Laconian_Shield));

        if (party.getMembers().length > 1) {
          party.getMember(1)?.equipItem(PSGame.getItem(OriginalItem.Weapon_Silver_Tusk));
          party.getMember(1)?.equipItem(PSGame.getItem(OriginalItem.Armor_Saber_Fur));
          party.getMember(1)?.equipItem(PSGame.getItem(OriginalItem.Shield_Animal_Glove));
        }

        if (party.getMembers().length > 2) {
          party.getMember(2)?.equipItem(PSGame.getItem(OriginalItem.Weapon_Laser_Gun));
          party.getMember(2)?.equipItem(PSGame.getItem(OriginalItem.Weapon_Laconian_Axe));
          party.getMember(2)?.equipItem(PSGame.getItem(OriginalItem.Armor_Laconian_Armor));
          party.getMember(2)?.equipItem(PSGame.getItem(OriginalItem.Shield_Mirror_Shield));
        }

        if (party.getMembers().length > 3) {
          party.getMember(3)?.equipItem(PSGame.getItem(OriginalItem.Weapon_Psycho_Wand));
          party.getMember(3)?.equipItem(PSGame.getItem(OriginalItem.Armor_Frad_Cloak));
          party.getMember(3)?.equipItem(PSGame.getItem(OriginalItem.Shield_Laser_Barrier));
        }
        break;
      }

      case 6: { // Item
        const party = PSGame.getParty();
        party.addQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass));
        party.addQuestItem(PSGame.getItem(OriginalItem.Quest_Passport));
        party.addQuestItem(PSGame.getItem(OriginalItem.Quest_Dungeon_Key));

        const member = party.getMember(0)!;
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Monomate));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Dimate));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Trimate));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_TranCarpet));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Flash));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Light_Pendant));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Telepathy_Ball));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Magic_Hat));
        member.items.push(PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
        break;
      }

      case 7: // Light
        PSGame.currentDungeon?.setLight?.();
        break;

      case 8: { // Battle
        while (PSMenu.instance.hasMenu()) {
          PSMenu.instance.pop();
        }
        const sorcerer = PSLibEnemy.getEnemyByEnum(PS1Enemy.SORCERER);
        if (sorcerer) {
          await PSGame.startBattle(PSSceneType.CORRIDOR, sorcerer, 2);
        }
        PSMenu.menuOn();
        return;
      }

      default:
        break;
    }

    PSMenu.instance.pop();
    PSMenu.menuOn();
  }

  // Helper methods

  /**
   * Remove an item instance from a member's inventory (Java: items.remove(item))
   */
  private static removeItem(member: PartyMember, item: Item): void {
    const index = member.items.indexOf(item);
    if (index >= 0) {
      member.items.splice(index, 1);
    }
  }

  /**
   * Create spaced list for display - direct port of Java spacedList()
   */
  private static spacedList(listString: string[]): string[] {
    const s: string[] = [];
    for (let i = 0; i < listString.length; i++) {
      if (i !== 0) {
        s.push('            ');
      }
      s.push(listString[i]);
    }
    return s;
  }

  /**
   * Get basic party stats for display - direct port of Java getBasicStats()
   */
  private static getBasicStats(): string[] {
    const members = PSGame.getParty().getMembers();
    const s: string[] = [];

    for (let i = 0; i < members.length; i++) {
      const p = members[i];
      const isDead = p.getHp() <= 0;
      const prefix = isDead ? '<RED>' : '';

      s.push(`${prefix}${PSMenuMain.format(p.getName(), 6, true)}${PSMenuMain.format(` LV ${p.level}`, 7, false)}`);
      s.push(`${prefix} HP:${PSMenuMain.format(p.hp, 4)}/${PSMenuMain.format(p.getMaxHp(), 4)}`);
      s.push(`${prefix} MP:${PSMenuMain.format(p.mp, 4)}/${PSMenuMain.format(p.getMaxMp(), 4)}`);

      if (i < members.length - 1) {
        s.push('');
      }
    }

    return s;
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
