/*

Name:
LOAD_ULT.C

Description:
Ultratracker (ULT) module loader

Portability:
All systems - all compilers (hopefully)

*/

package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;


class ULTEVENT{
	short note,sample,eff,dat1,dat2;
}

/* Raw ULT header struct: */

class ULTHEADER{
	byte  id[];
	byte  songtitle[];
        byte reserved;

        public ULTHEADER()
        {
            id = new byte[15];
            songtitle = new byte[32];
        }
}


/* Raw ULT sampleinfo struct: */

class ULTSAMPLE{
	byte  samplename[];
	byte  dosname[];
	int  loopstart;
	int  loopend;
	int  sizestart;
	int  sizeend;
	short volume;
	short flags;
        short  finetune;

        public ULTSAMPLE()
        {
            samplename = new byte[32];
            dosname = new byte[12];
        }
}


public class ULT_Loader extends clLOADER
{
        public final int ULTS_16BITS     = 4;
        public final int ULTS_LOOP       = 8;
        public final int ULTS_REVERSE    = 16;


    
        public final String ULT_Version[]={
                "Ultra Tracker V1.3",
                "Ultra Tracker V1.4",
                "Ultra Tracker V1.5",
                "Ultra Tracker V1.6"
        };

        public ULTEVENT ev;



public ULT_Loader(clMainBase theMain)
{
        super(theMain);
    
	type = new String("ULT");
        version = new String("Portable ULT loader v0.1");

        ev = new ULTEVENT();
}


public boolean Test()
{
    byte id[] = new byte[15];
        byte should_be[] = new byte[20]; //"MAS_UTrack_V00";
        String szShould_be = "MAS_UTrack_V00";
        int a;

        szShould_be.getBytes(0, 14, should_be, 0);
        
        //if(!fread(id,15,1,m_.MLoader.modfp)) return 0;
        if (m_.MLoader.modfp.read(id,0,15) != 15) return false;
        for(a=0;a<14;a++)
            if (id[a] != should_be[a])
                return false;
        return true;
        //return(!strncmp(id,"MAS_UTrack_V00",14));
}


public boolean Init()
{
	return true;
}


public void Cleanup()
{
}


public int ReadUltEvent(ULTEVENT event)
{
    short flag;
        byte rep [] = new byte[2];
        rep[0] = 1;
	flag=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

	if(flag==0xfc){
		//fread(&rep,1,1,m_.MLoader.modfp);
                m_.MLoader.modfp.read(rep,0,1);
                event.note	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	}
	else{
		event.note=flag;
	}

	event.sample	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	event.eff		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	event.dat1		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	event.dat2		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

        //return rep[0];
        return (rep[0]<0) ? ((int)rep[0]+256) : rep[0];
}




public boolean Load()
{
    try {
	int t,u,tracks=0;
        //INSTRUMENT *d;
        int inst_num;        
	//SAMPLE *q;
	ULTSAMPLE s = new ULTSAMPLE();
	ULTHEADER mh = new ULTHEADER();
        short nos,noc,nop;


	/* try to read module header */

	m_.mmIO._mm_read_str(mh.id,15,m_.MLoader.modfp);
	m_.mmIO._mm_read_str(mh.songtitle,32,m_.MLoader.modfp);
	mh.reserved=(byte)m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

	//if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
                m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	if(mh.id[14]<'1' || mh.id[14]>'4') {
		System.out.print("This version is not yet supported\n");
		return false;
	}

	m_.MLoader.of.modtype=new String(ULT_Version[mh.id[14]-'1']);
	m_.MLoader.of.initspeed=6;
	m_.MLoader.of.inittempo=125;

	/* read songtext */

	if(!m_.MLoader.ReadComment((short)(mh.reserved*32))) return false;

	nos=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
		m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	m_.MLoader.of.songname=m_.MLoader.DupStr(mh.songtitle,32);
	m_.MLoader.of.numins=nos;

        if(!m_.MLoader.AllocInstruments())
            return false;

        //d=m_.MLoader.of.instruments;
        inst_num=0;

	for(t=0;t<nos;t++){

		m_.MLoader.of.instruments[inst_num].numsmp=1;
                if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[inst_num])))
                    return false;
		//q=m_.MLoader.of.instruments[inst_num].samples;

		/* try to read sample info */

		m_.mmIO._mm_read_str(s.samplename,32,m_.MLoader.modfp);
		m_.mmIO._mm_read_str(s.dosname,12,m_.MLoader.modfp);
		s.loopstart	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.loopend	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.sizestart	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.sizeend	=m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
		s.volume	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.flags		=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		s.finetune	=m_.mmIO._mm_read_I_SWORD(m_.MLoader.modfp);

