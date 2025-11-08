package demos.ps.oo.menuGUI;

import java.awt.Color;

public abstract class MenuType {

	public static final int MAX_DELAY = 12;
	
	public static enum State {
		OPEN, TEXT, READY(1), CLOSE, END, ANIM1(2), ANIM2(3), ANIM3(4);
		int animIndex = 0;
		State() { }
			
		State(int animIndex) {
			this.animIndex = animIndex;
		}
		public int getAnimIndex() {
			return this.animIndex;
		}
	};
	
	int drawDelay = 0;
	State state = State.OPEN;
	
	public abstract void draw(boolean active);
	
}
