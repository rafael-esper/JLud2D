package audio.jmikmod.MikMod;

import persist.SimulatedRandomAccessFile;

public class clMDriverBase extends Object
{
        public clMainBase m_;

        /*
                Sample format flags:
        */
        
        public final int SF_16BITS  =            1;
        public final int SF_SIGNED  = 	          2;
        public final int SF_DELTA  =             4;
        public final int SF_BIG_ENDIAN =	  8;
        public final int SF_LOOP =              16;
        public final int SF_BIDI  =             32;
        public final int SF_OWNPAN =            64;
        public final int SF_REVERSE =   	128;
        
        
        public clMDriverBase() {}
        public clMDriverBase(clMainBase theMain) {m_ = theMain;}
        public short MD_SampleLoad(SimulatedRandomAccessFile fp,int size,int reppos,int repend,int flags) { return 1;}
		public void MD_SampleUnLoad(short handle) {}
};
