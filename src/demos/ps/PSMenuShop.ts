/**
 * PSMenuShop - Phantasy Star Shop System
 * Direct port of PSMenuShop.java - Handles shop interactions for buying and selling items
 */

import { PSGame } from './PSGame';
import { PSMenu } from './PSMenu';
import { Party } from './game/Party';
import { Item, ItemType } from './game/Item';
import { MenuLabelBox } from './menu/MenuLabelBox';
import { PS1Sound } from './game/PSLibSound';
import { PS1Music } from './game/PSLibMusic';
import { Flags } from './game/GameData';
import { OriginalItem } from './game/PSLibItem';

export class PSMenuShop {
  public static mstBox: MenuLabelBox | null = null;

  /**
   * Main shop function - handles greeting, buy/sell options, and farewell
   */
  public static async Shop(greetings: string, sellOption: boolean, p: Party, items: Item[]): Promise<void> {
    // Java: PSGame.Shop wrapper plays the shop theme and restores the
    // city/village music on exit
    await PSGame.playMusic(PS1Music.SHOP);

    PSMenuShop.mstBox = PSMenu.instance.createOneLabelBox(200, 10, `MST ${p.mst}`, true);
    PSMenu.instance.push(PSMenuShop.mstBox);

    await PSMenu.StextFirst(greetings);

    while (true) {
      // If 'sell' option is not available, build just a default 'buy' routine
      if (!sellOption) {
        if (await PSMenuShop.ShopBuyMenu(p, items)) {
          await PSMenu.StextLast(PSGame.getString("Shop_Bye"));
        }
        break;
      } else {
        const option = await PSMenu.PromptNext(PSGame.getString("Shop_BuyOrSell"),
          [PSGame.getString("Menu_Tool_Shop_Buy"), PSGame.getString("Menu_Tool_Shop_Sell")]);

        if (option === 1) { // Buy
          if (!(await PSMenuShop.ShopBuyMenu(p, items))) {
            break;
          }
        } else if (option === 2) { // Sell
          await PSMenuShop.ShopSellMenu(p);
        } else { // Cancel
          await PSMenu.StextLast(PSGame.getString("Shop_Bye"));
          break;
        }
      }
    }

    PSMenu.instance.pop(); // mstBox

    PSGame.findAndPlayMusic();
  }

