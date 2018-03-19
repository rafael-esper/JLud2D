/*

Name:
LOAD_M15.C

Description:
15 instrument MOD loader

Portability:
All systems - all compilers (hopefully)

*/


/*************************************************************************
*************************************************************************/

package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;


class M15_MSAMPINFO{       /* sample header as it appears in a module */
        byte  samplename[];
	int length;
	short finetune;
	short volume;
	int reppos;
        int replen;

        public M15_MSAMPINFO()
        {
            samplename = new byte[22];
        }
}


class M15_MODULEHEADER{                 /* verbatim module header */
        byte       songname[];                /* the songname.. */
	M15_MSAMPINFO  samples[];                         /* all sampleinfo */
	short      songlength;                          /* number of patterns used */
	short      magic1;                                      /* should be 127 */
        byte      positions[];                      /* which pattern to play at pos */

        public M15_MODULEHEADER()
        {
            songname = new byte[20];
            samples = new M15_MSAMPINFO[15];
            int i;
            for(i=0;i<15;i++)
                samples[i] = new M15_MSAMPINFO();
            positions = new byte[128];
        }
}


class M15_MODNOTE{
	short a,b,c,d;
};


/*************************************************************************
*************************************************************************/


public class M15_Loader extends clLOADER
{

	protected M15_MODULEHEADER mh;        /* raw as-is module header */
	protected M15_MODNOTE patbuf[];


final public short M15_npertab[] = {

/* -> Tuning 0 */

        1712,1616,1524,1440,1356,1280,1208,1140,1076,1016,960,906,
        856,808,762,720,678,640,604,570,538,508,480,453,
        428,404,381,360,339,320,302,285,269,254,240,226,
        214,202,190,180,170,160,151,143,135,127,120,113,
        107,101,95,90,85,80,75,71,67,63,60,56
};


public M15_Loader(clMainBase theMain)
{
	super(theMain);

	mh = null;
	patbuf = null;
	type = new String("15-instrument module");
	version = new String("Portable MOD-15 loader v0.1");
}


public boolean LoadModuleHeader(M15_MODULEHEADER mh)
{
        try {

        int t;

	m_.mmIO._mm_read_str(mh.songname,20,m_.MLoader.modfp);

	for(t=0;t<15;t++){
		//M15_MSAMPINFO *s= &mh.samples[t];
		m_.mmIO._mm_read_str(mh.samples[t].samplename,22,m_.MLoader.modfp);
		mh.samples[t].length	=m_.mmIO._mm_read_M_UWORD(m_.MLoader.modfp);
		mh.samples[t].finetune	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		mh.samples[t].volume	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		mh.samples[t].reppos	=m_.mmIO._mm_read_M_UWORD(m_.MLoader.modfp);
		mh.samples[t].replen	=m_.mmIO._mm_read_M_UWORD(m_.MLoader.modfp);
	}

	mh.songlength	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.magic1		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);                                      /* should be 127 */
	m_.mmIO._mm_read_SBYTES(mh.positions,128,m_.MLoader.modfp);

        //return(!feof(m_.MLoader.modfp));
        return (m_.MLoader.modfp.getFilePointer() < m_.MLoader.modfp.length());

        }
        catch (IOException ioe1)
        {
            return false;
        }
}



public boolean Test()
{
	int t;
	M15_MODULEHEADER mh = new M15_MODULEHEADER();

	if(!LoadModuleHeader(mh)) return false;

	for(t=0;t<15;t++){

		/* all finetunes should be zero */
		if(mh.samples[t].finetune!=0) return false;

		/* all volumes should be <=64 */
		if(mh.samples[t].volume>64) return false;
	}
	if(mh.magic1>127) return false;    /* and magic1 should be <128 */

	return true;
}


