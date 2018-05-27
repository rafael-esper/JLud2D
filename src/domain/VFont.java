package domain;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;

import java.awt.Color;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/*
 * There are two formats of VFonts: 
 * - default  20x5 (100 chars) and various subsets
 * - extended 16 x 16 (256 chars) ASCII-like
 */
public class VFont {

	private static final Logger log = LogManager.getLogger(VFont.class);

	VImage frames[];
	public int width, height;
	int fwidth[];
	boolean incolor;

	public VFont(URL url, int xsize, int ysize)	{
		
		width = xsize;
		height = ysize;

		readFont(url, xsize, ysize, 20, 5);
	}
	
	public VFont(URL url)
	{
		// this constructor autodetected cell dimensions, B
		VImage workingimage = new VImage(url);

		int rows = 0, columns = 0, last = -1;
		
		// Analyze image and guess cell dimensions.
		int bgcolor = workingimage.readPixel(0, 0);   // This is the image bg color;
		for (int w=1; w<workingimage.width; w++) {
			int z = workingimage.readPixel(w, 1);
			if (z == bgcolor) {
				if(last == z) {
					break;
				}
				columns++;
				if(width == 0)
					width = w-1;
			}
			last = z;
		}
		for (int h=1; h<workingimage.height; h++) {
			int z = workingimage.readPixel(1, h);
			if (z == bgcolor) {
				if(last == z) {
					break;
				}
				rows++;
				if(height == 0) 
					height = h-1;
			}
			last = z;
		}
		
		log.info("Reading font " + url + " with char (" + width + "," + height + "), columns = " + columns
				+ ", rows = " + rows);
		readFont(url, width, height, columns, rows);
	}

	private void readFont(URL url, int xsize, int ysize, int columns, int rows) {
		VImage workingimage = new VImage(url);

		incolor = false;

		frames = new VImage[columns * rows];
		int imageindex = 0;
		for (int yl = 0; yl<rows; yl++)
			for (int xl = 0; xl<columns; xl++) {
				frames[imageindex] = new VImage(xsize, ysize);
				frames[imageindex++].tgrabRegion(1+(xl*(xsize+1)), 1+(yl*(ysize+1)), width+1+(xl*(xsize+1)), height+1+(yl*(ysize+1)),
					0, 0, Color.MAGENTA, workingimage);
			}

		fwidth = new int[columns*rows];
		for (int i=0; i<columns*rows; i++)
			fwidth[i] = xsize; // + 1 (commented by [Rafael])

	}
	
	boolean ColumnEmpty(int cell, int column, int tcolor)
	{
		//container.data = ((int) rawdata.data + ((cell)*width*height*vid_bytesperpixel));
		for (int y=0; y<frames[cell].height; y++)
			if (frames[cell].readPixel(column, y) != tcolor)
				return false;
		return true;
	}

	public void enablevariablewidth() {
		fwidth[0] = width * 60 / 100;
		int tcolor = frames[0].readPixel(0, 0);
		for (int i=1; i<frames.length; i++)
		{
			fwidth[i] = -1;
			for (int x=width-1; x>=0; x--)
			{
				if (!ColumnEmpty(i, x, tcolor))
				{
					fwidth[i] = x + 1;
					break;
				}
			}
			if (fwidth[i]==-1) 
				fwidth[i] = width * 60 / 100;
			//log.info(((char)(i+32)) + " " + fwidth[i]);
		}
	}

	void SetCharacterWidth(int character, int width)
	{
		fwidth[character] = width;
	}

	public void PrintChar(char c, int x, int y, VImage dest)
	{
		// Default 100 frames
		if(this.frames.length == 100) {
			if (c<32 || c>=128) 
				return;  
			dest.tblit(x, y, frames[c-32].image);
		}
		else {
			// Specials hanging chars that go beyond
			if(c == ' ') {
				return;
			}
			if(c == 'q' || c == 'y' || c == 'g' || c == 'p') {
				dest.tblit(x, y+1, frames[c].image);	
			} else {
				dest.tblit(x, y, frames[c].image);
			}
		}
	}

	// print a chunk of a string; doesn't care about newlines
	// called from PrintString, PrintCenter, and PrintRight, which DO care about newlines
	public void PrintLine(String s, int x, int y, VImage dest)
	{
		for (int pos=0; pos < s.length(); pos++)
		{
			if (s.charAt(pos) == '\f')
			{
				/*
				// what's wrong with just using \f0?
				if (incolor)
				{
					selected = 0;
					incolor = false;
					continue;
				}
				*/
//				selected = s.charAt(pos) - '0';
//				if (selected >= subsets || selected < 0)
//					selected = 0;
//				else
//					incolor = true;
//				continue;
			}
			PrintChar(s.charAt(pos), x, y, dest);
			if(frames.length == 100) {
				if (s.charAt(pos) < 32) continue;
				x += fwidth[s.charAt(pos) - 32] + 1;
			} else {
				x += fwidth[s.charAt(pos)] + 1;
			}
		}
	}

