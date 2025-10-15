package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;

import core.Script;

import demos.ps.oo.Item.ItemType;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.menuGUI.MenuLabelBox;
import demos.ps.oo.menuGUI.MenuStack;

public class PSMenuShop {

	private static final Logger log = LogManager.getLogger(PSMenuShop.class);

	public static MenuLabelBox mstBox;

	public static void Shop(String greetings, boolean sellOption, Party p, Item[] items) {

		mstBox = PSMenu.instance.createOneLabelBox(200, 10, "MST " + p.mst,	true);
		PSMenu.instance.push(mstBox);

		PSMenu.StextFirst(greetings);
		while (true) {

			// If 'sell' option is not available, build just a default 'buy' routine
			if (!sellOption) {
				if (ShopBuyMenu(p, items)) {
					PSMenu.StextLast(PSGame.getString("Shop_Bye"));
				}
				break;
			} else {
				int option = PSMenu.PromptNext(PSGame.getString("Shop_BuyOrSell"),
						new String[] { PSGame.getString("Menu_Tool_Shop_Buy"),
								PSGame.getString("Menu_Tool_Shop_Sell") });
				if (option == 1) { // Buy
					if (ShopBuyMenu(p, items) == false) {
						break;
					}

				} else if (option == 2) { // Sell
					ShopSellMenu(p);
				} else { // Cancel
					PSMenu.StextLast(PSGame.getString("Shop_Bye"));
					break;
				}
			}

		}
		PSMenu.instance.pop(); // mstBox
	}

	private static boolean ShopBuyMenu(Party p, Item[] items) {
		boolean buyIsDone = false;
		boolean bought = false;
		while (!buyIsDone) {

			// TODO Show Status Change, if there is only one member, during WaitOpt below
			int optItem = 0;
			if (!bought)
				optItem = PSMenu.PromptNext(PSGame.getString("Shop_Buy"), Item.toString(items, true));
			else
				optItem = PSMenu.PromptNext(PSGame.getString("Shop_Bought"), Item.toString(items, true));

			if (optItem == 0) { // Cancel
				buyIsDone = true;
			} else { // Chosen Item
				Item chosenItem = items[optItem - 1];
				if (p.mst < chosenItem.getCost()) {
					PSMenu.StextLast(PSGame.getString("Shop_Not_Enough_Money"));
					buyIsDone = true;
					return false; // End Shop routine
				} else {
					// Secret Thing 'hack'
					if(chosenItem.type == ItemType.SECRET) {
						Script.callfunction("secret_item");
						return false;
					}
					
					// If there is only one member
					if (p.partySize() == 1) {
						int wantToBuy = PSMenu.PromptNext(PSGame.getString(
								"Shop_Item_Costs", "<item>",
								chosenItem.getName(), "<number>",
								Integer.toString(chosenItem.getCost())),
								PSGame.getYesNo());
						if (wantToBuy != 1) {
							bought = false;
							continue;
						}
					}
					// Routine to check if there is room and loop while there isn't
					boolean fullOrNotTaken = false;
					do {
						int buyToWhom = 1;
						if (p.partySize() > 1 && !chosenItem.isQuest()) {
							// TODO Show Status Change, if applicable, during WaitOpt below
							if (!fullOrNotTaken) {
								buyToWhom = PSMenu.PromptNext(
												PSGame.getString(
														"Shop_Item_Costs_Who",
														"<item>",
														chosenItem.getName(),
														"<number>",
														Integer.toString(chosenItem.getCost())),
												p.listMembers());
							} else {
								buyToWhom = PSMenu.PromptNext(PSGame.getString("Shop_Full_WhoElse"), p.listMembers());
							}
							if (buyToWhom == 0) { // Cancel: Return to Item List
								bought = false;
								break;
							}
						}

						// Check if party member is full
						if (p.getMember(buyToWhom - 1).isFull() && !chosenItem.isQuest()) {
							PSMenu.StextNext(PSGame.getString("Shop_Full"));
							if (p.partySize() == 1) {
								PSMenu.StextLast(PSGame
										.getString("Shop_Full_Exit"));
								buyIsDone = true;
								return false; // End Shop routine
							}

							fullOrNotTaken = true;
							continue;
						}

						// Check if item is equippable, if not, add item to list
						if (!chosenItem.isEquippable()) {
							if(chosenItem.isQuest()) {
								p.addQuestItem(chosenItem);
							}
							else {
								p.getMember(buyToWhom - 1).addItem(chosenItem);
								PSGame.playSound(PS1Sound.ITEM);
							}
						} else {

							if (p.getMember(buyToWhom - 1).canEquip(chosenItem.type)) {
								int wantToEquip = PSMenu.PromptNext(PSGame.getString("Shop_Equip_Item", "<item>",	chosenItem.getName()),
												PSGame.getYesNo());
								if (wantToEquip == 1) {
									p.getMember(buyToWhom - 1).equipItem(chosenItem);
									PSGame.playSound(PS1Sound.ITEM);
									PSMenu.StextLast(PSGame.getString("Item_Equip", "<item>",chosenItem.getName(),"<player>", p.getMember(buyToWhom - 1).getName()));
								} else {
									p.getMember(buyToWhom - 1).addItem(chosenItem);
									PSGame.playSound(PS1Sound.ITEM);
								}
							} else {
								int buyAnyway = PSMenu.PromptNext(PSGame.getString("Shop_Cant_Equip",
														"<player>",
														p.getMember(buyToWhom - 1).getName(),
														"<item>",
														chosenItem.getName()),
												PSGame.getYesNo());
								if (buyAnyway != 1) {
									bought = false;
									continue;
								}
								p.getMember(buyToWhom - 1).addItem(chosenItem);
								PSGame.playSound(PS1Sound.ITEM);
							}

						}
						fullOrNotTaken = false;
						p.mst -= chosenItem.getCost();
						mstBox.updateText(0, "MST " + p.mst);
						bought = true;

					} while (fullOrNotTaken);
				}
			}
		}
		return true; // Keep Shopping Routine
	}