public boolean Init()
{
        int i,j;

        patbuf=null;
        // if(!(mh=(M15_MODULEHEADER *)m_.MLoader.MyCalloc(1,sizeof(M15_MODULEHEADER)))) return 0;
        mh = new M15_MODULEHEADER();

        mh.songlength = mh.magic1 = 0;
        for(i=0;i<20;i++)
            mh.songname[i] = 0;

        for(i=0;i<128;i++)
            mh.positions[i] = 0;

        for(i=0;i<15;i++)
        {
            mh.samples[i].length = mh.samples[i].reppos =
                mh.samples[i].replen = 0;
            mh.samples[i].finetune = mh.samples[i].volume = (short)0;
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


/*

Old (amiga) noteinfo:

 _____byte 1_____   byte2_    _____byte 3_____   byte4_
/                \ /      \  /                \ /      \
0000          0000-00000000  0000          0000-00000000

Upper four    12 bits for    Lower four    Effect command.
bits m_.MLoader.of sam-  note period.   bits m_.MLoader.of sam-
ple number.                  ple number.


*/


public void M15_ConvertNote(M15_MODNOTE n)
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
			if(period>=M15_npertab[note]) break;
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



public short [] M15_ConvertTrack(M15_MODNOTE [] n, int offset)
{
	int t;

        m_.MUniTrk.UniReset();
        int n_ptr = offset;
	for(t=0;t<64;t++){
		M15_ConvertNote(n[n_ptr]);
		m_.MUniTrk.UniNewline();
		n_ptr+=m_.MLoader.of.numchn;
	}
	return m_.MUniTrk.UniDup();
}



public boolean M15_LoadPatterns()
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

        // if(!(patbuf=(MODNOTE *)m_.MLoader.MyCalloc(64*m_.MLoader.of.numchn,sizeof(MODNOTE)))) return 0;
        patbuf = new M15_MODNOTE[64*m_.MLoader.of.numchn];
        for(t=0;t<64*m_.MLoader.of.numchn;t++)
            patbuf[t] = new M15_MODNOTE();
        
        for(t=0;t<64*m_.MLoader.of.numchn;t++)
        {
            patbuf[t].a = patbuf[t].b = patbuf[t].c = patbuf[t].d = 0;
        }

	for(t=0;t<m_.MLoader.of.numpat;t++){

		/* Load the pattern into the temp buffer
		   and convert it */

		for(s=0;s<(64*m_.MLoader.of.numchn);s++){
			patbuf[s].a=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			patbuf[s].b=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			patbuf[s].c=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			patbuf[s].d=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		}

		for(s=0;s<m_.MLoader.of.numchn;s++){
			if((m_.MLoader.of.tracks[tracks++]=M15_ConvertTrack(patbuf, s)) == null) return false;
		}
	}

	return true;
}



public boolean Load()
{
	int t;
	//INSTRUMENT *d;          /* new sampleinfo structure */
	//SAMPLE *q;
        //M15_MSAMPINFO *s;           /* old module sampleinfo */
        int inst_num, smpinfo_num;

	/* try to read module header */

	if(!LoadModuleHeader(mh)){
		m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	/* set module variables */

	m_.MLoader.of.initspeed=6;
	m_.MLoader.of.inittempo=125;
	m_.MLoader.of.numchn=4;                                                    /* get number m_.MLoader.of channels */
	m_.MLoader.of.modtype=new String("15-instrument");             /* get ascii type m_.MLoader.of mod */
	m_.MLoader.of.songname=m_.MLoader.DupStr(mh.songname,20);        /* make a cstr m_.MLoader.of songname */
	m_.MLoader.of.numpos=mh.songlength;                       /* copy the songlength */

        /* copy the position array */
        for(t=0;t<128;t++)
        {
            m_.MLoader.of.positions[t] = mh.positions[t];
        }

        
	/* Count the of patterns */

	m_.MLoader.of.numpat=0;

	for(t=0;t<128;t++){             /* <-- BUGFIX... have to check ALL positions */
		if(m_.MLoader.of.positions[t] > m_.MLoader.of.numpat){
			m_.MLoader.of.numpat=m_.MLoader.of.positions[t];
		}
	}
	m_.MLoader.of.numpat++;
	m_.MLoader.of.numtrk= (short)(m_.MLoader.of.numpat * m_.MLoader.of.numchn);

	/* Finally, init the sampleinfo structures */

	m_.MLoader.of.numins=15;
        if(!m_.MLoader.AllocInstruments())
            return false;

	//s=mh.samples;          /* init source pointer */
        //d=m_.MLoader.of.instruments;       /* init dest pointer */
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

		m_.MLoader.of.instruments[inst_num].samples[0].c2spd=m_.MLoader.finetune[mh.samples[smpinfo_num].finetune&0xf];
		m_.MLoader.of.instruments[inst_num].samples[0].volume=mh.samples[smpinfo_num].volume;
		m_.MLoader.of.instruments[inst_num].samples[0].loopstart=mh.samples[smpinfo_num].reppos;
		m_.MLoader.of.instruments[inst_num].samples[0].loopend=m_.MLoader.of.instruments[inst_num].samples[0].loopstart + (mh.samples[smpinfo_num].replen<<1);
		m_.MLoader.of.instruments[inst_num].samples[0].length=mh.samples[smpinfo_num].length<<1;
		m_.MLoader.of.instruments[inst_num].samples[0].seekpos=0;

		m_.MLoader.of.instruments[inst_num].samples[0].flags = (m_.MDriver.SF_SIGNED);
                if(mh.samples[smpinfo_num].replen>1)
                    m_.MLoader.of.instruments[inst_num].samples[0].flags |= (m_.MDriver.SF_LOOP);

		/* fix replen if repend>length */

                if(m_.MLoader.of.instruments[inst_num].samples[0].loopend > m_.MLoader.of.instruments[inst_num].samples[0].length)
                    m_.MLoader.of.instruments[inst_num].samples[0].loopend = m_.MLoader.of.instruments[inst_num].samples[0].length;

		smpinfo_num++;    /* point to next source sampleinfo */
		inst_num++;    /* point to next destiny sampleinfo */
	}

	if(!M15_LoadPatterns()) return false;
	return true;
}

}