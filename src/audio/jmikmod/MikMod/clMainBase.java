package audio.jmikmod.MikMod;

import audio.jmikmod.MikMod.MLoader.*;
import audio.jmikmod.MikMod.MMIO.*;
import audio.jmikmod.MikMod.MUniTrk.*;


public class clMainBase extends Object
{
	public final String mikversion_ =
		"-= MikMod for Java v2.14 - development version, 22 Nov 97 =---\n";

	public final String mikbannerhead = "\n" + mikversion_ +
		" - main code (in ANSI C) by MikMak <mikmak@via.nl>\n" +
		" - ported to Java by Shlomi Fish ( http://www.shlomifish.org/ )\n";
	
	public final String mikbannerdriver =  
		" - Java sound drivers by Shlomi Fish ( http://www.shlomifish.org/ )\n";

	public final String mikbannertail =
		" - interface / zip code by Steve McIntyre <stevem@chiark.greenend.org.uk>\n" +
		" - This program is SHAREWARE - Read MIKMOD.TXT for more info \n";


	public final String mikbanner = mikbannerhead + mikbannerdriver + mikbannertail ;

    public final String ERROR_LOADING_HEADER = "Error loading header";
    public final String ERROR_NOT_A_MODULE = "Unknown module format";

    /*
            error variables:
            ===============
    */

    public final String ERROR_ALLOC_STRUCT = "Error allocating structure";
    public final String ERROR_LOADING_PATTERN = "Error loading pattern";
    public final String ERROR_LOADING_TRACK = "Error loading track";
    public final String ERROR_LOADING_SAMPLEINFO = "Error loading sampleinfo";
    public final String ERROR_OUT_OF_HANDLES = "Out of sample-handles";
    public final String ERROR_SAMPLE_TOO_BIG = "Sample too big, out of memory";

	public curmod cur_mod;

	public audio.jmikmod.MikMod.MMIO.MMIO mmIO;
	public audio.jmikmod.MikMod.MUniTrk.clMUniTrk MUniTrk;
	public audio.jmikmod.MikMod.MLoader.clMLoader MLoader;
	public audio.jmikmod.MikMod.clDisplayBase Display;
	public audio.jmikmod.MikMod.clMDriverBase MDriver;
}
