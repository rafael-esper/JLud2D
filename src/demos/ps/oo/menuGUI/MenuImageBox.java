package demos.ps.oo.menuGUI;

import static core.Script.*;

import domain.VImage;

public class MenuImageBox extends MenuType {

	boolean hasBox;
	VImage image;
	int x, y, wx, wy;
	
	public MenuImageBox(int x2, int y2, VImage image, boolean hasDelay) {
		this.x = x2;
		this.y = y2;
		this.wx = image.width + 8;
		this.wy = image.height + 8;
		this.image = image;
		this.hasBox = true;
		if(hasDelay) {
			this.drawDelay = MAX_DELAY;
		}
	}
	
	// BoxLess
	public static MenuImageBox MenuImage(int x, int y, VImage image) {
		MenuImageBox menuImageBox = new MenuImageBox(x, y, image, false);
		menuImageBox.hasBox = false;
		return menuImageBox;
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
			if(hasBox) {
				MenuStack.drawBox(x, y, wx, wy);
				screen.blit(x+4, y+4, image);
			}
			else {
				screen.blit(x, y, image);
			}
		}
	}
}
