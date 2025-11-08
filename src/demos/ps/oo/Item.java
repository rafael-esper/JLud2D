package demos.ps.oo;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PSLibSound.PS1Sound;

import domain.CHR;
import domain.VImage;

public class Item implements Serializable {

	public static final int MAX_ITEM_PRICE_LENGTH = 5; // Up to '99999'

	public static enum EquipPlace {WEAPON, CHEST, COVER};	
	
	public static enum ItemType {
		WAND (EquipPlace.WEAPON), 	SWORD (EquipPlace.WEAPON),	AXE (EquipPlace.WEAPON),	SLICER (EquipPlace.WEAPON), 
		CLAW (EquipPlace.WEAPON), 	PISTOL (EquipPlace.WEAPON), CANNON (EquipPlace.WEAPON),
		MAIL (EquipPlace.CHEST), 	ARMOR (EquipPlace.CHEST), 	MANTLE (EquipPlace.CHEST), 	FUR (EquipPlace.CHEST), 
		GLOVES (EquipPlace.COVER), 	BARRIER (EquipPlace.COVER), LIGHT_SHIELD (EquipPlace.COVER), 
		HEAVY_SHIELD (EquipPlace.COVER), 
		ITEM (null), QUEST (null), VEHICLE (null), SECRET(null);
		
		public EquipPlace place;
		
		private ItemType(EquipPlace place) {
			this.place = place;
		}
	}

	
	private String varName;
	private int cost;
	int itemstat;
	ItemType type;

	//VImage portrait;
	//ItemEffect itemeffect
	
	private transient CHR chrWeaponAnimation;
	private String strWeaponAnimation;
	PS1Sound weaponSound;
	
	Effect effect;
	
	
	public Item(String str, int mesetas, ItemType type, int modifier, String chrWeapon, PS1Sound sound) {
		this(str, mesetas, type, modifier, Effect.NONE);
		this.strWeaponAnimation = chrWeapon;
		this.weaponSound = sound;
	}
	
	public Item(String name, int price, ItemType type, int modifier, Effect effect) {
		this.varName = name;
		this.cost = price;
		this.type = type;
		this.itemstat = modifier;
		this.effect = effect;
	}
	
	public boolean isEquippable() {
		if(this.type == ItemType.ITEM || 
			this.type == ItemType.VEHICLE || 
			this.type == ItemType.QUEST)
				return false;
		return true;
	}

	public String getName() {
		try {
			return(PSGame.getString(this.varName));
		}
		catch(Exception e) {
			return this.varName;
		}
	}
	
	public CHR getChrWeaponAnimation() {
		if(this.chrWeaponAnimation == null) {
			this.chrWeaponAnimation = CHR.loadChr(this.strWeaponAnimation);			
		}
		return this.chrWeaponAnimation;		
	}
	
	public int getCost() {
		return this.cost;
	}
	public Effect getEffect() {
		return this.effect;
	}	
	public int getStat() {
		return this.itemstat;
	}

	public boolean isQuest() {
		if(type == ItemType.QUEST || type == ItemType.VEHICLE || type == ItemType.SECRET) {
			return true;
		}
		return false;
	}
	
	
	@Override
	public String toString() {
		return this.getName();
	}
	
	public static String[] toString(Item[] items, boolean showCost) {
		List<Item> asList = Arrays.asList(items);
		return toString(asList, showCost);
	}
	public static String[] toString(List<Item> items, boolean showCost) {
		
		String[] s = new String[items.size()];
		int maxSize = 0;
		for(int i=0; i<s.length; i++) {
			if(items.get(i).getName().length() > maxSize) {
				maxSize = items.get(i).getName().length(); 
			}
		}
		for(int i=0; i<s.length; i++) {
			
			if(showCost) {
				int numSpaces = Math.max(0,  maxSize - items.get(i).getName().length());
				s[i] = items.get(i).getName() + (new String(new char[numSpaces]).replace('\0', ' '));
				numSpaces = 1 + MAX_ITEM_PRICE_LENGTH - Integer.toString(items.get(i).cost).length();
				s[i] = s[i] + (new String(new char[numSpaces]).replace('\0', ' ')) + items.get(i).cost;
			}
			else {
				s[i] = items.get(i).getName();
			}
		}
		return s;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime
				* result
				+ ((chrWeaponAnimation == null) ? 0 : chrWeaponAnimation
						.hashCode());
		result = prime * result + cost;
		result = prime * result + ((effect == null) ? 0 : effect.hashCode());
		result = prime * result + itemstat;
		result = prime
				* result
				+ ((strWeaponAnimation == null) ? 0 : strWeaponAnimation
						.hashCode());
		result = prime * result + ((type == null) ? 0 : type.hashCode());
		result = prime * result + ((varName == null) ? 0 : varName.hashCode());
		result = prime * result
				+ ((weaponSound == null) ? 0 : weaponSound.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Item other = (Item) obj;
		if (chrWeaponAnimation == null) {
			if (other.chrWeaponAnimation != null)
				return false;
		} else if (!chrWeaponAnimation.equals(other.chrWeaponAnimation))
			return false;
		if (cost != other.cost)
			return false;
		if (effect != other.effect)
			return false;
		if (itemstat != other.itemstat)
			return false;
		if (strWeaponAnimation == null) {
			if (other.strWeaponAnimation != null)
				return false;
		} else if (!strWeaponAnimation.equals(other.strWeaponAnimation))
			return false;
		if (type != other.type)
			return false;
		if (varName == null) {
			if (other.varName != null)
				return false;
		} else if (!varName.equals(other.varName))
			return false;
		if (weaponSound != other.weaponSound)
			return false;
		return true;
	}
	
}
