package demos.ps;

import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import core.Script;
import domain.VImage;

import demos.ps.oo.PSBattle;
import demos.ps.oo.BattlePosition.SceneType;
import demos.ps.oo.Battler;
import demos.ps.oo.Enemy;
import demos.ps.oo.EnemyBattler;
import demos.ps.oo.Item;
import demos.ps.oo.Job;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSGame.ScreenSize;
import demos.ps.oo.PSLibEnemy;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibItem;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PartyMember;
import demos.ps.oo.PartyMember.Gender;
import demos.ps.oo.Specie;

public class BattleTest {

		public static int RUN_MAX = 100;
		
		static HashMap<GenericEnemy, Enemy> enemyLib; 
		static HashMap<Integer, Item> itemLib;
		static PSBattle bat;
		static List<Battler> battlers;
		
		@BeforeClass
		public static void initStructures() {
			enemyLib = PSLibEnemy.initializeOriginalEnemies();
			itemLib = PSLibItem.initializeOriginalItems();
			Script.screen = new VImage(320, 240);
		}

		@Before
		public void init() {
			Script.TEST_SIMULATION = true; // This will assure the commands are given automatically
			Script.TEST_POS = 0;
			Script.TEST_OPTIONS = new int[RUN_MAX*100];
			for(int i=0; i<Script.TEST_OPTIONS.length; i++) {
				Script.TEST_OPTIONS[i] = 0; // default to first option
			}
			
			PSGame.initGameScreen(ScreenSize.SCREEN_320_240);
			PSGame.initPSGame(GameType.PS_START_AS_ODIN);
			
			
			bat = new PSBattle();
			battlers = new ArrayList<Battler>();
		}
		
		public PartyMember createAlisLevel1() {
			PartyMember alis = new PartyMember(Gender.FEMALE, Specie.PALMAN, Job.ADVENTURER, "Alis", null);
			alis.equipItem(itemLib.get(OriginalItem.Weapon_Short_Sword.ordinal()));
			alis.equipItem(itemLib.get(OriginalItem.Armor_Leather_Clothes.ordinal()));
			return alis;
		}
		
		public PartyMember createAlisLevelOptimal(int level) {
			PartyMember alis = createAlisLevel1();
			alis.equipItem(itemLib.get(OriginalItem.Weapon_Laconian_Sword.ordinal()));
			alis.equipItem(itemLib.get(OriginalItem.Armor_Diamond_Mail.ordinal()));
			alis.equipItem(itemLib.get(OriginalItem.Shield_Laconian_Shield.ordinal()));
			advanceToLevel(alis, level);
			return alis;
		}
		
		public PartyMember createAlisLevelSubOptimal(int level) {
			PartyMember alis = createAlisLevel1();
			alis.equipItem(itemLib.get(OriginalItem.Weapon_Light_Saber.ordinal()));
			alis.equipItem(itemLib.get(OriginalItem.Armor_Diamond_Mail.ordinal()));
			alis.equipItem(itemLib.get(OriginalItem.Shield_Laser_Barrier.ordinal()));
			advanceToLevel(alis, level);
			return alis;
		}	
		
