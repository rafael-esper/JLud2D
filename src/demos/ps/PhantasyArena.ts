/**
 * PhantasyArena - Phantasy Star Arena game mode
 * Direct port of PhantasyArena.java - a fixed gauntlet of battles where
 * companions join after the first fights and every victory grants a reward
 * (exp, weapon, armor, shield, cure or revive), ending with a score screen.
 */

import { PSGame } from './PSGame';
import { PSMenu, PSSceneType } from './PSMenu';
import { PSBattle, BattleMode, BattleOutcome } from './battle/PSBattle';
import { Enemy } from './battle/Enemy';
import { PSLibEnemy, PS1Enemy } from './game/PSLibEnemy';
import { OriginalItem } from './game/PSLibItem';
import { PS1Sound } from './game/PSLibSound';
import { PS1Music } from './game/PSLibMusic';
import { PartyMember, Gender } from './game/PartyMember';
import { Specie } from './game/Specie';
import { Job } from './game/Job';

// Party member indices, in join order (Java ALIS..HAPSBY constants)
const ALIS = 0;
const MYAU = 1;
const ODIN = 2;
const NOAH = 3;
const HAPSBY = 4;

interface ArenaBattle {
  scene: PSSceneType;
  enemy?: PS1Enemy;
  quantity?: number;
  group?: PS1Enemy[];
  skipReward?: boolean; // Java case 172 ends with 'continue'
}

interface ArenaState {
  weaponIndex: number;
  shieldIndex: number;
  armorIndex: number;
  numRevives: number;
  expLevel: number;
}

export class PhantasyArena {
  private static readonly END = 180;

