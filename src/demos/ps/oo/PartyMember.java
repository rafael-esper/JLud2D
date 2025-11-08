package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import domain.Entity;
import domain.VImage;

import demos.ps.oo.Item.EquipPlace;
import demos.ps.oo.Item.ItemType;
import demos.ps.oo.PSEffect.EffectPlace;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSLibSpell.PS1Spell;
import demos.ps.oo.PSLibSpell.Spell;
import demos.ps.oo.menuGUI.MenuLabelBox;
import static java.util.Arrays.asList;
import static demos.ps.oo.PSGame.getItem;

public class PartyMember extends Battler implements Serializable {

	static final Logger log = LogManager.getLogger(PartyMember.class);
	
	public static final int ITEMS_SIZE = 10;
	
	//Entity e;
	private String charPath;
	private Gender gender;
	private Specie spe;
	private Job job;

	private String name;
	private int atk, def, maxHp, maxMp;
	int hp, mp, level, xp;

	public Item[] equipment = new Item[EquipPlace.values().length];
	public List<Item> items = new ArrayList<Item>();
	
	public List<Spell> spells = new ArrayList<Spell>();

	public PS1Image portrait;
	public transient PS1Image smallPortrait;

	public transient MenuLabelBox textBox; // For battle
	
	
	public PartyMember(Gender gender, Specie spe, Job job, String name, PS1Image portrait, String charPath) {
		this(gender, spe, job, name, charPath);
		this.portrait = portrait;
	}
		
	public PartyMember(Gender gender, Specie spe, Job job, String name, String charPath) {
		this.setGender(gender);
		this.setSpe(spe);
		this.setJob(job);
		this.name = name;
		this.setCharPath(charPath==null ? "": charPath);
		 
		this.xp = 0;
		this.level = 0; 
		this.advanceLevel(); // To Level 1
		
		this.heal();
		this.equipDefault();
	}


	private void equipDefault() {
		
		if("".equals(getCharPath())) // Fake 'Char', created for testing purposes
			return;
		
		switch(this.getJob()) {
			case ADVENTURER:
				equipItem(getItem(OriginalItem.Weapon_Short_Sword));
				equipItem(getItem(OriginalItem.Armor_Leather_Clothes));
				break;
			case FIGHTER:
				equipItem(getItem(OriginalItem.Weapon_Iron_Axe));
				equipItem(getItem(OriginalItem.Armor_Iron_Armor));
				break;
			case ESPER:
				equipItem(getItem(OriginalItem.Weapon_Wood_Cane));
				equipItem(getItem(OriginalItem.Armor_White_Cloak));
				break;
			case ROBOT:
				equipItem(getItem(OriginalItem.Weapon_Mini_Cannon));
				break;
			default:
				break;
		}
		
	}


	// True if learned a new spell, False otherwise
	public boolean advanceLevel() {
		if (level >= 100) {
			log.error("Can't advance level past 100.");
			return false;
		}
		level = level+1;
		if(this.xp < getJob().listXp(level)) {
			this.xp = getJob().listXp(level);
		}
		this.maxHp = getJob().getHp(getSpe(), level);
		this.maxMp = getJob().getMp(getSpe(), level);
		this.atk += getJob().getAtk(level)-(level>1 ? getJob().getAtk(level-1) : 0);
		this.def += getJob().getDef(level)-(level>1 ? getJob().getDef(level-1) : 0);
		
		// If has spell(s) for this level
		if(this.getJob().getMapLevelSpell().get(level) != null) {
			for(Spell spell: this.getJob().getMapLevelSpell().get(level)) {
				spells.add(spell);
			}
			return true;
		}
		
		return false;
	}
	
	public void heal() {
		this.hp = getMaxHp();
		this.mp = getMaxMp();
	}


