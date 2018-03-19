package demos.ps;

import static core.Script.*;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static demos.ps.oo.PSMenuShop.Shop;

import java.util.ArrayList;

import org.junit.Before;
import org.junit.Test;

import demos.ps.oo.Item;
import demos.ps.oo.Item.ItemType;
import demos.ps.oo.Job;
import demos.ps.oo.PSMenu;
import demos.ps.oo.Party;
import demos.ps.oo.PartyMember;
import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PartyMember.Gender;
import demos.ps.oo.Specie;

public class PSMenuShopTest {

	static Party party;
	static Item[] itemList;
	
	@Before
	public void init() {
		TEST_SIMULATION = true; // This will assure the commands are given automatically
		TEST_POS = 0;
		
		party = new Party(null);
		party.addMember(createPartyMemberRhys());
		party.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.HUNTER, "Cache", ""));
		party.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, "Best", ""));
		
		itemList = new Item[]{new Item("Monomate", 10, ItemType.ITEM, 0 , Effect.NONE), new Item("Dimate", 40, ItemType.ITEM, 0, Effect.NONE), new Item("Trimate", 100, ItemType.ITEM, 0 , Effect.NONE)}; 
	}
	
	public PartyMember createPartyMemberRhys() {
		PartyMember rhys = new PartyMember(Gender.MALE, Specie.PALMAN, Job.ADVENTURER, "Rhys", "");
		rhys.items = new ArrayList<Item>();
		rhys.items.add(new Item("Landrover", 1200, ItemType.VEHICLE, 0, Effect.NONE));
		rhys.items.add(new Item("Cola", 10, ItemType.ITEM, 0, Effect.NONE));
		rhys.items.add(new Item("Trimate", 100, ItemType.ITEM, 0, Effect.NONE));
		return rhys;
	}
	
	@Test // Just enter, Buy (see products), exit
	public void testBuyCancelCancel() {
		TEST_OPTIONS =new int[]{1, 0, 0};
		party.mst = 1000;
		Shop("Store House", true, party, itemList);
		assertTrue(party.mst==1000);
	}
	
	@Test // try to buy item 1 without enough money
	public void testBuyChoose1NOTENOUGH() {
		TEST_OPTIONS =new int[]{1, 1};
		party.mst = 1;
		
		Shop("Store House", true, party, itemList);
		assertTrue(party.mst==1);
	}

	@Test // try to buy item 2 without enough money
	public void testBuyChoose2NOTENOUGH() {
		TEST_OPTIONS =new int[]{1, 2};
		party.mst = 35;
		
		Shop("Store House", true, party, itemList);
		assertTrue(party.mst==35);
	}
	
	@Test // try to buy item 3 without enough money
	public void testBuyChoose3NOTENOUGH() {
		TEST_OPTIONS =new int[]{1, 3};
		party.mst = 99;
		
		Shop("Store House", true, party, itemList);
		assertTrue(party.mst==99);
	}	
	
	@Test // Buy everything until money is spent
	public void testBuyChoose1NoOneTakeChoose2Play3TakeBOUGHTChoose1Play1TakeBOUGHTChoose2NOTENOUGH() {
		TEST_OPTIONS =new int[]{1, 1, 0, 2, 3, 1, 1, 2};
		party.mst = 50;
		
		Shop("Store House", true, party, itemList);
		assertTrue(party.mst==0);
	}
	
	@Test // Unique member, buy everything until money is spent
	public void testBuyUniqueChoose1YesBOUGHTChoose1YesBOUGHTChoose2NOTENOUGH() {
		TEST_OPTIONS =new int[]{1, 1, 1, 1, 1, 1, 1, 1};
		party.mst = 30;
		party.getMembers().clear();
		party.addMember(createPartyMemberRhys());
		
		Shop("Store House", true, party, itemList);
		assertTrue(party.mst==0);
	}	
	
	@Test // Sell nothing
	public void testSellPlay1NoOneSellPlay2NoOneSellPlay3NoOneSellCancelCancelExit() {
		TEST_OPTIONS =new int[]{2, 1, 0, 2, 0, 3, 0, 0, 0};
		party.mst = 50;
		
		Shop("Store House", true, party, itemList);
		assertTrue(party.mst==50);
	}
	
	@Test // Sell Cola
	public void testSellPlay1SellColaSOLDCancelCancelExit() {
		TEST_OPTIONS =new int[]{2, 1, 2, 1, 0, 0, 0};
		party.mst = 50;
		
		Shop("Store House", true, party, itemList);
		assertEquals(55, party.mst);
	}
	
	@Test // Sell Without Items
	public void testSellPlay2SellNothingCancelCancelExit() {
		TEST_OPTIONS =new int[]{2, 2, 2, 1, 0, 0, 0};
		party.mst = 50;
		
		Shop("Store House", true, party, itemList);
		assertEquals(50, party.mst);
	}	
	
	@Test // Sell Cola Party size = 1
	public void testUniqueMemberSellPlay1SellColaSOLDCancelCancelExit() {
		TEST_OPTIONS =new int[]{2, 2, 1, 0, 0, 0};
		party.mst = 50;
		party.getMembers().clear();
		party.addMember(createPartyMemberRhys());		
		
		Shop("Store House", true, party, itemList);
		assertEquals(55, party.mst);
		assertEquals(2, party.getMember(0).items.size());
	}	
	
	@Test // Sell Forbidden Item Party size = 1
	public void testUniqueMemberSellPlay1SellLandroverCANTCancelCancelExit() {
		TEST_OPTIONS =new int[]{2, 1, 0, 0, 0};
		party.mst = 50;
		party.getMembers().clear();
		party.addMember(createPartyMemberRhys());
		
		Shop("Store House", true, party, itemList);
		assertEquals(50, party.mst);
		assertEquals(3, party.getMember(0).items.size());
	}	

	@Test // Selling without items, party size = 1
	public void testUniqueMemberSellNothingToSell() {
		TEST_OPTIONS =new int[]{2, 0, 0};
		party.mst = 50;
		party.getMembers().clear();
		party.addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, "Hahn", ""));		
		
		Shop("Store House", true, party, itemList);
		assertEquals(50, party.mst);
		assertEquals(0, party.getMember(0).items.size());
	}	
	
	
	@Test // Test buying item and then selling it
	public void testBuyDimatePlayer2SellDimatePlayer2() {
		TEST_OPTIONS =new int[]{1, 2, 2, 0, 2, 2, 1, 1, 0, 0};
		party.mst = 50;
		
		Shop("Store House", true, party, itemList);
		assertEquals(30, party.mst);
		assertEquals(0, party.getMember(1).items.size());
	}
	
	@Test // Weap shop
	public void testWeapShopBuyNothing() {
		TEST_OPTIONS =new int[]{0};
		party.mst = 150;
		
		Shop("Weapon Shop", false, party, new Item[]{new Item("Gloves", 100, ItemType.GLOVES, 0, Effect.NONE), new Item("Barrier", 400, ItemType.BARRIER, 0, Effect.NONE), new Item("Mail", 1000, ItemType.MAIL, 0, Effect.NONE)});
		assertEquals(150, party.mst);
		assertEquals(3, party.getMember(0).items.size());
	}
	
	@Test // Weap shop Buy and Equip item
	public void testWeapShopBuyPlayer1Choose1BOUGHTAndEquipIt() {
		TEST_OPTIONS =new int[]{1, 1, 1, 0};
		party.mst = 150;

		int initialAttack = party.getMember(0).getAtk();
		Shop("Weapon Shop", false, party, new Item[]{new Item("Sword", 100, ItemType.SWORD, 35, Effect.NONE), new Item("Barrier", 400, ItemType.BARRIER, 35, Effect.NONE), new Item("Mail", 1000, ItemType.MAIL, 25, Effect.NONE)});
		assertEquals(50, party.mst);
		assertEquals(3, party.getMember(0).items.size());
		assertTrue(party.getMember(0).getAtk() == initialAttack + 35);
	}
	
	@Test // Weap shop Buy and don't Equip item
	public void testWeapShopBuyPlayer1Choose1BOUGHTAndDontEquipIt() {
		TEST_OPTIONS =new int[]{1, 1, 2, 0};
		party.mst = 150;

		int initialAttack = party.getMember(0).getAtk();
		Shop("Weapon Shop", false, party, new Item[]{new Item("Sword", 100, ItemType.SWORD, 35, Effect.NONE), new Item("Barrier", 400, ItemType.BARRIER, 35, Effect.NONE), new Item("Mail", 1000, ItemType.MAIL, 25, Effect.NONE)});
		assertEquals(50, party.mst);
		assertEquals(4, party.getMember(0).items.size());
		assertTrue(party.getMember(0).getAtk() == initialAttack);
	}	
	
	@Test // Weap shop Buy and Equip All
	public void testWeapShopBuyPlayer1Choose1BOUGHTAndEquipItChoose2BOUGHTAndEquipItChoose3BOUGHTAndEquipIt() {
		TEST_OPTIONS =new int[]{1, 1, 1, 2, 1, 1, 3, 1, 1, 0};
		party.mst = 16000;

		int initialAttack = party.getMember(0).getAtk();
		int initialDefense = party.getMember(0).getDef();
		
		Shop("Weapon Shop", false, party, new Item[]{new Item("Sword", 1000, ItemType.SWORD, 35, Effect.NONE), new Item("Shield", 3000, ItemType.LIGHT_SHIELD, 50, Effect.NONE), new Item("Mail", 2000, ItemType.MAIL, 25, Effect.NONE)});
		assertEquals(10000, party.mst);
		assertEquals(3, party.getMember(0).items.size());
		assertTrue(party.getMember(0).getAtk() == initialAttack + 35);
		assertTrue(party.getMember(0).getDef() == initialDefense + 50+25);
	}	

	@Test // Weap shop Buy and can't Equip item
	public void testWeapShopBuyPlayer1Choose1CantEquipCancel() {
		TEST_OPTIONS =new int[]{1, 1, 0, 0};
		party.mst = 150;
		
		Shop("Weapon Shop", false, party, new Item[]{new Item("Axe", 100, ItemType.AXE, 0, Effect.NONE), new Item("Barrier", 400, ItemType.BARRIER, 0, Effect.NONE), new Item("Mail", 1000, ItemType.MAIL, 0, Effect.NONE)});
		assertEquals(150, party.mst);
		assertEquals(3, party.getMember(0).items.size());
	}

	@Test // Weap shop Buy and can't Equip item, buy it anyway
	public void testWeapShopBuyPlayer1Choose1CantEquipBOUGHTCancel() {
		TEST_OPTIONS =new int[]{1, 1, 1, 0, 0};
		party.mst = 150;
		
		Shop("Weapon Shop", false, party, new Item[]{new Item("Axe", 100, ItemType.AXE, 0, Effect.NONE), new Item("Barrier", 400, ItemType.BARRIER, 0, Effect.NONE), new Item("Mail", 1000, ItemType.MAIL, 0, Effect.NONE)});
		assertEquals(50, party.mst);
		assertEquals(4, party.getMember(0).items.size());
	}
	
	
	
	
}
