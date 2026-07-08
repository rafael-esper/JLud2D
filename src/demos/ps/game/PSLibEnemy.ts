/**
 * PSLibEnemy - Phantasy Star Enemy Library
 * Defines all enemies with complete stats and properties
 */

import { Enemy, EnemyType, CanChat, CanProt, CanRope, CanTalk, FireRes, HasItem, HasWing, Mental, Special } from '../battle/Enemy';
import { PS1Sound } from './PSLibSound';

// Generic enemy interface
export interface GenericEnemy {
  // Marker interface for all enemy types
}

// PS1 Enemy enum
// http://www.pscave.com/ps1/monsterlist.txt
export enum PS1Enemy {
  AMMONITE,    AMUNDSEN,    ANDROCOP,    ANT_LION,
  BARBRIAN,    BATALION,    BIG_CLUB,    BL_DRAGN,
  BL_SLIME,    CENTAUR,     CRAWLER,     DARKFALZ,
  DEADTREE,    DEZORIAN,    DR_MAD,      E_FARMER,
  ELEPHANT,    EVILDEAD,    EVILHEAD,    EXECUTER,
  FISHMAN,     FROSTMAN,    G_SCORPI,    GD_DRAGN,
  GHOUL,       GIANT,       GIANTFLY,    GOLDLENS,
  GOLEM,       GR_DRAGN,    GR_SLIME,    HORSEMAN,
  LASSIC,      LEECH,       LICH,        MAGICIAN,
  MAMMOTH,     MANEATER,    MANTICORE,   MARAUDER,
  MARMAN,      MEDUSA,      N_FARMER,    NESSIE,
  OCTOPUS,     OWL_BEAR,    RD_DRAGN,    RD_SLIME,
  REAPER,      ROBOTCOP,    SACCUBUS,    SANDWORM,
  SCORPION,    SCORPIUS,    SERPENT,     SHADOW,
  SHELFISH,    SKELETON,    SKULL_EN,    SORCERER,
  SPHINX,      STALKER,     SWORM,       TARANTUL,
  TARZIMAL,    TENTACLE,    TITAN,       VAMPIRE,
  WEREBAT,     WIGHT,       WING_EYE,    WT_DRAGN,
  WYVERN,      ZOMBIE,
  // New enemies
  VAMPIRE_LORD, STORM_FLY,   WIZARD,      OLIPHANT,
  DRAINER_CRAB, GAIA,        SNOW_LION,   POISON_PLANT,
  GIANT_SPIDER, MOTA_SHOOTER, DEZO_PRIEST, NANO_COP,
  DEATH_KNIGHT, SKELETON_GUARD, REVENANT,  CYCLOP
}

// NOTE: In Java these are separate enum classes, so PS1Enemy.AMMONITE and
// PS4Enemy.RED_SCORPION are distinct map keys. TypeScript numeric enums are
// plain numbers, so each family needs its own value range or later
// registrations overwrite the PS1 entries in the enemy lib map
// (AMMONITE=0 was showing RED_SCORPION=0, etc.).
export enum PS4Enemy {
  RED_SCORPION = 1000,
  YELLOW_SCORPION,
  BLUE_SCORPION
}

export enum XeenEnemy {
  SEWER_SLUG = 2000,
  BEHOLDER
}


