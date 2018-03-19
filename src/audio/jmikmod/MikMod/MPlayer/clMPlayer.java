/*

Name:
MPLAYER.C

Description:
The actual modplaying routines
Portability:
All systems - all compilers

*/

package audio.jmikmod.MikMod.MPlayer;

import java.io.*;

import audio.jmikmod.MikMod.*;



public class clMPlayer
{


        public clMain m_;

        /*
                Envelope flags:
        */
        
        public static final int EF_ON       =    1;
        public static final int EF_SUSTAIN  =    2;
        public static final int EF_LOOP     =    4;

	public float speed_constant;
	public boolean quit;
	public int pause_flag;
	public boolean play_current;
	public int ui_result;

	public UNIMOD pf;                     /* <- this modfile is being played */
	public short reppos;                   /* patternloop position */
        public  short repcnt;                   /* times to loop */
	public short vbtick;                   /* tick counter */
	public short patbrk;                   /* position where to start a new pattern */
	public short patdly;                   /* patterndelay counter */
	public short patdly2;                  /* patterndelay counter */
	public short numrow;                   /* number of rows on current pattern */
	public short posjmp;                   /* flag to indicate a position jump is needed...
					changed since 1.00: now also indicates the
					direction the position has to jump to:

						0: Don't do anything
						1: Jump back 1 position
						2: Restart on current position
						3: Jump forward 1 position
						*/
        public boolean   forbid;                   /* forbidflag */

	protected int isfirst;


	/*
		Set forbid to 1 when you want to modify any of the mp_sngpos, mp_patpos etc.
		variables and clear it when you're done. This prevents getting strange
		results due to intermediate interrupts.
	*/


	public AUDTMP mp_audio[]; //[32];    /* max 32 channels */
	public short  mp_bpm;                  /* beats-per-minute speed */
	public short  mp_patpos;               /* current row number (0-255) */
	public short  mp_sngpos;               /* current song position */
	public short  mp_sngspd;               /* current songspeed */
	public short  mp_channel;              /* channel it's working on */
	public boolean   mp_extspd;             /* extended speed flag, default enabled */
	public boolean   mp_panning;    /* panning flag, default enabled */
	public boolean   mp_loop;               /* loop module ? */
	public short  mp_volume;   /* song volume (0-100) (or user volume) */

	protected byte globalvolume;   /* global volume */
	protected short globalslide;

	public AUDTMP a;                              /* current AUDTMP it's working on */

	public float old_bpm;

    
//extern float speed_constant;
//extern int m_.quiet;
        //extern curmod m_.cur_mod;

