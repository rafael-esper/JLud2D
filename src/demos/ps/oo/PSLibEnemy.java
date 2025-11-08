package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.HashMap;

import demos.ps.oo.Enemy.CanChat;
import demos.ps.oo.Enemy.CanProt;
import demos.ps.oo.Enemy.CanRope;
import demos.ps.oo.Enemy.CanTalk;
import demos.ps.oo.Enemy.FireRes;
import demos.ps.oo.Enemy.HasItem;
import demos.ps.oo.Enemy.HasWing;
import demos.ps.oo.Enemy.Mental;
import demos.ps.oo.Enemy.Special;
import demos.ps.oo.Enemy.Type;
import demos.ps.oo.PSLibSound.PS1Sound;

public class PSLibEnemy {

	private static final Logger log = LogManager.getLogger(PSLibEnemy.class);

		public interface GenericEnemy {
			
		}

		//http://www.pscave.com/ps1/monsterlist.txt
		public enum PS1Enemy implements GenericEnemy {
			AMMONITE, AMUNDSEN, ANDROCOP, ANT_LION, BARBRIAN, BATALION, BIG_CLUB, BL_DRAGN, BL_SLIME, 
			CENTAUR, CRAWLER, DARKFALZ, DEADTREE, DEZORIAN, DR_MAD, E_FARMER, ELEPHANT, EVILDEAD, EVILHEAD, 
			EXECUTER, FISHMAN, FROSTMAN, G_SCORPI, GD_DRAGN, GHOUL, GIANT, GIANTFLY, GOLDLENS, GOLEM, 
			GR_DRAGN, GR_SLIME, HORSEMAN, LASSIC, LEECH, LICH, MAGICIAN, MAMMOTH, MANEATER, MANTICORE, 
			MARAUDER, MARMAN, MEDUSA, N_FARMER, NESSIE, OCTOPUS, OWL_BEAR, RD_DRAGN, RD_SLIME, REAPER, 
			ROBOTCOP, SACCUBUS, SANDWORM, SCORPION, SCORPIUS, SERPENT, SHADOW, SHELFISH, SKELETON, SKULL_EN, 
			SORCERER, SPHINX, STALKER, SWORM, TARANTUL, TARZIMAL, TENTACLE, TITAN, VAMPIRE, WEREBAT, 
			WIGHT, WING_EYE, WT_DRAGN, WYVERN, ZOMBIE,
			// New enemies
			VAMPIRE_LORD, STORM_FLY, WIZARD, OLIPHANT, DRAINER_CRAB, GAIA, SNOW_LION, 
			POISON_PLANT, GIANT_SPIDER, MOTA_SHOOTER, DEZO_PRIEST, NANO_COP, DEATH_KNIGHT,
			SKELETON_GUARD, REVENANT, CYCLOP
		};
		
		public enum PS4Enemy implements GenericEnemy {
			RED_SCORPION, YELLOW_SCORPION, BLUE_SCORPION
		}
 	
 		public enum XeenEnemy implements GenericEnemy {
 			SEWER_SLUG, BEHOLDER
 		}

