/*

Name:
LOAD_S3M.C

Description:
Screamtracker (S3M) module loader

Portability:
All systems - all compilers (hopefully)

*/

/**************************************************************************
**************************************************************************/


//typedef S3MNOTE S3MTRACK[64];


package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;


class S3MNOTE{
    public short note;
    public short ins;
    public short vol;
    public short cmd;
    public short inf;
}

/* Raw S3M header struct: */

class S3MHEADER{
	public byte  songname[];
	public byte  t1a;
	public byte  type;
        public byte unused1[];
	public int ordnum;
	public int insnum;
	public int patnum;
	public int flags;
	public int tracker;
	public int fileformat;
	public byte  scrm[];
	public short mastervol;
	public short initspeed;
	public short inittempo;
	public short mastermult;
	public short ultraclick;
	public short pantable;
        public byte unused2[];
	public int special;
        public short channels[];

        public S3MHEADER()
        {
            songname = new byte[28];
            unused1 = new byte[2];
            scrm = new byte[4];
            unused2 = new byte[8];
            channels = new short[32];
        }
}

/* Raw S3M sampleinfo struct: */

class S3MSAMPLE{
	short type;
	byte  filename[];
	short memsegh;
	int memsegl;
	int length;
	int loopbeg;
	int loopend;
	short volume;
	short dsk;
	short pack;
	short flags;
	int c2spd;
        byte unused[];
	byte  sampname[];
        byte  scrs[];

        public S3MSAMPLE()
        {
            filename = new byte[12];
            unused = new byte[12];
            sampname = new byte[28];
            scrs = new byte[4];
        }
};


public class S3M_Loader extends clLOADER
{
        public final String S3M_Version="Screamtracker 3.xx";
    
	public S3MNOTE [] s3mbuf;        /* pointer to a complete S3M pattern */
	public int [] paraptr;         /* parapointer array (see S3M docs) */

        protected S3MHEADER mh;

        public short remap[]; //[32];

