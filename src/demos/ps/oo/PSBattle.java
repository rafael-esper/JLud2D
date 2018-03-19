package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.screen;
import static demos.ps.oo.PSGame.format;
import static demos.ps.oo.PSGame.playSound;

import java.awt.Color;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import demos.ps.oo.BattlePosition.SceneType;
import demos.ps.oo.Enemy.CanProt;
import demos.ps.oo.Enemy.FireRes;
import demos.ps.oo.Enemy.HasItem;
import demos.ps.oo.Enemy.Special;
import demos.ps.oo.Item.EquipPlace;
import demos.ps.oo.Item.ItemType;
import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PSEffect.EffectOutcome;
import demos.ps.oo.PSEffect.EffectPlace;
import demos.ps.oo.PSEffect.EffectTarget;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibCHR.PS1CHR;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu.Cancellable;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.menuGUI.MenuCHR;
import demos.ps.oo.menuGUI.MenuLabelBox;
import demos.ps.oo.menuGUI.MenuStack;
import demos.ps.oo.menuGUI.MenuType.State;
import core.Script;
import domain.CHR;
import domain.VImage;

public class PSBattle {

	private static final Logger log = LogManager.getLogger(PSBattle.class);

	//private static final int MAX_ENEMY_NAME = 13;

	public enum Action {NONE, ATTACK, SPECIAL, MAGIC, ITEM, DEFEND};
	
	public enum BattleOutcome {WIN, DEFEAT, ESCAPE, TALK, BACK_MAIN_MENU, ROUND_START};
	
	public enum BattleMode {NORMAL, AUTO_ACTION};
	
	private SceneType sceneType = SceneType.OPEN;
	private BattleMode battleMode = BattleMode.NORMAL;
	
	public PSBattle() {
		
	}
	public PSBattle(BattleMode bm) {
		this.battleMode = bm;
	}
	
	MenuLabelBox menuEnemyLabelBox;
	int maxEnemyNameSize;
	
