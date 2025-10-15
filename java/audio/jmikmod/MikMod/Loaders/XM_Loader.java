/*

Name:
LOAD_XM.C

Description:
Fasttracker (XM) module loader

Portability:
All systems - all compilers (hopefully)

*/

package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;
import persist.SimulatedRandomAccessFile;



class XMHEADER{
	byte  id[];                   /* ID text: 'Extended module: ' */
	byte  songname[];             /* Module name, padded with zeroes and 0x1a at the end */
	byte  trackername[];  /* Tracker name */
	int version;                  /* (word) Version number, hi-byte major and low-byte minor */
	int headersize;               /* Header size */
	short songlength;               /* (word) Song length (in patten order table) */
	int restart;                  /* (word) Restart position */
	short numchn;                   /* (word) Number of channels (2,4,6,8,10,...,32) */
	short numpat;                   /* (word) Number of patterns (max 256) */
	short numins;                   /* (word) Number of instruments (max 128) */
	short flags;                    /* (word) Flags: bit 0: 0 = Amiga frequency table (see below) 1 = Linear frequency table */
	int tempo;                    /* (word) Default tempo */
	int bpm;                              /* (word) Default BPM */
        short orders[];              /* (byte) Pattern order table */

        public XMHEADER()
        {
            id = new byte[17];
            songname = new byte[21];
            trackername = new byte[20];
            orders = new short[256];
        }
}

class XMNOTE{
	short note,ins,vol,eff,dat;
}

class XMINSTHEADER{
	int size;                             /* (dword) Instrument size */
	byte  name[];                 /* (char) Instrument name */
	short type;                             /* (byte) Instrument type (always 0) */
	short numsmp;                   /* (word) Number of samples in instrument */
        int ssize;                    /* */

        public XMINSTHEADER()
        {
            name = new byte[22];
        }
}


class XMPATCHHEADER{
	short what[];         /* (byte) Sample number for all notes */
	short volenv[];       /* (byte) Points for volume envelope */
	short panenv[];       /* (byte) Points for panning envelope */
	short volpts;           /* (byte) Number of volume points */
	short panpts;           /* (byte) Number of panning points */
	short volsus;           /* (byte) Volume sustain point */
	short volbeg;           /* (byte) Volume loop start point */
	short volend;           /* (byte) Volume loop end point */
	short pansus;           /* (byte) Panning sustain point */
	short panbeg;           /* (byte) Panning loop start point */
	short panend;           /* (byte) Panning loop end point */
	short volflg;           /* (byte) Volume type: bit 0: On; 1: Sustain; 2: Loop */
	short panflg;           /* (byte) Panning type: bit 0: On; 1: Sustain; 2: Loop */
	short vibflg;           /* (byte) Vibrato type */
	short vibsweep;         /* (byte) Vibrato sweep */
	short vibdepth;         /* (byte) Vibrato depth */
	short vibrate;          /* (byte) Vibrato rate */
	int volfade;          /* (word) Volume fadeout */
        short reserved[];     /* (word) Reserved */

        public XMPATCHHEADER()
        {
            what = new short[96];
            volenv = new short[48];
            panenv = new short[48];
            reserved = new short[11];
        }
}


class XMWAVHEADER{
	int length;           /* (dword) Sample length */
	int loopstart;        /* (dword) Sample loop start */
	int looplength;       /* (dword) Sample loop length */
	short volume;           /* (byte) Volume */
	byte finetune;          /* (byte) Finetune (signed byte -128..+127) */
	short type;                     /* (byte) Type: Bit 0-1: 0 = No loop, 1 = Forward loop, */
/*                                        2 = Ping-pong loop; */
/*                                        4: 16-bit sampledata */
	short panning;          /* (byte) Panning (0-255) */
	byte  relnote;          /* (byte) Relative note number (signed byte) */
	byte reserved;         /* (byte) Reserved */
        byte  samplename[];   /* (char) Sample name */

        public XMWAVHEADER()
        {
            samplename = new byte[22];
        }
}


class XMPATHEADER{
	int size;                             /* (dword) Pattern header length */
	short packing;                  /* (byte) Packing type (always 0) */
	short numrows;                  /* (word) Number of rows in pattern (1..256) */
	int packsize;                 /* (word) Packed patterndata size */
}