  /**
   * Handle buy menu functionality
   */
  private static async ShopBuyMenu(p: Party, items: Item[]): Promise<boolean> {
    let buyIsDone = false;
    let bought = false;

    while (!buyIsDone) {
      // TODO Show Status Change, if there is only one member, during WaitOpt below
      let optItem = 0;

      if (!bought) {
        optItem = await PSMenu.PromptNext(PSGame.getString("Shop_Buy"), Item.toString(items, true));
      } else {
        optItem = await PSMenu.PromptNext(PSGame.getString("Shop_Bought"), Item.toString(items, true));
      }

      if (optItem === 0) { // Cancel
        buyIsDone = true;
      } else { // Chosen Item
        const chosenItem = items[optItem - 1];

        if (p.mst < chosenItem.getCost()) {
          await PSMenu.StextLast(PSGame.getString("Shop_Not_Enough_Money"));
          buyIsDone = true;
          return false; // End Shop routine
        } else {
          // Secret Thing 'hack' - handle directly in shop context like other shop interactions
          if (chosenItem.type === ItemType.SECRET) {
            if (!PSGame.hasFlag(Flags.SCION_INSIST_1)) {
              await PSMenu.StextLast(PSGame.getString("Scion_Second_Hand_Shop_Secret1"));
              PSGame.setFlag(Flags.SCION_INSIST_1);
            } else if (!PSGame.hasFlag(Flags.SCION_INSIST_2)) {
              await PSMenu.StextLast(PSGame.getString("Scion_Second_Hand_Shop_Secret2"));
              PSGame.setFlag(Flags.SCION_INSIST_2);
            } else {
              // Final interaction: purchase the Road Pass
              PSGame.getParty().mst -= chosenItem.getCost();
              PSMenuShop.mstBox?.updateText(0, "MST " + PSGame.getParty().mst);
              PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass));
              await PSMenu.StextLast(PSGame.getString("Scion_Second_Hand_Shop_Secret3"));
            }
            return false; // End shop after secret item interaction
          }

          // If there is only one member
          if (p.partySize() === 1) {
            const wantToBuy = await PSMenu.PromptNext(
              PSGame.getString("Shop_Item_Costs", "<item>", chosenItem.getName(), "<number>", chosenItem.getCost().toString()),
              PSGame.getYesNo()
            );
            if (wantToBuy !== 1) {
              bought = false;
              continue;
            }
          }

          // Routine to check if there is room and loop while there isn't
          let fullOrNotTaken = false;
          do {
            let buyToWhom = 1;

            if (p.partySize() > 1 && !chosenItem.isQuest()) {
              // TODO Show Status Change, if applicable, during WaitOpt below
              if (!fullOrNotTaken) {
                buyToWhom = await PSMenu.PromptNext(
                  PSGame.getString("Shop_Item_Costs_Who", "<item>", chosenItem.getName(), "<number>", chosenItem.getCost().toString()),
                  p.listMembers()
                );
              } else {
                buyToWhom = await PSMenu.PromptNext(PSGame.getString("Shop_Full_WhoElse"), p.listMembers());
              }

              if (buyToWhom === 0) { // Cancel: Return to Item List
                bought = false;
                break;
              }
            }

            // Check if party member is full
            if (p.getMember(buyToWhom - 1)!.isFull() && !chosenItem.isQuest()) {
              await PSMenu.StextNext(PSGame.getString("Shop_Full"));
              if (p.partySize() === 1) {
                await PSMenu.StextLast(PSGame.getString("Shop_Full_Exit"));
                buyIsDone = true;
                return false; // End Shop routine
              }

              fullOrNotTaken = true;
              continue;
            }

            // Check if item is equippable, if not, add item to list
            if (!chosenItem.isEquippable()) {
              if (chosenItem.isQuest()) {
                p.addQuestItem(chosenItem);
              } else {
                p.getMember(buyToWhom - 1)!.addItem(chosenItem);
                PSGame.playSound(PS1Sound.ITEM);
              }
            } else {
              if (p.getMember(buyToWhom - 1)!.canEquip(chosenItem.type)) {
                const wantToEquip = await PSMenu.PromptNext(
                  PSGame.getString("Shop_Equip_Item", "<item>", chosenItem.getName()),
                  PSGame.getYesNo()
                );

                if (wantToEquip === 1) {
                  p.getMember(buyToWhom - 1)!.equipItem(chosenItem);
                  PSGame.playSound(PS1Sound.ITEM);
                  await PSMenu.StextLast(
                    PSGame.getString("Item_Equip", "<item>", chosenItem.getName(), "<player>", p.getMember(buyToWhom - 1)!.getName())
                  );
                } else {
                  p.getMember(buyToWhom - 1)!.addItem(chosenItem);
                  PSGame.playSound(PS1Sound.ITEM);
                }
              } else {
                const buyAnyway = await PSMenu.PromptNext(
                  PSGame.getString("Shop_Cant_Equip", "<player>", p.getMember(buyToWhom - 1)!.getName(), "<item>", chosenItem.getName()),
                  PSGame.getYesNo()
                );

                if (buyAnyway !== 1) {
                  bought = false;
                  continue;
                }

                p.getMember(buyToWhom - 1)!.addItem(chosenItem);
                PSGame.playSound(PS1Sound.ITEM);
              }
            }

            fullOrNotTaken = false;
            p.mst -= chosenItem.getCost();
            PSMenuShop.mstBox?.updateText(0, `MST ${p.mst}`);
            bought = true;

          } while (fullOrNotTaken);
        }
      }
    }

    return true; // Keep Shopping Routine
  }

  /**
   * Handle sell menu functionality
   */
  private static async ShopSellMenu(p: Party): Promise<void> {
    while (true) {
      let sellFromWhom = 1;

      if (p.partySize() > 1) {
        sellFromWhom = await PSMenu.PromptNext(
          PSGame.getString("Shop_Tool_Item_SellWhom"),
          p.listMembers()
        );
      }

      if (sellFromWhom > 0) {
        // Check for empty item list
        if (p.getMember(sellFromWhom - 1)!.items.length === 0) {
          await PSMenu.StextLast(PSGame.getString("Shop_Tool_Item_SellNoItem"));
          if (p.partySize() === 1) { // Cancel if only party member
            return;
          }
          continue;
        }

        const itemList = p.getMember(sellFromWhom - 1)!.items;
        const sellWhatItem = await PSMenu.PromptNext(
          PSGame.getString("Shop_Tool_Item_Sell_What"),
          Item.toString(itemList, false)
        );

        if (sellWhatItem > 0) {
          const sellItem = itemList[sellWhatItem - 1];

          if (sellItem.isQuest()) {
            await PSMenu.StextLast(PSGame.getString("Shop_Tool_Item_Quest"));
          } else {
            const confirmSell = await PSMenu.PromptNext(
              PSGame.getString(
                "Shop_Tool_Item_Sell",
                "<number>",
                Math.floor(itemList[sellWhatItem - 1].getCost() / 2).toString(),
                "<item>",
                itemList[sellWhatItem - 1].getName()
              ),
              PSGame.getYesNo()
            );

            if (confirmSell === 1) {
              p.mst += Math.floor(itemList[sellWhatItem - 1].getCost() / 2);
              PSMenuShop.mstBox?.updateText(0, `MST ${p.mst}`);
              p.getMember(sellFromWhom - 1)!.removeItem(sellWhatItem - 1);

              await PSMenu.StextLast(PSGame.getString("Shop_Tool_Item_Sold"));
            }
          }
        } else {
          if (p.partySize() === 1) {
            return;
          }
          // Cancel: Return to Selling Menu if party > 1
        }
      } else { // Cancel
        return;
      }
    }
  }
}