package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.format;

import java.awt.Color;
import java.util.List;

import demos.ps.PSDungeon;
import demos.ps.oo.Enemy.CanChat;
import demos.ps.oo.Enemy.CanRope;
import demos.ps.oo.Enemy.CanTalk;
import demos.ps.oo.Enemy.Type;
import demos.ps.oo.PSBattle.Action;
import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PSLibSound.PS1Sound;
import core.Script;

public class PSEffect {

	private static final Logger log = LogManager.getLogger(PSEffect.class);

	public enum EffectTarget {NONE, MEMBER, ALIVE_MEMBER, ENEMY, ALL_MEMBERS, ALL_ENEMIES}
	public enum EffectPlace {ANY, WORLD, BATTLE};
	public enum EffectOutcome {NONE, FAIL, SUCCESS, CLOSE_ALL};
	
	public enum Effect {
		NONE 		(EffectPlace.ANY, EffectTarget.NONE),

		CURE 		(EffectPlace.ANY, EffectTarget.ALIVE_MEMBER),
		WCURE		(EffectPlace.WORLD, EffectTarget.ALIVE_MEMBER), 
		REVIVE 		(EffectPlace.WORLD, EffectTarget.MEMBER),
		F_REVIVE	(EffectPlace.ANY, EffectTarget.MEMBER),	// new
		FLY 		(EffectPlace.WORLD, EffectTarget.NONE), 
		EXIT 		(EffectPlace.WORLD, EffectTarget.NONE),
		TRAP		(EffectPlace.WORLD, EffectTarget.NONE),
		TRAP_CHEST	(EffectPlace.WORLD, EffectTarget.NONE), // hack to differentiate it from dungeon trap
		OPEN		(EffectPlace.WORLD, EffectTarget.NONE),

		RUN	 		(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES),
		TALK		(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES),
		
		ESCAPE		(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES),
		CHAT		(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES),
		TELE		(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES),

		ROPE		(EffectPlace.BATTLE, EffectTarget.ENEMY),
		ROPE_ALL	(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES),
		FEAR		(EffectPlace.BATTLE, EffectTarget.ENEMY),
		FEAR_ALL	(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES),
		FORCE		(EffectPlace.BATTLE, EffectTarget.ALIVE_MEMBER),
		WALL		(EffectPlace.BATTLE, EffectTarget.ALL_MEMBERS),
		PROT		(EffectPlace.BATTLE, EffectTarget.ALL_MEMBERS),

		FIRE		(EffectPlace.BATTLE, EffectTarget.ENEMY),
		GIFIRE		(EffectPlace.BATTLE, EffectTarget.ENEMY),
		WIND		(EffectPlace.BATTLE, EffectTarget.ENEMY),
		THUNDER 	(EffectPlace.BATTLE, EffectTarget.ALL_ENEMIES), 
		
		LIGHT		(EffectPlace.WORLD, EffectTarget.NONE), 
		MUSIC		(EffectPlace.ANY, EffectTarget.NONE),
		;

		private EffectPlace place;
		private EffectTarget target;

		Effect(EffectPlace place, EffectTarget target) {
			this.place = place;
			this.target = target;
		}
		public EffectPlace getPlace() {
			return this.place;
		}
		public EffectTarget getTarget() {
			return this.target;
		}
		
	}
	
	private Effect effect;
	private int value;

	private PartyMember user;
	private Battler target;
	private List<Battler> targets;

	
	public PSEffect(Effect effect) {
		this.setEffect(effect);
	}

	public Effect getEffect() {
		return this.effect;
	}
	public void setEffect(Effect eff) {
		this.effect = eff;
	}
	
	public void setTarget(Battler target) {
		this.target = target;
	}
	public Battler getTarget() {
		return this.target;
	}
	public void setTargets(List<Battler> battlers) {
		this.targets = battlers;
	}
	public void setUser(PartyMember user) {
		this.user = user;
	}
	public PartyMember getUser() {
		return this.user;
	}
	public void setValue(int i) {
		this.value = i;
	}

	
	
