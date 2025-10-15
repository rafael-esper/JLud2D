/*

Name:
DRV_WAV.C

Description:
Mikmod driver for output to a file called MUSIC.WAV

!! DO NOT CALL MD_UPDATE FROM A INTERRUPT IF YOU USE THIS DRIVER !!

*/

package audio.jmikmod.MikMod.Drivers;

import java.io.IOException;

import persist.SimulatedRandomAccessFile;
import audio.jmikmod.MikMod.clDRIVER;
import audio.jmikmod.MikMod.clMain;

public class Wav_Driver extends clDRIVER
{
    public final int BUFFERSIZE = 32768;

    protected SimulatedRandomAccessFile wavout;
    protected int dumpsize;

    byte audiobuffer[]; //[BUFFERSIZE];
    

public Wav_Driver(clMain theMain)
{
    super(theMain);
    int i;

    Name = new String("Disk writer (wav)");
    Version = new String("Wav disk writer (music.wav) v1.2");

    wavout = null;
    audiobuffer = new byte[BUFFERSIZE];
    for(i=0;i<BUFFERSIZE;i++)
       audiobuffer[i] = 0;
}

protected void PutHeader()
{
    try {
    wavout.seek(0);
    wavout.writeBytes("RIFF");
    m_.mmIO._mm_write_I_ULONG(dumpsize+36, wavout);
    wavout.writeBytes("WAVEfmt ");
    m_.mmIO._mm_write_I_ULONG(16, wavout);
    m_.mmIO._mm_write_I_UWORD(1, wavout);
    m_.mmIO._mm_write_I_UWORD(m_.MDriver.isStereo()?2:1,wavout);
    m_.mmIO._mm_write_I_ULONG(m_.MDriver.md_mixfreq,wavout);
    m_.mmIO._mm_write_I_ULONG(m_.MDriver.md_mixfreq*
                (m_.MDriver.isStereo()?2:1)*
	            (m_.MDriver.is16Bits()?2:1),
                wavout);
    m_.mmIO._mm_write_I_UWORD((m_.MDriver.is16Bits()?2:1)* 
	                  (m_.MDriver.isStereo()?2:1),wavout);
    m_.mmIO._mm_write_I_UWORD(m_.MDriver.is16Bits()?16:8,
            wavout);
    wavout.writeBytes("data");
    m_.mmIO._mm_write_I_ULONG(dumpsize, wavout);
    }
    catch (IOException ioe1)
    {
    }
}

public boolean IsPresent()
{
	return true;
}


public int Init()
{
        //if(!(rawout=fopen("music.raw","wb"))){
    try {
        if ((wavout = new SimulatedRandomAccessFile("music.wav")) == null) {
            m_.mmIO.myerr="Couldn't open output file 'music.wav'";
            return 0;
        }

        if(!m_.Virtch.VC_Init()){
            wavout.close();
            wavout = null;
            return 0;
        }

        dumpsize = 0;

        PutHeader();

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
        if (wavout != null)
        {
            PutHeader();
            wavout.close();
            wavout = null;
        }
    }
    catch (IOException ioe1)
    {
    }
}


public void Update()
{
    try
    {
        int num_bytes_written =
            m_.Virtch.VC_WriteBytes(audiobuffer,BUFFERSIZE);
        //fwrite(RAW_DMABUF,BUFFERSIZE,1,rawout);
        wavout.write(audiobuffer,0,num_bytes_written);
        dumpsize += num_bytes_written;
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
