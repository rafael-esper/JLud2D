package demos.ak;

import static core.Script.*;
import static core.Controls.*;

import java.awt.Color;
import java.awt.Font;

import javax.swing.JApplet;

import core.MainEngine;
import domain.CHR;
import domain.VImage;
import domain.VSound;

public class AK extends JApplet {

  protected static Font sys_font = new Font("Monospaced", Font.BOLD, 12);

  public void init() {
    AK.main(null);
  }

  public static void main(String args[]) {

    setSystemPath(new AK().getClass());
    MainEngine.initMainEngine(args);
  }

  /*  STATE       COND        ACTION      FACE        DIRECTION
  0   Stopped     None        Normal      Left        Left
  1   Walking     Walking     Punching    Right       Right
  2   Jumping     Swimming    Trembling               Up
  3   Falling     Moto                                Down
  4               Surf                                Diagonal-DownLeft
  5               Heli                                Diagonal-DownRight
  6               Fly
  7               Star
  8               Shinobi Walk
  9               Shinobi Swim
  */

  private static final int SPEED = 3;
  private static final int FALL = 6;    // air resistance. The higher, slower the falling
  private static final int GRAV = 5;    // gravity velocity. The higher, faster the falling
  private static final int GRAV_EF = 50; // gravity threshold
  private static final int MAXVEL = 15; // maximum walking velocity
  private static final int MAXJUMP = 48; // maximum jump height
  private static final int FRIC_NOR = 5; // normal friction
  private static final int MAXSWIM = 8; // normal swim velocity
  private static final int MAXRSWIM = 12; // fast swim velocity
  private static final int MAXHELI = 12;
  private static final int MAXFLY = 8;
  private static final int MAXSTAR = 24;

  private static final int MINMOTO = 12;
  private static final int MAXMOTO = 26;
  private static final int ALTMOTO = 56; // max jumping height with moto

  private static final int MINSURF = 10;
  private static final int MAXSURF = 25;
  private static final int ALTSURF = 50; // altura maxima de pulo com lancha

  private static enum Condition {WALK, SWIM, MOTO, SURF, HELI, FLY, STAR, ROPE, SHIW, SHIS};
  private static enum Status {STOPPED, WALKING, JUMPING, FALLING, DUCKING};
  private static enum Action {NONE, PUNCHING, TREMBLING};

  private static final int EAST = 0;
  private static final int WEST = 1;
  private static final int NORTH = 2;
  private static final int SOUTH = 3;

  private static final int DUST = 50;
  private static final int BIGDUST = 51;

  private static int zx, zy, mapx, mapy, gotox, gotoy;
  private static int Gold = 200, Prog = 0, gameSpeed = 1, Energy;
  
  private static Condition condition;
  private static Status state;
  private static Action action;
  
  static boolean hasBrac = false;
  
  private static int velocity, friction, vertical, zonecalled, playerframe, alt, pdelay, tdelay,
      monsterframe, wind, invencible;
  private static int akidd_px, akidd_py, akidd_vx, akidd_vy;
  private static boolean debug;
  private static VImage mapa, rock_t, rock_g, rock_c, leaf, brac0, brac1, firing, shop;
  private static VSound snd[] = new VSound[20];

  // For rock fragments and other sprites, (x,y),energy and type
  private static int spx[] = new int[25];
  private static int spy[] = new int[25];
  private static int spe[] = new int[25];
  private static int spt[] = new int[25];

  private static String levelName, currentMusic, currentLevel;

  // Resources
  private static final String MUSIC_FIELD = "res/music/field.vgz";
  private static final String MUSIC_SWIM = "res/music/swim.vgz";
  private static final String MUSIC_MOTO = "res/music/moto.vgz";
  private static final String MUSIC_INTRO = "res/music/intro.vgz";
  
  
  private static final int NULL_TILE = 0, NULL_ZONE = 0;
  
  // Zones (Meta)
  private static final int ZONE_GOLD1 = 1;
  private static final int ZONE_GOLD2 = 2;
  private static final int ZONE_ROCK = 3;
  private static final int ZONE_STAR = 4;
  private static final int ZONE_RICE = 5;
  private static final int ZONE_SWIM = 6;
  private static final int ZONE_ITEM = 7;
  private static final int ZONE_SKULL = 8;
  private static final int ZONE_DEATH = 9;
  private static final int ZONE_WIND_IN = 10;
  private static final int ZONE_WIND_OUT = 11;
  private static final int ZONE_STAIR = 12;
  private static final int ZONE_MOTO_SHOP = 13;
  private static final int ZONE_BRACELET = 14;
  private static final int ZONE_HELI_SHOP = 15;
  
  // Tiles
  private static final int TILE_LAYER = 1;
  private static final int TILE_GOLD_BIG = 12;
  private static final int TILE_GOLD_SMALL = 13;

  private static boolean changemap = false;

  public static void autoexec() {
    setAppName("Alex Kidd: Remake");

    VImage title = new VImage(load("res/image/Title.PNG"));
    playmusic(load(MUSIC_INTRO));
    Color background = new Color(-86);

    timer = 0;
    while (!b1) {
      screen.blit(0, 0, title);

      if (timer < 75) {
        screen.rectfill(210, 4, 295, 50, background);
      }
      if (timer < 150) {
        screen.rectfill(134, 134, 233, 169, background);
      }
      if (timer < 225) {
        screen.rectfill(32, 7, 76, 60, background);
      }
      if (timer < 300) {
        screen.rectfill(265, 72, 301, 156, background);
      }
      if (timer < 375) {
        screen.rectfill(25, 78, 108, 194, background);
      }

      if (timer < 400 || timer % 50 < 25)
        screen.rectfill(88, 207, 228, 218, background);

      if (b3) {
        exit("Thanks for playing Alex Kidd remake!");
      }

      showpage();
    }
    unpress(1);

    Gold = 0;
    StartUp();
  }

  static void Mapswitch(String mapname, int x, int y, int ix, int iy, String music, Condition initialCondition, String levelName) {
    gotox = x;
    gotoy = y; // player coordinates
    mapx = ix;
    mapy = iy; // map coordinates
    currentMusic = music;
    currentLevel = levelName;
    condition = initialCondition;
    invencible = 0;
    if (Prog > 0)
      changemap = true;
    map(mapname);
  }


  static void DoLevel() { // Hills, Lake, Field/Grass, Cave, Forest, Castle
    // if(Prog==1) Mapswitch("Level30.map.json",1,34,277,190,MUSIC_FIELD, Condition.WALK, ""); // Castle
    if (Prog <= 1)
      Mapswitch("level01.map.json", 2, 4, 277, 190, MUSIC_FIELD, Condition.WALK, "Mount Nibana"); // Hills
    if (Prog == 2)
      Mapswitch("level02.map.json", 2, 5, 290, 182, MUSIC_FIELD, Condition.WALK, "Tatadero's Pond"); // Lake
    if (Prog == 3)
      Mapswitch("level03.map.json", 2, 10, 279, 177, MUSIC_FIELD, Condition.WALK, "Plains of Tatadero"); // Field (C)
    if (Prog == 4)
      Mapswitch("level04.map.json", 8, 15, 282, 160, MUSIC_FIELD, Condition.WALK, "Cave of Moonnight"); // Cave
    if (Prog == 5)
      Mapswitch("level05.map.json", 8, 2, 290, 152, MUSIC_SWIM, Condition.SWIM, "Lake Bimurai"); // Lake
    if (Prog == 6)
      Mapswitch("level06.map.json", 2, 15, 282, 144, MUSIC_FIELD, Condition.WALK, "Grassland of Bimurai"); // Grass (City)
    if (Prog == 7)
      Mapswitch("level07.map.json", 2, 14, 290, 115, MUSIC_FIELD, Condition.WALK, "City of Bimurai"); // Hills
    if (Prog == 8)
      Mapswitch("level08.map.json", 4, 14, 267, 113, MUSIC_FIELD, Condition.WALK, "Woods of Totj"); //
    if (Prog == 9)
      Mapswitch("level09.map.json", 2, 14, 245, 109, MUSIC_FIELD, Condition.WALK, "Marshes of Ending"); // Marshes
    if (Prog == 10)
      Mapswitch("level10.map.json", 8, 73, 234, 105, MUSIC_FIELD, Condition.WALK, "Mountain of Dabresh"); // Cave (Mountain)
    if (Prog == 11)
      Mapswitch("level11.map.json", 4, 14, 229, 90, MUSIC_FIELD, Condition.WALK, "Rooftop of Dabresh"); // Wood
    if (Prog == 12)
      Mapswitch("level12.map.json", 9, 2, 232, 87, MUSIC_FIELD, Condition.WALK, "Falling from the Peak"); // Fall
    if (Prog == 13)
      Mapswitch("level13.map.json", 26, 7, 221, 96, MUSIC_FIELD, Condition.WALK, "Rockland"); // Hills
    if (Prog == 14)
      Mapswitch("level14.map.json", 1, 72, 216, 107, MUSIC_FIELD, Condition.WALK, "Valley Patarai"); // Grass
    if (Prog == 15)
      Mapswitch("level15.map.json", 2, 13, 229, 115, MUSIC_SWIM, Condition.SURF, "River Patarai"); // Lake
    if (Prog == 16)
      Mapswitch("level16.map.json", 2, 10, 211, 134, MUSIC_FIELD, Condition.WALK, "Field of Zo"); // Cave (starting on field)
    if (Prog == 17)
      Mapswitch("level17.map.json", 2, 174, 197, 139, MUSIC_FIELD, Condition.WALK, "Forest of Zozo"); // Wood (vertical)
    if (Prog == 18)
      Mapswitch("level18.map.json", 2, 14, 180, 136, MUSIC_FIELD, Condition.WALK, "Turquoise Plains"); // Grass+Wood
    if (Prog == 19)
      Mapswitch("level19.map.json", 1, 12, 212, 126, MUSIC_FIELD, Condition.WALK, "Challenge 1"); // Secret1 (eagle)
    if (Prog == 20)
      Mapswitch("level20.map.json", 1, 12, 212, 126, MUSIC_SWIM, Condition.SWIM, "Challenge 2"); // Secret2 (fish)
    if (Prog == 21)
      Mapswitch("level21.map.json", 1, 12, 212, 126, MUSIC_FIELD, Condition.WALK, "Challenge 3"); // Secret3 (bull)
    if (Prog == 22)
      Mapswitch("level22.map.json", 1, 12, 212, 126, MUSIC_FIELD, Condition.WALK, "Challenge 4"); // Secret3 (bat/owl)

    
    // if(Prog==23) Mapswitch("MFase1.map.json",3,5,228,86,MUSIC_FIELD, Condition.WALK, ""); // Hills
    // Miracle World
    // if(Prog==24) Mapswitch("MFase3.map.json",4,5,228,86,MUSIC_SWIM, Condition.SWIM, ""); // Lake
    // Miracle World
    // if(Prog==25) Mapswitch("MFase2.map.json",4,12,228,86,MUSIC_FIELD, Condition.WALK, ""); // Field
    // Miracle World

    if (Prog >= 23)
      exit("Thanks for playing...");

    if (Prog == 0)
      Prog++; // for start-up purposes
    
    Prog++;
  }

