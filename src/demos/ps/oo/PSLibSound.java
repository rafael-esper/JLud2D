package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class PSLibSound {

	private static final Logger log = LogManager.getLogger(PSLibSound.class);

		public enum PS1Sound {

			MENU("sound/menu.wav"),
			
			ITEM("sound/b3_item.wav"),
			SPELL("sound/ab_spell.wav"),
			FLY("sound/bf_fly.wav"),
			CURE("sound/c1_heal.wav"),
			RESTHOUSE("sound/a0_rest.wav"),
			FLUTESONG("sound/c2_flute.wav"),
			REVIVE("sound/c5_revive.wav"),

			DOOR("sound/bd_door.wav"),
			STAIRS("sound/c3_stairs.wav"),
			CHEST("sound/b0_chest.wav"),
			TRAP_EXPLOSION("sound/b1_explosion.wav"),
			TRAP_ARROW("sound/b2_arrow.wav"),
			TRAP_FALL("sound/c0_fall_trap.wav"),
			LIGHT ("sound/cd_light.wav"),
			
			LANDROVER("sound/b4_landrov.wav"),
			HOVERCRAFT_MOVING("sound/b5_hover.wav"),
			TCHAC("sound/b6_tchac.wav"),
			SPACESHIP("sound/b8_spaceship.wav"),
			FLAPPING("sound/b9_broken.wav"),
			
			PLAYER_DEFAULT_ATTACK("sound/a2_pl_atk.wav"),
			LACONIA_FAIL("sound/a3_laco_fail.wav"),
			LACONIA_WEAP("sound/a4_laco_dmg.wav"),
			LASER_GUN("sound/a5_laser_gun.wav"),
			NEEDLE_GUN("sound/a7_heat_gun.wav"),

			FIRE("sound/a6_fire.wav"),
			WIND("sound/aa_wind.wav"),
			THUNDER("sound/a9_thunder.wav"),
			TELE("sound/ac_tele.wav"),

			ENEMY_DAMAGE("sound/ad_en_dmg.wav"),
			ENEMY_ROPE("sound/a1_rope.wav"),
			PLAYER_DAMAGE("sound/ae_pl_dmg.wav"),
			ENEMY_DEAD("sound/af_en_dead.wav"),
			LEVEL_UP("sound/ba_levelup.wav"),
			MISS("sound/bb_miss.wav"),
			ESCAPE("sound/bc_escape.wav"),
			BEEP("sound/be_beep.wav"),
			ENEMY_SHOT("sound/c6_en_shot.wav"),
			ENEMY_JUMP("sound/c7_en_jump.wav"),
			ENEMY_SPLASH("sound/c8_en_splash.wav"),
			ENEMY_BUZZ("sound/c9_en_buzz.wav"),
			ENEMY_SHORT_BUZZ("sound/c9_en_short_buzz.wav"),
			ENEMY_BREATH("sound/ca_en_breath.wav"),
			ENEMY_SWEEP("sound/cb_en_sweep.wav"),
			ENEMY_PUNCH("sound/cc_en_punch.wav"),
			ENEMY_MINISHOT("sound/ce_en_minishot.wav"),
			ENEMY_DRAIN("sound/cf_en_drain.wav");
			
			private String url;
			
			PS1Sound(String s) {
				this.url = s;
			}
			
			public String getUrl() {
				return this.url;
			}
		};
		
		
	
	
}
