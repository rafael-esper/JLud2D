package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.URL;

import audio.Mp3Player;
import audio.WavPlayer;

public class VSound {

	private static final Logger log = LogManager.getLogger(VSound.class);

	URL url;
	float volume;
	
	public VSound(URL url) {
			this.url = url;
	}
	
	static Mp3Player mp3player;
	static WavPlayer wavplayer;
	
	public void start(float volume)
	{
		if(url == null || url.getFile() == null) {
			log.error("No file to play.");
			return;
		}
		
		if(url.getFile().toLowerCase().endsWith("mp3")){
			mp3player = new Mp3Player(url, volume);
			mp3player.play();
		}
		else if(url.getFile().toLowerCase().endsWith("wav")){
			wavplayer = new WavPlayer(url, volume);
			wavplayer.play();
		}
		
	}
	
	
}
