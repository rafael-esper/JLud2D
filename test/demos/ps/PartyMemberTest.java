package demos.ps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import demos.ps.oo.Item;
import demos.ps.oo.Item.ItemType;
import demos.ps.oo.Job;
import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.Party;
import demos.ps.oo.PartyMember;
import demos.ps.oo.PartyMember.Gender;
import demos.ps.oo.Specie;


public class PartyMemberTest {


	
	//============================= ITEM/EQUIP TESTS
	//=============================
	static Party party;
	static Integer initialAttack;
	
	@Before
	public void init() {
		party = new Party(null);

		PartyMember rhys = new PartyMember(Gender.MALE, Specie.PALMAN, Job.ADVENTURER, "Rhys", "");
		rhys.getItems().add(new Item("Landrover", 1200, ItemType.VEHICLE, 0, Effect.NONE));
		rhys.getItems().add(new Item("Cola", 10, ItemType.ITEM, 0, Effect.NONE));
		rhys.getItems().add(new Item("Trimate", 100, ItemType.ITEM, 0, Effect.NONE));
		
		initialAttack = rhys.getAtk();
		
		party.addMember(rhys);
	}
	
	
	@Test
	public void testAddItemAndEquipIt() {
		
		PartyMember rhys = party.getMember(0);  
		
		rhys.addItem(new Item("Short Sword", 200, ItemType.SWORD, 35, Effect.NONE));
		System.out.println(rhys.getItems());
		assertEquals(4, rhys.getItems().size());
		rhys.equipItem(3);
		System.out.println(rhys.getItems());
		assertEquals(3, rhys.getItems().size());
		assertTrue(rhys.getAtk()==initialAttack+35);
	}	
	
	@Test
	public void testEquipItemWhenAlreadyEquipped() {
		
		PartyMember rhys = party.getMember(0);  
		
		rhys.equipItem(new Item("Short Sword", 100, ItemType.SWORD, 25, Effect.NONE));
		assertTrue(rhys.getAtk()==initialAttack+25);
		
		rhys.equipItem(new Item("Medium Sword", 200, ItemType.SWORD, 40, Effect.NONE));

		System.out.println(rhys.getItems());
		assertEquals(4, rhys.getItems().size());
		assertTrue(rhys.getAtk()==initialAttack+40);
		
	}
	
	@Test // Adding item twice and removing it once
	public void testAddItemTwiceRemoveItOnce() {
		
		PartyMember rhys = party.getMember(0);
		int initialSize = rhys.getNumItems();
		Item monomate = new Item("Monomate", 10, ItemType.ITEM, 0, Effect.NONE);
		
		rhys.addItem(monomate);
		rhys.addItem(monomate);
		System.out.println(rhys.getItems());
		assertEquals(initialSize+2, rhys.getItems().size());
		
		rhys.removeItem(initialSize+1);
		System.out.println(rhys.getItems());
		assertEquals(initialSize+1, rhys.getItems().size());
		
		rhys.removeItem(initialSize);
		System.out.println(rhys.getItems());
		assertEquals(initialSize, rhys.getItems().size());
	}	
	
	
}