  // Battle schedule — indices exactly as in the Java switch; missing
  // indices fall through to 'default: continue' (no battle, no reward)
  private static readonly battles = new Map<number, ArenaBattle>([
    [0, { scene: PSSceneType.FOREST, enemy: PS1Enemy.SWORM, quantity: 1 }],
    [1, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.SWORM, quantity: 3 }],
    [2, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.MANEATER, quantity: 2 }],
    [3, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.SCORPION, quantity: 2 }],
    [4, { scene: PSSceneType.FOREST, enemy: PS1Enemy.WING_EYE, quantity: 5 }],
    [9, { scene: PSSceneType.FIELDS, group: [PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.SWORM] }],
    [10, { scene: PSSceneType.CAVE, enemy: PS1Enemy.GR_SLIME, quantity: 3 }],
    [11, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.SCORPION, quantity: 4 }],
    [12, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.MANEATER, quantity: 5 }],
    [13, { scene: PSSceneType.FOREST, group: [PS1Enemy.SWORM, PS1Enemy.OWL_BEAR, PS1Enemy.OWL_BEAR, PS1Enemy.SWORM] }],
    [14, { scene: PSSceneType.DESERT, enemy: PS1Enemy.G_SCORPI, quantity: 4 }],
    [16, { scene: PSSceneType.ARTIC, enemy: PS1Enemy.SCORPIUS, quantity: 2 }],
    [18, { scene: PSSceneType.FOREST, enemy: PS1Enemy.OWL_BEAR, quantity: 4 }],
    [20, { scene: PSSceneType.CAVE, group: [PS1Enemy.WING_EYE, PS1Enemy.GOLDLENS, PS1Enemy.WING_EYE] }],
    [23, { scene: PSSceneType.FOREST, enemy: PS1Enemy.DEADTREE, quantity: 3 }],
    [24, { scene: PSSceneType.LAVA, enemy: PS1Enemy.GIANTFLY, quantity: 2 }],
    [25, { scene: PSSceneType.CAVE, enemy: PS1Enemy.GOLDLENS, quantity: 3 }],
    [26, { scene: PSSceneType.CAVE, enemy: PS1Enemy.RD_SLIME, quantity: 3 }],
    [27, { scene: PSSceneType.FOREST, enemy: PS1Enemy.EVILDEAD, quantity: 3 }],
    [28, { scene: PSSceneType.ARTIC, enemy: PS1Enemy.SCORPIUS, quantity: 4 }],
    [29, { scene: PSSceneType.LAVA, enemy: PS1Enemy.GIANTFLY, quantity: 4 }],
    [30, { scene: PSSceneType.DESERT, enemy: PS1Enemy.N_FARMER, quantity: 5 }],
    [31, { scene: PSSceneType.DESERT, enemy: PS1Enemy.ANT_LION, quantity: 1 }],
    [32, { scene: PSSceneType.DESERT, enemy: PS1Enemy.CRAWLER, quantity: 3 }],
    [33, { scene: PSSceneType.DESERT, enemy: PS1Enemy.E_FARMER, quantity: 5 }],
    [34, { scene: PSSceneType.CAVE, enemy: PS1Enemy.BL_SLIME, quantity: 3 }],
    [118, { scene: PSSceneType.BEACH, enemy: PS1Enemy.FISHMAN, quantity: 5 }],
    [119, { scene: PSSceneType.BEACH, enemy: PS1Enemy.BIG_CLUB, quantity: 2 }],
    [120, { scene: PSSceneType.FOREST, enemy: PS1Enemy.TARANTUL, quantity: 2 }],
    [121, { scene: PSSceneType.FOREST, enemy: PS1Enemy.WEREBAT, quantity: 4 }],
    [122, { scene: PSSceneType.CAVE, enemy: PS1Enemy.WIGHT, quantity: 3 }],
    [123, { scene: PSSceneType.FOREST, enemy: PS1Enemy.SKELETON, quantity: 5 }],
    [124, { scene: PSSceneType.DESERT, enemy: PS1Enemy.BARBRIAN, quantity: 8 }],
    [125, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.SKULL_EN, quantity: 3 }],
    [126, { scene: PSSceneType.LAVA, enemy: PS1Enemy.MARMAN, quantity: 6 }],
    [127, { scene: PSSceneType.DESERT, enemy: PS1Enemy.LICH, quantity: 4 }],
    [128, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.MANTICORE, quantity: 3 }],
    [129, { scene: PSSceneType.ARTIC, enemy: PS1Enemy.EXECUTER, quantity: 3 }],
    [130, { scene: PSSceneType.SEA, enemy: PS1Enemy.SHELFISH, quantity: 4 }],
    [132, { scene: PSSceneType.PINES, enemy: PS1Enemy.VAMPIRE, quantity: 3 }],
    [133, { scene: PSSceneType.CAVE, enemy: PS1Enemy.GHOUL, quantity: 3 }],
    [134, { scene: PSSceneType.DESERT, enemy: PS1Enemy.LEECH, quantity: 4 }],
    [135, { scene: PSSceneType.ARTIC, enemy: PS1Enemy.DEZORIAN, quantity: 5 }],
    [136, { scene: PSSceneType.DESERT, enemy: PS1Enemy.SPHINX, quantity: 4 }],
    [137, { scene: PSSceneType.PINES, enemy: PS1Enemy.STALKER, quantity: 4 }],
    [138, { scene: PSSceneType.FOREST, enemy: PS1Enemy.SERPENT, quantity: 2 }],
    [139, { scene: PSSceneType.DESERT, enemy: PS1Enemy.SANDWORM, quantity: 3 }],
    [140, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.ELEPHANT, quantity: 5 }],
    [141, { scene: PSSceneType.ARTIC, group: [PS1Enemy.EVILHEAD, PS1Enemy.DEZORIAN, PS1Enemy.EVILHEAD, PS1Enemy.DEZORIAN, PS1Enemy.EVILHEAD] }],
    [142, { scene: PSSceneType.CAVE, enemy: PS1Enemy.ZOMBIE, quantity: 3 }],
    [143, { scene: PSSceneType.ARTIC, enemy: PS1Enemy.AMMONITE, quantity: 3 }],
    [144, { scene: PSSceneType.SEA, enemy: PS1Enemy.OCTOPUS, quantity: 2 }],
    [145, { scene: PSSceneType.SEA, enemy: PS1Enemy.NESSIE, quantity: 2 }],
    [146, { scene: PSSceneType.PINES, enemy: PS1Enemy.BATALION, quantity: 4 }],
    [147, { scene: PSSceneType.CAVE, enemy: PS1Enemy.ROBOTCOP, quantity: 1 }],
    [149, { scene: PSSceneType.SEA, group: [PS1Enemy.SWORM, PS1Enemy.WYVERN, PS1Enemy.WYVERN, PS1Enemy.SWORM] }],
    [150, { scene: PSSceneType.LAVA, group: [PS1Enemy.GIANTFLY, PS1Enemy.TENTACLE, PS1Enemy.GIANTFLY] }],
    [151, { scene: PSSceneType.CAVE, enemy: PS1Enemy.ANDROCOP, quantity: 2 }],
    [152, { scene: PSSceneType.FIELDS, enemy: PS1Enemy.GIANT, quantity: 2 }],
    [153, { scene: PSSceneType.DESERT, group: [PS1Enemy.SORCERER, PS1Enemy.TARZIMAL, PS1Enemy.SORCERER] }],
    [154, { scene: PSSceneType.FOREST, enemy: PS1Enemy.HORSEMAN, quantity: 2 }],
    [155, { scene: PSSceneType.DESERT, enemy: PS1Enemy.AMUNDSEN, quantity: 2 }],
    [156, { scene: PSSceneType.PINES, group: [PS1Enemy.SKELETON, PS1Enemy.MARAUDER, PS1Enemy.SKELETON] }],
    [157, { scene: PSSceneType.ARTIC, group: [PS1Enemy.SKULL_EN, PS1Enemy.MAGICIAN, PS1Enemy.SKULL_EN] }],
    [158, { scene: PSSceneType.ARTIC, enemy: PS1Enemy.FROSTMAN, quantity: 2 }],
    [159, { scene: PSSceneType.DESERT, enemy: PS1Enemy.GOLEM, quantity: 2 }],
    [160, { scene: PSSceneType.CAVE, enemy: PS1Enemy.GR_DRAGN, quantity: 1 }],
    [161, { scene: PSSceneType.FIELDS, group: [PS1Enemy.HORSEMAN, PS1Enemy.CENTAUR, PS1Enemy.HORSEMAN] }],
    [162, { scene: PSSceneType.FOREST, enemy: PS1Enemy.RD_DRAGN, quantity: 2 }],
    [163, { scene: PSSceneType.CAVE, enemy: PS1Enemy.DR_MAD, quantity: 1 }],
    [164, { scene: PSSceneType.ARTIC, enemy: PS1Enemy.MAMMOTH, quantity: 5 }],
    [165, { scene: PSSceneType.GAS, group: [PS1Enemy.REAPER, PS1Enemy.MARAUDER] }],
    [166, { scene: PSSceneType.CAVE, enemy: PS1Enemy.SHADOW, quantity: 1 }],
    [167, { scene: PSSceneType.DESERT, enemy: PS1Enemy.BL_DRAGN, quantity: 2 }],
    [168, { scene: PSSceneType.PINES, enemy: PS1Enemy.TITAN, quantity: 2 }],
    [169, { scene: PSSceneType.PINES, enemy: PS1Enemy.WT_DRAGN, quantity: 2 }],
    [170, { scene: PSSceneType.CAVE, enemy: PS1Enemy.MEDUSA, quantity: 1 }],
    [171, { scene: PSSceneType.SKY, enemy: PS1Enemy.GD_DRAGN, quantity: 1 }],
    [172, { scene: PSSceneType.BLACK, enemy: PS1Enemy.SACCUBUS, quantity: 3, skipReward: true }]
  ]);

  // Exp reward tiers (Java expLevels)
  private static readonly expLevels: number[] = [
    20, 35, 50, 65, 85, 105, 125, 150, 175, 205,
    235, 265, 295, 335, 375, 415, 455, 505, 555, 605,
    655, 715, 775, 835, 895, 970, 1045, 1120, 1195, 1270,
    1345, 1445, 1545, 1645, 1745, 1845, 1945, 2070, 2195, 2320,
    2445, 2570, 2720, 2870, 3020, 3170, 3370, 3600
  ];

  // Weapon reward progression (Java getBattleWeapon switch)
  private static readonly weaponRewards: [OriginalItem, number][] = [
    [OriginalItem.Weapon_Iron_Sword, ALIS],
    [OriginalItem.Weapon_Titanium_Sword, ODIN],
    [OriginalItem.Weapon_Psycho_Wand, NOAH],
    [OriginalItem.Weapon_Needle_Gun, HAPSBY],
    [OriginalItem.Weapon_Titanium_Sword, ALIS],
    [OriginalItem.Weapon_Saber_Claw, MYAU],
    [OriginalItem.Weapon_Ceramic_Sword, ODIN],
    [OriginalItem.Weapon_Ceramic_Sword, ALIS],
    [OriginalItem.Weapon_Heat_Gun, HAPSBY],
    [OriginalItem.Weapon_Light_Saber, ODIN],
    [OriginalItem.Weapon_Light_Saber, ALIS],
    [OriginalItem.Weapon_Silver_Tusk, MYAU],
    [OriginalItem.Weapon_Laser_Gun, HAPSBY],
    [OriginalItem.Weapon_Laconian_Sword, ALIS],
    [OriginalItem.Weapon_Laconian_Axe, ODIN]
  ];

  // Armor reward progression (Java getBattleArmor switch)
  private static readonly armorRewards: [OriginalItem, number][] = [
    [OriginalItem.Armor_Light_Suit, ALIS],
    [OriginalItem.Armor_Spiky_Fur, MYAU],
    [OriginalItem.Armor_Titanium_Mail, ODIN],
    [OriginalItem.Armor_Iron_Armor, HAPSBY],
    [OriginalItem.Armor_Titanium_Mail, ALIS],
    [OriginalItem.Armor_Zirconian_Mail, ODIN],
    [OriginalItem.Armor_Zirconian_Mail, ALIS],
    [OriginalItem.Armor_Frad_Cloak, NOAH],
    [OriginalItem.Armor_Saber_Fur, MYAU],
    [OriginalItem.Armor_Diamond_Mail, ODIN],
    [OriginalItem.Armor_Diamond_Mail, ALIS],
    [OriginalItem.Armor_Laconian_Armor, ODIN]
  ];

  // Shield reward progression (Java getBattleShield switch)
  private static readonly shieldRewards: [OriginalItem, number][] = [
    [OriginalItem.Shield_Leather_Shield, ALIS],
    [OriginalItem.Shield_Iron_Shield, ODIN],
    [OriginalItem.Shield_Bronze_Shield, ODIN],
    [OriginalItem.Shield_Ceramic_Shield, ALIS],
    [OriginalItem.Shield_Ceramic_Shield, ODIN],
    [OriginalItem.Shield_Laser_Barrier, HAPSBY],
    [OriginalItem.Shield_Laser_Barrier, NOAH],
    [OriginalItem.Shield_Laser_Barrier, ODIN],
    [OriginalItem.Shield_Laser_Barrier, ALIS],
    [OriginalItem.Shield_Animal_Glove, MYAU],
    [OriginalItem.Shield_Mirror_Shield, ODIN],
    [OriginalItem.Shield_Laconian_Shield, ALIS]
  ];

  public static async PhantasyArenaGame(): Promise<void> {
    const battle = new PSBattle(BattleMode.AUTO_ACTION);

    const s: ArenaState = {
      weaponIndex: 0,
      shieldIndex: 0,
      armorIndex: 0,
      numRevives: 0,
      expLevel: 0
    };

    // Java: TODO Remove this and add some support for items
    PSGame.getParty().getMember(ALIS)?.addItem(PSGame.getItem(OriginalItem.Inventory_Escape_Cloth));
    PSGame.getParty().getMember(ALIS)?.addItem(PSGame.getItem(OriginalItem.Inventory_Dimate));

    for (let i = 0; i <= PhantasyArena.END; i++) {
      if (i === PhantasyArena.END) {
        await PhantasyArena.showScore(s);
        continue;
      }

      const scheduled = PhantasyArena.battles.get(i);
      if (!scheduled) {
        continue; // Java 'default: continue'
      }

      let outcome: BattleOutcome;
      if (scheduled.group) {
        outcome = await battle.battleSceneWithEnemies(scheduled.scene, scheduled.group.map(PhantasyArena.getEnemy));
      } else {
        outcome = await battle.battleScene(scheduled.scene, PhantasyArena.getEnemy(scheduled.enemy!), scheduled.quantity!);
      }

      // The arena has no overworld location, so the battle's post-fight
      // findAndPlayMusic() falls back to the title theme. Play the story
      // theme instead during the pauses between arena battles (companion
      // dialogs, reward menu); the next battle restarts the battle theme.
      await PSGame.playMusic(PS1Music.STORY);

      if (scheduled.skipReward) {
        continue; // Java case 172 skips the outcome check and reward
      }

      if (outcome === BattleOutcome.DEFEAT) {
        console.log("PhantasyArena: Battle lost!");
        break;
      }

      // Companions join after the first battles
      if (i === 0) {
        await PSMenu.Stext(PSGame.getString("PS_Battle_Myau"));
        PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), "chars/myau.chr"));
      }
      if (i === 1) {
        await PSMenu.Stext(PSGame.getString("PS_Battle_Odin"));
        PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, PSGame.getString("Name_Odin"), "chars/odin.chr"));
      }
      if (i === 2) {
        await PSMenu.Stext(PSGame.getString("PS_Battle_Noah"));
        PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, PSGame.getString("Name_Noah"), "chars/noah.chr"));
      }
      if (i === 3) {
        await PSMenu.Stext(PSGame.getString("PS_Battle_Hapsby"));
        PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.ANDROID, Job.ROBOT, PSGame.getString("Item_Quest_Hapsby"), "chars/alis.chr"));
      }

      await PhantasyArena.rewardMenu(s);
    }
  }

  /**
   * Post-battle reward menu (inner while(!chosen) loop of the Java code).
   * TS improvement over the Java original: a party panel (name, level,
   * HP/MP and equipment) stays on screen while choosing, and is refreshed
   * after every action so cures/revives/equips show immediately.
   */
  private static async rewardMenu(s: ArenaState): Promise<void> {
    const panel = PSMenu.instance.createLabelBox(2, 4, PhantasyArena.partyPanelRows(), true);
    PSMenu.instance.push(panel);

    let chosen = false;
    while (!chosen) {
      const opt = await PhantasyArena.rewardPrompt([
        s.expLevel >= PhantasyArena.expLevels.length
          ? PSGame.getString("PS_Battle_LevelUp")
          : PhantasyArena.expLevels[s.expLevel] + " " + PSGame.getString("PS_Battle_ExpPoints"),
        PSGame.getString("PS_Battle_Weapon"),
        PSGame.getString("PS_Battle_Armor"),
        PSGame.getString("PS_Battle_Shield"),
        PSGame.getString("PS_Battle_Cure"),
        PSGame.getString("PS_Battle_Revive")
      ]);

      if (opt === 1) {
        if (s.expLevel >= PhantasyArena.expLevels.length) {
          await PhantasyArena.getLevelup();
        } else {
          await PhantasyArena.getExp(s.expLevel);
          s.expLevel++;
        }
        chosen = true;
      } else if (opt === 2) {
        if (await PhantasyArena.getBattleEquipment(PhantasyArena.weaponRewards, s.weaponIndex, "PS_Battle_Weapons_Left")) {
          s.weaponIndex++;
          chosen = true;
        }
      } else if (opt === 3) {
        if (await PhantasyArena.getBattleEquipment(PhantasyArena.armorRewards, s.armorIndex, "PS_Battle_Armors_Left")) {
          s.armorIndex++;
          chosen = true;
        }
      } else if (opt === 4) {
        if (await PhantasyArena.getBattleEquipment(PhantasyArena.shieldRewards, s.shieldIndex, "PS_Battle_Shield_Left")) {
          s.shieldIndex++;
          chosen = true;
        }
      } else if (opt === 5) {
        PSGame.playSound(PS1Sound.CURE);
        PSGame.getParty().healAll(false);
        await PSMenu.StextLast(PSGame.getString("PS_Battle_Cure_OK"));
        chosen = true;
      } else if (opt === 6) {
        s.numRevives++;
        for (const p of PSGame.getParty().getMembers()) {
          if (p.getHp() <= 0) {
            p.setHp(p.getMaxHp());
          }
        }
        PSGame.playSound(PS1Sound.REVIVE);
        await PSMenu.StextLast(PSGame.getString("PS_Battle_Revive_OK"));
        chosen = true;
      }

      // Refresh the panel — stats or equipment may have changed
      panel.updateColorAll(0xFFFFFF);
      panel.updateTextArray(PhantasyArena.partyPanelRows());
    }

    PSMenu.instance.pop(); // party panel
  }

  /**
   * Two rows per member: stats, then equipped weapon/armor/shield.
   * Dead members are shown in red, like the in-game status menu.
   */
  private static partyPanelRows(): string[] {
    const rows: string[] = [];
    for (const p of PSGame.getParty().getMembers()) {
      const prefix = p.getHp() <= 0 ? '<RED>' : '';

      rows.push(
        prefix +
        p.getName().padEnd(7).slice(0, 7) +
        'LV' + String(p.getLevel()).padStart(2) +
        '  HP' + String(p.getHp()).padStart(3) + '/' + String(p.getMaxHp()).padStart(3) +
        '  MP' + String(p.getMp()).padStart(3) + '/' + String(p.getMaxMp()).padStart(3)
      );

      // equipment[0..2] = weapon / chest / cover (see PartyMember.equipItem)
      const equip = [0, 1, 2]
        .map((slot) => p.equipment[slot]?.getName() ?? '-')
        .join(',');
      rows.push(prefix + ' ' + (equip.length > 41 ? equip.slice(0, 41) : equip));
    }
    return rows;
  }

  /**
   * Reward prompt laid out below the party panel. PSMenu.Prompt would put a
   * 6-choice list at the top-left, covering the panel — so the arena builds
   * the same prompt itself, with the question in a small box at its side.
   */
  private static async rewardPrompt(choices: string[]): Promise<number> {
    const question = PSMenu.instance.createLabelBox(
      200, 132, PhantasyArena.wrapText(PSGame.getString("PS_Battle_Reward"), 14), true);
    PSMenu.instance.push(question);

    const promptBox = PSMenu.instance.createPromptBox(10, 132, choices, true);
    PSMenu.instance.push(promptBox);

    const ret = await PSMenu.instance.waitOpt('TRUE' as any);

    PSMenu.instance.pop(); // prompt box
    PSMenu.instance.pop(); // question box
    return ret + 1; // options counted from 1, like PSMenu.Prompt
  }

  /** Simple word wrap (PSMenu.splitTextIntoRows is private) */
  private static wrapText(text: string, maxLength: number): string[] {
    const rows: string[] = [];
    let row = '';
    for (const word of text.split(' ')) {
      const candidate = row ? row + ' ' + word : word;
      if (candidate.length <= maxLength) {
        row = candidate;
      } else {
        if (row) rows.push(row);
        row = word;
      }
    }
    if (row) rows.push(row);
    return rows;
  }

  /**
   * Final score screen (Java case END). Labels are the Java hardcoded ones.
   */
  private static async showScore(s: ArenaState): Promise<void> {
    const scoreResult: string[] = [];
    let score = 0;
    for (const p of PSGame.getParty().getMembers()) {
      score += p.getXp();
    }
    scoreResult.push("Total EXP earned (x1): " + score);

    score += PSGame.getParty().mst;
    scoreResult.push("Total MST earned (x1): " + PSGame.getParty().mst);

    score += s.weaponIndex * 500;
    score += s.shieldIndex * 500;
    score += s.armorIndex * 500;

    scoreResult.push("");

    scoreResult.push("Weapons Earned (x500): " + s.weaponIndex * 500);
    if (s.weaponIndex >= 14) {
      score += 50000;
      scoreResult.push("All Weapons Bonus: " + 50000);
    }
    scoreResult.push("Shields Earned (x500): " + s.shieldIndex * 500);
    if (s.shieldIndex >= 12) {
      score += 50000;
      scoreResult.push("All Shields Bonus: " + 50000);
    }
    scoreResult.push("Armors  Earned (x500): " + s.armorIndex * 500);
    if (s.armorIndex >= 12) {
      score += 50000;
      scoreResult.push("All Armors Bonus: " + 50000);
    }

    scoreResult.push("");
    scoreResult.push("Revive (x5000): -" + s.numRevives * 5000);
    score -= s.numRevives * 5000;

    scoreResult.push("");
    scoreResult.push("TOTAL SCORE: " + score);

    PSMenu.instance.push(PSMenu.instance.createLabelBox(5, 5, scoreResult, true));
    await PSMenu.Stext(PSGame.getString("PS_Battle_End"));
    PSMenu.instance.pop();
  }

  private static async getExp(expLevel: number): Promise<void> {
    for (const p of PSGame.getParty().getMembers()) {
      await p.giveExp(PhantasyArena.expLevels[expLevel]);
    }
  }

  private static async getLevelup(): Promise<void> {
    PSGame.playSound(PS1Sound.LEVEL_UP);
    await PSMenu.StextNext(PSGame.getString("PS_Battle_LevelUp_Ok"));

    for (const p of PSGame.getParty().getMembers()) {
      if (p.advanceLevel()) {
        await PSMenu.StextNext(PSGame.getString("Battle_Learn_Spell", "<player>", p.getName()));
      }
    }
  }

  /**
   * Shared body of the Java getBattleWeapon/getBattleArmor/getBattleShield:
   * equip the next reward on its designated character, or report none left.
   */
  private static async getBattleEquipment(rewards: [OriginalItem, number][], index: number, noneLeftKey: string): Promise<boolean> {
    if (index < rewards.length) {
      const [originalItem, toChar] = rewards[index];
      const item = PSGame.getItem(originalItem);
      const member = PSGame.getParty().getMember(toChar);
      if (!member) {
        console.error(`PhantasyArena: no party member at index ${toChar} for reward`);
        return false;
      }
      member.equipItem(item);
      PSGame.playSound(PS1Sound.ITEM);
      await PSMenu.StextLast(PSGame.getString("Item_Equip", "<item>", item.getName(), "<player>", member.getName()));
      return true;
    } else {
      await PSMenu.StextNext(PSGame.getString(noneLeftKey));
      return false;
    }
  }

  private static getEnemy(e: PS1Enemy): Enemy {
    const enemy = PSLibEnemy.getEnemyByEnum(e);
    if (!enemy) {
      throw new Error(`PhantasyArena: enemy ${PS1Enemy[e]} not found in library`);
    }
    return enemy;
  }

}
