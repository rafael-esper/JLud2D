/*

Name:
LOAD_MOD.C

Description:
Generic MOD loader

Portability:
All systems - all compilers (hopefully)

*/

/*************************************************************************
*************************************************************************/

package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;

class MSAMPINFO
{       /* sample header as it appears in a module */
    public byte  samplename[];
	public int length;
	public short finetune;
	public short volume;
	public int reppos;
	public int replen;

	public MSAMPINFO()
	{
		samplename = new byte[22];
	}
};

class MODNOTE{
	public short a,b,c,d;
};

class MODULEHEADER{    /* verbatim module header */
    public byte       songname[];                /* the songname.. */
	public MSAMPINFO  samples[];                         /* all sampleinfo */
	public short      songlength;                          /* number of patterns used */
	public short      magic1;                                      /* should be 127 */
	public byte      positions[];                      /* which pattern to play at pos */
	public byte      magic2[];                           /* string "M.K." or "FLT4" or "FLT8" */
	public MODULEHEADER()
	{
		songname = new byte [20];
		samples = new MSAMPINFO[31];
		int i;
		for(i=0;i<31;i++)
			samples[i] = new MSAMPINFO();
		positions = new byte[128];
		magic2 = new byte[4];
	}
};


class MODTYPE
{                         /* struct to identify type of module */
    public byte    id[];
	public short   channels;
    public String name;    //char *    name;
	public MODTYPE()
	{
		id = new byte[5];
	}
	public MODTYPE(String init_id, int init_chn, String init_name)
	{
		id = new byte[5]; 
		init_id.getBytes(0,4,id,0);
		id[4] = '\0';

		channels = (short)init_chn;
		name = new String(init_name);
	}
}

public class MOD_Loader extends clLOADER
{

