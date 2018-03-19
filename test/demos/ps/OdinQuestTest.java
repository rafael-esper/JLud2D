

package demos.ps;

import static core.Script.TEST_OPTIONS;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;

import java.io.File;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import demos.ps.dungeons.*;
import demos.ps.maps.*;
import demos.ps.oo.GameData;
import demos.ps.oo.PSGame;
import demos.ps.oo.PartyMember;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSGame.ScreenSize;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.space.Space;
import core.Script;
import core.MainEngine;
import domain.VImage;

public class OdinQuestTest {

	boolean SAVE_ON = true;
	String filePath = "C:\\";
	
	@BeforeClass
	public static void initStructures() {
		Script.TEST_SIMULATION = true; // This will assure the commands are
										// given automatically
		Script.TEST_POS = 0;

		Script.screen = new VImage(320, 240);
	}

	@Before
	public void init() {
		PSGame.initGameScreen(ScreenSize.SCREEN_320_240);
		PSGame.initPSGame(GameType.PS_START_AS_ODIN);
	}

	@Test
	public void testIntro() {
		Space.intro();
		assertTrue(PSGame.hasFlag(Flags.GOT_ODIN));
	}
	
	@Test
	public void testCamineetSueloNotCuring() {
		testIntro();
		
		int currentHp = PSGame.getParty().getMembers().get(0).getHp();
		PSGame.getParty().getMembers().get(0).setHp(currentHp - 1);
		Camineet.suelo();
		assertEquals(currentHp - 1, PSGame.getParty().getMembers().get(0).getHp());
	}

	@Test
	public void testNekiseNoLaconianPot() {
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot)) == false);

		Camineet.nekise();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot)) == false);
	}

	@Test
	public void testBuyingFlash() {
		testIntro();

		PSGame.getParty().mst+=20;
		int current_mst = PSGame.getParty().mst;
		Palma.camineet();

		TEST_OPTIONS = new int[] { 1, 1, 1, 0, 0 };
		Script.TEST_POS = 0;
		
		Camineet.hand_shop();
				
		assertEquals(current_mst - 20, PSGame.getParty().mst);
		
		Camineet.exit1();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "Odin_01_Camineet.sav"));
		}		
	}
	
	@Test
	public void testBuyingCompass() {
		testBuyingFlash();
		
		PSGame.getParty().mst += 500;
		Palma.camineet();

		TEST_OPTIONS = new int[] { 1, 3, 1, 0, 0 };
		Script.TEST_POS = 0;

		Palma.scion();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "Odin_02_PreCompass.sav"));
		}		

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass))==false);

		Scion.hand_shop();
				
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass)));
		
	}
	
	@Test
	public void testMyau() {
		testBuyingCompass();
		
		Palma.eppi();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "Odin_03_PreMyau.sav"));
		}			
		
		assertTrue(PSGame.getParty().getMembers().size() == 1);
		
		Eppi.houseKey();
		
		assertTrue(PSGame.getParty().getMembers().size() == 2);
	}

	@Test
	public void testCaveCompass() {
		testMyau();
		
		Palma.odin_cave();
		Odin_cave.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "Odin_04_PreChest.sav"));
		}			

		Palma.odin_cave();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass)));

		Odin_cave.chest_compass();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass)) == false);		
	}
	
	@Test
	public void testOdinEnding() {
		testCaveCompass();
		
		Odin_cave.odin();
		
		TEST_OPTIONS = new int[] { 1 };
		Script.TEST_POS = 0;

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass)) == false);
		Odin_cave.chest_compass();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass)));
		
		Odin_cave.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "Odin_05_AfterEnd.sav"));
		}			
	}
	
	@Test
	public void testAfterOdinEnding() {
		testOdinEnding();

		TEST_OPTIONS = new int[] { 1, 1, 1, 1, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 };
		Script.TEST_POS = 0;
		
		Palma.eppi_forest();
		Palma.eppi();

		Eppi.houseKey();
		Eppi.exit();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Dungeon_Key)) == false);

		Palma.camineet();
		Warehouse.chestKey();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Dungeon_Key)));
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Shortcake)) == false);

		Camineet.exit1();
		PSGame.getParty().mst += 280;

		Palma.naula_cave();
		Naula.cake_shop();
		Naula.exit();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Shortcake)));

		Palma.camineet();
		Motavia.paseo();
		Paseo.tunnel_1();
		Governor.robot();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Shortcake)) == false);

		Governor.governor();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Governor_Letter)) == false);
		Paseo.governor();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Governor_Letter)));
		
	}
	
}
