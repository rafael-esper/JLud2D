package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.entities;
import static core.Script.entityspawn;
import static core.Script.entitystalk;
import static core.Script.load;
import static core.Script.player;
import static core.Script.playerdiagonals;
import static core.Script.setplayer;
import static core.Script.smoothdiagonals;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import demos.ps.oo.PSGame.GameType;
import demos.ps.oo.PSLibImage.PS1Image;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PartyMember.Gender;
import domain.Entity;
import domain.VImage;

public class Party implements Serializable {

	static final Logger log = LogManager.getLogger(Party.class);

	private static final long serialVersionUID = -7289223433557170144L;

	public static final int TRANSPORT_SPEED = 400;
	public static final int WALKING_SPEED = 200;
	
	public int mst = 0;
	private List<PartyMember> members = new ArrayList<PartyMember>();
	private List<Item> questItems = new ArrayList<Item>();
	
	private int order[];

	public Party(GameType gametype) {

		if(gametype == null) {
			// Empty constructor
		}
		else if(gametype == GameType.PS_ORIGINAL) {
			
			addMember(new PartyMember(Gender.FEMALE, Specie.PALMAN, Job.ADVENTURER, PSGame.getString("Name_Alis"), PS1Image.PORTRAIT_ALIS, "chars/alis.chr"));
			//addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), "chars/myau.chr"));
			//addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, PSGame.getString("Name_Odin"), "chars/odin.chr"));
			//addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, PSGame.getString("Name_Noah"), "chars/noah.chr"));
			//setOrder(new int[]{0, 3, 2, 1});

			//addMember(new PartyMember(Gender.MALE, Specie.DEZORIAN, Job.FIGHTER, "Jara", "chars/dezo0.chr"));
			/*addMember(new PartyMember(Gender.MALE, Specie.DEZORIAN, Job.ESPER, "Jara", "chars/dezo3.chr"));
			addMember(new PartyMember(Gender.MALE, Specie.DEZORIAN, Job.ESPER, "Jara", "chars/dezo9.chr"));*/

		}
		else if(gametype == GameType.PS_PARTY) {
			this.members = PartyCreator.createParty(5);
		}
		else if(gametype == GameType.PS_ARENA) {
			addMember(new PartyMember(Gender.FEMALE, Specie.PALMAN, Job.ADVENTURER, PSGame.getString("Name_Alis"), "chars/Alis.chr"));
		}
		else if(gametype == GameType.PS_START_AS_ODIN) {
			addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, PSGame.getString("Name_Odin"), PS1Image.PORTRAIT_ODIN, "chars/Odin.chr"));
		}
		else if(gametype == GameType.PS_START_AS_NOAH) {
			addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, PSGame.getString("Name_Noah"), PS1Image.PORTRAIT_NOAH, "chars/Noah.chr"));
			getMember(0).advanceLevel();
			getMember(0).advanceLevel();
			getMember(0).heal();
			
			addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, "Tajim", PS1Image.PORTRAIT_NOAH, "chars/Tarzimal.chr"));
			for(int i=0; i<15; i++) {
				getMember(1).advanceLevel();
			}
			getMember(1).heal();
			getMember(1).equipItem(PSGame.getItem(OriginalItem.Armor_Frad_Cloak));
			getMember(1).equipItem(PSGame.getItem(OriginalItem.Weapon_Psycho_Wand));
		}
		
	}	

	public int partySize() {
		return members.size();
	}
	
	public PartyMember getMember(int member) {
		if(members==null || member >= members.size()) {
			return null;
		}
		return members.get(member);
	}
	
	public List<PartyMember> getMembers() {
		return this.members;
	}	
	
	
	public String[] listMembers() {
		String[] names = new String[members.size()];
		for(int i=0; i<names.length; i++) {
			names[i] = members.get(i).getName();
		}
		return names;
	}

	public void addMember(PartyMember member) {
		members.add(member);
		if(order == null) {
			order = new int[]{0};
		} else {
			int[] tmpOrder = new int[order.length+1];
			for(int i=0; i<order.length;i++) {
				tmpOrder[i] = order[i];
			}
			tmpOrder[order.length] = order.length;
			order = tmpOrder;
		}
		
	}
	
	// Set party order, like [0,1,2,3] or [0,3,2,1]
	public void setOrder(int[] orders) {
		int sum = 0;
		for(int i=0;i<orders.length;i++) { // Check if order is valid
			sum+=i;
			sum-=orders[i];
		}
		if(sum!=0) {
			log.error("Party::Invalid Party order.");
			return;
		}
		this.order = orders;
	}
	
	public void healAll(boolean revive) {
		for(PartyMember m: members) {
			if(m.hp > 0 || revive) { 
				m.heal();
			}
		}
	}
	
	public void addQuestItem(Item item) {
		if(!hasQuestItem(item)) {
			PSGame.playSound(PS1Sound.ITEM);
			questItems.add(item);
		}
	}

	public void removeItem(Item item) {
		for(Item i: questItems) {
			if(i.equals(item)) {
				questItems.remove(i);
				return;
			}
		}
	}
	public List<Item> listQuestItems() {
		return this.questItems;
	}
	
	public boolean hasQuestItem(Item item) {
		for(Item i: questItems) {
			if(i.equals(item)) {
				return true;
			}
		}
		return false;
	}
	
	
	// Code to allocate entities in the map: DEPRECATED (First to Last) 
	/*public void allocate(int gotox, int gotoy) {
		int last = -1;
		for(int i=0; i<members.size(); i++) {
			PartyMember player = members.get(order[i]);
			
			if(player.hp <=0) {
				continue;
			}
			
			if(last==-1) {
				last = entityspawn(gotox, gotoy, player.charPath);
				setplayer(last);
			}
			else {
				int previous = last;
				last = entityspawn(gotox, gotoy, player.charPath);
				entitystalk(last, previous);
			}
			members.get(i).e = entity.get(last);
		}
		entity.get(player).setSpeed( 200;		
	}*/
	
	// Code to allocate entities in the map	
	public void allocate(int gotox, int gotoy) {
		int last = -1;
		for(int i=members.size()-1; i>=0; i--) {
			PartyMember player = members.get(order[i]);
			
			if(player.hp <=0) {
				continue;
			}
			
			if(last==-1) {
				last = entityspawn(gotox, gotoy, player.getCharPath());
			}
			else {
				int previous = last;
				last = entityspawn(gotox, gotoy, player.getCharPath());
				entitystalk(previous, last);
			}
			//members.get(i).e = entity.get(last);			
		}
		setplayer(last);
		entities.get(player).setSpeed(WALKING_SPEED);
		
		playerdiagonals = true;
		smoothdiagonals = true;		
	}	
	
	// Reallocate the party according to a new order or after getting members killed.
	public void reallocate() {
		if(entities.isEmpty()) {
			return;
		}
		int x = entities.get(player).getx() /16;
		int y = entities.get(player).gety() /16;

		deallocate();
		allocate(x, y);
	}
	
	public void deallocate() {
		if(player == -1) {
			return;
		}
		Entity e = entities.get(player);
		while(e!= null) {
			e.setActive(false);
			e.setVisible(false);
			e = e.getFollower();
		}
/*		for(PartyMember p: members) {
			if(p.e !=null) {
				p.e.active = false;
				p.e.visible = false;
			}
		}*/
	}
	
	public void embark(int x, int y, String strChar) {
		int direction = player == -1 ? Entity.NORTH : entities.get(player).getFace();
		deallocate();

		playerdiagonals = false;
		smoothdiagonals = false;
		
		setplayer(entityspawn(x, y, strChar));
		entities.get(player).setSpeed(TRANSPORT_SPEED);
		entities.get(player).setFace(direction);
	}
	
	public void disembark(int x, int y) {
		entities.get(player).setSpeed(WALKING_SPEED);
		entities.get(player).setActive(false);
		entities.get(player).setVisible(false);		
		
		allocate(x, y);
	}

	public int getFirstAlivePlayer() {
		for(int i=0; i<PSGame.getParty().getMembers().size(); i++) {
			if(PSGame.getParty().getMember(i).getHp() > 0) {
				return i;
			}
		}
		return 0;
	}

	public boolean checkForFullAndAddItem(Item item) {
		// Check for full
		int member = -1;
		for(int i=0; i<PSGame.getParty().getMembers().size(); i++) {
			if(PSGame.getParty().getMember(i).items.size() < PartyMember.ITEMS_SIZE) {
				member = i;
				break;
			}
		}
		if(member == -1) {
			PSMenu.StextLast(PSGame.getString("Shop_Full"));
			return false;						
		}
		else {
			getMember(member).addItem(item);
			PSGame.playSound(PS1Sound.ITEM);
			return true;
		}
	}
	
	

}