		public PartyMember createMyauLevel1() {
			PartyMember myau = new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, "Myau", null);
			return myau;
		}
		
		public PartyMember createMyauLevelOptimal(int level) {
			PartyMember myau = createMyauLevel1();
			myau.equipItem(itemLib.get(OriginalItem.Weapon_Silver_Tusk.ordinal()));
			myau.equipItem(itemLib.get(OriginalItem.Armor_Spiky_Fur.ordinal()));
			myau.equipItem(itemLib.get(OriginalItem.Shield_Animal_Glove.ordinal()));
			advanceToLevel(myau, level);
			return myau;
		}	

		public PartyMember createOdinLevel1() {
			PartyMember odin = new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, "Odin", null);
			odin.equipItem(itemLib.get(OriginalItem.Weapon_Iron_Axe.ordinal()));
			odin.equipItem(itemLib.get(OriginalItem.Armor_Iron_Armor.ordinal()));
			return odin;
		}
		
		public PartyMember createOdinLevelOptimal(int level) {
			PartyMember odin = createOdinLevel1();
			odin.equipItem(itemLib.get(OriginalItem.Weapon_Laconian_Axe.ordinal()));
			odin.equipItem(itemLib.get(OriginalItem.Armor_Laconian_Armor.ordinal()));
			odin.equipItem(itemLib.get(OriginalItem.Shield_Mirror_Shield.ordinal()));
			advanceToLevel(odin, level);
			return odin;
		}	
		
		public PartyMember createOdinLevelSubOptimal(int level) {
			PartyMember odin = createOdinLevel1();
			odin.equipItem(itemLib.get(OriginalItem.Weapon_Light_Saber.ordinal()));
			odin.equipItem(itemLib.get(OriginalItem.Armor_Diamond_Mail.ordinal()));
			odin.equipItem(itemLib.get(OriginalItem.Shield_Mirror_Shield.ordinal()));
			advanceToLevel(odin, level);
			return odin;
		}	

		public PartyMember createNoahLevel1() {
			PartyMember noah = new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, "Noah", null);
			noah.equipItem(itemLib.get(OriginalItem.Weapon_Wood_Cane.ordinal()));
			noah.equipItem(itemLib.get(OriginalItem.Armor_White_Cloak.ordinal()));
			return noah;
		}
		
		public PartyMember createNoahLevelOptimal(int level) {
			PartyMember noah = createNoahLevel1();
			noah.equipItem(itemLib.get(OriginalItem.Weapon_Psycho_Wand.ordinal()));
			noah.equipItem(itemLib.get(OriginalItem.Armor_Frad_Cloak.ordinal()));
			noah.equipItem(itemLib.get(OriginalItem.Shield_Laser_Barrier.ordinal()));
			advanceToLevel(noah, level);
			return noah;
		}	
		
		public static PartyMember advanceToLevel(PartyMember member, int level) {
			for(int i=1; i<level; i++) {
				if(member.getLevel() < level) {
					member.advanceLevel();
				}
			}
			member.heal();
			System.out.println(member);
			return member;
		}		
		
		@Test
		public void testAlis1Sworm() {
			battlers.add(createAlisLevel1());
			battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.SWORM))); 
			boolean result = bat.startBattle(battlers) == BattleOutcome.WIN;
			
			assertTrue(result); // Win 100%
		}
		
		@Test
		public void testAlis1Scorpion() { // ~around 80% win
			int win = 0;
			for(int i=0; i<RUN_MAX; i++) {
				battlers.clear();
				battlers.add(createAlisLevel1());
				battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.SCORPION)));
				if(bat.startBattle(battlers) == BattleOutcome.WIN) {
					win++;
				}
			}
			System.out.println(win + "/" + RUN_MAX);
			assertTrue(win > (RUN_MAX / 25)); // Win at least 4%
		}
		
		@Test
		public void testAlis2Scorpion() {
			PartyMember alis = createAlisLevel1();
			advanceToLevel(alis, 2);
			
			battlers.add(alis);
			battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.SCORPION)));
			boolean result = bat.startBattle(battlers) == BattleOutcome.WIN;
			
			assertTrue(result); // Win 100%
		}
		
		@Test
		public void testAlis30Darkfalz() {
			PartyMember alis = createAlisLevel1();
			advanceToLevel(alis, 30);
			battlers.add(alis);
			battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.DARKFALZ)));
			boolean result = bat.startBattle(battlers) == BattleOutcome.WIN;
			
			assertTrue(!result); // Lost 100%
		}	
		
		@Test
		public void testOdin30Darkfalz2() {
			battlers.add(createOdinLevelOptimal(30));
			battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.DARKFALZ)));
			battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.DARKFALZ)));
			boolean result = bat.startBattle(battlers) == BattleOutcome.WIN;
			
			assertTrue(!result); // Lost 100%
		}	
		
		@Test
		public void testFullPartyOptimalDarkfalz2() {
			int win = 0;
			for(int i=0; i<RUN_MAX; i++) {
				battlers.clear();
				battlers.add(createAlisLevelOptimal(30));
				battlers.add(createMyauLevelOptimal(30));
				battlers.add(createOdinLevelOptimal(30));
				battlers.add(createNoahLevelOptimal(30));
				battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.DARKFALZ)));
				battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.DARKFALZ)));
				if(bat.startBattle(battlers) == BattleOutcome.WIN) {
					win++;
				}
			}
			System.out.println(win + "/" + RUN_MAX);
			assertTrue(!(RUN_MAX - win < (RUN_MAX / 2))); // Lost at least half
		}
		
		@Test
		public void testFullPartyOptimalLassic() {
			int win = 0;
			for(int i=0; i<RUN_MAX; i++) {
				battlers.clear();
				battlers.add(createAlisLevelOptimal(30));
				battlers.add(createMyauLevelOptimal(30));
				battlers.add(createOdinLevelOptimal(30));
				battlers.add(createNoahLevelOptimal(30));
				battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.LASSIC)));
				if(bat.startBattle(battlers) == BattleOutcome.WIN) {
					win++;
				}
			}
		System.out.println(win + "/" + RUN_MAX);
		assertTrue(!(RUN_MAX - win < (RUN_MAX / 2))); // Lost at least half
		}	
		
		@Test
		public void testFullPartySubOptimalDarkfalz2() {
			int win = 0;
			for(int i=0; i<RUN_MAX; i++) {
				battlers.clear();
				battlers.add(createAlisLevelSubOptimal(25));
				battlers.add(createMyauLevelOptimal(25));
				battlers.add(createOdinLevelSubOptimal(25));
				battlers.add(createNoahLevelOptimal(25));
				battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.DARKFALZ)));
				battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.DARKFALZ)));
				if(bat.startBattle(battlers) == BattleOutcome.WIN) {
					win++;
				}
			}
			System.out.println(win + "/" + RUN_MAX);
			assertTrue(win == 0); // Lost all
		}
		
		@Test
		public void testFullPartySubOptimalLassic() {
			int win = 0;
			for(int i=0; i<RUN_MAX; i++) {
				battlers.clear();
				battlers.add(createAlisLevelSubOptimal(25));
				battlers.add(createMyauLevelOptimal(25));
				battlers.add(createOdinLevelSubOptimal(25));
				battlers.add(createNoahLevelOptimal(25));
				battlers.add(new EnemyBattler(enemyLib.get(PS1Enemy.LASSIC)));
				if(bat.startBattle(battlers) == BattleOutcome.WIN) {
					win++;
				}
			}
		System.out.println(win + "/" + RUN_MAX);
		assertTrue(win == 0); // Lost all
		}	
		
		@Test
		public void testAllEnemies() {
			
			StringBuffer results = new StringBuffer(1000);
			for(PS1Enemy enemy: PS1Enemy.values()) {
				battlers.clear();
				battlers.add(createAlisLevelSubOptimal(20));
				battlers.add(new EnemyBattler(enemyLib.get(enemy)));

				if(bat.startBattle(battlers) == BattleOutcome.WIN) {
					//results.append("RBP:Won versus " + enemy.name() + "\n");
				} else {
					results.append("RBP:Lost versus " + enemy.name() + "\n");
				}			
			}
			System.err.println(results);
		}
		
		
		
		
		
	}

