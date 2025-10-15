/*

Name:
MIKMODUX.C

Description:
Modplaying example of mikmod - bare unix? version.

Original by MikMak <mikmak@via.nl>, 
then Chris Conn <cconn@tohs.abacom.com>,
then Steve McIntyre <stevem@chiark.greenend.org.uk>

HISTORY
=======

v1.00 (06/12/96) - first "versioned" version

*/

package audio.jmikmod.MikMod;

import java.io.*;
import java.lang.*;
import java.net.URL;

import audio.jmikmod.MikMod.*;
import audio.jmikmod.MikMod.Display.*;
import audio.jmikmod.MikMod.Drivers.*;
import audio.jmikmod.MikMod.Loaders.*;
import audio.jmikmod.MikMod.MDriver.*;
import audio.jmikmod.MikMod.MLoader.*;
import audio.jmikmod.MikMod.MMIO.*;
import audio.jmikmod.MikMod.MPlayer.*;
import audio.jmikmod.MikMod.MUniTrk.*;
import audio.jmikmod.MikMod.UI.*;
import audio.jmikmod.MikMod.Virtch.*;



public class clMain extends clMainBase {

        
        public final int DMODE_STEREO =  1;
        public final int DMODE_16BITS =  2;
        public final int DMODE_INTERP =  4;


    

	public String d_text[];
	public String helptext;
	public boolean quiet;
        public short md_type;

        public final String mikversion = mikversion_;

        public int optind, opterr, in_opt_charpos;
        public String optarg; //char optarg[80];

