

package demos.ps;

import static core.Script.TEST_OPTIONS;
import static org.junit.Assert.assertTrue;

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
import core.Script;
import core.MainEngine;
import domain.VImage;

public class AlisQuestTest {

	boolean SAVE_ON = true;
	String filePath = "/home/rafael/temp/ps/"; 

	@BeforeClass
	public static void initStructures() {
		Script.TEST_SIMULATION = true; // This will assure the commands are given automatically
		Script.TEST_POS = 0;

		Script.screen = new VImage(320, 240);
	}

	@Before
	public void init() {
		PSGame.initGameScreen(ScreenSize.SCREEN_320_240);
		PSGame.initPSGame(GameType.PS_ORIGINAL);
	}

	@Test
	public void testCamineet() {
		Camineet.suelo();
		Camineet.suelo();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot)) == false);

		Camineet.nekise();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot)));
	}

	@Test
	public void testRoadpass() {

		TEST_OPTIONS = new int[] { 1, 3, 1, 3, 1, 3 };
		Script.TEST_POS = 0;

		Camineet.exit1();
		PSGame.getParty().mst += 200;

		Palma.scion();

		MainEngine.systemclass = Scion.class; // hack to deal with not loading maps on simulation
		Scion.hand_shop();

		Scion.hand_shop();

		assertTrue(PSGame.getParty().hasQuestItem(
				PSGame.getItem(OriginalItem.Quest_Road_Pass)) == false);

		Scion.hand_shop();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass)));
	}

	@Test
	public void testPassport() {
		testRoadpass();

		TEST_OPTIONS = new int[] { 1, 2, 2, 1 };
		Script.TEST_POS = 0;

		Scion.exit();
		PSGame.getParty().mst += 100;

		Palma.camineet();
		Camineet.spaceport();

		assertTrue(PSGame.getParty().hasQuestItem(
				PSGame.getItem(OriginalItem.Quest_Passport)) == false);

		Spaceport1.passport();
		assertTrue(PSGame.getParty().hasQuestItem(
				PSGame.getItem(OriginalItem.Quest_Passport)));
	}

	@Test
	public void testMyau() {
		testCamineet();
		testPassport();

		TEST_OPTIONS = new int[] { 2, 1 };
		Script.TEST_POS = 0;

		Spaceport2.paseo();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "01_PreMyau.sav"));
		}

		assertTrue(PSGame.getParty().getMembers().size() == 1);
		Paseo.myau_shop();
		assertTrue(PSGame.getParty().getMembers().size() == 2);
	}

	@Test
	public void testOdin() {
		testMyau();

		Palma.odin_cave();
		Odin_cave.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "02_PreOdin.sav"));
		}

		Palma.odin_cave();
		Odin_cave.medusa_noise();
		
		assertTrue(PSGame.getParty().getMembers().size() == 2);
		Odin_cave.odin();
		assertTrue(PSGame.getParty().getMembers().size() == 3);

		TEST_OPTIONS = new int[] { 1 };
		Script.TEST_POS = 0;

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass)) == false);

		Odin_cave.chest_compass();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass)));

		// Odin_cave.exit();
		Camineet.exit1();
	}

	@Test
	public void testGovernor() {
		testOdin();

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

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "03_PreGovernor.sav"));
		}

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Governor_Letter)) == false);
		Paseo.governor();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Governor_Letter)));
	}

	@Test
	public void testNoah() {
		testGovernor();

		Paseo.motavia();
		Motavia.naharu();
		// Naharu.startmap();
		// Naharu.stairs_1_2();
		Naharu.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "04_PreNoah.sav"));
		}

		assertTrue(PSGame.getParty().getMembers().size() == 3);

		Naharu.noah();

		assertTrue(PSGame.getParty().getMembers().size() == 4);
	}

	@Test
	public void testLuveno() {
		testNoah();

		Palma.gothic();
		Gothic.luveno();
		Gothic.exit();

		Palma.triada();
		Triada.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "05_PreLuveno.sav"));
		}

		TEST_OPTIONS = new int[] { 1, 1 };
		Script.TEST_POS = 0;

		Palma.triada();
		Triada.robot();
		Triada.luveno();
		Triada.luveno();
		
		assertTrue(!PSGame.hasFlag(Flags.LUVENO_FREE));
		
		Triada.luveno();

		assertTrue(PSGame.hasFlag(Flags.LUVENO_FREE));
	}

	@Test
	public void testLuvenoAssistant() {
		testLuveno();
		
		PSGame.getParty().mst += 1200;
		
		Palma.gothic();
		Gothic.tunnel();
		Gothic_passageway.assistant();
		Gothic_passageway.gothic();
		
		Gothic.assist();

		TEST_OPTIONS = new int[] { 1 };
		Script.TEST_POS = 0;
		
		Gothic.luveno(); // fee
		Gothic.luveno();
		Gothic.luveno();
		Gothic.luveno();
		Gothic.luveno(); // success
		Gothic.luveno();
		
		Palma.bortevo();

		assertTrue(PSGame.hasFlag(Flags.LUVENO_READY));
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "06_Bortevo.sav"));
		}
	}

	@Test
	public void testDrMad() {
		testLuvenoAssistant();
		
		Palma.cave_bortevo_south();
		Bortevo_cave.abion_island();
	
		Palma.loar();
		Loar.exit();
		PSGame.getParty().mst += 1600;		
		
		Palma.abion();
		Abion.hand_shop(); // closed
		
		Abion.tunnel_in();

		Abion_dungeon.dr_mad();

		BattleTest.advanceToLevel(PSGame.getParty().getMember(0), 35);
		BattleTest.advanceToLevel(PSGame.getParty().getMember(1), 35);
		BattleTest.advanceToLevel(PSGame.getParty().getMember(2), 35);
		BattleTest.advanceToLevel(PSGame.getParty().getMember(3), 35);

		TEST_OPTIONS = new int[] {2, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		Script.TEST_POS = 0;

		if (!SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "08_Pre_Hapsby.sav"));
		}

		Abion.drmad();

		TEST_OPTIONS = new int[] {1};
		Script.TEST_POS = 0;

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot)) == false);

		Abion.drmad(); // open chest 

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot)));		
	}
	
	@Test
	public void testHapsby() {
		testDrMad();

		TEST_OPTIONS = new int[] {3, 0};
		Script.TEST_POS = 0;

		Abion.food_shop();
		Abion.exit();
		
		Palma.cave_bortevo_north();
		Bortevo_cave.exit();
		Palma.bortevo();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "08_Pre_Hapsby.sav"));
		}
		
		assertTrue(!PSGame.hasFlag(Flags.GOT_HAPSBY));
		Bortevo.hapsby();
		assertTrue(PSGame.hasFlag(Flags.GOT_HAPSBY));
	}
	
	@Test
	public void testSpaceship() {
		testHapsby();
		
		Bortevo.exit();
		Palma.gothic();
		
		Gothic.luveno();
		Gothic.beggar1();

		TEST_OPTIONS = new int[] {2, 1};
		Script.TEST_POS = 0;
		
		Gothic.spaceship();
		Motavia.uzo();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "09_Uzo.sav"));
		}
		
	}
	
	@Test
	public void testFlute() {
		testSpaceship();

		TEST_OPTIONS = new int[] {2, 1, 1};
		Script.TEST_POS = 0;
		
		Uzo.house1();
		Uzo.spaceship();
		Palma.gothic();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "10_Pre_flute.sav"));
		}		
		
		Gothic.flute();
	}
	
	@Test
	public void testCasba() {
		testFlute();
		
		TEST_OPTIONS = new int[] {2, 1, 1, 1, 1, 0, 0,  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		Script.TEST_POS = 0;
		
		
		Gothic.spaceship();
		Motavia.casba_cave();
		Casba_cave.casba();
		
		PSGame.getParty().mst += 5200;
		
		Casba.house1();
		
		assertTrue(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Vehicle_LandMaster)));
		
		Casba.hand_shop2();

		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Vehicle_LandMaster)));
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "11_Pre_AmberEye.sav"));
		}
		
		Casba.tunnel();
		Casba_cave.bl_dragon();
		
		TEST_OPTIONS = new int[] {1};
		Script.TEST_POS = 0;

		assertTrue(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye)));
		Casba_cave.bl_dragon();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye)));
		Casba_cave.exit();

	}

	@Test
	public void testGasDead() {
		testCasba();

		Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		
		assertTrue(PSGame.getParty().getMember(0).getHp()<=0);
		assertTrue(PSGame.getParty().getMember(1).getHp()<=0);
		assertTrue(PSGame.getParty().getMember(2).getHp()<=0);
		assertTrue(PSGame.getParty().getMember(3).getHp()<=0);
	}
	
	@Test
	public void testHovercraft() {
		testCasba();
		
		TEST_OPTIONS = new int[] {1, 1};
		Script.TEST_POS = 0;
		
		Motavia.uzo();
		Uzo.spaceship();
		Gothic.exit();
		Palma.bortevo();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "12_Hovercraft.sav"));
		}
		
		Bortevo.hovercraft();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Vehicle_FlowMover)));
		Bortevo.exit();
	}
	
	@Test
	public void testDrasgow() {
		testHovercraft();

		PSGame.getParty().mst += (1000 -318);

		TEST_OPTIONS = new int[] {1};
		Script.TEST_POS = 0;
		
		Palma.drasgow();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "13_Drasgow.sav"));
		}
		
		Drasgow.tunnel();
		assertTrue(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_GasClear)));
		Drasgow_dungeon.gas_shop();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_GasClear)));
		Drasgow_dungeon.exit();
		Drasgow.exit();
	}

	@Test
	public void testSopia() {
		testDrasgow();

		TEST_OPTIONS = new int[] {2, 1, 1};
		Script.TEST_POS = 0;
		
		PSGame.getParty().mst += 400;
		
		Palma.gothic();
		PSGame.getParty().healAll(true);
		Gothic.spaceship();
		
		Uzo.exit();
		//Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		//Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		//Motavia.gas();		Motavia.gas();		Motavia.gas();		Motavia.gas();
		
		assertTrue(PSGame.getParty().getMember(0).getHp()>0);
		assertTrue(PSGame.getParty().getMember(1).getHp()>0);
		assertTrue(PSGame.getParty().getMember(2).getHp()>0);
		assertTrue(PSGame.getParty().getMember(3).getHp()>0);
		
		assertTrue(!PSGame.hasFlag(Flags.INFO_PERSEUS));
		
		Motavia.sopia();
		Sopia.house3();
		
		assertTrue(PSGame.hasFlag(Flags.INFO_PERSEUS));
		Sopia.exit();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "14_Sopia.sav"));
		}
		
		//Motavia.mirror();
	}
	
	@Test
	public void testTajima() {
		testSopia();

		Motavia.tajima();
		Tajima_cave.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "15_Tajima.sav"));
		}

		TEST_OPTIONS = new int[] {1,3,1,2,1,2,1,2,1,2,1,2};
		Script.TEST_POS = 0;

		Motavia.tajima();
		Tajima_cave.tajima();
		Tajima_cave.exit();
		assertTrue(PSGame.hasFlag(Flags.DEFEAT_TAJIMA));
	}
	
	@Test
	public void testDezoris() {
		testTajima();
		
		TEST_OPTIONS = new int[] {3,1};
		Script.TEST_POS = 0;
		
		Motavia.uzo();
		Uzo.spaceship();
		
		Skure_entrance.tunnel();
		Skure_tunnel.skure();
		Skure.tunnel();
		Skure_tunnel.exit();
		Skure_entrance.exit();
		
		Dezoris.cave1();
		Dezo_cave1.nextArea();

		Dezoris.cave3();
		Dezo_cave2.nextArea();

		Dezoris.cave5();
		Dezo_cave3.nextArea();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "16_Dezoris.sav"));
		}
		
		
	}
	
	@Test
	public void testIceDigger() {
		testDezoris();
		
		Dezoris.cave_to_aukba();
		Dezo_cave_aukba.nextArea();
		
		PSGame.getParty().mst += 12000;
		
		Dezoris.aukba();
		Aukba_entrance.tunnel();
		Aukba_tunnel.aukba();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "17_Aukba.sav"));
		}

		TEST_OPTIONS = new int[] {1,1,0,0};
		Script.TEST_POS = 0;
		
		Aukba.icedigger_shop();
		Aukba.tunnel();
		Aukba_tunnel.exit();
		Dezoris.cave_from_aukba();
		Dezo_cave_aukba.exit();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Vehicle_IceDecker)));
	}

	@Test
	public void testCorona() {
		testIceDigger();
		
		Dezoris.cave7();
		Dezo_cave4.nextArea();
		
		Dezoris.corona_tower();
		Corona.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "18_Corona.sav"));
		}

		TEST_OPTIONS = new int[] {1};
		Script.TEST_POS = 0;
		
		Dezoris.corona_tower();
		Corona.torch();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Eclipse_Torch)));		
	}

	@Test
	public void testAeroPrism() {
		testCorona();
		
		TEST_OPTIONS = new int[] {1,3,1,0,3,0,1,4,	1,3,1,0,3,0,1,4,	1,3,1,0,3,0,1,4,	1,3,1,0,3,0,1,4,	1,3,1,0,3,0,1,4,	1,3,1,0,3,0,1,4	};
		Script.TEST_POS = 0;

		Dezoris.prism_cave();
		Prism_cave.exit();

		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "19_AeroPrism.sav"));
		}

		Dezoris.prism_cave();
		Prism_cave.titan();
		Prism_cave.exit();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Aeroprism)));		
	}

	
	@Test
	public void testLaerma() {
		testAeroPrism();
		
		Dezoris.cave8();
		Dezo_cave4.exit();
		
		Dezoris.cave6();
		Dezo_cave3.exit();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "20_Laerma.sav"));
		}

		Dezoris.laerma_tree();
	
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laerma_Berries)));		
		
		Dezoris.cave4();
		Dezo_cave2.exit();
		
		Dezoris.cave2();
		Dezo_cave1.exit();
		
		Dezoris.skure();
	}

	@Test
	public void testBayaMalay() {
		testLaerma();
		
		PSGame.getParty().mst += 200_000;
		
		TEST_OPTIONS = new int[] {1,1	,1	,1,1,1,2,2		,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		Script.TEST_POS = 0;
		
		Skure_entrance.spaceship();
		Gothic.tunnel();
		Gothic_passageway.exit();
		Spaceport1.camineet();
		Camineet.suelo();
		Camineet.exit1();
		
		Palma.prison_in();
		Prison.nextArea();
		Palma.cave_baya_in();
		Baya_cave.nextArea();
		Palma.baya_malay_tower();
		Baya_malay.exit();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "21_BayaMalay.sav"));
		}		
		
		assertTrue(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Miracle_Key)));
		Baya_malay.chest15();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Miracle_Key)));
		
		assertTrue(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Damoa_Crystal)));
		Baya_malay.damor();
		assertTrue(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Damoa_Crystal)));

		BattleTest.advanceToLevel(PSGame.getParty().getMember(0), 99);
		BattleTest.advanceToLevel(PSGame.getParty().getMember(1), 99);
		BattleTest.advanceToLevel(PSGame.getParty().getMember(2), 99);
		BattleTest.advanceToLevel(PSGame.getParty().getMember(3), 99);
		
		Baya_malay.sky();
		
		assertTrue(PSGame.hasFlag(Flags.DEFEAT_GOLD_DRAKE));
	}
	
	@Test
	public void testSkyCastle() {
		testBayaMalay();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "22_CastleSky.sav"));
		}

		TEST_OPTIONS = new int[] {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		Script.TEST_POS = 0;
		
		Sky_castle.castle();
		assertTrue(!PSGame.hasFlag(Flags.DEFEAT_SHADOW));
		Lassic_castle.shadow();
		assertTrue(PSGame.hasFlag(Flags.DEFEAT_SHADOW));
		
		TEST_OPTIONS = new int[] {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		Script.TEST_POS = 0;

		assertTrue(!PSGame.hasFlag(Flags.DEFEAT_LASSIC));
		Lassic_castle.lassic();
		assertTrue(PSGame.hasFlag(Flags.DEFEAT_LASSIC));
		
		Lassic_castle.exit();
	}
	
	@Test
	public void testDarkfalz() {
		testSkyCastle();
		
		Motavia.paseo();
		Paseo.tunnel_1();
		Governor.governor();
		Paseo.rest_house();
		
		if (SAVE_ON) {
			GameData.save(PSGame.gameData, new File(filePath + "23_Darkfalz.sav"));
		}
		
		
		
	}
	
	
}
