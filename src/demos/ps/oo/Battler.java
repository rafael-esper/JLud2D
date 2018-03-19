package demos.ps.oo;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import demos.ps.oo.PSBattle.Action;
import demos.ps.oo.PSLibSpell.Spell;
import demos.ps.oo.menuGUI.MenuCHR;
import demos.ps.oo.menuGUI.MenuLabelBox;

public abstract class Battler implements Serializable {
	
	public abstract String getName();
	public abstract int getAtk();
	public abstract int getDef();
	public abstract int getAgi();
	public abstract int getMental();
	public abstract int getStr();

	public abstract int getHp();
	public abstract int getMaxHp();
	public abstract void setHp(int i);

	public abstract int getLevel();

	// Battle only variables
	transient int boost = 0;
	transient int weak = 0;
	transient int paralyzed = 0;
	transient int position;
	transient Battler target;
	
	transient int precedence;
	transient int naturalOrder;
	
	transient Action action;
	transient PSEffect effect;
	transient Spell usedSpell;
	transient Item usedItem;
	transient MenuCHR sprite;
	transient MenuLabelBox enemyBox;
	
	public MenuCHR getSprite() {
		return sprite;
	}
	
	public void clean() {
		paralyzed = 0;
		boost = 0;
	}
	
	static List<Integer> getNaturalOrder(List<Battler> battlers) {
		List<Integer> ret = new ArrayList<Integer>();
		boolean marked[] = new boolean[battlers.size()];
		for(int i=0; i<battlers.size(); i++) {
			int min = Integer.MAX_VALUE;
			for(int j=0; j<battlers.size(); j++) {
				if(marked[j]) {
					continue;
				}
				if(min == Integer.MAX_VALUE || battlers.get(j).naturalOrder <= battlers.get(min).naturalOrder) {
					min = j;
				}
			}
			marked[min] = true;
			ret.add(min);
		}
		
		return ret;
	}
	
	static Comparator<Battler> getNaturalComparator() {
		return new Comparator<Battler>() {
			@Override
			public int compare(Battler arg0, Battler arg1) {
				return arg0.naturalOrder - arg1.naturalOrder;
			}
		};
	}
	
	static Comparator<Battler> getPrecedenceComparator() {
		return new Comparator<Battler>() {
			@Override
			public int compare(Battler arg0, Battler arg1) {
				return arg1.precedence - arg0.precedence;
			}
		};
	}
		
}