        public S3M_Loader(clMainBase theMain)
        {
                super(theMain);
            
            	mh = null;
                type = new String("S3M");
                version = new String("Portable S3M loader v0.2");

                remap = new short[32];

        }

public boolean Init()
{
    int i;
    
	s3mbuf=null;
	paraptr=null;

        //if(!(s3mbuf=(S3MNOTE *)m_.MLoader.MyMalloc(16*64*sizeof(S3MNOTE)))) return 0;
        s3mbuf = new S3MNOTE[16*64];

        for(i=0;i<16*64;i++)
            s3mbuf[i] = new S3MNOTE();
        //if(!(mh=(S3MHEADER *)m_.MLoader.MyCalloc(1,sizeof(S3MHEADER)))) return 0;

        mh = new S3MHEADER();

        mh.t1a = mh.type = mh.unused1[0] = mh.unused1[1] = (byte)0;
        mh.ordnum = mh.insnum = mh.patnum = mh.flags = mh.tracker = mh.fileformat = mh.special = 0;
        mh.mastervol = mh.initspeed = mh.inittempo = mh.mastermult =
            mh.ultraclick = mh.pantable = (short)0;

        for(i=0;i<28;i++)
            mh.songname[i] = 0;

        for(i=0;i<4;i++)
            mh.scrm[i] = 0;

        for(i=0;i<8;i++)
            mh.unused2[i] = 0;

        for(i=0;i<32;i++)
            mh.channels[i] = 0;



	return true;
}

public boolean Test()
{
	byte id[] = new byte[4];
	m_.mmIO._mm_fseek(m_.MLoader.modfp,0x2c,m_.mmIO.SEEK_SET);
        //if(!fread(id,4,1,m_.MLoader.modfp)) return 0;
        if (m_.MLoader.modfp.read(id,0,4) != 4) return false;
        //if(!memcmp(id,"SCRM",4)) return 1;
        if ( ((char)id[0] == 'S') && ((char)id[1] == 'C') && ((char)id[2] == 'R') && ((char)id[3] == 'M'))
            return true;
        return false;
        
}

public void Cleanup()
{
        if (s3mbuf != null)
            s3mbuf = null;
        if(paraptr!=null)
            paraptr = null;
        if (mh != null)
            mh = null;
}

public boolean S3M_ReadPattern()
{
        int row=0,flag,ch;
	//S3MNOTE *n;
	//S3MNOTE dummy;

	/* clear pattern data */

        //memset(s3mbuf,255,16*64*sizeof(S3MNOTE));
        {
            int i;
            for(i=0;i<16*64;i++)
            {
                s3mbuf[i].note = s3mbuf[i].ins =
                    s3mbuf[i].vol = s3mbuf[i].cmd
                    = s3mbuf[i].inf = 255;
            }
        }
	

	while(row<64){

		//flag=fgetc(m_.MLoader.modfp);
                flag=m_.MLoader.modfp.read();

                if(flag == -1){
			m_.mmIO.myerr="Error loading pattern";
			return false;
		}

		if(flag != 0){

			ch=flag&31;

			if(mh.channels[ch]<16){
                                //n=&s3mbuf[(64*remap[ch])+row];
                                if((flag&32) != 0){
                                    //n.note=fgetc(m_.MLoader.modfp);
                                    s3mbuf[(64*remap[ch])+row].note = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                                    //n.ins=fgetc(m_.MLoader.modfp);
                                    s3mbuf[(64*remap[ch])+row].ins = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                                }
        
                                if((flag&64) != 0){
                                    //n.vol=fgetc(m_.MLoader.modfp);
                                    s3mbuf[(64*remap[ch])+row].vol = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                                }
        
                                if((flag&128) != 0){
                                    //n.cmd=fgetc(m_.MLoader.modfp);
                                    //n.inf=fgetc(m_.MLoader.modfp);
                                    s3mbuf[(64*remap[ch])+row].cmd = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                                    s3mbuf[(64*remap[ch])+row].inf = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                                }
                            
			}
			else{
                                //n=&dummy;
                                for(int b=0 ;
                                    b < ( (((flag&32) != 0) ? 2 : 0)
                                    + (((flag&64) != 0) ? 1 : 0)
                                    + (((flag&128) != 0) ? 2 : 0) )
                                    ; b++)
                                {
                                    m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                                }
			}

		}
		else row++;
	}
	return true;

}


public short [] S3M_ConvertTrack(S3MNOTE [] tr, int offset)
{
	int t;

	short note,ins,vol,cmd,inf,lo,hi;

	m_.MUniTrk.UniReset();
	for(t=offset ; t < offset+64 ; t++){

		note=tr[t].note;
		ins=tr[t].ins;
		vol=tr[t].vol;
		cmd=tr[t].cmd;
		inf=tr[t].inf;
		lo=(short)(inf&0xf);
		hi=(short)(inf>>4);


                //if(ins!=0 && ins!=255){
                if(ins!=0 && ins!=255 && ins != (-1)){
			m_.MUniTrk.UniInstrument((short)(ins-1));
		}

                //if(note!=255){
                if ((note != 255) && (note != -1)) {
			if(note==254) m_.MUniTrk.UniPTEffect((short)0xc,(short)0);                       /* <- note off command */
			else m_.MUniTrk.UniNote((short)((((note&0xF0)>>4)*12)+(note&0xf)));        /* <- normal note */
		}

                //if(vol<255){
                if((vol<255)&&(vol != -1)){
			m_.MUniTrk.UniPTEffect((short)0xc,vol);
/*			m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MVOLUME); */
/*			m_.MUniTrk.UniWrite(vol); */
		}

		if(cmd!=255){
			switch(cmd){

				case 1:                 /* Axx set speed to xx */
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTA);
					m_.MUniTrk.UniWrite(inf);
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

				case 0xf:               /* Oxx set sampleoffset xx00h */
					m_.MUniTrk.UniPTEffect((short)0x9,(short)inf);
					break;

				case 0x11:              /* Qxy Retrig (+volumeslide) */
					m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTQ);
					m_.MUniTrk.UniWrite(inf);
					break;

				case 0x12:              /* Rxy tremolo speed x, depth y */
					m_.MUniTrk.UniPTEffect((short)0x6,(short)inf);
					break;

				case 0x13:              /* Sxx special commands */
					switch(hi){

						case 0: /* S0x set filter */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0x00|lo));
							break;

						case 1: /* S1x set glissando control */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0x30|lo));
							break;

						case 2: /* S2x set finetune */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0x50|lo));
							break;

						case 3: /* S3x set vibrato waveform */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0x40|lo));
							break;

						case 4: /* S4x set tremolo waveform */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0x70|lo));
							break;

						case 8: /* S8x set panning position */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0x80|lo));
							break;

						case 0xb:       /* SBx pattern loop */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0x60|lo));
							break;

						case 0xc:       /* SCx notecut */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0xC0|lo));
							break;

						case 0xd:       /* SDx notedelay */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0xD0|lo));
							break;

						case 0xe:       /* SDx patterndelay */
							m_.MUniTrk.UniPTEffect((short)0xe,(short)(0xE0|lo));
							break;
					}
					break;

				case 0x14:      /* Txx tempo */
					if(inf>0x20){
						m_.MUniTrk.UniWrite(m_.MUniTrk.UNI_S3MEFFECTT);
						m_.MUniTrk.UniWrite(inf);
					}
					break;

				case 0x18:      /* Xxx amiga command 8xx */
					m_.MUniTrk.UniPTEffect((short)0x8,(short)inf);
					break;
			}
		}

		m_.MUniTrk.UniNewline();
	}
	return m_.MUniTrk.UniDup();
}


