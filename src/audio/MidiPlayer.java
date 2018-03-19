package audio;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import javax.sound.midi.MidiSystem;
import javax.sound.midi.Sequence;
import javax.sound.midi.Sequencer;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/*
 * http://stackoverflow.com/tags/javasound/info
 * 
 */

public class MidiPlayer {
	
	private static final Logger log = LogManager.getLogger(MidiPlayer.class);
			
    private URL url;
    private Sequence sequence;
    private Sequencer sequencer;

    // constructor that takes the name of a MIDI file
    public MidiPlayer(URL url) {
        this.url = url;
    }

    public void close() { 
    	
    	if(sequencer != null && sequencer.isOpen()) {
    		try {
    			sequencer.close();
    		}
    		catch (Exception e) {
            	log.error("Error playing MIDI file " + url, e);
    		}
    	}
    }

    // play the MIDI file to the sound card
    public void play() {
        try {
       	 
        	sequence = MidiSystem.getSequence(url);
            sequencer = MidiSystem.getSequencer(false);
        	
        	sequencer.open();
            sequencer.setSequence(sequence);
        }
        catch (Exception e) {
            log.info("Problem playing file " + url);
            log.info(e);
        }

        // run in new thread to play in background
        new Thread() {
            public void run() {
                try { 
                    sequencer.start();
                }
                catch (Exception e) { log.info(e); }
            }
        }.start();
    }

    
    public static void main(String args[]) throws MalformedURLException {
    	MidiPlayer player = new MidiPlayer(new File("/media/midi/town.mid").toURI().toURL());
    	player.play();
        for(int i=0;i<10000000; i++) {
        	if(i%1000 == 0)
        		log.info(i);
        }
    }
    
}

