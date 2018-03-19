package audio.jmikmod.MikMod;

public class clLOADER extends Object
{
	public clMainBase m_;

	//public clLOADER next;
	public String type;
	public String version;
	public clLOADER()
	{
		type = new String("Loaders' Base Class");
		version = new String("Loaders' Base Class v1.0 - by Shlomi Fish");
	}
	public clLOADER(clMainBase theMain)
	{
		m_ = theMain;
		type = new String("Loaders' Base Class");
		version = new String("Loaders' Base Class v1.0 - by Shlomi Fish");
	}

	public boolean Init() {return false;}
	public boolean Test() {return false;}
	public boolean Load() {return false;}
	public void Cleanup() {}
}