	private static void ShopSellMenu(Party p) {
		while (true) {
			int sellFromWhom = 1;
			if (p.partySize() > 1) {
				sellFromWhom = PSMenu.PromptNext(
						PSGame.getString("Shop_Tool_Item_SellWhom"),
						p.listMembers());
			}

			if (sellFromWhom > 0) {
				// Check for empty item list
				if (p.getMember(sellFromWhom - 1).items.size() == 0) {
					PSMenu.StextLast(PSGame
							.getString("Shop_Tool_Item_SellNoItem"));
					if (p.partySize() == 1) { // Cancel if only party member
						return;
					}
					continue;
				}

				List<Item> itemList = p.getMember(sellFromWhom - 1).items;
				int sellWhatItem = PSMenu.PromptNext(
						PSGame.getString("Shop_Tool_Item_Sell_What"),
						Item.toString(itemList, false));
				if (sellWhatItem > 0) {
					Item sellItem = itemList.get(sellWhatItem - 1);
					if (sellItem.isQuest()) {
						PSMenu.StextLast(PSGame.getString("Shop_Tool_Item_Quest"));
					} else {
						int l = PSMenu
								.PromptNext(PSGame.getString("Shop_Tool_Item_Sell",
										"<number>",
										Integer.toString(itemList
												.get(sellWhatItem - 1).getCost() / 2),
										"<item>", itemList
												.get(sellWhatItem - 1)
												.getName()), PSGame.getYesNo());
						if (l == 1) {
							p.mst += itemList.get(sellWhatItem - 1).getCost() / 2;
							mstBox.updateText(0, "MST " + p.mst);
							p.getMember(sellFromWhom - 1).removeItem(sellWhatItem - 1);

							PSMenu.StextLast(PSGame
									.getString("Shop_Tool_Item_Sold"));
						}
					}
				} else {
					if (p.partySize() == 1) {
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
