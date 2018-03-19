package demos.ps.oo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.junit.BeforeClass;
import org.junit.Test;

import core.Script;
import domain.VImage;
import demos.ps.oo.Battler;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;

public class BattlerTest {

	static HashMap<GenericEnemy, Enemy> enemyLib; 
	
	@BeforeClass
	public static void initStructures() {
		enemyLib = PSLibEnemy.initializeOriginalEnemies();
	}
	
	@Test
	public void getNaturalOrderInOrderTest() {
		List<Battler> battlers = new ArrayList<Battler>();
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.SWORM), 1));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.MANEATER), 2));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.SCORPION), 3));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.OWL_BEAR), 4));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.GR_SLIME), 5));
		
		System.out.println(Arrays.toString(Battler.getNaturalOrder(battlers).toArray()));
	}

	@Test
	public void getNaturalOrderInReverseOrderTest() {
		List<Battler> battlers = new ArrayList<Battler>();
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.SWORM), 5));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.MANEATER), 4));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.SCORPION), 3));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.OWL_BEAR), 2));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.GR_SLIME), 1));
		
		System.out.println(Arrays.toString(Battler.getNaturalOrder(battlers).toArray()));
		
	}

	@Test
	public void getNaturalOrderInRandomOrderTest() {
		List<Battler> battlers = new ArrayList<Battler>();
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.SWORM), 5));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.MANEATER), 3));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.SCORPION), 2));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.OWL_BEAR), 1));
		battlers.add(newEnemyForTest(enemyLib.get(PS1Enemy.GR_SLIME), 4));
		
		System.out.println(Arrays.toString(Battler.getNaturalOrder(battlers).toArray()));
	}
	
	
	private Battler newEnemyForTest(Enemy enemy, int i) {
		Battler b1 = new EnemyBattler(enemy);
		b1.naturalOrder = i;
		return b1;
	}
	
}
