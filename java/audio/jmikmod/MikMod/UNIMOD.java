package audio.jmikmod.MikMod;


public class UNIMOD extends Object
{
	public short		numchn;			/* number of channels */
	public short       numpos;         /* number of positions in this song */
	public short		reppos;			/* restart position */
	public short       numpat;         /* number of patterns in this song */
	public short       numtrk;         /* number of tracks */
	public short       numins;         /* number of samples */
	public short       initspeed;      /* */
	public short       inittempo;      /* */
	public short       positions[]; /* all positions */
	public short       panning[];  	/* 32 panning positions */
	public short       flags;          /* */
	public String       songname;       /* name of the song */
	public String       modtype;        /* string type of module */
	public String       comment;        /* module comments */
	public INSTRUMENT instruments[];    /* all samples */
	public short      patterns[];       /* array of PATTERN */
	public int      pattrows[];       /* array of number of rows for each pattern */
	public short     tracks[][];         /* array of pointers to tracks */

	public UNIMOD()
	{
		positions = new short[256];
		panning = new short[32];
	}
}