        public clMPlayer MPlayer;
	public clVirtch Virtch;
	public myUI UI;
        public clMDriver MDriver;
        public clDisplay Display;


    
public clMain()
{
    {
        int i;
        d_text = new String[4];
    
        for(i=0;i<4;i++)
            d_text[i] = new String();

        cur_mod = new curmod();

    }

            
	d_text[0] = "            ";	/*standard, not deleted*/
	d_text[1] = " <del>      ";	/*marked for deletion*/
	d_text[2] = " <deleted>  ";	/*deleted, gone!*/
	d_text[3] = " <del error>";	/*can't delete...*/

	helptext= new String(

"Available switches (CaSe SeNsItIvE!):\n" +
"\n" +
"  -d x    use device-driver #x for output (0 is autodetect). Default=0\n" +
"  -ld     List all available device-drivers\n"+
"  -ll     List all available loaders\n"+
"  -x      disables protracker extended speed\n"+
"  -p      disables panning effects (9fingers.mod)\n"+
"  -v xx   Sets volume from 0 (silence) to 100. Default=100\n"+
"  -f xxxx Sets mixing frequency. Default=44100\n"+
"  -m      Force mono output (so sb-pro can mix at 44100)\n"+
"  -8      Force 8 bit output\n"+
"  -i      Use interpolated mixing\n"+
"  -r      Restart a module when it's done playing\n"+
"  -q      Quiet mode (interactive commands disabled, displays only errors)\n" +

/*#ifdef CPUTIME_SNAGGER
"  -s      Renice to -20 (more scheduling priority)\n"+
"  -S      Get realtime priority (snag all the cpu needed, beware :))\n"+
#endif /* CPUTIME_SNAGGER */

"  -t      Tolerant mode - do not stop on non-fatal file access errors." );

	quiet=false;           /* set if quiet mode is enabled */
	md_type=0;       /* default is a non-wavetable sound device */

        optind = 0;
        in_opt_charpos = 0;
}


/*
    public int clMain.usleep()

    Well, I just implemented it using Java's Thread.Sleep(). It doesn't have
    range checking yet, but since it's called only once 1000 as its parameter
    it should do fine.
*/

/*
 *  NAME:
 *      usleep     -- This is the precision timer for Test Set
 *                    Automation. It uses the select(2) system
 *                    call to delay for the desired number of
 *                    micro-seconds. This call returns ZERO
 *                    (which is usually ignored) on successful
 *                    completion, -1 otherwise.
 *
 *  ALGORITHM:
 *      1) We range check the passed in microseconds and log a
 *         warning message if appropriate. We then return without
 *         delay, flagging an error.
 *      2) Load the Seconds and micro-seconds portion of the
 *         interval timer structure.
 *      3) Call select(2) with no file descriptors set, just the
 *         timer, this results in either delaying the proper
 *         ammount of time or being interupted early by a signal.
 *
 *  HISTORY:
 *      Added when the need for a subsecond timer was evident.
 *	Modified for Solaris-specific bits by SAM 24/10/96
 *  AUTHOR:
 *      Michael J. Dyer                   Telephone:   AT&T 414.647.4044
 *      General Electric Medical Systems        GE DialComm  8 *767.4044
 *      P.O. Box 414  Mail Stop 12-27         Sect'y   AT&T 414.647.4584
 *      Milwaukee, Wisconsin  USA 53201                      8 *767.4584
 *      internet:  mike@sherlock.med.ge.com     GEMS WIZARD e-mail: DYER
 */

public int usleep( int microSeconds )
{
    try
    {
        Thread.sleep(microSeconds/1000,(microSeconds%1000)*1000);
    }
    catch (InterruptedException intex1)
    {
    }
    return 0;
}

int java_getopt(int argc, String argv[], String optstring)
{
    int ret=mmIO.EOF,i;

    if (optind < 1)
        optind = 1;
    
    if (optind == argc)
        return mmIO.EOF;
    if ((in_opt_charpos == 0) && (argv[optind].charAt(0) == '-'))
    {
        in_opt_charpos = 1;
    }
    if (in_opt_charpos > 0)
    {
        ret = '?';
        for(i=0;i != optstring.length() ; i++)
        {
            if (optstring.charAt(i) == ':')
                continue;
            if (argv[optind].charAt(in_opt_charpos) == optstring.charAt(i))
            {
                ret = argv[optind].charAt(in_opt_charpos);
                if (optstring.charAt(i+1) == ':')
                {
                    //if (argv[optind].charAt(in_opt_charpos+1) == '\0')
                    if (argv[optind].length() == in_opt_charpos+1)
                    {
                        optarg = new String(argv[++optind]);
                    }
                    else
                    {
                        optarg = new String(argv[optind].substring(in_opt_charpos+1));
                        //strcpy(optarg, argv[optind]+in_opt_charpos+1);
                    }
                    in_opt_charpos = 0;
                }
                else
                {
                    in_opt_charpos++;
                    //if (argv[optind].charAt(in_opt_charpos) == '\0')
                    if (argv[optind].length() == in_opt_charpos)
                    {
                        optind++;
                        in_opt_charpos = 0;
                    }
                    return ret;
                }
                break;
            }
        }
        optind++;
    }
    return ret;

    /*int ret = getopt(argc, argv, optstring);
    if (::optarg != NULL)
        strcpy(optarg, ::optarg);
    else
        optarg[0] = '\0';
    return ret;*/
}


/*

public int clMain.main()
 
This function corresponds with the C program main() function. It also accepts
an array of string a-la-style of C's "char * argv[]" parameter: argv[0] is
an arbitary program name, as in C.

 */
public int main(String nargv[], URL url)
{

        int nargc = nargv.length;

    
	UNIMOD mf=null;
	int cmderr=0;                   /* error in commandline flag */
	int morehelp=0;                 /* set if user wants more help */
	int t;
	//extern float speed_constant;   /* tempo multiplier, initialised to 1*/

        /*
		Initialize soundcard parameters.. you _have_ to do this
		before calling MD_Init(), and it's illegal to change them
		after you've called MD_Init()
	*/

        boolean tolerant    =false;


	MUniTrk = new clMUniTrk(this);
	
	MPlayer = new clMPlayer(this);

	Virtch = new clVirtch(this);

	mmIO = new MMIO(this);
	mmIO._mm_setiobase(0);

	UI = new myUI(this);

        Display = new clDisplay(this);
        super.Display = Display;

        MDriver = new clMDriver(this);
        super.MDriver = MDriver;

	MLoader = new clMLoader(this);


	MPlayer.play_current    =true;	/* we are playing _this_ mod; jump to next
				   when this goes to 0 */
	MDriver.md_mixfreq      =44100;                     /* standard mixing freq */
	MDriver.md_dmabufsize   =32768;                     /* standard dma buf size */
	MDriver.md_mode         =(short)(DMODE_16BITS|DMODE_STEREO); /* standard mixing mode */
	MDriver.md_device       =0;                  /* standard device: autodetect */


	/*
		Register the loaders we want to use..
	*/
	M15_Loader cl_load_m15 = new audio.jmikmod.MikMod.Loaders.M15_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_m15);
        MOD_Loader cl_load_mod = new MOD_Loader(this);
        MLoader.ML_RegisterLoader(cl_load_mod);
	MTM_Loader cl_load_mtm = new audio.jmikmod.MikMod.Loaders.MTM_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_mtm);
	S3M_Loader cl_load_s3m = new audio.jmikmod.MikMod.Loaders.S3M_Loader(this);
        MLoader.ML_RegisterLoader(cl_load_s3m);
	STM_Loader cl_load_stm = new audio.jmikmod.MikMod.Loaders.STM_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_stm);
	ULT_Loader cl_load_ult = new audio.jmikmod.MikMod.Loaders.ULT_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_ult);
        UNI_Loader cl_load_uni = new audio.jmikmod.MikMod.Loaders.UNI_Loader(this);
        MLoader.ML_RegisterLoader(cl_load_uni);
	S69_Loader cl_load_669 = new audio.jmikmod.MikMod.Loaders.S69_Loader(this);
        MLoader.ML_RegisterLoader(cl_load_669);
	XM_Loader  cl_load_xm = new audio.jmikmod.MikMod.Loaders.XM_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_xm);

	/*
		Register the drivers we want to use:
	*/


    NS_Driver cl_drv_nos = new NS_Driver(this);
    MDriver.MD_RegisterDriver(cl_drv_nos);
    Raw_Driver cl_drv_raw = new Raw_Driver(this);
    MDriver.MD_RegisterDriver(cl_drv_raw);
    /*
     * Commenting out so we won't depend on the native extension.
    Native_Driver cl_drv_native = new Native_Driver(this);
    MDriver.MD_RegisterDriver(cl_drv_native);
    */
    Wav_Driver cl_drv_wav = new Wav_Driver(this);
    MDriver.MD_RegisterDriver(cl_drv_wav);
    JavaX_Driver cl_drv_javax = new JavaX_Driver(this);
    MDriver.MD_RegisterDriver(cl_drv_javax);

