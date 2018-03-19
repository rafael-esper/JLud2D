/*

Name:
LOAD_MTM.C

Description:
MTM module loader

Portability:
All systems - all compilers (hopefully)

*/

package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;


class MTMHEADER{
	byte id[];                            /* MTM file marker */
	short version;                          /* upper major, lower nibble minor version number */
	byte  songname[];                     /* ASCIIZ songname */
	short numtracks;                        /* number of tracks saved */
	short lastpattern;                      /* last pattern number saved */
	short lastorder;                        /* last order number to play (songlength-1) */
	int commentsize;                      /* length of comment field */
	short numsamples;                       /* number of samples saved */
	short attribute;                        /* attribute byte (unused) */
	short beatspertrack;            /* */
	short numchannels;                      /* number main_class.MLoader->of channels used */
        short panpos[];                       /* voice pan positions */

        public MTMHEADER()
        {
            id = new byte[3];
            songname = new byte[20];
            panpos = new short[32];
        }
}

class MTMSAMPLE{
	byte  samplename[];
	int length;
	int reppos;
	int repend;
	short finetune;
	short volume;
        short attribute;

        public MTMSAMPLE()
        {
            samplename = new byte[22];
        }
}


class MTMNOTE{
	short a,b,c;
}


public class MTM_Loader extends clLOADER
{
        protected MTMHEADER mh;
	public MTMNOTE [] mtmtrk;
	public short pat[]; //[32];

        public final String MTM_Version="MTM";


public MTM_Loader(clMainBase theMain)
{
        super(theMain);
	mh = null;
	type = new String("MTM");
        version = new String("Portable MTM loader v0.1");

        pat = new short[32];
}


public boolean Test()
{
        byte id[] = new byte[3];
        //if(!fread(id,3,1,m_.MLoader.modfp)) return 0;
        if (m_.MLoader.modfp.read(id,0,3) != 3) return false;
        //if(!memcmp(id,"MTM",3)) return 1;
        if ( ((char)id[0] == 'M') && ((char)id[1] == 'T') && ((char)id[2] == 'M') )
            return true;
        return false;
}


public boolean Init()
{
        int i;
    
	mtmtrk=null;
	mh=null;

        //if(!(mtmtrk=(MTMNOTE *)m_.MLoader.MyCalloc(64,sizeof(MTMNOTE)))) return 0;
        mtmtrk = new MTMNOTE[64];
        for(i=0;i<64;i++)
            mtmtrk[i] = new MTMNOTE();
        
        for(i=0;i<64;i++)
        {
            mtmtrk[i].a = mtmtrk[i].b = mtmtrk[i].c = 0;
        }
        
        //if(!(mh=(MTMHEADER *)m_.MLoader.MyCalloc(1,sizeof(MTMHEADER)))) return 0;
        mh = new MTMHEADER();
        mh.version = mh.numtracks = mh.lastpattern = mh.lastorder = 
            mh.numsamples = mh.attribute =
            mh.beatspertrack = mh.numchannels =  (short)0;

        mh.id[0] = mh.id[1] = mh.id[2] = (byte)0;

        mh.commentsize = 0;
        

        for(i=0;i<20;i++)
            mh.songname[i] = 0;

        for(i=0;i<32;i++)
            mh.panpos[i] = 0;
        
	return true;
}


public void Cleanup()
{
        if (mtmtrk != null)
            mtmtrk = null;
        if (mh != null)
            mh = null;
}



public short [] MTM_Convert()
{
	int t;
	short a,b,c,inst,note,eff,dat;

	m_.MUniTrk.UniReset();
	for(t=0;t<64;t++){

		a=mtmtrk[t].a;
		b=mtmtrk[t].b;
		c=mtmtrk[t].c;

		inst=(short)(((a&0x3)<<4)|(b>>4));
		note=(short)(a>>2);

		eff=(short)(b&0xf);
		dat=c;


		if(inst!=0){
			m_.MUniTrk.UniInstrument((short)(inst-1));
		}

		if(note!=0){
			m_.MUniTrk.UniNote((short)(note+24));
		}

		/* mtm bug bugfix: when the effect is volslide,
		   slide-up _always_ overrides slide-dn. */

		if(eff==0xa && ((dat&0xf0) != 0)) dat&=0xf0;

		m_.MUniTrk.UniPTEffect(eff,dat);
		m_.MUniTrk.UniNewline();
	}
	return m_.MUniTrk.UniDup();
}


public boolean Load()
{
    try {

        MTMSAMPLE s = new MTMSAMPLE();
	//INSTRUMENT *d;
        //SAMPLE *q;
        int inst_num;

	int t,u;

	/* try to read module header */

        m_.mmIO._mm_read_SBYTES(mh.id,3,m_.MLoader.modfp);
	mh.version		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	m_.mmIO._mm_read_str(mh.songname,20,m_.MLoader.modfp);
	mh.numtracks	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.lastpattern	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.lastorder	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.commentsize	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.numsamples	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.attribute	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.beatspertrack=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.numchannels	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	m_.mmIO._mm_read_UBYTES2(mh.panpos,32,m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
		m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	/* set module variables */

	m_.MLoader.of.initspeed=6;
	m_.MLoader.of.inittempo=125;
	m_.MLoader.of.modtype=new String(MTM_Version);
	m_.MLoader.of.numchn=mh.numchannels;
	m_.MLoader.of.numtrk=(short)(mh.numtracks+1);                              /* get number m_.MLoader.of channels */
	m_.MLoader.of.songname=m_.MLoader.DupStr(mh.songname,20);    /* make a cstr m_.MLoader.of songname */
	m_.MLoader.of.numpos=(short)(mh.lastorder+1);              /* copy the songlength */
	m_.MLoader.of.numpat=(short)(mh.lastpattern+1);
	for(t=0;t<32;t++) m_.MLoader.of.panning[t]=(short)(mh.panpos[t]<<4);

	m_.MLoader.of.numins=mh.numsamples;
	if(!m_.MLoader.AllocInstruments()) return false;

        //d=m_.MLoader.of.instruments;
        inst_num = 0;

	for(t=0;t<m_.MLoader.of.numins;t++){

		m_.MLoader.of.instruments[inst_num].numsmp=1;
                if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[inst_num])))
                    return false;

		/* try to read sample info */

		m_.mmIO._mm_read_str(s.samplename,22,m_.MLoader.modfp);
		s.length	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.reppos	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.repend	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.finetune	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.volume	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.attribute	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

                //if(feof(m_.MLoader.modfp)){
                if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
			m_.mmIO.myerr=m_.ERROR_LOADING_SAMPLEINFO;
			return false;
		}

