package demos.ps.oo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import demos.ps.oo.Item.ItemType;
import demos.ps.oo.PSLibSpell.PS1Spell;
import demos.ps.oo.PSLibSpell.Spell;

import static java.util.Arrays.asList;

// TODO Add each Job -> Initial Equipment and refactor defaultEquipment from Partymember

public enum Job {
	ADVENTURER 	(16, 4, 2.2, 2.7), // Alis, Rolf, Chaz 		36	Weap (9) + ATKTech(10) + ORITech (5) = 60
	NATURER 	(18, 4, 2.4, 2.4), // Nei, Ryka, Myau		39	Weap (6) + CURTech (10) + AGI (5) = 60
	FIGHTER		(24, 1, 3.1, 2.9), // Odin, Rudo			48	Weap(12)	=	60
	ESPER		(11, 11, 1.4, 2.2), // Noah, Rune			33	Weap (3) + ATK2Tech (18) + MiscTech (6) = 60
	ROBOT		(12, 1, 2.0, 2.6), // Hapsby
	// TODO Below this, review later
	HUNTER		(18, 3, 2.0, 2.5), // Anna, Alys, Kyra      39	Weap (6) + CBTTech(10) + AGI (5)
	MECHANIC	(21, 3, 2.0, 2.5), // Kain, Gryz			45	Weap (9) + AntiTech (6) = 60
	PRIEST 		(12, 10, 1.0, 2.5), // Raja					34	Weap (3) + CUR2Tech (18) + DEFTech (5) = 60 
	SCHOLAR 	(13, 8, 1.0, 2.5), // Hahn, Hugh			32	Weap (3) + CURTech (10) + CBTTech(10) + DEFTech (5) = 60
	HEALER 		(12, 9, 1.0, 2.5), // Amy					33	Weap (3) + CUR2Tech (18) + MiscTech (6) = 60
	THIEF		(15, 4, 1.0, 2.5), // Shir					34	Weap (3) + MiscTech (6) + AGI (5) + THI (12) = 60
	GUARDIAN	(20, 2, 2.0, 2.5), // Wren      			42	Weap (6) + MiscTech (6) + AutoCure (6) = 60
	WATCHER		(18, 2, 2.0, 2.5), // Demi					38	Weap (6) + CURTech (10) + AutoCure (6) = 60
	;

	private final int baseHp, baseMp;
	private final double aMod, dMod;

	private Map<Integer, Spell[]> map_level_spell;
	
	Job(int hp, int mp, double aMod, double dMod) {
		this.baseHp = hp;
		this.baseMp = mp;
		this.aMod = aMod;
		this.dMod = dMod;
	}

	public Map<Integer, Spell[]> getMapLevelSpell() {
		if(this.map_level_spell == null) {
			this.initLevelSpellMapping();			 			
		}
		return this.map_level_spell;
	}
	
	public int getHp(Specie spe, int level) {
		float value = baseHp + spe.modHp;
		for (int i = 2; i <= level; i++)
			value = value + ((float) (baseHp + spe.modHp) / 4)
					* (float) (i + 6) / 9;
		return Math.round(value);
	}

	public int getMp(Specie spe, int level) {
		float value = baseMp + spe.modMp;
		for (int i = 2; i <= level; i++) {
			value = value + ((float) (baseMp + spe.modMp) / 4)
					* (float) (i + 6) / 7;
		}
		value = Math.round(value);

		if (value < 20 && value % 2 == 1) // Make it even for small values
			return (int) (value + 1);
		else
			return (int) value;
	}

	public int listXp(int level) {
		int pertubation = (int) (2.3 * this.baseHp + 1.7 * this.baseMp);
		float value = 0;
		for (int i = 2; i <= level; i++)
			value = value + ((13) * (i * i) / 7) + 10;
		value = Math.round(value
				+ (int) ((pertubation * value / (190 - level))));
		return (int) value;
		//return (int) Math.min(value, 999999);
	}
	
	public int getAtk(int level) {
		double atk = (int) (Math.floor(aMod*4));
		for(int i=1;i<level;i++) {
			atk+= aMod;
		}
		return (int) Math.round(atk);
	}
			
	public int getDef(int level) {
		double def = (int) (Math.round(dMod*3));
		for(int i=1;i<level;i++) {
			def+= dMod;
		}
		return (int) Math.round(def);
	}
	
	public void initLevelSpellMapping() {

		this.map_level_spell = new HashMap<Integer, Spell[]>();
		switch(this) {
			case ADVENTURER:
				map_level_spell.put(new Integer(4), new Spell[]{PS1Spell.REST});
				map_level_spell.put(new Integer(5), new Spell[]{PS1Spell.ESCAPE});
				map_level_spell.put(new Integer(6), new Spell[]{PS1Spell.CHAT});
				map_level_spell.put(new Integer(8), new Spell[]{PS1Spell.FIRE}); // Changed, was 12
				map_level_spell.put(new Integer(14), new Spell[]{PS1Spell.ROPE});
				map_level_spell.put(new Integer(16), new Spell[]{PS1Spell.FLY});
				map_level_spell.put(new Integer(20), new Spell[]{PS1Spell.CURE}); // New
				map_level_spell.put(new Integer(26), new Spell[]{PS1Spell.GI_FIRE}); // New
				map_level_spell.put(new Integer(30), new Spell[]{PS1Spell.ROPE_ALL}); // New
				break;
			
			case NATURER:
				map_level_spell.put(new Integer(6), new Spell[]{PS1Spell.CURE});
				map_level_spell.put(new Integer(9), new Spell[]{PS1Spell.FEAR});
				map_level_spell.put(new Integer(12), new Spell[]{PS1Spell.WALL});
				map_level_spell.put(new Integer(15), new Spell[]{PS1Spell.TRAP});
				map_level_spell.put(new Integer(17), new Spell[]{PS1Spell.EXIT});
				map_level_spell.put(new Integer(20), new Spell[]{PS1Spell.FORCE});
				map_level_spell.put(new Integer(22), new Spell[]{PS1Spell.FEAR_ALL}); // New
				map_level_spell.put(new Integer(25), new Spell[]{PS1Spell.POWER_CURE}); // New
				break;

			case ESPER: // shifted by 2 some spells
				map_level_spell.put(new Integer(1), new Spell[]{PS1Spell.LIGHT, PS1Spell.FIRE});
				map_level_spell.put(new Integer(4), new Spell[]{PS1Spell.W_REST}); // New
				map_level_spell.put(new Integer(7), new Spell[]{PS1Spell.W_CURE});
				map_level_spell.put(new Integer(6+2), new Spell[]{PS1Spell.EXIT});
				map_level_spell.put(new Integer(8+2), new Spell[]{PS1Spell.TELE});
				map_level_spell.put(new Integer(12), new Spell[]{PS1Spell.WIND});
				map_level_spell.put(new Integer(14), new Spell[]{PS1Spell.PROT});
				map_level_spell.put(new Integer(16), new Spell[]{PS1Spell.GI_FIRE}); // New
				map_level_spell.put(new Integer(18), new Spell[]{PS1Spell.THUNDER});
				map_level_spell.put(new Integer(20), new Spell[]{PS1Spell.REVIVE});
				map_level_spell.put(new Integer(22), new Spell[]{PS1Spell.OPEN}); // Was 17
				map_level_spell.put(new Integer(28), new Spell[]{PS1Spell.F_REVIVE}); // New
				break;
		default:
			break;
		}
	}
	
	@Override
	public String toString() {
		String s = super.toString();
		return PSGame.getString("Job_" + s.substring(0, 1) + s.substring(1).toLowerCase());
	}
	
};	

