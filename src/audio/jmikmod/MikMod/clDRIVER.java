package audio.jmikmod.MikMod;

import persist.SimulatedRandomAccessFile;

public class clDRIVER extends Object
{
	public clMain m_;
	public String    Name;
	public String    Version;

        // clDRIVER operator =(clDRIVER & drv) {is_null = drv.is_null; return *this; }
        public clDRIVER()
        {
            Name= new String("Generic Driver Class") ;
            Version = new String("Generic Driver Class v1.0 - by Shlomi Fish");
        }
        public clDRIVER(clMain theMain) {m_ = theMain; Name= new String("Generic Driver Class") ; Version = new String("Generic Driver Class v1.0 - by Shlomi Fish"); }
	public boolean IsPresent() {return false;}
	public short   SampleLoad(SimulatedRandomAccessFile fp,int size,int reppos,int repend,int flags) {return 0;}
	public void    SampleUnLoad(short handle) {}
	public int     Init() {return 0;}
	public void    Exit() {}
	public void    PlayStart() {}
	public void    PlayStop() {}
        public void    Update() {}
	public void    VoiceSetVolume(short voice,short vol) {}
	public void    VoiceSetFrequency(short voice,int frq) {}
	public void    VoiceSetPanning(short voice,short pan) {}
        public void    VoicePlay(short voice,short handle,int start,int size,int reppos,int repend,int flags) {}
	public void    PatternChange() {}
	public void    Mute() {}
	public void    UnMute() {}
}
