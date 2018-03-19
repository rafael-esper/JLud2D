package core;

import java.awt.AlphaComposite;
import java.awt.Canvas;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.awt.event.KeyEvent;
import java.awt.image.BufferStrategy;

import static core.MainEngine.*;
import static core.Script.*;

import javax.swing.JCheckBoxMenuItem;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.KeyStroke;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class GUI extends JFrame implements ActionListener, ItemListener, ComponentListener {
	
	private static final Logger log = LogManager.getLogger(GUI.class);
	
	Canvas canvas = new Canvas();
	Controls control = new Controls();
	static MainEngine gameThread; 
	static BufferStrategy strategy;
	
	private int winwidth, winheight;
	private static int curwidth;
	private static int curheight;
	boolean win_decoration = false;
	private static float alpha = 1f;

	public static long cycleTime;
	private static int frameDelay = 20; // 20ms. implies 50fps (1000/20) = 50
	private static boolean showFPS = false;

	JMenuBar menuBar;
	private JCheckBoxMenuItem cbMenuItemSound;
	private JCheckBoxMenuItem cbMenuItemFullScreen;
	private JCheckBoxMenuItem cbMenuItemDoubleScreen;
	private JCheckBoxMenuItem cbMenuItemshowFPS;
	private JMenuItem menuItemIncreaseFPS;
	private JMenuItem menuItemDecreaseFPS;

	
	
	public GUI(int w, int h) {
		// build and display your GUI

		addComponentListener(this);
		MainEngine.gui = this;
		
		canvas.setBackground(Color.black);
		control.clearKeymap();
		canvas.addMouseListener(control);
		canvas.addMouseMotionListener(control);
		canvas.addFocusListener(control);
		canvas.addKeyListener(control);
		
		// Menus
		menuBar = new JMenuBar();
		JMenu menu = new JMenu("Settings"); 
		menuBar.add(menu);
		
		cbMenuItemSound = new JCheckBoxMenuItem("Enable Sound", !config.getNoSound());
		cbMenuItemSound.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F5, ActionEvent.CTRL_MASK));
		cbMenuItemSound.addItemListener(this);
		menu.add(cbMenuItemSound);
		
		cbMenuItemFullScreen = new JCheckBoxMenuItem("Full Screen mode", !config.getWindowMode());
		cbMenuItemFullScreen.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F6, ActionEvent.CTRL_MASK));
		cbMenuItemFullScreen.addItemListener(this);
		menu.add(cbMenuItemFullScreen);

		cbMenuItemDoubleScreen = new JCheckBoxMenuItem("Double Screen mode", config.getDoubleWindowMode());
		cbMenuItemDoubleScreen.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F7, ActionEvent.CTRL_MASK));
		cbMenuItemDoubleScreen.addItemListener(this);
		menu.add(cbMenuItemDoubleScreen);
		
		
		cbMenuItemshowFPS = new JCheckBoxMenuItem("Show FPS", showFPS);
		cbMenuItemshowFPS.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F8, ActionEvent.CTRL_MASK));
		cbMenuItemshowFPS.addItemListener(this);
		menu.add(cbMenuItemshowFPS);
		
		menuItemDecreaseFPS = new JMenuItem("Decrease FPS");
		menuItemDecreaseFPS.setActionCommand("decreaseFPS");
		menuItemDecreaseFPS.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F9, ActionEvent.CTRL_MASK));
		menuItemDecreaseFPS.addActionListener(this);
		menu.add(menuItemDecreaseFPS);

		menuItemIncreaseFPS = new JMenuItem("Increase FPS");
		menuItemIncreaseFPS.setActionCommand("increaseFPS");
		menuItemIncreaseFPS.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F10, ActionEvent.CTRL_MASK));
		menuItemIncreaseFPS.addActionListener(this);
		menu.add(menuItemIncreaseFPS);
		
		this.setJMenuBar(menuBar);

		this.add(canvas);
		if(!config.getDoubleWindowMode()) {
			setDimensions(this, w, h);
		} else {
			setDimensions(this, w*2, h*2);
		}
		this.addWindowListener(control);
		this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		cycleTime = System.currentTimeMillis();
			
		log.info("GUI Initialized.");
		gameThread = new MainEngine();
		gameThread.setPriority(Thread.MIN_PRIORITY);
		gameThread.start(); // start Game processing.
	}
	
	void setDimensions(GUI gui, int w, int h) {

		setVisible(false);
		dispose();

		if (w==0) { // Full screen
			Dimension scrsize = Toolkit.getDefaultToolkit().getScreenSize();
			winwidth = scrsize.width;
			winheight = scrsize.height;
			win_decoration=false;
			menuBar.setPreferredSize(new java.awt.Dimension());
			
			this.setUndecorated(true);
			this.setResizable(false);
			this.setSize(winwidth, winheight);
			//try {
			GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().setFullScreenWindow(gui);
			//} finally {
			//	GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().setFullScreenWindow(null);
			//}
			
		} else { // Window mode
			winwidth = w;
			winheight = h;
			win_decoration=true;
			menuBar.setPreferredSize(null);

			// setting the size of the canvas or applet has no effect
			// we need to add the height of the title bar to the height
			// We use the insets now. Originally, we used:
			// 24 is the empirically determined height in WinXP
			// 48 enables us to have the whole window with title bar on-screen
			// 8 is the empirically determined width in win and linux
			
			//[Rafael] Does not work
			//Insets insets = super.getInsets();
			//super.setSize(winwidth+insets.left+insets.right, winheight+insets.top+insets.bottom);
			//super.setSize(winwidth, winheight);
			GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().setFullScreenWindow(null);
			this.setUndecorated(false);
			this.setResizable(true);
			this.setVisible(true);
			log.info("Winwidth: " + winwidth + ", Winheight: " + winheight + " I: " + super.getInsets());

			this.setSize(winwidth+super.getInsets().left+super.getInsets().right,
					winheight+super.getInsets().top+super.getInsets().bottom+menuBar.getHeight());
			log.info(super.getBounds());
		}

		this.setVisible(true);
		
		canvas.requestFocus();
		
		/*try {
			this.createBufferStrategy(2, new BufferCapabilities(new ImageCapabilities(true), new ImageCapabilities(true), FlipContents.UNDEFINED));
			} catch (AWTException e){
			// flip is unavailable, create the best you have
				this.createBufferStrategy(2);
			}*/		

		canvas.createBufferStrategy(2);
		strategy = this.canvas.getBufferStrategy();
	}

	public static void paintFrame() {
			//GUI.cycleTime = System.currentTimeMillis(); // Keep a steady FPS
			updateGUI();
			synchFramerate();
			updateFPS();
		}

	public static void updateGUI() {
		if(Script.TEST_SIMULATION) {
			return;
		}
		
		try {
			Graphics g = strategy.getDrawGraphics();
			if(alpha != 1f) {
				Graphics2D g2d = (Graphics2D) g;
				g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_IN, alpha));
				g2d.drawImage(screen.getImage(), 0, 0, curwidth, curheight, null);
			}
			else {
				g.drawImage(screen.getImage(), 0, 0, curwidth, curheight, null);			
			}

			/* Do this to rotate 180 
			Graphics2D g2d = (Graphics2D) g;
			g2d.rotate(Math.PI, curwidth/2, curheight/2);
			g2d.drawImage(screen.getImage(), 0, 0, curwidth, curheight, null);*/

			
			// Show FPS
			if(showFPS) {
				g.setFont(fps_font);
				g.setColor(Color.WHITE);
				g.drawString("FPS: " + Float.toString(frameInLastSecond), 10, 20);
			}
				
			g.dispose();
			strategy.show();
		}
		catch(Exception e) {
			log.error("Unable to draw screen");
		}

	}
	
	public static void synchFramerate() {
		cycleTime = cycleTime + frameDelay;
		long difference = cycleTime - System.currentTimeMillis();
		if(difference > 0) {
			try {
				Thread.sleep(difference);
			}
			catch(InterruptedException e) {
				e.printStackTrace();
			}
		}

	}	
	

	void closeWindow() {
		super.setVisible(false);
		System.exit(0);
	}
	
	public Canvas getCanvas() {
		return this.canvas;
	}

	public void componentResized(ComponentEvent e)
	{
		Dimension scrsize = Toolkit.getDefaultToolkit().getScreenSize();
		winwidth = scrsize.width;
		winheight = scrsize.height;		
		//log.info(getWidth());	
		updateCanvasSize();
		//MainEngine.scaledBI = new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_RGB);//this.createVolatileImage(this.getWidth(), this.getHeight());
		//MainEngine.g = MainEngine.scaledBI.createGraphics();
	}
	
	public void updateCanvasSize() {
		this.curwidth = this.getWidth()-super.getInsets().left-super.getInsets().right;
		this.curheight = this.getHeight()-super.getInsets().top-super.getInsets().bottom-menuBar.getHeight();
		//canvas.updateSize(
			//	this.getWidth()-super.getInsets().left-super.getInsets().right,
				//this.getHeight()-super.getInsets().top-super.getInsets().bottom);
	}

	
	@Override
	public void componentHidden(ComponentEvent arg0) {	}

	@Override
	public void componentMoved(ComponentEvent arg0) {	}

	@Override
	public void componentShown(ComponentEvent arg0) {	}

	public void setAlpha(float f) {
		this.alpha = f;		
	}
	
	public static void incFrameDelay(int i) {
		if(frameDelay <=1)
			return;
		if(frameDelay <= 5)
			i = -1;
		
		frameDelay = frameDelay + i;
		
		if(frameDelay > 100)
			frameDelay = 100;
	}

	
	protected final static Font fps_font = new Font("Monospaced", Font.PLAIN, 12);
	static long nextSecond = System.currentTimeMillis() + 1000;
	static int frameInLastSecond = 0;
	static int framesInCurrentSecond = 0;
	static void updateFPS() {
		long currentTime = System.currentTimeMillis();
	    if (currentTime > nextSecond) {
	        nextSecond += 1000;
	        frameInLastSecond = framesInCurrentSecond;
	        framesInCurrentSecond = 0;
	    }
	    framesInCurrentSecond++;	
	}

	@Override
	public void itemStateChanged(ItemEvent e) {
		Object source = e.getItemSelectable();
		
		if(source==cbMenuItemSound) {
			config.setNoSound(!config.getNoSound());
			stopmusic();
		} else
		if(source==cbMenuItemFullScreen) {
			config.setWindowMode(!config.getWindowMode());
			if(	config.getWindowMode()) {
				this.setDimensions(this, config.getxRes(), config.getyRes());
			}
			else {
				this.setDimensions(this, 0, 0);
			}
		} else
		if(source==cbMenuItemDoubleScreen) {
				config.setWindowMode(true);
				config.setDoubleWindowMode(!config.getDoubleWindowMode());
				if(	config.getDoubleWindowMode()) {
					this.setDimensions(this, config.getxRes()*2, config.getyRes()*2);
				}
				else {
					this.setDimensions(this, config.getxRes(), config.getyRes());
				}
			} else
		if(source==cbMenuItemshowFPS) {
			showFPS = cbMenuItemshowFPS.isSelected();
		}
				
		
	}

	@Override
	public void actionPerformed(ActionEvent e) {
		
		if(e.getActionCommand().equals("increaseFPS")) {
			GUI.incFrameDelay(-5);
		} else
		if(e.getActionCommand().equals("decreaseFPS")) {
			GUI.incFrameDelay(5);
		}
	}
	
}
