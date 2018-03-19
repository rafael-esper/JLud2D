/*

Name:
MLOADER.C

Description:
These routines are used to access the available module loaders

Portability:
All systems - all compilers

*/

package audio.jmikmod.MikMod.MLoader;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;

import persist.SimulatedRandomAccessFile;

import audio.jmikmod.MikMod.*;

public class clMLoader extends Object
{
	//public final short finetune[16] = {
	public final short finetune[] = {
	8363,	8413,	8463,	8529,	8581,	8651,	8723,	8757,
	7895,	7941,	7985,	8046,	8107,	8169,	8232,	8280
        };
        
	public clMainBase m_;



	public SimulatedRandomAccessFile modfp;
	public UNIMOD of;

	//clLOADER *firstloader; //=NULL;
	//public clLOADER loaders[16];
	public clLOADER loaders[];
	public int num_loaders;


public clMLoader(clMainBase theMain)
{
        m_ = theMain;
        num_loaders = 0;
		loaders = new clLOADER[16];
		of = new UNIMOD();
}

public void ML_InfoLoader()
{
	int t;

	/* list all registered devicedrivers: */

	for (t=0;t<num_loaders;t++)
            //printf("%d. %s\n",t+1,(const char *)(*loaders[num_loaders-1-t]->version));
            //puts((t+1) + String(". ") + loaders[num_loaders-1-t].version);
			System.out.println((t+1) + ". " + loaders[num_loaders-1-t].version);
}


public void ML_RegisterLoader(clLOADER ldr)
{
	loaders[num_loaders] = ldr;
	num_loaders++;
}





public boolean ReadComment(short len)
	throws IOException
{
	int t;

        if(len != 0){
                byte [] buf;
		if((buf=new byte[len+1]) == null) return false;
                //fread(buf,len,1,modfp);
                modfp.read(buf,0,len);
		buf[len]=0;

		/* strip any control-characters in the comment: */

		for(t=0;t<len;t++){
			if(buf[t]<32) buf[t]=' ';
                }
                of.comment = new String(buf,0,0,len);
                buf = null;
	}
	return true;
}



public boolean AllocPatterns()
{
	int s,t,tracks=0;

	/* Allocate track sequencing array */

        //if(!(of.patterns=(short *)MyCalloc((int)of.numpat*of.numchn,sizeof(short)))) return 0;
        of.patterns = new short [(int)of.numpat*of.numchn];
        for(t=0 ; t < (int)of.numpat*of.numchn ; t++)
            of.patterns[t] = 0;
        //if(!(of.pattrows=(int *)MyCalloc(of.numpat,sizeof(int)))) return 0;
        of.pattrows = new int [of.numpat];
        for(t=0 ; t < of.numpat ; t++)
            of.pattrows[t] = 0;
        

	for(t=0;t<of.numpat;t++){
		of.pattrows[t]=64;

		for(s=0;s<of.numchn;s++){
			of.patterns[(t*of.numchn)+s]=(short)(tracks++);
		}
	}

	return true;
}


public boolean AllocTracks()
{
        //if(!(of.tracks=(short **)MyCalloc(of.numtrk,sizeof(short *)))) return 0;

        int i;
        of.tracks = new short [of.numtrk][];
        for(i=0; i<of.numtrk; i++)
            of.tracks[i] = null;
        return true;
}



public boolean AllocInstruments()
{
    //if(!(of.instruments=(INSTRUMENT *)MyCalloc(of.numins,sizeof(INSTRUMENT)))) return 0;
        int i,j;

        of.instruments = new INSTRUMENT [of.numins];
		for(i=0; i<of.numins; i++)
		{
			of.instruments[i] = new INSTRUMENT();
		}
        for(i=0; i<of.numins; i++)
        {
            of.instruments[i].numsmp = of.instruments[i].volflg =
                of.instruments[i].volpts = of.instruments[i].volsus =
                of.instruments[i].volbeg = of.instruments[i].volend =
                of.instruments[i].panflg = of.instruments[i].pansus =
                of.instruments[i].panend = of.instruments[i].vibtype =
                of.instruments[i].vibsweep = of.instruments[i].vibdepth =
                of.instruments[i].vibrate = (short)0;
				of.instruments[i].volfade = 0;
            
            of.instruments[i].insname = null;
            of.instruments[i].samples = null;

            for(j=0;j<96;j++)
                of.instruments[i].samplenumber[j] = 0;

            for(j=0;j<12;j++)
            {
                of.instruments[i].volenv[j].pos = of.instruments[i].volenv[j].val =
                    of.instruments[i].panenv[j].pos = of.instruments[i].panenv[j].val = 0;
            }
        }
        return true;
}


public boolean AllocSamples(INSTRUMENT i)
{
	int u,n;

        if((n=i.numsmp) != 0)
        {
		//if(!(i->samples=(SAMPLE *)MyCalloc(n,sizeof(SAMPLE)))) return 0;
                i.samples = new SAMPLE[n];
				for(u=0;u<n;u++)
				{
					i.samples[u] = new SAMPLE();
				}
                for(u=0;u<n;u++)
                {
                    i.samples[u].c2spd = 
                        i.samples[u].length = i.samples[u].loopstart =
                        i.samples[u].loopend = i.samples[u].flags =
                        i.samples[u].seekpos = i.samples[u].handle = 0;

					i.samples[u].transpose = (byte)0;
					i.samples[u].volume = i.samples[u].panning = (short)0;

                    i.samples[u].samplename = null;
                }

                for(u=0; u<n; u++){
			i.samples[u].panning=128;
			i.samples[u].handle=-1;
		}
	}
	return true;
}


public String DupStr(byte s[],short len)
{
        short t;
        byte d[];

        /* Scan for first printing char in buffer [includes high ascii up to 254] */

        while(len != 0){
                if(!(s[len-1]>=0 && s[len-1]<=0x20)) break;
                len--;
        }

        if(len != 0){

                /* When the buffer wasn't completely empty, allocate
                   a cstring and copy the buffer into that string, except
                   for any control-chars */

                if((d=new byte[len+1])!=null){
                    for(t=0;t<len;t++)
                    {
                        d[t]=((s[t]>=0 && s[t]<32) ? ((byte)' '): s[t]);
                    }
                    d[t]=0;
                }
                String sPtr = new String(d, 0, 0, len);
                d = null;
                return sPtr;
        }

        return new String();
}

// To avoid lots of casting errors
public String DupStr(byte s[],int len)
{
	return DupStr(s, (short)len);
}


public boolean ML_LoadSamples()
{
	int t,u;
	//INSTRUMENT *i;
	//SAMPLE *s;

	for(t=0;t<of.numins;t++){

		//i=&of.instruments[t];

		for(u=0; u<of.instruments[t].numsmp; u++){

			//s=&of.instruments[t].samples[u];

/*		printf("Loading Sample %d\n",t); */

		/* sample has to be loaded ? -> increase
		   number of samples and allocate memory and
		   load sample */

			if(of.instruments[t].samples[u].length != 0){

				if(of.instruments[t].samples[u].seekpos != 0){
					m_.mmIO._mm_fseek(modfp,of.instruments[t].samples[u].seekpos,m_.mmIO.SEEK_SET);
				}

				/* Call the sample load routine of the driver module.
				   It has to return a 'handle' (>=0) that identifies
				   the sample */

				of.instruments[t].samples[u].handle=m_.MDriver.MD_SampleLoad(modfp,
										of.instruments[t].samples[u].length,
										of.instruments[t].samples[u].loopstart,
										of.instruments[t].samples[u].loopend,
										of.instruments[t].samples[u].flags);

				if(of.instruments[t].samples[u].handle<0) return false;
			}
		}
	}
	return true;
}


public boolean ML_LoadHeader()
{
	boolean ok=false;
	//clLOADER *l;
	int t;

	/* Try to find a loader that recognizes the module */

	/*for(l=firstloader; l!=NULL; l=l.next){
		m_.mmIO._mm_rewind(modfp);
		if(l.Test()) break;
	}*/
	for(t=num_loaders-1; t >= 0; t--){
		m_.mmIO._mm_rewind(modfp);
		//l=loaders[t];
		if(loaders[t].Test()) break;
	}


	if(t == -1){
		m_.mmIO.myerr="Unknown module format";
		m_.mmIO.myerr_file=m_.cur_mod.filename.getFile();
		return false;
	}

	/* init unitrk routines */

	if(!m_.MUniTrk.UniInit()) return false;

	/* init module loader */

	if(loaders[t].Init()){
		m_.mmIO._mm_rewind(modfp);
		ok=loaders[t].Load();
	}

	loaders[t].Cleanup();

	/* free unitrk allocations */

	m_.MUniTrk.UniCleanup();
	return ok;
}



public void ML_XFreeInstrument(INSTRUMENT i)
{
	int t;

	if(i.samples!=null){
		for(t=0; t<i.numsmp; t++){
			if(i.samples[t].handle>=0){
				m_.MDriver.MD_SampleUnLoad(i.samples[t].handle);
			}
		}
                i.samples = null;
	}
        if(i.insname!=null)
            i.insname = null;
}



public void ML_FreeEx(UNIMOD mf)
{
	int t;

        if(mf.modtype!=null)
            mf.modtype = null;

        if(mf.patterns!=null) mf.patterns = null;
        if(mf.pattrows!=null) mf.pattrows = null;

	if(mf.tracks!=null){
		for(t=0;t<mf.numtrk;t++)  {
                    if(mf.tracks[t]!=null)
                        mf.tracks[t] = null;
		}
                mf.tracks = null;
	}

	if(mf.instruments!=null){
		for(t=0;t<mf.numins;t++){
			ML_XFreeInstrument(mf.instruments[t]);
		}
                mf.instruments = null;
	}

	if(mf.songname!=null) mf.songname = null;
        if(mf.comment!=null) mf.comment = null;
}



/******************************************

	Next are the user-callable functions

******************************************/


public void ML_Free(UNIMOD mf)
{
	if(mf!=null){
		ML_FreeEx(mf);
                mf = null;
	}
}




public UNIMOD ML_LoadFP(SimulatedRandomAccessFile fp)
{
	int t;
	UNIMOD mf;

	/* init fileptr, clear errorcode, clear static modfile: */

	modfp=fp;
	m_.mmIO.myerr="";
	m_.mmIO.myerr_file="";
        //memset(&of,0,sizeof(UNIMOD));
        of.numchn = of.numpos = of.reppos =
            of.numpat = of.numtrk = of.numins =
            of.initspeed = of.inittempo = of.flags = 0;

        of.songname = of.modtype = of.comment = null;
        of.patterns = null;
        of.instruments = null;
        of.pattrows = null;
        of.tracks = null;
        for(t=0; t<256; t++)
            of.positions[t] = 0;
        for(t=0; t<32; t++)
            of.panning[t] = 0;

	/* init panning array */

	for(t=0;t<32;t++){
		of.panning[t]=(short)((((t+1)&2) != 0)?255:0);
	}

	if(!ML_LoadHeader()){
		ML_FreeEx(of);
		return null;
	}

	if(!ML_LoadSamples()){
		ML_FreeEx(of);
		return null;
	}

        /*if(!(mf=(UNIMOD *)MyCalloc(1,sizeof(UNIMOD)))){
                ML_FreeEx(&of);
                return NULL;
        }*/
        mf = new UNIMOD();
        /*
         I removed the calloc-like nullization because it's needless in this context.
         */
        

	/* Copy the static UNIMOD contents
	into the dynamic UNIMOD struct */

        //memcpy(mf,&of,sizeof(UNIMOD));
        // A simple assignment may work in C, but with Java and its crazy
        // references, we may get two references to the same object instead
        // of two distinct object instances.

        mf.numchn = of.numchn;
        mf.numpos = of.numpos;
        mf.reppos = of.reppos;
        mf.numpat = of.numpat;
        mf.numtrk = of.numtrk;
        mf.numins = of.numins;
        mf.initspeed = of.initspeed;
        mf.inittempo = of.inittempo;
        for(t=0; t<256; t++)
            mf.positions[t] = of.positions[t];
        for(t=0; t<32; t++)
            mf.panning[t] = of.panning[t];
        mf.flags = of.flags;
        mf.songname = of.songname;
        mf.modtype = of.modtype;
        mf.comment = of.comment;
        mf.instruments = of.instruments;
        mf.patterns = of.patterns;
        mf.pattrows = of.pattrows;
        mf.tracks = of.tracks;
        

	return mf;
}

public UNIMOD ML_LoadFN(URL filename)
{
	SimulatedRandomAccessFile fp = null;
	UNIMOD mf;

        //if((fp=fopen((const char*)*filename,"rb"))==NULL){
        try
        {
        
        try {
			if ( (fp = new SimulatedRandomAccessFile(filename)) == null) {
			m_.mmIO.myerr="Error opening file";
			m_.mmIO.myerr_file=filename.getFile();
			return null;
}
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	/* display "loading" message */
	m_.Display.display_version();
	m_.Display.display_loadbanner();

	mf=ML_LoadFP(fp);
        //fclose(fp);
        fp.close();
        fp = null;

        return mf;

        }
        catch (IOException ioe1)
        {
            ioe1.printStackTrace();
        	return null;
        }
}

}