	public EffectOutcome callEffect() {
		
		if(effect.target == EffectTarget.ALIVE_MEMBER && target.getHp() <= 0) {
			PSMenu.StextTimeout(PSGame.getString("Battle_Player_Dead", "<player>", target.getName()));
			return EffectOutcome.FAIL;
		}

		switch (this.effect) {
			
			case NONE:
				return EffectOutcome.NONE;

			case LIGHT:
				if(PSGame.getCurrentDungeon().equals(Dungeon.NONE)) {
					return EffectOutcome.FAIL;
				}
				else {
					PSGame.playSound(PS1Sound.LIGHT);
					PSGame.currentDungeon.setLight();
					return EffectOutcome.CLOSE_ALL;
				}
				
			case RUN: 
			case ESCAPE:
				if(targets != null && runRoutine(targets, this.effect == Effect.RUN)) {
					return EffectOutcome.SUCCESS;
				} else {
					return EffectOutcome.NONE;					
				}
				
			case TALK:
			case CHAT:
			case TELE:
				if(targets != null && talk(targets, user, this.effect)) {
					return EffectOutcome.SUCCESS;
				} else {
					return EffectOutcome.NONE;
				}
				
				
			case CURE:	
			case WCURE:
				PSMenu.instance.waitDelay(15);
				target.setHp(Math.min(target.getHp() + value, target.getMaxHp()));
				if(((PartyMember) this.target).textBox != null) { // in battle
					((PartyMember) this.target).textBox.updateText(1, PSGame.getString("Stats_HP") + ":" + PSGame.format(target.getHp(), 4));
					PSMenu.instance.waitDelay(15);
				}
				PSGame.playSound(PS1Sound.CURE);
				PSMenu.StextTimeout(PSGame.getString("Magic_Heal", "<player>", target.getName()));
				
				return EffectOutcome.SUCCESS;
		
			case FLY:
				if(PSGame.getCurrentDungeon() == null || PSGame.getCurrentDungeon().equals(Dungeon.NONE)) {
					List<City> lstCities = City.getVisitedCitiesFromPlanet(PSGame.gameData.current_planet, PSGame.gameData.visitedCities);
					String[] strCities = new String[lstCities.size()];
					for(int i=0; i<lstCities.size(); i++) {
						strCities[i] = lstCities.get(i).toString();
					}
					
					int opt = PSMenu.Prompt(PSGame.getString("Hapsby_Travel"), strCities);
					if(opt > 0) {
						PSGame.playSound(PS1Sound.FLY);
						PSGame.gameData.onGroundVehicle = PSGame.gameData.onWaterVehicle = false;
						City chosenCity = lstCities.get(opt-1);
						PSGame.mapswitch(chosenCity.planet, chosenCity.getX(), chosenCity.getY());
						return EffectOutcome.CLOSE_ALL;
					}
				}
				return EffectOutcome.FAIL;
			
			case REVIVE:
				return revive((PartyMember) target, false);
			
			case F_REVIVE:
				return revive((PartyMember) target, true);

			case FORCE:
				target.boost = 2 + (int) (Math.random()*4);
				((PartyMember)target).textBox.updateColor(Color.CYAN);
				PSMenu.StextTimeout(PSGame.getString("Battle_Player_Up", "<player>", target.getName()));
				return EffectOutcome.SUCCESS;
			
			case ROPE:
				target = PSBattle.getTarget(user, targets);
				if(((EnemyBattler) target).getEnemy().rope == CanRope.YES) {
					target.paralyzed = Script.random(2, 4);
					PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Bind", "<monster>", target.getName()));
					target.enemyBox.updateColor(target.position, Color.YELLOW);					
					return EffectOutcome.SUCCESS;
				} else {
					return EffectOutcome.FAIL;
				}

			case ROPE_ALL:
				boolean rope = false;
				for(Battler t: targets) {
					if(t instanceof EnemyBattler) { // Fear all 'weak' enemies, except undeads
						if(((EnemyBattler) t).getEnemy().rope == CanRope.YES) {
							t.paralyzed = Script.random(2, 4);
							if(!rope) {
								PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Bind", "<monster>", t.getName()));
								rope = true;
							}
							t.enemyBox.updateColor(t.position, Color.YELLOW);
						}
					}
				}
				if(!rope) {
					return EffectOutcome.FAIL;
				}
				else {
					return EffectOutcome.SUCCESS;
				}

				
			case FEAR:
				target = PSBattle.getTarget(user, targets);
				if(target.getMaxHp() <= 100 && ((EnemyBattler)target).enemy.type != Type.UNDEAD) {
					target.weak = Script.random(3, 5);
					PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Down", "<monster>", target.getName()));
					target.enemyBox.updateColor(target.position, Color.YELLOW);					
					return EffectOutcome.SUCCESS;
				} else {
					return EffectOutcome.FAIL;
				}
				
			case FEAR_ALL:
				boolean fear = false;
				for(Battler t: targets) {
					if(t instanceof EnemyBattler) { // Fear all 'weak' enemies, except undeads
						if(t.getMaxHp() <= 133 && ((EnemyBattler)t).enemy.type != Type.UNDEAD) {
							t.weak = Script.random(3, 5);
							if(!fear) {
								PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Down", "<monster>", t.getName()));
								fear = true;
							}
							t.enemyBox.updateColor(t.position, Color.YELLOW);
						}
					}
				}
				if(!fear) {
					return EffectOutcome.FAIL;
				}
				else {
					return EffectOutcome.SUCCESS;
				}

			// These have special treatments on PSBattle code
			case WALL:
			case PROT:
			case FIRE:
			case GIFIRE:	
			case WIND:
			case THUNDER:
				return EffectOutcome.SUCCESS;

		case MUSIC:
			PSGame.playSound(PS1Sound.FLUTESONG);
			PSMenu.instance.waitDelay(90);
		case EXIT:
			if(PSGame.getCurrentDungeon().equals(Dungeon.NONE)) {
				return EffectOutcome.FAIL;
			}
			PSMenu.instance.waitDelay(30);
			PSGame.playSound(PS1Sound.FLY);
			Script.callfunction("exit");
			return EffectOutcome.CLOSE_ALL;

		case OPEN:
			if(PSGame.getCurrentDungeon().equals(Dungeon.NONE)) {
				return EffectOutcome.FAIL;
			}
			PSMenu.instance.waitDelay(30);
			PSGame.currentDungeon.setOpen();
			Script.b1 = true;
			return EffectOutcome.CLOSE_ALL;

		case TRAP:
			if(PSGame.getCurrentDungeon().equals(Dungeon.NONE)) {
				PSMenu.Stext(PSGame.getString("Dungeon_No_Trap"));
			}
			else {
				PSMenu.instance.waitDelay(30);
				if(PSGame.currentDungeon.checkTrapEffect()) {
					return EffectOutcome.SUCCESS;
				}
				else {
					PSMenu.Stext(PSGame.getString("Dungeon_No_Trap"));					
				}
			}
			return EffectOutcome.FAIL;

		case TRAP_CHEST:
			return EffectOutcome.SUCCESS;
			
		}
		
		return EffectOutcome.FAIL;
	}

