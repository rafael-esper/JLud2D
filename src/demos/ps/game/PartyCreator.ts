/**
 * PartyCreator - Random Party Generation
 * Direct port of PartyCreator.java - creates a randomized party (PS_PARTY mode),
 * biased by species, with unique names and species-restricted jobs.
 */

import { PartyMember, Gender } from './PartyMember';
import { Job } from './Job';
import { Specie } from './Specie';

// Stores names for randomly created characters, depending on gender and species
interface NameMap {
  gender: Gender;
  spe: Specie;
  names: string[];
}

export class PartyCreator {
  // Mapping Species -> allowed Jobs. Built lazily, not as a class-field
  // initializer: PartyCreator sits in an import cycle through Party/PSGame/
  // Job/PSLibSpell, so depending on which module an entry point reaches
  // first, Job's enum body may not have run yet at class-definition time.
  // Deferring to first use avoids the ordering hazard.
  private static _map_spe_job: Map<Specie, Job[]> | null = null;

  private static get map_spe_job(): Map<Specie, Job[]> {
    if (!PartyCreator._map_spe_job) {
      PartyCreator._map_spe_job = new Map<Specie, Job[]>([
        [Specie.PALMAN, [Job.ADVENTURER, Job.FIGHTER, Job.HUNTER, Job.ESPER, Job.PRIEST]],
        [Specie.ANDROID, [Job.GUARDIAN, Job.WATCHER]],
        [Specie.MOTAVIAN, [Job.ADVENTURER, Job.FIGHTER, Job.HUNTER, Job.PRIEST]],
        [Specie.MUSK_CAT, [Job.HUNTER]],
        [Specie.DEZORIAN, [Job.ADVENTURER, Job.HUNTER, Job.PRIEST]]
      ]);
    }
    return PartyCreator._map_spe_job;
  }

  // Names are dependent on gender and race (http://www.babynames1000.com/four-letter/)
  // Lazily built for the same import-cycle-ordering reason as map_spe_job above.
  private static _namelist: NameMap[] | null = null;

  private static get namelist(): NameMap[] {
    if (!PartyCreator._namelist) {
      PartyCreator._namelist = [
        { gender: Gender.FEMALE, spe: Specie.PALMAN, names: ["Alice", "Anie", "Dana", "Erin", "Gwen", "Leah", "Sara", "Tina"] },
        { gender: Gender.MALE, spe: Specie.PALMAN, names: ["Adam", "Cale", "Drew", "Eward", "Kane", "Luke", "Rian", "Sean"] },
        { gender: Gender.MALE, spe: Specie.MOTAVIAN, names: ["Brio", "Deon", "Eben", "Illaz", "Rand"] },
        { gender: Gender.FEMALE, spe: Specie.MOTAVIAN, names: ["Amey", "Bena", "Edra", "Mila", "Tessa"] },
        { gender: Gender.MALE, spe: Specie.DEZORIAN, names: ["Jhar", "Kaia", "Rujji"] },
        { gender: Gender.FEMALE, spe: Specie.DEZORIAN, names: ["Jhami", "Khami", "Rezy"] },
        { gender: Gender.MALE, spe: Specie.MUSK_CAT, names: ["Mian", "Mose", "Nile"] },
        { gender: Gender.FEMALE, spe: Specie.MUSK_CAT, names: ["Maye", "Mien", "Nyla"] },
        { gender: Gender.MALE, spe: Specie.ANDROID, names: ["Reed", "Zion", "Waden"] },
        { gender: Gender.FEMALE, spe: Specie.ANDROID, names: ["Siena", "Riel", "Zoey"] }
      ];
    }
    return PartyCreator._namelist;
  }

  /**
   * Creates a party with <num> characters, without name repetition, ordered by Species.
   */
  public static createParty(num: number): PartyMember[] {
    const players: PartyMember[] = [];

    for (let i = 0; i < num; i++) {
      players.push(this.createRandomPlayer());

      // Reject and retry on a duplicate name
      let duplicate = false;
      for (let j = 0; j < i; j++) {
        if (players[j].getName() === players[i].getName()) {
          duplicate = true;
          break;
        }
      }
      if (duplicate) {
        players.pop();
        i--;
      }
    }

    // Order by Species ordinal (Java used a bubble sort; enum values are the ordinals)
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        if (players[i].getSpe() > players[j].getSpe()) {
          const temp = players[j];
          players[j] = players[i];
          players[i] = temp;
        }
      }
    }

    return players;
  }

  private static createRandomPlayer(): PartyMember {
    // Random Species (biased random)
    const spes = [Specie.PALMAN, Specie.PALMAN, Specie.PALMAN, Specie.ANDROID, Specie.MOTAVIAN, Specie.MUSK_CAT, Specie.DEZORIAN];
    const rndSpe = spes[Math.floor(Math.random() * spes.length)];

    // Random Job for that species
    const jobs = this.map_spe_job.get(rndSpe)!;
    const rndJob = jobs[Math.floor(Math.random() * jobs.length)];

    // Random Gender
    const genders = [Gender.MALE, Gender.FEMALE];
    const rndGender = genders[Math.floor(Math.random() * genders.length)];

    // Random Name (matching the gender and species)
    let availableNames: string[] | null = null;
    for (const name of this.namelist) {
      if (name.gender === rndGender && name.spe === rndSpe) {
        availableNames = name.names;
      }
    }
    const nameSize = availableNames ? availableNames.length : 0;
    const rndName = nameSize > 0 ? availableNames![Math.floor(Math.random() * nameSize)] : "null";

    // Java passes a null charPath (no default equipment / sprite) for generated members
    return new PartyMember(rndGender, rndSpe, rndJob, rndName, "");
  }
}
