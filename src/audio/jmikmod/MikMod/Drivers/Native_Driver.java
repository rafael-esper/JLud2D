/*

Name:
DRV_VOX.C

Description:
Mikmod driver for output on linux and FreeBSD Open Sound System (OSS)
(/dev/dsp) 

Portability:  VoxWare/SS/OSS land. Linux, FreeBSD (NetBSD & SCO?)

New fragment configuration code done by Rao:
============================================

You can use the environment variables 'MM_FRAGSIZE' and 'MM_NUMFRAGS' to 
override the default size & number of audio buffer fragments. If you 
experience crackles & pops, try experimenting with these values.

Read experimental.txt within the VoxWare package for information on these 
options. They are _VERY_ important with relation to sound popping and smooth
playback.                                                        

In general, the slower your system, the higher these values need to be. 

MM_NUMFRAGS is within the range 2 to 255 (decimal)

MM_FRAGSIZE is is within the range 7 to 17 (dec). The requested fragment size 
will be 2^MM_FRAGSIZE

*/

package audio.jmikmod.MikMod.Drivers;

import persist.SimulatedRandomAccessFile;
import audio.jmikmod.MikMod.clDRIVER;
import audio.jmikmod.MikMod.clMain;

public class Native_Driver extends clDRIVER
{

static {
    System.loadLibrary("jmikmod_drv");
}
    
    protected int sndfd;
    protected int fragmentsize;
    protected byte audiobuffer[];

    protected final int DEFAULT_FRAGSIZE = 17;
    protected final int DEFAULT_NUMFRAGS = 2;

native int sysCheckAccess();
native int sysOpenSound(int iFreq, int iBitsNum, int iStereo, int iBlockSize, String szError);
native int sysCloseSound(int lHandle);
native int sysWriteBuffer(int lHandle, byte bBuffer[], int iLen);

    
public Native_Driver(clMain theMain)
{
    super(theMain);
    sndfd = 0;
    fragmentsize = 0;
    audiobuffer = null;

    Name = new String("Native-API Sound Driver");
    Version = new String("Native-API Sound Driver v1.0 - by Shlomi Fish");
}

public short SampleLoad(SimulatedRandomAccessFile fp,int size,int reppos,int repend,int flags)
{
	return m_.Virtch.VC_SampleLoad(fp,size,reppos,repend,flags);
}

public void SampleUnLoad(short handle)
{
	m_.Virtch.VC_SampleUnload(handle);
}


public boolean IsPresent()
{
    //return (access("/dev/dsp",W_OK)==0);
    return (sysCheckAccess() != 0);
}


public int Init()
{
	//char *env;
	int play_precision,play_stereo,play_rate;
	int fragsize,numfrags;

        //fragsize=(env=getenv("MM_FRAGSIZE")) ? atoi(env) : DEFAULT_FRAGSIZE;
        fragsize = DEFAULT_FRAGSIZE;
        //numfrags=(env=getenv("MM_NUMFRAGS")) ? atoi(env) : DEFAULT_NUMFRAGS;
        numfrags = DEFAULT_NUMFRAGS;
		
	if(fragsize<7 || fragsize>17)  fragsize=DEFAULT_FRAGSIZE;
	if(numfrags<2 || numfrags>255) numfrags=DEFAULT_NUMFRAGS;

	fragmentsize=(numfrags<<16) | fragsize;
	
/*#ifndef __FreeBSD__
	if(ioctl(sndfd, SNDCTL_DSP_SETFRAGMENT, &fragmentsize)<0){
		*m_.mmIO.myerr = "Buffer fragment failed";
		close(sndfd);
		return 0;
	}
#endif /* __FreeBSD__ */

	play_precision = ((m_.MDriver.md_mode & m_.DMODE_16BITS) != 0) ? 16 : 8;
	play_stereo= ((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? 1 : 0;
	play_rate=m_.MDriver.md_mixfreq;

        sndfd = sysOpenSound(play_rate, play_precision, play_stereo, fragmentsize, m_.mmIO.myerr);
        
        if (sndfd == -1)
        {
            return 0;
        }

/*	Lose this for now - it will confuse ncurses etc...
	printf("Fragment size is %ld\n",fragmentsize); */

        if(!m_.Virtch.VC_Init()){
                sysCloseSound(sndfd);
		return 0;
	}

        audiobuffer = new byte[fragmentsize];
	
	if(audiobuffer==null){
		m_.Virtch.VC_Exit();
		sysCloseSound(sndfd);
		return 0;
	}
	
	return 1;
}


public void Exit()
{
        //free(audiobuffer);
        audiobuffer = null;
	m_.Virtch.VC_Exit();
	sysCloseSound(sndfd);
}

public void PlayStart()
{
	m_.Virtch.VC_PlayStart();
}

public void PlayStop()
{
	m_.Virtch.VC_PlayStop();
}

public void Update()
{
	m_.Virtch.VC_WriteBytes(audiobuffer,fragmentsize);
        sysWriteBuffer(sndfd, audiobuffer, fragmentsize);
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