  static void StartUp() {
    if (Prog == 0) {
      rock_t = new VImage(load("res/image/Rock_t.gif"));
      rock_g = new VImage(load("res/image/Rock_g.gif"));
      rock_c = new VImage(load("res/image/Rock_c.gif"));
      leaf = new VImage(load("res/image/leaf.gif"));
      brac0 = new VImage(load("res/image/brac0.gif"));
      brac1 = new VImage(load("res/image/brac1.gif"));
      firing = new VImage(load("res/image/firing.gif"));
      shop = new VImage(load("res/image/shopkeep.png"));
      mapa = new VImage(load("res/image/world.gif"));


      snd[1] = new VSound(load("res/sound/Mapa.mp3"));
      snd[2] = new VSound(load("res/sound/Gold.wav"));
      snd[3] = new VSound(load("res/sound/Punch.wav"));
      snd[4] = new VSound(load("res/sound/Rock.wav"));
      snd[5] = new VSound(load("res/sound/Star.wav"));
      snd[6] = new VSound(load("res/sound/Death.wav"));
      snd[7] = new VSound(load("res/sound/Hit.wav"));
      snd[8] = new VSound(load("res/sound/Brac.wav"));
      snd[9] = new VSound(load("res/sound/Item.wav"));
      snd[10] = new VSound(load("res/sound/Water.wav"));

      levelName = "Ak.anim.json";
    }

    DoLevel();
  }

  static void showMapScreen() {

    stopmusic();
    playsound(snd[1]);
    wait(20);

    int bullet = 0;
    while (!b1) {
      if (bullet > 12)
        bullet = 0;
      bullet++;
      screen.rectfill(0, 0, 320, 240, Color.BLACK);
      screen.blit(0, 0, mapa);
      screen.printString(10, 225, sys_font, "Level " + (Prog - 1) + ": " + currentLevel);

      if (bullet < 6)
        screen.circlefill(mapx, mapy, bullet, bullet, Color.RED);
      if (bullet >= 6)
        screen.circlefill(mapx, mapy, 10 - bullet, 10 - bullet, Color.RED);
      wait(1);
      showpage();
    }
  }

  static int selectLevelMenu(int sx, int sy) {
    int bx = 0, by = 0;
    while (true) {
      if (left) {
        unpress(7);
        bx--;
      }
      if (right) {
        unpress(8);
        bx++;
      }
      if (up) {
        unpress(5);
        by--;
      }
      if (down) {
        unpress(6);
        by++;
      }
      if (b1)
        return (by * sx) + bx + 1;
      if (bx < 0)
        bx = sx - 1;
      if (bx >= sx)
        bx = 0;
      if (by < 0)
        by = sy - 1;
      if (by >= sy)
        by = 0;

      screen.rectfill(100, 100, 100 + (20 * sx), 105 + (20 * sy), Color.BLACK);
      screen.rect(99, 99, 100 + (20 * sx), 105 + (20 * sy), Color.WHITE);
      screen.rect(98, 98, 101 + (20 * sx), 106 + (20 * sy), Color.WHITE);
      for (int i = 0; i < sx; i++) {
        for (int j = 0; j < sy; j++)
          screen.printString(105 + (i * 20), 110 + (j * 20), sys_font, str((j * sx) + i + 1));
      }
      screen.printString(105 + (bx * 20), 115 + (by * 20), sys_font, "=");
      showpage();
    }
  }

  static void callEvent(int num) {
    switch (num) {
      case ZONE_GOLD1: // Gold I
        current_map.settile(zx, zy, TILE_LAYER, NULL_TILE);
        current_map.setzone(zx, zy, NULL_ZONE);
        playsound(snd[2]);
        Gold += 20;
        break;

      case ZONE_GOLD2: // Gold II
        current_map.settile(zx, zy, TILE_LAYER, NULL_TILE);
        current_map.setzone(zx, zy, NULL_ZONE);
        playsound(snd[2]);
        Gold += 10;
        break;

      case ZONE_ROCK: // Rock
        playsound(snd[4]);
        if (current_map.gettile(zx, zy, 1) == 32 || current_map.gettile(zx, zy, 1) == 52)
          addSprite(zx << 4, zy << 4, 3); // cave rock
        else if (current_map.gettile(zx, zy, 1) == 65 || condition == Condition.SWIM)
          addSprite(zx << 4, zy << 4, 2); // sea rock
        else
          addSprite(zx << 4, zy << 4, 1); // common rock
        current_map.settile(zx, zy, TILE_LAYER, NULL_TILE);
        current_map.setzone(zx, zy, NULL_ZONE);
        current_map.setobs(zx, zy, 0);
        break;

      case ZONE_STAR: // Star
        playsound(snd[5]);
        current_map.setobs(zx, zy, 0);
        if (random(0, 1) == 0) {
          current_map.settile(zx, zy, TILE_LAYER, TILE_GOLD_BIG);
          current_map.setzone(zx, zy, ZONE_GOLD1);
        } else {
          current_map.settile(zx, zy, TILE_LAYER, TILE_GOLD_SMALL);
          current_map.setzone(zx, zy, ZONE_GOLD2);
        }
        addSprite(zx << 4, zy << 4, 0);
        break;

      case ZONE_RICE: // Rice
        current_map.settile(zx, zy, TILE_LAYER, NULL_TILE);
        current_map.setzone(zx, zy, NULL_ZONE);
        DoLevel();
        break;

      case ZONE_SWIM: // Swim
        if (condition != Condition.SWIM && condition != Condition.STAR) {
          condition = Condition.SWIM;
          state = Status.STOPPED;
          stopmusic();
          playsound(snd[10]);
          vertical = 0;
          alt = 0;
          hasBrac = false;
          for (int j = 0; j < 12; j++) {
            entities.get(player).incy(2);
            entities.get(player).setSpecframe(showplayer());
            processEnemies();
            processSprites();
            processMisc();
            screen.render();
            showpage();
            wait(1);
          }
          currentMusic = MUSIC_SWIM;
          playmusic(load(currentMusic));
        }
        break;

      case ZONE_ITEM: // Item (CHANGE!)
        playsound(snd[4]);
        current_map.settile(zx, zy, TILE_LAYER, NULL_TILE);
        current_map.setzone(zx, zy, NULL_ZONE);
        current_map.setobs(zx, zy, 0);
        addSprite(zx << 4, zy << 4, 0);
        break;

      case ZONE_SKULL: // Skull
        playsound(snd[4]);
        current_map.settile(zx, zy, TILE_LAYER, NULL_TILE);
        current_map.setzone(zx, zy, NULL_ZONE);
        current_map.setobs(zx, zy, 0);
        addSprite(zx << 4, zy << 4, 0);
        if (!hasBrac)
          action = Action.TREMBLING;
        break;

      case ZONE_DEATH: // Getkilled
        hitPlayer(2);
        break;

      case ZONE_WIND_IN: // Air Wind In
        wind = 4;
        break;

      case ZONE_WIND_OUT: // Air Wind Out
        wind = 0;
        break;

      case ZONE_STAIR: // Stair
        /* TODO Implement
         * if(up || down) { entity.get(player).x = zx*16; //entity.get(player).x = zx*16;
         * State=Status.STOPPED; Cond = Condition.ROPE; }
         */
        break;

      case ZONE_MOTO_SHOP: // Moto Shop
        callShop(1);
        break;

      case ZONE_BRACELET: // Item: Power Bracelet
        current_map.settile(zx, zy, TILE_LAYER, NULL_TILE);
        current_map.setzone(zx, zy, NULL_ZONE);
        hasBrac = true;
        break;

      case ZONE_HELI_SHOP: // Heli Shop
        callShop(2);
        break;


    }
  }

