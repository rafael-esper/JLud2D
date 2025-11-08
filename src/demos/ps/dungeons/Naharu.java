package demos.ps.dungeons;

import static core.Script.screen;
import static demos.ps.oo.PSGame.getItem;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.PSDungeon;
import demos.ps.oo.Item;
import demos.ps.oo.Job;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.PartyMember;
import demos.ps.oo.Specie;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trap;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PartyMember.Gender;
import core.Script;
import domain.VImage;

public class Naharu {

	private static final Logger log = LogManager.getLogger(Naharu.class);
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.E_FARMER, PS1Enemy.TARANTUL});
		dungeon.setRandomEnemies(-1, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.E_FARMER, PS1Enemy.N_FARMER, PS1Enemy.TARANTUL});
		
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.RD_SLIME});
		dungeon.setFixedEnemies(-1, new PS1Enemy[]{PS1Enemy.N_FARMER, PS1Enemy.E_FARMER});
				
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.NAHARU_CHEST1, 20, Trapped.NO_TRAP, null);
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.NAHARU_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
	}
	public static void chest3() {
		PSGame.chestFlag(Chest.NAHARU_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
	}
	public static void chest4() {
		PSGame.chestFlag(Chest.NAHARU_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest5() {
		PSGame.chestFlag(Chest.NAHARU_CHEST5, 0, Trapped.EXPLOSION, PSGame.getItem(OriginalItem.Inventory_Dimate));
	}
	public static void chest6() {
		PSGame.chestFlag(Chest.NAHARU_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
	}
	public static void chest7() {
		PSGame.chestFlag(Chest.NAHARU_CHEST7, 50, Trapped.NO_TRAP, null);
	}
	public static void chest8() {
		PSGame.chestFlag(Chest.NAHARU_CHEST8, 2000, Trapped.NO_TRAP, null);
	}

	public static void stairs_1_2() {
		PSGame.warp(22, 12, false);
	}
	public static void stairs_2_1() {
		PSGame.warp(9, 12, false);
	}
	public static void stairs_2_3() {
		PSGame.warp(33, 10, false);
	}
	public static void stairs_3_2() {
		PSGame.warp(18, 11, false);
	}
	
	public static void dragon() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.hasFlag(Flags.MONSTER_NAHARU_DRAGON)) {
			PSBattle battle = new PSBattle();
			outcome = battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.RD_DRAGN), 1);
			if(outcome == BattleOutcome.WIN) {
				PSGame.setFlag(Flags.MONSTER_NAHARU_DRAGON);
			}
		}
		if(outcome == BattleOutcome.WIN) {
			PSGame.chestFlag(Chest.NAHARU_CHEST9, 3000, Trapped.NO_TRAP, null);
		}
	}
	
	public static void mota() {
		PSBattle battle = new PSBattle();
		battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.N_FARMER), Script.random(2, 4));
	}
	
	public static void trap() {
		PSGame.trapRoutine(Trap.NAHARU_TRAP, Trap.INFO_NAHARU_TRAP, 21, 12);
	}
	
	public static void noah() {
		if(!PSGame.hasFlag(Flags.GOT_NOAH)) {
			PSMenu.startScene(Scene.DUNGEON, LargeEntity.NOAH);
			
			Item letter = getItem(OriginalItem.Quest_Governor_Letter);

			PSMenu.Stext(PSGame.getString("Maharu_Noah_NoLetter"));
			
			if(PSGame.getParty().hasQuestItem(letter)) {			
				PSGame.getParty().removeItem(letter);
				
				PSGame.playMusic(PS1Music.STORY);
				PSMenu.startScene(Scene.CORRIDOR, SpecialEntity.NONE);
				PSMenu.instance.back = new VImage(screen.width, screen.height); //.paintBlack();
				PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{PSGame.getString("Cinematic_Noah_1")});
				PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_NOAH), new String[]{PSGame.getString("Cinematic_Noah_2")});
		
				PSGame.setFlag(Flags.GOT_NOAH);
				PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, PSGame.getString("Name_Noah"), PS1Image.PORTRAIT_NOAH, "chars/noah.chr"));
				PSGame.getParty().getMember(3).advanceLevel();
				PSGame.getParty().getMember(3).advanceLevel();
				PSGame.getParty().getMember(3).advanceLevel();
				PSGame.getParty().getMember(3).advanceLevel();
				PSGame.getParty().getMember(3).advanceLevel();
				PSGame.getParty().getMember(3).advanceLevel();
				PSGame.getParty().getMember(3).heal();
				
				PSGame.getParty().setOrder(new int[]{0, 3, 2, 1});
				
				PSGame.findAndPlayMusic();
				PSMenu.startScene(Scene.DUNGEON, SpecialEntity.NONE);
			}
			
			PSMenu.endScene();
		}
		else {
			PSMenu.startScene(Scene.DUNGEON, SpecialEntity.NONE);
			PSMenu.instance.waitAnyButton();
			PSMenu.endScene();
		}
	}
	
	public static void exit() {
		PSGame.mapswitch(Planet.MOTAVIA,36,10);
	}
}
