/*

Name:
DRV_NOS.C

Description:
Mikmod driver for no output on any soundcard, monitor, keyboard, or whatever :)

Portability:
All systems - All compilers

*/

package audio.jmikmod.MikMod.Drivers;

import persist.SimulatedRandomAccessFile;
import audio.jmikmod.MikMod.clDRIVER;
import audio.jmikmod.MikMod.clMain;

public class NS_Driver extends clDRIVER
{
    byte buf[];
    
public NS_Driver(clMain theMain)
{
    super(theMain);
    Name = new String("No Sound");
    Version = new String("MikMod Nosound Driver v2.10 - (c) Creative Silence");

    buf = new byte[1024];
}

public boolean IsPresent()
{
	return true;
}

public short SampleLoad(SimulatedRandomAccessFile fp,int s,int a,int b,int f)
{
	return 1;
}

public int Init()
{
	return 1;
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
	m_.Virtch.VC_WriteBytes(buf, buf.length);
}

}