	private EffectOutcome revive(PartyMember target, boolean fullRevive) {
		PSMenu.instance.waitDelay(15);
		if(this.target.getHp() <= 0) {
			if(fullRevive) {
				target.setHp(target.getMaxHp());
				target.setMp(target.getMaxMp());
			}
			else {
				target.setHp(1);
			}
			PSGame.playSound(PS1Sound.REVIVE);
			PSGame.getParty().reallocate();
			PSMenu.Stext(PSGame.getString("Magic_Ressurrect", "<player>", target.getName()));
			return EffectOutcome.SUCCESS;
		}
		else {
			return EffectOutcome.FAIL;
		}
	}

	private boolean runRoutine(List<Battler> battlers, boolean random) {
		int chanceToRun = Integer.MAX_VALUE;
		// Player: Make players make no further actions
		// Enemy: Discover which is the chance to run
		Battler blocker = null;
		for(Battler runner: battlers) {
			if(runner.getHp() <= 0) {
				continue;
			}
			if(runner instanceof PartyMember) {
				runner.action = Action.NONE;
			} else {
				if(((EnemyBattler)runner).getEnemy().run < chanceToRun) {
					chanceToRun = ((EnemyBattler)runner).getEnemy().run;
					blocker = runner;
				}
			}
		}

		if(PSGame.getCurrentDungeon() != Dungeon.NONE && PSGame.currentDungeon.deadEnd()) {
			chanceToRun = 0;
			log.info("On dead end!");
		}

		int chance = (int) (random ? 1 + Script.random(0, 255) : 1);
		
		log.info("Got " + chance + " of " + chanceToRun);
		if(chance <= chanceToRun) {
			PSGame.playSound(PS1Sound.ESCAPE);
			if(PSGame.getCurrentDungeon() == Dungeon.NONE) {
				if(PSGame.getDisplayMessages()) { // optional message
					PSMenu.StextTimeout(PSGame.getString("Battle_Run_Bye", "<monster>", blocker.getName()));
				}
			}
			else {
				Script.down = true;
			}
			return true; // Escape successful
		}
		else {
			PSMenu.StextTimeout(PSGame.getString("Battle_Run_Fail", "<monster>", blocker.getName()));
			return false; // Escape failed
		}
	}
	
