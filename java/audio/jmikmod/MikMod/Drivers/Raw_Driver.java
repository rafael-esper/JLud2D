/*

Name:
DRV_RAW.C

Description:
Mikmod driver for output to a file called MUSIC.RAW

!! DO NOT CALL MD_UPDATE FROM A INTERRUPT IF YOU USE THIS DRIVER !!

Portability:

MSDOS:	BC(y)	Watcom(y)	DJGPP(y)
Win95:	BC(y)
Linux:	y

(y) - yes
(n) - no (not possible or not useful)
(?) - may be possible, but not tested

*/

package audio.jmikmod.MikMod.Drivers;

import java.io.IOException;

import persist.SimulatedRandomAccessFile;
import audio.jmikmod.MikMod.clDRIVER;
import audio.jmikmod.MikMod.clMain;

public class Raw_Driver extends clDRIVER
{
    public final int RAWBUFFERSIZE = 8192;

    protected SimulatedRandomAccessFile rawout;

    byte RAW_DMABUF[]; //[RAWBUFFERSIZE];
    

public Raw_Driver(clMain theMain)
//	: clDRIVER(theMain)
{
        super(theMain);
        int i;

        Name = new String("music.raw file");
	Version = new String("MikMod music.raw file output driver v1.10");

        rawout = null;
        RAW_DMABUF = new byte[RAWBUFFERSIZE];
        for(i=0;i<RAWBUFFERSIZE;i++)
            RAW_DMABUF[i] = 0;
}


public boolean IsPresent()
{
	return true;
}


public int Init()
{
        //if(!(rawout=fopen("music.raw","wb"))){
    try {
        if ((rawout = new SimulatedRandomAccessFile("music.raw")) == null) {
		m_.mmIO.myerr="Couldn't open output file 'music.raw'";
		return 0;
	}

	if(!m_.Virtch.VC_Init()){
                rawout.close();
                rawout = null;
		return 0;
	}

        return 1;
    }
    catch (IOException ioe1)
    {
        return 0;
    }
}



public void Exit()
{
    try {
	m_.Virtch.VC_Exit();
        rawout.close();
        rawout = null;
    }
    catch (IOException ioe1)
    {
    }
}


public void Update()
{
    try
    {
	m_.Virtch.VC_WriteBytes(RAW_DMABUF,RAWBUFFERSIZE);
        //fwrite(RAW_DMABUF,RAWBUFFERSIZE,1,rawout);
        rawout.write(RAW_DMABUF,0,RAWBUFFERSIZE);
    }
    catch (IOException ioe1)
    {
    }
}

public short SampleLoad(SimulatedRandomAccessFile fp,int length,int reppos,int repend,int flags)
{
	return m_.Virtch.VC_SampleLoad(fp,length,reppos,repend,flags);
}

public void SampleUnLoad (short handle)
{
	m_.Virtch.VC_SampleUnload(handle);
}

public void PlayStart()
{
	m_.Virtch.VC_PlayStart();
}

public void PlayStop()
{
	m_.Virtch.VC_PlayStop();
}

public void VoiceSetVolume(short voice,short vol)
{
	m_.Virtch.VC_VoiceSetVolume(voice, vol);
}

public void VoiceSetFrequency(short voice,int frq)
{
	m_.Virtch.VC_VoiceSetFrequency(voice,frq);
}

public void VoiceSetPanning(short voice,short pan)
{
	m_.Virtch.VC_VoiceSetPanning(voice,pan);
}

public void VoicePlay(short voice,short handle,int start,int size,int reppos,int repend,int flags)
{
	m_.Virtch.VC_VoicePlay(voice,handle,start,size,reppos,repend,flags);
}

}