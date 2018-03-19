package audio;

/*************************************************************************
 *  Compilation:  javac -classpath .:jl1.0.jar MP3.java         (OS X)
 *                javac -classpath .;jl1.0.jar MP3.java         (Windows)
 *  Execution:    java -classpath .:jl1.0.jar MP3 filename.mp3  (OS X / Linux)
 *                java -classpath .;jl1.0.jar MP3 filename.mp3  (Windows)
 *  
 *  Plays an MP3 file using the JLayer MP3 library.
 *
 *  Reference:  http://www.javazoom.net/javalayer/sources.html
 *
 *
 *  To execute, get the file jl1.0.jar from the website above or from
 *
 *      http://www.cs.princeton.edu/introcs/24inout/jl1.0.jar
 *
 *  and put it in your working directory with this file MP3.java.
 *
 *************************************************************************/

import java.io.BufferedInputStream;
import java.net.URL;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import audio.javazoom.jl.player.Player;


/*
 * http://introcs.cs.princeton.edu/java/faq/mp3/mp3.html
 * 
 * Using JLayer library (jl1.0.1.jar)
 */

public class Mp3Player {
	
	private static final Logger log = LogManager.getLogger(Mp3Player.class);
	
    private URL url;
    private float volume;
    private Player player; 

    // constructor that takes the name of an MP3 resource and the volume
    public Mp3Player(URL url, float volume) {
        this.url = url;
        this.volume = volume;
    }

    public void close() { 
    	if (player != null) 
    		player.close(); 
    }

    // play the MP3 file to the sound card
    public void play() {
        try {
            BufferedInputStream bis = new BufferedInputStream(url.openStream());
            player = new Player(bis, volume);
        }
        catch (Exception e) {
        	log.error("Error playing MP3 file " + url, e);
        }

        // run in new thread to play in background
        new Thread() {
            public void run() {
                try { 
                	player.play(); 
                }
                catch (Exception e) { 
                	log.info(e); 
                }
            }
        }.start();
    }
    
}

