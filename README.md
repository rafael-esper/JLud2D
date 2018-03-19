# JLud2D

JLud2D is an old-school engine for games, currently in Java. It is compatible with [Tiled](http://www.mapeditor.org) maps, RPG-style characters and sprites, and MP3, MIDI, VGM, S3M, MOD and XM music formats.

<!---
![Screenshot of Alex Kidd](/screenshots/Ak_1.png?raw=true "Alex Kidd") ![Screenshot of Sully Chronicles](/screenshots/Sully_2.png?raw=true "Sully Chronicles") ![Screenshot of Phantasy Star Remake](/screenshots/PS_1.png?raw=true "Phantasy Star")  
![Screenshot of Phantasy Star Generations](/screenshots/PSG1.png?raw=true "Phantasy Star Generations")
-->
<img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Ak_1.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Ak_2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/JLud2D_Island.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Sully_2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Sully_3.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_1.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_Battle3.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_Dungeon.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PSG1.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PSG2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/JLud2d_Warrior.png" width="200" height="150">


## Overview

The engine provides useful classes and methods for rapid development. 

Below is an example of switching from a map to another one:
```
	void exit() {
		mapswitch(Planet.PALMA, 84, 49);		
	}
```

Here is an example of a map script used when talking with an entity:
```
 void robot() {
		EntStart();
		PSMenu.Stext("You are trespassing. Go back!"));
		EntFinish();
	}
```

### List of Features

- 2D Engine;
- Multi-plataform;
- [Tiled](http://www.mapeditor.org) support (JSON format), a free, easy to use and flexible tile map editor;
- You could run and debug the game code in some advanced IDE like Eclipse or Netbeans;
- Music formats: MP3, MIDI, VGM, S3M, MOD and XM;
- Sound formats: WAV, VOC and MP3;
- Graphic formats: PNG, JPG, GIF, PCX and others - basically all you can load using Java;
- Easy-to-use API;
- Suitable for 2D board games, RPG games, platform games and many more.


## Getting Started: I want to play

You can download just the demo / game you want to play and execute it with:
```
java -jar Demo.jar
```

They are located in the /redist folder.

*Some important notes*
- F5 for sound off/on
- F6 for full screen
- F7/F8 to increase/decrease frame delay.

## Getting Started: I want to develop

JLud2D uses [Maven](https://maven.apache.org/) as a Dependency Management system. An intermediate to experienced Java developer should have no problem working with the repository. Feel free to fork it and contribute.

### Tips

- Jar files are case-sensitive, so be sure to check when looking for resources inside it: sounds, maps, animations, images, etc
- Develop always with internationalization in mind. Internationalization Links: http://java.sun.com/developer/technicalArticles/Intl/ResourceBundles and http://www.roseindia.net/java/example/java/swing/internationalization.shtml


### Planned features:

- Caching for fast loading
- Implement music volume
- Joystick support
- Socket implementation
- Movie playback implementation
- LUA parser for easy scripting
- Mobile support
- Check 3D API with fixed-z (~2D) to enable Video optimization

### Bugs and Updates:

- Check VGM loops (right now they aren't looping)
- VGMs don't play, just VGZ.
- Implement key mapping (b1,b2,b3,b4)
- Verify ColorFilter, Implement Rotate, Flip, etc (See Graphics2d Rotate, Scale, etc)
- Make it more OO (less static methods, no public properties, no static imports)
- Entities' movement get screwed after talking to them
- Investigate why sometimes the transparency stops working (when swapping window/full screen)

