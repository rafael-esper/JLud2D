/*

Name:
DISPLAY.C

Description:
Ncurses display section of mikmod - bare unix version.

Should deal with all the m_.quiet options and refresh() after ncurses calls,
so just call these functions direct wherever needed. 

Steve McIntyre <stevem@chiark.greenend.org.uk>

HISTORY
=======

v1.00 (06/12/96) - first "versioned" version
v1.01 (06/12/96) - fixed update_name_display for Solaris - add "(null)" if necessary
v1.02 (16/12/96) - minor cosmetic change to display_error()

*/

package audio.jmikmod.MikMod.Display;

import audio.jmikmod.MikMod.*;
import audio.jmikmod.MikMod.MUniTrk.*;

public class clDisplay extends clDisplayBase
{

        public clMain m_;

        public final String pausebanner =
"'||''|.    |   '||'  '|' .|'''.| '||''''| '||''|.\n" +
" ||   ||  |||   ||    |  ||..  '  ||  .    ||   || \n" +
" ||...|' |  ||  ||    |   ''|||.  ||''|    ||    ||\n"+
" ||     .''''|. ||    | .     '|| ||       ||    ||\n"+
".||.   .|.  .||. '|..'  |'....|' .||.....|.||...|'\n"
        ;

        public final String loadbanner =
"'||'                          '||   ||\n"+
" ||         ...    ....     .. ||  ...  .. ...    ... . \n"+
" ||       .|  '|. '' .||  .'  '||   ||   ||  ||  || ||  \n"+
" ||       ||   || .|' ||  |.   ||   ||   ||  ||   |''   \n"+
".||.....|  '|..|' '|..'|' '|..'||. .||. .||. || .'||||. \n"+
"                                                .|....'\n"

        ;
            
        public final String extractbanner =
"'||''''|          .                         .   ||\n"+
" ||  .   ... ....||. ... ..  ....    .... .||. ... .. ...   ... . \n"+
" ||''|    '|..'  ||   ||' '''' .|| .|   '' ||   ||  ||  || || || \n"+
" ||        .|.   ||   ||    .|' || ||      ||   ||  ||  ||  |'' \n"+
".||.....|.|  ||. '|.'.||.   '|..'|' '|...' '|.'.||..||. ||.'||||. \n"+
"                                                          .|....'\n"
    
        ;
            

	protected int cWritten;
    

public clDisplay(clMain theMain)
{
    m_ = theMain;
}

protected final int stdscr=0;

public void initscr() {}
public void cbreak() {}
public void noecho() {}
public void nonl() {}
public void nodelay(int i, boolean b) {}
public void keypad(int i, boolean b) {}
public void clear() {}
public void addstr(String s)
{
    //System.out.print(s); [Rafael]
}
public void refresh() {}
public void endwin() {}

public void init_display()
{
	if(m_.quiet) return;
	initscr(); 
	cbreak(); 
	noecho(); 
	nonl(); 
	nodelay(stdscr, true);
	keypad(stdscr, true);
        m_.cur_mod.version = m_.mikversion;
}


public void display_version()
{
	if(m_.quiet) return;

	/* always use display_verion first, so clear call is OK here... */
	clear(); 

	addstr(m_.cur_mod.version);
	refresh();
}	

public void display_driver()
{
	if(m_.quiet) return;
	addstr(m_.cur_mod.driver);
	refresh();
}	

public void display_file()
{
        if(m_.quiet) return;
        addstr(m_.cur_mod.file_output);
	refresh();
}	

public void display_name()
{
	if(m_.quiet) return;
	addstr(m_.cur_mod.name_type);
	refresh();
}	

public void display_status()
{
	if(m_.quiet) return;
	addstr(m_.cur_mod.status);
	refresh();
}	

public void display_pausebanner()
{
	if(m_.quiet) return;
	addstr(pausebanner);
	refresh();
}	

public void display_extractbanner()
{
	if(m_.quiet) return;
	addstr(extractbanner);
	refresh();
}	

public void display_loadbanner()
{
	if(m_.quiet) return;
	addstr(loadbanner);
	refresh();
}	

public void display_error(String myerr, String myerr_file)
{
        if(m_.quiet) return;
        //printw("Non-fatal Error:\n %s: \"%s\".\n",(const char *)*myerr,(const char *)*myerr_file);
        addstr("Non-fatal Error:\n " + myerr + ": \"" + myerr_file + "\".\n");
        refresh();
        try {
            Thread.sleep(3000); //sleep(3);
        }
        catch (InterruptedException intexp1)
        {
        }
}	

public void display_driver_error(String myerr)
{
	if(m_.quiet) return;
        //printw("Driver error: %s.\n",(const char *)*myerr);
        addstr("Driver error: " + myerr + ".\n");
	refresh();
}	

public void display_all()
{
	if(m_.quiet) return;
	display_version();
	display_driver();
	display_file();
	display_name();
	display_status();
}	

public void update_driver_display()
{
        if(m_.quiet) return;

        m_.cur_mod.driver = m_.MDriver.GetActiveDriver().Name + ": " +
            (((m_.MDriver.md_mode & m_.DMODE_16BITS) != 0) ? 16:8) + " bit " +
            (((m_.MDriver.md_mode & m_.DMODE_INTERP) != 0) ? "interpolated":"normal") + " " +
            (((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? "stereo":"mono") + ", " +
            m_.MDriver.md_mixfreq + " Hz\n";
            
}

public void update_file_display()
{
        if(m_.quiet) return;
        m_.cur_mod.file_output = "File: " + m_.cur_mod.filename + m_.d_text[m_.cur_mod.deleted?1:0] + "\n";
}

public void update_name_display()
{
	if(m_.quiet) return;

        m_.cur_mod.name_type = "Name: "  +
            ((m_.cur_mod.songname.length()==0) ? "(null)" : (m_.cur_mod.songname)) +
            "\n" +
            "Type: " + m_.cur_mod.modtype + ", " +
            "Periods: " + (((m_.cur_mod.flags & m_.MUniTrk.UF_XMPERIODS) != 0) ? "XM type" : "mod type") +
            "," + (((m_.cur_mod.flags & m_.MUniTrk.UF_LINEAR) != 0) ? "Linear" : "Log") + "\n";
}

public void update_status_display()
{
        if(m_.quiet) return;
        m_.cur_mod.status = "\rpat:" + m_.cur_mod.sngpos + "/" + m_.cur_mod.numpat +
            " pos:" + m_.cur_mod.patpos +
            " spd:" + m_.MPlayer.mp_sngspd +
            " bpm:" + (m_.MPlayer.speed_constant*100) +
            "% vol:" + m_.MPlayer.mp_volume + "% ";
}

public void exit_display()
{
	if(m_.quiet) return;
	endwin();
}


    

}