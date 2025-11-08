package demos.ps.oo;

public enum Specie {
		 // HP MP AGI STR MEN //hp=4, mp=3, other=1
	PALMAN	(0, 0, 0, 0, 0), 
	MUSK_CAT(-3, +2, +3, 0, +3), // -12+6+3+3 = 0
	NUMAN	(+1, 0, +2, -3, -3), // +4+2-3-3 = 0
	ANDROID	(0, 0, -2, 0, +2), // -2+2 = 0
	MOTAVIAN(+1, -1, 0, +2, -3), // +4-3+2-3 = 0
	DEZORIAN(-1, +2, -2, -3, +3), // -4+6-2-3+3 = 0
	CYBORG (0, 0, 0, 0, 0)
	;

	final int modHp;
	/*
	 * About mods: +1 hp = 2 points; +1 any other = 1 points. So all species are
	 * balanced.
	 */
	final int modMp;
	private final int modAgi;
	private final int modStr;
	private final int modMen;

	Specie(int hp, int mp, int agi, int str, int men) {
		this.modHp = hp;
		this.modMp = mp;
		this.modAgi = agi;
		this.modStr = str;
		this.modMen = men;
	}

	public int getModHp() {
		return this.modHp;
	}

	public int getModMp() {
		return this.modMp;
	}

	@Override
	public String toString() { // only capitalize the first letter
		String s = super.toString();
		return PSGame.getString("Specie_" + s.substring(0, 1)
				+ s.substring(1).toLowerCase());
	}

};
