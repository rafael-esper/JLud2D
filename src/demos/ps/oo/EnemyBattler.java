package demos.ps.oo;

import demos.ps.oo.Enemy.HasWing;
import demos.ps.oo.Enemy.Type;

public class EnemyBattler extends Battler {
	
	Enemy enemy;
	
	int hp;
	
	public EnemyBattler(Enemy enemy) {
		this.enemy = enemy;
		this.hp = enemy.hp;
	}
	
	public Enemy getEnemy() {
		return this.enemy;
	}

	@Override
	public String getName() {
		return enemy.getName();
	}

	@Override
	public int getAtk() {
		return enemy.atk;
	}

	@Override
	public int getDef() {
		return enemy.def;
	}

	@Override
	public int getHp() {
		return hp;
	}

	@Override
	public int getMaxHp() {
		return enemy.hp;
	}

	@Override
	public int getAgi() {
		int agi = 255 - enemy.run; 
		if(enemy.type == Type.UNDEAD) {
			agi = agi / 4;
		}
		
		return agi;
	}
	
	@Override
	public int getStr() {
		return (this.getMaxHp() + this.getAtk())/2;
	}

	@Override
	public int getMental() {
		return enemy.getMental();
	}	

	@Override
	public int getLevel() {
		return 1 + hp / 10; // Default, varies between 2 (Sworm) and 50+ (Darkfalz)
	}

	@Override
	public void setHp(int i) {
		this.hp = i;
	}
	
	// Where to place the enemy sprite
	public int getVerticalPos() {
		return enemy.vertical;
		//return 110 + enemy.vertical +20-(enemy.getChr().fysize/2);
	}

	// Where the player weapon animation / magic animation connects 
	public int getContactPos() {
		return enemy.contact;
		//return 110 + enemy.vertical + enemy.getChr().hh;
	}

	
}

