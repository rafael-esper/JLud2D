/*

Name:
MIKCVT.C

Description:
Program to convert any module into a .UNI module

Portability:
All systems - all compilers

*/

package audio.jmikmod.MikMod;

import java.io.IOException;

import persist.SimulatedRandomAccessFile;
import audio.jmikmod.MikMod.Loaders.M15_Loader;
import audio.jmikmod.MikMod.Loaders.MOD_Loader;
import audio.jmikmod.MikMod.Loaders.MTM_Loader;
import audio.jmikmod.MikMod.Loaders.S3M_Loader;
import audio.jmikmod.MikMod.Loaders.S69_Loader;
import audio.jmikmod.MikMod.Loaders.STM_Loader;
import audio.jmikmod.MikMod.Loaders.ULT_Loader;
import audio.jmikmod.MikMod.Loaders.UNI_Loader;
import audio.jmikmod.MikMod.Loaders.XM_Loader;
import audio.jmikmod.MikMod.MUniTrk.clMUniTrk;

class clMikCvtMDriver extends clMDriverBase
{
	public clMikCvtMain m_;
    
	public clMikCvtMDriver(clMikCvtMain theMain) 
	{ 
		super(theMain);
		m_ = theMain; 
	}
    
    
public short MD_SampleLoad(SimulatedRandomAccessFile fp, int length, int loopstart, int loopend, int flags)
{
	 /* record position of sample */
	try {
	m_.samplepos[m_.numsamples] = (int)fp.getFilePointer();

	 /* determine it's bytesize */

        if ((flags & SF_16BITS) != 0)
	    length <<= 1;

	 /* record bytesize and skip the sample */

	 m_.samplesize[m_.numsamples++] = length;
	 fp.seek(length+fp.getFilePointer());
	 }
	 catch (IOException ioe1) {}
	 return 1;
}

    public void MD_SampleUnLoad(short handle)    {}
};


public class clMikCvtMain extends clMainBase
{
    public SimulatedRandomAccessFile fpi, fpo;

    public short numsamples;
    public int samplepos[];
    public int samplesize[];
    public byte buf[];

    public clMikCvtMDriver MDriver;