public class XM_Loader extends clLOADER
{
	public XMNOTE [] xmpat;
        public XMHEADER mh;

public XM_Loader(clMainBase theMain)
{
        super(theMain);
    
	mh = null;

	type = new String("XM");
	version = new String("Portable XM loader v0.4 - for your ears only / MikMak");
}


public boolean Test()
{
    byte id[] = new byte[17], should_be[] = new byte[20];

	String szShould="Extended Module: ";
	szShould.getBytes(0,17,should_be,0);
	int a;
	//if(!fread(id,17,1,m_.MLoader.modfp)) return 0;
	//if (!m_.MLoader.modfp.read(id,0,17)) return 0;
	if (m_.MLoader.modfp.read(id,0,17) != 17) return false;
	for (a=0; a<17;a++)
	{
	    if (id[a] != should_be[a])
	        return false;
	}
	return true;
}


public boolean Init()
{
        int i;

        mh=null;
        //if(!(mh=(XMHEADER *)m_.MLoader.MyCalloc(1,sizeof(XMHEADER)))) return 0;
        mh = new XMHEADER();

        mh.version = mh.headersize = mh.restart = mh.tempo = mh.bpm = 0;
            mh.songlength = 
            mh.numchn = mh.numpat = mh.numins = mh.flags = (short)0;
            
        for(i=0;i<17;i++)
            mh.id[i] = 0;
        for(i=0;i<21;i++)
            mh.songname[i] = 0;
        for(i=0;i<20;i++)
            mh.trackername[i] = 0;
        for(i=0;i<256;i++)
            mh.orders[i] = 0;

	return true;
}


public void Cleanup()
{
        if(mh!=null) mh = null;
}


public void XM_ReadNote(XMNOTE n)
{
    short cmp;
        //memset(n,0,sizeof(XMNOTE));
        n.note = n.ins = n.vol = n.eff = n.dat = 0;

        //cmp=fgetc(m_.MLoader.modfp);
        cmp = (short)m_.MLoader.modfp.read();

	if((cmp&0x80) != 0){
		if((cmp&1) != 0) n.note=(short)m_.MLoader.modfp.read();
		if((cmp&2) != 0) n.ins=(short)m_.MLoader.modfp.read();
		if((cmp&4) != 0) n.vol=(short)m_.MLoader.modfp.read();
		if((cmp&8) != 0) n.eff=(short)m_.MLoader.modfp.read();
		if((cmp&16) != 0) n.dat=(short)m_.MLoader.modfp.read();
	}
	else{
		n.note=cmp;
		n.ins=(short)m_.MLoader.modfp.read();
		n.vol=(short)m_.MLoader.modfp.read();
		n.eff=(short)m_.MLoader.modfp.read();
		n.dat=(short)m_.MLoader.modfp.read();
        }
        if (n.note == -1)
            n.note = 255;
        if (n.ins == -1)
            n.ins = 255;
        if (n.vol == -1)
            n.vol = 255;
        if (n.eff == -1)
            n.eff = 255;
        if (n.dat == -1)
            n.dat = 255;
}


public short [] XM_Convert(XMNOTE [] xmtrack,int offset, int rows)
{
	int t;
	short note,ins,vol,eff,dat;

        m_.MUniTrk.UniReset();

        int xmi = offset;

	for(t=0;t<rows;t++){

		note=xmtrack[xmi].note;
		ins=xmtrack[xmi].ins;
		vol=xmtrack[xmi].vol;
		eff=xmtrack[xmi].eff;
		dat=xmtrack[xmi].dat;

                if(note!=0) m_.MUniTrk.UniNote((short)(note-1));

                if(ins!=0) m_.MUniTrk.UniInstrument((short)(ins-1));

/*              printf("Vol:%d\n",vol); */

		switch(vol>>4){

			case 0x6:					/* volslide down */
				if((vol&0xf) != 0){
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTA);
					m_.MUniTrk.UniWrite((short)(vol&0xf));
				}
				break;

			case 0x7:					/* volslide up */
				if((vol&0xf) != 0){
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTA);
					m_.MUniTrk.UniWrite((short)(vol<<4));
				}
				break;

			/* volume-row fine volume slide is compatible with protracker
			   EBx and EAx effects i.e. a zero nibble means DO NOT SLIDE, as
			   opposed to 'take the last sliding value'.
			*/

			case 0x8:						/* finevol down */
				m_.MUniTrk.UniPTEffect((short)0xe,(short)(0xb0 | (vol&0xf)));
				break;

			case 0x9:                       /* finevol up */
				m_.MUniTrk.UniPTEffect((short)0xe,(short)(0xa0 | (vol&0xf)));
				break;

			case 0xa:                       /* set vibrato speed */
				m_.MUniTrk.UniPTEffect((short)0x4,(short)(vol<<4));
				break;

			case 0xb:                       /* vibrato */
				m_.MUniTrk.UniPTEffect((short)0x4,(short)(vol&0xf));
				break;

			case 0xc:                       /* set panning */
				m_.MUniTrk.UniPTEffect((short)0x8,(short)(vol<<4));
				break;

			case 0xd:                       /* panning slide left */
				/* only slide when data nibble not zero: */

				if((vol&0xf) != 0){
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTP);
					m_.MUniTrk.UniWrite((short)(vol&0xf));
				}
				break;

