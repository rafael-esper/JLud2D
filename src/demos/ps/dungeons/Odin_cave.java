package demos.ps.dungeons;

import static core.Script.screen;
import static demos.ps.oo.PSGame.*;

import java.util.List;

import core.Script;
import demos.ps.PSDungeon;
import demos.ps.oo.*;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibCHR.PS1CHR;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.PartyMember.Gender;
import demos.ps.oo.menuGUI.MenuCHR;
import demos.ps.oo.menuGUI.MenuType;
import demos.ps.oo.menuGUI.MenuType.State;
import domain.VImage;

public class Odin_cave {
	
	public static void startmap() {
		PSDungeon dungeon = PSGame.currentDungeon;
		dungeon.setRandomEnemies(0, new PS1Enemy[]{PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE});
		dungeon.setFixedEnemies(0, new PS1Enemy[]{PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE});
		dungeon.startDungeon();
	}
	
	public static void chest1() {
		PSGame.chestFlag(Chest.ODIN_CHEST1, 10, Trapped.NO_TRAP, null);
	}
	public static void chest2() {
		PSGame.chestFlag(Chest.ODIN_CHEST2, 20, Trapped.NO_TRAP, null);
	}
	
	public static void chest_compass() {
		if(PSGame.getGameType() != GameType.PS_START_AS_ODIN  && PSGame.hasFlag(Flags.GOT_ODIN)) {
			PSGame.chestFlag(Chest.ODIN_COMPASS, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Compass));
		}
		// ODIN QUEST - ALL ALIVE, LEAVES COMPASS BEHIND
		else if(PSGame.getGameType() == GameType.PS_START_AS_ODIN 
				&& PSGame.hasFlag(Flags.GOT_MYAU)
				&& !PSGame.hasFlag(Flags.ODIN_MEDUSA_COMPASS)
				&& PSGame.getParty().getMember(0).getHp() > 0
				&& PSGame.getParty().getMember(1).getHp() > 0) {
			PSMenu.StextLast(PSGame.getString("Odin_Cave_Compass"));
			PSGame.getParty().removeItem(getItem(OriginalItem.Quest_Compass));
			PSGame.setFlag(Flags.ODIN_MEDUSA_COMPASS);			
		}
	}

	public static void odin() {

		if(!PSGame.hasFlag(Flags.GOT_ODIN)) {

			MenuCHR odinStatue = new MenuCHR(140, 100, PSGame.getCHR(PS1CHR.ODIN_STATUE));
			PSMenu.instance.push(odinStatue);
			Item alsuline = getItem(OriginalItem.Quest_Alsuline);

			if(!PSGame.getParty().hasQuestItem(alsuline)) {
				PSMenu.instance.waitB1();
				PSMenu.Stext(PSGame.getString("Odin_Stone"));
				PSMenu.instance.pop(); // statue
				return;
			}

			PSMenu.instance.waitB1();

			// Alis is dead
			if(PSGame.getParty().getMember(0).getHp() <= 0) { 
				PSMenu.StextFirst(PSGame.getString("Item_Use", "<player>", PSGame.getParty().getMember(1).getName(), "<item>", alsuline.getName()));
				PSMenu.StextLast(PSGame.getString("Odin_Item_Myau"));
				PSMenu.instance.pop(); // statue
				return;
			}

			PSMenu.StextFirst(PSGame.getString("Item_Use", "<player>", PSGame.getParty().getMember(0).getName(), "<item>", alsuline.getName()));
			PSMenu.StextLast(PSGame.getString("Odin_Item_Alsulin"));
			
			PSGame.getParty().removeItem(alsuline);

			odinStatue.animate(MenuType.State.ANIM1);
			PSMenu.instance.waitAnimationEnd(odinStatue);
			odinStatue.animate(MenuType.State.ANIM2);
			PSMenu.instance.waitB1();
			
			PSMenu.instance.pop(); // statue
			
			odinCinematicScene();
			
			PSGame.setFlag(Flags.GOT_ODIN);
			PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, PSGame.getString("Name_Odin"), PS1Image.PORTRAIT_ODIN, "chars/odin.chr"));
			PSGame.getParty().getMember(2).advanceLevel();
			PSGame.getParty().getMember(2).advanceLevel();
			PSGame.getParty().getMember(2).advanceLevel();
			PSGame.getParty().getMember(2).heal();
			PSGame.getParty().setOrder(new int[]{0, 2, 1});
						
		}
		else if(PSGame.getGameType() == GameType.PS_START_AS_ODIN && PSGame.hasFlag(Flags.ODIN_MEDUSA_COMPASS)) {
			Enemy medusa = PSGame.getEnemy(PS1Enemy.MEDUSA);
			PSGame.playMusic(PS1Music.BATTLE);
			PSMenu.startScene(Scene.CORRIDOR, medusa.getChr());
			PSMenu.StextLast(getString("Odin_Cave_Medusa"));
			
			EnemyBattler attacker = new EnemyBattler(medusa);
			//MenuCHR enemySprite = new MenuCHR(160 - medusa.getChr().fxsize/2, attacker.getVerticalPos(), medusa.getChr());
			MenuCHR enemySprite = new MenuCHR(PSMenu.instance.entityX, PSMenu.instance.entityY, medusa.getChr());
			//attacker.sprite = enemySprite;
			PSMenu.instance.push(enemySprite);
			
		    playSound(attacker.getEnemy().getSound());
		    enemySprite.animate(State.ANIM2);
		    PSMenu.instance.waitAnimationEnd(enemySprite);
		    enemySprite.animate(State.READY);
		    	
			PSMenu.StextLast(getString("Odin_Cave_Stone"));
			PSGame.playSound(PS1Sound.ESCAPE);
			screen.fadeOut(50, false);
			Script.stopmusic();
			PSMenu.endScene();
			PSMenu.instance.pop();

			MenuCHR odinStatue = new MenuCHR(140, 100, PSGame.getCHR(PS1CHR.ODIN_STATUE));
			PSMenu.instance.push(odinStatue);

			PSMenu.StextFirst(getString("Odin_Cave_Alis_Help"));
			PSMenu.StextLast(PSGame.getString("Odin_Item_Alsulin"));

			odinStatue.animate(MenuType.State.ANIM1);
			PSMenu.instance.waitAnimationEnd(odinStatue);
			odinStatue.animate(MenuType.State.ANIM2);
			PSMenu.instance.waitB1();
			
			PSMenu.instance.pop(); // statue
			
			odinCinematicScene();			
			
			PSGame.setFlag(Flags.VISIT_NEKISE);
			PSGame.setFlag(Flags.VISIT_SUELO);
			PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass));
			PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Passport));
			PSGame.getParty().addMember(new PartyMember(Gender.FEMALE, Specie.PALMAN, Job.ADVENTURER, PSGame.getString("Name_Alis"), PS1Image.PORTRAIT_ALIS, "chars/alis.chr"));			
			
			// Exchanges Odin per Alis
			List<PartyMember> members = PSGame.getParty().getMembers();
			PartyMember temp = members.get(0);
			members.set(0,  members.get(2));
			members.set(2, temp);
			
			for(int i=1; i<PSGame.getParty().getMember(2).getLevel(); i++) {
				PSGame.getParty().getMember(0).advanceLevel();	
			}
			PSGame.getParty().getMember(0).equipItem(PSGame.getItem(OriginalItem.Weapon_Titanium_Sword));
			PSGame.getParty().getMember(0).equipItem(PSGame.getItem(OriginalItem.Armor_Light_Suit));
			PSGame.getParty().getMember(1).equipItem(PSGame.getItem(OriginalItem.Armor_Spiky_Fur));
			PSGame.getParty().mst+= 150;
			
			PSGame.getParty().setOrder(new int[]{0, 2, 1});
			PSGame.gameData.setGameType(GameType.PS_ORIGINAL);
			
			
		}		
		
	}
	
	private static void odinCinematicScene() {
		PSGame.playMusic(PS1Music.STORY);
		PSMenu.instance.back = new VImage(screen.width, screen.height); //.paintBlack();
		
		PSMenu.startScene(Scene.CORRIDOR, SpecialEntity.NONE);
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ODIN), new String[]{PSGame.getString("Cinematic_Odin_1")});
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{PSGame.getString("Cinematic_Odin_2")});
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ODIN), new String[]{PSGame.getString("Cinematic_Odin_3")});
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), new String[]{PSGame.getString("Cinematic_Odin_4")});
		PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ODIN), new String[]{PSGame.getString("Cinematic_Odin_5")});

		PSGame.findAndPlayMusic();
		PSMenu.endScene();
		screen.fadeOut(25, false);
	}

	public static void medusa_noise() {
		if(PSGame.getGameType() == GameType.PS_START_AS_ODIN) {
			
			if(PSGame.hasFlag(Flags.GOT_MYAU)) {
				if(!PSGame.hasFlag(Flags.ODIN_MEDUSA_HISS)) {
					PSMenu.StextLast(PSGame.getString("Odin_Cave_Hiss"));
					PSGame.setFlag(Flags.ODIN_MEDUSA_HISS);
				}
			}
			else {
				// Odin alone: fight medusa and die
				PSBattle battle = new PSBattle();
				battle.battleScene(Scene.CORRIDOR, PSGame.getEnemy(PS1Enemy.MEDUSA), 1);				
			}
			
			
		}
	}
	
	
	public static void exit() {
		PSGame.mapswitch(Planet.PALMA,78,66);
	}
}
