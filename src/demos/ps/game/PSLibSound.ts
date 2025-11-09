/**
 * PSLibSound - Phantasy Star Sound Library
 * Direct port of PSLibSound.java - Defines all sound resources for PS demo
 */

const BASE_FOLDER = "src/demos/ps";

export enum PS1Sound {
  MENU = `${BASE_FOLDER}/sound/menu.wav`,

  ITEM = `${BASE_FOLDER}/sound/b3_item.wav`,
  SPELL = `${BASE_FOLDER}/sound/ab_spell.wav`,
  FLY = `${BASE_FOLDER}/sound/bf_fly.wav`,
  CURE = `${BASE_FOLDER}/sound/c1_heal.wav`,
  RESTHOUSE = `${BASE_FOLDER}/sound/a0_rest.wav`,
  FLUTESONG = `${BASE_FOLDER}/sound/c2_flute.wav`,
  REVIVE = `${BASE_FOLDER}/sound/c5_revive.wav`,

  DOOR = `${BASE_FOLDER}/sound/bd_door.wav`,
  STAIRS = `${BASE_FOLDER}/sound/c3_stairs.wav`,
  CHEST = `${BASE_FOLDER}/sound/b0_chest.wav`,
  TRAP_EXPLOSION = `${BASE_FOLDER}/sound/b1_explosion.wav`,
  TRAP_ARROW = `${BASE_FOLDER}/sound/b2_arrow.wav`,
  TRAP_FALL = `${BASE_FOLDER}/sound/c0_fall_trap.wav`,
  LIGHT = `${BASE_FOLDER}/sound/cd_light.wav`,

  LANDROVER = `${BASE_FOLDER}/sound/b4_landrov.wav`,
  HOVERCRAFT_MOVING = `${BASE_FOLDER}/sound/b5_hover.wav`,
  TCHAC = `${BASE_FOLDER}/sound/b6_tchac.wav`,
  SPACESHIP = `${BASE_FOLDER}/sound/b8_spaceship.wav`,
  FLAPPING = `${BASE_FOLDER}/sound/b9_broken.wav`,

  PLAYER_DEFAULT_ATTACK = `${BASE_FOLDER}/sound/a2_pl_atk.wav`,
  LACONIA_FAIL = `${BASE_FOLDER}/sound/a3_laco_fail.wav`,
  LACONIA_WEAP = `${BASE_FOLDER}/sound/a4_laco_dmg.wav`,
  LASER_GUN = `${BASE_FOLDER}/sound/a5_laser_gun.wav`,
  NEEDLE_GUN = `${BASE_FOLDER}/sound/a7_heat_gun.wav`,

  FIRE = `${BASE_FOLDER}/sound/a6_fire.wav`,
  WIND = `${BASE_FOLDER}/sound/aa_wind.wav`,
  THUNDER = `${BASE_FOLDER}/sound/a9_thunder.wav`,
  TELE = `${BASE_FOLDER}/sound/ac_tele.wav`,

  ENEMY_DAMAGE = `${BASE_FOLDER}/sound/ad_en_dmg.wav`,
  ENEMY_ROPE = `${BASE_FOLDER}/sound/a1_rope.wav`,
  PLAYER_DAMAGE = `${BASE_FOLDER}/sound/ae_pl_dmg.wav`,
  ENEMY_DEAD = `${BASE_FOLDER}/sound/af_en_dead.wav`,
  LEVEL_UP = `${BASE_FOLDER}/sound/ba_levelup.wav`,
  MISS = `${BASE_FOLDER}/sound/bb_miss.wav`,
  ESCAPE = `${BASE_FOLDER}/sound/bc_escape.wav`,
  BEEP = `${BASE_FOLDER}/sound/be_beep.wav`,
  ENEMY_SHOT = `${BASE_FOLDER}/sound/c6_en_shot.wav`,
  ENEMY_JUMP = `${BASE_FOLDER}/sound/c7_en_jump.wav`,
  ENEMY_SPLASH = `${BASE_FOLDER}/sound/c8_en_splash.wav`,
  ENEMY_BUZZ = `${BASE_FOLDER}/sound/c9_en_buzz.wav`,
  ENEMY_SHORT_BUZZ = `${BASE_FOLDER}/sound/c9_en_short_buzz.wav`,
  ENEMY_BREATH = `${BASE_FOLDER}/sound/ca_en_breath.wav`,
  ENEMY_SWEEP = `${BASE_FOLDER}/sound/cb_en_sweep.wav`,
  ENEMY_PUNCH = `${BASE_FOLDER}/sound/cc_en_punch.wav`,
  ENEMY_MINISHOT = `${BASE_FOLDER}/sound/ce_en_minishot.wav`,
  ENEMY_DRAIN = `${BASE_FOLDER}/sound/cf_en_drain.wav`
}