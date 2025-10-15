package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class ZoneProperties {

	private static final Logger log = LogManager.getLogger(ZoneProperties.class);

	private String name;
	
	private Integer activationChance;
	
	private Integer activationDelay;
	
	private String activationEvent;
	
	private Boolean isObstruction;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getActivationChance() {
		return activationChance;
	}

	public void setActivationChance(Integer activationChance) {
		this.activationChance = activationChance;
	}

	public Integer getActivationDelay() {
		return activationDelay;
	}

	public void setActivationDelay(Integer activationDelay) {
		this.activationDelay = activationDelay;
	}

	public String getActivationEvent() {
		return activationEvent;
	}

	public void setActivationEvent(String activationEvent) {
		this.activationEvent = activationEvent;
	}

	public Boolean getIsObstruction() {
		return isObstruction;
	}

	public void setIsObstruction(Boolean isObstruction) {
		this.isObstruction = isObstruction;
	}

	
}