// [Rafael]
MPlayer.mp_loop=true;
quiet = true;


/*#ifdef SUN
	MD_RegisterDriver(&drv_sun);
#elif defined(SOLARIS)
	MD_RegisterDriver(&drv_sun);
#elif defined(__alpha)
        MD_RegisterDriver(&drv_AF);
#elif defined(OSS)
        Vox_Driver cl_drv_vox(this);
        MDriver.MD_RegisterDriver(&cl_drv_vox);
	#ifdef ULTRA
	       MD_RegisterDriver(&drv_ultra);
	#endif // ULTRA
#elif defined(__hpux)
        MD_RegisterDriver(&drv_hp);
#elif defined(AIX)
        MD_RegisterDriver(&drv_aix);
#elif defined(SGI)
        MD_RegisterDriver(&drv_sgi);
#elif defined(WIN32)
		//MDriver.MD_RegisterDriver(&drv_win32);
		Win32_Driver cl_drv_win32(&main_class);
		MDriver.MD_RegisterDriver(&cl_drv_win32);
#endif */

	//MDriver.MD_RegisterPlayer(clMDriver::tickhandler);

	/* Parse option switches using standard getopt function: */

	opterr=0;

	while( (cmderr==0) &&
//#ifdef CPUTIME_SNAGGER
//		(t=java_getopt(nargc,nargv,"ohxpm8irv:f:l:d:tsS")) != mmIO.EOF ){
//#else
		(t=java_getopt(nargc,nargv,"ohxpm8irv:f:l:d:t")) != mmIO.EOF ){

		switch(t){

			case 'd':
				MDriver.md_device=Integer.valueOf(optarg).intValue();
				break;

			case 'l':
				if(optarg.charAt(0)=='d') MDriver.MD_InfoDriver();
				else if(optarg.charAt(0)=='l') MLoader.ML_InfoLoader();
				else{
					cmderr=1;
					break;
				}
				return 0; //exit(0);

			case 'r':
				MPlayer.mp_loop=true;
				break;

			case 'm':
				MDriver.md_mode &= ~DMODE_STEREO;
				break;

			case '8':
				MDriver.md_mode &= ~DMODE_16BITS;
				break;

			case 'i':
				MDriver.md_mode |= DMODE_INTERP;
				break;

			case 'x':
				MPlayer.mp_extspd=false;
				break;

			case 'p':
				MPlayer.mp_panning=false;
				break;

			case 'v':
				if((MPlayer.mp_volume=(short)(Integer.valueOf(optarg).intValue()))>100)
					MPlayer.mp_volume=100;
				break;

			case 'f':
				MDriver.md_mixfreq = Integer.valueOf(optarg).intValue();
				break;

			case 'h':
				morehelp=1;
				cmderr=1;
				break;

			case 't':
				tolerant=true;
				break;

			case 'q':
				quiet=true;
				break;

/*#ifdef CPUTIME_SNAGGER
			case 's':
				if (nice(-20) == -1)
					perror("renice to -20");
				break;
			case 'S':
				{
					struct sched_param sp;
					memset(&sp, 0, sizeof(struct sched_param));
					sp.sched_priority = 1;
					if (sched_setscheduler(0, SCHED_RR, &sp) == -1)
						perror("realtime priority");
				}
				break;
#endif /* CPUTIME_SNAGGER */

			case '?':
				System.out.println("\07Invalid switch or option needs an argument\n");
				cmderr=1;
				break;
		}
	}

	if((cmderr!=0) || optind>=nargc){

		/*
			there was an error in the commandline, or there were no true
			arguments, so display a usage message
		*/

                System.out.print("Usage: "+nargv[0]+" [switches] <fletch.mod> ... \n");

                if(morehelp != 0)
                        System.out.println(helptext);
                else
                        System.out.print("Type "+nargv[0]+" -h for more help.\n");

                return -1; //exit(-1);
	}

	if (!quiet)
		System.out.print(mikbanner);

	/*  initialize soundcard */

	if(!MDriver.MD_Init()){
		System.out.print("Driver error: "+mmIO.myerr+".\n");
		return 0;
	}

	/*  initialize volume and tempo multipliers */

	MPlayer.speed_constant=(float)1.0;
	MPlayer.mp_volume=100;


        cur_mod.version = new String();
        cur_mod.driver = new String();
        cur_mod.filename = null; //new String();
        cur_mod.file_output = new String();
        cur_mod.name_type = new String();
        cur_mod.status = new String();
                
	/*  initialize curses interface */
        Display.init_display();


	for(MPlayer.quit=false; !MPlayer.quit && optind<nargc; optind++){

	/* kill audio output, as some mods sound awful left hanging... */
		MDriver.MD_PatternChange();

                cur_mod.deleted=false;
                cur_mod.filename = url; //new String(nargv[optind]);

		/* load the module */

                {
                    //String strFilename = new String(nargv[optind]);
                    mf=MLoader.ML_LoadFN(cur_mod.filename);
                }

		/* didn't work . exit with errormsg. */

		if(mf==null){
			if(tolerant)
			{
				Display.display_version();
				Display.display_error(mmIO.myerr,mmIO.myerr_file);
				continue;
			}
			else
			{
                                //printf("MikMod Error: %s\n",mmIO.myerr);
                                System.out.print(("MikMod Error: " + mmIO.myerr + "\n"));
				break;
			}
		}

		/*      initialize modplayer to play this module */

		MPlayer.MP_Init(mf);

		Display.update_driver_display();
		Display.update_file_display();
		Display.display_version();
		Display.display_driver();
		Display.display_file();

		cur_mod.numpat=mf.numpos;
		cur_mod.songname=mf.songname;
		cur_mod.modtype=mf.modtype;
		cur_mod.flags=mf.flags;
		Display.update_name_display();
		Display.display_name();

		
		/*	set the number of voices to use.. you
			could add extra channels here (e.g. md_numchn=mf.numchn+4; )
			to use for your own soundeffects:
		*/

		MDriver.md_numchn=mf.numchn;

		/*  start playing the module: */

		MDriver.MD_PlayStart();

		while((! MPlayer.MP_Ready() ) && (! MPlayer.quit)){ /* if we have a quit signal, exit loop */

			MDriver.MD_Update();

			/* no need to wait with the unix drivers */

			if (md_type == 0) /* handled elsewhere for GUS cards */
			{
				/* update the status display... */
				cur_mod.sngpos=(short)(MPlayer.mp_sngpos+1);
				cur_mod.patpos=(short)MPlayer.mp_patpos;
				Display.update_status_display();
				Display.display_status();
			}

			if(!MPlayer.play_current){ 	/*play_current=0 when the next or previous*/
				MPlayer.play_current=true;	/*mod is selected*/
				break;
			}
		}
		MDriver.MD_PlayStop();          /* stop playing */
		MLoader.ML_Free(mf);            /* and free the module */

	}

	MDriver.MD_Exit();
	Display.exit_display();
	if (MPlayer.quit)
		{
		return 0;
		}
	if(!quiet)
		if(mf==null){
                        //printf("MikMod Error: %s\n",mmIO.myerr);
                        System.out.println(("MikMod Error: " + mmIO.myerr + "\n"));
			if((mmIO.myerr_file == null) || (mmIO.myerr_file == ""))
                                //printf("%s\n",mmIO.myerr_file);
                                System.out.println(mmIO.myerr_file);
		}
		else
			System.out.print("Finished playlist...\n");
	return 1;
}

}
