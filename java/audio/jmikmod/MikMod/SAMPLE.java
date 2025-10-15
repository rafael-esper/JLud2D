package audio.jmikmod.MikMod;


public class SAMPLE extends Object
{
	public int c2spd;            /* finetune frequency */
	public byte transpose;        /* transpose value */
	public short volume;           /* volume 0-64 */
	public short panning;          /* panning */
	public int length;           /* length of sample (in samples!) */
	public int loopstart;        /* repeat position (relative to start, in samples) */
	public int loopend;          /* repeat end */
	public int flags;            /* sample format */
	public int seekpos;			/* seek position in file */
	public String samplename;       /* name of the sample */
	public short handle;           /* sample handle */
}