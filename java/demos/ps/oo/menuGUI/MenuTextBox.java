package demos.ps.oo.menuGUI;

import static core.Script.*;

import static demos.ps.oo.menuGUI.MenuStack.*;

import java.awt.Color;

public class MenuTextBox extends MenuType {

	String text[];
	
	int x, y, wx, wy;
	boolean hasMore;
	int textDelay;
	
	public MenuTextBox(int x2, int y2, int wx2, int wy2, String r1, String r2, boolean hasDelay, boolean hasMore) {
		this.x = x2;
		this.y = y2;
		this.wx = wx2;
		this.wy = wy2;
		this.text = new String[2];
		text[0] = r1;
		text[1] = r2;
		this.textDelay = 0; //(r1.length() + r2.length()) * 1;
		this.hasMore = hasMore;
		if(hasDelay) {
			this.drawDelay = MAX_DELAY;
		}
	}
	
	public boolean endTextDelay() {
		if(textDelay < (text[0].length() + text[1].length())) {
			textDelay = text[0].length() + text[1].length();
			return true;
		}
		return false;
	}

	@Override
	public void draw(boolean active) {
		switch(state) {
		case OPEN:
			float specwx = (float)(MAX_DELAY-drawDelay)/MAX_DELAY * (wx);
			int middle = (x + (x+wx))/2;
			MenuStack.drawBox((int)(middle-specwx/2), y, (int)(specwx), wy);
			if(drawDelay-- <= 0) {
				state = State.TEXT;
			}
			break;
		case TEXT:
		case READY:
		case CLOSE:

			/*if(showPortrait) { // TODO: Portrait
				MenuStack.drawBox(ps.oo.PSMenu.instance.STEXT_BOTTOM_X, ps.oo.PSMenu.instance.STEXT_BOTTOM_Y-57, 54, 54);
				screen.blit(ps.oo.PSMenu.instance.STEXT_BOTTOM_X+4, ps.oo.PSMenu.instance.STEXT_BOTTOM_Y-54, ps.oo.PSGame.getParty().getMember(0).smallPortrait);
			}*/
			
			MenuStack.drawBox(x, y, wx, wy);
			screen.g.setFont(MenuStack.menu_font);
			screen.g.setColor(Color.WHITE);
			screen.g.drawString(left(this.text[0], textDelay), this.x+1+fontXSize, this.y+fontYSize+6);
			screen.g.drawString(textDelay > text[0].length() ? left(this.text[1], textDelay - text[0].length()) : "",  
					this.x+1+fontXSize, this.y+fontYSize*2 + 6 + MenuStack.BETWEEN_ROWS_SPACE);
			
			if(this.state != State.CLOSE && textDelay++ > (text[0].length() + text[1].length())) {
				this.state = State.READY;
				
				if(textDelay++ > 3 * (text[0].length() + text[1].length()) + MAX_DELAY*3) {
					this.state = State.CLOSE; // For timeout textboxes
				}			
			}
			
			if(state!=State.TEXT && hasMore && active) {
				screen.tblit(wx+wy-40,(int) (y+wy-8 + (Math.cos(systemtime / 8) * 3)), moreIcon);				
			}
			break;
		/*case CLOSE:
			specwx = (float)(drawDelay)/MAX_DELAY * (wx);
			middle = (x + (x+wx))/2;
			MenuStack.drawBox((int)(middle-specwx/2), y, (int)(specwx), wy);
			if(drawDelay-- <= 0) {
				state = State.END;
			}
			break;*/
		default:
			
		}
	}
}