        static short [] toshortarray(int [] intarray)
        {
            short shortarray[] = new short[intarray.length];
            int i;
            for(i=0;i<intarray.length;i++)
                shortarray[i] = (short)intarray[i];
            return shortarray;
        }

protected static final short mytab[] = {   // 12
	(short)(1712*16),(short)(1616*16),(short)(1524*16),(short)(1440*16),(short)(1356*16),(short)(1280*16),
        (short)(1208*16),(short)(1140*16),(short)(1076*16),(short)(1016*16),(short)(960*16),(short)(907*16)
};

protected short VibratoTable[];  /*={ //32
	0,24,49,74,97,120,141,161,
	180,197,212,224,235,244,250,253,
	255,253,250,244,235,224,212,197,
	180,161,141,120,97,74,49,24
};*/


/* linear periods to frequency translation table: */

protected static final int lintab[]={   //768
16726,16741,16756,16771,16786,16801,16816,16832,16847,16862,16877,16892,16908,16923,16938,16953,
16969,16984,16999,17015,17030,17046,17061,17076,17092,17107,17123,17138,17154,17169,17185,17200,
17216,17231,17247,17262,17278,17293,17309,17325,17340,17356,17372,17387,17403,17419,17435,17450,
17466,17482,17498,17513,17529,17545,17561,17577,17593,17608,17624,17640,17656,17672,17688,17704,
17720,17736,17752,17768,17784,17800,17816,17832,17848,17865,17881,17897,17913,17929,17945,17962,
17978,17994,18010,18027,18043,18059,18075,18092,18108,18124,18141,18157,18174,18190,18206,18223,
18239,18256,18272,18289,18305,18322,18338,18355,18372,18388,18405,18421,18438,18455,18471,18488,
18505,18521,18538,18555,18572,18588,18605,18622,18639,18656,18672,18689,18706,18723,18740,18757,
18774,18791,18808,18825,18842,18859,18876,18893,18910,18927,18944,18961,18978,18995,19013,19030,
19047,19064,19081,19099,19116,19133,19150,19168,19185,19202,19220,19237,19254,19272,19289,19306,
19324,19341,19359,19376,19394,19411,19429,19446,19464,19482,19499,19517,19534,19552,19570,19587,
19605,19623,19640,19658,19676,19694,19711,19729,19747,19765,19783,19801,19819,19836,19854,19872,
19890,19908,19926,19944,19962,19980,19998,20016,20034,20052,20071,20089,20107,20125,20143,20161,
20179,20198,20216,20234,20252,20271,20289,20307,20326,20344,20362,20381,20399,20418,20436,20455,
20473,20492,20510,20529,20547,20566,20584,20603,20621,20640,20659,20677,20696,20715,20733,20752,
20771,20790,20808,20827,20846,20865,20884,20902,20921,20940,20959,20978,20997,21016,21035,21054,
21073,21092,21111,21130,21149,21168,21187,21206,21226,21245,21264,21283,21302,21322,21341,21360,
21379,21399,21418,21437,21457,21476,21496,21515,21534,21554,21573,21593,21612,21632,21651,21671,
21690,21710,21730,21749,21769,21789,21808,21828,21848,21867,21887,21907,21927,21946,21966,21986,
22006,22026,22046,22066,22086,22105,22125,22145,22165,22185,22205,22226,22246,22266,22286,22306,
22326,22346,22366,22387,22407,22427,22447,22468,22488,22508,22528,22549,22569,22590,22610,22630,
22651,22671,22692,22712,22733,22753,22774,22794,22815,22836,22856,22877,22897,22918,22939,22960,
22980,23001,23022,23043,23063,23084,23105,23126,23147,23168,23189,23210,23230,23251,23272,23293,
23315,23336,23357,23378,23399,23420,23441,23462,23483,23505,23526,23547,23568,23590,23611,23632,
23654,23675,23696,23718,23739,23761,23782,23804,23825,23847,23868,23890,23911,23933,23954,23976,
23998,24019,24041,24063,24084,24106,24128,24150,24172,24193,24215,24237,24259,24281,24303,24325,
24347,24369,24391,24413,24435,24457,24479,24501,24523,24545,24567,24590,24612,24634,24656,24679,
24701,24723,24746,24768,24790,24813,24835,24857,24880,24902,24925,24947,24970,24992,25015,25038,
25060,25083,25105,25128,25151,25174,25196,25219,25242,25265,25287,25310,25333,25356,25379,25402,
25425,25448,25471,25494,25517,25540,25563,25586,25609,25632,25655,25678,25702,25725,25748,25771,
25795,25818,25841,25864,25888,25911,25935,25958,25981,26005,26028,26052,26075,26099,26123,26146,
26170,26193,26217,26241,26264,26288,26312,26336,26359,26383,26407,26431,26455,26479,26502,26526,
26550,26574,26598,26622,26646,26670,26695,26719,26743,26767,26791,26815,26839,26864,26888,26912,
26937,26961,26985,27010,27034,27058,27083,27107,27132,27156,27181,27205,27230,27254,27279,27304,
27328,27353,27378,27402,27427,27452,27477,27502,27526,27551,27576,27601,27626,27651,27676,27701,
27726,27751,27776,27801,27826,27851,27876,27902,27927,27952,27977,28003,28028,28053,28078,28104,
28129,28155,28180,28205,28231,28256,28282,28307,28333,28359,28384,28410,28435,28461,28487,28513,
28538,28564,28590,28616,28642,28667,28693,28719,28745,28771,28797,28823,28849,28875,28901,28927,
28953,28980,29006,29032,29058,29084,29111,29137,29163,29190,29216,29242,29269,29295,29322,29348,
29375,29401,29428,29454,29481,29507,29534,29561,29587,29614,29641,29668,29694,29721,29748,29775,
29802,29829,29856,29883,29910,29937,29964,29991,30018,30045,30072,30099,30126,30154,30181,30208,
30235,30263,30290,30317,30345,30372,30400,30427,30454,30482,30509,30537,30565,30592,30620,30647,
30675,30703,30731,30758,30786,30814,30842,30870,30897,30925,30953,30981,31009,31037,31065,31093,
31121,31149,31178,31206,31234,31262,31290,31319,31347,31375,31403,31432,31460,31489,31517,31546,
31574,31602,31631,31660,31688,31717,31745,31774,31803,31832,31860,31889,31918,31947,31975,32004,
32033,32062,32091,32120,32149,32178,32207,32236,32265,32295,32324,32353,32382,32411,32441,32470,
32499,32529,32558,32587,32617,32646,32676,32705,32735,32764,32794,32823,32853,32883,32912,32942,
32972,33002,33031,33061,33091,33121,33151,33181,33211,33241,33271,33301,33331,33361,33391,33421
};

protected static final int LOGFAC=2*16;

protected static final short logtab[] = {
           (short)(LOGFAC*907),(short)(LOGFAC*900),(short)(LOGFAC*894),(short)(LOGFAC*887),(short)(LOGFAC*881),(short)(LOGFAC*875),(short)(LOGFAC*868),(short)(LOGFAC*862),
           (short)(LOGFAC*856),(short)(LOGFAC*850),(short)(LOGFAC*844),(short)(LOGFAC*838),(short)(LOGFAC*832),(short)(LOGFAC*826),(short)(LOGFAC*820),(short)(LOGFAC*814),
           (short)(LOGFAC*808),(short)(LOGFAC*802),(short)(LOGFAC*796),(short)(LOGFAC*791),(short)(LOGFAC*785),(short)(LOGFAC*779),(short)(LOGFAC*774),(short)(LOGFAC*768),
           (short)(LOGFAC*762),(short)(LOGFAC*757),(short)(LOGFAC*752),(short)(LOGFAC*746),(short)(LOGFAC*741),(short)(LOGFAC*736),(short)(LOGFAC*730),(short)(LOGFAC*725),
           (short)(LOGFAC*720),(short)(LOGFAC*715),(short)(LOGFAC*709),(short)(LOGFAC*704),(short)(LOGFAC*699),(short)(LOGFAC*694),(short)(LOGFAC*689),(short)(LOGFAC*684),
           (short)(LOGFAC*678),(short)(LOGFAC*675),(short)(LOGFAC*670),(short)(LOGFAC*665),(short)(LOGFAC*660),(short)(LOGFAC*655),(short)(LOGFAC*651),(short)(LOGFAC*646),
           (short)(LOGFAC*640),(short)(LOGFAC*636),(short)(LOGFAC*632),(short)(LOGFAC*628),(short)(LOGFAC*623),(short)(LOGFAC*619),(short)(LOGFAC*614),(short)(LOGFAC*610),
           (short)(LOGFAC*604),(short)(LOGFAC*601),(short)(LOGFAC*597),(short)(LOGFAC*592),(short)(LOGFAC*588),(short)(LOGFAC*584),(short)(LOGFAC*580),(short)(LOGFAC*575),
           (short)(LOGFAC*570),(short)(LOGFAC*567),(short)(LOGFAC*563),(short)(LOGFAC*559),(short)(LOGFAC*555),(short)(LOGFAC*551),(short)(LOGFAC*547),(short)(LOGFAC*543),
           (short)(LOGFAC*538),(short)(LOGFAC*535),(short)(LOGFAC*532),(short)(LOGFAC*528),(short)(LOGFAC*524),(short)(LOGFAC*520),(short)(LOGFAC*516),(short)(LOGFAC*513),
           (short)(LOGFAC*508),(short)(LOGFAC*505),(short)(LOGFAC*502),(short)(LOGFAC*498),(short)(LOGFAC*494),(short)(LOGFAC*491),(short)(LOGFAC*487),(short)(LOGFAC*484),
           (short)(LOGFAC*480),(short)(LOGFAC*477),(short)(LOGFAC*474),(short)(LOGFAC*470),(short)(LOGFAC*467),(short)(LOGFAC*463),(short)(LOGFAC*460),(short)(LOGFAC*457),
           (short)(LOGFAC*453),(short)(LOGFAC*450),(short)(LOGFAC*447),(short)(LOGFAC*443),(short)(LOGFAC*440),(short)(LOGFAC*437),(short)(LOGFAC*434),(short)(LOGFAC*431)
        };


; /*={
	LOGFAC*907,LOGFAC*900,LOGFAC*894,LOGFAC*887,LOGFAC*881,LOGFAC*875,LOGFAC*868,LOGFAC*862,
	LOGFAC*856,LOGFAC*850,LOGFAC*844,LOGFAC*838,LOGFAC*832,LOGFAC*826,LOGFAC*820,LOGFAC*814,
	LOGFAC*808,LOGFAC*802,LOGFAC*796,LOGFAC*791,LOGFAC*785,LOGFAC*779,LOGFAC*774,LOGFAC*768,
	LOGFAC*762,LOGFAC*757,LOGFAC*752,LOGFAC*746,LOGFAC*741,LOGFAC*736,LOGFAC*730,LOGFAC*725,
	LOGFAC*720,LOGFAC*715,LOGFAC*709,LOGFAC*704,LOGFAC*699,LOGFAC*694,LOGFAC*689,LOGFAC*684,
	LOGFAC*678,LOGFAC*675,LOGFAC*670,LOGFAC*665,LOGFAC*660,LOGFAC*655,LOGFAC*651,LOGFAC*646,
	LOGFAC*640,LOGFAC*636,LOGFAC*632,LOGFAC*628,LOGFAC*623,LOGFAC*619,LOGFAC*614,LOGFAC*610,
	LOGFAC*604,LOGFAC*601,LOGFAC*597,LOGFAC*592,LOGFAC*588,LOGFAC*584,LOGFAC*580,LOGFAC*575,
	LOGFAC*570,LOGFAC*567,LOGFAC*563,LOGFAC*559,LOGFAC*555,LOGFAC*551,LOGFAC*547,LOGFAC*543,
	LOGFAC*538,LOGFAC*535,LOGFAC*532,LOGFAC*528,LOGFAC*524,LOGFAC*520,LOGFAC*516,LOGFAC*513,
	LOGFAC*508,LOGFAC*505,LOGFAC*502,LOGFAC*498,LOGFAC*494,LOGFAC*491,LOGFAC*487,LOGFAC*484,
	LOGFAC*480,LOGFAC*477,LOGFAC*474,LOGFAC*470,LOGFAC*467,LOGFAC*463,LOGFAC*460,LOGFAC*457,
	LOGFAC*453,LOGFAC*450,LOGFAC*447,LOGFAC*443,LOGFAC*440,LOGFAC*437,LOGFAC*434,LOGFAC*431
};*/




public clMPlayer(clMain theMain)
{
    /*{
        int mytab_i[] = {   // 12
            1712*16,1616*16,1524*16,1440*16,1356*16,1280*16,
            1208*16,1140*16,1076*16,1016*16,960*16,907*16
        };
        mytab=toshortarray(mytab_i);
    }*/

    {
        int vbi[] = { //32
           0,24,49,74,97,120,141,161,
           180,197,212,224,235,244,250,253,
           255,253,250,244,235,224,212,197,
           180,161,141,120,97,74,49,24
        };
        VibratoTable=toshortarray(vbi);
    }

    /*{
        int lti[] = {
           LOGFAC*907,LOGFAC*900,LOGFAC*894,LOGFAC*887,LOGFAC*881,LOGFAC*875,LOGFAC*868,LOGFAC*862,
           LOGFAC*856,LOGFAC*850,LOGFAC*844,LOGFAC*838,LOGFAC*832,LOGFAC*826,LOGFAC*820,LOGFAC*814,
           LOGFAC*808,LOGFAC*802,LOGFAC*796,LOGFAC*791,LOGFAC*785,LOGFAC*779,LOGFAC*774,LOGFAC*768,
           LOGFAC*762,LOGFAC*757,LOGFAC*752,LOGFAC*746,LOGFAC*741,LOGFAC*736,LOGFAC*730,LOGFAC*725,
           LOGFAC*720,LOGFAC*715,LOGFAC*709,LOGFAC*704,LOGFAC*699,LOGFAC*694,LOGFAC*689,LOGFAC*684,
           LOGFAC*678,LOGFAC*675,LOGFAC*670,LOGFAC*665,LOGFAC*660,LOGFAC*655,LOGFAC*651,LOGFAC*646,
           LOGFAC*640,LOGFAC*636,LOGFAC*632,LOGFAC*628,LOGFAC*623,LOGFAC*619,LOGFAC*614,LOGFAC*610,
           LOGFAC*604,LOGFAC*601,LOGFAC*597,LOGFAC*592,LOGFAC*588,LOGFAC*584,LOGFAC*580,LOGFAC*575,
           LOGFAC*570,LOGFAC*567,LOGFAC*563,LOGFAC*559,LOGFAC*555,LOGFAC*551,LOGFAC*547,LOGFAC*543,
           LOGFAC*538,LOGFAC*535,LOGFAC*532,LOGFAC*528,LOGFAC*524,LOGFAC*520,LOGFAC*516,LOGFAC*513,
           LOGFAC*508,LOGFAC*505,LOGFAC*502,LOGFAC*498,LOGFAC*494,LOGFAC*491,LOGFAC*487,LOGFAC*484,
           LOGFAC*480,LOGFAC*477,LOGFAC*474,LOGFAC*470,LOGFAC*467,LOGFAC*463,LOGFAC*460,LOGFAC*457,
           LOGFAC*453,LOGFAC*450,LOGFAC*447,LOGFAC*443,LOGFAC*440,LOGFAC*437,LOGFAC*434,LOGFAC*431
        };
        logtab = toshortarray(lti);
    }*/

    
        m_ = theMain;
    
	mp_extspd = true;
	mp_panning = true;
	mp_loop = false;
	mp_volume = 100;
	isfirst = 0;
	globalvolume = 64;
        globalslide = 0;

        {
            mp_audio = new AUDTMP[32];
            int i;
            for(i=0;i<32;i++)
                mp_audio[i] = new AUDTMP();
        }
                    
	
        //memset(mp_audio, 0, sizeof(mp_audio));
        {
            int i;
            for(i=0;i<32;i++)
            {
                mp_audio[i].fadevol = 
                    mp_audio[i].start =
                    
                    mp_audio[i].period = 
                    
                    mp_audio[i].c2spd = mp_audio[i].tmpperiod =
                    mp_audio[i].wantedperiod = mp_audio[i].slidespeed = mp_audio[i].portspeed =
                    
                    mp_audio[i].soffset = 0;

                mp_audio[i].volume =
                    mp_audio[i].transpose =
                    mp_audio[i].retrig =
                    mp_audio[i].tmpvolume =
                    mp_audio[i].vibpos =
                    mp_audio[i].trmpos =
                    ((byte)0);
                
                mp_audio[i].sample = mp_audio[i].handle =
                    mp_audio[i].panning = mp_audio[i].pansspd =
                    mp_audio[i].note =
                    mp_audio[i].ownper = mp_audio[i].ownvol =
                    mp_audio[i].s3mtremor = mp_audio[i].s3mtronof = mp_audio[i].s3mvolslide =
                    mp_audio[i].s3mrtgspeed = mp_audio[i].s3mrtgslide =
                    mp_audio[i].glissando = mp_audio[i].wavecontrol =
                    mp_audio[i].vibspd = mp_audio[i].vibdepth =
                    mp_audio[i].trmspd = mp_audio[i].trmdepth =
                    ((short)0);
                
                mp_audio[i].keyon = mp_audio[i].kick = false;

                mp_audio[i].i = null;
                mp_audio[i].s = null;
                mp_audio[i].row = null;

                mp_audio[i].venv.flg = mp_audio[i].venv.pts = mp_audio[i].venv.sus =
                    mp_audio[i].venv.beg = mp_audio[i].venv.end = mp_audio[i].venv.p =
                    mp_audio[i].venv.a = mp_audio[i].venv.b;
                mp_audio[i].venv.env = null;
                
                mp_audio[i].penv.flg = mp_audio[i].penv.pts = mp_audio[i].penv.sus =
                    mp_audio[i].penv.beg = mp_audio[i].penv.end = mp_audio[i].penv.p =
                    mp_audio[i].penv.a = mp_audio[i].penv.b;
                mp_audio[i].penv.env = null;
            }
        }
}

public static short Interpolate(short p,short p1,short p2,short v1,short v2)
{
	short dp,dv,di;

	if(p1==p2) return v1;

	dv=(short)(v2-v1);
	dp=(short)(p2-p1);
	di=(short)(p-p1);

	return (short)(v1 + ((int)(di*dv) / dp));
}


public static int getlinearperiod(short note,int fine)
{
	return((10*12*16*4)-((int)note*16*4)-(fine/2)+64);
}


public static int getlogperiod(short note,int fine)
{
	short n,o;
	int p1,p2,i;

	n=(short)(note%12);
	o=(short)(note/12);
	i=(n<<3)+(fine>>4);                     /* n*8 + fine/16 */

	p1=logtab[i];
	p2=logtab[i+1];

	return(Interpolate((short)(fine/16),(short)0,(short)15,(short)p1,(short)p2)>>o);
}


public static int getoldperiod(short note, int c2spd)
{
	short n,o;
	int period;

	if(c2spd == 0) return 4242;         /* <- prevent divide overflow.. (42 eheh) */

	n=(short)(note%12);
	o=(short)(note/12);
	period=(short)(((8363L*mytab[n]) >> o )/c2spd);
	return period;
}



public int GetPeriod(short note,int c2spd)
{
	if((pf.flags&audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UF_XMPERIODS) != 0){
		return ((pf.flags&audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UF_LINEAR) != 0) ? getlinearperiod(note,c2spd) : getlogperiod(note,c2spd);
	}
	return(getoldperiod(note,c2spd));
}



public void DoEEffects(short dat)
{
        short nib;

        dat &= 0xFF;

	nib=(short)(dat&0xf);

	switch(dat>>4){

		case 0x0:       /* filter toggle, not supported */
				break;

		case 0x1:       /* fineslide up */
				if(vbtick == 0) a.tmpperiod-=(nib<<2);
				break;

		case 0x2:       /* fineslide dn */
				if(vbtick == 0) a.tmpperiod+=(nib<<2);
				break;

		case 0x3:       /* glissando ctrl */
				a.glissando=nib;
				break;

		case 0x4:       /* set vibrato waveform */
				a.wavecontrol&=0xf0;
				a.wavecontrol|=nib;
				break;

		case 0x5:       /* set finetune */
/*                              a.c2spd=finetune[nib]; */
/*                              a.tmpperiod=GetPeriod(a.note,pf.samples[a.sample].transpose,a.c2spd); */
				break;

		case 0x6:       /* set patternloop */

                                if(vbtick != 0) break;

                                /* hmm.. this one is a real kludge. But now it
                                   works. */

                                if(nib != 0){                /* set reppos or repcnt ? */

                                        /* set repcnt, so check if repcnt already is set,
                                           which means we are already looping */

                                        if(repcnt>0)
                                                repcnt--;               /* already looping, decrease counter */
                                        else
                                                repcnt=nib;             /* not yet looping, so set repcnt */

                                        if(repcnt != 0)                      /* jump to reppos if repcnt>0 */
                                                mp_patpos=reppos;
                                }
                                else{
                                        reppos=(short)(mp_patpos-1);     /* set reppos */
                                }
                                break;


		case 0x7:       /* set tremolo waveform */
				a.wavecontrol&=0x0f;
				a.wavecontrol|=nib<<4;
				break;

                case 0x8:       /* set panning */
                                if(mp_panning){
                                        nib<<=4;
                                        a.panning=nib;
                                        pf.panning[mp_channel]=nib;
                                }
                                break;

		case 0x9:       /* retrig note */

				/* only retrigger if
				   data nibble > 0 */

				if(nib>0){
					if(a.retrig==0){

						/* when retrig counter reaches 0,
						   reset counter and restart the sample */

						a.kick=true;
						a.retrig=(byte)nib;
					}
					a.retrig--; /* countdown */
				}
				break;

		case 0xa:       /* fine volume slide up */
				if(vbtick != 0) break;

				a.tmpvolume+=nib;
				if(a.tmpvolume>64) a.tmpvolume=64;
				break;

		case 0xb:       /* fine volume slide dn */
				if(vbtick != 0) break;

				a.tmpvolume-=nib;
				if(a.tmpvolume<0) a.tmpvolume=0;
				break;

		case 0xc:       /* cut note */

				/* When vbtick reaches the cut-note value,
				   turn the volume to zero ( Just like
				   on the amiga) */

				if(vbtick>=nib){
					a.tmpvolume=0;                 /* just turn the volume down */
				}
				break;

		case 0xd:       /* note delay */

				/* delay the start of the
				   sample until vbtick==nib */

				if(vbtick==nib){
					a.kick=true;
				}
				else a.kick=false;
				break;

		case 0xe:       /* pattern delay */
				if(vbtick != (short)0) break;
				if(patdly2 == (short)0) patdly=(short)(nib+1);                              /* only once (when vbtick=0) */
				break;

		case 0xf:       /* invert loop, not supported */
				break;
	}
}


public void DoVibrato()
{
	short q;
	int temp=0;

	q=(short)((a.vibpos>>2)&0x1f);

	switch(a.wavecontrol&3){

		case 0: /* sine */
			temp=VibratoTable[q];
			break;

		case 1: /* ramp down */
			q<<=3;
			if(a.vibpos<0) q=(short)(255-q);
			temp=q;
			break;

		case 2: /* square wave */
			temp=255;
			break;
	}

	temp*=a.vibdepth;
	temp>>=7;
	temp<<=2;

	if(a.vibpos>=0)
		a.period=a.tmpperiod+temp;
	else
		a.period=a.tmpperiod-temp;

	if(vbtick != 0) a.vibpos+=a.vibspd;        /* do not update when vbtick==0 */
}



public void DoTremolo()
{
	short q;
	int temp=0;

	q=(short)((a.trmpos>>2)&0x1f);

	switch((a.wavecontrol>>4)&3){

		case 0: /* sine */
			temp=VibratoTable[q];
			break;

		case 1: /* ramp down */
			q<<=3;
			if(a.trmpos<0) q=(short)(255-q);
			temp=q;
			break;

		case 2: /* square wave */
			temp=255;
			break;
	}

	temp*=a.trmdepth;
	temp>>=6;

	if(a.trmpos>=0){
		a.volume=(byte)(a.tmpvolume+temp);
		if(a.volume>64) a.volume=64;
	}
	else{
		a.volume=(byte)(a.tmpvolume-temp);
		if(a.volume<0) a.volume=0;
	}

	if(vbtick != 0) a.trmpos+=a.trmspd;        /* do not update when vbtick==0 */
}


public void DoVolSlide(short dat)
{
        dat &= 0xFF;    

        if(vbtick == 0) return;             /* do not update when vbtick==0 */

	a.tmpvolume+=dat>>4;           /* volume slide */
	a.tmpvolume-=dat&0xf;
	if(a.tmpvolume<0) a.tmpvolume=0;
	if(a.tmpvolume>64) a.tmpvolume=64;
}



public void DoS3MVolSlide(short inf)
{
	short lo,hi;

        inf &= 0xFF;

        if(inf != 0){
		a.s3mvolslide=inf;
	}
	inf=a.s3mvolslide;

	lo=(short)(inf&0xf);
	hi=(short)(inf>>4);

	if(hi==0){
		a.tmpvolume-=lo;
	}
	else if(lo==0){
		a.tmpvolume+=hi;
	}
	else if(hi==0xf){
		if(vbtick == 0) a.tmpvolume-=lo;
	}
	else if(lo==0xf){
		if(vbtick == 0) a.tmpvolume+=hi;
	}

	if(a.tmpvolume<0) a.tmpvolume=0;
	if(a.tmpvolume>64) a.tmpvolume=64;
}



public void DoXMVolSlide(short inf)
{
	short lo,hi;

        inf &= 0xFF;
        
	if(inf!=0){
		a.s3mvolslide=inf;
	}
	inf=a.s3mvolslide;

	if(vbtick == 0) return;

	lo=(short)(inf&0xf);
	hi=(short)(inf>>4);

	if(hi==0)
		a.tmpvolume-=lo;
	else
		a.tmpvolume+=hi;

        if(a.tmpvolume<0) a.tmpvolume=0;
        else if(a.tmpvolume>64) a.tmpvolume=64;
}



public void DoXMGlobalSlide(short inf)
{
        short lo,hi;

        inf &= 0xFF;
        
        if(inf != 0){
                globalslide=inf;
        }
        inf=globalslide;

        if(vbtick==0) return;

        lo=(short)(inf&0xf);
        hi=(short)(inf>>4);

        if(hi==0)
                globalvolume-=lo;
        else
                globalvolume+=hi;

        if(globalvolume<0) globalvolume=0;
        else if(globalvolume>64) globalvolume=64;
}



public void DoXMPanSlide(short inf)
{
	short lo,hi;
	short pan;

        inf &= 0xFF;
        
	if(inf!=0) a.pansspd=inf;
	else inf=a.pansspd;

	if(vbtick==0) return;

	lo=(short)(inf&0xf);
	hi=(short)(inf>>4);

	/* slide right has absolute priority: */

	if(hi != 0) lo=0;

	pan=a.panning;

	pan-=lo;
	pan+=hi;

	if(pan<0) pan=0;
	if(pan>255) pan=255;

	a.panning=pan;
}



public void DoS3MSlideDn(short inf)
{
	short hi,lo;

        inf &= 0xFF;
        
	if(inf!=0) a.slidespeed=inf;
	else inf=(short)(a.slidespeed);

	hi=(short)(inf>>4);
	lo=(short)(inf&0xf);

	if(hi==0xf){
		if(vbtick==0) a.tmpperiod+=(int)lo<<2;
	}
	else if(hi==0xe){
		if(vbtick==0) a.tmpperiod+=lo;
	}
	else{
		if(vbtick!=0) a.tmpperiod+=(int)inf<<2;
	}
}



public void DoS3MSlideUp(short inf)
{
	short hi,lo;

        inf &= 0xFF;
        
	if(inf!=0) a.slidespeed=inf;
	else inf=(short)(a.slidespeed);

	hi=(short)(inf>>4);
	lo=(short)(inf&0xf);

	if(hi==0xf){
		if(vbtick==0) a.tmpperiod-=(int)lo<<2;
	}
	else if(hi==0xe){
		if(vbtick==0) a.tmpperiod-=lo;
	}
	else{
		if(vbtick != 0) a.tmpperiod-=(int)inf<<2;
	}
}



public void DoS3MTremor(short inf)
{
        short on,off;

        inf &= 0xFF;
        
        if(inf!=0) a.s3mtronof=inf;
        else inf=a.s3mtronof;

        if(vbtick==0) return;

	on=(short)((inf>>4)+1);
	off=(short)((inf&0xf)+1);

	a.s3mtremor%=(on+off);
	a.volume=(a.s3mtremor < on ) ? a.tmpvolume:0;
	a.s3mtremor++;
}



public void DoS3MRetrig(short inf)
{
	short hi,lo;

        inf &= 0xFF;
        
	hi=(short)(inf>>4);
	lo=(short)(inf&0xf);

	if(lo != 0){
		a.s3mrtgslide=hi;
		a.s3mrtgspeed=lo;
	}

	if(hi != 0){
		a.s3mrtgslide=hi;
	}

	/* only retrigger if
	   lo nibble > 0 */

	if(a.s3mrtgspeed>0){
		if(a.retrig==0){

			/* when retrig counter reaches 0,
			   reset counter and restart the sample */

			a.kick=true;
			a.retrig=(byte)a.s3mrtgspeed;

			if(vbtick!=0){                     /* don't slide on first retrig */
				switch(a.s3mrtgslide){

					case 1:
					case 2:
					case 3:
					case 4:
					case 5:
						a.tmpvolume-=(1<<(a.s3mrtgslide-1));
						break;

					case 6:
						a.tmpvolume=(byte)((2*a.tmpvolume)/3);
						break;

					case 7:
						a.tmpvolume=(byte)(a.tmpvolume>>1);
						break;

					case 9:
					case 0xa:
					case 0xb:
					case 0xc:
					case 0xd:
						a.tmpvolume+=(1<<(a.s3mrtgslide-9));
						break;

					case 0xe:
						a.tmpvolume=(byte)((3*a.tmpvolume)/2);
						break;

					case 0xf:
						a.tmpvolume=(byte)(a.tmpvolume<<1);
						break;
				}
				if(a.tmpvolume<0) a.tmpvolume=0;
				if(a.tmpvolume>64) a.tmpvolume=64;
			}
		}
		a.retrig--; /* countdown */
	}
}


public void DoS3MSpeed(short speed)
{
        speed &= 0xFF;
    
	if((vbtick != 0) || (patdly2 != 0)) return;

	if(speed!=0){                      /* <- v0.44 bugfix */
		mp_sngspd=speed;
		vbtick=0;
	}
}


public void DoS3MTempo(short tempo)
{
        tempo &= 0xFF;

        if((vbtick!=0) || (patdly2!=0)) return;
	old_bpm=tempo;
	mp_bpm=(short) rint(old_bpm*speed_constant);
}


public void DoToneSlide()
{
	int dist,t;

	if(vbtick==0){
		a.tmpperiod=a.period;
		return;
	}

	/* We have to slide a.period towards a.wantedperiod, so
	   compute the difference between those two values */

	dist=a.period-a.wantedperiod;

	if( dist==0 ||                          /* if they are equal */
		a.portspeed>Math.abs(dist) ){       /* or if portamentospeed is too big */

		a.period=a.wantedperiod;      /* make tmpperiod equal tperiod */
	}
	else if(dist>0){                                /* dist>0 ? */
		a.period-=a.portspeed;        /* then slide up */
	}
	else
		a.period+=a.portspeed;        /* dist<0 . slide down */

/*      if(a.glissando){

		 If glissando is on, find the nearest
		   halfnote to a.tmpperiod

		for(t=0;t<60;t++){
			if(a.tmpperiod>=npertab[a.finetune][t]) break;
		}

		a.period=npertab[a.finetune][t];
	}
	else
*/
	a.tmpperiod=a.period;
}


public void DoPTEffect0(short dat)
{
	short note;

        dat &= 0xFF;
        
	note=a.note;

	if(dat!=0){
		switch(vbtick%3){
			case 1:
				note+=(dat>>4); break;
			case 2:
				note+=(dat&0xf); break;
		}
		a.period=GetPeriod((short)(note+a.transpose),a.c2spd);
		a.ownper=1;
	}
}


public void PlayNote()
{
	int period;
	short inst,c;
	short note;

	if(a.row==null) return;

	m_.MUniTrk.UniSetRow(a.row, a.row_pos);

	while((c=m_.MUniTrk.UniGetByte()) != 0){

		switch(c){

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_NOTE:
				note=m_.MUniTrk.UniGetByte();

				if(note==96){                   /* key off ? */
					a.keyon=false;
					if((a.i != null) && ((a.i.volflg & EF_ON) == 0)){
						a.tmpvolume=0;
					}
				}
				else{
					a.note=note;

					period=GetPeriod((short)(note+a.transpose),a.c2spd);

					a.wantedperiod=period;
					a.tmpperiod=period;

					a.kick=true;
					a.start=0;

					/* retrig tremolo and vibrato waves ? */

					if((a.wavecontrol&0x80) == 0) a.trmpos=0;
					if((a.wavecontrol&0x08) == 0) a.vibpos=0;
				}
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_INSTRUMENT:
				inst=m_.MUniTrk.UniGetByte();
				if(inst>=pf.numins) break;             /* <- safety valve */

				a.sample=inst;

				// i=&pf.instruments[inst];
				a.i=pf.instruments[inst];

				if(pf.instruments[inst].samplenumber[a.note] >= pf.instruments[inst].numsmp) break;

				//s=&i.samples[i.samplenumber[a.note]];
                                a.s=pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]];
                                

				/* channel or instrument determined panning ? */

				if((pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]].flags & (m_.MDriver.SF_OWNPAN)) != 0){
					a.panning=pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]].panning;
				}
				else{
					a.panning=pf.panning[mp_channel];
				}

				a.transpose=pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]].transpose;
				a.handle=pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]].handle;
				a.tmpvolume=(byte)(pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]].volume);
				a.volume=(byte)(pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]].volume);
				a.c2spd=pf.instruments[inst].samples[pf.instruments[inst].samplenumber[a.note]].c2spd;
				a.retrig=0;
				a.s3mtremor=0;

				period=GetPeriod((short)(a.note+a.transpose),(short)a.c2spd);

				a.wantedperiod=period;
				a.tmpperiod=period;
				break;

			default:
				m_.MUniTrk.UniSkipOpcode(c);
				break;
		}
	}
}