	protected MODULEHEADER mh;        /* raw as-is module header */
	protected MODNOTE patbuf[];


final int MODULEHEADERSIZE = 1084;



/*************************************************************************
*************************************************************************/

final String protracker="Protracker";
final String startracker="Startracker";
final String fasttracker="Fasttracker";
final String ins15tracker="15-instrument";
final String oktalyzer="Oktalyzer";
final String taketracker="TakeTracker";

final MODTYPE modtypes[]= {
        new MODTYPE ("M.K.",4,protracker),    /* protracker 4 channel */
        new MODTYPE ("M!K!",4,protracker),    /* protracker 4 channel */
        new MODTYPE ("FLT4",4,startracker),   /* startracker 4 channel */
        new MODTYPE ("4CHN",4,fasttracker),   /* fasttracker 4 channel */
        new MODTYPE ("6CHN",6,fasttracker),   /* fasttracker 6 channel */
        new MODTYPE ("8CHN",8,fasttracker),   /* fasttracker 8 channel */
        new MODTYPE ("CD81",8,oktalyzer),     /* atari oktalyzer 8 channel */
        new MODTYPE ("OKTA",8,oktalyzer),     /* atari oktalyzer 8 channel */
        new MODTYPE ("16CN",16,taketracker),  /* taketracker 16 channel */
        new MODTYPE ("32CN",32,taketracker),  /* taketracker 32 channel */
        new MODTYPE ("    ",4,ins15tracker)   /* 15-instrument 4 channel */
};


/*

Old (amiga) noteinfo:

 _____byte 1_____   byte2_    _____byte 3_____   byte4_
/                \ /      \  /                \ /      \
0000          0000-00000000  0000          0000-00000000

Upper four    12 bits for    Lower four    Effect command.
bits of sam-  note period.   bits of sam-
ple number.                  ple number.


*/


final short npertab[]={

/* . Tuning 0 */

        1712,1616,1524,1440,1356,1280,1208,1140,1076,1016,960,906,
        856,808,762,720,678,640,604,570,538,508,480,453,
        428,404,381,360,339,320,302,285,269,254,240,226,
        214,202,190,180,170,160,151,143,135,127,120,113,
        107,101,95,90,85,80,75,71,67,63,60,56
};

public MOD_Loader(clMainBase theMain)
{
	super(theMain);
	mh = null;
	patbuf = null;

	type = new String("Standard module");
	version = new String("Portable MOD loader v0.11");
}

public boolean Test()
{
	int t, i;

	byte id[] = new byte[4];

	m_.mmIO._mm_fseek(m_.MLoader.modfp,MODULEHEADERSIZE-4,m_.mmIO.SEEK_SET);
        //if(!fread(id,4,1,m_.MLoader.modfp)) return 0;
        if (m_.MLoader.modfp.read(id,0,4) != 4) return false;

	/* find out which ID string */

        for(t=0;t<10;t++){
            for(i=0;i<4;i++)
                if (id[i] != modtypes[t].id[i])
                    break;
            if (i == 4)
                return true;
	    //if(!memcmp(id,modtypes[t].id,4)) return 1;
	}

	return false;
}


public boolean Init()
{
        int i, j;

        patbuf=null;
        //if(!(mh=(MODULEHEADER *)m_.MLoader.MyCalloc(1,sizeof(MODULEHEADER)))) return 0;
        mh = new MODULEHEADER();

        mh.songlength = mh.magic1 = 0;
        for(i=0;i<20;i++)
            mh.songname[i] = 0;

        for(i=0;i<128;i++)
            mh.positions[i] = 0;

        for(i=0;i<4;i++)
            mh.magic2[i] = 0;

        
        for(i=0;i<31;i++)
        {
            mh.samples[i].length = mh.samples[i].reppos =
                mh.samples[i].replen = 0;
			mh.samples[i].finetune = mh.samples[i].volume = 0;
            for(j=0;j<22;j++)
                mh.samples[i].samplename[j] = 0;
        }
        
	return true;
}


public void Cleanup()
{
        if (mh != null) mh = null;    
        if(patbuf!=null) patbuf = null;
}

public void ConvertNote(MODNOTE n)
{
	short instrument,effect,effdat,note;
	int period;

	/* extract the various information from the 4 bytes that
	   make up a single note */

	instrument=(short)((n.a&0x10)|(n.c>>4));
	period=(((int)n.a&0xf)<<8)+n.b;
	effect=(short)(n.c&0xf);
	effdat=n.d;

	/* Convert the period to a note number */

	note=0;
	if(period!=0){
		for(note=0;note<60;note++){
			if(period>=npertab[note]) break;
		}
		note++;
		if(note==61) note=0;
	}

	if(instrument!=0){
		m_.MUniTrk.UniInstrument((short)(instrument-1));
	}

	if(note!=0){
		m_.MUniTrk.UniNote((short)(note+23));
	}

	m_.MUniTrk.UniPTEffect(effect,effdat);
}


public short [] ConvertTrack(MODNOTE [] n, int which_track)
{
	int t;
	int idx_n=0;

	m_.MUniTrk.UniReset();
	for(t=0;t<64;t++){
		ConvertNote(n[idx_n+which_track]);
		m_.MUniTrk.UniNewline();
		idx_n+=m_.MLoader.of.numchn;
	}
	return m_.MUniTrk.UniDup();
}


public boolean ML_LoadPatterns()
/*
	Loads all patterns of a modfile and converts them into the
	3 byte format.
*/
{
	int t,s,tracks=0;

	if(!m_.MLoader.AllocPatterns()) return false;
	if(!m_.MLoader.AllocTracks()) return false;

	/* Allocate temporary buffer for loading
	   and converting the patterns */

	//if(!(patbuf=(MODNOTE *)m_.MLoader.MyCalloc(64U*m_.MLoader.of.numchn,sizeof(MODNOTE)))) return 0;
        patbuf = new MODNOTE[64*m_.MLoader.of.numchn];

        for(t=0;t<64*m_.MLoader.of.numchn;t++)
        {
			patbuf[t] = new MODNOTE();
            patbuf[t].a = patbuf[t].b = patbuf[t].c = patbuf[t].d = 0;
        }

        
	for(t=0;t<m_.MLoader.of.numpat;t++){

		/* Load the pattern into the temp buffer
		   and convert it */

		for(s=0;s<(int)(64*m_.MLoader.of.numchn);s++){
			patbuf[s].a=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			patbuf[s].b=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			patbuf[s].c=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			patbuf[s].d=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		}

		for(s=0;s<m_.MLoader.of.numchn;s++){
			if((m_.MLoader.of.tracks[tracks++]=ConvertTrack(patbuf,s)) == null) return false;
		}
	}

	return true;
}


public boolean Load()
{
	try 
	{

	int t,modtype;
	//INSTRUMENT *d;          /* new sampleinfo structure */
	//SAMPLE *q;
        //MSAMPINFO *s;           /* old module sampleinfo */
        int inst_num, smpinfo_num;

	/* try to read module header */

        m_.mmIO._mm_read_str(mh.songname,20,m_.MLoader.modfp);

	for(t=0;t<31;t++){
		//s=&mh.samples[t];
                m_.mmIO._mm_read_str(mh.samples[t].samplename,22,m_.MLoader.modfp);
		mh.samples[t].length	=m_.mmIO._mm_read_M_UWORD(m_.MLoader.modfp);
		mh.samples[t].finetune	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		mh.samples[t].volume	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		mh.samples[t].reppos	=m_.mmIO._mm_read_M_UWORD(m_.MLoader.modfp);
		mh.samples[t].replen	=m_.mmIO._mm_read_M_UWORD(m_.MLoader.modfp);
	}

	mh.songlength	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.magic1		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

	m_.mmIO._mm_read_SBYTES(mh.positions,128,m_.MLoader.modfp);
	m_.mmIO._mm_read_SBYTES(mh.magic2,4,m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
		m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	/* find out which ID string */

        for(modtype=0;modtype<10;modtype++){
                int pos;
                for(pos=0;pos<4;pos++)
                    if (mh.magic2[pos] != modtypes[modtype].id[pos])
                        break;
                if (pos==4)
                    break;
		//if(!memcmp(mh.magic2,modtypes[modtype].id,4)) break;
	}

	if(modtype==10){

		/* unknown modtype */
		m_.mmIO.myerr=m_.ERROR_NOT_A_MODULE;
		return false;
	}

	/* set module variables */

	m_.MLoader.of.initspeed=6;
	m_.MLoader.of.inittempo=125;
	m_.MLoader.of.numchn=modtypes[modtype].channels;      /* get number of channels */
	m_.MLoader.of.modtype=new String(modtypes[modtype].name);      /* get ascii type of mod */
	m_.MLoader.of.songname=m_.MLoader.DupStr(mh.songname,20);            /* make a cstr m_.MLoader.of songname */
	m_.MLoader.of.numpos=mh.songlength;               /* copy the songlength */

        /* copy the position array */
        for(t=0;t<128;t++)
        {
            m_.MLoader.of.positions[t] = mh.positions[t];
        }

	/* Count the number of patterns */

	m_.MLoader.of.numpat=0;

	for(t=0;t<128;t++){             /* <-- BUGFIX... have to check ALL positions */
		if(m_.MLoader.of.positions[t] > m_.MLoader.of.numpat){
			m_.MLoader.of.numpat=m_.MLoader.of.positions[t];
		}
	}
	m_.MLoader.of.numpat++;
        m_.MLoader.of.numtrk=(short)(m_.MLoader.of.numpat*m_.MLoader.of.numchn);

	/* Finally, init the sampleinfo structures */

	m_.MLoader.of.numins=31;

	if(!m_.MLoader.AllocInstruments()) return false;

	//s=mh.samples;   /* init source pointer */
	//d=m_.MLoader.of.instruments;  /* init dest pointer */
        smpinfo_num = 0; /* init source pointer */
        inst_num = 0;  /* init dest pointer */

	for(t=0;t<m_.MLoader.of.numins;t++){

		m_.MLoader.of.instruments[inst_num].numsmp=1;
                if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[inst_num])))
                    return false;

		//q=m_.MLoader.of.instruments[inst_num].samples;

		/* convert the samplename */

		m_.MLoader.of.instruments[inst_num].insname=m_.MLoader.DupStr(mh.samples[smpinfo_num].samplename,22);

		/* init the sampleinfo variables and
		   convert the size pointers to longword format */

		m_.MLoader.of.instruments[inst_num].samples[0].c2spd = m_.MLoader.finetune[mh.samples[smpinfo_num].finetune&0xf];
		m_.MLoader.of.instruments[inst_num].samples[0].volume = mh.samples[smpinfo_num].volume;
		m_.MLoader.of.instruments[inst_num].samples[0].loopstart = (int)mh.samples[smpinfo_num].reppos << 1;
		m_.MLoader.of.instruments[inst_num].samples[0].loopend = m_.MLoader.of.instruments[inst_num].samples[0].loopstart + ((int)mh.samples[smpinfo_num].replen << 1);
		m_.MLoader.of.instruments[inst_num].samples[0].length = (int)mh.samples[smpinfo_num].length << 1;
		m_.MLoader.of.instruments[inst_num].samples[0].seekpos = 0;

		m_.MLoader.of.instruments[inst_num].samples[0].flags = (m_.MDriver.SF_SIGNED);
                if(mh.samples[smpinfo_num].replen>1)
                    m_.MLoader.of.instruments[inst_num].samples[0].flags |= (m_.MDriver.SF_LOOP);

		/* fix replen if repend>length */

                if(m_.MLoader.of.instruments[inst_num].samples[0].loopend > m_.MLoader.of.instruments[inst_num].samples[0].length)
                    m_.MLoader.of.instruments[inst_num].samples[0].loopend=m_.MLoader.of.instruments[inst_num].samples[0].length;

		smpinfo_num++;    /* point to next source sampleinfo */
		inst_num++;    /* point to next destiny sampleinfo */
	}

	if(!ML_LoadPatterns()) return false;
	return true;

	}
	catch (IOException ioe1)
	{
		return false;
	}
}


}