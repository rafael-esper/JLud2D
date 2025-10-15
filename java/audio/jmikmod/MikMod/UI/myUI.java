/*

Name:
UI.C

Description:
Curses parser for Tracker-like controls - bare linux (unix?) version.
Shamelessly adapted from tracker v4.3 by Marc Espie

By using the UI_... return style, an X equivalent should drop in as a
replacement. 

Steve McIntyre <stevem@chiark.greenend.org.uk>

HISTORY
=======

v1.00 (06/12/96) - first "versioned" version
v1.01 (06/12/96) - changed email address to stevem@chiark

*/

package audio.jmikmod.MikMod.UI;

import audio.jmikmod.MikMod.*;

public class myUI extends Object
{
public static final int BASE_UI = 10;
public static final int UI_NEXT_SONG =   (BASE_UI);            /* load next song */

public static final int UI_RESTART =(BASE_UI + 1);          /* restart current song. Not
					     quite jump to 0 */
public static final int UI_PREVIOUS_SONG =(BASE_UI + 2);    /* load previous song */

public static final int UI_LOAD_SONG =(BASE_UI + 3);        /* load song. Name as value */
public static final int UI_SET_BPM =(BASE_UI + 4);          /* set beat per minute to value */

public static final int UI_JUMP_TO_NEXT_PATTERN= (BASE_UI + 5);  /* jump to pattern */
public static final int UI_RESTART_PATTERN= (BASE_UI + 7);  /* jump to pattern */
public static final int UI_JUMP_TO_PREV_PATTERN= (BASE_UI + 7);  /* jump to pattern */

public static final int UI_QUIT= (BASE_UI + 6);             /* need I say more ? */
public static final int UI_DISPLAY= (BASE_UI + 7);          /* status of scrolling window:
					     true or false */
public static final int UI_PAUSE= (BASE_UI + 8);             /* need I say more ? */

public static final int UI_SPEED_UP= (BASE_UI + 9);             /* raise the speed */
public static final int UI_SLOW_DOWN= (BASE_UI + 10);         /* slow down */
public static final int UI_NORMAL_SPEED= (BASE_UI + 11);      /* return to normal */

public static final int UI_VOL_UP= (BASE_UI + 12);             /* raise the volume */
public static final int UI_VOL_DOWN= (BASE_UI + 13);         /* quieten down */
public static final int UI_NORMAL_VOL= (BASE_UI + 14);      /* return to normal */

public static final int UI_MARK_DELETED= (BASE_UI + 15); /* mark mod for deletion */
public static final int UI_DELETE_MARKED= (BASE_UI + 16); /* delete MARKED mods, ignore otherwise */

public static final int UI_SELECT_MONO= (BASE_UI + 17);	/* additions for changing of audio */
public static final int UI_SELECT_STEREO= (BASE_UI + 18); /* paramaters on the fly */

public static final int UI_SELECT_INTERP= (BASE_UI + 19);
public static final int UI_SELECT_NONINTERP= (BASE_UI + 20);

public static final int UI_SELECT_8BIT= (BASE_UI + 21);
public static final int UI_SELECT_16BIT= (BASE_UI + 22);

public static final int SMALL_DELAY = 15;


	public clMain m_;

	public int current_pattern;
	public int count_pattern, count_song;

public myUI(clMain theMain)
{
    m_ = theMain;
}

public int may_getchar()
{
    int buffer;
/*#ifdef WIN32
	if (kbhit())
	{
		buffer=getch();
		return buffer;
	}
	else
            return EOF;
#else
        buffer = getch();
        if (buffer != ERR)
        {
            return buffer;
        }
        return EOF;
        #endif*/
    return -1;
        
	/*if (buffer != ERR)
		return buffer;
	else
		return EOF;   */
}

public int get_ui()
   {
   m_.MPlayer.ui_result = 2;
   switch(may_getchar())
      {
   case 'n':
   case 'N':
   //case KEY_DOWN:
   case 13: /*carriage return*/
      m_.MPlayer.ui_result = UI_NEXT_SONG;
      m_.MPlayer.play_current=false;
      break;
   case 'p':
   case 'P':
   //case KEY_UP:
      m_.MPlayer.ui_result = UI_PREVIOUS_SONG;
      break;
   case 'x':
   case 'e':
   case 'q':
   case 'X':
   case 'E':
   case 'Q':
      m_.MPlayer.ui_result = UI_QUIT;
      break;
   case '.':
	m_.MPlayer.ui_result= UI_SPEED_UP;
	break;
   case ',':
	m_.MPlayer.ui_result= UI_SLOW_DOWN;
	break;
   case '/':
	m_.MPlayer.ui_result= UI_NORMAL_SPEED;
	break;
   case '+':
	m_.MPlayer.ui_result= UI_VOL_UP;
	break;
   case '-':
	m_.MPlayer.ui_result= UI_VOL_DOWN;
	break;
   case '*':
	m_.MPlayer.ui_result= UI_NORMAL_VOL;
	break;
   case '>':
   //case KEY_RIGHT:
      m_.MPlayer.ui_result = UI_JUMP_TO_NEXT_PATTERN;
      break;
   case '<':
   //case KEY_LEFT:
      m_.MPlayer.ui_result = UI_JUMP_TO_PREV_PATTERN;
      break;
   case ' ':
      m_.MPlayer.ui_result = UI_PAUSE;
      break;
   case 'd':
   case 'D':
      m_.MPlayer.ui_result = UI_MARK_DELETED;
      break;
   case 'y':
   case 'Y':
      m_.MPlayer.ui_result = UI_DELETE_MARKED;
      break;
   case '1':
      m_.MPlayer.ui_result = UI_SELECT_MONO;
      break;
   case '2':
      m_.MPlayer.ui_result = UI_SELECT_STEREO;
      break;
   case 'i':
      m_.MPlayer.ui_result = UI_SELECT_INTERP;
      break;
   case 'o':
      m_.MPlayer.ui_result = UI_SELECT_NONINTERP;
      break;
   case '8':
      m_.MPlayer.ui_result = UI_SELECT_8BIT;
      break;
   case '9':
      m_.MPlayer.ui_result = UI_SELECT_16BIT;
      break;
   default:
      break;
      }
   return m_.MPlayer.ui_result;
   }

}