		public static HashMap<GenericEnemy, Enemy> initializeOriginalEnemies() {
			
			HashMap<GenericEnemy, Enemy> enemies = new HashMap<GenericEnemy, Enemy>();
			
			addEnemy(enemies, PS1Enemy.AMMONITE, new Enemy("Enemy_Ammonite").hp(90).atk(88).def(60).exp(19).mst(71).num(2).run(153).trap(63).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/ammonite.chr").mental(Mental.LOWER).vertical(70).contact(95).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.AMUNDSEN, new Enemy("Enemy_Amundsen").hp(133).atk(140).def(98).exp(32).mst(120).run(178).trap(12).rope(CanRope.NO).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/amundsen.chr").fire(FireRes.YES).vertical(70).contact(110).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.ANDROCOP, new Enemy("Enemy_Androcop").hp(120).atk(145).def(89).exp(29).mst(123).num(2).run(127).trap(12).rope(CanRope.NO).prot(CanProt.NO).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/androcop.chr").mental(Mental.LOWER).fire(FireRes.YES).vertical(90).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.ANT_LION, new Enemy("Enemy_Ant_lion").hp(66).atk(59).def(52).exp(8).mst(7).run(178).trap(12).special(Special.ROPE).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/ant_lion.chr").vertical(115).contact(130).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.BARBRIAN, new Enemy("Enemy_Motavian_Barbarian").hp(54).atk(35).def(50).exp(10).mst(89).num(8).run(76).trap(20).item(HasItem.COLA).talk(CanTalk.YES).chat(CanChat.YES).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/barbarian.chr").mental(Mental.HIGHER).vertical(120).contact(130).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.BATALION, new Enemy("Enemy_Battalion").hp(100).atk(112).def(64).exp(21).mst(59).num(3).run(204).trap(12).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/batalion.chr").mental(Mental.LOWEST).vertical(91).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.BIG_CLUB, new Enemy("Enemy_Big_Club").hp(46).atk(40).def(36).exp(9).mst(40).num(2).run(204).trap(15).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/bigclub.chr").mental(Mental.LOWER).vertical(78).contact(110).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.BL_DRAGN, new Enemy("Enemy_Blue_Dragon").hp(310).atk(155).def(90).exp(88).mst(178).run(153).trap(12).chat(CanChat.YES).rope(CanRope.NO).wing(HasWing.YES).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/blue_dragon.chr").vertical(70).contact(120).type(Type.MOTAVIA)); // +100 HP
			addEnemy(enemies, PS1Enemy.BL_SLIME, new Enemy("Enemy_Blue_Slime").hp(40).atk(26).def(20).exp(5).mst(19).num(6).run(153).trap(15).special(Special.CURE).sound(PS1Sound.ENEMY_JUMP).anim("battle/enemy_ps1/blueslime.chr").mental(Mental.LOWEST).vertical(132).contact(155).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.CENTAUR, new Enemy("Enemy_Centaur").hp(190).atk(155).def(100).exp(31).mst(133).run(127).trap(40).chat(CanChat.YES).rope(CanRope.NO).prot(CanProt.NO).special(Special.ROPE).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/centaur.chr").vertical(78).contact(110).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.CRAWLER, new Enemy("Enemy_Crawler").hp(40).atk(31).def(32).exp(9).mst(30).num(3).run(127).trap(15).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/crawler.chr").mental(Mental.LOWEST).vertical(89).contact(145).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.DARKFALZ, new Enemy("Enemy_Dark_Force").hp(510).atk(255).def(150).exp(0).mst(0).run(0).rope(CanRope.NO).special(Special.DOUBLE_ATTACK).prot(CanProt.NO).sound(PS1Sound.THUNDER).anim("battle/enemy_ps1/darkfalz.chr").mental(Mental.LOWER).vertical(44).contact(110).type(Type.NONE));
			addEnemy(enemies, PS1Enemy.DEADTREE, new Enemy("Enemy_Dead_Tree").hp(23).atk(23).def(25).exp(4).mst(21).num(3).run(204).trap(40).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/deadtree.chr").mental(Mental.LOWER).vertical(116).contact(120).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.DEZORIAN, new Enemy("Enemy_Dezorian").hp(76).atk(77).def(63).exp(18).mst(105).num(5).run(127).trap(12).chat(CanChat.YES).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/dezorian.chr").mental(Mental.HIGHER).vertical(86).contact(110).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.DR_MAD, new Enemy("Enemy_Doctor_Mad").hp(233).atk(180).def(85).exp(25).mst(140).run(0).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/dr_mad.chr").vertical(100).contact(120).type(Type.NONE));
			addEnemy(enemies, PS1Enemy.E_FARMER, new Enemy("Enemy_Motavian_Farmer").hp(42).atk(27).def(40).exp(9).mst(30).num(5).run(204).trap(15).talk(CanTalk.YES).chat(CanChat.YES).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/efarmer.chr").mental(Mental.HIGHER).vertical(120).contact(130).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.ELEPHANT, new Enemy("Enemy_Elephant").hp(136).atk(62).def(48).exp(27).mst(38).num(5).run(204).trap(12).prot(CanProt.NO).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/elephant.chr").mental(Mental.LOWER).vertical(82).contact(110).type(Type.PALMA)); // +50 HP +10XP
			addEnemy(enemies, PS1Enemy.EVILDEAD, new Enemy("Enemy_Evil_Dead").hp(30).atk(43).def(36).exp(14).mst(8).num(3).run(229).trap(12).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/evildead.chr").vertical(84).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.EVILHEAD, new Enemy("Enemy_Dezorian_Head").hp(86).atk(118).def(77).exp(20).mst(136).num(3).run(127).trap(15).chat(CanChat.YES).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/evilhead.chr").mental(Mental.HIGHER).vertical(86).contact(110).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.EXECUTER, new Enemy("Enemy_Executor").hp(62).atk(73).def(50).exp(12).mst(63).num(3).run(102).trap(53).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/executer.chr").mental(Mental.LOWER).vertical(78).contact(110).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.FISHMAN, new Enemy("Enemy_Fishman").hp(42).atk(42).def(40).exp(11).mst(42).num(5).run(153).trap(15).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/fishman.chr").vertical(110).contact(130).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.FROSTMAN, new Enemy("Enemy_Frostman").hp(140).atk(138).def(98).exp(36).mst(128).run(191).trap(20).rope(CanRope.NO).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/frostman.chr").vertical(70).contact(110).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.G_SCORPI, new Enemy("Enemy_Gscorpion").hp(20).atk(20).def(17).exp(5).mst(11).num(4).run(127).trap(153).wing(HasWing.YES).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps1/gscorpion.chr").vertical(116).contact(140).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.GD_DRAGN, new Enemy("Enemy_Gold_Drake").hp(370).atk(200).def(98).exp(100).mst(0).run(0).rope(CanRope.NO).wing(HasWing.YES).special(Special.CURE).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/golden_dragon.chr").fire(FireRes.YES).vertical(78).contact(110).type(Type.NONE)); // +200 HP
			addEnemy(enemies, PS1Enemy.GHOUL, new Enemy("Enemy_Ghoul").hp(68).atk(64).def(47).exp(16).mst(26).num(3).run(178).trap(12).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/ghoul.chr").mental(Mental.LOWEST).vertical(91).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.GIANT, new Enemy("Enemy_Giant").hp(120).atk(122).def(88).exp(30).mst(119).num(2).run(127).trap(12).prot(CanProt.NO).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/giant.chr").mental(Mental.LOWER).vertical(74).contact(110).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.GIANTFLY, new Enemy("Enemy_Herex").hp(25).atk(30).def(21).exp(7).mst(32).num(4).run(102).trap(15).wing(HasWing.YES).special(Special.FIRE).spcpoint(-16, 35).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps1/giantfly.chr").fire(FireRes.YES).mental(Mental.LOWER).vertical(85).contact(105).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.GOLDLENS, new Enemy("Enemy_Gold_Lens").hp(28).atk(36).def(35).exp(9).mst(24).num(4).run(127).trap(15).wing(HasWing.YES).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/goldlens.chr").vertical(83).contact(115).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.GOLEM, new Enemy("Enemy_Golem").hp(140).atk(121).def(96).exp(24).mst(150).num(2).run(178).trap(12).prot(CanProt.NO).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/golem.chr").mental(Mental.LOWER).vertical(74).contact(110).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.GR_DRAGN, new Enemy("Enemy_Green_Dragon").hp(260).atk(145).def(95).exp(53).mst(176).run(153).trap(12).chat(CanChat.YES).rope(CanRope.NO).wing(HasWing.YES).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/green_dragon.chr").fire(FireRes.YES).vertical(70).contact(120).type(Type.PALMA)); // +100 HP
			addEnemy(enemies, PS1Enemy.GR_SLIME, new Enemy("Enemy_Green_Slime").hp(18).atk(18).def(13).exp(4).mst(8).num(6).run(204).trap(12).sound(PS1Sound.ENEMY_JUMP).anim("battle/enemy_ps1/greenslime.chr").mental(Mental.LOWEST).vertical(132).contact(155).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.HORSEMAN, new Enemy("Enemy_Horseman").hp(130).atk(126).def(89).exp(30).mst(148).num(2).run(89).chat(CanChat.YES).rope(CanRope.NO).prot(CanProt.NO).special(Special.FIRE).item(HasItem.FLASH).spcpoint(-6, 40).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/horseman.chr").vertical(78).contact(110).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.LASSIC, new Enemy("Enemy_LaShiec").hp(438).atk(230).def(180).exp(0).mst(0).run(0).rope(CanRope.NO).prot(CanProt.NO).special(Special.THUNDER2).sound(PS1Sound.THUNDER).anim("battle/enemy_ps1/lassic.chr").mental(Mental.HIGHER).vertical(16).contact(110).type(Type.NONE)); // +200 HP
			addEnemy(enemies, PS1Enemy.LEECH, new Enemy("Enemy_Desert_Leech").hp(70).atk(67).def(47).exp(15).mst(47).num(4).run(165).trap(12).special(Special.HELP).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/leech.chr").mental(Mental.LOWEST).vertical(89).contact(145).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.LICH, new Enemy("Enemy_Lich").hp(60).atk(84).def(62).exp(22).mst(33).num(2).run(204).trap(12).special(Special.ROPE).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/lich.chr").vertical(84).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.MAGICIAN, new Enemy("Enemy_Magician").hp(138).atk(145).def(90).exp(32).mst(187).run(127).trap(12).special(Special.THUNDER).spcpoint(-2, 36).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/magician.chr").mental(Mental.HIGHER).vertical(86).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.MAMMOTH, new Enemy("Enemy_Mammoth").hp(180).atk(154).def(100).exp(40).mst(125).num(5).run(178).trap(15).prot(CanProt.NO).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/mammoth.chr").mental(Mental.LOWER).vertical(82).contact(110).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.MANEATER, new Enemy("Enemy_Maneater").hp(16).atk(12).def(10).exp(3).mst(13).num(5).run(255).trap(15).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/maneater.chr").mental(Mental.LOWER).vertical(116).contact(120).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.MANTICORE, new Enemy("Enemy_Manticore").hp(60).atk(53).def(44).exp(15).mst(49).num(3).run(153).trap(15).chat(CanChat.YES).rope(CanRope.NO).wing(HasWing.YES).spcpoint(-33, 55).special(Special.FIRE).sound(PS1Sound.ENEMY_JUMP).anim("battle/enemy_ps1/manticore.chr").mental(Mental.HIGHER).vertical(86).contact(130).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.MARAUDER, new Enemy("Enemy_Marauder").hp(135).atk(134).def(88).exp(30).mst(173).run(178).trap(15).prot(CanProt.NO).spcpoint(-12, 30).special(Special.THUNDER).sound(PS1Sound.ENEMY_SWEEP).anim("battle/enemy_ps1/marauder.chr").vertical(78).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.MARMAN, new Enemy("Enemy_Marshman").hp(58).atk(67).def(50).exp(14).mst(43).num(5).run(127).trap(15).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/marshman.chr").fire(FireRes.YES).vertical(110).contact(130).type(Type.PALMA)); // Changed to 5 due to space
			addEnemy(enemies, PS1Enemy.MEDUSA, new Enemy("Enemy_Medusa").hp(300).atk(166).def(103).exp(50).mst(194).run(0).prot(CanProt.NO).special(Special.PETRIFY).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/medusa.chr").mental(Mental.LOWER).vertical(80).contact(110).type(Type.NONE)); // +100 HP removed Flash
			addEnemy(enemies, PS1Enemy.N_FARMER, new Enemy("Enemy_Motavian_Teaser").hp(38).atk(37).def(37).exp(5).mst(8).num(5).run(178).talk(CanTalk.YES).chat(CanChat.YES).item(HasItem.COLA).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/nfarmer.chr").mental(Mental.HIGHER).vertical(120).contact(130).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.NESSIE, new Enemy("Enemy_Nessie").hp(93).atk(126).def(77).exp(28).mst(101).num(2).run(204).trap(12).wing(HasWing.YES).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/nessie.chr").fire(FireRes.YES).vertical(78).contact(110).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.OCTOPUS, new Enemy("Enemy_Octopus").hp(90).atk(85).def(68).exp(24).mst(64).run(191).trap(12).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/octopus.chr").special(Special.DOUBLE_ATTACK).mental(Mental.LOWER).vertical(100).contact(130).type(Type.PALMA)); // Added double attack, more xp
			addEnemy(enemies, PS1Enemy.OWL_BEAR, new Enemy("Enemy_Owl_Bear").hp(18).atk(22).def(18).exp(5).mst(12).num(4).run(153).trap(12).wing(HasWing.YES).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/owlbear.chr").vertical(83).contact(115).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.RD_DRAGN, new Enemy("Enemy_Red_Dragon").hp(275).atk(160).def(105).exp(65).mst(193).run(127).trap(15).chat(CanChat.YES).rope(CanRope.NO).wing(HasWing.YES).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/red_dragon.chr").fire(FireRes.YES).vertical(70).contact(120).type(Type.SPECIAL)); // +100 HP
			addEnemy(enemies, PS1Enemy.RD_SLIME, new Enemy("Enemy_Red_Slime").hp(29).atk(37).def(25).exp(11).mst(31).num(3).run(153).trap(15).special(Special.ROPE).sound(PS1Sound.ENEMY_JUMP).anim("battle/enemy_ps1/redslime.chr").fire(FireRes.YES).mental(Mental.LOWEST).vertical(132).contact(155).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.REAPER, new Enemy("Enemy_Reaper").hp(185).atk(135).def(102).exp(30).mst(254).run(204).trap(51).prot(CanProt.NO).special(Special.HELP).sound(PS1Sound.ENEMY_SWEEP).anim("battle/enemy_ps1/reaper.chr").vertical(78).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.ROBOTCOP, new Enemy("Enemy_RobotCop").hp(110).atk(135).def(90).exp(25).mst(156).run(102).trap(15).rope(CanRope.NO).prot(CanProt.NO).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/robotcop.chr").mental(Mental.LOWER).vertical(90).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.SACCUBUS, new Enemy("Enemy_Saccubus").hp(255).atk(150).def(250).exp(10).mst(0).run(0).rope(CanRope.NO).prot(CanProt.NO).special(Special.ROPE).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/saccubus.chr").vertical(108).contact(125).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.SANDWORM, new Enemy("Enemy_Sandworm").hp(82).atk(107).def(63).exp(20).mst(129).num(3).run(153).trap(15).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/sandworm.chr").mental(Mental.LOWEST).vertical(89).contact(145).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.SCORPION, new Enemy("Enemy_Scorpion").hp(12).atk(14).def(12).exp(4).mst(13).num(4).run(204).trap(15).wing(HasWing.YES).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps1/scorpion.chr").vertical(116).contact(140).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.SCORPIUS, new Enemy("Enemy_Scorpius").hp(22).atk(25).def(20).exp(8).mst(27).num(5).run(102).trap(15).wing(HasWing.YES).special(Special.ROPE).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps1/scorpius.chr").vertical(116).contact(140).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.SERPENT, new Enemy("Enemy_Serpent").hp(80).atk(100).def(66).exp(23).mst(96).run(178).trap(15).wing(HasWing.YES).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/serpent.chr").fire(FireRes.YES).vertical(78).contact(110).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.SHADOW, new Enemy("Enemy_Shadow").hp(165).atk(172).def(104).exp(60).mst(0).run(0).trap(12).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/shadow.chr").vertical(100).contact(120).type(Type.NONE));
			addEnemy(enemies, PS1Enemy.SHELFISH, new Enemy("Enemy_Shellfish").hp(62).atk(77).def(52).exp(16).mst(46).num(3).run(229).trap(20).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/shelfish.chr").mental(Mental.LOWER).vertical(70).contact(95).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.SKELETON, new Enemy("Enemy_Skeleton").hp(53).atk(58).def(41).exp(13).mst(25).num(5).run(204).trap(15).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/skeleton.chr").vertical(82).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.SKULL_EN, new Enemy("Enemy_Skull_Soldier").hp(57).atk(75).def(53).exp(18).mst(37).num(3).run(178).trap(12).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/skullen.chr").vertical(82).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.SORCERER, new Enemy("Enemy_Sorcerer").hp(110).atk(121).def(74).exp(26).mst(120).num(2).run(204).trap(51).spcpoint(-2, 36).special(Special.FIRE).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/sorcerer.chr").mental(Mental.HIGHER).vertical(86).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.SPHINX, new Enemy("Enemy_Sphinx").hp(78).atk(80).def(65).exp(21).mst(58).num(4).run(204).trap(12).chat(CanChat.YES).rope(CanRope.NO).wing(HasWing.YES).item(HasItem.FLASH).sound(PS1Sound.ENEMY_JUMP).anim("battle/enemy_ps1/sphinx.chr").mental(Mental.HIGHER).vertical(86).contact(130).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.STALKER, new Enemy("Enemy_Stalker").hp(79).atk(90).def(75).exp(22).mst(87).num(4).run(229).trap(15).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/stalker.chr").vertical(82).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.SWORM, new Enemy("Enemy_Monster_Fly").hp(8).atk(13).def(9).exp(2).mst(3).num(8).run(255).trap(12).wing(HasWing.YES).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps1/sworm.chr").vertical(85).contact(105).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.TARANTUL, new Enemy("Enemy_Tarantula").hp(50).atk(50).def(43).exp(10).mst(51).num(2).run(153).trap(38).chat(CanChat.YES).special(Special.ROPE).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/tarantul.chr").mental(Mental.HIGHER).vertical(115).contact(130).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.TARZIMAL, new Enemy("Enemy_Tajim").hp(125).atk(120).def(100).exp(0).mst(0).run(0).trap(12).rope(CanRope.NO).special(Special.FIRE).spcpoint(-36, 20).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_ps1/tarzimal.chr").mental(Mental.HIGHER).vertical(125).contact(135).type(Type.NONE));
			addEnemy(enemies, PS1Enemy.TENTACLE, new Enemy("Enemy_Tentacle").hp(118).atk(118).def(87).exp(31).mst(98).run(178).trap(12).special(Special.DOUBLE_ATTACK).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/tentacle.chr").mental(Mental.LOWER).vertical(100).contact(130).type(Type.PALMA)); // added Double Attack, more xp
			addEnemy(enemies, PS1Enemy.TITAN, new Enemy("Enemy_Titan").hp(190).atk(146).def(97).exp(32).mst(138).num(2).run(127).trap(33).prot(CanProt.NO).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_ps1/titan.chr").vertical(74).contact(110).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.VAMPIRE, new Enemy("Enemy_Vampire").hp(67).atk(68).def(46).exp(15).mst(71).num(2).run(204).trap(12).item(HasItem.FLASH).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/vampire.chr").vertical(64).contact(120).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.WEREBAT, new Enemy("Enemy_Werebat").hp(50).atk(37).def(35).exp(11).mst(63).num(4).run(127).trap(15).special(Special.HELP).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/werebat.chr").vertical(64).contact(120).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.WIGHT, new Enemy("Enemy_Wight").hp(50).atk(64).def(48).exp(18).mst(40).num(3).run(178).trap(12).special(Special.ROPE).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/wight.chr").vertical(84).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.WING_EYE, new Enemy("Enemy_Wing_Eye").hp(11).atk(12).def(10).exp(2).mst(6).num(6).run(127).trap(15).wing(HasWing.YES).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_ps1/wingeye.chr").vertical(83).contact(115).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.WT_DRAGN, new Enemy("Enemy_White_Dragon").hp(300).atk(180).def(104).exp(75).mst(234).run(153).trap(15).chat(CanChat.YES).rope(CanRope.NO).wing(HasWing.YES).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/white_dragon.chr").vertical(70).contact(120).type(Type.DEZORIS)); // +100 HP
			addEnemy(enemies, PS1Enemy.WYVERN, new Enemy("Enemy_Wyvern").hp(110).atk(123).def(84).exp(26).mst(125).run(127).trap(12).wing(HasWing.YES).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_ps1/wyvern.chr").fire(FireRes.YES).vertical(78).contact(110).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.ZOMBIE, new Enemy("Enemy_Zombie").hp(87).atk(108).def(58).exp(20).mst(27).num(4).run(153).trap(15).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_ps1/zombie.chr").mental(Mental.LOWEST).vertical(91).contact(110).type(Type.UNDEAD));

			// New Enemies
			addEnemy(enemies, PS1Enemy.VAMPIRE_LORD, new Enemy("Enemy_Vampire_Lord").hp(150).atk(137).def(75).exp(30).mst(183).num(4).run(127).trap(15).special(Special.CURE).sound(PS1Sound.ENEMY_BUZZ).anim("battle/enemy_new/vampire_lord.chr").vertical(64).contact(120).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.STORM_FLY, new Enemy("Enemy_Storm_Fly").hp(35).atk(50).def(31).exp(17).mst(72).num(4).run(102).trap(15).wing(HasWing.YES).special(Special.THUNDER).spcpoint(-16, 40).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_new/storm_fly.chr").vertical(85).contact(105).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.WIZARD, new Enemy("Enemy_Wizard").hp(168).atk(165).def(110).exp(52).mst(287).run(127).trap(52).special(Special.MP_DRAIN).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_new/wizard.chr").mental(Mental.HIGHER).vertical(86).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.OLIPHANT, new Enemy("Enemy_Oliphant").hp(180).atk(114).def(80).exp(35).mst(120).num(3).run(128).trap(15).prot(CanProt.NO).special(Special.FIRE).spcpoint(-15, 45).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_new/oliphant.chr").fire(FireRes.YES).vertical(82).contact(110).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.DRAINER_CRAB, new Enemy("Enemy_Drainer_Crab").hp(96).atk(50).def(66).exp(19).mst(140).num(3).run(128).trap(15).special(Special.MP_DRAIN).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_new/gold_club.chr").mental(Mental.HIGHER).vertical(78).contact(110).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.GAIA, new Enemy("Enemy_Gaia").hp(170).atk(158).def(118).exp(56).mst(178).num(2).run(191).trap(20).rope(CanRope.NO).special(Special.CURE).sound(PS1Sound.ENEMY_BREATH).anim("battle/enemy_new/gaia.chr").vertical(70).contact(110).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.SNOW_LION, new Enemy("Enemy_Snow_Lion").hp(138).atk(110).def(75).exp(31).mst(98).num(3).run(153).trap(12).chat(CanChat.YES).rope(CanRope.NO).wing(HasWing.YES).special(Special.DOUBLE_ATTACK).sound(PS1Sound.ENEMY_JUMP).anim("battle/enemy_new/snow_lion.chr").mental(Mental.HIGHER).vertical(86).contact(130).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.POISON_PLANT, new Enemy("Enemy_Poison_Plant").hp(46).atk(46).def(50).exp(14).mst(42).num(3).run(204).trap(40).special(Special.ROPE).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_new/poisonplant.chr").mental(Mental.LOWER).vertical(116).contact(120).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.GIANT_SPIDER, new Enemy("Enemy_Giant_Spider").hp(75).atk(75).def(64).exp(18).mst(76).num(3).run(153).trap(38).chat(CanChat.YES).special(Special.ROPE).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_new/giantspider.chr").mental(Mental.HIGHER).vertical(115).contact(130).type(Type.PALMA));
			addEnemy(enemies, PS1Enemy.MOTA_SHOOTER, new Enemy("Mota_Shooter").hp(59).atk(41).def(55).exp(14).mst(99).num(4).run(76).trap(40).item(HasItem.DIMATE).talk(CanTalk.YES).chat(CanChat.YES).special(Special.DOUBLE_ATTACK).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_new/mota_shooter.chr").mental(Mental.HIGHER).vertical(120).contact(130).type(Type.MOTAVIA));
			addEnemy(enemies, PS1Enemy.DEZO_PRIEST, new Enemy("Enemy_Dezo_Priest").hp(99).atk(88).def(87).exp(21).mst(121).num(3).run(127).trap(15).chat(CanChat.YES).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_new/dezo_alt.chr").special(Special.MP_DRAIN).mental(Mental.HIGHER).vertical(86).contact(110).type(Type.DEZORIS));
			addEnemy(enemies, PS1Enemy.NANO_COP, new Enemy("Enemy_Nano_Cop").hp(140).atk(165).def(103).exp(44).mst(153).num(3).run(127).trap(12).rope(CanRope.NO).prot(CanProt.NO).sound(PS1Sound.ENEMY_SHOT).anim("battle/enemy_new/nanocop.chr").special(Special.DOUBLE_ATTACK).mental(Mental.LOWER).vertical(90).contact(110).type(Type.SPECIAL));
			addEnemy(enemies, PS1Enemy.DEATH_KNIGHT, new Enemy("Enemy_Death_Knight").hp(215).atk(155).def(102).exp(39).mst(199).run(204).trap(51).rope(CanRope.NO).prot(CanProt.NO).sound(PS1Sound.ENEMY_SWEEP).anim("battle/enemy_new/death_knight.chr").vertical(78).contact(110).type(Type.UNDEAD));
			
			// Yoz new Enemies
			addEnemy(enemies, PS1Enemy.SKELETON_GUARD, new Enemy("Enemy_Skeleton_Guard").hp(85).atk(58).def(89).exp(22).mst(45).num(1).run(204).trap(15).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_new/skeleton_guard.chr").vertical(70).contact(110).type(Type.UNDEAD));
			addEnemy(enemies, PS1Enemy.REVENANT, new Enemy("Enemy_Revenant").hp(115).atk(122).def(67).exp(25).mst(65).num(3).run(153).trap(12).sound(PS1Sound.ENEMY_SPLASH).anim("battle/enemy_new/revenant.chr").mental(Mental.LOWEST).vertical(86).contact(110).type(Type.UNDEAD));			
			addEnemy(enemies, PS1Enemy.CYCLOP, new Enemy("Enemy_Cyclop").hp(220).atk(166).def(107).exp(42).mst(238).num(2).run(127).trap(33).prot(CanProt.NO).sound(PS1Sound.ENEMY_PUNCH).anim("battle/enemy_new/cyclop.chr").vertical(74).contact(110).type(Type.DEZORIS));
			
			// Xeen Enemies
			addEnemy(enemies, XeenEnemy.SEWER_SLUG, new Enemy("Slug").hp(140).atk(26).def(20).exp(5).mst(19).num(3).run(153).trap(15).special(Special.CURE).sound(PS1Sound.ENEMY_JUMP).anim("battle/xeen/Slug.chr").vertical(130).contact(150));
			addEnemy(enemies, XeenEnemy.BEHOLDER, new Enemy("Beholder").hp(180).atk(36).def(20).exp(5).mst(19).num(3).run(153).trap(15).sound(PS1Sound.ENEMY_BREATH).anim("battle/xeen/Beholder.chr").vertical(90).contact(110));

			// PSIV Enemies
			addEnemy(enemies, PS4Enemy.RED_SCORPION, new Enemy("Enemy_PSIV_Scorpion").hp(60).atk(42).def(36).exp(12).mst(39).num(4).run(204).trap(15).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps4/ps4_scorpion.chr").vertical(116).contact(140).type(Type.PALMA));			
			addEnemy(enemies, PS4Enemy.YELLOW_SCORPION, new Enemy("Enemy_PSIV_Gscorpion").hp(80).atk(50).def(44).exp(15).mst(33).num(4).run(127).trap(153).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps4/ps4_yellow_scorpion.chr").special(Special.ROPE).vertical(116).contact(140).type(Type.MOTAVIA));
			addEnemy(enemies, PS4Enemy.BLUE_SCORPION, new Enemy("Enemy_PSIV_Scorpius").hp(110).atk(75).def(60).exp(24).mst(81).num(3).run(102).trap(15).special(Special.ROPE).sound(PS1Sound.ENEMY_SHORT_BUZZ).anim("battle/enemy_ps4/ps4_blue_scorpion.chr").vertical(116).contact(140).type(Type.DEZORIS));
			
			return enemies;
		}

		
		private static void addEnemy(HashMap<GenericEnemy, Enemy> enemies, GenericEnemy enemy, Enemy enemyObj) {
			enemies.put(enemy, enemyObj);
		}
	
	
}
