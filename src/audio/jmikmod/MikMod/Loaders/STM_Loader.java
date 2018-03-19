/*

Name:
LOAD_STM.C

Description:
ScreamTracker 2 (STM) module Loader - Version 1.oOo Release 2 
A Coding Nightmare by Rao and Air Richter of HaRDCoDE
You can now play all of those wonderful old C.C. Catch STM's!

Portability:
All systems - all compilers (hopefully)

*/

package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;


class STMNOTE{
   short note,insvol,volcmd,cmdinf;
}

/* Raw STM sampleinfo struct: */

class STMSAMPLE{
   byte  filename[]; /* Can't have long comments - just filename comments :) */
   byte  unused;       /* 0x00 */
   short instdisk;     /* Instrument disk */
   short reserved;     /* ISA in memory when in ST 2 */
   int length;       /* Sample length */
   int loopbeg;      /* Loop start point */
   int loopend;      /* Loop end point */
   short volume;       /* Volume */
   byte reserved2;    /* More reserved crap */
   int c2spd;        /* Good old c2spd */
   byte reserved3[]; /* Yet more main_class.MLoader->of PSi's reserved crap */
   int isa;          /* Internal Segment Address -> */
					   /*    contrary to the tech specs, this is NOT actually */
					   /*    written to the stm file. */

   public STMSAMPLE()
   {
       filename = new byte[12];
       reserved3 = new byte[4];
   }
}

/* Raw STM header struct: */

class STMHEADER{
   byte songname[];
   byte trackername[];   /* !SCREAM! for ST 2.xx */
   byte unused;           /* 0x1A */
   byte filetype;         /* 1=song, 2=module (only 2 is supported, of course) :) */
   byte ver_major;        /* Like 2 */
   byte ver_minor;        /* "ditto" */
   short inittempo;       /* initspeed= stm inittempo>>4 */
   short  numpat;         /* number of patterns */
   short   globalvol;     /* <- WoW! a RiGHT TRiANGLE =8*) */
   byte    reserved[]; /* More of PSi's internal crap */
   STMSAMPLE sample[];  /* STM sample data */
   short patorder[];   /* Docs say 64 - actually 128 */

   public STMHEADER()
   {
       songname = new byte[20];
       trackername = new byte[8];
       reserved = new byte[13];
       sample = new STMSAMPLE[31];
       for(int i=0;i<31;i++)
           sample[i] = new STMSAMPLE();
       patorder = new short[128];
   }

}