                //if(feof(m_.MLoader.modfp)){
                if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
			m_.mmIO.myerr=m_.ERROR_LOADING_SAMPLEINFO;
			return false;
		}

		m_.MLoader.of.instruments[inst_num].insname=m_.MLoader.DupStr(s.samplename,32);

		m_.MLoader.of.instruments[inst_num].samples[0].seekpos=0;

		m_.MLoader.of.instruments[inst_num].samples[0].c2spd=8363;

		if(mh.id[14]>='4'){
			m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);	/* read 1.6 extra info(??) word */
			m_.MLoader.of.instruments[inst_num].samples[0].c2spd=s.finetune;
		}

		m_.MLoader.of.instruments[inst_num].samples[0].length = s.sizeend-s.sizestart;
		m_.MLoader.of.instruments[inst_num].samples[0].volume = (short)(s.volume>>2);
		m_.MLoader.of.instruments[inst_num].samples[0].loopstart = s.loopstart;
		m_.MLoader.of.instruments[inst_num].samples[0].loopend = s.loopend;

		m_.MLoader.of.instruments[inst_num].samples[0].flags = (m_.MDriver.SF_SIGNED);

                if((s.flags&ULTS_LOOP) != 0)
                {
			m_.MLoader.of.instruments[inst_num].samples[0].flags |= (m_.MDriver.SF_LOOP);
		}

                if((s.flags&ULTS_16BITS) != 0)
                {
			m_.MLoader.of.instruments[inst_num].samples[0].flags |= (m_.MDriver.SF_16BITS);
			m_.MLoader.of.instruments[inst_num].samples[0].loopstart >>= 1;
			m_.MLoader.of.instruments[inst_num].samples[0].loopend >>= 1;
		}

/*      printf("Sample %d %s length %ld\n",t,m_.MLoader.of.instruments[inst_num].samplename,m_.MLoader.of.instruments[inst_num].length); */
                //d++;
                inst_num++;
	}

	m_.mmIO._mm_read_UBYTES2(m_.MLoader.of.positions,256,m_.MLoader.modfp);

	for(t=0;t<256;t++){
		if(m_.MLoader.of.positions[t]==255) break;
	}
	m_.MLoader.of.numpos=(short)t;

	noc=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	nop=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

	m_.MLoader.of.numchn=(short)(noc+1);
	m_.MLoader.of.numpat=(short)(nop+1);
	m_.MLoader.of.numtrk=(short)(m_.MLoader.of.numchn*m_.MLoader.of.numpat);

	if(!m_.MLoader.AllocTracks()) return false;
	if(!m_.MLoader.AllocPatterns()) return false;

	for(u=0;u<m_.MLoader.of.numchn;u++){
		for(t=0;t<m_.MLoader.of.numpat;t++){
			m_.MLoader.of.patterns[(t*m_.MLoader.of.numchn)+u]=(short)(tracks++);
		}
	}

	/* read pan position table for v1.5 and higher */

	if(mh.id[14]>='3'){
            for(t=0;t<m_.MLoader.of.numchn;t++)
                m_.MLoader.of.panning[t]=(short)(m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp)<<4);
	}


	for(t=0;t<m_.MLoader.of.numtrk;t++){
		int rep,s_,done;

		m_.MUniTrk.UniReset();
		done=0;

		while(done<64){

			rep=ReadUltEvent(ev);

                        //if(feof(m_.MLoader.modfp)){
                        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
				m_.mmIO.myerr=m_.ERROR_LOADING_TRACK;
				return false;
			}

/*                      printf("rep %d: n %d i %d e %x d1 %d d2 %d \n",rep,ev.note,ev.sample,ev.eff,ev.dat1,ev.dat2); */


			for(s_=0;s_<rep;s_++){
				short eff;


				if(ev.sample != 0){
					m_.MUniTrk.UniInstrument((short)(ev.sample-1));
				}

				if(ev.note != 0){
					m_.MUniTrk.UniNote((short)(ev.note+23));
				}

				eff=(short)(ev.eff>>4);


				/*
					ULT panning effect fixed by Alexander Kerkhove :
				*/


                                if (eff==0xc)
                                    m_.MUniTrk.UniPTEffect(eff,(short)(ev.dat2>>2));
                                else if (eff==0xb)
                                    m_.MUniTrk.UniPTEffect((short)8,(short)(ev.dat2*0xf));
                                else
                                    m_.MUniTrk.UniPTEffect(eff,ev.dat2);

				eff=(short)(ev.eff&0xf);

                                if (eff==0xc)
                                    m_.MUniTrk.UniPTEffect(eff,(short)(ev.dat1>>2));
                                else if (eff==0xb)
                                    m_.MUniTrk.UniPTEffect((short)8,(short)(ev.dat1*0xf));
                                else
                                    m_.MUniTrk.UniPTEffect(eff,ev.dat1);

				m_.MUniTrk.UniNewline();
				done++;
			}
		}
/*              printf("----------------"); */

                if((m_.MLoader.of.tracks[t]=m_.MUniTrk.UniDup()) == null)
                    return false;
	}

/*      printf("%d channels %d patterns\n",m_.MLoader.of.numchn,m_.MLoader.of.numpat); */
/*      printf("Song %32.32s: There's %d samples\n",mh.songtitle,nos); */
        return true;

    }
    catch (IOException ioe1)
    {
        return false;
    }
}



        
}
