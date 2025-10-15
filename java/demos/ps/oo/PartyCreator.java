package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static java.util.Arrays.asList;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import demos.ps.oo.PartyMember.Gender;
import demos.ps.oo.Job;
import demos.ps.oo.Specie;

public class PartyCreator {

	private static final Logger log = LogManager.getLogger(PartyCreator.class);

	private static final Random RANDOM = new Random();
	
	public static Map<Specie, List<Job>> map_spe_job = new HashMap<Specie, List<Job>>();

	// Stores names for random created characters, depending on the gender and specie
	static class NameMap {
		List<String> names;
		Gender gender;
		Specie spe; 
		public NameMap(Gender gender, Specie spe, List<String> names) {
			this.gender = gender;
			this.spe = spe;
			this.names = names;
		}
	}
	static List<NameMap> namelist = new LinkedList<NameMap>();
	
	
	class PortraitMap {
		Gender gender;
		Specie spe; 
	}
	

	public static void main(String args[]) {

		initStructures();
		
		List<PartyMember> players = createParty(5);
		
		for(PartyMember p: players)
			log.info(p);
	    
	    
	}

	// Creates a party with <num> characters, without name repetition, ordered by Species
	static List<PartyMember> createParty(int num) {
		List<PartyMember> players = new ArrayList<PartyMember>(num);

		for(int i=0; i<num; i++) {

	    	players.add(createRandomPlayer());

	    	boolean duplicate = false;
	    	for(int j=0; j<i; j++) {
	    		if(players.get(j).getName().equals(players.get(i).getName())) {
	    			duplicate = true;
	    			break;
	    		}
	    	}
	    	if(duplicate) {
	    		log.info("\tDuplicate find: " + players.get(i).getName());
	    		i--;
	    		continue;
	    	}
		}
	    
		// Bubble sort to order by Specie ordinal
		for(int i=0; i<num; i++) {
			for(int j=i+1; j<num; j++) {
				if(i!=j && players.get(i).getSpe().ordinal() > players.get(j).getSpe().ordinal()) {
					PartyMember temp = players.get(j);
					players.set(j, players.get(i));
					players.set(i, temp);
				}
			}
		}
		
		return players;
	}

	private static PartyMember createRandomPlayer() {
		
		// Random Specie (biased random)
		Specie[] spes = new Specie[]{Specie.PALMAN, Specie.PALMAN, Specie.PALMAN, Specie.ANDROID, Specie.MOTAVIAN, Specie.MUSK_CAT, Specie.DEZORIAN};
		Specie rndSpe = spes[RANDOM.nextInt(spes.length)];
		//Spe rndSpe = Spe.values()[RANDOM.nextInt(Spe.values().length)];
	    
	    // Random Job
    	Job rndJob = map_spe_job.get(rndSpe).get(RANDOM.nextInt(map_spe_job.get(rndSpe).size()));
	    
	    // Random Gender
    	Gender rndGender = Gender.values()[RANDOM.nextInt(Gender.values().length)];
    	
	    // Random Name (not previously used)
    	List<String> availableNames = null;
    	for(NameMap name: namelist) {
    		if(name.gender == rndGender && name.spe == rndSpe) {
    			availableNames = name.names;
    		}
    	}
    	int nameSize = availableNames.size();
    	String rndName = nameSize > 0 ? availableNames.get(RANDOM.nextInt(nameSize)) : "null";
    	
	    // TODO Random Portrait (not previously used)

    	return new PartyMember(rndGender, rndSpe, rndJob, rndName, null);
	}

	private static void initStructures() {
		// Mapping Specie x Job
		map_spe_job.put(Specie.PALMAN, asList(Job.ADVENTURER, Job.FIGHTER, Job.HUNTER, Job.ESPER, Job.PRIEST));
		map_spe_job.put(Specie.ANDROID, asList(Job.GUARDIAN, Job.WATCHER));
		map_spe_job.put(Specie.MOTAVIAN, asList(Job.ADVENTURER, Job.FIGHTER, Job.HUNTER, Job.PRIEST));
		map_spe_job.put(Specie.MUSK_CAT, asList(Job.HUNTER));
		map_spe_job.put(Specie.DEZORIAN, asList(Job.ADVENTURER, Job.HUNTER, Job.PRIEST));
		
		//Map<Gender, Map<Spe, List<String>>> namesmap;
		
		//http://www.babynames1000.com/four-letter/
		//Name is dependent of gender and race
		namelist.add(new NameMap(Gender.FEMALE, Specie.PALMAN, asList("Alice", "Anie", "Dana", "Erin", "Gwen", "Leah", "Sara", "Tina")));
		namelist.add(new NameMap(Gender.MALE, Specie.PALMAN, asList("Adam", "Cale", "Drew", "Eward", "Kane", "Luke", "Rian", "Sean")));
		namelist.add(new NameMap(Gender.MALE, Specie.MOTAVIAN, asList("Brio", "Deon", "Eben", "Illaz", "Rand")));
		namelist.add(new NameMap(Gender.FEMALE, Specie.MOTAVIAN, asList("Amey", "Bena", "Edra", "Mila", "Tessa")));
		namelist.add(new NameMap(Gender.MALE, Specie.DEZORIAN, asList("Jhar", "Kaia", "Rujji")));
		namelist.add(new NameMap(Gender.FEMALE, Specie.DEZORIAN, asList("Jhami", "Khami", "Rezy")));
		namelist.add(new NameMap(Gender.MALE, Specie.MUSK_CAT, asList("Mian", "Mose", "Nile")));
		namelist.add(new NameMap(Gender.FEMALE, Specie.MUSK_CAT, asList("Maye", "Mien", "Nyla")));
		namelist.add(new NameMap(Gender.MALE, Specie.ANDROID, asList("Reed", "Zion", "Waden")));
		namelist.add(new NameMap(Gender.FEMALE, Specie.ANDROID, asList("Siena", "Riel", "Zoey")));
		
		
	    //for (Map.Entry<Spe, List<Job>> e : map_spe_job.entrySet()) {
	      //  log.info(e.getKey() + "\t" + e.getValue());
	    //}
	}
	
	
}
