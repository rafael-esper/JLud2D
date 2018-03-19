package demos.ps.oo.menuGUI;

import java.awt.Color;
import static demos.ps.oo.menuGUI.MenuStack.*;
import static core.Script.*;

public class MenuScrollerText extends MenuType {

		String[] text;
		
		int x, y;
		int textPos; // current text position
		int textDelay; // max text delay
		
		public MenuScrollerText(int x2, int y2, String text[]) {
			this.x = x2;
			this.y = y2;
			this.text = text;
			
			textDelay = 0;
			for(String s: text) {
				textDelay+= s.length();
			}
			
			state = State.TEXT;
			
		}

		@Override
		public void draw(boolean active) {
				screen.g.setFont(MenuStack.menu_font);
				screen.g.setColor(Color.WHITE);
				
				int nextTextPos = textPos;
				for(int i=0; i<text.length; i++) {
					String str = nextTextPos>0 ? left(this.text[i], nextTextPos) : "";
					screen.g.drawString(str, this.x, this.y+(fontYSize+5)*i);  
					nextTextPos-=this.text[i].length();
				}
				
				if(textPos++ > textDelay) {
					this.state = State.READY;
				}
		}

	
}
