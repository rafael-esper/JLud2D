/*

Name:
MUNITRK.C

Description:
All routines dealing with the manipulation of UNITRK(tm) streams

Portability:
All systems - all compilers

*/
package audio.jmikmod.MikMod.MUniTrk;

import audio.jmikmod.MikMod.*;

public class clMUniTrk extends Object
{
	public audio.jmikmod.MikMod.clMainBase m_;

    /*
        all known effects:
    */

    public static final short UNI_NOTE=1;
    public static final short UNI_INSTRUMENT=2;
    public static final short UNI_PTEFFECT0=3;
    public static final short UNI_PTEFFECT1=4;
    public static final short UNI_PTEFFECT2=5;
    public static final short UNI_PTEFFECT3=6;
    public static final short UNI_PTEFFECT4=7;
    public static final short UNI_PTEFFECT5=8;
    public static final short UNI_PTEFFECT6=9;
    public static final short UNI_PTEFFECT7=10;
    public static final short UNI_PTEFFECT8=11;
    public static final short UNI_PTEFFECT9=12;
    public static final short UNI_PTEFFECTA=13;
    public static final short UNI_PTEFFECTB=14;
    public static final short UNI_PTEFFECTC=15;
    public static final short UNI_PTEFFECTD=16;
    public static final short UNI_PTEFFECTE=17;
    public static final short UNI_PTEFFECTF=18;
    public static final short UNI_S3MEFFECTA=19;
    public static final short UNI_S3MEFFECTD=20;
    public static final short UNI_S3MEFFECTE=21;
    public static final short UNI_S3MEFFECTF=22;
    public static final short UNI_S3MEFFECTI=23;
    public static final short UNI_S3MEFFECTQ=24;
    public static final short UNI_S3MEFFECTT=25;
    public static final short UNI_XMEFFECTA=26;
    public static final short UNI_XMEFFECTG=27;
    public static final short UNI_XMEFFECTH=28;
    public static final short UNI_XMEFFECTP=29;

    /*
            Unimod flags
    */
    
    public static final int UF_XMPERIODS =  1;               /* if set use XM periods/finetuning */
    public static final int UF_LINEAR    =  2;               /* if set use LINEAR periods */

        

	public short [] rowstart;		/* startadress of a row */
	public int rowend; //short *rowend;      	/* endaddress of a row (exclusive) */
	public int rowpc; //short *rowpc;       	/* current unimod(tm) programcounter */

	public short [] unibuf;		/* pointer to the temporary unitrk buffer */
	public int unimax;		/* maximum number of bytes to be written to this buffer */