	static MenuCHR enemy_fire = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ENEMY_FIRE));
	static MenuCHR enemy_thunder = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.ENEMY_THUNDER));
	static MenuCHR player_fire = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.PLAYER_FIRE));
	static MenuCHR player_wind = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.PLAYER_WIND));
	static MenuCHR player_thunder = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.PLAYER_THUNDER));
	static MenuCHR player_gifire = new MenuCHR(0, 0, PSGame.getCHR(PS1CHR.PLAYER_GIFIRE));

	int wallEffect = 0;
	boolean protEffect = false;
	
	private int[] battlePositions;

	public BattleOutcome battleScene(Scene scene, Enemy enemy, int quantity) {

		Enemy[] enemies = new Enemy[quantity];
		for(int i=0; i<enemies.length; i++) {
			enemies[i] = enemy;
		}
		
		return battleScene(scene, enemies);
	}
		
	public BattleOutcome battleScene(Scene scene, Enemy[] enemies) {

		if(scene == Scene.DUNGEON || scene == Scene.CORRIDOR || scene == Scene.CAVE) {
			this.sceneType = SceneType.CLOSE;
		} else {
			this.sceneType = SceneType.OPEN;
		}
		
		PSMenu.startScene(scene, SpecialEntity.NONE);

		BattleOutcome outcome = startBattle(enemies, PS1Music.BATTLE);

		if(outcome == BattleOutcome.DEFEAT) {
			PSGame.gameOverRoutine();
		}
		
		if(PSGame.getCurrentDungeon() == Dungeon.NONE && !PSGame.isOnTransport()) {
			PSGame.getParty().reallocate();
		}
		PSMenu.endScene();
		return outcome;
	}
	
	public BattleOutcome startBattle(Enemy[] enemies, PS1Music music) {
		
		int index = 0;
		List<Battler> battlerList = new ArrayList<Battler>();
		for(PartyMember member: PSGame.getParty().getMembers()) {
			battlerList.add(member);
			member.naturalOrder = index++;
		}
		
		for(Enemy enemy: enemies) {
			EnemyBattler enemyBattler = new EnemyBattler(enemy);
			battlerList.add(enemyBattler);
			enemyBattler.naturalOrder = index++;
		}
		
		PSGame.playMusic(music);
		
		return startBattle(battlerList);
	}

	public BattleOutcome startBattle(List<Battler> battlers) {
		PSMenu.menuOff();
		boolean transportActive = PSGame.canTransport;
		PSGame.transportOff();
		
		// Discover number of enemies and size
		int numOfEnemies = 0;
		int maxSize = 0;
		maxEnemyNameSize = 0;
		for(Battler battler: battlers) {
			if(battler instanceof EnemyBattler) {
				numOfEnemies++;
				if(((EnemyBattler)battler).getEnemy().getChr().getFxsize() > maxSize) {
					maxSize = ((EnemyBattler)battler).getEnemy().getChr().getFxsize();
				}
				if(battler.getName().length() > maxEnemyNameSize) {
					maxEnemyNameSize = battler.getName().length(); 
				}
			}
		}
		battlePositions = BattlePosition.distributePositions(maxSize, numOfEnemies, sceneType);
		
		String[] textEnemies = new String[numOfEnemies];
		
		int pos = 0;
		for(Battler battler: battlers) {
			if(battler instanceof EnemyBattler) {
				Enemy enemy = ((EnemyBattler)battler).getEnemy();
				battler.position = pos;
				MenuCHR enemySprite = new MenuCHR(battlePositions[pos] - (enemy.getChr().getFxsize()/2), ((EnemyBattler) battler).getVerticalPos(), enemy.getChr());
				((EnemyBattler)battler).sprite = enemySprite;
				PSMenu.instance.push(enemySprite);
				textEnemies[pos] = format(((EnemyBattler)battler).getName(), maxEnemyNameSize, true) + " " + format(enemy.hp,3);
				
				pos++;
			}
		}

		menuEnemyLabelBox = PSMenu.instance.createLabelBox(320 - MenuStack.fontXSize*(7+maxEnemyNameSize), 5, textEnemies, false);
		PSMenu.instance.push(menuEnemyLabelBox);
		
		pos = 0;
		for(Battler battler: battlers) {
			// Associate the general enemyBox to enemy
			if(battler instanceof EnemyBattler) {
				battler.enemyBox = menuEnemyLabelBox;
			}
			else if(battler instanceof PartyMember) {
				PartyMember p = (PartyMember) battler;
				MenuLabelBox playerBox = PSMenu.instance.createLabelBox(pos*64, 195, 
						new String[]{format(p.getName(), 6, true), 
						PSGame.getString("Stats_HP") + ":" + format(p.getHp(), 4), 
						PSGame.getString("Stats_MP") + ":" + format(p.getMp(), 4)	}		
						, false);
				PSMenu.instance.push(playerBox);
				if(p.getHp() <=0) {
					playerBox.setOff();
				}
				p.textBox = playerBox;

				//Initialize attack sprite
				if(p.equipment[EquipPlace.WEAPON.ordinal()] != null) {
					battler.sprite = new MenuCHR(0, 0, p.equipment[EquipPlace.WEAPON.ordinal()].getChrWeaponAnimation());
				} else {
					battler.sprite = new MenuCHR(0, 0, CHR.loadChr("battle/weapon_ps1/Claw.chr"));
				}
				
				pos++;
			}
		}
		
		
		//sword.animate(State.END);
		//PSMenu.instance.push(sword);
		
		// START MAIN BATTLE LOOP
		BattleOutcome battleResult = BattleOutcome.ESCAPE;
		try { 
			battleResult = battleLoop(battlers);
		} catch (Exception e) {
			e.printStackTrace();
		}
		// END MAIN BATTLE LOOP		

		PSGame.findAndPlayMusic();
		
		for(int i=0; i<battlers.size(); i++) {
			PSMenu.instance.pop(); // enemySprite + playerBox
		}
		PSMenu.instance.pop(); // enemyTextBox
		
		PSMenu.menuOn();
		if(transportActive) {
			PSGame.transportOn();
		}
		
		return battleResult;
	}
	
	private BattleOutcome battleLoop(List<Battler> battlers) {
		
		int opt = 1;
		while(true) {

        	// Show player boxes
        	for(Battler b: battlers) {
        		if(b instanceof PartyMember) {
        			if(b.getHp() > 0) {
        				((PartyMember)b).textBox.setOn();
        			} else {
        				((PartyMember)b).textBox.setOff();
        			}
        		}
        	}			
			
			// MENU LOGIC
			if(opt==0 && battleMode != BattleMode.AUTO_ACTION) {
				PSMenu.instance.push(PSMenu.instance.createPromptBox(10, 10, new String[]{
						PSGame.getString("Menu_Battle_Action"),
						//PSGame.getString("Menu_Battle_Macro"),
						PSGame.getString("Menu_Battle_Talk"),
						PSGame.getString("Menu_Battle_Run")}, true));
        		opt = PSMenu.instance.waitOpt(Cancellable.FALSE) + 1;
        		PSMenu.instance.pop();
        	}

			if(opt==1 || battleMode == BattleMode.AUTO_ACTION) {
				Collections.sort(battlers, Battler.getNaturalComparator());
				BattleOutcome outcome = mainActionMenu(battlers);
				if(outcome == BattleOutcome.BACK_MAIN_MENU) {
					opt = 0;
					continue;
				} else if(outcome == BattleOutcome.TALK) {
					return outcome;
				}
			}
			
			/*else if(opt==2) { // TODO Offer other Macro options
				for(Battler b: battlers) {
					if(b instanceof PartyMember) {
						b.action = Action.ATTACK;
					}
				}
			}*/
			
			else if(opt == 2) { // TALK
				opt = 0; // Back to main menu
				PSEffect talkEffect = new PSEffect(Effect.TALK);
				Collections.sort(battlers, Battler.getNaturalComparator());
				talkEffect.setTargets(battlers);
				if(talkEffect.callEffect() == EffectOutcome.SUCCESS) {
					cleanPlayerStatus(battlers);
					Script.stopmusic();
					return BattleOutcome.TALK;
				}
			}
			
			else if(opt == 3) { // RUN
				opt = 0; // Back to main menu
				PSEffect runEffect = new PSEffect(Effect.RUN);
				runEffect.setTargets(battlers);
				if(runEffect.callEffect() == EffectOutcome.SUCCESS) {
					cleanPlayerStatus(battlers);
					Script.stopmusic();
					return BattleOutcome.ESCAPE;
				}
			}
			
			
			// CONTROL LOGIC
			setOrderOfPrecedence(battlers);
			setTargets(battlers);
			setEnemyActions(battlers);
			
			//RBP2015 Tried to solve java.util.ConcurrentModificationException by changing forEach loop with Iterator
			for(Iterator<Battler> it = battlers.iterator(); it.hasNext();) {
				Battler b = it.next();
				if(b.getHp() <=0) { // Only alive battlers attack
					continue;
				}
				// Get a new target, if current one is dead 
				if(b.target == null || b.target.getHp() <=0) {
					b.target = getTarget(b, battlers);
				}
				
				// Reduces gradually boost effect
				if(b.boost > 0) {
					b.boost--;
					if(b instanceof EnemyBattler && b.boost == 0) {
						menuEnemyLabelBox.updateColor(b.position, Color.WHITE);
					} else if(b instanceof PartyMember && b.boost == 0) {
						((PartyMember)b).textBox.updateColor(0, Color.WHITE);
						((PartyMember)b).textBox.updateColor(1, Color.WHITE);
						((PartyMember)b).textBox.updateColor(2, Color.WHITE);
					}
				}

				// Reduces gradually boost effect
				if(b.weak > 0) {
					b.weak--;
					if(b instanceof EnemyBattler && b.weak == 0 && b.paralyzed <= 0) {
						menuEnemyLabelBox.updateColor(b.position, Color.WHITE);						
					}
				}
				
				// *** Paralyzed Condition ***
				if(b.paralyzed > 0) {
					b.paralyzed--;
					if(b.paralyzed > 0) { // Still paralyzed
						if(b instanceof PartyMember) {
							PSMenu.StextTimeout(PSGame.getString("Battle_Player_Bound", "<player>", b.getName()));
						} else {
							PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Bound", "<monster>", b.getName()));
						}
					}
					else { // Finish paralyzed condition
						if(b instanceof PartyMember) {
							((PartyMember)b).textBox.updateColor(0, Color.WHITE);
							((PartyMember)b).textBox.updateColor(1, Color.WHITE);
							((PartyMember)b).textBox.updateColor(2, Color.WHITE);
							PSMenu.StextTimeout(PSGame.getString("Battle_Player_Unbound", "<player>", b.getName()));
						} else {
							menuEnemyLabelBox.updateColor(b.position, Color.WHITE);
							PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Unbound", "<monster>", b.getName()));
						}						
					}
					continue;
				}
				// END Paralyzed Condition ***

				switch(b.action) {
					case NONE: 	case DEFEND: 
						battlelog(b.getName() + " makes no action!"); 
						break;	
						
					case ATTACK: 
						this.attack(b.target, b, battlers); 
						break;
					
					case SPECIAL: 
						this.special(b.target, b, battlers); 
						break;
						
					case MAGIC:
						hideBoxesAndShowTarget(b, battlers);
						PartyMember target = (PartyMember) b.effect.getTarget(); 
						if(target != null) {
							target.textBox.setOn();
						}

						if(b.effect.getEffect().getTarget() == EffectTarget.ENEMY || 
						   b.effect.getEffect().getTarget() == EffectTarget.ALL_ENEMIES) {
							b.effect.setTargets(battlers);
						}
						
						EffectOutcome outcome = PSLibSpell.castSpell(b.usedSpell, b.effect);

						if(b.effect.getEffect() == Effect.ESCAPE && outcome == EffectOutcome.SUCCESS) {
							cleanPlayerStatus(battlers);
							return BattleOutcome.ESCAPE;
						}
						
						if(b.effect.getEffect() == Effect.WALL && outcome == EffectOutcome.SUCCESS) {
							PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Spell"));
							wallEffect = Math.max(wallEffect, Script.random(2, 5));
						}
						if(b.effect.getEffect() == Effect.PROT && outcome == EffectOutcome.SUCCESS) {
							PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Spell"));
							wallEffect = Math.max(wallEffect, Script.random(2, 5));
							protEffect = true;
						}
						
						if(b.effect.getEffect() == Effect.FIRE && outcome == EffectOutcome.SUCCESS) {
				        	hideBoxesAndShowTarget(b, battlers);
				        	for(int i=0; i<2 && b.target.getHp() > 0; i++) {
					        	playerAttackAnimation(b, b.target, player_fire, 0, PS1Sound.FIRE);
					        	spellDamage(b, b.target, Effect.FIRE, 8, 15);  // Original: 7-11, now: 8-15
				        	}
						}
						if(b.effect.getEffect() == Effect.GIFIRE && outcome == EffectOutcome.SUCCESS) {
				        	hideBoxesAndShowTarget(b, battlers);
				        	playerAttackAnimation(b, b.target, player_gifire, 0, PS1Sound.FIRE);
				        	spellDamage(b, b.target, Effect.GIFIRE, 48, 64);
						}
						if(b.effect.getEffect() == Effect.WIND && outcome == EffectOutcome.SUCCESS) {
				        	hideBoxesAndShowTarget(b, battlers);
				        	for(int i=0; i<3; i++) {
					        	playerAttackAnimation(b, b.target, player_wind, 0, PS1Sound.WIND);
					        	spellDamage(b, b.target, Effect.WIND, 15, 20); // Original 9-12, now: 15-20
								b.target = getTarget(b, battlers);
								if(b.target==null) {
									break;
								}
				        	}
						}
						if(b.effect.getEffect() == Effect.THUNDER && outcome == EffectOutcome.SUCCESS) {
				        	hideBoxesAndShowTarget(b, battlers);
							for(Integer naturalIndex: Battler.getNaturalOrder(battlers)) {
								Battler bTarget = battlers.get(naturalIndex);
								if(bTarget instanceof EnemyBattler && bTarget.getHp() > 0) {
									playerAttackAnimation(b, bTarget, player_thunder, 0, PS1Sound.THUNDER);
									spellDamage(b, bTarget, Effect.THUNDER, 25, 60); // Original: 30-40, now 25-60
								}
							}
						}
						
						break;
						
					case ITEM:
						hideBoxesAndShowTarget(b, battlers);
						PartyMember itarget = (PartyMember) b.effect.getTarget(); 
						if(itarget != null) {
							itarget.textBox.setOn();
						}

						if(b.effect.getEffect().getTarget() == EffectTarget.ENEMY || 
								   b.effect.getEffect().getTarget() == EffectTarget.ALL_ENEMIES) {
									b.effect.setTargets(battlers);
						}						

						if(b.effect != null) {
							PSMenu.StextTimeout(PSGame.getString("Item_Use", "<item>", b.usedItem.getName(), "<player>", b.getName()));
							outcome = b.effect.callEffect();
							if(outcome == EffectOutcome.NONE || outcome == EffectOutcome.FAIL) {
								PSMenu.StextLast(PSGame.getString("Item_NoEffect"));
							} else if (b.usedItem.getCost() > 0) { 
								((PartyMember)b).items.remove(b.usedItem);
							}
							
							if(b.effect.getEffect() == Effect.ESCAPE && outcome == EffectOutcome.SUCCESS) {
								cleanPlayerStatus(battlers);
								return BattleOutcome.ESCAPE;
							}							
						}
						
						break;
				}
				
				if(!checkOnePlayerAlive(battlers)) {
					battlelog("Battle lost!");
					return BattleOutcome.DEFEAT;
				} else
				if(!checkOneEnemyAlive(battlers)) {
					battleWonRoutine(battlers);
					cleanPlayerStatus(battlers);
					return BattleOutcome.WIN;			
				}
			}
		}
	}
	
	
	private void spellDamage(Battler attacker, Battler defenser, Effect effect, int min, int max) {
		int damage = Script.random(min, max); 
		int mentalDiff = (attacker.getMental() - defenser.getMental()) / 20;
		damage += mentalDiff; 
		if(damage <= 0) {
			damage = 1;
		}
		
		if(defenser instanceof EnemyBattler && (effect.equals(Effect.FIRE) || effect.equals(Effect.GIFIRE))) {
			if(((EnemyBattler)defenser).getEnemy().fire.equals(FireRes.YES)) {
				battlelog("Fire resistance! Damage " + damage + " is going to be diminished.");
				damage = damage / 4;
			}
		}
		
		battlelog(attacker.getName() + " uses Spell causing " + damage + " damage on " + defenser.getName());		
		this.hit(defenser, -damage);		

		
	}
	private BattleOutcome mainActionMenu(List<Battler> battlers) {

		List<PartyMember> members = new ArrayList<PartyMember>();
		for(Battler b: battlers) {
			if(b instanceof PartyMember && ((PartyMember) b).hp > 0 && b.paralyzed <= 0) {
				members.add((PartyMember) b);
			}
		}
		int currentMember = 0;
		boolean gotoNextChar = false;
		while(currentMember < members.size()) {
			
			PartyMember p = members.get(currentMember);
			
			PSMenu.instance.push(PSMenu.instance.createPromptBox(5, 5, new String[]{
					PSGame.getString("Menu_Battle_Attack"),
					PSGame.getString("Menu_Battle_Magic"),
					PSGame.getString("Menu_Battle_Item"),
					PSGame.getString("Menu_Battle_Defend")}, false));
			PSMenu.instance.push(PSMenu.instance.createLabelBox(6, 77, new String[]{" " + format(p.getName(), 6, true)}, true));
			//PSMenu.instance.push(PSMenu.instance.createLabelBox(10, 82, new String[]{members.get(currentMember).getName()}, true));
			int actionOpt = PSMenu.instance.waitOpt(Cancellable.TRUE) + 1;
			
			if(actionOpt == 0) {
				PSMenu.instance.pop();
				PSMenu.instance.pop();

				if(currentMember == 0) {
					return BattleOutcome.BACK_MAIN_MENU;
				} else {
					currentMember--;
					continue;
				}
			}
			
			if(actionOpt == 1) {
				p.action = Action.ATTACK;
				gotoNextChar = true;
			} 
			else if(actionOpt == 2) {
				p.action = Action.MAGIC;

				if(p.getSpells(EffectPlace.BATTLE).size() == 0) {
					PSMenu.Stext(PSGame.getString("Magic_NotLearned", "<player>", p.getName()));
					gotoNextChar = false;
				}
				else {
					PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, p.listSpells(EffectPlace.BATTLE), true));
					int chosenSpell = PSMenu.instance.waitOpt(Cancellable.TRUE);
					if(chosenSpell != -1) {
						p.usedSpell = p.getSpells(EffectPlace.BATTLE).get(chosenSpell);
						p.effect = PSLibSpell.prepareSpell(p.usedSpell, p);
						
						// Special code to treat chat/tele interruption
						if(p.effect != null && (p.effect.getEffect() == Effect.CHAT || p.effect.getEffect() == Effect.TELE)) {
							p.effect.setTargets(battlers);
							EffectOutcome outcome = PSLibSpell.castSpell(p.usedSpell, p.effect);
							PSMenu.instance.pop();
							PSMenu.instance.pop();
							PSMenu.instance.pop();
							if(outcome == EffectOutcome.SUCCESS) {
								cleanPlayerStatus(battlers);
								return BattleOutcome.TALK;
							}
							else {
								return BattleOutcome.ROUND_START;
							}
						}
						// End code

						gotoNextChar = (p.effect!=null);
						
					} else {
						gotoNextChar = false;
					}
					PSMenu.instance.pop();
				}

			} 
			else if(actionOpt == 3) {
				p.action = Action.ITEM;
			
				if(p.items.size() == 0) {
					PSMenu.Stext(PSGame.getString("Menu_No_Items", "<player>", p.getName()));
					gotoNextChar = false;
				}
				else {
					// Item list
					PSMenu.instance.push(PSMenu.instance.createPromptBox(80, 30, Item.toString(p.items, false), true));
					int optItem = PSMenu.instance.waitOpt(Cancellable.TRUE);
					
					if(optItem >= 0) {
						p.usedItem = p.items.get(optItem);
						p.effect = PSLibItem.prepareItem(p.usedItem, p);
						
						gotoNextChar = (p.effect!=null);	
					}
					else {
						gotoNextChar = false;
					}
					PSMenu.instance.pop(); // item list
				}
			} 
			else if(actionOpt == 4) {
				p.action = Action.DEFEND;
				gotoNextChar = true;
			}

			PSMenu.instance.pop();
			PSMenu.instance.pop();
			
			if(gotoNextChar) {
				currentMember++;
			}
			
		}
		return BattleOutcome.ROUND_START;
	}


	private void cleanPlayerStatus(List<Battler> battlers) {
		for(Battler b: battlers) {
			b.clean();
		}
		this.wallEffect = 0;
		protEffect = false;
	}

	void attack(Battler defenser, Battler attacker, List<Battler> allBattlers)
	{
		battlelog(attacker.getName() + " is attacking " + defenser.getName() + ": ");	

			int ap = attacker.getAtk();
			if (attacker.boost > 0) {
	        	ap *= 1.5;	        	
	        }
			if (attacker.weak > 0) {
	        	ap *= 0.75;	        	
	        }
			
	        int dp = defenser.getDef();
			if (defenser.action == Action.DEFEND && defenser.paralyzed <=0) {
	        	dp *= 1.5;	        	
	        }
			
	        ap *= (1 - 0.25*Math.random()); // reduce AP by up to 25%
	        dp *= (1 - 0.25*Math.random()); // reduce DP by up to 25%

	        // Cheat
	        //if(attacker instanceof PartyMember) ap*=10;
	        //if(defenser instanceof PartyMember) dp*=10;
	        
	        int amount = ap - dp;
	        
	        // Attack animation
	        boolean isCritical = false;
	        if(attacker instanceof EnemyBattler) {

	        	hideBoxesAndShowTarget(defenser, allBattlers);

	        	if(wallEffect > 0) {
	        		wallEffect--;
	        		if(wallEffect <= 0 || ((EnemyBattler) attacker).getEnemy().prot == CanProt.NO) {
	        			PSMenu.StextTimeout(PSGame.getString("Battle_Wall_End"));
	        			wallEffect = 0;
	        			protEffect = false;
	        		}
	        	}
	        	
	        	// Enemy animation attack
	        	enemyAnimationAttack(attacker);
	        	
	        	if(wallEffect > 0) {
	        		PSGame.playSound(PS1Sound.MISS);
	        		PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Dodge", "<monster>", attacker.getName()));
	        		return;	        			
	        	}
	        	
	        } else {
	        	// Hide boxes and show player's attacking
	        	hideBoxesAndShowTarget(attacker, allBattlers);
	        	
	        	Item weapon = ((PartyMember)attacker).equipment[EquipPlace.WEAPON.ordinal()];
	        	if(weapon!=null && weapon.type == ItemType.PISTOL) {

	        		for(Integer naturalIndex: Battler.getNaturalOrder(allBattlers)) {
						Battler shooted = allBattlers.get(naturalIndex);
	        			if(shooted instanceof EnemyBattler && ((EnemyBattler) shooted).hp > 0) {
	        				playerAttackAnimation(attacker, shooted, attacker.getSprite(), 0, weapon.weaponSound);
	        				hit(shooted, -weapon.itemstat /2); // Pistols have 18/32/50 modifiers and inflict 8/16/25 damage
		        		}
	        		}
	        		return;
	        	}
	        	
	        	// Else, normal attack
	        	isCritical = playerAttackAnimation(attacker, defenser, attacker.getSprite(), -20, weapon==null ? null : weapon.weaponSound);
	        }
	        
	        if (amount > 0) { // very strong attacker
	        	battlelog("strong:");
	        	hit(defenser, isCritical ? -amount*2 : -amount);
	        }
	        else if (amount > -10) { // less strong attacker
	        	battlelog("medium:");
	        	weakHit(defenser, attacker);
	        }
	        else
	        {	battlelog("weak:");
	        	// weak attacker: 50% chance of a weak hit
	        	if (Math.abs(amount) % 2 == 1) {
	        		battlelog("almost miss");
	        		weakHit(defenser, attacker);
	        	}
	        	else {
	        		miss(defenser, attacker);
	        	}
	        }
	}

	private void enemyAnimationAttack(Battler attacker) {
    	playSound(((EnemyBattler) attacker).enemy.attackSound);
    	((EnemyBattler) attacker).sprite.animate(State.ANIM2);
    	PSMenu.instance.waitAnimationEnd(((EnemyBattler) attacker).sprite);
    	((EnemyBattler) attacker).sprite.animate(State.READY); // Back to idle state
	}
	
	// Animation with player attack routine
	private boolean playerAttackAnimation(Battler attacker, Battler defenser, MenuCHR animation, int xAdj, PS1Sound sound) {
    	boolean isCritical = Script.random(0, 1000) < (attacker.getStr() - defenser.getStr());
    	if(isCritical) {
    		PSMenu.instance.push(PSMenu.instance.createCenteredLabelBox(battlePositions[defenser.position], 
    				((EnemyBattler) defenser).getContactPos(), PSGame.getString("Battle_Critical_Hit"), true));
        	PSMenu.instance.waitDelay(20);
        	if(sound != null) {
        		PSGame.playSound(sound);
        	} else {
        		PSGame.playSound(PS1Sound.PLAYER_DEFAULT_ATTACK);
        	}
        	PSMenu.instance.waitDelay(10);
        	PSMenu.instance.pop();
    	}    	

		if(sound != null) {
    		PSGame.playSound(sound);
    	} else {
    		PSGame.playSound(PS1Sound.PLAYER_DEFAULT_ATTACK);
    	}
    	
    	PSMenu.instance.push(animation);
    	animation.changePosition(battlePositions[defenser.position]+xAdj, ((EnemyBattler) defenser).getContactPos());
    	animation.animate(State.ANIM2);
    	PSMenu.instance.waitAnimationEnd(animation);
    	animation.animate(State.END);
    	PSMenu.instance.pop();
    	return isCritical;
	}

	private void hideBoxesAndShowTarget(Battler target, List<Battler> allBattlers) {
    	// Hide boxes and show player's attacked
    	for(Battler b: allBattlers) {
    		if(b instanceof PartyMember) {
    			if(!b.equals(target)) {
    				((PartyMember)b).textBox.setOff();
    			} else {
    				((PartyMember)b).textBox.setOn();
    			}
    		}
    	}
    	PSMenu.instance.waitDelay(15);
	}


	void weakHit(Battler defenser, Battler attacker)
	{
		int i = (int) (Math.min(32, attacker.getLevel()+1) * Math.random()); // random from 0 to 31
		hit(defenser, -1 - i); // attack by a small amount, no more than -1 - p.level
	}

	void hit(Battler defenser, int amount)
	{
		defenser.setHp(defenser.getHp() + amount);
		battlelog(defenser.getName() + " get damage: " + amount);
		
	    if (defenser.getHp() < 0) {
	      		defenser.setHp(0);
	    }
	        
	    // Hit animation
	    if(defenser instanceof EnemyBattler) {    
        	PSGame.playSound(PS1Sound.ENEMY_DAMAGE);
	    	((EnemyBattler) defenser).sprite.animate(State.ANIM1);
        	PSMenu.instance.waitAnimationEnd(((EnemyBattler) defenser).sprite);
        	((EnemyBattler) defenser).sprite.animate(State.READY); // Back to idle state
        	menuEnemyLabelBox.updateText(defenser.position, format(defenser.getName(), maxEnemyNameSize, true) + " " + format(defenser.getHp(),3));
	    } else {
	    	((PartyMember) defenser).textBox.updateText(1, PSGame.getString("Stats_HP") + ":" + format(defenser.getHp(), 4));
	    	PSMenu.instance.drawMenus();
	    	
	    	PSGame.playSound(PS1Sound.PLAYER_DAMAGE);
	    	earthquakeEffect(amount);
	    }
	        
	    if (defenser.getHp() <= 0) {
	      	killed(defenser);
	    }
	}
	
	private void earthquakeEffect(int amount) {
    	if(Script.TEST_SIMULATION) {
    		return;
    	}
		VImage tempScreen = new VImage(screen.width, screen.height);
    	tempScreen.blit(0, 0, screen);
    	int quakeAmount = 1 + (-amount / 10);
    	for(int i=0;i<12;i++) {
    		screen.blit(Script.random(-quakeAmount, quakeAmount), Script.random(-quakeAmount, quakeAmount), tempScreen);
    		Script.showpage();
    	}
	}
	
	void miss(Battler defenser, Battler attacker) {

		PSGame.playSound(PS1Sound.MISS);
		if(!PSGame.getDisplayMessages()) {
			PSMenu.instance.waitDelay(15);
			return;
		}
		if(defenser instanceof PartyMember) {
			PSMenu.StextTimeout(PSGame.getString("Battle_Player_Dodge", "<player>", defenser.getName(), "<monster>", attacker.getName()));			
		}
		else {
			PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Dodge", "<monster>", defenser.getName(), "<player>", attacker.getName()));
		}
	}
	
	void killed(Battler e) {
		if(e instanceof EnemyBattler) {
			((EnemyBattler)e).sprite.animate(State.END);
			battlelog(e.getName() + " is dead!");
        	menuEnemyLabelBox.updateColor(e.position, Color.RED);
			PSGame.playSound(PS1Sound.ENEMY_DEAD);
		} else {
			PSMenu.StextTimeout(PSGame.getString("Battle_Player_Died", "<player>", e.getName()));
			((PartyMember)e).textBox.updateColor(Color.RED);
			((PartyMember)e).textBox.setOff();
		}
	}	
	
	private void special(Battler target, Battler b, List<Battler> battlers) {
		
		Special special = ((EnemyBattler) b).getEnemy().special;
		
		if(special == Special.CURE) {
			
			PSGame.playSound(PS1Sound.ENEMY_ROPE);
			b.setHp((int) Math.min(b.getMaxHp(), b.getHp() + Math.max(20, Math.random()*b.getMaxHp()/2)));
			menuEnemyLabelBox.updateText(b.position, format(b.getName(), maxEnemyNameSize, true) + " " + format(b.getHp(),3));
			PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Stamina", "<monster>", b.getName()));
			battlelog(b.getName() + " uses Cure! Current HP: " + b.getHp() + "/" + b.getMaxHp());
			
		} else if (special == Special.HELP){

			PSGame.playSound(PS1Sound.ENEMY_ROPE);
			b.boost = Script.random(3, 5);
			menuEnemyLabelBox.updateColor(b.position, Color.CYAN);
			PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Up", "<monster>", b.getName()));
			
		} else if (special == Special.PETRIFY) {
			this.attack(b.target, b, battlers);
			boolean hasPetrifyProtection = false;
			for(PartyMember p: PSGame.getParty().getMembers()) {
				int place = Item.EquipPlace.COVER.ordinal();
				if(p.equipment[place] != null && p.equipment[place].equals(PSGame.getItem(OriginalItem.Shield_Mirror_Shield))) {
					hasPetrifyProtection = true;
				}
			}
			if(!hasPetrifyProtection) {
				b.target.setHp(0);
				((PartyMember)b.target).textBox.updateColor(Color.RED);
				((PartyMember)b.target).textBox.updateText(1, PSGame.getString("Stats_HP") + ":" + format(b.target.getHp(), 4));
		    	PSMenu.instance.drawMenus();
				PSMenu.StextTimeout(PSGame.getString("Battle_Player_Stone", "<player>", b.target.getName()));
			}
			
		} else if(special == Special.MP_DRAIN) {
			PartyMember drained = (PartyMember) b.target;
			hideBoxesAndShowTarget(drained, battlers);
			((EnemyBattler) b).sprite.animate(State.ANIM3); // Enemy special attack animation
        	
			PSGame.playSound(PS1Sound.ENEMY_SPLASH);
        	PSMenu.instance.waitAnimationEnd(((EnemyBattler) b).sprite);				

			drained.mp-= (Script.random(12, 20) * drained.getMp() / 100);
			drained.textBox.updateText(2, PSGame.getString("Stats_MP") + ":" + format(drained.getMp(), 4));
	    	PSMenu.instance.drawMenus();
			PSMenu.StextTimeout(PSGame.getString("Battle_Enemy_Drain_MP", "<monster>", b.getName()));
			
		} else if (special == Special.ROPE){
			
			PSGame.playSound(PS1Sound.ENEMY_ROPE);
			b.target.paralyzed = Script.random(2, 4);
			((PartyMember)b.target).textBox.updateColor(Color.YELLOW);
			PSMenu.StextTimeout(PSGame.getString("Battle_Player_Bind", "<player>", b.target.getName()));
			battlelog(b.getName() + " uses Rope! " + b.target.getName() + " is Paralyzed: " + b.target.paralyzed);
			
		} else if (special == Special.FIRE) {
			
			battlelog(b.getName() + " uses Fire!");
			for(int i=0; i<2 && b.target.getHp() > 0; i++) {
				hideBoxesAndShowTarget(b.target, battlers);
				((EnemyBattler) b).sprite.animate(State.ANIM3); // Enemy special attack animation
	        	
				PSGame.playSound(PS1Sound.FIRE);
	        	PSMenu.instance.push(enemy_fire);
	        	int shiftx = ((EnemyBattler) b).getEnemy().specialShiftX;
	        	int shifty = ((EnemyBattler) b).getEnemy().specialShiftY;
	        	enemy_fire.changePosition(battlePositions[b.position]+shiftx, ((EnemyBattler) b).getVerticalPos()+shifty);
	        	enemy_fire.animate(State.ANIM2);
	
	        	PSMenu.instance.waitAnimationEnd(((EnemyBattler) b).sprite);
	        	((EnemyBattler) b).sprite.animate(State.READY); // Back to idle state
	        	
	        	enemy_fire.animate(State.END);
	        	PSMenu.instance.pop();
	        	if(protEffect && wallEffect > 0) {
	        		PSGame.playSound(PS1Sound.MISS);
	        		PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Deflect", "<monster>", b.getName()));					
				}
	        	else {
	        		spellDamage(b, b.target, Effect.FIRE, 8, 15);
	        	}
			}
			
		} else if (special == Special.THUNDER) {
					
			for(Integer naturalIndex: Battler.getNaturalOrder(battlers)) {
				Battler bTarget = battlers.get(naturalIndex);
				if(bTarget instanceof PartyMember && bTarget.getHp() > 0) {

					hideBoxesAndShowTarget(bTarget, battlers);
					((EnemyBattler) b).sprite.animate(State.ANIM3); // Enemy special attack animation
		        	
					PSGame.playSound(PS1Sound.THUNDER);
		        	PSMenu.instance.push(enemy_thunder);
		        	int shiftx = ((EnemyBattler) b).getEnemy().specialShiftX;
		        	int shifty = ((EnemyBattler) b).getEnemy().specialShiftY;		        	
		        	enemy_thunder.changePosition(battlePositions[b.position]+shiftx, ((EnemyBattler) b).getVerticalPos()+shifty);
		        	enemy_thunder.animate(State.ANIM2);

		        	PSMenu.instance.waitAnimationEnd(((EnemyBattler) b).sprite);
		        	((EnemyBattler) b).sprite.animate(State.READY); // Back to idle state

		        	enemy_thunder.animate(State.END);
		        	PSMenu.instance.pop();					

		        	if(protEffect && wallEffect > 0) {
		        		PSGame.playSound(PS1Sound.MISS);
		        		PSMenu.StextTimeout(PSGame.getString("Battle_Wall_Deflect", "<monster>", b.getName()));					
					}
		        	else {
		        		spellDamage(b, bTarget, Effect.THUNDER, 25, 60);
		        	}
				}
			}
			
		} else if (special == Special.THUNDER2) {
			
			for(Integer naturalIndex: Battler.getNaturalOrder(battlers)) {
				Battler bTarget = battlers.get(naturalIndex);
				if(bTarget instanceof PartyMember && bTarget.getHp() > 0) {
					hideBoxesAndShowTarget(bTarget, battlers);

					enemyAnimationAttack(b);
					if(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Damoa_Crystal))) {
						spellDamage(b, bTarget, Effect.THUNDER, 60, 100);	
					}
					else {
						spellDamage(b, bTarget, Effect.THUNDER, 150, 300);						
					}
					
					//this.attack(bTarget, b, battlers);
					//int damage = (int) (10 + Math.random()*150); 
					//this.hit(bTarget, -damage);
					//log.info(b.getName() + " uses Thunder2 causing " + damage + " damage on " + bTarget.getName());
				}
			}
		}
		else if(special == Special.DOUBLE_ATTACK) {
			this.attack(b.target, b, battlers);	
			b.target = getTarget(b, battlers);
			if(b.target != null) {
				this.attack(b.target, b, battlers);
			}
		}
		
		
	}

	private void battleWonRoutine(List<Battler> battlers) {
		Collections.sort(battlers, Battler.getNaturalComparator());
		Item item = null;
		int gainedExp = 0, gainedMst = 0;
		for(Battler b: battlers) {
			if(b instanceof EnemyBattler) {
				gainedExp+= ((EnemyBattler)b).getEnemy().exp;
				gainedMst+= ((EnemyBattler)b).getEnemy().mst;
				if(((EnemyBattler)b).getEnemy().item == HasItem.COLA) {
					item = PSGame.getItem(OriginalItem.Inventory_Monomate);
				} else if(((EnemyBattler)b).getEnemy().item == HasItem.DIMATE) {
					item = PSGame.getItem(OriginalItem.Inventory_Dimate);
				} else if(((EnemyBattler)b).getEnemy().item == HasItem.FLASH) {
					item = PSGame.getItem(OriginalItem.Inventory_Flash);
				}
			} else {
				if(b.getHp() > 0) {
					((PartyMember)b).textBox.setOn();
				}
			}
		}
		Script.stopmusic();
		if(gainedMst > 0 || gainedExp > 0) {
			PSMenu.Stext(PSGame.getString("Battle_Won", "<number1>", Integer.toString(gainedExp), "<number2>", Integer.toString(gainedMst)));
			if(PSGame.getParty() != null) {
				PSGame.getParty().mst+= gainedMst;
			}
		}
		
		// Add XP
		if(gainedExp > 0) {
			for(Battler b: battlers) {
				if(b instanceof PartyMember && b.getHp() > 0) {
					PartyMember p = (PartyMember) b;
					p.giveExp(gainedExp);
				}
			}
		}
		
		// 1/3 chance of getting an item
		if(item != null && Script.random(1, 3) == 1) {
			PSGame.chest(0, Trapped.NO_TRAP, item);
		}
		
	}

	private static boolean checkOneEnemyAlive(List<Battler> battlers) {
		for(Battler b: battlers) {
			if(b instanceof EnemyBattler && b.getHp() > 0) {
				return true;
			}
		}
		return false;
	}

	private static boolean checkOnePlayerAlive(List<Battler> battlers) {
		for(Battler b: battlers) {
			if(b instanceof PartyMember && b.getHp() > 0) {
				return true;
			}
		}
		return false;
	}

	public static void setOrderOfPrecedence(List<Battler> battlers) {
	
		battlelog("Precedences:");
		for(Battler b: battlers) {
			b.precedence = (int) (Math.random() * b.getAgi());
			if(b.getHp()>0) 
				battlelog("[" + b.getName() + ": " + b.precedence + "]");
		}
		battlelog("");

		Collections.sort(battlers, Battler.getPrecedenceComparator());
	}
	
	public static void setTargets(List<Battler> battlers) {
		
		for(Battler b: battlers) {

			// RBP2015 Trying to fix Battler is dead, can't attack anyone
//			if(b.getHp() <=0) {
//				b.target = null;
//				continue;
//			}

			b.target = getTarget(b, battlers);
		}
	}


	// Get random target for attacker
	public static Battler getTarget(Battler attacker, List<Battler> battlers) {
		int rand = (int) (Math.random() * battlers.size());
		for(int i=0; i<battlers.size(); i++) {
			Battler target = battlers.get((rand+i)%battlers.size());
			
			if(attacker instanceof PartyMember && target instanceof EnemyBattler && target.getHp() > 0) {
				return target;
			}
			if(attacker instanceof EnemyBattler && target instanceof PartyMember && target.getHp() > 0) {
				return target;
			}
		}
/*		// Avoid player x player and enemy x enemy, and attacking dead target
		while((attacker instanceof PartyMember && battlers.get(target) instanceof PartyMember) ||
			  (attacker instanceof EnemyBattler && battlers.get(target) instanceof EnemyBattler) ||
			  (battlers.get(target).getHp() <=0)) {
			target = (int) (Math.random() * battlers.size());	
		}
		return battlers.get(target);*/
		return null;
	}

	private void setEnemyActions(List<Battler> battlers) {
		
		for(Battler b: battlers) {
		
			if(b instanceof PartyMember) {
				continue;
			}

			EnemyBattler eb = ((EnemyBattler) b);
			switch(eb.getEnemy().special) {
				case NONE: 
					eb.action = Action.ATTACK; 
					break;

				case PETRIFY: // Medusa: always petrifies
				case THUNDER2: // Lassic: always attacks all
				case DOUBLE_ATTACK: // Darkfalz: always double attacks
					eb.action = Action.SPECIAL;
					break;
					
				case MP_DRAIN:
					if(eb.target!=null && ((PartyMember) eb.target).getMp() > 0 && Script.random(1, 3) == 1) {
						eb.action = Action.SPECIAL;
					} else {
						eb.action = Action.ATTACK;
					}
					break;
				
				case CURE: 
					if(eb.getHp() < eb.getMaxHp() && Script.random(1, 3) == 1) {
							eb.action = Action.SPECIAL;
					} else {
						eb.action = Action.ATTACK;
					}
					break;
				
				case HELP:
					if(eb.boost==0 && Script.random(1, 4) == 1) {
						eb.action = Action.SPECIAL;
					} else {
						eb.action = Action.ATTACK;
					}
					break;
					
				default: 
					if(Script.random(1, 4) == 1) {
						eb.action = Action.SPECIAL;
					} else {
						eb.action = Action.ATTACK;
					}
			}
		}
	}
	
	public static void battlelog(String s) {
		log.debug(s);
	}
	
}