public class STM_Loader extends clLOADER
{
public final String STM_Version="Screamtracker 2";

protected STMNOTE [] stmbuf;        /* pointer to a complete S3M pattern */
protected STMHEADER mh;

public STM_Loader(clMainBase theMain)
{
        super(theMain);
        
	stmbuf = null;
	mh = null;
	type = new String("STM");
	version = new String("Portable STM Loader - v1.2");
}

public boolean Test()
{
    byte str[] = new byte[9], filetype[] = new byte[1], should_be[] = new byte[10];
	(new String("!SCREAM!")).getBytes(0,8, should_be, 0);
	should_be[8] = (byte)0;
	int a;
	
	m_.mmIO._mm_fseek(m_.MLoader.modfp,21,m_.mmIO.SEEK_SET);
	//fread(str,1,9,m_.MLoader.modfp);
	m_.MLoader.modfp.read(str,0,9);
	//fread(&filetype,1,1,m_.MLoader.modfp);
	m_.MLoader.modfp.read(filetype,0,1);
	for(a=0;a<8;a++)
	    if (str[a] != should_be[a])
	        break;
	//if(!memcmp(str,"!SCREAM!",8) || (filetype[0]!=2)) /* STM Module = filetype 2 */
	if ((a != 8) || (filetype[0] != 2)) /* STM Module = filetype 2 */
	      return false;
	
	return true;
}



public boolean Init()
{
        int i, j;
    
	stmbuf=null;
        //if(!(mh=(STMHEADER *)m_.MLoader.MyCalloc(1,sizeof(STMHEADER)))) return 0;
        mh = new STMHEADER();

        mh.unused = mh.filetype = mh.ver_major = mh.ver_minor = (byte)0;
        mh.inittempo = mh.numpat = mh.globalvol = (short)0;

        for(i=0;i<20;i++)
            mh.songname[i] = 0;
        for(i=0;i<8;i++)
            mh.trackername[i] = 0;
        for(i=0;i<13;i++)
            mh.reserved[i] = 0;
        for(i=0;i<128;i++)
            mh.patorder[i] = 0;
        for(i=0;i<31;i++)
        {
            mh.sample[i].unused = mh.sample[i].reserved2 = (byte)0;
            mh.sample[i].instdisk = mh.sample[i].reserved = mh.sample[i].volume = (short)0;
            mh.sample[i].length = mh.sample[i].loopbeg = mh.sample[i].loopend =
                 mh.sample[i].c2spd = mh.sample[i].isa = 0;

            for(j=0;j<12;j++)
                mh.sample[i].filename[j] = 0;
            for(j=0;j<4;j++)
                mh.sample[i].reserved3[j] = 0;
        }
        
	return true;
}

public void Cleanup()
{
        if(mh!=null) mh = null;
        if(stmbuf!=null) stmbuf = null;
}



public void STM_ConvertNote(STMNOTE n)
{
	short note,ins,vol,cmd,inf;

	/* extract the various information from the 4 bytes that
	   make up a single note */

		note=n.note;
		ins=(short)(n.insvol>>3);
		vol=(short)((n.insvol&7)+(n.volcmd>>1));
		cmd=(short)(n.volcmd&15);
		inf=n.cmdinf;

		if(ins!=0 && ins<32){
			m_.MUniTrk.UniInstrument((short)(ins-1));
		}

      /* special values of [char0] are handled here . */
      /* we have no idea if these strange values will ever be encountered */
	  /* but it appears as though stms sound correct. */
                if(note==254 || note==252)
                    m_.MUniTrk.UniPTEffect((short)0xc,(short)0); /* <- note off command (???) */
                else
      /* if note < 251, then all three bytes are stored in the file */
                    if(note<251)
                        m_.MUniTrk.UniNote((short)((((note>>4)+2)*12)+(note&0xf)));      /* <- normal note and up the octave by two */

		if(vol<65){
			m_.MUniTrk.UniPTEffect((short)0xc,vol);
		}

		if(cmd!=255){
			switch(cmd){

				case 1:                 /* Axx set speed to xx and add 0x1c to fix StoOoPiD STM 2.x */
					m_.MUniTrk.UniPTEffect((short)0xf,(short)(inf>>4));
					break;

				case 2:                 /* Bxx position jump */
					m_.MUniTrk.UniPTEffect((short)0xb,inf);
					break;

				case 3:                 /* Cxx patternbreak to row xx */
					m_.MUniTrk.UniPTEffect((short)0xd,inf);
					break;

				case 4:                 /* Dxy volumeslide */
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTD);
					m_.MUniTrk.UniWrite(inf);
					break;

				case 5:                 /* Exy toneslide down */
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTE);
					m_.MUniTrk.UniWrite(inf);
					break;

				case 6:                 /* Fxy toneslide up */
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTF);
					m_.MUniTrk.UniWrite(inf);
					break;

				case 7:                 /* Gxx Tone portamento,speed xx */
					m_.MUniTrk.UniPTEffect((short)0x3,inf);
					break;

				case 8:                 /* Hxy vibrato */
					m_.MUniTrk.UniPTEffect((short)0x4,inf);
					break;