			case 0xe:                       /* panning slide right */
				/* only slide when data nibble not zero: */

				if((vol&0xf) != 0){
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTP);
					m_.MUniTrk.UniWrite((short)(vol<<4));
				}
				break;

			case 0xf:                       /* tone porta */
				m_.MUniTrk.UniPTEffect((short)0x3,(short)(vol<<4));
				break;

			default:
				if(vol>=0x10 && vol<=0x50){
					m_.MUniTrk.UniPTEffect((short)0xc,(short)(vol-0x10));
				}
		}

/*              if(eff>0xf) printf("Effect %d",eff); */

		switch(eff){

			case 'G'-55:                    /* G - set global volume */
				if(dat>64) dat=64;
				m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTG);
				m_.MUniTrk.UniWrite(dat);
				break;

			case 'H'-55:                    /* H - global volume slide */
				m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTH);
				m_.MUniTrk.UniWrite(dat);
				break;

			case 'K'-55:                    /* K - keyoff */
				m_.MUniTrk.UniNote((short)96);
				break;

			case 'L'-55:                    /* L - set envelope position */
				break;

			case 'P'-55:                    /* P - panning slide */
				m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTP);
				m_.MUniTrk.UniWrite(dat);
				break;

			case 'R'-55:                    /* R - multi retrig note */
				m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTQ);
				m_.MUniTrk.UniWrite(dat);
				break;

			case 'T'-55:             		/* T - Tremor !! (== S3M effect I) */
				m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTI);
				m_.MUniTrk.UniWrite(dat);
				break;

			case 'X'-55:
				if((dat>>4)==1){                /* X1 extra fine porta up */


				}
				else{                                   /* X2 extra fine porta down */

				}
				break;

			default:
				if(eff==0xa){
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_XMEFFECTA);
					m_.MUniTrk.UniWrite(dat);
				}
				else if(eff<=0xf) m_.MUniTrk.UniPTEffect(eff,dat);
				break;
		}

		m_.MUniTrk.UniNewline();
		xmi++;
	}
	return m_.MUniTrk.UniDup();
}