export class PSLibEnemy {
  /**
   * Initialize all original PS enemies
   */
  public static initializeOriginalEnemies(): Map<GenericEnemy, Enemy> {
    const enemies = new Map<GenericEnemy, Enemy>();
			
			this.addEnemy(enemies, PS1Enemy.AMMONITE, new Enemy("Enemy_Ammonite").setHp(90).setAtk(88).setDef(60).setExp(19).setMst(71).setNum(2).setRun(153).setTrap(63).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/ammonite.chr").setMental(Mental.LOWER).setVertical(70).setContact(95).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.AMUNDSEN, new Enemy("Enemy_Amundsen").setHp(133).setAtk(140).setDef(98).setExp(32).setMst(120).setRun(178).setTrap(12).setRope(CanRope.NO).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/amundsen.chr").setFire(FireRes.YES).setVertical(70).setContact(110).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.ANDROCOP, new Enemy("Enemy_Androcop").setHp(120).setAtk(145).setDef(89).setExp(29).setMst(123).setNum(2).setRun(127).setTrap(12).setRope(CanRope.NO).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/androcop.chr").setMental(Mental.LOWER).setFire(FireRes.YES).setVertical(90).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.ANT_LION, new Enemy("Enemy_Ant_lion").setHp(66).setAtk(59).setDef(52).setExp(8).setMst(7).setRun(178).setTrap(12).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/ant_lion.chr").setVertical(115).setContact(130).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.BARBRIAN, new Enemy("Enemy_Motavian_Barbarian").setHp(54).setAtk(35).setDef(50).setExp(10).setMst(89).setNum(8).setRun(76).setTrap(20).setItem(HasItem.COLA).setTalk(CanTalk.YES).setChat(CanChat.YES).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/barbarian.chr").setMental(Mental.HIGHER).setVertical(120).setContact(130).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.BATALION, new Enemy("Enemy_Battalion").setHp(100).setAtk(112).setDef(64).setExp(21).setMst(59).setNum(3).setRun(204).setTrap(12).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/batalion.chr").setMental(Mental.LOWEST).setVertical(91).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.BIG_CLUB, new Enemy("Enemy_Big_Club").setHp(46).setAtk(40).setDef(36).setExp(9).setMst(40).setNum(2).setRun(204).setTrap(15).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/bigclub.chr").setMental(Mental.LOWER).setVertical(78).setContact(110).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.BL_DRAGN, new Enemy("Enemy_Blue_Dragon").setHp(310).setAtk(155).setDef(90).setExp(88).setMst(178).setRun(153).setTrap(12).setChat(CanChat.YES).setRope(CanRope.NO).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/blue_dragon.chr").setVertical(70).setContact(120).setType(EnemyType.MOTAVIA)); // +100 HP
			this.addEnemy(enemies, PS1Enemy.BL_SLIME, new Enemy("Enemy_Blue_Slime").setHp(40).setAtk(26).setDef(20).setExp(5).setMst(19).setNum(6).setRun(153).setTrap(15).setSpecial(Special.CURE).setSound(PS1Sound.ENEMY_JUMP).setAnim("battle/enemy_ps1/blueslime.chr").setMental(Mental.LOWEST).setVertical(132).setContact(155).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.CENTAUR, new Enemy("Enemy_Centaur").setHp(190).setAtk(155).setDef(100).setExp(31).setMst(133).setRun(127).setTrap(40).setChat(CanChat.YES).setRope(CanRope.NO).setProt(CanProt.NO).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/centaur.chr").setVertical(78).setContact(110).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.CRAWLER, new Enemy("Enemy_Crawler").setHp(40).setAtk(31).setDef(32).setExp(9).setMst(30).setNum(3).setRun(127).setTrap(15).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/crawler.chr").setMental(Mental.LOWEST).setVertical(89).setContact(145).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.DARKFALZ, new Enemy("Enemy_Dark_Force").setHp(510).setAtk(255).setDef(150).setExp(0).setMst(0).setRun(0).setRope(CanRope.NO).setSpecial(Special.DOUBLE_ATTACK).setProt(CanProt.NO).setSound(PS1Sound.THUNDER).setAnim("battle/enemy_ps1/darkfalz.chr").setMental(Mental.LOWER).setVertical(44).setContact(110).setType(EnemyType.NONE));
			this.addEnemy(enemies, PS1Enemy.DEADTREE, new Enemy("Enemy_Dead_Tree").setHp(23).setAtk(23).setDef(25).setExp(4).setMst(21).setNum(3).setRun(204).setTrap(40).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/deadtree.chr").setMental(Mental.LOWER).setVertical(116).setContact(120).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.DEZORIAN, new Enemy("Enemy_Dezorian").setHp(76).setAtk(77).setDef(63).setExp(18).setMst(105).setNum(5).setRun(127).setTrap(12).setChat(CanChat.YES).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/dezorian.chr").setMental(Mental.HIGHER).setVertical(86).setContact(110).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.DR_MAD, new Enemy("Enemy_Doctor_Mad").setHp(233).setAtk(180).setDef(85).setExp(25).setMst(140).setRun(0).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/dr_mad.chr").setVertical(100).setContact(120).setType(EnemyType.NONE));
			this.addEnemy(enemies, PS1Enemy.E_FARMER, new Enemy("Enemy_Motavian_Farmer").setHp(42).setAtk(27).setDef(40).setExp(9).setMst(30).setNum(5).setRun(204).setTrap(15).setTalk(CanTalk.YES).setChat(CanChat.YES).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/efarmer.chr").setMental(Mental.HIGHER).setVertical(120).setContact(130).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.ELEPHANT, new Enemy("Enemy_Elephant").setHp(136).setAtk(62).setDef(48).setExp(27).setMst(38).setNum(5).setRun(204).setTrap(12).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/elephant.chr").setMental(Mental.LOWER).setVertical(82).setContact(110).setType(EnemyType.PALMA)); // +50 HP +10XP
			this.addEnemy(enemies, PS1Enemy.EVILDEAD, new Enemy("Enemy_Evil_Dead").setHp(30).setAtk(43).setDef(36).setExp(14).setMst(8).setNum(3).setRun(229).setTrap(12).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/evildead.chr").setVertical(84).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.EVILHEAD, new Enemy("Enemy_Dezorian_Head").setHp(86).setAtk(118).setDef(77).setExp(20).setMst(136).setNum(3).setRun(127).setTrap(15).setChat(CanChat.YES).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/evilhead.chr").setMental(Mental.HIGHER).setVertical(86).setContact(110).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.EXECUTER, new Enemy("Enemy_Executor").setHp(62).setAtk(73).setDef(50).setExp(12).setMst(63).setNum(3).setRun(102).setTrap(53).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/executer.chr").setMental(Mental.LOWER).setVertical(78).setContact(110).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.FISHMAN, new Enemy("Enemy_Fishman").setHp(42).setAtk(42).setDef(40).setExp(11).setMst(42).setNum(5).setRun(153).setTrap(15).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/fishman.chr").setVertical(110).setContact(130).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.FROSTMAN, new Enemy("Enemy_Frostman").setHp(140).setAtk(138).setDef(98).setExp(36).setMst(128).setRun(191).setTrap(20).setRope(CanRope.NO).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/frostman.chr").setVertical(70).setContact(110).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.G_SCORPI, new Enemy("Enemy_Gscorpion").setHp(20).setAtk(20).setDef(17).setExp(5).setMst(11).setNum(4).setRun(127).setTrap(153).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps1/gscorpion.chr").setVertical(116).setContact(140).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.GD_DRAGN, new Enemy("Enemy_Gold_Drake").setHp(370).setAtk(200).setDef(98).setExp(100).setMst(0).setRun(0).setRope(CanRope.NO).setWing(HasWing.YES).setSpecial(Special.CURE).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/golden_dragon.chr").setFire(FireRes.YES).setVertical(78).setContact(110).setType(EnemyType.NONE)); // +200 HP
			this.addEnemy(enemies, PS1Enemy.GHOUL, new Enemy("Enemy_Ghoul").setHp(68).setAtk(64).setDef(47).setExp(16).setMst(26).setNum(3).setRun(178).setTrap(12).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/ghoul.chr").setMental(Mental.LOWEST).setVertical(91).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.GIANT, new Enemy("Enemy_Giant").setHp(120).setAtk(122).setDef(88).setExp(30).setMst(119).setNum(2).setRun(127).setTrap(12).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/giant.chr").setMental(Mental.LOWER).setVertical(74).setContact(110).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.GIANTFLY, new Enemy("Enemy_Herex").setHp(25).setAtk(30).setDef(21).setExp(7).setMst(32).setNum(4).setRun(102).setTrap(15).setWing(HasWing.YES).setSpecial(Special.FIRE).setSpcpoint(-16, 35).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps1/giantfly.chr").setFire(FireRes.YES).setMental(Mental.LOWER).setVertical(85).setContact(105).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.GOLDLENS, new Enemy("Enemy_Gold_Lens").setHp(28).setAtk(36).setDef(35).setExp(9).setMst(24).setNum(4).setRun(127).setTrap(15).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/goldlens.chr").setVertical(83).setContact(115).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.GOLEM, new Enemy("Enemy_Golem").setHp(140).setAtk(121).setDef(96).setExp(24).setMst(150).setNum(2).setRun(178).setTrap(12).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/golem.chr").setMental(Mental.LOWER).setVertical(74).setContact(110).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.GR_DRAGN, new Enemy("Enemy_Green_Dragon").setHp(260).setAtk(145).setDef(95).setExp(53).setMst(176).setRun(153).setTrap(12).setChat(CanChat.YES).setRope(CanRope.NO).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/green_dragon.chr").setFire(FireRes.YES).setVertical(70).setContact(120).setType(EnemyType.PALMA)); // +100 HP
			this.addEnemy(enemies, PS1Enemy.GR_SLIME, new Enemy("Enemy_Green_Slime").setHp(18).setAtk(18).setDef(13).setExp(4).setMst(8).setNum(6).setRun(204).setTrap(12).setSound(PS1Sound.ENEMY_JUMP).setAnim("battle/enemy_ps1/greenslime.chr").setMental(Mental.LOWEST).setVertical(132).setContact(155).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.HORSEMAN, new Enemy("Enemy_Horseman").setHp(130).setAtk(126).setDef(89).setExp(30).setMst(148).setNum(2).setRun(89).setChat(CanChat.YES).setRope(CanRope.NO).setProt(CanProt.NO).setSpecial(Special.FIRE).setItem(HasItem.FLASH).setSpcpoint(-6, 40).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/horseman.chr").setVertical(78).setContact(110).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.LASSIC, new Enemy("Enemy_LaShiec").setHp(438).setAtk(230).setDef(180).setExp(0).setMst(0).setRun(0).setRope(CanRope.NO).setProt(CanProt.NO).setSpecial(Special.THUNDER2).setSound(PS1Sound.THUNDER).setAnim("battle/enemy_ps1/lassic.chr").setMental(Mental.HIGHER).setVertical(16).setContact(110).setType(EnemyType.NONE)); // +200 HP
			this.addEnemy(enemies, PS1Enemy.LEECH, new Enemy("Enemy_Desert_Leech").setHp(70).setAtk(67).setDef(47).setExp(15).setMst(47).setNum(4).setRun(165).setTrap(12).setSpecial(Special.HELP).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/leech.chr").setMental(Mental.LOWEST).setVertical(89).setContact(145).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.LICH, new Enemy("Enemy_Lich").setHp(60).setAtk(84).setDef(62).setExp(22).setMst(33).setNum(2).setRun(204).setTrap(12).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/lich.chr").setVertical(84).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.MAGICIAN, new Enemy("Enemy_Magician").setHp(138).setAtk(145).setDef(90).setExp(32).setMst(187).setRun(127).setTrap(12).setSpecial(Special.THUNDER).setSpcpoint(-2, 36).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/magician.chr").setMental(Mental.HIGHER).setVertical(86).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.MAMMOTH, new Enemy("Enemy_Mammoth").setHp(180).setAtk(154).setDef(100).setExp(40).setMst(125).setNum(5).setRun(178).setTrap(15).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/mammoth.chr").setMental(Mental.LOWER).setVertical(82).setContact(110).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.MANEATER, new Enemy("Enemy_Maneater").setHp(16).setAtk(12).setDef(10).setExp(3).setMst(13).setNum(5).setRun(255).setTrap(15).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/maneater.chr").setMental(Mental.LOWER).setVertical(116).setContact(120).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.MANTICORE, new Enemy("Enemy_Manticore").setHp(60).setAtk(53).setDef(44).setExp(15).setMst(49).setNum(3).setRun(153).setTrap(15).setChat(CanChat.YES).setRope(CanRope.NO).setWing(HasWing.YES).setSpcpoint(-33, 55).setSpecial(Special.FIRE).setSound(PS1Sound.ENEMY_JUMP).setAnim("battle/enemy_ps1/manticore.chr").setMental(Mental.HIGHER).setVertical(86).setContact(130).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.MARAUDER, new Enemy("Enemy_Marauder").setHp(135).setAtk(134).setDef(88).setExp(30).setMst(173).setRun(178).setTrap(15).setProt(CanProt.NO).setSpcpoint(-12, 30).setSpecial(Special.THUNDER).setSound(PS1Sound.ENEMY_SWEEP).setAnim("battle/enemy_ps1/marauder.chr").setVertical(78).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.MARMAN, new Enemy("Enemy_Marshman").setHp(58).setAtk(67).setDef(50).setExp(14).setMst(43).setNum(5).setRun(127).setTrap(15).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/marshman.chr").setFire(FireRes.YES).setVertical(110).setContact(130).setType(EnemyType.PALMA)); // Changed to 5 due to space
			this.addEnemy(enemies, PS1Enemy.MEDUSA, new Enemy("Enemy_Medusa").setHp(300).setAtk(166).setDef(103).setExp(50).setMst(194).setRun(0).setProt(CanProt.NO).setSpecial(Special.PETRIFY).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/medusa.chr").setMental(Mental.LOWER).setVertical(80).setContact(110).setType(EnemyType.NONE)); // +100 HP removed Flash
			this.addEnemy(enemies, PS1Enemy.N_FARMER, new Enemy("Enemy_Motavian_Teaser").setHp(38).setAtk(37).setDef(37).setExp(5).setMst(8).setNum(5).setRun(178).setTalk(CanTalk.YES).setChat(CanChat.YES).setItem(HasItem.COLA).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/nfarmer.chr").setMental(Mental.HIGHER).setVertical(120).setContact(130).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.NESSIE, new Enemy("Enemy_Nessie").setHp(93).setAtk(126).setDef(77).setExp(28).setMst(101).setNum(2).setRun(204).setTrap(12).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/nessie.chr").setFire(FireRes.YES).setVertical(78).setContact(110).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.OCTOPUS, new Enemy("Enemy_Octopus").setHp(90).setAtk(85).setDef(68).setExp(24).setMst(64).setRun(191).setTrap(12).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/octopus.chr").setSpecial(Special.DOUBLE_ATTACK).setMental(Mental.LOWER).setVertical(100).setContact(130).setType(EnemyType.PALMA)); // Added double attack, more xp
			this.addEnemy(enemies, PS1Enemy.OWL_BEAR, new Enemy("Enemy_Owl_Bear").setHp(18).setAtk(22).setDef(18).setExp(5).setMst(12).setNum(4).setRun(153).setTrap(12).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/owlbear.chr").setVertical(83).setContact(115).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.RD_DRAGN, new Enemy("Enemy_Red_Dragon").setHp(275).setAtk(160).setDef(105).setExp(65).setMst(193).setRun(127).setTrap(15).setChat(CanChat.YES).setRope(CanRope.NO).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/red_dragon.chr").setFire(FireRes.YES).setVertical(70).setContact(120).setType(EnemyType.SPECIAL)); // +100 HP
			this.addEnemy(enemies, PS1Enemy.RD_SLIME, new Enemy("Enemy_Red_Slime").setHp(29).setAtk(37).setDef(25).setExp(11).setMst(31).setNum(3).setRun(153).setTrap(15).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_JUMP).setAnim("battle/enemy_ps1/redslime.chr").setFire(FireRes.YES).setMental(Mental.LOWEST).setVertical(132).setContact(155).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.REAPER, new Enemy("Enemy_Reaper").setHp(185).setAtk(135).setDef(102).setExp(30).setMst(254).setRun(204).setTrap(51).setProt(CanProt.NO).setSpecial(Special.HELP).setSound(PS1Sound.ENEMY_SWEEP).setAnim("battle/enemy_ps1/reaper.chr").setVertical(78).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.ROBOTCOP, new Enemy("Enemy_RobotCop").setHp(110).setAtk(135).setDef(90).setExp(25).setMst(156).setRun(102).setTrap(15).setRope(CanRope.NO).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/robotcop.chr").setMental(Mental.LOWER).setVertical(90).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.SACCUBUS, new Enemy("Enemy_Saccubus").setHp(255).setAtk(150).setDef(250).setExp(10).setMst(0).setRun(0).setRope(CanRope.NO).setProt(CanProt.NO).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/saccubus.chr").setVertical(108).setContact(125).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.SANDWORM, new Enemy("Enemy_Sandworm").setHp(82).setAtk(107).setDef(63).setExp(20).setMst(129).setNum(3).setRun(153).setTrap(15).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/sandworm.chr").setMental(Mental.LOWEST).setVertical(89).setContact(145).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.SCORPION, new Enemy("Enemy_Scorpion").setHp(12).setAtk(14).setDef(12).setExp(4).setMst(13).setNum(4).setRun(204).setTrap(15).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps1/scorpion.chr").setVertical(116).setContact(140).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.SCORPIUS, new Enemy("Enemy_Scorpius").setHp(22).setAtk(25).setDef(20).setExp(8).setMst(27).setNum(5).setRun(102).setTrap(15).setWing(HasWing.YES).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps1/scorpius.chr").setVertical(116).setContact(140).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.SERPENT, new Enemy("Enemy_Serpent").setHp(80).setAtk(100).setDef(66).setExp(23).setMst(96).setRun(178).setTrap(15).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/serpent.chr").setFire(FireRes.YES).setVertical(78).setContact(110).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.SHADOW, new Enemy("Enemy_Shadow").setHp(165).setAtk(172).setDef(104).setExp(60).setMst(0).setRun(0).setTrap(12).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/shadow.chr").setVertical(100).setContact(120).setType(EnemyType.NONE));
			this.addEnemy(enemies, PS1Enemy.SHELFISH, new Enemy("Enemy_Shellfish").setHp(62).setAtk(77).setDef(52).setExp(16).setMst(46).setNum(3).setRun(229).setTrap(20).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/shelfish.chr").setMental(Mental.LOWER).setVertical(70).setContact(95).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.SKELETON, new Enemy("Enemy_Skeleton").setHp(53).setAtk(58).setDef(41).setExp(13).setMst(25).setNum(5).setRun(204).setTrap(15).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/skeleton.chr").setVertical(82).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.SKULL_EN, new Enemy("Enemy_Skull_Soldier").setHp(57).setAtk(75).setDef(53).setExp(18).setMst(37).setNum(3).setRun(178).setTrap(12).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/skullen.chr").setVertical(82).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.SORCERER, new Enemy("Enemy_Sorcerer").setHp(110).setAtk(121).setDef(74).setExp(26).setMst(120).setNum(2).setRun(204).setTrap(51).setSpcpoint(-2, 36).setSpecial(Special.FIRE).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/sorcerer.chr").setMental(Mental.HIGHER).setVertical(86).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.SPHINX, new Enemy("Enemy_Sphinx").setHp(78).setAtk(80).setDef(65).setExp(21).setMst(58).setNum(4).setRun(204).setTrap(12).setChat(CanChat.YES).setRope(CanRope.NO).setWing(HasWing.YES).setItem(HasItem.FLASH).setSound(PS1Sound.ENEMY_JUMP).setAnim("battle/enemy_ps1/sphinx.chr").setMental(Mental.HIGHER).setVertical(86).setContact(130).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.STALKER, new Enemy("Enemy_Stalker").setHp(79).setAtk(90).setDef(75).setExp(22).setMst(87).setNum(4).setRun(229).setTrap(15).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/stalker.chr").setVertical(82).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.SWORM, new Enemy("Enemy_Monster_Fly").setHp(8).setAtk(13).setDef(9).setExp(2).setMst(3).setNum(8).setRun(255).setTrap(12).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps1/sworm.chr").setVertical(85).setContact(105).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.TARANTUL, new Enemy("Enemy_Tarantula").setHp(50).setAtk(50).setDef(43).setExp(10).setMst(51).setNum(2).setRun(153).setTrap(38).setChat(CanChat.YES).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/tarantul.chr").setMental(Mental.HIGHER).setVertical(115).setContact(130).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.TARZIMAL, new Enemy("Enemy_Tajim").setHp(125).setAtk(120).setDef(100).setExp(0).setMst(0).setRun(0).setTrap(12).setRope(CanRope.NO).setSpecial(Special.FIRE).setSpcpoint(-36, 20).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_ps1/tarzimal.chr").setMental(Mental.HIGHER).setVertical(125).setContact(135).setType(EnemyType.NONE));
			this.addEnemy(enemies, PS1Enemy.TENTACLE, new Enemy("Enemy_Tentacle").setHp(118).setAtk(118).setDef(87).setExp(31).setMst(98).setRun(178).setTrap(12).setSpecial(Special.DOUBLE_ATTACK).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/tentacle.chr").setMental(Mental.LOWER).setVertical(100).setContact(130).setType(EnemyType.PALMA)); // added Double Attack, more xp
			this.addEnemy(enemies, PS1Enemy.TITAN, new Enemy("Enemy_Titan").setHp(190).setAtk(146).setDef(97).setExp(32).setMst(138).setNum(2).setRun(127).setTrap(33).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_ps1/titan.chr").setVertical(74).setContact(110).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.VAMPIRE, new Enemy("Enemy_Vampire").setHp(67).setAtk(68).setDef(46).setExp(15).setMst(71).setNum(2).setRun(204).setTrap(12).setItem(HasItem.FLASH).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/vampire.chr").setVertical(64).setContact(120).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.WEREBAT, new Enemy("Enemy_Werebat").setHp(50).setAtk(37).setDef(35).setExp(11).setMst(63).setNum(4).setRun(127).setTrap(15).setSpecial(Special.HELP).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/werebat.chr").setVertical(64).setContact(120).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.WIGHT, new Enemy("Enemy_Wight").setHp(50).setAtk(64).setDef(48).setExp(18).setMst(40).setNum(3).setRun(178).setTrap(12).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/wight.chr").setVertical(84).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.WING_EYE, new Enemy("Enemy_Wing_Eye").setHp(11).setAtk(12).setDef(10).setExp(2).setMst(6).setNum(6).setRun(127).setTrap(15).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_ps1/wingeye.chr").setVertical(83).setContact(115).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.WT_DRAGN, new Enemy("Enemy_White_Dragon").setHp(300).setAtk(180).setDef(104).setExp(75).setMst(234).setRun(153).setTrap(15).setChat(CanChat.YES).setRope(CanRope.NO).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/white_dragon.chr").setVertical(70).setContact(120).setType(EnemyType.DEZORIS)); // +100 HP
			this.addEnemy(enemies, PS1Enemy.WYVERN, new Enemy("Enemy_Wyvern").setHp(110).setAtk(123).setDef(84).setExp(26).setMst(125).setRun(127).setTrap(12).setWing(HasWing.YES).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_ps1/wyvern.chr").setFire(FireRes.YES).setVertical(78).setContact(110).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.ZOMBIE, new Enemy("Enemy_Zombie").setHp(87).setAtk(108).setDef(58).setExp(20).setMst(27).setNum(4).setRun(153).setTrap(15).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_ps1/zombie.chr").setMental(Mental.LOWEST).setVertical(91).setContact(110).setType(EnemyType.UNDEAD));

			// New Enemies
			this.addEnemy(enemies, PS1Enemy.VAMPIRE_LORD, new Enemy("Enemy_Vampire_Lord").setHp(150).setAtk(137).setDef(75).setExp(30).setMst(183).setNum(4).setRun(127).setTrap(15).setSpecial(Special.CURE).setSound(PS1Sound.ENEMY_BUZZ).setAnim("battle/enemy_new/vampire_lord.chr").setVertical(64).setContact(120).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.STORM_FLY, new Enemy("Enemy_Storm_Fly").setHp(35).setAtk(50).setDef(31).setExp(17).setMst(72).setNum(4).setRun(102).setTrap(15).setWing(HasWing.YES).setSpecial(Special.THUNDER).setSpcpoint(-16, 40).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_new/storm_fly.chr").setVertical(85).setContact(105).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.WIZARD, new Enemy("Enemy_Wizard").setHp(168).setAtk(165).setDef(110).setExp(52).setMst(287).setRun(127).setTrap(52).setSpecial(Special.MP_DRAIN).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_new/wizard.chr").setMental(Mental.HIGHER).setVertical(86).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.OLIPHANT, new Enemy("Enemy_Oliphant").setHp(180).setAtk(114).setDef(80).setExp(35).setMst(120).setNum(3).setRun(128).setTrap(15).setProt(CanProt.NO).setSpecial(Special.FIRE).setSpcpoint(-15, 45).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_new/oliphant.chr").setFire(FireRes.YES).setVertical(82).setContact(110).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.DRAINER_CRAB, new Enemy("Enemy_Drainer_Crab").setHp(96).setAtk(50).setDef(66).setExp(19).setMst(140).setNum(3).setRun(128).setTrap(15).setSpecial(Special.MP_DRAIN).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_new/gold_club.chr").setMental(Mental.HIGHER).setVertical(78).setContact(110).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.GAIA, new Enemy("Enemy_Gaia").setHp(170).setAtk(158).setDef(118).setExp(56).setMst(178).setNum(2).setRun(191).setTrap(20).setRope(CanRope.NO).setSpecial(Special.CURE).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/enemy_new/gaia.chr").setVertical(70).setContact(110).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.SNOW_LION, new Enemy("Enemy_Snow_Lion").setHp(138).setAtk(110).setDef(75).setExp(31).setMst(98).setNum(3).setRun(153).setTrap(12).setChat(CanChat.YES).setRope(CanRope.NO).setWing(HasWing.YES).setSpecial(Special.DOUBLE_ATTACK).setSound(PS1Sound.ENEMY_JUMP).setAnim("battle/enemy_new/snow_lion.chr").setMental(Mental.HIGHER).setVertical(86).setContact(130).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.POISON_PLANT, new Enemy("Enemy_Poison_Plant").setHp(46).setAtk(46).setDef(50).setExp(14).setMst(42).setNum(3).setRun(204).setTrap(40).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_new/poisonplant.chr").setMental(Mental.LOWER).setVertical(116).setContact(120).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.GIANT_SPIDER, new Enemy("Enemy_Giant_Spider").setHp(75).setAtk(75).setDef(64).setExp(18).setMst(76).setNum(3).setRun(153).setTrap(38).setChat(CanChat.YES).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_new/giantspider.chr").setMental(Mental.HIGHER).setVertical(115).setContact(130).setType(EnemyType.PALMA));
			this.addEnemy(enemies, PS1Enemy.MOTA_SHOOTER, new Enemy("Mota_Shooter").setHp(59).setAtk(41).setDef(55).setExp(14).setMst(99).setNum(4).setRun(76).setTrap(40).setItem(HasItem.DIMATE).setTalk(CanTalk.YES).setChat(CanChat.YES).setSpecial(Special.DOUBLE_ATTACK).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_new/mota_shooter.chr").setMental(Mental.HIGHER).setVertical(120).setContact(130).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS1Enemy.DEZO_PRIEST, new Enemy("Enemy_Dezo_Priest").setHp(99).setAtk(88).setDef(87).setExp(21).setMst(121).setNum(3).setRun(127).setTrap(15).setChat(CanChat.YES).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_new/dezo_alt.chr").setSpecial(Special.MP_DRAIN).setMental(Mental.HIGHER).setVertical(86).setContact(110).setType(EnemyType.DEZORIS));
			this.addEnemy(enemies, PS1Enemy.NANO_COP, new Enemy("Enemy_Nano_Cop").setHp(140).setAtk(165).setDef(103).setExp(44).setMst(153).setNum(3).setRun(127).setTrap(12).setRope(CanRope.NO).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_SHOT).setAnim("battle/enemy_new/nanocop.chr").setSpecial(Special.DOUBLE_ATTACK).setMental(Mental.LOWER).setVertical(90).setContact(110).setType(EnemyType.SPECIAL));
			this.addEnemy(enemies, PS1Enemy.DEATH_KNIGHT, new Enemy("Enemy_Death_Knight").setHp(215).setAtk(155).setDef(102).setExp(39).setMst(199).setRun(204).setTrap(51).setRope(CanRope.NO).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_SWEEP).setAnim("battle/enemy_new/death_knight.chr").setVertical(78).setContact(110).setType(EnemyType.UNDEAD));
			
			// Yoz new Enemies
			this.addEnemy(enemies, PS1Enemy.SKELETON_GUARD, new Enemy("Enemy_Skeleton_Guard").setHp(85).setAtk(58).setDef(89).setExp(22).setMst(45).setNum(1).setRun(204).setTrap(15).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_new/skeleton_guard.chr").setVertical(70).setContact(110).setType(EnemyType.UNDEAD));
			this.addEnemy(enemies, PS1Enemy.REVENANT, new Enemy("Enemy_Revenant").setHp(115).setAtk(122).setDef(67).setExp(25).setMst(65).setNum(3).setRun(153).setTrap(12).setSound(PS1Sound.ENEMY_SPLASH).setAnim("battle/enemy_new/revenant.chr").setMental(Mental.LOWEST).setVertical(86).setContact(110).setType(EnemyType.UNDEAD));			
			this.addEnemy(enemies, PS1Enemy.CYCLOP, new Enemy("Enemy_Cyclop").setHp(220).setAtk(166).setDef(107).setExp(42).setMst(238).setNum(2).setRun(127).setTrap(33).setProt(CanProt.NO).setSound(PS1Sound.ENEMY_PUNCH).setAnim("battle/enemy_new/cyclop.chr").setVertical(74).setContact(110).setType(EnemyType.DEZORIS));
			
			// Xeen Enemies
			this.addEnemy(enemies, XeenEnemy.SEWER_SLUG, new Enemy("Slug").setHp(140).setAtk(26).setDef(20).setExp(5).setMst(19).setNum(3).setRun(153).setTrap(15).setSpecial(Special.CURE).setSound(PS1Sound.ENEMY_JUMP).setAnim("battle/xeen/Slug.chr").setVertical(130).setContact(150));
			this.addEnemy(enemies, XeenEnemy.BEHOLDER, new Enemy("Beholder").setHp(180).setAtk(36).setDef(20).setExp(5).setMst(19).setNum(3).setRun(153).setTrap(15).setSound(PS1Sound.ENEMY_BREATH).setAnim("battle/xeen/Beholder.chr").setVertical(90).setContact(110));

			// PSIV Enemies
			this.addEnemy(enemies, PS4Enemy.RED_SCORPION, new Enemy("Enemy_PSIV_Scorpion").setHp(60).setAtk(42).setDef(36).setExp(12).setMst(39).setNum(4).setRun(204).setTrap(15).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps4/ps4_scorpion.chr").setVertical(116).setContact(140).setType(EnemyType.PALMA));			
			this.addEnemy(enemies, PS4Enemy.YELLOW_SCORPION, new Enemy("Enemy_PSIV_Gscorpion").setHp(80).setAtk(50).setDef(44).setExp(15).setMst(33).setNum(4).setRun(127).setTrap(153).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps4/ps4_yellow_scorpion.chr").setSpecial(Special.ROPE).setVertical(116).setContact(140).setType(EnemyType.MOTAVIA));
			this.addEnemy(enemies, PS4Enemy.BLUE_SCORPION, new Enemy("Enemy_PSIV_Scorpius").setHp(110).setAtk(75).setDef(60).setExp(24).setMst(81).setNum(3).setRun(102).setTrap(15).setSpecial(Special.ROPE).setSound(PS1Sound.ENEMY_SHORT_BUZZ).setAnim("battle/enemy_ps4/ps4_blue_scorpion.chr").setVertical(116).setContact(140).setType(EnemyType.DEZORIS));
			
			return enemies;
		}
  /**
   * Add enemy to collection
   */
  private static addEnemy(enemies: Map<GenericEnemy, Enemy>, enemy: GenericEnemy, enemyObj: Enemy): void {
    enemies.set(enemy, enemyObj);
  }

  /**
   * Get enemy by enum
   */
  public static getEnemyByEnum(enemyType: GenericEnemy): Enemy | null {
    const enemies = this.initializeOriginalEnemies();
    return enemies.get(enemyType) || null;
  }

}