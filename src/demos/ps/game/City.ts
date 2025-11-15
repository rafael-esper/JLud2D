/**
 * City - City and Location Management
 * Defines all cities and locations in the PS universe
 */

import { PS1Music } from './PSLibMusic';
import { PSGame } from '../PSGame';

export enum Planet {
  PALMA, MOTAVIA, DEZORIS
}

export class PlanetHelper {
  private static readonly planetConfigs = new Map<Planet, { mapPath: string, music: PS1Music }>([
    [Planet.PALMA, { mapPath: "Palma.map", music: PS1Music.PALMA }],
    [Planet.MOTAVIA, { mapPath: "Motavia.map", music: PS1Music.MOTAVIA }],
    [Planet.DEZORIS, { mapPath: "Dezoris.map", music: PS1Music.DEZORIS }]
  ]);

  public static getMapPath(planet: Planet): string {
    return this.planetConfigs.get(planet)?.mapPath || "";
  }

  public static getMusic(planet: Planet): PS1Music {
    return this.planetConfigs.get(planet)?.music || PS1Music.PALMA;
  }
}

enum Flyable {
  YES, NO
}

export enum City {
  // Palma cities and villages
  CAMINEET,
  PAROLIT,
  SCION,
  EPPI,
  GOTHIC,
  BORTEVO,
  LOAR,
  ABION,
  DRASGOW,

  // Spaceports
  SPACEPORT1,
  SPACEPORT2,

  // Motavia cities and villages
  PASEO,
  UZO,
  CASBA,
  SOPIA,
  TONOE,

  // Dezoris locations
  SKURE_ENTRANCE,
  SKURE,
  AUKBA_ENTRANCE,
  AUKBA,

  // Special locations
  SKY_CASTLE
}

export class CityHelper {
  private static readonly cityConfigs = new Map<City, { x: number, y: number, planet: Planet, flyable: Flyable, music: PS1Music }>([
    // Palma cities and villages
    [City.CAMINEET, { x: 83, y: 49, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.TOWN }],
    [City.PAROLIT, { x: 73, y: 58, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.TOWN }],
    [City.SCION, { x: 101, y: 46, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.TOWN }],
    [City.EPPI, { x: 85, y: 80, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.GOTHIC, { x: 53, y: 58, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.BORTEVO, { x: 25, y: 51, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.LOAR, { x: 65, y: 31, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.ABION, { x: 13, y: 18, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.DRASGOW, { x: 118, y: 81, planet: Planet.PALMA, flyable: Flyable.YES, music: PS1Music.TOWN }],

    // Spaceports
    [City.SPACEPORT1, { x: 0, y: 0, planet: Planet.PALMA, flyable: Flyable.NO, music: PS1Music.TOWN }],
    [City.SPACEPORT2, { x: 0, y: 0, planet: Planet.MOTAVIA, flyable: Flyable.NO, music: PS1Music.TOWN }],

    // Motavia cities and villages
    [City.PASEO, { x: 78, y: 31, planet: Planet.MOTAVIA, flyable: Flyable.YES, music: PS1Music.TOWN }],
    [City.UZO, { x: 93, y: 64, planet: Planet.MOTAVIA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.CASBA, { x: 68, y: 86, planet: Planet.MOTAVIA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.SOPIA, { x: 18, y: 32, planet: Planet.MOTAVIA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],
    [City.TONOE, { x: 39, y: 84, planet: Planet.MOTAVIA, flyable: Flyable.YES, music: PS1Music.VILLAGE }],

    // Dezoris locations
    [City.SKURE_ENTRANCE, { x: 172, y: 73, planet: Planet.DEZORIS, flyable: Flyable.NO, music: PS1Music.DEZORIS }],
    [City.SKURE, { x: 172, y: 73, planet: Planet.DEZORIS, flyable: Flyable.YES, music: PS1Music.TOWN }],
    [City.AUKBA_ENTRANCE, { x: 184, y: 34, planet: Planet.DEZORIS, flyable: Flyable.NO, music: PS1Music.DEZORIS }],
    [City.AUKBA, { x: 184, y: 34, planet: Planet.DEZORIS, flyable: Flyable.YES, music: PS1Music.VILLAGE }],

    // Special locations
    [City.SKY_CASTLE, { x: 0, y: 0, planet: Planet.PALMA, flyable: Flyable.NO, music: PS1Music.TOWN }]
  ]);

  /**
   * Get visited cities from planet
   */
  public static getVisitedCitiesFromPlanet(chosenPlanet: Planet, visitedCities?: Set<City>): City[] {
    const lstCities: City[] = [];

    for (const [city, config] of this.cityConfigs) {
      if (config.planet === chosenPlanet &&
          config.flyable === Flyable.YES &&
          (visitedCities === undefined || visitedCities.has(city))) {
        lstCities.push(city);
      }
    }

    return lstCities;
  }

  /**
   * Get all cities
   */
  public static getAllCities(): City[] {
    return Array.from(this.cityConfigs.keys());
  }

  /**
   * Get city X coordinate
   */
  public static getX(city: City): number {
    return this.cityConfigs.get(city)?.x || 0;
  }

  /**
   * Get city Y coordinate
   */
  public static getY(city: City): number {
    return this.cityConfigs.get(city)?.y || 0;
  }

  /**
   * Get city music
   */
  public static getMusic(city: City): PS1Music {
    return this.cityConfigs.get(city)?.music || PS1Music.TOWN;
  }

  /**
   * Get city planet
   */
  public static getPlanet(city: City): Planet {
    return this.cityConfigs.get(city)?.planet || Planet.PALMA;
  }

  /**
   * Check if city is flyable
   */
  public static isFlyable(city: City): boolean {
    return this.cityConfigs.get(city)?.flyable === Flyable.YES;
  }

  /**
   * Get localized city name
   */
  public static toString(city: City): string {
    const s = city.toString();
    const formatted = s.substring(0, 1) + s.substring(1).toLowerCase();
    return PSGame.getString(`City_${formatted}`);
  }

  /**
   * Get map path
   */
  public static getPath(city: City): string {
    const name = city.toString();
    const formatted = name.substring(0, 1) + name.substring(1).toLowerCase() + ".map";
    return `maps/${formatted}`;
  }
}