	public clMikCvtMain()
	{
		samplepos = new int[128];
		samplesize = new int[128];
		buf = new byte[8000];
	}


int CopyData(SimulatedRandomAccessFile fpi, SimulatedRandomAccessFile fpo, int len)
{
	 int todo;

	 try {
	 while (len != 0) {
            todo = (len > 8000) ? 8000 : len;
            //if (!fread(buf, todo, 1, fpi))
            if (fpi.read(buf,0,todo) != todo)
                     return 0;
            //fwrite(buf, todo, 1, fpo);
            fpo.write(buf, 0, todo);
            len -= todo;
	 }
	 }
	 catch (IOException ioe1) {}
	 return 1;
}


/***************************************************************************
****************************************************************************
***************************************************************************/


boolean TrkCmp(short t1[], short t2[])
{
	int l1, l2;

	if (t1 == null || t2 == null)
            return false;

	l1 = MUniTrk.TrkLen(t1);
	l2 = MUniTrk.TrkLen(t2);

	if (l1 != l2)
            return false;

	return (MUniTrk.MyCmp(t1, 0, t2, 0, l1));
}



void ReplaceTrack(UNIMOD mf, int t1, int t2)
{
	 int t;

	 for (t = 0; t < mf.numpat * mf.numchn; t++) {
		if (mf.patterns[t] == t1)
			 mf.patterns[t] = (short)t2;
	 }
}



void Optimize(UNIMOD mf)
/*
	Optimizes the number of tracks in a modfile by removing tracks with
	identical contents.
 */
{
	int t, u, done = 0, same, newcnt = 0;
	short ta[];
	short newtrk[][];

        //if (!(newtrk = (short**)malloc(mf.numtrk * sizeof(short *))))
        //    return;
        newtrk = new short [mf.numtrk][];
        if (newtrk == null)
            return;

	for (t = 0; t < mf.numtrk; t++) {

            /* ta is track to examine */
    
            ta = mf.tracks[t];
    
            /* does ta look familiar ? */
    
            for (same = u = 0; u < newcnt; u++)
            {
                if (TrkCmp(ta, newtrk[u])) {
                    same = 1;
                    break;
                }
            }

            if (same != 0) {
                     ReplaceTrack(mf, t, u);
                     done++;
            } else {
                     ReplaceTrack(mf, t, newcnt);
                     newtrk[newcnt++] = ta;
            }
    
            //printf("\rOptimizing: %d\r", (t * 100L) / mf.numtrk);
            System.out.print("\rOptimizing: " + (int)((t * 100L) / mf.numtrk) + "\r");
        }

        //printf("\rOptimized : %d tracks\n", done);
        System.out.print("\rOptimized : " + done + " tracks\n");

        mf.tracks = null; 
	mf.tracks = newtrk;
	mf.numtrk = (short)newcnt;
}

/***************************************************************************
****************************************************************************
***************************************************************************/





void StrWrite(String s)
/*
	Writes a null-terminated string as a pascal string to fpo.
 */
{
	 int len;

	 try {
	 len = (s != null) ? s.length() : 0;
	 mmIO._mm_write_I_UWORD(len, fpo);
         if (len != 0)
         {
             byte buf[] = new byte[len];
             s.getBytes(0, len, buf, 0);
             //fwrite(buf, len, 1, fpo);
             fpo.write(buf,0,len);
             buf = null;
         }
	 }
	 catch (IOException ioe1) {}
}

void TrkWrite(short t[])
/*
	Writes a track to fpo.
 */
{
    int len;
    if (t == null)
        System.out.print("NULL track");
    len = MUniTrk.TrkLen(t);

    mmIO._mm_write_I_UWORD(len, fpo);
    //fwrite(t, len, 2, fpo);
    mmIO._mm_write_UBYTES2(t,len,fpo);
}



String stripname(String path, String ext)
/*
	Strips the filename from a path, and replaces or adds
	a new extension to it.
*/
{
        //char *n, *m;
        int n, m;
        //static char newname[256];
        String newname;

	/* extract the filename from the path */

/*#ifdef unix
	n = ((n = strrchr(path, '/')) == NULL) ? path : n + 1;
#else
	n = ((n = strrchr(path, '\\')) == NULL) ? path : n + 1;
	if(m = strrchr(n, ':')) n=m+1;
#endif*/
/*#ifdef unix
        n = ((n = path.lastIndexOf('/')) == -1) ? 0 : n + 1;
#else
        n = ((n = path.lastIndexOf('\\')) == -1) ? 0 : n + 1;
        if ((m = path.lastIndexOf(':', n)) != -1)
            n = m+1;
#endif*/
	n = ( (n = path.lastIndexOf(System.getProperties().getProperty("file.separator")) ) == -1) ? 0 : n + 1;
		
	/* copy the filename into 'newname' */
	//strncpy(newname,n,255);
        //newname[255]=0;
        newname = path.substring(n);

	/* remove the extension */
	//if (n = strrchr(newname, '.'))
        //*n = 0;
        if ((n = newname.lastIndexOf('.')) != -1)
        {
            newname = newname.substring(0, n);
        }
        newname = newname + ext;

	/* and tack on the new extension */
        //return strcat(newname, ext);
        return newname;
}

/*int main(int argc, char *argv[])
{
    clMikCvtMain main_class;
    main_class.main(argc,argv);
}*/


public int main(String argv[])
{
        int t, v, w;

        int argc = argv.length;

        String outname;

	//System.out.print(mikbanner);

	try {

	/* Expand wildcards on commandline (NoT on unix systems please): */

/*#ifndef unix
	MyGlob(&argc, &argv, 0);
#endif*/
        MLoader = new audio.jmikmod.MikMod.MLoader.clMLoader(this);

	MUniTrk = new clMUniTrk(this);
	mmIO = new audio.jmikmod.MikMod.MMIO.MMIO(this);
        mmIO._mm_setiobase(0);

        MDriver = new clMikCvtMDriver(this);
        super.MDriver = MDriver;

        Display = new clDisplayBase(this);

        /*
		Register the loaders we want to use..
        */

	M15_Loader cl_load_m15 = new audio.jmikmod.MikMod.Loaders.M15_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_m15);
	MOD_Loader cl_load_mod = new audio.jmikmod.MikMod.Loaders.MOD_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_mod);
	MTM_Loader cl_load_mtm = new audio.jmikmod.MikMod.Loaders.MTM_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_mtm);
	S3M_Loader cl_load_s3m = new audio.jmikmod.MikMod.Loaders.S3M_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_s3m);
	STM_Loader cl_load_stm = new audio.jmikmod.MikMod.Loaders.STM_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_stm);
	ULT_Loader cl_load_ult = new audio.jmikmod.MikMod.Loaders.ULT_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_ult);
	UNI_Loader cl_load_uni = new audio.jmikmod.MikMod.Loaders.UNI_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_uni);
	S69_Loader cl_load_669 = new audio.jmikmod.MikMod.Loaders.S69_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_669);
	XM_Loader  cl_load_xm = new audio.jmikmod.MikMod.Loaders.XM_Loader(this);
	MLoader.ML_RegisterLoader(cl_load_xm);



	if (argc < 2) {

		/* display a usage message */

		System.out.println("Usage: MIKCVT <fletch.mod> ... ");
		System.out.println("Converts your modules to .UNI modules\n");
		return -1;
	}

	for (t = 1; t < argc; t++) {

		UNIMOD mf;

                //printf("In file : %s\n", argv[t]);
                System.out.println("In file : " + argv[t] + "\n");

		numsamples = 0;

                //if ((fpi = fopen(argv[t], "rb")) == null) {
                if ((fpi = new SimulatedRandomAccessFile(argv[t])) == null) {
			System.out.println("MikCvt Error: Error opening input file");
			break;
                }

                outname = stripname(argv[t], ".uni");


                //printf("Out file: %s\n", outname);
                System.out.println("Out file: " + outname);

                //if ((fpo = fopen(outname, "wb")) == null) {
                if ((fpo = new SimulatedRandomAccessFile(outname)) == null) {
			System.out.println("MikCvt Error: Error opening output file");
			break;
		}
		mf = MLoader.ML_LoadFP(fpi);

		/*      didn't work . exit with error */

		if (mf == null) {
                        System.out.println("MikCvt Error: " + mmIO.myerr);
                        //fclose(fpi);
                        fpi.close();
                        fpi = null;
			break;
                }

		/* Optimize the tracks */

		Optimize(mf);

		/* Write UNI header */

                //fwrite("UN05", 4, 1, fpo);
                long mypos=0;
		{
			byte uno5_buf[] = new byte[4];
			String uno5_str = "UN05";
			uno5_str.getBytes(0,4,uno5_buf, 0);
                        fpo.write(uno5_buf,0,4);
                }
                mypos = fpo.getFilePointer();
                mmIO._mm_write_UBYTE(mf.numchn, fpo);
                mypos = fpo.getFilePointer();
                mmIO._mm_write_I_UWORD(mf.numpos, fpo);
                mypos = fpo.getFilePointer();
                mmIO._mm_write_I_UWORD(mf.reppos, fpo);
                mypos = fpo.getFilePointer();
                mmIO._mm_write_I_UWORD(mf.numpat, fpo);
                mypos = fpo.getFilePointer();
		mmIO._mm_write_I_UWORD(mf.numtrk, fpo);
		mmIO._mm_write_I_UWORD(mf.numins, fpo);
		mmIO._mm_write_UBYTE(mf.initspeed, fpo);
		mmIO._mm_write_UBYTE(mf.inittempo, fpo);
		mmIO._mm_write_UBYTES2(mf.positions, 256, fpo);
		mmIO._mm_write_UBYTES2(mf.panning, 32, fpo);
		mmIO._mm_write_UBYTE(mf.flags, fpo);

                mypos = fpo.getFilePointer();

                StrWrite(mf.songname);
		StrWrite(mf.modtype);
		StrWrite(mf.comment);

                /* Write instruments */

                mypos = fpo.getFilePointer();
                
                for (v = 0; v < mf.numins; v++) {

                        //INSTRUMENT *i = &mf.instruments[v];
                        mypos = fpo.getFilePointer();

			mmIO._mm_write_UBYTE(mf.instruments[v].numsmp, fpo);
			mmIO._mm_write_UBYTES2(mf.instruments[v].samplenumber, 96, fpo);

			mmIO._mm_write_UBYTE(mf.instruments[v].volflg, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].volpts, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].volsus, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].volbeg, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].volend, fpo);

			for (w = 0; w < 12; w++) {
				mmIO._mm_write_I_SWORD(mf.instruments[v].volenv[w].pos, fpo);
				mmIO._mm_write_I_SWORD(mf.instruments[v].volenv[w].val, fpo);
			}

			mmIO._mm_write_UBYTE(mf.instruments[v].panflg, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].panpts, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].pansus, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].panbeg, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].panend, fpo);

			for (w = 0; w < 12; w++) {
				mmIO._mm_write_I_SWORD(mf.instruments[v].panenv[w].pos, fpo);
				mmIO._mm_write_I_SWORD(mf.instruments[v].panenv[w].val, fpo);
			}

			mmIO._mm_write_UBYTE(mf.instruments[v].vibtype, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].vibsweep, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].vibdepth, fpo);
			mmIO._mm_write_UBYTE(mf.instruments[v].vibrate, fpo);
			mmIO._mm_write_I_UWORD(mf.instruments[v].volfade, fpo);

			StrWrite(mf.instruments[v].insname);

			for (w = 0; w < mf.instruments[v].numsmp; w++) {
				//SAMPLE *s = &mf.instruments[v].samples[w];

				mmIO._mm_write_I_UWORD(mf.instruments[v].samples[w].c2spd, fpo);
				mmIO._mm_write_SBYTE(mf.instruments[v].samples[w].transpose, fpo);
				mmIO._mm_write_UBYTE(mf.instruments[v].samples[w].volume, fpo);
				mmIO._mm_write_UBYTE(mf.instruments[v].samples[w].panning, fpo);
				mmIO._mm_write_I_ULONG(mf.instruments[v].samples[w].length, fpo);
				mmIO._mm_write_I_ULONG(mf.instruments[v].samples[w].loopstart, fpo);
				mmIO._mm_write_I_ULONG(mf.instruments[v].samples[w].loopend, fpo);
				mmIO._mm_write_I_UWORD(mf.instruments[v].samples[w].flags, fpo);
				StrWrite(mf.instruments[v].samples[w].samplename);
                        }
		}

                mypos = fpo.getFilePointer();
                /* Write patterns */

		mmIO._mm_write_I_UWORDS2(mf.pattrows, mf.numpat, fpo);
		mmIO._mm_write_I_SWORDS(mf.patterns, mf.numpat * mf.numchn, fpo);

                mypos = fpo.getFilePointer();
		/* Write tracks */

                for (v = 0; v < mf.numtrk; v++) {
                        
			TrkWrite(mf.tracks[v]);
		}
                    
		System.out.print("Writing samples.. ");

                mypos = fpo.getFilePointer();
                /* Write sample-data */

                for (v = 0; v < numsamples; v++) {
                        
                         //fseek(fpi, samplepos[v], SEEK_SET);
                         fpi.seek(samplepos[v]);
                         CopyData(fpi, fpo, samplesize[v]);
                         mypos = fpo.getFilePointer();
                }
                mypos = fpo.getFilePointer();

		System.out.print("Done.");

		/* and clean up */

		//fclose(fpo);
                //fclose(fpi);
                fpo.close();
                fpo = null;
                fpi.close();
                fpi = null;
		MLoader.ML_Free(mf);
	}

	}
	catch (IOException ioe1) {}
	return 0;
}

}