	public int unipc;			/* index in the buffer where next opcode will be written */
	public int unitt;        	/* holds index of the rep/len byte of a row */
	public int lastp;			/* holds index to the previous row (needed for compressing) */


protected static final int BUFPAGE = 128;            /* smallest unibuffer size */
protected static final int TRESHOLD = 16;

/* unibuffer is increased by BUFPAGE
  bytes when unipc reaches unimax-TRESHOLD */



/*
	Ok.. I'll try to explain the new internal module format.. so here it goes:


	The UNITRK(tm) Format:
	======================

	A UNITRK stream is an array of bytes representing a single track
	of a pattern. It's made up of 'repeat/length' bytes, opcodes and
	operands (sort of a assembly language):

	rrrlllll
	[REP/LEN][OPCODE][OPERAND][OPCODE][OPERAND] [REP/LEN][OPCODE][OPERAND]..
	^                                         ^ ^
	|-------ROWS 0 - 0+REP of a track---------| |-------ROWS xx - xx+REP of a track...


	The rep/len byte contains the number of bytes in the current row,
	_including_ the length byte itself (So the LENGTH byte of row 0 in the
	previous example would have a value of 5). This makes it easy to search
	through a stream for a particular row. A track is concluded by a 0-value
	length byte.

	The upper 3 bits of the rep/len byte contain the number of times -1 this
	row is repeated for this track. (so a value of 7 means this row is repeated
	8 times)

	Opcodes can range from 1 to 255 but currently only opcodes 1 to 19 are
	being used. Each opcode can have a different number of operands. You can
	find the number of operands to a particular opcode by using the opcode
	as an index into the 'unioperands' table.

*/

//protected short unioperands[256]={
protected short unioperands[]={
	0,              /* not used */
	1,              /* UNI_NOTE */
	1,              /* UNI_INSTRUMENT */
	1,              /* UNI_PTEFFECT0 */
	1,              /* UNI_PTEFFECT1 */
	1,              /* UNI_PTEFFECT2 */
	1,              /* UNI_PTEFFECT3 */
	1,              /* UNI_PTEFFECT4 */
	1,              /* UNI_PTEFFECT5 */
	1,              /* UNI_PTEFFECT6 */
	1,              /* UNI_PTEFFECT7 */
	1,              /* UNI_PTEFFECT8 */
	1,              /* UNI_PTEFFECT9 */
	1,              /* UNI_PTEFFECTA */
	1,              /* UNI_PTEFFECTB */
	1,              /* UNI_PTEFFECTC */
	1,              /* UNI_PTEFFECTD */
	1,              /* UNI_PTEFFECTE */
	1,              /* UNI_PTEFFECTF */
	1,				/* UNI_S3MEFFECTA */
	1,              /* UNI_S3MEFFECTD */
	1,              /* UNI_S3MEFFECTE */
	1,              /* UNI_S3MEFFECTF */
	1,              /* UNI_S3MEFFECTI */
	1,              /* UNI_S3MEFFECTQ */
	1,				/* UNI_S3MEFFECTT */
	1,				/* UNI_XMEFFECTA */
	1,				/* UNI_XMEFFECTG */
	1,				/* UNI_XMEFFECTH */
	1				/* UNI_XMEFFECTP */
};


/***************************************************************************
>>>>>>>>>>> Next are the routines for reading a UNITRK stream: <<<<<<<<<<<<<
***************************************************************************/

public clMUniTrk(clMainBase theMain)
{
        m_ = theMain;
    
	rowstart = null;
	rowend = 0;
	rowpc = 0;
	unibuf = null;
	unimax = 0;
	unipc = 0;
	unitt = 0;
	lastp = 0;
}

public void UniSetRow(short [] t, int start_at)
{
	rowstart=t;
	rowpc = start_at; //rowpc=rowstart;
	rowend = rowpc+(rowstart[rowpc++]&0x1f); //rowend=rowstart+(*(rowpc++)&0x1f);
}


public short UniGetByte()
{
    //return (rowpc<rowend) ? *(rowpc++) : 0;
    return (rowpc<rowend) ? rowstart[rowpc++] : 0;
}


public void UniSkipOpcode(short op)
{
	short t=unioperands[op];
	while((t--)!=0) UniGetByte();
}


public int UniFindRow(short [] t,int row)
/*
	Finds the address of row number 'row' in the UniMod(tm) stream 't'

	returns NULL if the row can't be found.
*/
{
        short c,l;
        int tp=0;

	while(true){

		c=t[tp];					/* get rep/len byte */

		if(c == 0) return -1;		/* zero ? -> end of track.. */

		l=(short)((c>>5)+1);				/* extract repeat value */

		if(l>row) break;		/* reached wanted row? -> return pointer */

		row-=l;					/* havn't reached row yet.. update row */
		tp+=c&0x1f;				/* point t to the next row */
	}

	return tp;
}



/***************************************************************************
>>>>>>>>>>> Next are the routines for CREATING UNITRK streams: <<<<<<<<<<<<<
***************************************************************************/

public void UniReset()
/*
	Resets index-pointers to create a new track.
*/
{
	unitt=0;		/* reset index to rep/len byte */
	unipc=1;		/* first opcode will be written to index 1 */
	lastp=0;		/* no previous row yet */
	unibuf[0]=0;	/* clear rep/len byte */
}


public void UniWrite(short data)
/*
	Appends one byte of data to the current row of a track.
*/
{
	/* write byte to current position and update */

        data &= 0xFF;
	unibuf[unipc++]=data;

	/* Check if we've reached the end of the buffer */

	if(unipc>(unimax-TRESHOLD)){

		short newbuf[];

		/* We've reached the end of the buffer, so expand
		   the buffer by BUFPAGE bytes */

                // newbuf=(short *)realloc(unibuf,(unimax+BUFPAGE)*2);
                newbuf = new short[unimax+BUFPAGE];

		/* Check if realloc succeeded */

                if(newbuf!=null){
                        int i;
                        for (i=0; i<unimax; i++)
                            newbuf[i] = unibuf[i];
                        //delete [] unibuf;
						unibuf = null;

                        unibuf=newbuf;
			unimax+=BUFPAGE;
		}
		else{
			/* realloc failed, so decrease unipc so we won't write beyond
			   the end of the buffer.. I don't report the out-of-memory
			   here; the UniDup() will fail anyway so that's where the
			   loader sees that something went wrong */

			unipc--;
		}
	}
}


public void UniInstrument(short ins)
/*
	Appends UNI_INSTRUMENT opcode to the unitrk stream.
*/
{
	UniWrite(UNI_INSTRUMENT);
	UniWrite(ins);
}


public void UniNote(short note)
/*
	Appends UNI_NOTE opcode to the unitrk stream.
*/
{
	UniWrite(UNI_NOTE);
	UniWrite(note);
}


public void UniPTEffect(short eff,short dat)
/*
	Appends UNI_PTEFFECTX opcode to the unitrk stream.
*/
{
    eff &= 0xFF;
    dat &= 0xFF;
    
	if(eff!=0 || dat!=0){				/* don't write empty effect */
		UniWrite((short)(UNI_PTEFFECT0+eff));
		UniWrite(dat);
	}
}


public boolean MyCmp(short a[], int a_offset, short b[], int b_offset, int l)
{
	int t;

        for(t=0;t<l;t++){
                if (a[t+a_offset] != b[t+b_offset]) return false;
	}
	return true;
}


public void UniNewline()
/*
	Closes the current row of a unitrk stream (updates the rep/len byte)
	and sets pointers to start a new row.
*/
{
	int n,l,len;

	n=(unibuf[lastp]>>5)+1;		/* repeat of previous row */
	l=(unibuf[lastp]&0x1f);		/* length of previous row */

	len=unipc-unitt;			/* length of current row */

	/* Now, check if the previous and the current row are identical..
	   when they are, just increase the repeat field of the previous row */

	if(n<8 && len==l && MyCmp(unibuf, lastp+1, unibuf, unitt+1,(len-1))){
		unibuf[lastp]+=(short)0x20;
		unipc=unitt+1;
	}
	else{
		/* current and previous row aren't equal.. so just update the pointers */

		unibuf[unitt]=(short)len;
		lastp=unitt;
		unitt=unipc;
		unipc++;
	}
}


public short [] UniDup()
/*
	Terminates the current unitrk stream and returns a pointer
	to a copy of the stream.
*/
{
        int i;
	short d[];

	unibuf[unitt]=0;

	/*if((d=(short *)malloc(unipc*2))==NULL){
		m_->mmIO->myerr=m_->ERROR_ALLOC_STRUCT;
		return NULL;
        }*/
        d = new short [unipc];

        //memcpy(d,unibuf,unipc*2);
        for(i=0; i<unipc; i++)
            d[i] = unibuf[i];
        
	return d;
}


public int TrkLen(short t[])
/*
	Determines the length (in rows) of a unitrk stream 't'
*/
{
	int len=0;
    short c;
    int tp=0;

    while((c=(short)(t[tp]&0x1f)) != 0)
    {
		len+=c;
		tp+=c;
	}
	len++;

	return len;
}


public boolean UniInit()
{
	unimax=BUFPAGE;

	/*if(!(unibuf=(short *)malloc(unimax*2))){
		m_->mmIO->myerr=m_->ERROR_ALLOC_STRUCT;
		return 0;
        }*/
        unibuf = new short [unimax];
	return true;
}


public void UniCleanup()
{
        //delete [] unibuf;

        unibuf=null;
}

}
