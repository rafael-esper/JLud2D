package audio.jmikmod.MikMod;

public class ENVPR extends Object
{
	public short flg;          /* envelope flag */
	public short pts;			/* number of envelope points */
	public short sus;			/* envelope sustain index */
	public short beg;			/* envelope loop begin */
	public short end;			/* envelope loop end */
	public short p;			/* current envelope counter */
	public short a;			/* envelope index a */
	public short b;			/* envelope index b */
        public ENVPT env[];			/* envelope points */

        public ENVPR()
        {
        }
};
