/*

Name:
VIRTCH.C

Description:
All-c sample mixing routines, using a 32 bits mixing buffer

Portability:
All systems - all compilers

*/

package audio.jmikmod.MikMod.Virtch;

import persist.SimulatedRandomAccessFile;
import audio.jmikmod.MikMod.VINFO;
import audio.jmikmod.MikMod.clMain;

public class clVirtch extends Object
{
	public clMain m_;
            
        public static final int TICKLSIZE = 3600;
        public static final int TICKWSIZE = (TICKLSIZE*2);
        public static final int TICKBSIZE = (TICKWSIZE*2);

            

        /*
                max. number of handles a driver has to provide. (not strict)
        */
        
        public static final int MAXSAMPLEHANDLES = 128;


        

	protected int VC_TICKBUF[]; //[TICKLSIZE];
	protected VINFO vinf[]; //[32];
	protected VINFO vnf;

	protected short samplesthatfit;
	protected int idxsize,idxlpos,idxlend,maxvol;

	protected int per256;
	protected int ampshift;



	protected int lvolmul,rvolmul;

	protected byte [] Samples[]; //[MAXSAMPLEHANDLES];

	protected int iWhichSampleMixFunc;
	protected int TICKLEFT;
        

        protected static final int FRACBITS = 11;
        protected static final int FRACMASK = ((1<<FRACBITS)-1);

public clVirtch(clMain theMain)
{

        int i;

        VC_TICKBUF = new int [TICKLSIZE];
        vinf = new VINFO[32];
        for(i=0;i<32;i++)
            vinf[i] = new VINFO();

        Samples = new byte [MAXSAMPLEHANDLES][];
        

        
        m_ = theMain;
        
    
        //memset(VC_TICKBUF, 0, sizeof(VC_TICKBUF));
        for(i=0;i<TICKLSIZE;i++)
            VC_TICKBUF[i] = 0;
        //memset(vinf, 0, sizeof(vinf));
        for(i=0;i<32;i++)
        {
            vinf[i].flags =
                vinf[i].start = vinf[i].size =
                vinf[i].reppos = vinf[i].repend = vinf[i].frq =
                vinf[i].current =
                vinf[i].increment = vinf[i].lvolmul = vinf[i].rvolmul = 0;

            vinf[i].handle = vinf[i].vol = vinf[i].pan = (short)0;
            vinf[i].kick = vinf[i].active = false;
        }
        
	vnf = null;

	samplesthatfit = 0;
	idxsize = idxlpos = idxlend = maxvol = 0;
	per256 = 0;
	ampshift = 0;
	lvolmul = rvolmul = 0;

        //memset(Samples, 0, sizeof(Samples));
        for(i=0;i<MAXSAMPLEHANDLES;i++)
            Samples[i] = null;
	TICKLEFT = 0;
}


protected void VC_Sample32To8Copy(int srce[],byte dest[],int dest_offset, int count,short shift)
{
	int c;
        int shifti=(24-ampshift);
        int src_idx=0, dest_idx=dest_offset;

	while((count--) != 0){
		c=srce[src_idx] >> shifti;
		if(c>127) c=(byte)127;
		else if(c<-128) c=-128;
		dest[dest_idx++]=(byte)(c+128);
		src_idx++;
	}
}


protected void VC_Sample32To16Copy(int srce[],byte dest[],int dest_offset, int count,short shift)
{
	int c;
	int shifti=(16-ampshift);
        int src_idx=0, dest_idx=dest_offset;
        
	while((count--) != 0){
		c=srce[src_idx] >> shifti;
		if(c>32767) c=32767;
                else if(c<-32768) c=-32768;
//#ifdef MM_BIG_ENDIAN
//                dest[dest_idx++]=(c>>8)&0xFF;
//                dest[dest_idx++]=c&0xFF;
//#else
                dest[dest_idx++]=(byte)(c&0xFF);
                dest[dest_idx++]=(byte)((c>>8)&0xFF);
//#endif
		src_idx++;
	}
}

protected static int fraction2long(int dividend,int divisor)
/*
	Converts the fraction 'dividend/divisor' into a fixed point longword.
*/
{
	int whole,part;

	whole=dividend/divisor;
	part=((dividend%divisor)<<FRACBITS)/divisor;

	return((whole<<FRACBITS)|part);
}


protected int samples2bytes(int samples)
{
	if((m_.MDriver.md_mode & m_.DMODE_16BITS) != 0) samples<<=1;
	if((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) samples<<=1;
	return samples;
}


protected int bytes2samples(int bytes)
{
	if((m_.MDriver.md_mode & m_.DMODE_16BITS) != 0) bytes>>=1;
	if((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) bytes>>=1;
	return bytes;
}


/**************************************************
***************************************************
***************************************************
**************************************************/


public int LargeRead(byte buffer[],int size)
{
	int t;
        int todo;
        int buf_offset=0;

	while(size != 0){
		/* how many bytes to load (in chunks of 8000) ? */

		todo=(size>8000)?8000:size;

		/* read data */

		m_.MDriver.SL_Load(buffer,buf_offset,todo);
		/* and update pointers.. */

		size-=todo;
		buf_offset+=todo;
	}
	return 1;
}



public short VC_SampleLoad(SimulatedRandomAccessFile fp,int length,int reppos,int repend,int flags)
{
	int handle;
	int t;

	m_.MDriver.SL_Init(fp,(short)flags,(short)((flags|(m_.MDriver.SF_SIGNED))&~(m_.MDriver.SF_16BITS)));

	/* Find empty slot to put sample address in */

	for(handle=0;handle<MAXSAMPLEHANDLES;handle++){
		if(Samples[handle]==null) break;
	}

	if(handle==MAXSAMPLEHANDLES){
		m_.mmIO.myerr=m_.ERROR_OUT_OF_HANDLES;
		return -1;
	}

        /*if((Samples[handle]=(char *)malloc(length+17))==NULL){
	/* using 17 here appears to solve linux libc-5.4.7 paranoia probs */
	/*	m_.mmIO.myerr=m_.ERROR_SAMPLE_TOO_BIG;
		return -1;
        }*/
        Samples[handle] = new byte [length+17];

	/* read sample into buffer. */
	LargeRead(Samples[handle],length);

	/* Unclick samples: */

	if((flags & (m_.MDriver.SF_LOOP)) != 0){
		if((flags & (m_.MDriver.SF_BIDI)) != 0)
			for(t=0;t<16;t++) Samples[handle][repend+t]=Samples[handle][(repend-t)-1];
		else
			for(t=0;t<16;t++) Samples[handle][repend+t]=Samples[handle][t+reppos];
	}
	else{
		for(t=0;t<16;t++) Samples[handle][t+length]=0;
	}

	return (short)handle;
}



public void VC_SampleUnload(short handle)
{
        //delete [] Samples[handle];
    
	Samples[handle]=null;
}


/**************************************************
***************************************************
***************************************************
**************************************************/





protected void MixStereoNormal(byte srce[],int dest[],int dest_offset, int index,int increment,short todo)
{
       byte sample;
       int dest_idx=dest_offset;

	while(todo>0){
		sample=srce[index>>FRACBITS];
		dest[dest_idx++]+=lvolmul*sample;
		dest[dest_idx++]+=rvolmul*sample;
		index+=increment;
		todo--;
	}
}


protected void MixMonoNormal(byte srce[],int dest[],int dest_offset, int index,int increment,short todo)
{
	byte sample;
        int dest_idx=dest_offset;
        
	while(todo>0){
		sample=srce[index>>FRACBITS];
		dest[dest_idx++]+=lvolmul*sample;
		index+=increment;
		todo--;
	}
}


protected void MixStereoInterp(byte srce[],int dest[],int dest_offset, int index,int increment,short todo)
{
	short sample,a,b;
        int dest_idx=dest_offset;
        
	while(todo>0){
		a=srce[index>>FRACBITS];
		b=srce[1+(index>>FRACBITS)];
		sample=(short)(a+(((int)(b-a)*(index&FRACMASK))>>FRACBITS));

		dest[dest_idx++]+=lvolmul*sample;
		dest[dest_idx++]+=rvolmul*sample;
		index+=increment;
		todo--;
	}
}


protected void MixMonoInterp(byte srce[],int dest[],int dest_offset, int index,int increment,short todo)
{
	short sample,a,b;
        int dest_idx=dest_offset;
        
	while(todo>0){
		a=srce[index>>FRACBITS];
		b=srce[1+(index>>FRACBITS)];
		sample=(short)(a+(((int)(b-a)*(index&FRACMASK))>>FRACBITS));

		dest[dest_idx++]+=lvolmul*sample;

		index+=increment;
		todo--;
	}
}



static int NewPredict(int index,int end,int increment,int todo)
/*
	This functions returns the number of resamplings we can do so that:

		- it never accesses indexes bigger than index 'end'
		- it doesn't do more than 'todo' resamplings
*/
{
	int di;

	di=(end-index)/increment;
	index+=(di*increment);

	if(increment<0){
		while(index>=end){
			index+=increment;
			di++;
		}
	}
	else{
		while(index<=end){
			index+=increment;
			di++;
		}
	}
	return ((di<todo) ? di : todo);
}


protected void VC_AddChannel(int ptr[],int todo)
/*
	Mixes 'todo' stereo or mono samples of the current channel to the tickbuffer.
*/
{
	int end;
        int done;
        int needs;
        byte s[];
        int ptr_idx=0;

	while(todo>0){

		/* update the 'current' index so the sample loops, or
		   stops playing if it reached the end of the sample */

		if((vnf.flags&(m_.MDriver.SF_REVERSE)) != 0){

			/* The sample is playing in reverse */

				if((vnf.flags&(m_.MDriver.SF_LOOP)) != 0){

					/* the sample is looping, so check if
					   it reached the loopstart index */

					if(vnf.current<idxlpos){
					if((vnf.flags&(m_.MDriver.SF_BIDI)) != 0){

						/* sample is doing bidirectional loops, so 'bounce'
							the current index against the idxlpos */

						vnf.current=idxlpos+(idxlpos-vnf.current);
						vnf.flags&=~(m_.MDriver.SF_REVERSE);
						vnf.increment=-vnf.increment;
					}
					else
						/* normal backwards looping, so set the
							current position to loopend index */

							vnf.current=idxlend-(idxlpos-vnf.current);
					}
				}
				else{

					/* the sample is not looping, so check
						if it reached index 0 */

					if(vnf.current<0){

						/* playing index reached 0, so stop
							playing this sample */

						vnf.current=0;
						vnf.active=false;
						break;
					}
				}
		}
		else{

			/* The sample is playing forward */

				if((vnf.flags&(m_.MDriver.SF_LOOP)) != 0){

					/* the sample is looping, so check if
						it reached the loopend index */

					if(vnf.current>idxlend){
						if((vnf.flags&(m_.MDriver.SF_BIDI)) != 0){

						/* sample is doing bidirectional loops, so 'bounce'
							the current index against the idxlend */

							vnf.flags|=(m_.MDriver.SF_REVERSE);
							vnf.increment=-vnf.increment;
							vnf.current=idxlend-(vnf.current-idxlend); /* ?? */
						}
						else
						/* normal backwards looping, so set the
							current position to loopend index */

							vnf.current=idxlpos+(vnf.current-idxlend);
					}
				}
				else{

					/* sample is not looping, so check
						if it reached the last position */

					if(vnf.current>idxsize){

						/* yes, so stop playing this sample */

						vnf.current=0;
						vnf.active=false;
						break;
					}
				}
		}

		/* Vraag een far ptr op van het sampleadres
			op byte offset vnf.current, en hoeveel samples
			daarvan geldig zijn (VOORDAT segment overschrijding optreed) */

		if(Samples[vnf.handle] == null){
			vnf.current=0;
			vnf.active=false;
			break;
		}

		if((vnf.flags & (m_.MDriver.SF_REVERSE)) != 0)
			end = ((vnf.flags & (m_.MDriver.SF_LOOP)) != 0) ? idxlpos : 0;
		else
			end = ((vnf.flags & (m_.MDriver.SF_LOOP)) != 0) ? idxlend : idxsize;

		/* Als de sample simpelweg niet beschikbaar is, of als
			sample gestopt moet worden sample stilleggen en stoppen */
		/* mix 'em: */

                done=NewPredict(vnf.current,end,vnf.increment,todo);

		if(done==0){
/*			printf("predict stopped it. current %ld, end %ld\n",vnf.current,end);
*/			vnf.active=false;
			break;
		}

		/* optimisation: don't mix anything if volume is zero */

		if(vnf.vol != 0){
			SampleMix(Samples[vnf.handle],ptr,ptr_idx,vnf.current,vnf.increment,(short)done);
		}
		vnf.current+=(vnf.increment*done);

		todo-=done;
		ptr_idx+=((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? (done<<1) : done;
	}
}




protected void VC_FillTick(byte buf[],int buf_offset,short todo)
/*
	Mixes 'todo' samples to 'buf'.. The number of samples has
	to fit into the tickbuffer.
*/
{
	int t;

	/* clear the mixing buffer: */

        //memset(VC_TICKBUF,0,(m_.MDriver.md_mode & m_.DMODE_STEREO) ? todo<<3 : todo<<2);
        for(t=0; t < (((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? (todo<<1) : (todo)) ; t++)
            VC_TICKBUF[t] = 0;

	for(t=0;t<m_.MDriver.md_numchn;t++){
		vnf=vinf[t];

		if(vnf.active){
			idxsize=(vnf.size<<FRACBITS)-1;
			idxlpos=vnf.reppos<<FRACBITS;
			idxlend=(vnf.repend<<FRACBITS)-1;
			lvolmul=vnf.lvolmul;
			rvolmul=vnf.rvolmul;
			VC_AddChannel(VC_TICKBUF,todo);
		}
	}

	if((m_.MDriver.md_mode & m_.DMODE_16BITS) != 0)
            //VC_Sample32To16Copy(VC_TICKBUF,(short *)buf,(buf_offset>>1),(m_.MDriver.md_mode & m_.DMODE_STEREO) ? todo<<1 : todo,16-ampshift);
            VC_Sample32To16Copy(VC_TICKBUF,buf,buf_offset,((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? todo<<1 : todo,(short)(16-ampshift));
	else
		VC_Sample32To8Copy(VC_TICKBUF,buf,buf_offset,((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? todo<<1 : todo,(short)(24-ampshift));
}



protected void VC_WritePortion(byte buf[],int buf_offset, short todo)
/*
	Writes 'todo' mixed SAMPLES (!!) to 'buf'. When todo is bigger than the
	number of samples that fit into VC_TICKBUF, the mixing operation is split
	up into a number of smaller chunks.
*/
{
	short part;
        int buf_ptr=buf_offset;
	/* write 'part' samples to the buffer */

	while(todo!=0){
                part=(todo<samplesthatfit)?todo:samplesthatfit;
		VC_FillTick(buf,buf_ptr,part);
		buf_ptr+=samples2bytes(part);
		todo-=part;
	}
}


public void VC_WriteSamples(byte buf[],int todo)
{
	int t;
        short part;
        int buf_ptr=0;

	while(todo>0){

		if(TICKLEFT==0){
                        m_.MDriver.tickhandler();

			TICKLEFT=(125 * m_.MDriver.md_mixfreq) / (50 * m_.MDriver.md_bpm);

			/* compute volume, frequency counter & panning parameters for each channel. */

			for(t=0;t<m_.MDriver.md_numchn;t++){
				int pan,vol,lvol,rvol;

				if(vinf[t].kick){
					vinf[t].current=(vinf[t].start << FRACBITS);
					vinf[t].active=true;
					vinf[t].kick=false;
				}

				if(vinf[t].frq==0) vinf[t].active=false;

				if(vinf[t].active){
					vinf[t].increment=fraction2long(vinf[t].frq,m_.MDriver.md_mixfreq);

					if((vinf[t].flags & (m_.MDriver.SF_REVERSE)) != 0) vinf[t].increment=-vinf[t].increment;

					vol=vinf[t].vol;
					pan=vinf[t].pan;

					if((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0){
						lvol=(vol*((pan<128) ? 128 : (255-pan))) / 128;
						rvol=(vol*((pan>128) ? 128 : pan)) / 128;
						vinf[t].lvolmul=(maxvol*lvol)/64;
						vinf[t].rvolmul=(maxvol*rvol)/64;
					}
					else{
						vinf[t].lvolmul=(maxvol*vol)/64;
					}
				}
			}
		}

                part=(short)((TICKLEFT<todo) ? TICKLEFT : todo);

		VC_WritePortion(buf,buf_ptr,part);

		TICKLEFT-=part;
		todo-=part;

		buf_ptr+=samples2bytes(part);
	}
}


public int VC_WriteBytes(byte buf[],int todo)
/*
	Writes 'todo' mixed chars (!!) to 'buf'. It returns the number of
	chars actually written to 'buf' (which is rounded to number of samples
	that fit into 'todo' bytes).
*/
{
	todo=bytes2samples(todo);
	VC_WriteSamples(buf,todo);
	return samples2bytes(todo);
}


public void VC_SilenceBytes(byte buf[],short todo)
/*
	Fill the buffer with 'todo' bytes of silence (it depends on the mixing
	mode how the buffer is filled)
*/
{
        int i;

        /* clear the buffer to zero (16 bits
	   signed ) or 0x80 (8 bits unsigned) */

	if((m_.MDriver.md_mode & m_.DMODE_16BITS) != 0)
        {
            //memset(buf,0,todo);
            for(i=0;i<todo;i++)
                buf[i] = 0;
        }
        else
        {
            //memset(buf,0x80,todo);
            for(i=0;i<todo;i++)
                buf[i] = (byte)0x80;
            
        }
}


public void VC_PlayStart()
{
	int t;

	for(t=0;t<32;t++){
		vinf[t].current=0;
		vinf[t].flags=0;
		vinf[t].handle=0;
		vinf[t].kick=false;
		vinf[t].active=false;
		vinf[t].frq=10000;
		vinf[t].vol=0;
		vinf[t].pan=((t&1) != 0)?((short)0):((short)255);
	}

	if(m_.MDriver.md_numchn>0)	/* sanity check - avoid core dump! */
		maxvol=16777216 / (m_.MDriver.md_numchn);
	else
		maxvol=16777216;

	/* instead of using a amplifying lookup table, I'm using a simple shift
	   amplify now.. amplifying doubles with every extra 4 channels, and also
	   doubles in stereo mode.. this seems to give similar volume levels
	   across the channel range */

	ampshift=m_.MDriver.md_numchn/8;
/*	if(md_mode & m_.DMODE_STEREO) ampshift++;*/

	if((m_.MDriver.md_mode & m_.DMODE_INTERP) != 0)
		iWhichSampleMixFunc = ((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? 3 : 2;
	else
		iWhichSampleMixFunc = ((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) ? 1 : 0;
	/*
	if(md_mode & m_.DMODE_INTERP)
		SampleMix=(md_mode & m_.DMODE_STEREO) ? MixStereoInterp : MixMonoInterp;
	else
		SampleMix=(md_mode & m_.DMODE_STEREO) ? MixStereoNormal : MixMonoNormal;
	*/
	samplesthatfit=(short)TICKLSIZE;
	if((m_.MDriver.md_mode & m_.DMODE_STEREO) != 0) samplesthatfit>>=1;
	TICKLEFT=0;
}

protected void SampleMix(byte srce[],int dest[],int dest_offset, int index,int increment,short todo)
{
	if (iWhichSampleMixFunc >= 2)
	{
		if (iWhichSampleMixFunc == 3)
		{
			MixStereoInterp(srce,dest,dest_offset,index,increment,todo);
		}
		else
		{
			MixMonoInterp(srce,dest,dest_offset,index,increment,todo);
		}
	}
	else
	{
		if (iWhichSampleMixFunc == 1)
		{
			MixStereoNormal(srce,dest,dest_offset,index,increment,todo);
		}
		else
		{
			MixMonoNormal(srce,dest,dest_offset,index,increment,todo);
		}
	}
}


public void VC_PlayStop()
{
}


public boolean VC_Init()
{
	return true;
}


public void VC_Exit()
{
}


public void VC_VoiceSetVolume(short voice,short vol)
{
	vinf[voice].vol=vol;
}


public void VC_VoiceSetFrequency(short voice,int frq)
{
	vinf[voice].frq=frq;
}


public void VC_VoiceSetPanning(short voice,short pan)
{
	vinf[voice].pan=pan;
}


public void VC_VoicePlay(short voice,short handle,int start,int size,int reppos,int repend,int flags)
{
	if(start>=size) return;

	if((flags&(m_.MDriver.SF_LOOP)) != 0){
		if(repend>size) repend=size;    /* repend can't be bigger than size */
	}

	vinf[voice].flags=flags;
	vinf[voice].handle=handle;
	vinf[voice].start=start;
	vinf[voice].size=size;
	vinf[voice].reppos=reppos;
	vinf[voice].repend=repend;
	vinf[voice].kick=true;
}

}