public boolean Load()
{
        try {

        int t,u,track=0;
	//INSTRUMENT *d;
        //SAMPLE *q;
        int inst_num;
	short isused[] = new short[16];
	byte pan[] = new byte[32];

	/* try to read module header */

	m_.mmIO._mm_read_str(mh.songname,28,m_.MLoader.modfp);
	mh.t1a			=m_.mmIO._mm_read_SBYTE(m_.MLoader.modfp);
	mh.type		=m_.mmIO._mm_read_SBYTE(m_.MLoader.modfp);
	m_.mmIO._mm_read_SBYTES(mh.unused1,2,m_.MLoader.modfp);
	mh.ordnum		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.insnum		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.patnum		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.flags		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.tracker		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	mh.fileformat	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.mmIO._mm_read_str(mh.scrm,4,m_.MLoader.modfp);

	mh.mastervol	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.initspeed	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.inittempo	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.mastermult	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.ultraclick	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.pantable	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	m_.mmIO._mm_read_SBYTES(mh.unused2,8,m_.MLoader.modfp);
        mh.special		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
        m_.mmIO._mm_read_UBYTES2(mh.channels,32,m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {        
		m_.mmIO.myerr="Error loading header";
		return false;
	}

	/* set module variables */

	m_.MLoader.of.modtype=new String(S3M_Version);
	m_.MLoader.of.songname=m_.MLoader.DupStr(mh.songname,28);    /* make a cstr m_.MLoader.of songname */
	m_.MLoader.of.numpat=(short)mh.patnum;
	m_.MLoader.of.numins=(short)mh.insnum;
	m_.MLoader.of.initspeed=mh.initspeed;
	m_.MLoader.of.inittempo=mh.inittempo;

	/* count the number m_.MLoader.of channels used */

	m_.MLoader.of.numchn=0;

/*      for(t=0;t<32;t++) printf("%2.2x ",mh.channels[t]);
*/
	for(t=0;t<32;t++) remap[t]=0;
	for(t=0;t<16;t++) isused[t]=0;

	/* set a flag for each channel (1 out m_.MLoader.of m_.MLoader.of 16) thats being used: */

	for(t=0;t<32;t++){
		if(mh.channels[t]<16){
			isused[mh.channels[t]]=1;
		}
	}

	/* give each m_.MLoader.of them a different number */

	for(t=0;t<16;t++){
		if(isused[t] != 0){
			isused[t]=m_.MLoader.of.numchn;
			m_.MLoader.of.numchn++;
		}
	}

	/* build the remap array */

	for(t=0;t<32;t++){
		if(mh.channels[t]<16){
			remap[t]=isused[mh.channels[t]];
		}
	}

	/* set panning positions */

	for(t=0;t<32;t++){
		if(mh.channels[t]<16){
			if(mh.channels[t]<8){
				m_.MLoader.of.panning[remap[t]]=0x30;
			}
			else{
				m_.MLoader.of.panning[remap[t]]=0xc0;
			}
		}
	}

	m_.MLoader.of.numtrk=(short)(m_.MLoader.of.numpat*m_.MLoader.of.numchn);

/*      printf("Uses %d channels\n",m_.MLoader.of.numchn);
*/
	/* read the order data */

	m_.mmIO._mm_read_UBYTES2(m_.MLoader.of.positions,mh.ordnum,m_.MLoader.modfp);

	m_.MLoader.of.numpos=0;
	for(t=0;t<mh.ordnum;t++){
		m_.MLoader.of.positions[m_.MLoader.of.numpos]=m_.MLoader.of.positions[t];
                if(m_.MLoader.of.positions[t]<254)
                    m_.MLoader.of.numpos++;
	}

        //if((paraptr=(int *)m_.MLoader.MyMalloc((m_.MLoader.of.numins+m_.MLoader.of.numpat)*sizeof(int)))==null) return 0;
        paraptr = new int [m_.MLoader.of.numins+m_.MLoader.of.numpat];

	/* read the instrument+pattern parapointers */

	m_.mmIO._mm_read_I_UWORDS2(paraptr,m_.MLoader.of.numins+m_.MLoader.of.numpat,m_.MLoader.modfp);

/*      printf("pantab %d\n",mh.pantable);
*/
	if(mh.pantable==252){

		/* read the panning table */

		m_.mmIO._mm_read_SBYTES(pan,32,m_.MLoader.modfp);

		/* set panning positions according to panning table (new for st3.2) */

		for(t=0;t<32;t++){
			if(((pan[t]&0x20) != 0) && mh.channels[t]<16){
				m_.MLoader.of.panning[remap[t]] = (short) ((pan[t]&0xf)<<4);
			}
		}
	}

	/* now is a good time to check if the header was too short :) */

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {        
		m_.mmIO.myerr="Error loading header";
		return false;
	}

	if(!m_.MLoader.AllocInstruments()) return false;

        //d=m_.MLoader.of.instruments;
        inst_num = 0;

	for(t=0;t<m_.MLoader.of.numins;t++){
            S3MSAMPLE s = new S3MSAMPLE();

		m_.MLoader.of.instruments[inst_num].numsmp=1;
		if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[inst_num]))) return false;
		//q=m_.MLoader.of.instruments[inst_num].samples;

		/* seek to instrument position */

		m_.mmIO._mm_fseek(m_.MLoader.modfp,((int)paraptr[t])<<4,m_.mmIO.SEEK_SET);

		/* and load sample info */

		s.type		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.mmIO._mm_read_str(s.filename,12,m_.MLoader.modfp);
		s.memsegh	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.memsegl	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		s.length	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.loopbeg	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.loopend	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.volume	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.dsk 		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.pack		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.flags		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.c2spd		=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		m_.mmIO._mm_read_SBYTES(s.unused,12,m_.MLoader.modfp);
		m_.mmIO._mm_read_str(s.sampname,28,m_.MLoader.modfp);
		m_.mmIO._mm_read_str(s.scrs,4,m_.MLoader.modfp);

                //if(feof(m_.MLoader.modfp)){
                if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
			m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
			return false;
		}

		m_.MLoader.of.instruments[inst_num].insname=m_.MLoader.DupStr(s.sampname,28);
		m_.MLoader.of.instruments[inst_num].samples[0].c2spd=s.c2spd;
		m_.MLoader.of.instruments[inst_num].samples[0].length=s.length;
		m_.MLoader.of.instruments[inst_num].samples[0].loopstart=s.loopbeg;
		m_.MLoader.of.instruments[inst_num].samples[0].loopend=s.loopend;
		m_.MLoader.of.instruments[inst_num].samples[0].volume=s.volume;
		m_.MLoader.of.instruments[inst_num].samples[0].seekpos=(((int)s.memsegh)<<16|s.memsegl)<<4;

		m_.MLoader.of.instruments[inst_num].samples[0].flags=0;

                if((s.flags&1) != 0)
                    m_.MLoader.of.instruments[inst_num].samples[0].flags|=(m_.MDriver.SF_LOOP);
                if((s.flags&4) != 0)
                    m_.MLoader.of.instruments[inst_num].samples[0].flags|=(m_.MDriver.SF_16BITS);
                if(mh.fileformat==1)
                    m_.MLoader.of.instruments[inst_num].samples[0].flags|=(m_.MDriver.SF_SIGNED);

		/* DON'T load sample if it doesn't have the SCRS tag */

                //if(memcmp(s.scrs,"SCRS",4)!=0) m_.MLoader.of.instruments[inst_num].samples[0].length=0;
                if (!( ((char)s.scrs[0] == 'S') && ((char)s.scrs[1] == 'C') &&
                       ((char)s.scrs[2] == 'R') && ((char)s.scrs[3] == 'S')))
                {
                    m_.MLoader.of.instruments[inst_num].samples[0].length = 0;
                }

/*              printf("%s\n",m_.MLoader.of.instruments[inst_num].insname);
*/
                //d++;
                inst_num++;
	}

	if(!m_.MLoader.AllocTracks()) return false;
	if(!m_.MLoader.AllocPatterns()) return false;

	for(t=0;t<m_.MLoader.of.numpat;t++){

		/* seek to pattern position ( + 2 skip pattern length ) */

		m_.mmIO._mm_fseek(m_.MLoader.modfp,(((int)paraptr[m_.MLoader.of.numins+t])<<4)+2,m_.mmIO.SEEK_SET);

		if(!S3M_ReadPattern()) return false;

		for(u=0;u<m_.MLoader.of.numchn;u++){
			if((m_.MLoader.of.tracks[track++]=S3M_ConvertTrack(s3mbuf, u*64)) == null) return false;
		}
	}

	return true;

        }
	catch (IOException ioe1)
	{
		return false;
	}
}


        
}
