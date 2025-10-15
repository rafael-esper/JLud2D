/*

Name:
MDRIVER.C

Description:
These routines are used to access the available soundcard drivers.

Portability:
All systems - all compilers

*/

package audio.jmikmod.MikMod.MDriver;

import java.io.*;

import persist.SimulatedRandomAccessFile;

import audio.jmikmod.MikMod.*;


public class clMDriver extends clMDriverBase
{

    	public clMain m_;

        
	public clDRIVER drivers[]; //[6];
	public int num_drivers;

	public int md_device;
	public int md_mixfreq;
	public short md_mode;
        public int md_dmabufsize;
	public short md_numchn;
	public short md_bpm;
	

	protected SimulatedRandomAccessFile sl_fp;
	protected short sl_old;
	protected short sl_infmt;
	protected short sl_outfmt;
	protected short sl_buffer[];  //[1024];

	protected boolean isplaying;


public void dummyplay()
{
}

public clMDriver(clMain theMain)
{
        int i;

        drivers = new clDRIVER[6];
        sl_buffer = new short[1024];

        m_ = theMain;
    
	md_device = 0;
	md_mixfreq = 44100;
	md_mode = 0;
	md_dmabufsize = 8192;
	md_numchn = 0;
	md_bpm = 125;

	//firstdriver = NULL;
	num_drivers = 0;


	sl_fp = null;
	sl_old = 0;
	sl_infmt = 0;
	sl_outfmt = 0;
        //memset(sl_buffer, 0, sizeof(sl_buffer));
        for(i=0;i<1024;i++)
            sl_buffer[i] = 0;
        
	isplaying = false;
}

public void tickhandler()
{
	m_.MPlayer.MP_HandleTick();    /* play 1 tick of the module */
	m_.MDriver.MD_SetBPM(m_.MPlayer.mp_bpm);
}



public void SL_Init(SimulatedRandomAccessFile fp,short infmt,short outfmt)
{
	sl_old=0;
	sl_fp=fp;
	sl_infmt=infmt;
	sl_outfmt=outfmt;
}


public void SL_Exit()
{
}


public void SL_Load(byte [] buffer,int offset, int length)
{
	short stodo;
        int t;
        int out_index=offset;

	/* compute number of samples to load */
	if((sl_outfmt & SF_16BITS) != 0) length>>=1;

	while(length != 0){

		stodo=(short)((length<1024) ? length : 1024);

                if((sl_infmt&SF_16BITS) != 0){
                        if ((sl_infmt & SF_BIG_ENDIAN) != 0)
                            m_.mmIO._mm_read_M_SWORDS(sl_buffer, stodo, sl_fp);
                        else
                            m_.mmIO._mm_read_I_SWORDS(sl_buffer, stodo, sl_fp);
		}
		else{
			/*byte *s;
			short *d;

			fread(sl_buffer,sizeof(byte),stodo,sl_fp);

			s=(byte *)sl_buffer;
			d=sl_buffer;
			s+=stodo;
			d+=stodo;

                        for(t=0;t<stodo;t++){
				s--;
				d--;
                                *d=(*s)<<8;
                        }  */

                        byte byte_buffer[] = new byte [stodo];
                        sl_fp.read(byte_buffer,0,stodo);
                        for(t=0;t<stodo;t++)
                        {
                            sl_buffer[t] = (short)((byte_buffer[t]<<8));
                        }
                        byte_buffer = null;
		}

		if((sl_infmt & SF_DELTA) != 0){
			for(t=0;t<stodo;t++){
				sl_buffer[t]+=sl_old;
				sl_old=sl_buffer[t];
			}
		}

                if(((sl_infmt^sl_outfmt) & SF_SIGNED) != 0){
			for(t=0;t<stodo;t++){
				sl_buffer[t]^=0x8000;
			}
		}

		if((sl_outfmt & SF_16BITS) != 0){
                    for(t=0;t<stodo;t++)
                    {
                        buffer[out_index++] = (byte)(sl_buffer[t]&0xFF);
                        buffer[out_index++] = (byte)((sl_buffer[t]>>8)&0xFF);
                    }
		}
		else{
                    for(t=0;t<stodo;t++)
                        buffer[out_index++]=(byte)(sl_buffer[t]>>8);
		}

		length-=stodo;
	}
}


public void MD_InfoDriver()
{
	int t;
	//clDRIVER l;

	/* list all registered devicedrivers: */

        for (t=0;t<num_drivers;t++)
                System.out.println((t+1) + ". " + drivers[num_drivers-1-t].Version);
		//printf("%d. %s\n",t+1,(const char *)(*drivers[num_drivers-1-t].Version));
	//for(t=1,l=firstdriver; l!=NULL; l=l.next, t++){
	//	printf("%d. %s\n",t,l.Version);
}


public void MD_RegisterDriver(clDRIVER drv)
{
	drivers[num_drivers] = drv;
	num_drivers++;

	/*if(firstdriver == NULL){
		firstdriver = drv;
		drv.next = NULL;
	}
	else{
		drv.next = firstdriver;
		firstdriver = drv;
	}*/
}


public short MD_SampleLoad(SimulatedRandomAccessFile fp,int size,int reppos,int repend,int flags)
{
	short result=drivers[num_drivers-md_device].SampleLoad(fp,size,reppos,repend,flags);
	SL_Exit();
	return result;
}


public void MD_SampleUnLoad(short handle)
{
	drivers[num_drivers-md_device].SampleUnLoad(handle);
}

public void MD_PatternChange()
{
	drivers[num_drivers-md_device].PatternChange();
}

public void MD_Mute()
{
	drivers[num_drivers-md_device].Mute();
}

public void MD_UnMute()
{
	drivers[num_drivers-md_device].UnMute();
}

public void MD_BlankFunction()
{
}

public boolean MD_Init()
{
	int t;

	/* if md_device==0, try to find a device number */

	if(md_device==0){

		
		for(t=num_drivers-1; t >= 0; t--){
			//md_driver=drivers[t];
			if(drivers[t].IsPresent()) break;
		}

		if(t == -1){
			m_.mmIO.myerr="You don't have any of the supported sound-devices";
			return false;
		}

		md_device=num_drivers-t;
	}

	/* if n>0 use that driver */

	//md_driver = drivers[num_drivers-md_device];

	if(md_device > num_drivers){
		m_.mmIO.myerr="Device number out of range";
		return false;
	}

	return (drivers[num_drivers-md_device].Init() != 0);
}


public void MD_Exit()
{
	drivers[num_drivers-md_device].Exit();
}


public void MD_PlayStart()
{
	/* safety valve, prevents entering
	   playstart twice: */

	if(isplaying) return;
	drivers[num_drivers-md_device].PlayStart();
	isplaying=true;
}


public void MD_PlayStop()
{
	/* safety valve, prevents calling playStop when playstart
	   hasn't been called: */

	if(isplaying){
		isplaying=false;
		drivers[num_drivers-md_device].PlayStop();
	}
}


public void MD_SetBPM(short bpm)
{
    if (bpm < 0)
        bpm += ((-bpm/256)+1)*256;
    md_bpm=(short)(bpm%256);
}



public void MD_Update()
{
	if(isplaying) drivers[num_drivers-md_device].Update();
}

public void MD_VoiceSetVolume(short voice,short vol)
{
	drivers[num_drivers-md_device].VoiceSetVolume(voice,vol);
}


public void MD_VoiceSetFrequency(short voice,int frq)
{
	drivers[num_drivers-md_device].VoiceSetFrequency(voice,frq);
}


public void MD_VoiceSetPanning(short voice,short pan)
{
	drivers[num_drivers-md_device].VoiceSetPanning(voice,pan);
}


public void MD_VoicePlay(short voice,short handle,int start,int size,int reppos,int repend,int flags)
{
	drivers[num_drivers-md_device].VoicePlay(voice,handle,start,size,reppos,repend,flags);
}

public clDRIVER GetActiveDriver()
{
    return drivers[num_drivers-md_device];
}

public boolean isStereo()
{
    return ((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0);
}

public boolean is16Bits()
{
    return ((m_.MDriver.md_mode & m_.DMODE_16BITS) != 0);
}

}
