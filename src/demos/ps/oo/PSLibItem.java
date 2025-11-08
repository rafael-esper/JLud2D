package demos.ps.oo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import domain.VImage;

import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PSEffect.EffectOutcome;
import demos.ps.oo.PSEffect.EffectTarget;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.Item.ItemType;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu.Cancellable;

public class PSLibItem {

	public enum OriginalItem {
		Weapon_Wood_Cane, Weapon_Short_Sword, Weapon_Iron_Sword, Weapon_Psycho_Wand, Weapon_Saber_Claw, Weapon_Iron_Axe, 
		Weapon_Titanium_Sword, Weapon_Ceramic_Sword, Weapon_Needle_Gun, Weapon_Silver_Tusk, Weapon_Heat_Gun, Weapon_Light_Saber, 
		Weapon_Laser_Gun, Weapon_Laconian_Sword, Weapon_Laconian_Axe, Weapon_Mini_Cannon, // New 

		Armor_Leather_Clothes, Armor_White_Cloak, Armor_Light_Suit, Armor_Iron_Armor, Armor_Spiky_Fur, Armor_Saber_Fur,
		Armor_Titanium_Mail, Armor_Zirconian_Mail, Armor_Diamond_Mail, Armor_Laconian_Armor, Armor_Frad_Cloak, 
		Armor_Laconian_Mail, // New
		
		Shield_Leather_Shield, Shield_Bronze_Shield, Shield_Iron_Shield, Shield_Ceramic_Shield, 
		Shield_Animal_Glove, Shield_Laser_Barrier, Shield_Mirror_Shield, Shield_Laconian_Shield,
		Shield_Light_Barrier, // New
		
		Vehicle_LandMaster, Vehicle_FlowMover, Vehicle_IceDecker, 
		Inventory_Monomate, Inventory_Dimate, Inventory_Trimate, Inventory_Soothe_Flute, Inventory_Flash, Inventory_Escape_Cloth, 
		Inventory_TranCarpet, Inventory_Magic_Hat, Inventory_Telepathy_Ball, Inventory_Light_Pendant,
		Inventory_Zillion, Inventory_Master_System,
		