  private static void callShop(int type) {
    if (up && condition != Condition.MOTO && condition != Condition.HELI) {
      unpress(5);
      boolean selYes = true;
      while (!b1 && !b2) {
        screen.render();
        screen.rectfill(70, 45, 250, 150, Color.BLACK);
        screen.printString(80, 60, sys_font, "Do you want to buy the");
        if (type == 1)
          screen.printString(80, 85, sys_font, " Motocycle for $200?");
        if (type == 2)
          screen.printString(80, 85, sys_font, " Peticopter for $200?");
        screen.printString(120, 110, sys_font, "YES");
        screen.printString(120, 130, sys_font, "NO");
        screen.tblit(200, 110, shop);
        screen.printString(105, selYes ? 110 : 130, sys_font, ">");

        if (up || down) {
          selYes = !selYes;
          unpress(5);
          unpress(6);
        }
        showpage();
      }
      if (b1) {
        unpress(1);
        if (selYes && Gold >= 200) {
          Gold -= 200;
          if (type == 1) {
            condition = Condition.MOTO;
            playmusic(load(MUSIC_MOTO));
          }
          if (type == 2) {
            condition = Condition.HELI;
            playmusic(load(MUSIC_SWIM));
          }
        }
      }
      unpress(5);
    }

  }

  public static void game() {
    showMapScreen();
    if (Prog == 0)
      StartUp();

    // This changes all 'monster.chr' entities to load the CHR info from an image file
    CHR c = CHR.loadChr("monster.anim.json");
    CHR bigC = CHR.loadChr("Big.anim.json");
    for (int i = 0; i < numentities; i++) {
      if (entities.get(i).getChrname().equalsIgnoreCase("monster.anim.json")) {
    	  entities.get(i).setChr(c);
      } else {
    	  entities.get(i).setChr(bigC);  
      }
    }

    player = entityspawn(gotox, gotoy, levelName);
    setplayer(player);
    // cameratracking = 1;
    setNormalCondition(condition);

    entities.get(player).setx(gotox << 4);
    entities.get(player).sety(gotoy << 4);

    while (true) {
      if (changemap) {
        changemap = false;
        break;
      }

      wait(gameSpeed);
      screen.render();
      controlKeys();
      processZones();
      if (condition == Condition.WALK || condition == Condition.MOTO || condition == Condition.SURF || condition == Condition.SHIW)
        movePlayer();
      else
        swimPlayer();
      if (condition != Condition.SHIW && condition != Condition.SHIS)
        entities.get(player).setSpecframe(showplayer());
      else
        entities.get(player).setSpecframe(showplayer()); // Shinobi
      processEnemies();
      processSprites();
      processMisc();
      showpage();
    }
  }


  static void setNormalCondition(Condition nCond) {
    stopmusic();
    unpress(0);
    condition = nCond;
    state = Status.STOPPED;
    action = Action.NONE;
    wind = 0;
    vertical = 0;
    alt = 0;
    hasBrac = false;
    entities.get(player).setSpeed(0);
    velocity = 0;
    pdelay = 0;
    tdelay = 0;
    timer = 0;
    friction = FRIC_NOR;
    entities.get(player).setFace(1);
    Energy = 3;
    playmusic(load(currentMusic));
  }

  static void controlKeys() {
    UpdateControls();

    if (getkey(SCAN_1))
      gameSpeed = 0;
    if (getkey(SCAN_2))
      gameSpeed = 1;
    if (getkey(SCAN_3))
      gameSpeed = 2;
    if (getkey(SCAN_4))
      gameSpeed = 3;
    if (getkey(SCAN_A)) {
      debug = true;
      while (!b1)
        UpdateControls();
    }
    if (getkey(SCAN_B))
      hasBrac = true;
    if (getkey(SCAN_F)) {
      condition = Condition.FLY;
      state = Status.STOPPED;
    }
    if (getkey(SCAN_H)) {
      condition = Condition.HELI;
      playmusic(load(MUSIC_SWIM));
    } 
    if (getkey(SCAN_I))
      invencible = 100000;
    if (getkey(SCAN_K))
      hitPlayer(2);
    if (getkey(SCAN_L)) {
      Prog = selectLevelMenu(6, 4);
      DoLevel();
    }
    if (getkey(SCAN_M)) {
      condition = Condition.MOTO;
      playmusic(load(MUSIC_MOTO));
    }
    if (getkey(SCAN_N)) {
      Gold += 200;
      setNormalCondition(Condition.WALK);
    }
    if (getkey(SCAN_P)) {
      // copyimagetoclipboard(screen);
      VImage img = new VImage(current_map.getWidth() * 16, current_map.getHeight() * 16);
      current_map.render(xwin, ywin, img);
      img.copyImageToClipboard();
    }
    // if(getkey(SCAN_R]) setRandomAlex(1);
    if (getkey(SCAN_S)) {
      condition = Condition.SURF;
      playmusic(load(MUSIC_SWIM));
    }
    if (getkey(SCAN_X))
      condition = Condition.STAR;
    // if(getkey(SCAN_Z)) {Cond=Condition.SHIW;changeCHR(player, "shinobi.chr");}


    if (right && left && state == Status.WALKING) {
      state = Status.STOPPED;
      velocity = 0;
    }

    switch (condition) {
      case WALK:    case SHIW:
        controlWalk();
        break;

      case SWIM:    case SHIS:
        controlSwim();
        break;

      case MOTO:
        controlVehicle(MINMOTO, MAXMOTO, ALTMOTO);
        vehicleAttack();
        break;

      case SURF:
        controlVehicle(MINSURF, MAXSURF, ALTSURF);
        break;

      case HELI:    case FLY:
        controlSwim();
        break;

      case STAR:
        controlSwim();
        vehicleAttack();
        break;

      case ROPE:
        controlRope();
        break;
    }

    if (condition != Condition.MOTO && condition != Condition.STAR && condition != Condition.ROPE) {
      if (b1 || pdelay > 0) // punch, bracelete, tiro (button b1)
      {
        if (tdelay == 0)
          punch();
        if (pdelay == 2) {
          if (hasBrac && condition == Condition.WALK)
            addSprite(entities.get(player).getx() + (entities.get(player).getFace() * 30),
                entities.get(player).gety() + 14, 12 + entities.get(player).getFace()); // bracelete
          if (condition == Condition.HELI || condition == Condition.SURF)
            addSprite(entities.get(player).getx() + (entities.get(player).getFace() * 30),
                entities.get(player).gety() + 14, 14 + entities.get(player).getFace()); // tiro
        }
      }
      if (!left && !right && state == Status.WALKING && condition != Condition.SURF) {
        state = Status.STOPPED;
        velocity = friction * velocity / 10;
      }
      if (action == Action.TREMBLING || tdelay > 0)
        tremble();
    }

  }

  static void controlWalk()// %%%%%%%%%%%%%%%%%% WALKING %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  {
    if (action != Action.TREMBLING) // not trembling
    {
      if (state != Status.DUCKING) {
        if (right) // && Cond==Condition.WALK)
        {
          velocity += 10 * SPEED / friction;
          if (state == Status.STOPPED)
            state = Status.WALKING;
          if (entities.get(player).getFace() != 1) {
            entities.get(player).setFace(1);
            velocity = friction * velocity / 10;
          }
        }
        if (left) // && Cond==Condition.WALK)
        {
          velocity -= 10 * SPEED / friction;
          if (state == Status.STOPPED)
            state = Status.WALKING;
          if (entities.get(player).getFace() != 0) {
            entities.get(player).setFace(0);
            velocity = friction * velocity / 10;
          }
        }
      }
      if (up && processZones() == 12)
        condition = Condition.ROPE;

      if (down && velocity == 0)
        state = Status.DUCKING;
      else if (!down && state == Status.DUCKING)
        state = Status.STOPPED;
    }

