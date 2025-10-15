/*

Name:
LOAD_669.C

Description:

669 module Loader - Version 0.21
Updated to current portability levels by Steve McIntyre 
		<stevem@chiark.greenend.org.uk>
December 1996

Unreliable and doesn't work fully yet - plays too fast, sounds very bad...

Portability:
All systems - all compilers (hopefully)

*/


package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;


/* Raw 669 header struct: */

class S69HEADER{
	int marker;
	byte  message[];
	short nos;
	short nop;
	short looporder;
	short orders[];
	short tempos[];
        short breaks[];

        public S69HEADER()
        {
            message = new byte[108];
            orders = new short[0x80];
            tempos = new short[0x80];
            breaks = new short[0x80];
            
        }
}

/* Raw 669 Note struct */

class S69NOTE{
	short a,b,c;
}


class S69SAMPLE{
	byte  filename[];
	int  length;
	int  loopbeg;
        int  loopend;

        public S69SAMPLE()
        {
            filename = new byte[13];
        }
}


public class S69_Loader extends clLOADER
{
	protected S69NOTE [] s69pat;
	protected S69HEADER mh;

        public char remap[];

        public final String S69_Version[]={
                "669",
                "Extended 669"
        };


public S69_Loader(clMainBase theMain)
{
        super(theMain);

        s69pat = null;
	mh = null;
	type = new String("669");
        version = new String("669 loader v0.21 - last updated 12/96 SAM");

        remap = new char[32];
}

public boolean Test()
{
    byte id[] = new byte[2];
m_.mmIO._mm_fseek(m_.MLoader.modfp,0,m_.mmIO.SEEK_SET);
	//if(!fread(id,2,1,m_.MLoader.modfp)) return 0;
	if (m_.MLoader.modfp.read(id,0,2) != 2) return false;
	if (((char)id[0] == 'i') && ((char)id[1] == 'f'))
	    return true;
	if (((char)id[0] == 'J') && ((char)id[1] == 'N'))
	    return true;

	return false;
}



public boolean Init()
{
        int i;

        mh=null;
	s69pat=null;

        // if(!(s69pat=(S69NOTE *)m_.MLoader.MyMalloc(64*8*sizeof(S69NOTE)))) return 0;
        s69pat = new S69NOTE[64*8];
        for(i=0;i<64*8;i++)
            s69pat[i] = new S69NOTE();
        //if(!(mh=(S69HEADER *)m_.MLoader.MyCalloc(1,sizeof(S69HEADER)))) return 0;
        mh = new S69HEADER();
        mh.marker = mh.nos = mh.nop = mh.looporder = 0;
        for(i=0;i<0x80;i++)
            mh.orders[i] = mh.tempos[i] = mh.breaks[i] = 0;
        for(i=0;i<108;i++)
            mh.message[i] = 0;

	return true;
}



public void Cleanup()
{
    if (s69pat != null) s69pat = null;
    if (mh != null) mh = null;
}




public boolean S69_LoadPatterns()
{
	int u,t,s,tracks=0,q;
	short note,inst,vol,a,b,c;

	if(!m_.MLoader.AllocPatterns()) return false;
	if(!m_.MLoader.AllocTracks()) return false;

	for(t=0;t<m_.MLoader.of.numpat;t++){

		m_.MLoader.of.pattrows[t]=mh.breaks[t]+1;

		/* Load the pattern into the temp buffer
		   and convert it into the 3-byte format */

                {
                    int i;
                    for(i=0;i<64*8;i++)
                    {
                        s69pat[i].a = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                        s69pat[i].b = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                        s69pat[i].c = m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
                    }
                }

		for(s=0;s<8;s++){

			m_.MUniTrk.UniReset();

			m_.MUniTrk.UniPTEffect((short)0xf,(short)78);
			m_.MUniTrk.UniPTEffect((short)0xf,(short)3);

			for(q=0;q<64;q++){

				a=s69pat[(q*8)+s].a;
				b=s69pat[(q*8)+s].b;
				c=s69pat[(q*8)+s].c;

				note=(short)(a>>2);
				inst=(short)(((a&0x3)<<4)|((b&0xf0)>>4));
				vol=(short)(b&0xf);

				if(note<0x3e){
					m_.MUniTrk.UniInstrument(inst);
					m_.MUniTrk.UniNote((short)(note+24));
				}

				if(note<0x3f){
					m_.MUniTrk.UniPTEffect((short)0xc,(short)(vol<<2));
				}

				m_.MUniTrk.UniNewline();
			}
			if((m_.MLoader.of.tracks[tracks++]=m_.MUniTrk.UniDup()) == null ) return false;
		}
	}
	return true;
}


public boolean Load()
{
    try {
	int t,u,track=0;
/*	UNIMOD of; /* testing... */
	S69SAMPLE s = new S69SAMPLE();
	int temp_loopend;
	//INSTRUMENT *d;
        //SAMPLE *q;
        int inst_num;

	/* try to read module header */

        byte id[] = new byte[2];
	m_.mmIO._mm_fseek(m_.MLoader.modfp,0,m_.mmIO.SEEK_SET);
        //if(!fread(id,2,1,m_.MLoader.modfp)) return 0;
        if (m_.MLoader.modfp.read(id,0,2) != 2) return false;
	m_.mmIO._mm_rewind(m_.MLoader.modfp);

	mh.marker		=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.mmIO._mm_read_str(mh.message,108,m_.MLoader.modfp);
	mh.nos			=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.nop			=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	mh.looporder		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	for(t=0;t<128;t++){
		mh.orders[t]=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	}
	for(t=0;t<128;t++){
		mh.tempos[t]=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	}
	for(t=0;t<128;t++){
		mh.breaks[t]=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	}

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {        
                m_.mmIO.myerr="Error loading header";
                return false;
        }

	/* set module variables */

	m_.MLoader.of.initspeed=6;
	m_.MLoader.of.inittempo=125;
        m_.MLoader.of.songname=m_.MLoader.DupStr(mh.message,108);

        if (((char)id[0] == 'J') && ((char)id[1] == 'N'))        
        //if(memcmp(id,"JN",2))
		m_.MLoader.of.modtype=new String(S69_Version[1]);
	else
		m_.MLoader.of.modtype=new String(S69_Version[0]);
	m_.MLoader.of.numchn= 8;
	m_.MLoader.of.numpat= mh.nop;
	m_.MLoader.of.numins= mh.nos;
	m_.MLoader.of.numtrk= (short)(m_.MLoader.of.numchn * m_.MLoader.of.numpat);

        //memcpy(m_.MLoader.of.positions,mh.orders,0x80);
        for(t=0;t<0x80;t++)
            m_.MLoader.of.positions[t] = mh.orders[t];
            

	for(t=0;t<128;t++){
		if(m_.MLoader.of.positions[t]==0xff) break;
	}
	m_.MLoader.of.numpos=(short)t;

	if(!m_.MLoader.AllocInstruments()) return false;

        inst_num = 0;

	for(t=0;t<m_.MLoader.of.numins;t++){

		m_.MLoader.of.instruments[inst_num].numsmp=1;
                if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[inst_num])))
                    return false;

		/* try to read sample info */

	        m_.mmIO._mm_read_str(s.filename,13,m_.MLoader.modfp);

                m_.MLoader.of.instruments[inst_num].samples[0].seekpos = 0;                
                m_.MLoader.of.instruments[inst_num].samples[0].c2spd = 8363;
                m_.MLoader.of.instruments[inst_num].samples[0].length = m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.loopbeg=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		temp_loopend=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
                m_.MLoader.of.instruments[inst_num].samples[0].loopend =
                    (temp_loopend < m_.MLoader.of.instruments[inst_num].samples[0].length)
                    ? temp_loopend
                    : m_.MLoader.of.instruments[inst_num].samples[0].length;

                m_.MLoader.of.instruments[inst_num].samples[0].flags =
                    ((int)s.loopbeg < (int)m_.MLoader.of.instruments[inst_num].samples[0].loopend) ? (m_.MDriver.SF_LOOP) : 0;

                m_.MLoader.of.instruments[inst_num].samples[0].volume = 64;

                inst_num++;
	}

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {        
                m_.mmIO.myerr="Error loading samples";
                return false;
        }

	if(!S69_LoadPatterns()) return false;

        return true;
    }
    catch (IOException ioe1)
    {
        return false;
    }
}





}
