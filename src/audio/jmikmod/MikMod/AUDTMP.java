package audio.jmikmod.MikMod;

public class AUDTMP extends Object
{
	public INSTRUMENT 	i;
	public SAMPLE      s;

	public int fadevol;		/* fading volume */

	public ENVPR venv;
	public ENVPR penv;

	public boolean keyon;		/* if true=key is pressed. */
	public boolean kick;			/* if true=sample has to be restarted */
	public short sample;		/* which sample number (0-31) */
	public short handle;		/* which sample-handle */

	public int start;		/* The start byte index in the sample */

	public short panning;		/* panning position */
	public short pansspd;		/* panslide speed */

	public byte volume;		/* amiga volume (0 t/m 64) to play the sample at */
	public int period;		/* period to play the sample at */

	/* You should not have to use the values
	   below in the player routine */

	public byte transpose;

	public short note;			/* */

	public short ownper;
	public short ownvol;

        public short [] row;			/* row currently playing on this channel */
        public int row_pos;

	public byte retrig;		/* retrig value (0 means don't retrig) */
	public int c2spd;		/* what finetune to use */

	public byte tmpvolume;	/* tmp volume */

	public int tmpperiod;	/* tmp period */
	public int wantedperiod;	/* period to slide to (with effect 3 or 5) */

	public int slidespeed;	/* */
	public int portspeed;	/* noteslide speed (toneportamento) */

	public short s3mtremor;	/* s3m tremor (effect I) counter */
	public short s3mtronof;	/* s3m tremor ontime/offtime */

	public short s3mvolslide;	/* last used volslide */

	public short s3mrtgspeed;	/* last used retrig speed */
	public short s3mrtgslide;	/* last used retrig slide */

	public short glissando;	/* glissando (0 means off) */
	public short wavecontrol;	/* */

	public byte vibpos;		/* current vibrato position */
	public short vibspd;		/* "" speed */
	public short vibdepth;		/* "" depth */

	public byte trmpos;		/* current tremolo position */
	public short trmspd;		/* "" speed */
	public short trmdepth;		/* "" depth */

        public int soffset;		/* last used sample-offset (effect 9) */

        public AUDTMP()
        {
            venv = new ENVPR();
            penv = new ENVPR();
        }
}
