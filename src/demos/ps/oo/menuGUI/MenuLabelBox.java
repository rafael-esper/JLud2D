package demos.ps.oo.menuGUI;

import static core.Script.*;

import static demos.ps.oo.menuGUI.MenuStack.*;

import java.awt.Color;

public class MenuLabelBox extends MenuType {

	String[] text;
	Color[] colors;
	
	int x, y, wx, wy;
	
	public MenuLabelBox(int x2, int y2, String[] labels, boolean hasDelay, boolean isCentered) {

		// Pre-processing: attribute colors to text, default is WHITE
		this.text = new String[labels.length];
		this.colors = new Color[labels.length];
		for(int i=0; i<labels.length;i++) {
			this.colors[i] = Color.WHITE;
			this.updateText(i, labels[i]);
		}
		
		if(isCentered) {
			this.x = x2 - 8 - getMaxTextLength(text)/2;
		}
		else {
			this.x = x2;
		}
		this.y = y2;
		//this.wx = 16 + getMaxTextLength(text); //fontXSize*getMaxSize(labels);
		this.wy = 14 + (labels.length * (fontYSize)) - countSpaces(text)*(fontYSize+1 - MenuStack.BETWEEN_ROWS_SPACE)/2;
		
		if(hasDelay) {
			this.drawDelay = MAX_DELAY;
		}
	}
	
	private int countSpaces(String[] labels) {
		int spaces = 0;
		for(String s: labels) {
			if(s==null || s.trim().equals(""))
				spaces++;
		}
		return spaces;
	}
	
	// Update specific row
	public void updateText(int rowNumber, String newText) {
		if(rowNumber >= this.text.length) {
			return;
		}
		if(newText.startsWith("<RED>")) {
			updateColor(rowNumber, Color.RED);
			text[rowNumber] = newText.replaceAll("<RED>", "");
		} else {
			this.text[rowNumber] = newText;
		}
		// Update wx size
		this.wx = 16 + getMaxTextLength(text);
	}
	
	// Updates full text
	public void updateText(String[] s) {
		for(int i=0; i<text.length; i++) {
			updateText(i, s[i]);
		}
	}
	
	// Change the color of a text row
	public void updateColor(int rowNumber, Color color) {
		colors[rowNumber] = color;
	}

	// Change the color of the whole text
	public void updateColor(Color color) {
		for(int i=0; i<text.length; i++) {
			this.updateColor(i, color);
		}
	}
	
	

	@Override
	public void draw(boolean active) {
		if(drawDelay > 0) {
			drawDelay--;
			float specwx = (float)(MAX_DELAY-drawDelay)/MAX_DELAY * (wx);
			int middle = (x + (x+wx))/2;
			MenuStack.drawBox((int)(middle-specwx/2), y, (int)(specwx), wy);
		}
		else {
			
			if(state != State.END) {
				MenuStack.drawBox(x, y, wx, wy);
				screen.g.setFont(MenuStack.menu_font);
				int pos = 0;
				for(int i=0; i<text.length; i++) {
					screen.g.setColor(colors[i]);
					if(this.text[i]!=null) {
						screen.g.drawString(this.text[i], this.x+2+fontXSize, this.y+fontYSize+6+pos);
					}
					if(text[i]==null || text[i].trim().equals("")) {
						pos+=(fontYSize + MenuStack.BETWEEN_ROWS_SPACE)/2;
					} else {
						pos+=(fontYSize);					
					}
				}
			}
		}
	}
	
	public void setOn() {
		this.state = State.READY;
	}

	public void setOff() {
		this.state = State.END;
	}
	
}
