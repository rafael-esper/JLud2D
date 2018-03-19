package audio.jmikmod.MikMod;


public class INSTRUMENT extends Object
{
	public short numsmp;
	public short samplenumber[];

	public short volflg;           /* bit 0: on 1: sustain 2: loop */
	public short volpts;
	public short volsus;
	public short volbeg;
	public short volend;
	public ENVPT volenv[];

	public short panflg;           /* bit 0: on 1: sustain 2: loop */
	public short panpts;
	public short pansus;
	public short panbeg;
	public short panend;
	public ENVPT panenv[];

	public short vibtype;
	public short vibsweep;
	public short vibdepth;
	public short vibrate;

	public int volfade;
	public String  insname;
	public SAMPLE samples[];

	public INSTRUMENT()
	{
		samplenumber = new short[96];
		volenv = new ENVPT[12];
		panenv = new ENVPT[12];
		int i;
		for(i=0;i<12;i++)
		{
			volenv[i] = new ENVPT();
			panenv[i] = new ENVPT();
		}
	}
}