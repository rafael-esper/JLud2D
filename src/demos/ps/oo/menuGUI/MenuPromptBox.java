package demos.ps.oo.menuGUI;

import static core.Script.*;
import static demos.ps.oo.menuGUI.MenuStack.getMaxTextLength;

import java.awt.Color;


public class MenuPromptBox extends MenuType {
	
	String [] options;
	boolean [] enabled;
	int x, y;
	boolean cancellable = false;
	int selected = 0;
	int wx, wy;
	
	public MenuPromptBox(int x2, int y2, String[] options2, boolean hasDelay) {
		this.x = x2;
		this.y = y2;
		this.options = options2;
		
		enabled = new boolean[options.length];
		for(int i=0; i<enabled.length;i++) {
			enabled[i] = true;
		}

		wx = 25 + getMaxTextLength(options); //MenuStack.getMaxSize(options)*MenuStack.fontXSize;
		wy = 12 + options.length * (MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE);
		
		if(hasDelay) {
			this.drawDelay = MAX_DELAY/2;
		} else {
			this.drawDelay = 0;
		}
	
	}
	
	public void setDisabled(int option) {
		enabled[option] = false;
	}
	
	public void previousOption() {
		selected--;
		if(selected <0)
			selected = options.length -1;
	}

	public void nextOption() {
		selected++;
		if(selected >= options.length) 
			selected = 0;
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

			MenuStack.drawBox(x, y, wx, wy); // 45,40
			
			for(int i=0; i<options.length; i++) { // 220, 145
				screen.g.setFont(MenuStack.menu_font);
				if(enabled[i]) {
					screen.g.setColor(Color.WHITE);
				} else {
					screen.g.setColor(Color.GRAY);
				}
				screen.g.drawString(options[i], x+12 + MenuStack.fontXSize, y+2+((MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE)*(i+1)));
				
				//Circle(x+6, y+9+17*i, 6, 6, Color.GRAY, screen);
				screen.g.setColor(Color.GRAY);
				screen.g.drawRoundRect(x+7, y-6+((MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE)*(i+1)), 8, 8, 3, 3);
				
				if(selected == i && ((timer/25)%2==1 || !active)) {
					screen.g.setColor(new Color(200, 40, 40));
					screen.g.fillRect(x+8, y-5+((MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE)*(i+1)), 7, 7);
	
					screen.g.setColor(new Color(235, 20, 20));
					screen.g.fillOval(x+8, y-4+((MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE)*(i+1)), 5, 5);
	
					//CircleFill(x+6, y+7+17*i, 6, 6, Color.RED, screen);
				}
			}
		}
		
		//Printstring(228, 153, screen, menu_font, "Yes");
		//Printstring(228, 170, screen, menu_font, "No");
		//WaitB1();
	}
}