public boolean Load()
{
    try {
	//INSTRUMENT *d;
        //SAMPLE *q;
        int inst_num;
	int t,u,v,p,numtrk;
	int next;
        int i;

	/* try to read module header */

	m_.mmIO._mm_read_str(mh.id,17,m_.MLoader.modfp);
	m_.mmIO._mm_read_str(mh.songname,21,m_.MLoader.modfp);
	m_.mmIO._mm_read_str(mh.trackername,20,m_.MLoader.modfp);
	mh.version		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.headersize	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
	mh.songlength	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.restart		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.numchn		=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.numpat		=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.numins		=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.flags		=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.tempo		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.bpm			=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.mmIO._mm_read_UBYTES2(mh.orders,256,m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
		m_.mmIO.myerr = m_.ERROR_LOADING_HEADER;
		return false;
	}

	/* set module variables */

	m_.MLoader.of.initspeed=(short)mh.tempo;
	m_.MLoader.of.inittempo=(short)mh.bpm;
	m_.MLoader.of.modtype=m_.MLoader.DupStr(mh.trackername,20);
	m_.MLoader.of.numchn=mh.numchn;
	m_.MLoader.of.numpat=mh.numpat;
	m_.MLoader.of.numtrk=(short)(m_.MLoader.of.numpat*m_.MLoader.of.numchn);   /* get number of channels */
	m_.MLoader.of.songname=m_.MLoader.DupStr(mh.songname,20);    /* make a cstr of songname */
	m_.MLoader.of.numpos=mh.songlength;                       /* copy the songlength */
	m_.MLoader.of.reppos=(short)mh.restart;
	m_.MLoader.of.numins=mh.numins;
	m_.MLoader.of.flags |= m_.MUniTrk.UF_XMPERIODS;
	if((mh.flags&1) != 0) m_.MLoader.of.flags|=  m_.MUniTrk.UF_LINEAR;

        //memcpy(m_.MLoader.of.positions,mh.orders,256);
        for(t=0;t<256;t++)
            m_.MLoader.of.positions[t] = mh.orders[t];

/*
        WHY THIS CODE HERE?? I CAN'T REMEMBER!

        m_.MLoader.of.numpat=0;
	for(t=0;t<m_.MLoader.of.numpos;t++){
		if(m_.MLoader.of.positions[t]>m_.MLoader.of.numpat) m_.MLoader.of.numpat=m_.MLoader.of.positions[t];
	}
	m_.MLoader.of.numpat++;
*/

	if(!m_.MLoader.AllocTracks()) return false;
	if(!m_.MLoader.AllocPatterns()) return false;

	numtrk=0;
	for(t=0;t<mh.numpat;t++){
		XMPATHEADER ph = new XMPATHEADER();

/*		printf("Reading pattern %d\n",t); */

		ph.size		=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		ph.packing	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		ph.numrows	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		ph.packsize	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);

/*		printf("headln:  %ld\n",ph.size); */
/*		printf("numrows: %d\n",ph.numrows); */
/*		printf("packsize:%d\n",ph.packsize); */

                m_.MLoader.of.pattrows[t]=ph.numrows;

		/*
			Gr8.. when packsize is 0, don't try to load a pattern.. it's empty.
			This bug was discovered thanks to Khyron's module..
		*/

		//if(!(xmpat=(XMNOTE *)m_.MLoader.MyCalloc(ph.numrows*m_.MLoader.of.numchn,sizeof(XMNOTE)))) return false;
                xmpat = new XMNOTE[ph.numrows*m_.MLoader.of.numchn];
                for(i=0 ; i<ph.numrows*m_.MLoader.of.numchn ; i++)
                    xmpat[i] = new XMNOTE();
                
                for(i=0;i<ph.numrows*m_.MLoader.of.numchn;i++)
                {
                    xmpat[i].note = xmpat[i].ins = xmpat[i].vol =
                        xmpat[i].eff = xmpat[i].dat = 0;
                }
                
                    
		if(ph.packsize>0){
			for(u=0;u<ph.numrows;u++){
				for(v=0;v<m_.MLoader.of.numchn;v++){
					XM_ReadNote(xmpat[(v*ph.numrows)+u]);
				}
			}
		}

		for(v=0;v<m_.MLoader.of.numchn;v++){
			m_.MLoader.of.tracks[numtrk++]=XM_Convert(xmpat, v*ph.numrows,ph.numrows);
		}

                xmpat = null;
	}

	if(!m_.MLoader.AllocInstruments()) return false;

        //d=m_.MLoader.of.instruments;
        inst_num=0;

	for(t=0;t<m_.MLoader.of.numins;t++){
		XMINSTHEADER ih = new XMINSTHEADER();

		/* read instrument header */

		ih.size		=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		m_.mmIO._mm_read_str (ih.name, 22, m_.MLoader.modfp);
		ih.type		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		ih.numsmp	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		ih.ssize	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);

/*      printf("Size: %ld\n",ih.size);
		printf("Name: 	%22.22s\n",ih.name);
		printf("Samples:%d\n",ih.numsmp);
		printf("sampleheadersize:%ld\n",ih.ssize);
*/
		m_.MLoader.of.instruments[inst_num].insname=m_.MLoader.DupStr(ih.name,22);
		m_.MLoader.of.instruments[inst_num].numsmp=ih.numsmp;

		if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[inst_num]))) return false;

		if(ih.numsmp>0){
			XMPATCHHEADER pth = new XMPATCHHEADER();
			XMWAVHEADER wh = new XMWAVHEADER();

			m_.mmIO._mm_read_UBYTES2 (pth.what, 96, m_.MLoader.modfp);
			m_.mmIO._mm_read_UBYTES2 (pth.volenv, 48, m_.MLoader.modfp);
			m_.mmIO._mm_read_UBYTES2 (pth.panenv, 48, m_.MLoader.modfp);
			pth.volpts		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.panpts		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.volsus		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.volbeg		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.volend		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.pansus		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.panbeg		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.panend		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.volflg		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.panflg		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.vibflg		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.vibsweep	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.vibdepth	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.vibrate		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			pth.volfade		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
			m_.mmIO._mm_read_I_SWORDS(pth.reserved, 11, m_.MLoader.modfp);

                        //memcpy(m_.MLoader.of.instruments[inst_num].samplenumber,pth.what,96);
                        for(i=0 ; i<96 ; i++)
                        {
                            m_.MLoader.of.instruments[inst_num].samplenumber[i] = pth.what[i];
                        }

			m_.MLoader.of.instruments[inst_num].volfade=pth.volfade;

/*			printf("Volfade %x\n",m_.MLoader.of.instruments[inst_num].volfade); */

                        //memcpy(m_.MLoader.of.instruments[inst_num].volenv,pth.volenv,24);
                        for(i = 0;i < 6; i++)
                        {
                            m_.MLoader.of.instruments[inst_num].volenv[i].pos = (short)(pth.volenv[i*4] + (pth.volenv[i*4+1]<<8));
                            m_.MLoader.of.instruments[inst_num].volenv[i].val = (short)(pth.volenv[i*4+2] + (pth.volenv[i*4+3]<<8));
                        }
/*
            for (i = 0; i < 12; i++)
            {
                byte tmp = ((byte*)m_.MLoader.of.instruments[inst_num].volenv)[i*2];

                ((byte*)m_.MLoader.of.instruments[inst_num].volenv)[i*2] = ((byte*)m_.MLoader.of.instruments[inst_num].volenv)[i*2+1];
                ((byte*)m_.MLoader.of.instruments[inst_num].volenv)[i*2+1] = tmp;
            }
*/

			m_.MLoader.of.instruments[inst_num].volflg=pth.volflg;
			m_.MLoader.of.instruments[inst_num].volsus=pth.volsus;
			m_.MLoader.of.instruments[inst_num].volbeg=pth.volbeg;
			m_.MLoader.of.instruments[inst_num].volend=pth.volend;
			m_.MLoader.of.instruments[inst_num].volpts=pth.volpts;

/*			printf("volume points	: %d\n"
				   "volflg			: %d\n"
				   "volbeg			: %d\n"
				   "volend			: %d\n"
				   "volsus			: %d\n",
				   m_.MLoader.of.instruments[inst_num].volpts,
				   m_.MLoader.of.instruments[inst_num].volflg,
				   m_.MLoader.of.instruments[inst_num].volbeg,
				   m_.MLoader.of.instruments[inst_num].volend,
				   m_.MLoader.of.instruments[inst_num].volsus);
*/
			/* scale volume envelope: */

			for(p=0;p<12;p++){
				m_.MLoader.of.instruments[inst_num].volenv[p].val<<=2;
/*				printf("%d,%d,",m_.MLoader.of.instruments[inst_num].volenv[p].pos,m_.MLoader.of.instruments[inst_num].volenv[p].val); */
			}

                        //memcpy(m_.MLoader.of.instruments[inst_num].panenv,pth.panenv,24);
                        for (i=0;i<6;i++)
                        {
                            m_.MLoader.of.instruments[inst_num].panenv[i].pos = (short)(pth.panenv[i*4] + (pth.panenv[i*4+1]<<8));
                            m_.MLoader.of.instruments[inst_num].panenv[i].val = (short)(pth.panenv[i*4+2] + (pth.panenv[i*4+3]<<8));
                        }
                        

/*
            for (i = 0; i < 12; i++)
            {
                short tmp = ((byte*)m_.MLoader.of.instruments[inst_num].panenv)[i*2];

                ((byte*)m_.MLoader.of.instruments[inst_num].panenv)[i*2] = ((byte*)m_.MLoader.of.instruments[inst_num].panenv)[i*2+1];
                ((byte*)m_.MLoader.of.instruments[inst_num].panenv)[i*2+1] = tmp;
            }
*/
			m_.MLoader.of.instruments[inst_num].panflg=pth.panflg;
			m_.MLoader.of.instruments[inst_num].pansus=pth.pansus;
			m_.MLoader.of.instruments[inst_num].panbeg=pth.panbeg;
			m_.MLoader.of.instruments[inst_num].panend=pth.panend;
			m_.MLoader.of.instruments[inst_num].panpts=pth.panpts;

/*					  printf("Panning points	: %d\n"
				   "panflg			: %d\n"
				   "panbeg			: %d\n"
				   "panend			: %d\n"
				   "pansus			: %d\n",
				   m_.MLoader.of.instruments[inst_num].panpts,
				   m_.MLoader.of.instruments[inst_num].panflg,
				   m_.MLoader.of.instruments[inst_num].panbeg,
				   m_.MLoader.of.instruments[inst_num].panend,
				   m_.MLoader.of.instruments[inst_num].pansus);
*/
			/* scale panning envelope: */

			for(p=0;p<12;p++){
				m_.MLoader.of.instruments[inst_num].panenv[p].val<<=2;
/*				printf("%d,%d,",m_.MLoader.of.instruments[inst_num].panenv[p].pos,m_.MLoader.of.instruments[inst_num].panenv[p].val); */
			}

/*                      for(u=0;u<256;u++){ */
/*                              printf("%2.2x ",fgetc(m_.MLoader.modfp)); */
/*                      } */

			next=0;

			for(u=0;u<ih.numsmp;u++){
				//q=&m_.MLoader.of.instruments[inst_num].samples[u];

				wh.length		=m_.mmIO._mm_read_I_ULONG (m_.MLoader.modfp);
				wh.loopstart	=m_.mmIO._mm_read_I_ULONG (m_.MLoader.modfp);
				wh.looplength	=m_.mmIO._mm_read_I_ULONG (m_.MLoader.modfp);
				wh.volume		=m_.mmIO._mm_read_UBYTE (m_.MLoader.modfp);
				wh.finetune		=m_.mmIO._mm_read_SBYTE (m_.MLoader.modfp);
				wh.type			=m_.mmIO._mm_read_UBYTE (m_.MLoader.modfp);
				wh.panning		=m_.mmIO._mm_read_UBYTE (m_.MLoader.modfp);
				wh.relnote		=m_.mmIO._mm_read_SBYTE (m_.MLoader.modfp);
				wh.reserved		=(byte)m_.mmIO._mm_read_UBYTE (m_.MLoader.modfp);
				m_.mmIO._mm_read_str(wh.samplename, 22, m_.MLoader.modfp);

              /*printf("wav %d:%22.22s\n",u,wh.samplename);*/

				m_.MLoader.of.instruments[t].samples[u].samplename   = new String(wh.samplename,0,0,22);
				m_.MLoader.of.instruments[t].samples[u].length       =wh.length;
				m_.MLoader.of.instruments[t].samples[u].loopstart    =wh.loopstart;
				m_.MLoader.of.instruments[t].samples[u].loopend      =wh.loopstart+wh.looplength;
				m_.MLoader.of.instruments[t].samples[u].volume       =wh.volume;
				m_.MLoader.of.instruments[t].samples[u].c2spd		=wh.finetune+128;
				m_.MLoader.of.instruments[t].samples[u].transpose    =wh.relnote;
				m_.MLoader.of.instruments[t].samples[u].panning      =wh.panning;
				m_.MLoader.of.instruments[t].samples[u].seekpos		=next;

				if((wh.type&0x10) != 0){
					m_.MLoader.of.instruments[t].samples[u].length>>=1;
					m_.MLoader.of.instruments[t].samples[u].loopstart>>=1;
					m_.MLoader.of.instruments[t].samples[u].loopend>>=1;
				}

				next+=wh.length;

/*                              printf("Type %u\n",wh.type); */
/*				printf("Trans %d\n",wh.relnote); */

				m_.MLoader.of.instruments[t].samples[u].flags|=(m_.MDriver.SF_OWNPAN);
				if((wh.type&0x3) != 0) m_.MLoader.of.instruments[t].samples[u].flags|=(m_.MDriver.SF_LOOP);
				if((wh.type&0x2) != 0) m_.MLoader.of.instruments[t].samples[u].flags|=(m_.MDriver.SF_BIDI);

				if((wh.type&0x10) != 0) m_.MLoader.of.instruments[t].samples[u].flags|=(m_.MDriver.SF_16BITS);
				m_.MLoader.of.instruments[t].samples[u].flags|=(m_.MDriver.SF_DELTA);
				m_.MLoader.of.instruments[t].samples[u].flags|=(m_.MDriver.SF_SIGNED);
			}

			for(u=0;u<ih.numsmp;u++) m_.MLoader.of.instruments[inst_num].samples[u].seekpos+=m_.mmIO._mm_ftell(m_.MLoader.modfp);

			m_.mmIO._mm_fseek(m_.MLoader.modfp,next,m_.mmIO.SEEK_CUR);
		}

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