		Quest_Alsuline, Quest_Polymeteral, Quest_Dungeon_Key, 
		Quest_Eclipse_Torch, Quest_Aeroprism, Quest_Laerma_Berries, Quest_Hapsby, 
		Quest_Road_Pass, Quest_Passport, Quest_Compass, Quest_Shortcake, Quest_Governor_Letter, 
		Quest_Laconian_Pot, Quest_Carbunckle_Eye, Quest_GasClear, Quest_Damoa_Crystal, 
		Quest_Secret_Thing, Quest_Miracle_Key 	};
	
	
	public static HashMap<Integer, Item> initializeOriginalItems() {
		
		HashMap<Integer, Item> items = new HashMap<Integer, Item>();
		
		// WEAPONS
		addItem(items, OriginalItem.Weapon_Mini_Cannon, 100, ItemType.CANNON, 0, "battle/weapon_ps1/Needle.chr", PS1Sound.NEEDLE_GUN); // New, for haspby
		
		addItem(items, OriginalItem.Weapon_Wood_Cane, 25, ItemType.WAND, 3, "battle/weapon_ps1/Sword.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Short_Sword, 30, ItemType.SWORD, 4, "battle/weapon_ps1/Sword.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Iron_Axe, 64, ItemType.AXE, 10, "battle/weapon_ps1/Axe.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Saber_Claw,800, ItemType.CLAW, 10, "battle/weapon_ps1/Fang.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Psycho_Wand,1200, ItemType.WAND, 10, "battle/weapon_ps1/Sword.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Iron_Sword,75, ItemType.SWORD, 12, "battle/weapon_ps1/Sword.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Needle_Gun,400, ItemType.PISTOL, 18, "battle/weapon_ps1/Needle.chr", PS1Sound.NEEDLE_GUN);
		addItem(items, OriginalItem.Weapon_Titanium_Sword,320, ItemType.SWORD, 21, "battle/weapon_ps1/Sword.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Heat_Gun,1540, ItemType.PISTOL, 32, "battle/weapon_ps1/Heat.chr", PS1Sound.FIRE); // Was 30
		addItem(items, OriginalItem.Weapon_Silver_Tusk,1620, ItemType.CLAW, 30, "battle/weapon_ps1/Fang.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Ceramic_Sword,1120, ItemType.SWORD, 31, "battle/weapon_ps1/Sword.chr", PS1Sound.PLAYER_DEFAULT_ATTACK);
		addItem(items, OriginalItem.Weapon_Light_Saber,2980, ItemType.SWORD, 46, "battle/weapon_ps1/Light.chr", PS1Sound.ENEMY_SWEEP);
		addItem(items, OriginalItem.Weapon_Laser_Gun,6120, ItemType.PISTOL, 50, "battle/weapon_ps1/Laser.chr", PS1Sound.LASER_GUN); // Price was 4120
		addItem(items, OriginalItem.Weapon_Laconian_Sword,8000, ItemType.SWORD, 60, "battle/weapon_ps1/LacoSword.chr", PS1Sound.LACONIA_WEAP);
		addItem(items, OriginalItem.Weapon_Laconian_Axe,9780, ItemType.AXE, 80, "battle/weapon_ps1/LacoAxe.chr", PS1Sound.LACONIA_WEAP);

		// ARMORS
		addItem(items, OriginalItem.Armor_Leather_Clothes,28, ItemType.MAIL, 5, Effect.NONE);
		addItem(items, OriginalItem.Armor_White_Cloak,78, ItemType.MANTLE, 5, Effect.NONE);
		addItem(items, OriginalItem.Armor_Light_Suit,290, ItemType.MAIL, 15, Effect.NONE);
		addItem(items, OriginalItem.Armor_Iron_Armor,320, ItemType.ARMOR, 20, Effect.NONE);
		addItem(items, OriginalItem.Armor_Spiky_Fur,630, ItemType.FUR, 30, Effect.NONE);
		addItem(items, OriginalItem.Armor_Saber_Fur,4200, ItemType.FUR, 50, Effect.NONE); // NEW!
		addItem(items, OriginalItem.Armor_Titanium_Mail,1000, ItemType.MAIL, 25, Effect.NONE); // NEW!
		addItem(items, OriginalItem.Armor_Zirconian_Mail,3800, ItemType.MAIL, 40, Effect.NONE); // Changed to Mail, from 1000
		addItem(items, OriginalItem.Armor_Frad_Cloak,840, ItemType.MANTLE, 40, Effect.NONE);
		addItem(items, OriginalItem.Armor_Diamond_Mail,15000, ItemType.MAIL, 60, Effect.NONE); // Changed to Mail
		addItem(items, OriginalItem.Armor_Laconian_Mail,20780, ItemType.MAIL, 75, Effect.NONE); // NEW!
		addItem(items, OriginalItem.Armor_Laconian_Armor,22980, ItemType.ARMOR, 80, Effect.NONE);

		// SHIELDS
		addItem(items, OriginalItem.Shield_Leather_Shield,30, ItemType.LIGHT_SHIELD, 3, Effect.NONE);
		addItem(items, OriginalItem.Shield_Bronze_Shield,310, ItemType.HEAVY_SHIELD, 8, Effect.NONE);
		addItem(items, OriginalItem.Shield_Iron_Shield,520, ItemType.HEAVY_SHIELD, 15, Effect.NONE);
		addItem(items, OriginalItem.Shield_Ceramic_Shield,1400, ItemType.LIGHT_SHIELD, 23, Effect.NONE);
		addItem(items, OriginalItem.Shield_Laser_Barrier,2800, ItemType.BARRIER, 30, Effect.NONE); // Changed to Barrier, reduced price
		addItem(items, OriginalItem.Shield_Animal_Glove,3300, ItemType.GLOVES, 40, Effect.NONE);
		addItem(items, OriginalItem.Shield_Mirror_Shield,-1, ItemType.HEAVY_SHIELD, 40, Effect.NONE);
		addItem(items, OriginalItem.Shield_Laconian_Shield,8820, ItemType.LIGHT_SHIELD, 50, Effect.NONE);
		addItem(items, OriginalItem.Shield_Light_Barrier,450, ItemType.BARRIER, 10, Effect.NONE);

		// ITEMS
		addItem(items, OriginalItem.Inventory_TranCarpet,48, ItemType.ITEM, 0, Effect.FLY);
		addItem(items, OriginalItem.Inventory_Escape_Cloth,10, ItemType.ITEM, 0, Effect.ESCAPE);
		addItem(items, OriginalItem.Inventory_Soothe_Flute,-1, ItemType.ITEM, 0, Effect.MUSIC);
		addItem(items, OriginalItem.Inventory_Monomate,10, ItemType.ITEM, 10, Effect.CURE);
		addItem(items, OriginalItem.Inventory_Dimate,40, ItemType.ITEM, 40, Effect.CURE);
		addItem(items, OriginalItem.Inventory_Trimate, 500, ItemType.ITEM, 150, Effect.CURE);
		addItem(items, OriginalItem.Inventory_Magic_Hat,20, ItemType.ITEM, 0, Effect.CHAT);
		addItem(items, OriginalItem.Inventory_Telepathy_Ball,30, ItemType.ITEM, 0, Effect.TELE);
		addItem(items, OriginalItem.Inventory_Flash,20, ItemType.ITEM, 0, Effect.LIGHT);
		addItem(items, OriginalItem.Inventory_Light_Pendant,1400, ItemType.ITEM, 0, Effect.NONE);

		// QUEST ITEMS
		addItem(items, OriginalItem.Quest_Dungeon_Key,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Miracle_Key,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Alsuline,2000, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Eclipse_Torch,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Aeroprism,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Compass, 200, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Shortcake,280,ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Polymeteral,1600, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Road_Pass,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Passport, 100, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Laconian_Pot,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Laerma_Berries,0,ItemType.QUEST,0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Carbunckle_Eye,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Damoa_Crystal,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_Governor_Letter,0, ItemType.QUEST, 0, Effect.NONE);
		addItem(items, OriginalItem.Quest_GasClear,1000, ItemType.QUEST, 0, Effect.NONE);		

		// SECRET
		addItem(items, OriginalItem.Quest_Secret_Thing, 200, ItemType.SECRET, 0, Effect.NONE);
		
		// TRANSPORT
		addItem(items, OriginalItem.Vehicle_LandMaster,5200, ItemType.VEHICLE, 0, Effect.NONE);
		addItem(items, OriginalItem.Vehicle_FlowMover,0, ItemType.VEHICLE, 0, Effect.NONE);
		addItem(items, OriginalItem.Vehicle_IceDecker,12000, ItemType.VEHICLE, 0, Effect.NONE);
		
		return items;
	}

	
	private static void addItem(HashMap<Integer, Item> items, OriginalItem item, int price, ItemType type, int mod, Effect effect) {
		items.put(item.ordinal(), new Item("Item_" + item.name(), price, type, mod, effect));
	}
	private static void addItem(HashMap<Integer, Item> items, OriginalItem item, int price, ItemType type, int mod, String animation, PS1Sound sound) {
		items.put(item.ordinal(), new Item("Item_" + item.name(), price, type, mod, animation, sound));
	}

 	// Called when the item is select for use
	public static PSEffect prepareItem(Item item, PartyMember member) {

 		PSEffect effect = new PSEffect(item.getEffect());
 		effect.setUser(member);
 		effect.setValue(item.getStat());

 		if(item.getEffect().getTarget() == EffectTarget.MEMBER || item.getEffect().getTarget() == EffectTarget.ALIVE_MEMBER) {
			int partySel = 1;
			if(PSGame.getParty().partySize() > 1) {
				PSMenu.instance.push(PSMenu.instance.createPromptBox(150, 70, PSGame.getParty().listMembers(), true));
				partySel = PSMenu.instance.waitOpt(Cancellable.TRUE) + 1;
				PSMenu.instance.pop();
			}
			
			if(partySel == 0) {
				return null;
			}
			PartyMember target = PSGame.getParty().getMember(partySel-1);
			if(item.getEffect().getTarget() == EffectTarget.ALIVE_MEMBER && target.getHp() <= 0) {
				PSMenu.Stext(PSGame.getString("Battle_Player_Dead", "<player>", target.getName()));
				return null;
			}
			
			effect.setTarget(target);
 		}
 				
		return effect;
	}

}