				case 9:                 /* Ixy tremor, ontime x, offtime y */
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTI);
					m_.MUniTrk.UniWrite(inf);
					break;

				case 0xa:               /* Jxy arpeggio */
					m_.MUniTrk.UniPTEffect((short)0x0,inf);
					break;

				case 0xb:               /* Kxy Dual command H00 & Dxy */
					m_.MUniTrk.UniPTEffect((short)0x4,(short)0);
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTD);
					m_.MUniTrk.UniWrite(inf);
					break;

				case 0xc:               /* Lxy Dual command G00 & Dxy */
					m_.MUniTrk.UniPTEffect((short)0x3,(short)0);
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTD);
					m_.MUniTrk.UniWrite(inf);
					break;

		/* Support all these above, since ST2 can LOAD these values */
		/* but can actually only play up to J - and J is only */
		/* half-way implemented in ST2 */

				case 0x18:      /* Xxx amiga command 8xx - What the hell, support panning. :) */
					m_.MUniTrk.UniPTEffect((short)0x8,inf);
					break;
			}
		}

}


public short [] STM_ConvertTrack(STMNOTE [] n, int offset)
{
	int t;

        m_.MUniTrk.UniReset();
        int n_ptr = offset;
	for(t=0;t<64;t++)
	{       STM_ConvertNote(n[n_ptr]);
		m_.MUniTrk.UniNewline();
		n_ptr+=m_.MLoader.of.numchn;
	}
	return m_.MUniTrk.UniDup();
}




public boolean STM_LoadPatterns()
{
    try {
	int t,s,tracks=0;

	if(!m_.MLoader.AllocPatterns()) return false;
	if(!m_.MLoader.AllocTracks()) return false;

	/* Allocate temporary buffer for loading
	   and converting the patterns */

        //if(!(stmbuf=(STMNOTE *)m_.MLoader.MyCalloc(64U*m_.MLoader.of.numchn,sizeof(STMNOTE)))) return 0;
        stmbuf = new STMNOTE[64*m_.MLoader.of.numchn];
        for(t=0;t<64*m_.MLoader.of.numchn;t++)
        {
            stmbuf[t].note = stmbuf[t].insvol =
                stmbuf[t].volcmd = stmbuf[t].cmdinf;
        }

	for(t=0;t<m_.MLoader.of.numpat;t++){

		for(s=0;s<(int)(64*m_.MLoader.of.numchn);s++){
			stmbuf[s].note=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			stmbuf[s].insvol=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			stmbuf[s].volcmd=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			stmbuf[s].cmdinf=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		}

                //if(feof(m_.MLoader.modfp)){
                if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
			m_.mmIO.myerr=m_.ERROR_LOADING_PATTERN;
			return false;
		}

		for(s=0;s<m_.MLoader.of.numchn;s++){
			if((m_.MLoader.of.tracks[tracks++]=STM_ConvertTrack(stmbuf,s))==null) return false;
		}
	}

        return true;
    }
    catch (IOException ioe1)
    {
        return false;
    }
}