	public boolean canEquip(ItemType type) {

		// Specie can't equip this item
		if(res_spe_obj.get(getSpe())!=null && res_spe_obj.get(getSpe()).contains(type)) 
			return false;
		
		// Job can equip this item
		if(map_job_obj.get(getJob())!=null && map_job_obj.get(getJob()).contains(type)) 
			return true;
		
		return false;
	}
	
	public int getNumItems() {
		return items.size();
	}
	
	public boolean isFull() {
		if (items.size() >= ITEMS_SIZE) {
			return true;
		}
		return false;
	}

	/* These methods just do what is necessary, they don't make validations
	 */
	public void addItem(Item item) {
		if(item.type == ItemType.QUEST || item.type == ItemType.VEHICLE) {
			PSGame.getParty().addQuestItem(item);
		}
		else {
			items.add(item);
		}
	}

	public void removeItem(int index) {
		items.remove(index);
	}
	
	public void equipItem(int index) {
		equipItem(items.get(index));
		items.remove(index);
	}
	
	public void equipItem(Item item) {

		// If there is an equipped item, unequip it
		if(equipment[item.type.place.ordinal()] != null) {
			unEquip(item.type.place);
		}

		// Increment stats
		if(item.type.place == EquipPlace.WEAPON) {
			this.atk += item.itemstat;
		} else {
			this.def += item.itemstat;
		}

		equipment[item.type.place.ordinal()] = item;
	}


	public void unEquip(EquipPlace equipPlace) {
		switch(equipPlace) {
			case WEAPON: 
				this.atk -= equipment[equipPlace.ordinal()].itemstat;
				break;
			case CHEST: 
			case COVER:
				this.def -= equipment[equipPlace.ordinal()].itemstat;
				break;
		}
		
		items.add(equipment[equipPlace.ordinal()]);
	}
	
	public List<Item> getItems() {
		return this.items;
	}
	public List<Spell> getSpells(EffectPlace place) {
		List<Spell> spellList = new ArrayList<Spell>();
		for(Spell s: spells) {
			if(s.getEffect().getPlace() == EffectPlace.ANY) {
				spellList.add(s);
			}
			if(s.getEffect().getPlace() == EffectPlace.WORLD && place == EffectPlace.WORLD) {
				spellList.add(s);
			}
			if(s.getEffect().getPlace() == EffectPlace.BATTLE && place == EffectPlace.BATTLE) {
				spellList.add(s);
			}
		}

		return spellList;
	}
	public String[] listSpells(EffectPlace place) {
		List<Spell> spellList = getSpells(place);
		String[] s = new String[spellList .size()];
		for(int i=0; i<s.length; i++) {
			s[i] = spellList.get(i).toString();
		}
		return s;
	}
	
	
	
	@Override
	public String toString() {
		return name + " level " + level + " is a " + getSpe() + " " + getJob() + " with " + maxHp + " HP and " + maxMp + " MP. ATK: " + atk + " DEF: " + def;			
	}	
	
	
	public static enum Gender {
		MALE, FEMALE;
		@Override
		public String toString() { //only capitalize the first letter
			String s = super.toString();
			return PSGame.getString("Gender_" + s.substring(0, 1) + s.substring(1).toLowerCase());  
		} 		
	}
	
	public static Map<Job, List<ItemType>> map_job_obj = new HashMap<Job, List<ItemType>>();
	public static Map<Specie, List<ItemType>> res_spe_obj = new HashMap<Specie, List<ItemType>>();