	private boolean talk(List<Battler> battlers, PartyMember talker, Effect effect) {
		boolean chanceToTalk = false;
		Battler talkee = null;

		// Player: Make players make no further actions
		// Enemy: Discover if one enemy can talk
		for (Battler battler : battlers) {
			if(battler.getHp() <= 0) {
				continue;
			}
			if (battler instanceof PartyMember) {
				battler.action = Action.NONE;
				if(((PartyMember) battler).hp > 0 && talker == null) {
					talker = (PartyMember) battler;
				}
			} else {
				if(talkee == null) {
					talkee = battler;
				}
				if (effect == Effect.TALK && ((EnemyBattler) battler).getEnemy().talk == CanTalk.YES) {
					chanceToTalk = true;
				} 
				else if (((EnemyBattler) battler).getEnemy().chat == CanChat.YES) {
					
					if(battler.getMaxHp() < 100 && effect == Effect.CHAT) { 
						chanceToTalk = true;
					}
					if(effect == Effect.TELE) { // TELE is stronger					
						chanceToTalk = true;
					}
				}
			}
		}
		
		PSMenu.StextNext(PSGame.getString("Battle_Player_Speak", "<player>", talker.getName(), "<monster>", talkee.getName()));
		
		if(chanceToTalk) {

			if(effect == Effect.CHAT || effect == Effect.TELE) {
				PSGame.playSound(PS1Sound.TELE);
			}
			
			PSMenu.StextNext(PSGame.getString("Battle_Enemy_Reply", "<monster>", talkee.getName()));
			if(effect == Effect.TALK || effect == Effect.CHAT) {
				int rand = Script.random(1, 9);
				PSMenu.StextLast(PSGame.getString("Monster_Dialogue_" + rand));
			}
			else {
				int rand = Script.random(1, 10);
				PSMenu.StextLast(PSGame.getString("Monster_Tele_" + rand));
			}
			
		} else {
			PSMenu.StextLast(PSGame.getString("Battle_Enemy_No_Understand", "<player>", talker.getName(), "<monster>", talkee.getName()));			
		}

		return chanceToTalk;
	}
}