public boolean Load()
{
    try {
	int t;
	long MikMod_ISA; /* We MUST generate our own ISA - NOT stored in the stm */
	//INSTRUMENT *d;
        //SAMPLE *q;
        int inst_num;

	/* try to read stm header */

	m_.mmIO._mm_read_str(mh.songname,20,m_.MLoader.modfp);
	m_.mmIO._mm_read_str(mh.trackername,8,m_.MLoader.modfp);
	mh.unused		=(byte)m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.filetype	=(byte)m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.ver_major	=(byte)m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.ver_minor	=(byte)m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.inittempo	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.numpat		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.globalvol	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	m_.mmIO._mm_read_SBYTES(mh.reserved,13,m_.MLoader.modfp);

	for(t=0;t<31;t++){
		STMSAMPLE s=mh.sample[t];  /* STM sample data */
		m_.mmIO._mm_read_str(s.filename,12,m_.MLoader.modfp);
		s.unused	=(byte)m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.instdisk	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.reserved	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		s.length	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		s.loopbeg	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		s.loopend	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		s.volume	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.reserved2=(byte)m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.c2spd	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		m_.mmIO._mm_read_SBYTES(s.reserved3,4,m_.MLoader.modfp);
		s.isa		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	}
	m_.mmIO._mm_read_UBYTES2(mh.patorder,128,m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
		m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	/* set module variables */

	m_.MLoader.of.modtype=new String(STM_Version);
	m_.MLoader.of.songname=m_.MLoader.DupStr(mh.songname,20); /* make a cstr m_.MLoader.of songname */

	m_.MLoader.of.numpat=mh.numpat;

	m_.MLoader.of.initspeed=6; /* Always this */

	/* STM 2.x tempo has always been fucked... The default m_.MLoader.of 96 */
	/* is actually 124, so we add 1ch to the initial value m_.MLoader.of 60h */

	/* MikMak: No it's not.. STM tempo is UNI speed << 4 */

	m_.MLoader.of.inittempo=125;               /* mh.inittempo+0x1c; */
	m_.MLoader.of.initspeed=(short)(mh.inittempo>>4);
	m_.MLoader.of.numchn=4; /* get number m_.MLoader.of channels */

	t=0;
	while(mh.patorder[t]!=99){ /* 99 terminates the patorder list */
		m_.MLoader.of.positions[t]=mh.patorder[t];
		t++;
	}
	m_.MLoader.of.numpos=(short)(--t);
	m_.MLoader.of.numtrk=(short)(m_.MLoader.of.numpat*m_.MLoader.of.numchn);

	/* Finally, init the sampleinfo structures */

	m_.MLoader.of.numins=31; /* always this */

        if(!m_.MLoader.AllocInstruments())
            return false;
        if(!STM_LoadPatterns())
            return false;

        //d=m_.MLoader.of.instruments;
        inst_num = 0;

        //MikMod_ISA=ftell(m_.MLoader.modfp);
        MikMod_ISA=m_.MLoader.modfp.getFilePointer();
	MikMod_ISA=(MikMod_ISA+15)&0xfffffff0;

	for(t=0;t<m_.MLoader.of.numins;t++){

		m_.MLoader.of.instruments[inst_num].numsmp=1;
                if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[inst_num])))
                    return false;
		//q=m_.MLoader.of.instruments[inst_num].samples;

		/* load sample info */

		m_.MLoader.of.instruments[inst_num].insname=m_.MLoader.DupStr(mh.sample[t].filename,12);
		m_.MLoader.of.instruments[inst_num].samples[0].c2spd=mh.sample[t].c2spd;
		m_.MLoader.of.instruments[inst_num].samples[0].volume=mh.sample[t].volume;
		m_.MLoader.of.instruments[inst_num].samples[0].length=mh.sample[t].length;
                if ((mh.sample[t].volume == 0) || m_.MLoader.of.instruments[inst_num].samples[0].length==1 )
                    m_.MLoader.of.instruments[inst_num].samples[0].length = 0; /* if vol = 0 or length = 1, then no sample */
		m_.MLoader.of.instruments[inst_num].samples[0].loopstart=mh.sample[t].loopbeg;
		m_.MLoader.of.instruments[inst_num].samples[0].loopend=mh.sample[t].loopend;
		m_.MLoader.of.instruments[inst_num].samples[0].seekpos=(int)MikMod_ISA;

		MikMod_ISA+=m_.MLoader.of.instruments[inst_num].samples[0].length;

		MikMod_ISA=(MikMod_ISA+15)&0xfffffff0;

	  /* Once again, contrary to the STM specs, all the sample data is */
	  /* actually SIGNED! Sheesh */

		m_.MLoader.of.instruments[inst_num].samples[0].flags = (m_.MDriver.SF_SIGNED);

                if(mh.sample[t].loopend>0 && mh.sample[t].loopend!=0xffff)
                    m_.MLoader.of.instruments[inst_num].samples[0].flags |= (m_.MDriver.SF_LOOP);

		/* fix replen if repend>length */

                if(m_.MLoader.of.instruments[inst_num].samples[0].loopend > m_.MLoader.of.instruments[inst_num].samples[0].length)
                    m_.MLoader.of.instruments[inst_num].samples[0].loopend = m_.MLoader.of.instruments[inst_num].samples[0].length;

                //d++;
                inst_num++;
	}

        return true;
    }
    catch (IOException ioe1)
    {
        return false;
    }
}




}
