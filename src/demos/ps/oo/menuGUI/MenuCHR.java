package demos.ps.oo.menuGUI;

import domain.CHR;
import static core.Script.*;

public class MenuCHR extends MenuType {

	public static final int DONE = 2;
	
	CHR chr;
	int x, y;
	int framect;
	int beginDelay;
	boolean loopable = false;
	
	public MenuCHR(int x, int y, boolean loopable, CHR chr) {
		this(x, y, chr);
		this.loopable = loopable;
	}
	
	public MenuCHR(int x, int y, CHR chr) {
		this.x = x;
		this.y = y;
		
		this.chr = chr;
		
		this.state = State.READY;
		this.framect = 0;
		this.beginDelay = MAX_DELAY / 2;
	}
	
	
	
	@Override
	public void draw(boolean active) {
		if(beginDelay-- > 0) {
			return;
		}
		switch(this.state) {
			case READY: 
				screen.blitentityframe(x, y, chr, chr.getFrame(this.state.getAnimIndex(), framect));
				break;
			case ANIM1:
			case ANIM2:
			case ANIM3: 
				screen.blitentityframe(x, y, chr, chr.getFrame(this.state.getAnimIndex(), framect));
				if(framect+1 >= chr.getAnimSize(this.state.getAnimIndex())) {
					if(!loopable) {
						this.state = State.CLOSE;
					} else {
						framect = 0;
					}
				}
				break;
			case CLOSE:
				screen.blitentityframe(x, y, chr, chr.getIdle()[DONE]);
				break;
			default:
		}
		
		framect++;		
	}



	public void animate(MenuType.State anim) {
		framect = 0;
		this.state = anim;
	}
	
	public void changePosition(int x, int y) {
		this.x = x;
		this.y = y;
	}

	
	
}
