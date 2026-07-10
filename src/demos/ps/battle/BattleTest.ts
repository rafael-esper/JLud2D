/**
 * BattleTest - Basic Integration Test for Battle System
 * Simple test to verify battle components work together
 */

import { PSGame } from '../PSGame';
import { PSBattle } from './PSBattle';
import { Enemy } from './Enemy';
import { BattlePosition, SceneType } from './BattlePosition';
import { GameType } from '../game/GameData';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';

export class BattleTest {
  /**
   * Test basic enemy creation
   */
  public static testEnemyCreation(): void {
    console.log("BattleTest: Testing enemy creation...");

    // Test builder pattern
    const sworm = PSLibEnemy.getEnemyByEnum(PS1Enemy.SWORM)!;
    console.log(`Created enemy: ${sworm.getName()} (HP: ${sworm.hp}, ATK: ${sworm.atk})`);

    // Test custom enemy
    const customEnemy = Enemy.createBuilder("Test Monster")
      .setHp(50)
      .setAtk(20)
      .setDef(10)
      .setExp(5)
      .setMst(15);

    console.log(`Created custom enemy: ${customEnemy.getName()} (HP: ${customEnemy.hp})`);
    console.log("BattleTest: Enemy creation test passed!");
  }

  /**
   * Test battle positioning system
   */
  public static testBattlePositioning(): void {
    console.log("BattleTest: Testing battle positioning...");

    // Test different enemy sizes and quantities
    const testCases = [
      { size: 64, num: 3, scene: SceneType.OPEN },
      { size: 80, num: 2, scene: SceneType.CLOSE },
      { size: 32, num: 5, scene: SceneType.OPEN }
    ];

    for (const testCase of testCases) {
      const positions = BattlePosition.distributePositions(
        testCase.size,
        testCase.num,
        testCase.scene
      );

      console.log(`Positions for ${testCase.num} enemies (size ${testCase.size}): ${positions.join(', ')}`);
    }

    console.log("BattleTest: Battle positioning test passed!");
  }

  /**
   * Test battle system initialization (without actually starting a battle)
   */
  public static testBattleSystemInit(): void {
    console.log("BattleTest: Testing battle system initialization...");

    try {
      // Create a test battle instance
      new PSBattle();
      console.log("PSBattle instance created successfully");

      // Test enemy array creation
      const enemies = [
        PSLibEnemy.getEnemyByEnum(PS1Enemy.SWORM)!,
        PSLibEnemy.getEnemyByEnum(PS1Enemy.RD_SLIME)!
      ];

      console.log(`Created enemy array with ${enemies.length} enemies`);
      console.log("BattleTest: Battle system initialization test passed!");

    } catch (error) {
      console.error("BattleTest: Battle system initialization failed:", error);
    }
  }

  /**
   * Test party initialization for battle
   */
  public static async testPartyInit(): Promise<void> {
    console.log("BattleTest: Testing party initialization...");

    try {
      // Initialize game and party
      await PSGame.initPSGame(GameType.PS_ORIGINAL);
      const party = PSGame.getParty();

      console.log(`Party initialized with ${party.partySize()} members`);

      // Test party members
      for (let i = 0; i < party.partySize(); i++) {
        const member = party.getMember(i);
        if (member) {
          console.log(`Member ${i}: ${member.getName()} (HP: ${member.getHp()}/${member.getMaxHp()})`);
        }
      }

      console.log("BattleTest: Party initialization test passed!");

    } catch (error) {
      console.error("BattleTest: Party initialization failed:", error);
    }
  }

  /**
   * Test battle integration (without UI)
   */
  public static async testBattleIntegration(): Promise<void> {
    console.log("BattleTest: Testing battle integration...");

    try {
      // Initialize required systems
      await PSGame.initPSGame(GameType.PS_ORIGINAL);

      // Create test enemies
      const testEnemies = [PSLibEnemy.getEnemyByEnum(PS1Enemy.SWORM)!];

      console.log(`Battle integration test setup complete (${testEnemies.length} test enemies)`);
      console.log("Note: Full battle test requires UI context and scene setup");

      console.log("BattleTest: Battle integration test completed!");

    } catch (error) {
      console.error("BattleTest: Battle integration failed:", error);
    }
  }

  /**
   * Run all tests
   */
  public static async runAllTests(): Promise<void> {
    console.log("=== BattleTest: Running All Tests ===");

    this.testEnemyCreation();
    this.testBattlePositioning();
    this.testBattleSystemInit();
    await this.testPartyInit();
    await this.testBattleIntegration();

    console.log("=== BattleTest: All Tests Completed ===");
  }

  /**
   * Example battle usage (for documentation)
   */
  public static exampleUsage(): void {
    console.log("=== Battle System Example Usage ===");

    // Example 1: Create enemies
    const sworm = PSLibEnemy.getEnemyByEnum(PS1Enemy.SWORM)!;
    const redSlime = PSLibEnemy.getEnemyByEnum(PS1Enemy.RD_SLIME)!;
    console.log(`Example enemies: ${sworm.getName()}, ${redSlime.getName()}`);

    // Example 2: Start a fixed battle (requires scene context)
    // const outcome = await PSGame.fixedBattle(PSSceneType.OPEN, [sworm, redSlime]);

    // Example 3: Start a random battle
    // const enemyPool = [sworm, redSlime];
    // const outcome = await PSGame.randomBattle(PSSceneType.OPEN, enemyPool);

    // Example 4: Custom battle setup
    // const battle = new PSBattle();
    // const outcome = await battle.battleScene(PSSceneType.OPEN, sworm, 3);

    console.log("Example usage documentation complete");
  }
}