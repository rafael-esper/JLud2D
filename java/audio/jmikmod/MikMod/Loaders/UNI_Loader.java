/*

Name:
LOAD_UNI.C

Description:
UNIMOD (mikmod's internal format) module loader.

Portability:
All systems - all compilers (hopefully)

*/

package audio.jmikmod.MikMod.Loaders;

import java.io.IOException;

import audio.jmikmod.MikMod.clLOADER;
import audio.jmikmod.MikMod.clMainBase;


public class UNI_Loader extends clLOADER
{

public UNI_Loader(clMainBase theMain)
{
        super(theMain);
    
	type = new String("UNI");
	version = new String("Portable UNI loader v0.3");
}


public boolean Test()
{
        byte id[] = new byte[4];
        //if(!fread(id,4,1,m_.MLoader.modfp)) return 0;
        if (m_.MLoader.modfp.read(id,0,4) != 4) return false;
        //if(!memcmp(id,"UN05",4)) return 1;
        if ( ((char)id[0] == 'U') && ((char)id[1] == 'N') &&
             ((char)id[2] == '0') && ((char)id[3] == '5') )
            return true;

        return false;
}


public boolean Init()
{
	return true;
}


public void Cleanup()
{
	;
}

public String StrRead()
{
        byte [] s;
        int len;
        String ret;

	len=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	if(len == 0) return null;

	s= new byte[len+1];
        //fread(s,len,1,m_.MLoader.modfp);
        m_.MLoader.modfp.read(s,0,len);
        
	s[len]=0;

        ret = new String(s, 0, 0, len);
        s = null;
        return ret;
}


public short [] TrkRead()
{
        byte [] t;
        short [] wordTrk;
        int i;
	int len;

	len=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	t= new byte[len];
        //fread(t,len,1,m_.MLoader.modfp);
        m_.MLoader.modfp.read(t,0,len);
        wordTrk = new short[len];
        for(i=0;i<len;i++)
        {
            wordTrk[i] = t[i];
            if (wordTrk[i] < 0)
                wordTrk[i] += 256;
        }
        t = null;
        
        return wordTrk;
}



public boolean Load()
{
        try {

        int t,u;

	m_.mmIO._mm_fseek(m_.MLoader.modfp,4,m_.mmIO.SEEK_SET);

	/* try to read module header */

	m_.MLoader.of.numchn	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	m_.MLoader.of.numpos	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.MLoader.of.reppos	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.MLoader.of.numpat	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.MLoader.of.numtrk	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.MLoader.of.numins	=(short)m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
	m_.MLoader.of.initspeed=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	m_.MLoader.of.inittempo=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
	m_.mmIO._mm_read_UBYTES2(m_.MLoader.of.positions,256,m_.MLoader.modfp);
	m_.mmIO._mm_read_UBYTES2(m_.MLoader.of.panning,32,m_.MLoader.modfp);
	m_.MLoader.of.flags	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

        //if(feof(m_.MLoader.modfp)){
        if (m_.MLoader.modfp.getFilePointer() >= m_.MLoader.modfp.length()) {
		m_.mmIO.myerr=m_.ERROR_LOADING_HEADER;
		return false;
	}

	m_.MLoader.of.songname=StrRead();
	m_.MLoader.of.modtype=StrRead();
	m_.MLoader.of.comment=StrRead();   /* <- new since UN01 */

/*	printf("Song: %s\nModty: %s\n",m_.MLoader.of.songname,m_.MLoader.of.modtype);
*/

	if(!m_.MLoader.AllocInstruments()) return false;
	if(!m_.MLoader.AllocTracks()) return false;
	if(!m_.MLoader.AllocPatterns()) return false;

	/* Read sampleinfos */

	for(t=0;t<m_.MLoader.of.numins;t++){

		//INSTRUMENT *i=&m_.MLoader.of.instruments[t];

		m_.MLoader.of.instruments[t].numsmp=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.mmIO._mm_read_UBYTES2(m_.MLoader.of.instruments[t].samplenumber,96,m_.MLoader.modfp);

		m_.MLoader.of.instruments[t].volflg=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].volpts=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].volsus=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].volbeg=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].volend=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

		for(u=0;u<12;u++){
			m_.MLoader.of.instruments[t].volenv[u].pos=m_.mmIO._mm_read_I_SWORD(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].volenv[u].val=m_.mmIO._mm_read_I_SWORD(m_.MLoader.modfp);
		}

		m_.MLoader.of.instruments[t].panflg=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].panpts=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].pansus=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].panbeg=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].panend=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

		for(u=0;u<12;u++){
			m_.MLoader.of.instruments[t].panenv[u].pos=m_.mmIO._mm_read_I_SWORD(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].panenv[u].val=m_.mmIO._mm_read_I_SWORD(m_.MLoader.modfp);
		}

		m_.MLoader.of.instruments[t].vibtype	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].vibsweep	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].vibdepth	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].vibrate	=m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);

		m_.MLoader.of.instruments[t].volfade	=m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
		m_.MLoader.of.instruments[t].insname	=StrRead();

/*		printf("Ins: %s\n",m_.MLoader.of.instruments[t].insname);
*/
                if(!m_.MLoader.AllocSamples((m_.MLoader.of.instruments[t])))
                    return false;

		for(u=0;u<m_.MLoader.of.instruments[t].numsmp;u++){

			//SAMPLE *s=&m_.MLoader.of.instruments[t].samples[u];

			m_.MLoader.of.instruments[t].samples[u].c2spd	= m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].transpose= m_.mmIO._mm_read_SBYTE(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].volume	= m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].panning	= m_.mmIO._mm_read_UBYTE(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].length	= m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].loopstart= m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].loopend	= m_.mmIO._mm_read_I_ULONG(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].flags	= m_.mmIO._mm_read_I_UWORD(m_.MLoader.modfp);
			m_.MLoader.of.instruments[t].samples[u].seekpos	= 0;

			m_.MLoader.of.instruments[t].samples[u].samplename=StrRead();
		}
	}

	/* Read patterns */

	m_.mmIO._mm_read_I_UWORDS2(m_.MLoader.of.pattrows,m_.MLoader.of.numpat,m_.MLoader.modfp);
	m_.mmIO._mm_read_I_SWORDS(m_.MLoader.of.patterns,m_.MLoader.of.numpat*m_.MLoader.of.numchn,m_.MLoader.modfp);

	/* Read tracks */

	for(t=0;t<m_.MLoader.of.numtrk;t++){
		m_.MLoader.of.tracks[t]=TrkRead();
	}

        return true;

        }
        catch (IOException ioe1)
        {
            return false;
        }
}

}