    checkJumpFalling(MAXJUMP);
    velocityCheck(MAXVEL);
  }

  static void controlRope() // %%%%%%%%%%%%%%%%%% ROPE, up or down %%%%%%%%%%%%%%%%%%%%%%%
  {
    velocity = 0;

    if (processZones() != 12) {
      condition = Condition.WALK;
      return;
    }

    if (right || left)
      condition = Condition.WALK;

    if (up) {
      state = Status.JUMPING;
      vertical--;
    }
    if (down) {
      if (getObsd(SOUTH) == 0) {
        state = Status.FALLING;
        vertical++;
      } else {
        state = Status.STOPPED;
        vertical = 0;
      }
    }

    if (!up && !down) {
      state = Status.STOPPED;
      vertical = 0;
    }

    if (vertical > 3)
      vertical = 3;
    if (vertical < -3)
      vertical = -3;

  }

  static void controlSwim() // %%%%%%%%%%%%%%%%%% SWIMMING, HELI AND STAR %%%%%%%%%%%%%%%%%%%%%%%
  {
    if (action == Action.TREMBLING)
      return;

    if (right) {
      velocity += SPEED;
      if (entities.get(player).getFace() != 1) {
        entities.get(player).setFace(1);
        velocity = velocity >> 2;
      }
    }
    if (left) {
      velocity -= SPEED;
      if (entities.get(player).getFace() != 0) {
        entities.get(player).setFace(0);
        velocity = velocity >> 2;
      }
    }

    if (up)
      vertical -= (condition.ordinal() / 2); // TODO Check how it works (was Cond/2)
    if (down) {
      if (condition == Condition.SWIM || condition == Condition.FLY)
        vertical += 2;
      if (condition == Condition.HELI)
        vertical++;
      if (condition == Condition.STAR)
        vertical += 3;
    }
    if (!right && velocity > 0)
      velocity--;
    if (!left && velocity < 0)
      velocity++;
    if (!up && vertical < 0)
      vertical = 0;

    // Destroy vehicle if has obstacle over it
    if (condition == Condition.HELI && getObsd(NORTH) != 0) {
      addSprite(entities.get(player).getx() - 24 + entities.get(player).getFace() * 32, entities.get(player).gety(), 4);
      setNormalCondition(Condition.WALK);
      state = Status.JUMPING;
      entities.get(player).incy(16);
      return;
    }

    if (condition == Condition.SWIM) {
      if (vertical <= -3)
        vertical = -2;
      if (!down && vertical > 0)
        vertical--;
      if (b1 && action == Action.NONE)
        velocityCheck(MAXRSWIM);
      else
        velocityCheck(MAXSWIM);
    } else if (condition == Condition.HELI)
      velocityCheck(MAXHELI);
    else if (condition == Condition.FLY) {
      velocityCheck(MAXFLY);
      vertical = sgn(vertical);
    } else if (condition == Condition.STAR)
      velocityCheck(MAXSTAR);
    if (vertical > 3)
      vertical = 3;
    if (vertical < -3)
      vertical = -3;
  }

  // Vehicles: Moto and Surf
  static void controlVehicle(int minVehicle, int maxVehicle, int altVehicle)
  {
    if (state == Status.STOPPED)
      state = Status.WALKING;
    if (velocity == 0) {
      if (entities.get(player).getFace() == 0)
        velocity = -minVehicle;
      if (entities.get(player).getFace() == 1)
        velocity = minVehicle;
    }

    if (right && velocity > 0)
      velocity += SPEED;
    if (down && velocity > 0)
      velocity -= SPEED;

    if (down && velocity < 0)
      velocity += SPEED;
    if (left && velocity < 0)
      velocity -= SPEED;

    // Invert direction
    if (left && velocity > 0 && state == Status.WALKING) {
      velocity = -velocity;
      entities.get(player).setFace(0);
    } else if (right && velocity < 0 && state == Status.WALKING) {
      velocity = -velocity;
      entities.get(player).setFace(1);
    }

    // Destroy vehicle
    if (getObsd(entities.get(player).getFace()) != 0) {
      if (getpunch(entities.get(player).getFace() * 32) == 0) {

        addSprite(entities.get(player).getx() - 24 + entities.get(player).getFace() * 32,
            entities.get(player).gety(), 4);

        if (condition == Condition.MOTO) {
          setNormalCondition(Condition.WALK);
          state = Status.JUMPING;
          return;
        } else {
          callEvent(6);
          entities.get(player).incy(24);
          return;
        }

      }
    }

    checkJumpFalling(altVehicle + abs(velocity) - maxVehicle);

    // Limit max Speed
    if (abs(velocity) > (maxVehicle))
      velocity = sgn(velocity) * maxVehicle;
    if (abs(velocity) < (minVehicle))
      velocity = sgn(velocity) * minVehicle;
  }

  static void velocityCheck(int maxv) {
    if (velocity > maxv)
      velocity = maxv;
    if (velocity < -maxv)
      velocity = -maxv;
  }

  static void checkJumpFalling(int MaxAlt) {
    if (condition == Condition.ROPE)
      return;

    if (action != Action.TREMBLING && up) // not trembling and not upRope
    {
      if (state != Status.JUMPING && state != Status.FALLING && getObsd(SOUTH) != 0) {
        state = Status.JUMPING;
        vertical = 0;
        alt = MaxAlt;
      }
      if (state == Status.JUMPING && alt > -20) {
        vertical -= alt / FALL;
        if (vertical < -MaxAlt)
          vertical = -MaxAlt;
      }
      if (alt > 0) {
        alt -= FALL;
      } else {
        state = Status.FALLING;
        alt = 0;
        unpress(5);
      }
    }

    if (getObsd(SOUTH) == 0 && state != Status.JUMPING) {
      state = Status.FALLING;
      if (vertical < GRAV_EF)
        vertical += (GRAV + 1);
    }
    if (!up && state == Status.JUMPING) {
      state = Status.FALLING;
      alt = 0;
    }
  }

  static void movePlayer() {
    entities.get(player).incy(-wind);
    if (state != Status.WALKING && condition != Condition.MOTO && condition != Condition.SURF) {
      if (velocity > 0)
        velocity--;
      if (velocity < 0)
        velocity++;
    }

    for (int i = 0; i < abs(velocity >> 2); i++) {
      if (getObsd(entities.get(player).getFace()) == 0)
        entities.get(player).incx(sgn(velocity));
    }

    if (getObsd(NORTH) != 0 && state == Status.JUMPING) {
      state = Status.FALLING;
      vertical = 0;
    }
    if (getObsd(SOUTH) != 0 && state == Status.FALLING) {
      state = Status.STOPPED;
      vertical = 0;
      if (condition != Condition.MOTO && condition != Condition.SURF)
        velocity = 0;
    }

    if (state == Status.JUMPING) {
      for (int i = 0; i < abs(vertical); i += FALL) {
        if (getObsd(NORTH) == 0)
          entities.get(player).incy(sgn(vertical));
      }
    }

    if (state == Status.FALLING) {
      for (int i = 0; i < abs(vertical); i += FALL) {
        if (sgn(vertical) == 1 && getObsd(SOUTH) == 0)
          entities.get(player).incy();
        if (sgn(vertical) == -1 && getObsd(NORTH) == 0)
          entities.get(player).incy(-1);
      }
    }
  }

  static void swimPlayer() {
    int aa = 0;
    if (condition == Condition.SWIM && getObsd(NORTH) == 0)
      entities.get(player).incy(-1);
    if (condition == Condition.HELI && getObsd(SOUTH) == 0)
      entities.get(player).incy();

    for (int i = 0; i < abs(velocity >> 2); i++) {
      if (getObsd(entities.get(player).getFace()) == 0)
        entities.get(player).incx(sgn(velocity));
    }

    if (vertical > 0)
      aa = SOUTH;
    if (vertical < 0)
      aa = NORTH;
    for (int i = 0; i < abs(vertical); i++) {
      if (getObsd(aa) == 0)
        entities.get(player).incy(sgn(vertical));
    }

  }

  static int showplayer() {
    playerframe++;
    if (playerframe >= 6)
      playerframe = 0;

    if (condition == Condition.ROPE) {
      setDimensions(entities.get(player).getx() + 12, entities.get(player).gety() + 6, 8, 20);
      if (state == Status.STOPPED)
        return 42;
      else
        return 41 + (playerframe / 2);
    }

    if (condition == Condition.HELI) {
      setDimensions(entities.get(player).getx() + 6, entities.get(player).gety() + 4, 20, 26);
      return 31 + ((1 - entities.get(player).getFace()) * 4) + (playerframe / 3);
    }

    if (condition == Condition.SURF)
      return 27 + ((1 - entities.get(player).getFace()) * 2) + (playerframe / 3);

    if (condition == Condition.MOTO) {
      if (state == Status.STOPPED || state == Status.WALKING) {
        setDimensions(entities.get(player).getx() + 9, entities.get(player).gety() + 7, 14, 20);
        return 21 + ((1 - entities.get(player).getFace()) * 3) + (playerframe / 3);
      } else {
        setDimensions(entities.get(player).getx() + 9, entities.get(player).gety() + 5, 14, 26);
        return 23 + ((1 - entities.get(player).getFace()) * 3);
      }
    }
    if (action == Action.PUNCHING) // punching
    {
      if (condition == Condition.SWIM) {
        setDimensions(entities.get(player).getx() + 10, entities.get(player).gety() + 11, 13, 12);
        return 17 - (entities.get(player).getFace() * 3); // swimming
      } else {
        setDimensions(entities.get(player).getx() + 12, entities.get(player).gety() + 6, 8, 20);
        return 5 - entities.get(player).getFace(); // walking
      }
    }

    if (state == Status.STOPPED)
      if (condition == Condition.WALK || condition == Condition.FLY) // idle
      {
        setDimensions(entities.get(player).getx() + 12, entities.get(player).gety() + 6, 8, 20);
        return 1 - entities.get(player).getFace();
      }

    if (state == Status.DUCKING || condition == Condition.STAR) // ducking
    {
      setDimensions(entities.get(player).getx() + 12, entities.get(player).gety() + 12, 8, 16);
      return 40 - entities.get(player).getFace();
    }

    if (condition == Condition.WALK && state == Status.WALKING) // running
    {
      setDimensions(entities.get(player).getx() + 12, entities.get(player).gety() + 6, 8, 20);
      return 9 - (3 * entities.get(player).getFace()) + (playerframe >> 1);
    }

    if (condition == Condition.SWIM) // swimming
    {
      setDimensions(entities.get(player).getx() + 10, entities.get(player).gety() + 11, 13, 12);
      return 15 - (3 * entities.get(player).getFace()) + (playerframe / 3);
    }

    if (condition == Condition.WALK && (state == Status.JUMPING || state == Status.FALLING))
    {
      setDimensions(entities.get(player).getx() + 10, entities.get(player).gety() + 8, 12, 20);
      return 3 - entities.get(player).getFace();
    }

    return 0;
  }

  int showShinobiplayer() {
    playerframe++;
    if (playerframe >= 6)
      playerframe = 0;

    if (action == Action.PUNCHING) // punching
    {
      if (condition == Condition.SHIS) {
        setDimensions(entities.get(player).getx() + 10, entities.get(player).gety() + 11, 13, 12);
        return 15 - (entities.get(player).getFace() * 3); // swimming
      } else {
        setDimensions(entities.get(player).getx() + 16, entities.get(player).gety() + 12, 8, 24);
        return 55 - (entities.get(player).getFace() * 6); // walking
      }
    }

    if (state == Status.STOPPED && condition == Condition.SHIW) // idle
    {
      setDimensions(entities.get(player).getx() + 16, entities.get(player).gety() + 12, 8, 24);
      return (1 - entities.get(player).getFace()) * 2;
    }

    if (state == Status.DUCKING) // ducking
    {
      setDimensions(entities.get(player).getx() + 12, entities.get(player).gety() + 12, 8, 16);
      return 40 - entities.get(player).getFace();
    }

    if (condition == Condition.SHIW && state == Status.WALKING) // running
    {
      setDimensions(entities.get(player).getx() + 16, entities.get(player).gety() + 12, 8, 24);
      return (1 - entities.get(player).getFace()) * 2 + (playerframe / 3);
    }

    if (condition == Condition.SHIS) // swimming
    {
      setDimensions(entities.get(player).getx() + 10, entities.get(player).gety() + 11, 13, 12);
      return 15 - (3 * entities.get(player).getFace()) + (playerframe / 3);
    }

    if (condition == Condition.SHIW && (state == Status.JUMPING || state == Status.FALLING))
    {
      setDimensions(entities.get(player).getx() + 12, entities.get(player).gety() + 12, 10, 20);
      return 7 - entities.get(player).getFace(); // +((State-2)*2);
    }

    return 0;
  }

  static void processMisc() {
    screen.printString(310 - Integer.toString(Gold).length() * 12, 30, sys_font, "$ " + Gold);
    // screen.printstring(0,230,"Cond:"+str(Cond)+" State:"+str(State)+" Face:" +
    // str(entity.get(player).getFace()) + " Velocity: " + str(velocity));

    for (int i = 0; i < Energy; i++) {
      screen.rectfill(316 - (i * 12), 4, 307 - (i * 12), 9, new Color(0, 0, 0));
      screen.rectfill(315 - (i * 12), 5, 308 - (i * 12), 8, new Color(30, 250, 50));
      screen.rect(316 - (i * 12), 4, 307 - (i * 12), 9, new Color(50, 250, 50));
    }
    // Invencible
    if (invencible > 0) {
      invencible--;
      if (invencible % 2 == 0)
        entities.get(player).setSpecframe(44); // invencible (invisible)
    }
  }



  static void setDimensions(int px, int py, int vx, int vy) {
    akidd_px = px;
    akidd_py = py;
    akidd_vx = vx;
    akidd_vy = vy;
  }

  static int getObsd(int direction) {
    int a, ho = 0, vo = 0;
    if (condition == Condition.STAR)
      vo = 6;
    if (condition == Condition.MOTO || condition == Condition.SURF)
      ho = 4;
    if (condition == Condition.WALK || condition == Condition.MOTO || condition == Condition.SURF || condition == Condition.STAR
        || condition == Condition.FLY || condition == Condition.ROPE) // normal
    {
      if (direction == EAST) {
        for (a = 7 + vo; a < 28; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 8),
              entities.get(player).gety() + a))
            return 1;
        }
      } // left
      if (direction == WEST) {
        for (a = 7 + vo; a < 28; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 24),
              entities.get(player).gety() + a))
            return 1;
        }
      } // right

      if (direction == NORTH && condition == Condition.ROPE && processZones() == 12)
        return 0; // end of stair
      if (direction == NORTH) {
        for (a = 11; a < 20; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (6 + vo)))
            return 1;
        }
      } // up

      if (direction == SOUTH) {
        for (a = 11 - ho; a < 20 + ho; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (28)))
            return 1;
        }
      } // down
      if (direction == SOUTH && condition == Condition.SURF) {
        for (a = 11 - ho; a < 20; a += 2) {
          if (current_map.getzone((entities.get(player).getx() + a) >> 4,
              (entities.get(player).gety() + 28) >> 4) == 6)
            return 1;
        }
      }

      if (direction == 4) {
        for (a = 11; a < 20; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a - 6),
              (entities.get(player).gety() + 28 + 6)))
            return 1;
        }
      } // face0 + lack of floor
      if (direction == 5) {
        for (a = 11; a < 20; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a + 16),
              (entities.get(player).gety() + 28 + 6)))
            return 1;
        }
      } // face1 + lack of floor

    } else if (condition == Condition.SWIM) // swimming
    {
      // if(direction==1 && current_map.getobspixel(entity.get(player).x, entity.get(player).y+24))
      // return 1;
      if (direction == EAST) {
        for (a = 12; a < 24; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 7),
              entities.get(player).gety() + a))
            return 1;
        }
      }
      if (direction == WEST) {
        for (a = 12; a < 24; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 25),
              entities.get(player).gety() + a))
            return 1;
        }
      }
      if (direction == NORTH) {
        for (a = 8; a < 22; a += 2) {
          if (current_map.getzone((entities.get(player).getx() + a) >> 4,
              (entities.get(player).gety() + 8) >> 4) == 6)
            return 1;
        }
      }
      if (direction == NORTH) {
        for (a = 8; a < 26; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (8)))
            return 1;
        }
      }
      if (direction == SOUTH) {
        for (a = 8; a < 26; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (25)))
            return 1;
        }
      }
    } else if (condition == Condition.HELI) // helicopter
    {
      if (direction == EAST) {
        for (a = 4; a < 31; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 4),
              entities.get(player).gety() + a))
            return 1;
        }
      }
      if (direction == WEST) {
        for (a = 4; a < 31; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 27),
              entities.get(player).gety() + a))
            return 1;
        }
      }
      if (direction == NORTH) {
        for (a = 5; a < 27; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (3)))
            return 1;
        }
      }
      if (direction == SOUTH) {
        for (a = 5; a < 27; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (32)))
            return 1;
        }
      }
    } else if (condition == Condition.SHIW) // Shinobi Walking
    {
      if (direction == EAST) {
        for (a = 12; a < 38; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 12),
              entities.get(player).gety() + a))
            return 1;
        }
      }
      if (direction == WEST) {
        for (a = 12; a < 38; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + 27),
              entities.get(player).gety() + a))
            return 1;
        }
      }
      if (direction == NORTH) {
        for (a = 14; a < 24; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (8)))
            return 1;
        }
      }
      if (direction == SOUTH) {
        for (a = 14; a < 24; a += 2) {
          if (current_map.getobspixel((entities.get(player).getx() + a),
              entities.get(player).gety() + (38)))
            return 1;
        }
      }
    }
    return 0;
  }

  static void punch() {
    int ge, he = 0;
    if (state == Status.WALKING)
      if (condition == Condition.WALK || condition == Condition.SHIW)
        velocity = friction * velocity / 10;
    if (pdelay == 0 && condition != Condition.HELI && condition != Condition.SURF) {
      if (!hasBrac)
        playsound(snd[3]);
      unpress(1);
      action = Action.PUNCHING;
      ge = getpunch(entities.get(player).getFace() * 32);
      if (ge >= 3 && ge <= 8) // Eventos que sao processados pelo soco
      {
        callEvent(ge);
      }
    }
    pdelay++;
    if (condition == Condition.HELI || condition == Condition.SURF)
      he = 9;
    if (pdelay >= 6 + he) {
      pdelay = 0;
      if (action == Action.PUNCHING)
        action = Action.NONE;
    }
  }

  static int getpunch(int HoOffset) // player is punching
  {
    int a, UpOffset;
    UpOffset = 16;
    if (condition == Condition.MOTO)
      UpOffset -= 12;
    zx = (entities.get(player).getx() + HoOffset) >> 4;
    for (a = UpOffset; a < 28; a += 2) {
      zy = (entities.get(player).gety() + a) >> 4;
      if (current_map.getzone(zx, zy) >= 3)
        return current_map.getzone(zx, zy); // to avoid gold sacks
    }
    return 0;
  }

  static int processZones() {
    int a, b, c = 0, z = 0;

    if (condition == Condition.WALK)
      c = 8; // walking
    if (condition == Condition.SWIM || condition == Condition.SHIW)
      c = 12; // swimming
    for (a = 13; a < 17; a += 2) {
      for (b = c; b < 26; b += 2) {
        zx = (entities.get(player).getx() + a) >> 4;
        zy = (entities.get(player).gety() + b) >> 4;
        if (action == Action.PUNCHING)
          zx = (entities.get(player).getx() + a + 8) >> 4; // Cond==Condition.WALK &&
        z = current_map.getzone(zx, zy);
        if (z != 0 && zonecalled != z) {
          zonecalled = z;
          callEvent(z);
          return z;
        }
        if (z == 0 && zonecalled != 0)
          zonecalled = 0;
      }
    }
    return z;
  }

  static void vehicleAttack() {
    int ge;
    ge = getpunch(entities.get(player).getFace() * 32);
    if (ge == 0)
      ge = getpunch(entities.get(player).getFace() * 40);

    if (ge >= 3 && ge <= 8) // Events processed by the vehicle
      callEvent(ge);
  }

  static void tremble() {
    velocity = 0;
    action = Action.TREMBLING;
    tdelay++;
    if (tdelay % 2 == 0)
      entities.get(player).incx();
    else
      entities.get(player).incx(-1);

    if (tdelay >= 30) {
      tdelay = 0;
      if (action == Action.TREMBLING)
        action = Action.NONE;
    }
  }

  static void processEnemies() {
    monsterframe++;
    if (monsterframe >= 12)
      monsterframe = 0;

    for (int aa = 0; aa < numentities; aa++) {
      if (aa != player && entities.get(aa).getx() > entities.get(player).getx() - 300
          && entities.get(aa).getx() < entities.get(player).getx() + 300) {
        
        if(entities.get(aa).getSpeed() == 0) // JLud2D
          continue;
        
        if (entities.get(aa).getSpeed() == 50) // Dust
        {
          if (entities.get(aa).getFace() == 0)
            entities.get(aa).setSpecframe(53); // small dust
          else if (entities.get(aa).getFace() == 1)
            entities.get(aa).setSpecframe(54); // big dust
          else if (entities.get(aa).getFace() == 2)
            entities.get(aa).setSpecframe(53); // small dust
          else {
            entities.get(aa).setSpecframe(52);
            entities.get(aa).setSpeed(0);
            entities.get(aa).setFace(0);
          }
          if (monsterframe == 0) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 1);
          }
        } else if (entities.get(aa).getSpeed() == 51) // Big Dust
        {
          if (entities.get(aa).getFace() == 0)
            entities.get(aa).setSpecframe(53); // small dust
          else if (entities.get(aa).getFace() == 1)
            entities.get(aa).setSpecframe(54); // big dust
          else if (entities.get(aa).getFace() == 2)
            entities.get(aa).setSpecframe(55); // huge dust
          else if (entities.get(aa).getFace() == 3)
            entities.get(aa).setSpecframe(54); // big dust
          else if (entities.get(aa).getFace() == 4)
            entities.get(aa).setSpecframe(53); // small dust
          else {
            entities.get(aa).setSpecframe(52);
            entities.get(aa).setSpeed(0);
            entities.get(aa).setFace(0);
          }
          if (monsterframe == 0) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 1);
          }
        }

        // FIXME Change getSpeed() for getName() or something less ugly
        
        else if (entities.get(aa).getSpeed() == 1) // Eagle
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(aa).getFace() == 0)
            entities.get(aa).incx(-2);
          if (entities.get(aa).getFace() == 1)
            entities.get(aa).incx(2);
          if (obstruct(aa, 1, 24, 16))
            entities.get(aa).setFace(0);
          if (obstruct(aa, 0, 24, 16))
            entities.get(aa).setFace(1);
          entities.get(aa).setSpecframe((2 - (entities.get(aa).getFace() * 2)) + (monsterframe / 6));
          if (punch(aa, 28, 16))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx() + 1, entities.get(aa).gety(), 22, 14))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 2) // Fish
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(aa).getFace() == 0)
            entities.get(aa).incx(-2);
          if (entities.get(aa).getFace() == 1)
            entities.get(aa).incx(2);
          if (obstruct(aa, 1, 16, 14))
            entities.get(aa).setFace(0);
          if (obstruct(aa, 0, 16, 14))
            entities.get(aa).setFace(1);
          entities.get(aa).setSpecframe((6 - (entities.get(aa).getFace() * 2)) + (monsterframe / 6));
          if (punch(aa, 18, 18))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx() + 1, entities.get(aa).gety(), 14, 14))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 3) // Scorpion
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(aa).getFace() == 0)
            entities.get(aa).incx(-2);
          if (entities.get(aa).getFace() == 1)
            entities.get(aa).incx(2);
          if (!obstruct(aa, 3, 14, 16))
            entities.get(aa).incy(2); // falling
          if (obstruct(aa, 5, 14, 14))
            entities.get(aa).setFace(0);
          if (obstruct(aa, 4, 14, 14))
            entities.get(aa).setFace(1);
          entities.get(aa).setSpecframe((10 - (entities.get(aa).getFace() * 2)) + (monsterframe / 6));
          if (punch(aa, 14, 16))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 14, 16))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 4) // Frog
        {
          int frogDirection = 1;
          if (entities.get(player).getx() > entities.get(aa).getx())
            frogDirection = 0;
          if (entities.get(aa).getFace() <= 3) // stopped
          {
            entities.get(aa).setSpecframe(12 + (2 * frogDirection));
            if (!obstruct(aa, 3, 14, 16))
              entities.get(aa).setFace(7);
          }
          if (entities.get(aa).getFace() == 3 && monsterframe == 0)
            entities.get(aa).incy(-10);
          else if (entities.get(aa).getFace() >= 4 && entities.get(aa).getFace() <= 5) // jumping
          {
            entities.get(aa).incy(-(6 - entities.get(aa).getFace()));
            entities.get(aa).setSpecframe(13 + (2 * frogDirection));
            frogDirection = 10;
          } else if (entities.get(aa).getFace() >= 6 && entities.get(aa).getFace() <= 7) // falling
          {
            entities.get(aa).incy(entities.get(aa).getFace() - 5);
            entities.get(aa).setSpecframe(13 + (2 * frogDirection));
            if (obstruct(aa, 3, 12, 26))
              entities.get(aa).setFace(1);
            frogDirection = 10;
          }
          if (entities.get(aa).getFace() >= 8) {
            entities.get(aa).incy(10);
            entities.get(aa).setFace(0);
          }
          if (monsterframe == 0) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 1);
          }
          if (punch(aa, 14, 26))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety() + 10 - frogDirection, 14, 24))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 5) // Sea horse
        {
          entities.get(aa).setSpecframe(40 + monsterframe / 6);

          if (entities.get(aa).getFace() == 0)
            entities.get(aa).incy();
          if (entities.get(aa).getFace() == 1)
            entities.get(aa).incx(-1);
          if (entities.get(aa).getFace() == 2)
            entities.get(aa).incx(-1);
          if (entities.get(aa).getFace() == 3)
            entities.get(aa).incy();
          if (entities.get(aa).getFace() == 4)
            entities.get(aa).incy(-1);
          if (entities.get(aa).getFace() == 5)
            entities.get(aa).incx();
          if (entities.get(aa).getFace() == 6)
            entities.get(aa).incx();
          if (entities.get(aa).getFace() == 7)
            entities.get(aa).incy(-1);

          if (entities.get(aa).getFace() >= 8)
            entities.get(aa).setFace(0);

          if (monsterframe == 0) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 1);
          }
          if (punch(aa, 11, 15))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 11, 15))
            hitPlayer(1);
        }
        // 6 piranha fish

        else if (entities.get(aa).getSpeed() == 7) // Big Fish
        {
          if (entities.get(aa).getFace() % 2 == 0)
            entities.get(aa).incx(-2);
          if (entities.get(aa).getFace() % 2 == 1)
            entities.get(aa).incx(2);
          if (entities.get(aa).getFace() == 0 || entities.get(aa).getFace() == 1)
            entities.get(aa).incy(3);
          if (entities.get(aa).getFace() == 2 || entities.get(aa).getFace() == 3)
            entities.get(aa).incy(-3);
          if (obstruct(aa, 1, 24, 16)) {
            entities.get(aa).setFace(entities.get(aa).getFace() - 1);
          }
          if (obstruct(aa, 0, 24, 16)) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 1);
          }
          if (monsterframe == 0) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 2);
          }
          if (entities.get(aa).getFace() > 3)
            entities.get(aa).setFace(entities.get(aa).getFace() % 2);
          int cc = (22 - ((entities.get(aa).getFace() % 2) * 2)) + (monsterframe / 6);
          if (cc < 0)
            cc = 0;
          entities.get(aa).setSpecframe(cc);
          if (punch(aa, 24, 16))
            killEnemy(aa, BIGDUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 22, 15))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 8 || entities.get(aa).getSpeed() == 9) // Ghost and Fast
                                                                                   // Ghost
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(player).getx() + 4 <= entities.get(aa).getx()) {
            entities.get(aa).setFace(0);
            entities.get(aa).incx(-(entities.get(aa).getSpeed() - 7));
            entities.get(aa).setSpecframe(34 + (monsterframe / 6));
          }
          if (entities.get(player).getx() - 4 >= entities.get(aa).getx()) {
            entities.get(aa).setFace(1);
            entities.get(aa).incx(entities.get(aa).getSpeed() - 7);
            entities.get(aa).setSpecframe(32 + (monsterframe / 6));
          }
          if (entities.get(player).gety() + 4 <= entities.get(aa).gety())
            entities.get(aa).incy(-(entities.get(aa).getSpeed() - 7));
          if (entities.get(player).gety() - 4 >= entities.get(aa).gety())
            entities.get(aa).incy(entities.get(aa).getSpeed() - 7);
          if (punch(aa, 14, 16))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 14, 16))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 10) // Bat
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(aa).getFace() == 0 && !obstruct(aa, 0, 15, 12))
            entities.get(aa).incx(-2);
          if (entities.get(aa).getFace() == 1 && !obstruct(aa, 1, 15, 12))
            entities.get(aa).incx(2);
          if (obstruct(aa, 1, 14, 10))
            entities.get(aa).setFace(0);
          if (obstruct(aa, 0, 14, 10))
            entities.get(aa).setFace(1);
          if (monsterframe < 6)
            entities.get(aa).incy(2);
          else
            entities.get(aa).incy(-2);
          entities.get(aa).setSpecframe(30 + (monsterframe / 6));
          if (punch(aa, 15, 16))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx() + 2, entities.get(aa).gety(), 12, 8))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 11) // Owl
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(aa).getFace() == 0 && !obstruct(aa, 0, 15, 16))
            entities.get(aa).incx(-1);
          if (entities.get(aa).getFace() == 1 && !obstruct(aa, 1, 15, 16))
            entities.get(aa).incx();
          if (obstruct(aa, 1, 15, 14))
            entities.get(aa).setFace(0);
          if (obstruct(aa, 0, 15, 14))
            entities.get(aa).setFace(1);
          if (!obstruct(aa, 3, 15, 16))
            entities.get(aa).incy(2);
          entities.get(aa).setSpecframe(28 + (monsterframe / 6));
          if (punch(aa, 15, 15))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 15, 15))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 12) // Monkey
        {
          if (entities.get(aa).getFace() <= 2)
            entities.get(aa).setSpecframe(40); // idle
          if (entities.get(aa).getFace() > 2 && entities.get(aa).getFace() <= 4)
            entities.get(aa).setSpecframe(41); // leaf prepare
          if (entities.get(aa).getFace() == 5) // leaf throw
          {
            entities.get(aa).setFace(0);
            if (entities.get(aa).getx() > entities.get(player).getx())
              addSprite(entities.get(aa).getx(), entities.get(aa).gety(), 10);
            else
              addSprite(entities.get(aa).getx(), entities.get(aa).gety(), 11);
          }
          if (monsterframe == 0) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 1);
          }
          if (punch(aa, 15, 26))
            killEnemy(aa, BIGDUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 15, 24))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 13) // Strange monster
        {
          if (entities.get(aa).getFace() == 0 || entities.get(aa).getFace() == 2)
            entities.get(aa).incx(-1);
          if (entities.get(aa).getFace() == 1 || entities.get(aa).getFace() == 3)
            entities.get(aa).incx();
          if (entities.get(aa).getFace() == 0 || entities.get(aa).getFace() == 1)
            if (!obstruct(aa, 3, 16, 16))
              entities.get(aa).incy(2); // falling
          if (entities.get(aa).getFace() == 2 || entities.get(aa).getFace() == 3)
            if (!obstruct(aa, 2, 16, 16))
              entities.get(aa).incy(-2); // jumping
          if (obstruct(aa, 1, 14, 14)) {
            entities.get(aa).setFace(entities.get(aa).getFace() - 1);
          }
          if (obstruct(aa, 0, 14, 14)) {
            entities.get(aa).setFace(entities.get(aa).getFace() + 1);
          }
          if (monsterframe == 0) {
            if (obstruct(aa, 3, 16, 16) && entities.get(aa).getFace() < 2) {
              entities.get(aa).setFace(entities.get(aa).getFace() + 2);
            } else {
              entities.get(aa).setFace(entities.get(aa).getFace() % 2);
            }
          }
          if (entities.get(aa).getFace() < 0 || entities.get(aa).getFace() > 3)
            entities.get(aa).setFace(entities.get(aa).getFace() % 2);
          int cc = (18 - ((entities.get(aa).getFace() % 2) * 2)) + (monsterframe / 6);
          if (cc < 0)
            cc = 52;
          entities.get(aa).setSpecframe(cc);
          if (punch(aa, 16, 16))
            killEnemy(aa, DUST);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 15, 15))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 14) // Fire
        {
          if (monsterframe % 2 == 0)
            entities.get(aa).incx((int) (Math.cos(systemtime/55) * 3));
          if (monsterframe % 2 == 1)
            entities.get(aa).incy((int) (Math.sin(systemtime/55) * 3));
          int cc = 26 + (monsterframe / 6);
          if (cc < 0)
            cc = 52;
          entities.get(aa).setSpecframe(cc);
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety(), 15, 15))
            hitPlayer(3);
        }

        else if (entities.get(aa).getSpeed() >= 17 && entities.get(aa).getSpeed() <= 25) // Bull
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(aa).getFace() == 0) {
            entities.get(aa).incx(-(entities.get(aa).getSpeed() - 16));
          } else {
            entities.get(aa).incx((entities.get(aa).getSpeed() - 16));
          }
          if (obstruct(aa, 5, 32, 24))
            entities.get(aa).setFace(0);
          if (obstruct(aa, 4, 32, 24))
            entities.get(aa).setFace(1);
          entities.get(aa).setSpecframe((46 - (entities.get(aa).getFace() << 1)) + (monsterframe / 6));
          if (punch(aa, 32, 24)) {
            entities.get(aa).setFace(entities.get(player).getFace());
            entities.get(aa).incx((entities.get(aa).getFace() * 24) - 12);
            if (entities.get(aa).getSpeed() == 25)
              killEnemy(aa, BIGDUST);
            else {
              entities.get(aa).setSpeed(entities.get(aa).getSpeed() + 1);
              playsound(snd[7]);
            }
          }
          if (akiddCollision(1, entities.get(aa).getx(), entities.get(aa).gety() + 10, 30, 20))
            hitPlayer(1);
        }

        else if (entities.get(aa).getSpeed() == 26) // Bear
        {
          if (entities.get(aa).getFace() > 1)
            entities.get(aa).setFace(1);
          if (entities.get(player).getx() + 8 <= entities.get(aa).getx()) {
            entities.get(aa).setFace(0);
            entities.get(aa).incx(-2);
            entities.get(aa).setSpecframe(0 + (monsterframe / 6));
          } else if(entities.get(player).getx() - 8 >= entities.get(aa).getx()) {
            entities.get(aa).setFace(1);
            entities.get(aa).incx(1);
            entities.get(aa).setSpecframe(3 + (monsterframe / 6));
          }
          // if(Punched(aa,36,64)) { changechr(aa, "monster.chr"); KillThem(aa, BIGDUST);}
          if (akiddCollision(1, entities.get(aa).getx() + 16, entities.get(aa).gety() + 18, 22, 46))
            hitPlayer(1);
        }

      }
    }
  }

  static void killEnemy(int index, int dst) {
    entitystop(index);
    entities.get(index).setFace(0);
    entities.get(index).setSpecframe(52);
    entities.get(index).setSpeed(dst);
    playsound(snd[7]);
    // score+=
  }

  static boolean akiddCollision(int type, int mx, int my, int wx, int wy) {
    // ho=0;if (State=Status.DUCKING) ho+=8;
    // px = entity.get(player).x+12;
    // py = entity.get(player).y+6;
    // vx = 8
    // vy = 20
    // if (type == 1) // passive
    if (pdelay > 0) // When punching, make him invulnerable to collision: obs: leaf, etc, should hit
      return false;
    return collision(akidd_px, akidd_py, akidd_vx, akidd_vy, mx, my, wx, wy);

  }

  // Player is touched by a monster or sprite
  static boolean collision(int px, int py, int vx, int vy, int mx, int my, int wx, int wy)
  {
    if (debug) {
      screen.rect(mx - xwin, my - ywin, mx + wx - xwin, my + wy - ywin, new Color(200, 100, 100));
      screen.rect(px - xwin, py - ywin, px + vx - xwin, py + vy - ywin, new Color(100, 100, 200));
    }

    // this formula assumes the rectangles do not intersect
    if (mx > px + vx || mx + wx < px || my > py + vy || my + wy < py)
      return false;
    else
      return true;
  }

  static boolean punch(int ind, int wx, int wy) // player is punching a monster
  {
    if (action == Action.PUNCHING || condition == Condition.MOTO || condition == Condition.STAR) {
      if ((entities.get(player).getx() + (entities.get(player).getFace() * 24)) >= entities.get(ind)
          .getx()
          && (entities.get(player).getx() + (entities.get(player).getFace() * 24)) <= entities.get(ind)
              .getx() + wx
          && (entities.get(player).gety() + 14) >= entities.get(ind).gety()
          && (entities.get(player).gety() + 14) <= entities.get(ind).gety() + wy)
        return true;
    }
    if (hasBrac || condition == Condition.HELI || condition == Condition.SURF) {
      for (int i = 0; i < 20; i++) {
        if (spe[i] > 0 && spt[i] >= 12 && spt[i] <= 15) // bracelete e tiro
          if (collision(spx[i], spy[i], 8, 8, entities.get(ind).getx(), entities.get(ind).gety(), wx, wy)) {
            spe[i] = 0;
            return true;
          }
      }
    }

    return false;
  }

  static boolean obstruct(int e, int face, int wx, int wy) {
    int a;
    if (face == 0 || face == 4) {
      for (a = 0; a < wy; a += 2) {
        if (current_map.getobspixel((entities.get(e).getx()), (entities.get(e).gety() + a)))
          return true;
      }
    }
    if (face == 1 || face == 5) {
      for (a = 0; a < wy; a += 2) {
        if (current_map.getobspixel((entities.get(e).getx() + wx), (entities.get(e).gety() + a)))
          return true;
      }
    }
    if (face == 2) {
      for (a = 0; a < wx; a += 2) {
        if (current_map.getobspixel((entities.get(e).getx() + a), entities.get(e).gety()))
          return true;
      }
    }
    if (face == 3) {
      for (a = 0; a < wx; a += 2) {
        if (current_map.getobspixel((entities.get(e).getx() + a), (entities.get(e).gety() + wy)))
          return true;
      }
    }

    if (face == 4) {
      for (a = 0; a < wx; a += 2) {
        if (!current_map.getobspixel((entities.get(e).getx() + a - 4),
            (entities.get(e).gety() + wy + 12)))
          return true;
      }
    } // face0 + lack of floor
    if (face == 5) {
      for (a = 0; a < wx; a += 2) {
        if (!current_map.getobspixel((entities.get(e).getx() + a + 6),
            (entities.get(e).gety() + wy + 12)))
          return true;
      }
    } // face1 + lack of floor
    return false;
  }

  static void hitPlayer(int type) // 1 by monster, 2 naturally, 3 fire
  {
    int originalX, originalY;
    if (invencible > 0 || condition == Condition.STAR)
      return; // Invencible state
    if (condition == Condition.MOTO && type == 1)
      return;

    invencible = 120;
    if (Energy > 0)
      Energy--;

    // Die (Angel animation)
    if (Energy == 0 || type == 2) {
      originalX = entities.get(player).getx();
      originalY = entities.get(player).gety();
      cameratracking = 0;
      screen.render();
      showpage();
      wait(30);
      current_map.setRenderstring("1,2,E");
      stopmusic();
      wait(20);
      playsound(snd[6]);
      int counter = 0;
      for (int i = 0; i < 200; i++) {
        if (counter < 6)
          entities.get(player).setSpecframe(18);
        if (counter > 5)
          entities.get(player).setSpecframe(19);
        if (counter >= 12)
          counter = 0;
        wait(1);
        entities.get(player).incy(-1);
        counter++;
        screen.render();
        showpage();
      }
      wait(50);
      cameratracking = 1;
      current_map.setRenderstring("1,E,2");
      entities.get(player).setx(originalX);
      entities.get(player).sety(originalY);
      if (condition == Condition.SWIM)
        setNormalCondition(Condition.SWIM);
      else
        setNormalCondition(Condition.WALK);

      if (Gold > 500) {
        Gold -= 500;
      } else {
        gameOver();
      }
    }
  }

  static void gameOver() {

    while (!b1) {
      screen.rectfill(0, 0, 320, 240, Color.BLACK);
      screen.printString(120, 100, sys_font, "GAME OVER");
      screen.printString(10, 120, sys_font, "Not enough money to buy a new life (< $500)");
      showpage();
    }
    unpress(1);
    invencible = 0;
    Prog = 1;
    autoexec();
  }

  static void addSprite(int x, int y, int type) {
    int i = 0;
    while (spe[i] > 0 && i < 24) // look for empty sprite
    {
      i++;
    }
    if (type <= 9) // rock fragments
    {
      spx[i] = x;
      spy[i] = y;
      spe[i] = 30;
      spt[i] = type;
    }
    if (type == 10 || type == 11) // leaf from monkey
    {
      spx[i] = x;
      spy[i] = y;
      spe[i] = 60;
      spt[i] = type;
    }
    if (type == 12 || type == 13) // bracelete
    {
      spx[i] = x;
      spy[i] = y;
      spe[i] = 30;
      spt[i] = type;
      playsound(snd[8]);
    }
    if (type == 14 || type == 15) // firing
    {
      spx[i] = x;
      spy[i] = y;
      spe[i] = 12;
      spt[i] = type;
    }
  }

  static void processSprites() {

    // wind
    if (wind > 0) {
      ywin -= 50;
      for (int i = 0; i < 40; i++) {
        int bb = random(0, 240);
        int rdc = random(0, 320);
        screen.line(rdc, bb, rdc, bb - 8, new Color(200, 200, 200));
      }
    }

    VImage ptr;
    for (int i = 0; i < 20; i++) {
      if (spe[i] > 0) {
        spe[i]--;
        if (spt[i] == 2)
          ptr = rock_g; // sea rock
        else if (spt[i] == 3)
          ptr = rock_c; // cave rock
        else if (spt[i] == 4)
          ptr = firing; // vehicle fragments
        else
          ptr = rock_t; // common rock
        if (spt[i] <= 9) // rock fragment
        {
          screen.tblit(spx[i] - xwin - (35 - spe[i]), spy[i] - ywin, ptr);
          screen.tblit(spx[i] - xwin + 5, spy[i] - ywin, ptr);
          screen.tblit(spx[i] - xwin - (35 - spe[i]), spy[i] - ywin + 12, ptr);
          screen.tblit(spx[i] - xwin + 5, spy[i] - ywin + 12, ptr);
          spx[i]++;
          spy[i] += 6;
        }
        if (spt[i] == 10 || spt[i] == 11) // leaf
        {
          screen.tblit(spx[i] - xwin - (120 - (spe[i] * 2)), spy[i] - ywin, leaf);
          screen.tblit(spx[i] - xwin + 10, spy[i] - ywin, leaf);
          if (akiddCollision(1, spx[i] - (120 - (spe[i] * 2)), spy[i], 8, 6))
            hitPlayer(1);
          if (akiddCollision(1, spx[i] + 10, spy[i], 8, 6))
            hitPlayer(1);
          spx[i] += spt[i] - 9;
          spy[i] += 4;
        }
        if (spt[i] == 12) // bracelete to the left
        {
          screen.tblit(spx[i] - xwin, spy[i] - ywin, brac0);
          boolean hit = processFireAt(spx[i], spy[i]) || processFireAt(spx[i], spy[i]+8);
          // If not hit and there is obstacle, interrupt
          if (!hit && (current_map.getobspixel(spx[i], spy[i]) || current_map.getobspixel(spx[i], spy[i] + 8))) {
            spe[i] = 0;
          }
          spx[i] -= 8;
        }
        if (spt[i] == 13) // bracelete to the right
        {
          screen.tblit(spx[i] - xwin, spy[i] - ywin, brac1);
          boolean hit = processFireAt(spx[i], spy[i]) || processFireAt(spx[i], spy[i]+8);
          // If not hit and there is obstacle, interrupt
          if (!hit && (current_map.getobspixel(spx[i], spy[i]) || current_map.getobspixel(spx[i], spy[i] + 8))) {
            spe[i] = 0;
          }
          spx[i] += 8;
        }
        if (spt[i] == 14 || spt[i] == 15) // firing
        {
          screen.tblit(spx[i] - xwin, spy[i] - ywin, firing);
          boolean hit = processFireAt(spx[i], spy[i]) || processFireAt(spx[i], spy[i]+8);
          // If hit or not, the firing is extinguish if has obstacle
          if (current_map.getobspixel(spx[i], spy[i]) || current_map.getobspixel(spx[i], spy[i] + 7)) {
            spe[i] = 0;
          }
          if (spt[i] == 14)
            spx[i] -= 8;
          else
            spx[i] += 8;
        }
      }
    }
  }
  
	private static boolean processFireAt(int spx, int spy) {
		zx = spx >> 4;
		zy = spy >> 4;
		int ze = current_map.getzone(zx, zy);
		if (ze == ZONE_ROCK || ze == ZONE_STAR || ze == ZONE_ITEM
				|| ze == ZONE_SKULL) {
			callEvent(ze);
			return true;
		}

		return false;
	}  	
  
	  static void wait(int dela) {
	    for (int a = 0; a < dela; a++) {
	      showpage(); // DefaultTimer(); //showpage();
	    }
	  }
}
  