public void PlayEffects()
{
	short c,dat;

	if(a.row==null) return;

	m_.MUniTrk.UniSetRow(a.row, a.row_pos);

	a.ownper=0;
	a.ownvol=0;

	while((c=m_.MUniTrk.UniGetByte()) != 0){

		switch(c){

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_NOTE:
			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_INSTRUMENT:
				m_.MUniTrk.UniSkipOpcode(c);
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT0:
				DoPTEffect0(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT1:
				dat=m_.MUniTrk.UniGetByte();
				if(dat!=0) a.slidespeed=(int)dat<<2;
				if(vbtick != 0) a.tmpperiod-=a.slidespeed;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT2:
				dat=m_.MUniTrk.UniGetByte();
				if(dat!=0) a.slidespeed=(int)dat<<2;
				if(vbtick != 0) a.tmpperiod+=a.slidespeed;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT3:
				dat=m_.MUniTrk.UniGetByte();
				a.kick=false;                              /* temp XM fix */
				if(dat!=0){
					a.portspeed=dat;
					a.portspeed<<=2;
				}
				DoToneSlide();
				a.ownper=1;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT4:
				dat=m_.MUniTrk.UniGetByte();
				if((dat&0x0f) != 0) a.vibdepth=(short)(dat&0xf);
				if((dat&0xf0) != 0) a.vibspd=(short)((dat&0xf0)>>2);
				DoVibrato();
				a.ownper=1;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT5:
				dat=m_.MUniTrk.UniGetByte();
				a.kick=false;
				DoToneSlide();
				DoVolSlide(dat);
				a.ownper=1;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT6:
				dat=m_.MUniTrk.UniGetByte();
				DoVibrato();
				DoVolSlide(dat);
				a.ownper=1;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT7:
				dat=m_.MUniTrk.UniGetByte();
				if((dat&0x0f) != 0) a.trmdepth=(short)(dat&0xf);
				if((dat&0xf0) != 0) a.trmspd=(short)((dat&0xf0)>>2);
				DoTremolo();
				a.ownvol=1;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT8:
				dat=m_.MUniTrk.UniGetByte();
				if(mp_panning){
					a.panning=dat;
					pf.panning[mp_channel]=dat;
				}
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECT9:
				dat=m_.MUniTrk.UniGetByte();
				if(dat != 0) a.soffset=(int)dat<<8;       /* <- 0.43 fix.. */
				a.start=a.soffset;
				if(a.start>a.s.length) a.start=a.s.length;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECTA:
				DoVolSlide(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECTB:
				dat=m_.MUniTrk.UniGetByte();
				if(patdly2 != 0) break;
				if(dat<mp_sngpos) break; /* avoid eternal looping */
				patbrk=0;
				mp_sngpos=(short)(dat-1);
				posjmp=3; 
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECTC:
				dat=m_.MUniTrk.UniGetByte();
				if(vbtick != 0) break;
				if(dat>64) dat=64;
				a.tmpvolume=(byte)dat;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECTD:
				dat=m_.MUniTrk.UniGetByte();
				if(patdly2 != 0) break;
				{
					int hi=(dat&0xf0)>>4;
					int     lo=(dat&0xf);
					patbrk=(short)((hi*10)+lo);
				}
				if(patbrk>64) patbrk=64;        /* <- v0.42 fix */
				posjmp=3;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECTE:
				DoEEffects(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_PTEFFECTF:
				dat=m_.MUniTrk.UniGetByte();

				if((vbtick != 0) || (patdly2 != 0)) break;

				if(mp_extspd && dat>=0x20){
					old_bpm=dat;
					mp_bpm=(short) rint(old_bpm*speed_constant);
				}
				else{
					if(dat != 0){                        /* <- v0.44 bugfix */
						mp_sngspd=dat;
						vbtick=0;
					}
				}
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_S3MEFFECTD:
				DoS3MVolSlide(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_S3MEFFECTE:
				DoS3MSlideDn(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_S3MEFFECTF:
				DoS3MSlideUp(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_S3MEFFECTI:
				DoS3MTremor(m_.MUniTrk.UniGetByte());
				a.ownvol=1;
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_S3MEFFECTQ:
				DoS3MRetrig(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_S3MEFFECTA:
				DoS3MSpeed(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_S3MEFFECTT:
				DoS3MTempo(m_.MUniTrk.UniGetByte());
				break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_XMEFFECTA:
				DoXMVolSlide(m_.MUniTrk.UniGetByte());
				break;

                        case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_XMEFFECTG:
                                globalvolume=(byte)m_.MUniTrk.UniGetByte();
                                break;

                        case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_XMEFFECTH:
                                DoXMGlobalSlide(m_.MUniTrk.UniGetByte());
                                break;

			case audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UNI_XMEFFECTP:
				DoXMPanSlide(m_.MUniTrk.UniGetByte());
				break;

			default:
				m_.MUniTrk.UniSkipOpcode(c);
				break;
		}
	}

	if(a.ownper == 0){
		a.period=a.tmpperiod;
	}

	if(a.ownvol == 0){
		a.volume=a.tmpvolume;
	}
}




public static short InterpolateEnv(short p,ENVPT a,ENVPT b)
{
	return(Interpolate(p,a.pos,b.pos,a.val,b.val));
}


public static short DoPan(short envpan,short pan)
{
	return  (short)(pan + (((envpan-128)*(128-Math.abs(pan-128)))/128));
}

public static short DoVol(int a,short b,short c)
{
	a*=b;
	a*=c;

	return (short)(a>>23);
}


public static void StartEnvelope(ENVPR t,short flg,short pts,short sus,short beg,short end,ENVPT p[])
{
    flg &= 0xFF;
    pts &= 0xFF;
    sus &= 0xFF;
    beg &= 0xFF;
    end &= 0xFF;

    
	t.flg=flg;
	t.pts=pts;
	t.sus=sus;
	t.beg=beg;
	t.end=end;
	t.env=p;
	t.p=0;
	t.a=0;
	t.b=1;
}



public static short ProcessEnvelope(ENVPR t,short v,boolean keyon)
{
	if((t.flg & EF_ON) != 0){

		/* panning active? . copy variables */

		short a,b;
		int p;

		a=t.a;
		b=t.b;
		p=t.p;

		/* compute the envelope value between points a and b */

		v=InterpolateEnv((short)p,t.env[a],t.env[b]);

		/* Should we sustain? (sustain flag on, key-on, point a is the sustain
		   point, and the pointer is exactly on point a) */

		if(((t.flg & EF_SUSTAIN) != 0) && keyon && a==t.sus && p==t.env[a].pos){
			/* do nothing */
		}
		else{
			/* don't sustain, so increase pointer. */

			p++;

			/* pointer reached point b? */

			if(p >= t.env[b].pos){

				/* shift points a and b */

				a=b; b++;

				if((t.flg & EF_LOOP) != 0){
					if(b > t.end){
						a=t.beg;
						b=(short)(a+1);
						p=t.env[a].pos;
					}
				}
				else{
					if(b >= t.pts){
						b--;
						p--;
					}
				}
			}
		}
		t.a=a;
		t.b=b;
		t.p=(short)p;
	}
	return v;
}

/*
int GetFreq2(int period)
{
	float frequency;

	frequency=8363.0*pow(2,((6*12*16*4.0)-period)/(12*16*4.0));
	return(floor(frequency));
}
*/

public static int GetFreq2(int period)
{
	int okt;
	int frequency;
	period=7680-period;
	okt=period/768;
	frequency=lintab[period%768];
	frequency<<=2;
	return(frequency>>(7-okt));
}

public void MP_HandleTick()
{
	int tmpvol;
	// extern char current_file[1024];
	int z,t,tr,ui_result;
	//extern int play_current;
	// extern int current_pattern;
	//extern int count_pattern, count_song;
	boolean reinit_audio=false;
	
	pause_flag=-128;
	if(isfirst != 0){           
		/* don't handle the very first ticks, this allows the
		   other hardware to settle down so we don't lose any 
		   starting notes
		*/
		isfirst--;
		return;
	}

	if(forbid) return;      /* don't go any further when forbid is true */

	if(MP_Ready()) return;

	if(++vbtick>=mp_sngspd){

		mp_patpos++;
		vbtick=0;

		if(patdly != 0){
			patdly2=patdly;
			patdly=0;
		}

		if(patdly2 != 0){

			/* patterndelay active */

			if((--patdly2) != 0){
				mp_patpos--;    /* so turn back mp_patpos by 1 */
			}
		}

		/* Do we have to get a new patternpointer ?
		   (when mp_patpos reaches 64 or when
		   a patternbreak is active). Also check for 256 - if mod 
		   is broken it will continue forever otherwise */

		if( mp_patpos == numrow || mp_patpos > 255 ) posjmp=3;


		if( posjmp  != 0){
			mp_patpos=patbrk;
			mp_sngpos+=(posjmp-2);
			patbrk=posjmp=0;
			if(mp_sngpos>=pf.numpos){
/*				if(true) return;*/
				if(!mp_loop) return;
				mp_sngpos=pf.reppos;
			}
			if(mp_sngpos<0) mp_sngpos=(short)(pf.numpos-1);
		}


		if(patdly2==0){

			for(t=0;t<pf.numchn;t++){

				tr=pf.patterns[(pf.positions[mp_sngpos]*pf.numchn)+t];
				numrow=(short)(pf.pattrows[pf.positions[mp_sngpos]]);

				mp_channel=(short)t;
				a=mp_audio[t];
                                //a.row = (tr<pf.numtrk) ? MikMod.MUniTrk.clMUniTrk.UniFindRow(pf.tracks[tr],mp_patpos) : ((short*)null);
                                if (tr<pf.numtrk)
                                {
                                    a.row = pf.tracks[tr];
                                    a.row_pos = m_.MUniTrk.UniFindRow(pf.tracks[tr],mp_patpos);
                                }
                                else
                                    a.row = null;

				PlayNote();
			}
			do /* run through once, repeat if paused */
				{
				if(pause_flag==127)
                                    m_.usleep(1000); /* don't need to eat cpu time! */
                                    
				m_.UI.count_pattern++;
				m_.UI.count_song++;
				if(m_.quiet)
					ui_result = 9999; /* don't match any case */
				else
					ui_result=m_.UI.get_ui();

/* volume=0 already by default if paused, so don't need to fiddle with it... */

				switch(ui_result)
					{
					case audio.jmikmod.MikMod.UI.myUI.UI_DELETE_MARKED:
						/*if(!m_.cur_mod.deleted)
							break;
						if(!unlink(m_.cur_mod.filename))
							m_.cur_mod.deleted=2;
						else
							m_.cur_mod.deleted=3;
						m_.Display.update_file_display();
						m_.Display.display_all(); */
						/* FALL THROUGH */

					case audio.jmikmod.MikMod.UI.myUI.UI_NEXT_SONG:
						m_.MDriver.MD_PatternChange();
						m_.MPlayer.play_current=false;
						break;

                    case audio.jmikmod.MikMod.UI.myUI.UI_PREVIOUS_SONG: /* if halfway through mod restart it, if
							          beginning jump to the previous one */
						if ((m_.UI.count_song < audio.jmikmod.MikMod.UI.myUI.SMALL_DELAY) && 
                            (m_.optind>1) )
						{
							m_.optind-=2;
							m_.MPlayer.play_current=false;
						}
						else 
						{
							mp_sngpos=1;
							MP_PrevPosition();
						}
						m_.UI.count_song=0;
						m_.MDriver.MD_PatternChange();
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_QUIT:
						m_.MDriver.MD_PatternChange();
						quit=true;
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_JUMP_TO_NEXT_PATTERN:
						m_.MDriver.MD_PatternChange();
						MP_NextPosition();
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_JUMP_TO_PREV_PATTERN:
						m_.MDriver.MD_PatternChange();
						if (m_.UI.count_pattern < audio.jmikmod.MikMod.UI.myUI.SMALL_DELAY) /* near start of pattern? */
							MP_PrevPosition();
						else
							MP_RestartPosition();
						m_.UI.count_pattern=0;
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_PAUSE:
						pause_flag=~pause_flag;
						if(pause_flag==127)
						{
							if(m_.md_type != 0)
								m_.MDriver.MD_Mute();
							else
								m_.MDriver.MD_Exit();   /* temp. free the sound driver */
							m_.Display.display_version();
							m_.Display.display_pausebanner();
						}
						else
						{
							if(m_.md_type != 0)
							{
								m_.MDriver.MD_UnMute();
								m_.Display.display_all();
							}
							else
			/* need to re-init. the sound driver before leaving pause mode */
							{
								if(!m_.MDriver.MD_Init()){
									m_.Display.display_driver_error(m_.mmIO.myerr);
									m_.Display.display_pausebanner();
									pause_flag=~pause_flag;
								}
								else
									m_.Display.display_all();
							}
						}
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_SPEED_UP:
						if ((old_bpm*(speed_constant+0.05))<=255)
							speed_constant+=0.05;
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_SLOW_DOWN:
						if ((old_bpm*(speed_constant-0.05))>10)
							speed_constant-=0.05;
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_NORMAL_SPEED:
						speed_constant=(float)1.0;
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_VOL_UP:
						if(mp_volume<250)
							mp_volume+=5;
						break;
					case audio.jmikmod.MikMod.UI.myUI.UI_VOL_DOWN:
						if(mp_volume>5)
							mp_volume-=5;
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_NORMAL_VOL:
						mp_volume=100;
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_MARK_DELETED:
						if(!m_.cur_mod.deleted)
							m_.cur_mod.deleted=true;
						else if (m_.cur_mod.deleted==true)
							m_.cur_mod.deleted=false;
						m_.Display.update_file_display();
						m_.Display.display_all();
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_SELECT_STEREO:
						m_.MDriver.md_mode |= m_.DMODE_STEREO;
						reinit_audio=true;
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_SELECT_MONO:
						m_.MDriver.md_mode &= ~m_.DMODE_STEREO;
						reinit_audio=true;
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_SELECT_INTERP:
						m_.MDriver.md_mode |= m_.DMODE_INTERP;
						reinit_audio=true;
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_SELECT_NONINTERP:
						m_.MDriver.md_mode &= ~m_.DMODE_INTERP;
						reinit_audio=true;
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_SELECT_8BIT:
						m_.MDriver.md_mode &= ~m_.DMODE_16BITS;
						reinit_audio=true;
						break;

					case audio.jmikmod.MikMod.UI.myUI.UI_SELECT_16BIT:
						m_.MDriver.md_mode |= m_.DMODE_16BITS;
						reinit_audio=true;
						break;

					default:
						break;
					}
				if ((old_bpm*speed_constant)>255)
					mp_bpm=255;
				else
					mp_bpm=(short) rint(old_bpm*speed_constant);

				if (reinit_audio){
					reinit_audio=false;
					m_.MDriver.MD_Exit();
					m_.MDriver.MD_Init();
					}
				}
			while(pause_flag==127);
		}
	}

	/* Update effects */

	for(t=0;t<pf.numchn;t++){
		mp_channel=(short)t;
		a=mp_audio[t];
		PlayEffects();
	}

	for(t=0;t<pf.numchn;t++){
		//INSTRUMENT *i;
		//SAMPLE *s;
		short envpan,envvol;

		a=mp_audio[t];
		//i=a.i;
		//s=a.s;

		if(a.i==null || a.s==null) continue;

		if(a.period<40) a.period=40;
		if(a.period>8000) a.period=8000;

		if(a.kick){
			m_.MDriver.MD_VoicePlay((short)t,a.handle,a.start,a.s.length,a.s.loopstart,a.s.loopend,a.s.flags);
			a.kick=false;
			a.keyon=true;

			a.fadevol=32768;

			StartEnvelope(a.venv,a.i.volflg,a.i.volpts,a.i.volsus,a.i.volbeg,a.i.volend,a.i.volenv);
			StartEnvelope(a.penv,a.i.panflg,a.i.panpts,a.i.pansus,a.i.panbeg,a.i.panend,a.i.panenv);
		}

		envvol=ProcessEnvelope(a.venv,(short)256,a.keyon);
		envpan=ProcessEnvelope(a.penv,(short)128,a.keyon);

                tmpvol=a.fadevol;              /* max 32768 */
                tmpvol*=envvol;                 /* * max 256 */
                tmpvol*=a.volume;              /* * max 64 */
                tmpvol/=16384;                  /* tmpvol/(256*64) => tmpvol is max 32768 */

                tmpvol*=globalvolume;   /* * max 64 */
                tmpvol*=mp_volume;              /* * max 100 */
                tmpvol/=3276800;              /* tmpvol/(64*100*512) => tmpvol is max 64 */

                m_.MDriver.MD_VoiceSetVolume((short)t,(short)tmpvol);
                // m_.MDriver.MD_VoiceSetVolume(t,tmpvol&0xFF);

		if((a.s.flags& (m_.MDriver.SF_OWNPAN)) != 0){
                    m_.MDriver.MD_VoiceSetPanning((short)t,DoPan(envpan,a.panning));
                    // m_.MDriver.MD_VoiceSetPanning(t,DoPan(envpan,a.panning) & 0xFF);
		}
		else{
                    m_.MDriver.MD_VoiceSetPanning((short)t,a.panning);
                    // m_.MDriver.MD_VoiceSetPanning(t,(a.panning) & 0xFF);
		}

		if((pf.flags & audio.jmikmod.MikMod.MUniTrk.clMUniTrk.UF_LINEAR) != 0)
			m_.MDriver.MD_VoiceSetFrequency((short)t,GetFreq2(a.period));
		else
			m_.MDriver.MD_VoiceSetFrequency((short)t,(3579546<<2)/a.period);

		/*  if key-off, start substracting
			fadeoutspeed from fadevol: */

                if(!a.keyon){
                        if(a.fadevol>=a.i.volfade)
                                a.fadevol-=a.i.volfade;
                        else
                                a.fadevol=0;
                }
        }
}



public void MP_Init(UNIMOD m)
{
	int t;

	pf=m;
	reppos=0;
	repcnt=0;
	mp_sngpos=0;
	mp_sngspd=m.initspeed;

	vbtick=mp_sngspd;
	patdly=0;
	patdly2=0;
	mp_bpm=m.inittempo;
	old_bpm=mp_bpm;
	m_.cur_mod.deleted=false;

	forbid=false;
	mp_patpos=0;
	posjmp=2;               /* <- make sure the player fetches the first note */
	patbrk=0;

	isfirst=2;              /* delay start by 2 ticks */

        globalvolume=64;                /* reset global volume */

	/* Make sure the player doesn't start with garbage: */

	for(t=0;t<pf.numchn;t++){
		mp_audio[t].kick=false;
		mp_audio[t].tmpvolume=0;
		mp_audio[t].retrig=0;
		mp_audio[t].wavecontrol=0;
		mp_audio[t].glissando=0;
		mp_audio[t].soffset=0;
	}
}



public boolean MP_Ready()
{
	return(mp_sngpos>=pf.numpos);
}


public void MP_NextPosition()
{
	forbid=true;
	posjmp=3;
	patbrk=0;
	vbtick=mp_sngspd;
	forbid=false;
}


public void MP_PrevPosition()
{
	forbid=true;
	posjmp=1;
	patbrk=0;
	vbtick=mp_sngspd;
	forbid=false;
}

public void MP_RestartPosition()
{
	forbid=true;
	posjmp=2;
	patbrk=0;
	vbtick=mp_sngspd;
	forbid=false;
}


public void MP_SetPosition(short pos)
{ /* avoid infinitely-looping mods */

/*	if(pos>=pf.numpos) pos=pf.numpos;
	forbid=true;
	posjmp=2;
	patbrk=0;
	mp_sngpos=pos; 
	vbtick=mp_sngspd;
	forbid=false;*/
}

public static double rint (double x)
{
	if (x-(int)x < 0.5)
		return (double)(int)x;
	else
		return (double)((int)x+1);
}



}
