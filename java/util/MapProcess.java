package util;
import static core.Script.current_map;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URL;

import javax.imageio.ImageIO;
import domain.MapTiledJSON;
import domain.VImage;

public class MapProcess {

	public static void main(String args[]) throws IOException {
		
		File fent = new File("D:\\Lotr project\\mercator-world-map_huge.JPG");
		//File fent = new File("D:\\Lotr project\\mercator-world-map_big_2012.JPG");
		BufferedImage top = ImageIO.read(fent);

		VImage v = new VImage(top.getWidth(), top.getHeight());
		for(int j=0; j<top.getHeight(); j++) {
			for(int i=0; i<top.getWidth(); i++) {
				Color c = new Color(top.getRGB(i, j));
				if(c.getBlue() > 150 && c.getRed() < 100 && c.getGreen() < 100) {
					v.setPixel(i, j, Color.BLUE);
				} else {
					v.setPixel(i, j, Color.GREEN);
				}
			}
			
		}
		
		
		ImageIO.write(v.image, "PNG", new File("D:\\Test.png"));
	}

	
}