	public void PrintString(String msg, int x, int y, VImage dest)
	{
		int start = 0, end = 0;

	    for (end = 0; end < msg.length(); end++)
		{
			if (msg.charAt(end) == '\n' || msg.charAt(end) == '\r')
			{
				PrintLine(msg.substring(0, end),x,y,dest);

				// Check for \r\n so they aren't parsed as two separate line breaks.
				if (msg.charAt(end) == '\r' && msg.length() > end+1 && msg.charAt(end+1) == '\n')
					end++;
				start = end + 1;

				y += height;
			}
		}
		PrintLine(msg.substring(start, end),x,y,dest);
	}

	public void PrintRight(String msg, int x, int y, VImage dest)
	{
		int xsize = 0;
		int start = 0, end = 0;

		if(msg==null)
			return;
		
	    for (end = 0; end < msg.length(); end++)
		{
			if (msg.charAt(end) == '\n' || msg.charAt(end) == '\r')
			{
				xsize = Pixels(msg.substring(0, end));
				PrintLine(msg.substring(0, end),x - (xsize),y,dest);

				// Check for \r\n so they aren't parsed as two separate line breaks.
				if (msg.charAt(end) == '\r' && msg.length() > end+1 && msg.charAt(end+1) == '\n')
					end++;
				start = end + 1;

				y += height;
			}
		}
		xsize = Pixels(msg.substring(start, end));
		PrintLine(msg.substring(start, end),x - xsize,y,dest);

		incolor = false;
	}

	public void PrintCenter(String msg, int x, int y, VImage dest)
	{
		int xsize = 0;
		int start = 0, end = 0;

	    for (end = 0; end < msg.length(); end++)
		{
			if (msg.charAt(end) == '\n' || msg.charAt(end) == '\r')
			{
				xsize = Pixels(msg.substring(0, end));
				PrintLine(msg.substring(0, end),x - (xsize/2),y,dest);

				// Check for \r\n so they aren't parsed as two separate line breaks.
				if (msg.charAt(end) == '\r' && msg.length() > end+1 && msg.charAt(end+1) == '\n')
					end++;
				start = end + 1;

				y += height;
			}
		}
		xsize = Pixels(msg.substring(start, end));
		PrintLine(msg.substring(start, end),x - (xsize/2),y,dest);

		incolor = false;
	}

	public int Pixels(String str)
	{
		int xsize = 0;
		boolean ic = incolor;

	    for (int i=0; i<str.length(); i++)
		{
			if (str.charAt(i) == '\f')
			{
				/*
				// what's wrong with just using \f0?
				if (incolor)
				{
					incolor = false;
					continue;
				}
				*/
				if (i+1 > str.length()) break;
				incolor = true;
				continue;
			}
			else
			{
				if(frames.length == 100) {
					if (str.charAt(i) < 32) continue;
					xsize += fwidth[str.charAt(i) - 32] + 1;
				} else {
					xsize += fwidth[str.charAt(i)] + 1;
				}
			}
		}

		incolor = ic; // reset the incolor flag
		return xsize;
	}
	
	//VI.i. Font Functions
	public int fontheight() {
		//if (this==null) return 7;
		return this.height;
	}
	public void printcenter(int x, int y, VImage dest, String text) { 
		this.PrintCenter(text, x, y, dest);
	}
	
	public void printright(int x, int y, VImage dest, String text) { 
		this.PrintRight(text, x, y, dest);
	}
	
	public void printstring(int x, int y, VImage dest, String text) {
		this.PrintString(text, x, y, dest);
	}
	
	public int textwidth(String text) {
		return this.Pixels(text);
	}

	// Overkill: 2005-12-28
	// Helper function for WrapText.
	int textwidth(String text, int pos, int len) {
		return this.Pixels(text.substring(pos, pos+len));
	}
	
	// Rafael: changed the implementation
	// Split list of words into rows 
	public List<String> wraptext(String wt_s, int wt_linelen) {
		List<String> words = splitTextIntoWords(wt_s);
		List<String> rows = new ArrayList<String>();
		int i = 0;
		String str;
		while (i < words.size()) {
			str = words.get(i);
		    while (i < words.size()-1 && this.textwidth(str) + this.textwidth(words.get(i+1)) <= wt_linelen) {
		       str = str.concat(" " + words.get(i+1));
		       i++;
			}
		    rows.add(str); //log.info(str);
		    str = "";
		    i++;
		}
		return rows;
	}
	
}
