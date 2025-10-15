package demos.ps.oo;

import demos.ps.oo.PSLibSound.PS1Sound;
import domain.CHR;

//Following the Builder pattern for clarity

public class Enemy {

	enum Type{NONE, PALMA, MOTAVIA, DEZORIS, SPECIAL, UNDEAD};
	
	enum HasItem{NONE, COLA, DIMATE, FLASH};
	enum CanTalk{YES, NO};
	enum CanChat{YES, NO};
	enum CanRope{YES, NO};
	enum CanProt{YES, NO};
	enum HasWing{YES, NO};
	enum FireRes{YES, NO};
	enum Special{NONE, FIRE, THUNDER, THUNDER2, ROPE, HELP, PETRIFY, CURE, MP_DRAIN, DOUBLE_ATTACK};
	enum Mental{LOWEST, LOWER, NORMAL, HIGHER};
		
	private String name;
	int hp=0, atk=0, def=0, exp=0, mst=0, num=1, run=0, trap=0;
	int specialShiftX = 0, specialShiftY = 0;
	 
	// Optional
	CanTalk talk=CanTalk.NO;
	CanChat chat=CanChat.NO;
	CanRope rope=CanRope.YES;
	CanProt prot=CanProt.YES;
	HasWing wing=HasWing.NO;
	FireRes fire=FireRes.NO;
	HasItem item=HasItem.NONE;
	Special special = Special.NONE;
	Mental mental = Mental.NORMAL;
	
	PS1Sound attackSound;
	Type type;
	 
	String strAnimCHR;
	CHR animCHR;
	int vertical;
	int contact;
 
	public Enemy(String name) {
		this.name = name;
	}
	
	public Enemy hp(int hp) {
		this.hp = hp;
		return this;
	}
	public Enemy atk(int atk) {
		this.atk = atk;
		return this;
	}
	public Enemy def(int def) {
		this.def = def;
		return this;
	}
	public Enemy exp(int exp) {
		this.exp = exp;
		return this;
	}
	public Enemy mst(int mst) {
		this.mst = mst;
		return this;
	}
	public Enemy num(int num) {
		this.num = num;
		return this;
	}
	public Enemy run(int run) {
		this.run = run;
		return this;
	}	
	public Enemy trap(int trap) {
		this.trap = trap;
		return this;
	}
	
	// Optional (has proper default values)
	public Enemy item(HasItem item) {
		this.item = item;
		return this;
	}	
	public Enemy talk(CanTalk talk) {
		this.talk = talk;
		return this;
	}	
	public Enemy chat(CanChat chat) {
		this.chat = chat;
		return this;
	}	
	public Enemy rope(CanRope rope) {
		this.rope = rope;
		return this;
	}	
	public Enemy prot(CanProt prot) {
		this.prot = prot;
		return this;
	}	
	public Enemy wing(HasWing wing) {
		this.wing = wing;
		return this;
	}
	public Enemy fire(FireRes fire) {
		this.fire = fire;
		return this;
	}	
	public Enemy special(Special special) {
		this.special = special;
		return this;
	}

	public Enemy mental(Mental mental) {
		this.mental = mental;
		return this;
	}
	
	public Enemy spcpoint(int i, int j) {
		this.specialShiftX = i;
		this.specialShiftY = j;
		return this;
	}

	public Enemy sound(PS1Sound sound) {
		this.attackSound = sound;
		return this;
	}
	
	public PS1Sound getSound() {
		return this.attackSound;
	}
	
	public int getMaxHp() {
		return hp;
	}
	public int getMaxNum() {
		return num;
	}
	
	public Enemy anim(String strAnim) {
		this.strAnimCHR = strAnim;
		return this;
	}	

	public Enemy vertical(int i) {
		this.vertical = i;
		return this;
	}
	public Enemy contact(int i) {
		this.contact = i;
		return this;
	}
	public Enemy type(Type type) {
		this.type = type;
		return this;
	}
	

	// Lazy load CHR
	public CHR getChr() {
		if(this.animCHR == null) {
			this.animCHR = CHR.loadChr(this.strAnimCHR);			
		}
		return this.animCHR;
	}

	public int getMental() {
		switch(mental) {
		case HIGHER:
			return this.getMaxHp() * 2;
		case LOWER:
			return this.getMaxHp() / 2;
		case LOWEST:
			return this.getMaxHp() / 4;
		default:
			return this.getMaxHp();
		}
	}
	
	public String getName() {
		return PSGame.getString(this.name);
	}

}
