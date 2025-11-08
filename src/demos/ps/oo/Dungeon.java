package demos.ps.oo;

import demos.ps.PSDungeon.DungeonType;
import demos.ps.oo.PSLibMusic.PS1Music;
import domain.Entity;

enum Dark { TRUE, FALSE};

public enum Dungeon { 
	NONE (0, 0, 0, null, Dark.FALSE, null, null),
	WAREHOUSE (11, 6, Entity.NORTH, "dungeons/Warehouse.map", Dark.FALSE, DungeonType.GREEN, PS1Music.TOWN),
	ODIN_CAVE (12, 11, Entity.NORTH, "dungeons/Odin_cave.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE),
	IALA (14, 13, Entity.NORTH, "dungeons/Iala.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE),
	NAULA (3, 1, Entity.WEST, "dungeons/Naula.map", Dark.TRUE, DungeonType.COLOR, PS1Music.CAVE),
	GOTHIC_PASSAGEWAY_IN (4, 13, Entity.NORTH, "dungeons/Gothic_passageway.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE),
	GOTHIC_PASSAGEWAY_OUT (4, 2, Entity.SOUTH, "dungeons/Gothic_passageway.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE), 
	PRISON_IN (14, 12, Entity.NORTH, "dungeons/Prison.map", Dark.FALSE, DungeonType.GREY, PS1Music.CAVE),
	PRISON_OUT (4, 2, Entity.SOUTH, "dungeons/Prison.map", Dark.FALSE, DungeonType.GREY, PS1Music.CAVE),
	TRIADA (2, 12, Entity.NORTH, "dungeons/Triada.map", Dark.FALSE, DungeonType.GREY, PS1Music.CAVE),
	BORTEVO_IN (15, 13, Entity.NORTH, "dungeons/Bortevo_cave.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE),
	BORTEVO_OUT (2, 2, Entity.SOUTH, "dungeons/Bortevo_cave.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE),
	ABION_DUNGEON_IN (2,12, Entity.NORTH, "dungeons/Abion_dungeon.map", Dark.FALSE, DungeonType.GREEN, PS1Music.CAVE),
	ABION_DUNGEON_OUT (14,0, Entity.WEST, "dungeons/Abion_dungeon.map", Dark.FALSE, DungeonType.GREEN, PS1Music.CAVE),
	DRASGOW_DUNGEON (1, 14, Entity.NORTH, "dungeons/Drasgow_dungeon.map", Dark.FALSE, DungeonType.GREEN, PS1Music.TOWN), // LIGHT_BLUE
	CAVE_BAYA_IN (8, 6, Entity.NORTH, "dungeons/Baya_cave.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE),
	CAVE_BAYA_OUT (3, 2, Entity.EAST, "dungeons/Baya_cave.map", Dark.TRUE, DungeonType.BLUE, PS1Music.CAVE),
	LOST_ISLAND (7, 13, Entity.NORTH, "dungeons/Lost_island.map", Dark.TRUE, DungeonType.GREEN, PS1Music.TOWER),
	MEDUSA_TOWER (25, 13, Entity.NORTH, "dungeons/Medusa_tower.map", Dark.TRUE, DungeonType.FIRE, PS1Music.TOWER),
	BAYA_MALAY (25, 27, Entity.NORTH, "dungeons/Baya_malay.map", Dark.TRUE, DungeonType.ORANGE, PS1Music.TOWER),

	GOVERNOR_IN (4, 12, Entity.NORTH, "dungeons/Governor.map", Dark.FALSE, DungeonType.YELLOW, PS1Music.PALACE),
	GOVERNOR_OUT (1, 5, Entity.SOUTH, "dungeons/Governor.map", Dark.FALSE, DungeonType.YELLOW, PS1Music.PALACE),
	NAHARU (9, 6, Entity.EAST, "dungeons/Naharu.map", Dark.TRUE, DungeonType.MOTA, PS1Music.CAVE),
	CASBA_CAVE_IN (3, 13, Entity.NORTH, "dungeons/Casba_cave.map", Dark.TRUE, DungeonType.MOTA, PS1Music.CAVE),
	CASBA_CAVE_OUT (10, 13, Entity.NORTH, "dungeons/Casba_cave.map", Dark.TRUE, DungeonType.MOTA, PS1Music.CAVE),
	TAJIMA_CAVE (9, 13, Entity.NORTH, "dungeons/Tajima_cave.map", Dark.TRUE, DungeonType.MOTA, PS1Music.CAVE),
	BLUEBERRY_MINE (9, 11, Entity.NORTH, "dungeons/Blueberry.map", Dark.TRUE, DungeonType.COLOR, PS1Music.CAVE),
	DARKFALZ_DUNGEON (6, 14, Entity.NORTH, "dungeons/Darkfalz.map", Dark.FALSE, DungeonType.YELLOW, PS1Music.PALACE),

	SKURE_TUNNEL_IN (9, 12, Entity.NORTH, "dungeons/Skure_tunnel.map", Dark.FALSE, DungeonType.COLD, PS1Music.CAVE),
	SKURE_TUNNEL_OUT (1, 8, Entity.NORTH, "dungeons/Skure_tunnel.map", Dark.FALSE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE1_IN (1, 12, Entity.NORTH, "dungeons/Dezo_cave1.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE1_OUT (1, 1, Entity.SOUTH, "dungeons/Dezo_cave1.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE2_IN (12, 11, Entity.WEST, "dungeons/Dezo_cave2.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE2_OUT (7, 5, Entity.SOUTH, "dungeons/Dezo_cave2.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE3_IN (4, 11, Entity.NORTH, "dungeons/Dezo_cave3.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE3_OUT (2, 3, Entity.SOUTH, "dungeons/Dezo_cave3.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE4_IN (1, 10, Entity.NORTH, "dungeons/Dezo_cave4.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE4_OUT (8, 3, Entity.SOUTH, "dungeons/Dezo_cave4.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE_AUKBA_IN (2, 18, Entity.EAST, "dungeons/Dezo_cave_aukba.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	DEZO_CAVE_AUKBA_OUT (12, 5, Entity.WEST, "dungeons/Dezo_cave_aukba.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	AUKBA_TUNNEL_IN (14, 12, Entity.NORTH, "dungeons/Aukba_tunnel.map", Dark.FALSE, DungeonType.COLD, PS1Music.CAVE),
	AUKBA_TUNNEL_OUT (8, 7, Entity.NORTH, "dungeons/Aukba_tunnel.map", Dark.FALSE, DungeonType.COLD, PS1Music.CAVE),
	PRISM_CAVE (12, 13, Entity.NORTH, "dungeons/Prism_cave.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	CORONA (1, 13, Entity.NORTH, "dungeons/Corona.map", Dark.FALSE, DungeonType.RUBY, PS1Music.TOWER),
	GUARON_MORGUE (14, 14, Entity.WEST, "dungeons/Guaron_morgue.map", Dark.TRUE, DungeonType.GREY, PS1Music.CAVE),
	FROST_CAVE (3, 13, Entity.NORTH, "dungeons/Frost_cave.map", Dark.TRUE, DungeonType.COLD, PS1Music.CAVE),
	
	LASSIC_CASTLE (6, 13, Entity.NORTH, "dungeons/Lassic_castle.map", Dark.FALSE, DungeonType.YELLOW, PS1Music.PALACE),

	;
	
	private int x, y, dir;
	private boolean isDark;
	String mapPath;
	DungeonType type;
	PS1Music music;
	
	private Dungeon(int x, int y, int dir, String mapPath, Dark dark, DungeonType type, PS1Music music) {
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.type = type;
		this.mapPath = mapPath;
		this.music = music;
		if(dark == Dark.TRUE) {
			this.isDark = true;
		} else {
			this.isDark = false;
		}
	}
		
	public int getX() {
		return x;
	}
	public int getY() {
		return y;
	}
	public int getDir() {
		return dir;
	}
	public DungeonType getType() {
		return type;
	}

	public String getPath() {
		return mapPath;
	}

	public boolean isDark() {
		return isDark;
	}
	public PS1Music getMusic() {
		return music;
	}	
};