		m_.MLoader.of.instruments[inst_num].insname = m_.MLoader.DupStr(s.samplename,22);
		m_.MLoader.of.instruments[inst_num].samples[0].seekpos = 0;
		m_.MLoader.of.instruments[inst_num].samples[0].c2spd = m_.MLoader.finetune[s.finetune];
		m_.MLoader.of.instruments[inst_num].samples[0].length = s.length;
		m_.MLoader.of.instruments[inst_num].samples[0].loopstart = s.reppos;
		m_.MLoader.of.instruments[inst_num].samples[0].loopend = s.repend;
		m_.MLoader.of.instruments[inst_num].samples[0].volume = s.volume;

		m_.MLoader.of.instruments[inst_num].samples[0].flags = 0;

                if(s.repend-s.reppos>2)
                    m_.MLoader.of.instruments[inst_num].samples[0].flags|=(m_.MDriver.SF_LOOP);      /* <- 1.00 bugfix */

		if((s.attribute&1) != 0){

			/* If the sample is 16-bits, convert the length
			   and replen byte-values into sample-values */

			m_.MLoader.of.instruments[inst_num].samples[0].flags |= (m_.MDriver.SF_16BITS);
			m_.MLoader.of.instruments[inst_num].samples[0].length >>= 1;
			m_.MLoader.of.instruments[inst_num].samples[0].loopstart >>= 1;
			m_.MLoader.of.instruments[inst_num].samples[0].loopend >>= 1;
		}

		inst_num++;
	}

	m_.mmIO._mm_read_UBYTES2(m_.MLoader.of.positions,128,m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
		m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	if(!m_.MLoader.AllocTracks()) return false;
	if(!m_.MLoader.AllocPatterns()) return false;

	m_.MLoader.of.tracks[0]=MTM_Convert();             /* track 0 is empty */

	for(t=1;t<m_.MLoader.of.numtrk;t++){
		int s_;

		for(s_=0;s_<64;s_++){
			mtmtrk[s_].a=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			mtmtrk[s_].b=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			mtmtrk[s_].c=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		}

                //if(feof(m_.MLoader.modfp)){
                if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
			m_.mmIO.myerr="Error loading track";
			return false;
		}

		if((m_.MLoader.of.tracks[t]=MTM_Convert()) == null) return false;
	}

	for(t=0;t<m_.MLoader.of.numpat;t++){

		m_.mmIO._mm_read_I_SWORDS(pat,32,m_.MLoader.modfp);

		for(u=0;u<m_.MLoader.of.numchn;u++){
			m_.MLoader.of.patterns[((int)t*m_.MLoader.of.numchn)+u]=pat[u];
		}
	}

	/* read comment field */

	if(!m_.MLoader.ReadComment((short)mh.commentsize)) return false;

        return true;

    }
    catch (IOException ioe1)
    {
        return false;
    }
}


        
}
