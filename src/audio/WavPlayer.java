package audio;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import javax.sound.sampled.*;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/*
 * http://forum.codecall.net/java-tutorials/31299-playing-simple-sampled-audio-java.html
 * http://docs.oracle.com/javase/tutorial/sound/playing.html
 * 
 */

public class WavPlayer {
   
	private static final Logger log = LogManager.getLogger(WavPlayer.class);
	
	private URL url;
    private Clip clip; 
    private AudioInputStream audio;
    private float volume;

    // constructor that takes the name of a WAV file
    public WavPlayer(URL url, float volume) {
        this.url = url;
        this.volume = volume;
    }

    public void close() { 
    	
    	if(clip.isActive()) {
    		clip.stop();
    		clip.close();
    	}
    	
    	if (audio != null)
		try {
			audio.close();
		} catch (IOException e) {
			log.error("Error closing audio.", e);
		} 
    }

    // play the WAV/MIDI file to the sound card
    public void play() {
        try {
        	// Fixed mark/test problem. See: http://stackoverflow.com/questions/5529754/java-io-ioexception-mark-reset-not-supported
        	InputStream audioSrc = url.openStream();
        	InputStream bufferedIn = new BufferedInputStream(audioSrc);
        	audio = AudioSystem.getAudioInputStream(bufferedIn);
        	clip = AudioSystem.getClip();
          	clip.addLineListener(new LineListener() {
                @Override
                public void update(LineEvent event) {
                    if (event.getType() == LineEvent.Type.STOP)
                        clip.close();
                }
            });         	
        }
        catch (Exception e) {
            log.info("Problem playing file " + url, e);
        }

        // run in new thread to play in background
        new Thread() {
            public void run() {
                try { 
                    clip.open(audio);
                    double dv = (double)volume / 50;
                    //See http://docs.oracle.com/javase/1.5.0/docs/api/javax/sound/sampled/FloatControl.Type.html#MASTER_GAIN
                    float db = (float)(Math.log(dv)/Math.log(10.0)*20.0);
                    FloatControl gainControl = 
                    	    (FloatControl) clip.getControl(FloatControl.Type.MASTER_GAIN);
                    	gainControl.setValue(db); // range -80.0 to 6.0206                    
                    
                    // Play the sound	
                    clip.start();
                }
                catch (Exception e) { log.info(e); }
            }
        }.start();
    }
    
}