	static {
		// Mapping Job x ItemType
		map_job_obj.put(Job.ADVENTURER, asList(ItemType.SWORD, ItemType.WAND, ItemType.MAIL, ItemType.LIGHT_SHIELD, ItemType.BARRIER));
		//map_job_obj.put(Job.BAR, asList(ItemType.SWORD, ItemType.AXE, ItemType.WAND, ItemType.FUR, ItemType.GLOVES));
		map_job_obj.put(Job.WATCHER, asList(ItemType.PISTOL, ItemType.ARMOR, ItemType.BARRIER));
		map_job_obj.put(Job.ESPER, asList(ItemType.WAND, ItemType.MANTLE, ItemType.BARRIER));
		map_job_obj.put(Job.HUNTER, asList(ItemType.SLICER, ItemType.WAND, ItemType.MAIL, ItemType.FUR, ItemType.LIGHT_SHIELD, ItemType.BARRIER, ItemType.GLOVES));
		map_job_obj.put(Job.NATURER, asList(ItemType.CLAW, ItemType.FUR, ItemType.GLOVES));
		map_job_obj.put(Job.PRIEST, asList(ItemType.WAND, ItemType.MANTLE, ItemType.BARRIER));
		map_job_obj.put(Job.FIGHTER, asList(ItemType.SWORD, ItemType.PISTOL, ItemType.AXE, ItemType.WAND, ItemType.MAIL, ItemType.ARMOR, ItemType.LIGHT_SHIELD, ItemType.BARRIER, ItemType.HEAVY_SHIELD));

		// Restrictions SPE x OBJ
		res_spe_obj.put(Specie.MUSK_CAT, asList(ItemType.SWORD, ItemType.AXE, ItemType.WAND, ItemType.PISTOL, ItemType.MAIL, ItemType.ARMOR, 
											   ItemType.MANTLE, ItemType.BARRIER, ItemType.LIGHT_SHIELD, ItemType.HEAVY_SHIELD));
	}	
	
	@Override
	public int getHp() {
		return this.hp;
	}	
	
	@Override
	public void setHp(int hp) {
		this.hp = hp;
	}
	
	@Override
	public int getMaxHp() {
		return this.maxHp;
	}	

	@Override
	public int getAtk() {
		return this.atk;
	}
	@Override
	public int getDef() {
		return this.def;
	}
	@Override	
	public int getStr() {
		return (this.getJob().getAtk(this.level)*3 + (this.getJob().getHp(this.getSpe(), this.level)-4))/4;
	}		
	@Override
	public int getMental() {
		return (this.getJob().getDef(this.level) + (this.getJob().getMp(this.getSpe(), this.level)+4)*4)/4; 
	}
	@Override
	public int getAgi() {
		int mod = 10;
		switch(this.getSpe()) {
			case MUSK_CAT: mod = 21;
			case NUMAN: mod = 17;
			case MOTAVIAN: mod = 13;
		default: 
		}
		return (int) (this.getJob().getAtk(this.level) * mod) / 8;
	}		

	
	@Override
	public String getName() {
		return this.name;
	}

	public int getMp() {
		return this.mp;
	}
	
	public void setMp(int mp) {
		this.mp = mp;
	}
	
	public int getMaxMp() {
		if(this.spells.isEmpty()) {
			return 0;
		}
		return this.maxMp;
	}

	public int getXp() {
		return this.xp;
	}
	
	@Override
	public int getLevel() {
		return this.level;
	}


	public void giveExp(int gainedExp) {
		int remainingXp = this.getJob().listXp(this.getLevel() + 1) - this.xp;
		this.xp += gainedExp;
		
		if(remainingXp <= gainedExp) { // TODO Advance more than once, if enough Exp
			PSGame.playSound(PS1Sound.LEVEL_UP);
			PSMenu.StextNext(PSGame.getString("Battle_Level_Up", "<player>", this.getName()));
			if(this.advanceLevel()) { 
				PSMenu.StextNext(PSGame.getString("Battle_Learn_Spell", "<player>", this.getName()));	
			}
		}
	}

	public Specie getSpe() {
		return spe;
	}

	public void setSpe(Specie spe) {
		this.spe = spe;
	}

	public Gender getGender() {
		return gender;
	}

	public void setGender(Gender gender) {
		this.gender = gender;
	}

	public Job getJob() {
		return job;
	}

	public void setJob(Job job) {
		this.job = job;
	}

	public String getCharPath() {
		return charPath;
	}

	public void setCharPath(String charPath) {
		this.charPath = charPath;
	}
}
