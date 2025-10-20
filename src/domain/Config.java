package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.net.URL;
import java.util.Scanner;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

public class Config {

	private static final Logger log = LogManager.getLogger(Config.class);

    public static final String CONFIG_FILENAME = "config.json";
    
	/* Default X and Y resolution of your game */ 
    private Integer xRes = 320;
    private Integer yRes = 240;

    /* Log debug messages of the engine on console */
    private Boolean logConsole = true;
    
    /* Window mode is default. Change it to false for a full screen experience */
    private Boolean windowMode = true;
    private Boolean doubleWindowMode = false; // [Rafael]
    
    /* Make it mute by default changing to true */
    private Boolean noSound = false;
    
    /* The first map to be loaded */
    private String mapName;

    /****************************** code ******************************/

    public static Config loadConfig(URL configFilePath) {
        
        // Tries to load the file externally to the jar, in the classpath (ex: .)
        // http://stackoverflow.com/questions/3627426/loading-a-file-relative-to-the-executing-jar-file
    	URL resource = Config.class.getResource("/" + CONFIG_FILENAME);
        if(resource != null) {
            log.info("Found local Config file (config.json).");
            try {
                Config config = loadConfigJson(resource);
                return config;
            } catch (IOException e) {
                log.error("Error loading local config file: " + e.getLocalizedMessage());
                e.printStackTrace();
            }
        }
        
        log.info("Reading standard config file (JAR!/" + configFilePath + ").");
        try {
			return loadConfigJson(configFilePath);
		} catch (IOException e) {
			log.error("Error loading config file: " + e.getLocalizedMessage());
			e.printStackTrace();
			return null;
		}
    }
    
	public static Config loadConfigJson(URL url) throws IOException {
		log.info("Loading Config: " + url);
		
		Scanner s = new Scanner(url.openStream()).useDelimiter("\\A");
		String result = s.hasNext() ? s.next() : "";
		Gson gson = new Gson();
		Config config = gson.fromJson(result, Config.class);
    	return config;
    }

    public void exportToJson() throws JsonProcessingException {
      ObjectMapper mapper = new ObjectMapper();

      // Code adapted from http://stackoverflow.com/questions/28256852/what-is-the-simplest-way-to-configure-the-indentation-spacing-on-a-jackson-objec
      DefaultPrettyPrinter printer = new DefaultPrettyPrinter();

      // Serialize it using the custom printer
      String json = mapper.writer(printer).writeValueAsString(this);
      log.info(json);
    }

    
    public static void main(String args[]) throws JsonProcessingException {
      
      Config cfg = new Config();
      cfg.setDoubleWindowMode(true);
      
      cfg.exportToJson();
      
    }
 
    
    public Integer getxRes() {
      return xRes;
    }

    public void setxRes(Integer xRes) {
      this.xRes = xRes;
    }

    public Integer getyRes() {
      return yRes;
    }

    public void setyRes(Integer yRes) {
      this.yRes = yRes;
    }

    public Boolean getWindowMode() {
      return windowMode;
    }

    public void setWindowMode(Boolean windowMode) {
      this.windowMode = windowMode;
    }

    public Boolean getDoubleWindowMode() {
      return doubleWindowMode;
    }

    public void setDoubleWindowMode(Boolean doubleWindowMode) {
      this.doubleWindowMode = doubleWindowMode;
    }

    public Boolean getNoSound() {
      return noSound;
    }

    public void setNoSound(Boolean noSound) {
      this.noSound = noSound;
    }

    public String getMapName() {
      return mapName;
    }

    public void setMapName(String mapName) {
      this.mapName = mapName;
    }

    public Boolean getLogConsole() {
      return logConsole;
    }

    public void setLogConsole(Boolean logConsole) {
      this.logConsole = logConsole;
    }


    
}