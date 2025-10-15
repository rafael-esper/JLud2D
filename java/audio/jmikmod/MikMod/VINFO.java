package audio.jmikmod.MikMod;

public class VINFO extends Object
{
	public boolean kick;                     /* =1 -> sample has to be restarted */
	public boolean active;                   /* =1 -> sample is playing */
	public int flags;                    /* 16/8 bits looping/one-shot */
	public short handle;                  /* identifies the sample */
	public int start;                    /* start index */
	public int size;                     /* samplesize */
	public int reppos;                   /* loop start */
	public int repend;                   /* loop end */
	public int frq;                      /* current frequency */
        public short vol;                      /* current volume */
	public short pan;						/* current panning position */
	public int current;              	/* current index in the sample */
	public int increment;             	/* fixed-point increment value */
	public int lvolmul;					/* left volume multiply */
        public int rvolmul;					/* right volume multiply */
        public VINFO()
        {
        }
}
