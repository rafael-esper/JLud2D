/*

Name:
MMIO.C

Description:
Miscellaneous I/O routines.. used to solve some portability issues
(like big/little endian machines and word alignment in structures )
Also includes mikmod's ingenious error handling variable + some much
used error strings.

Portability:
All systems - all compilers

*/
package audio.jmikmod.MikMod.MMIO;

import java.io.IOException;

import persist.SimulatedRandomAccessFile;
import audio.jmikmod.MikMod.clMainBase;


public class MMIO extends Object
{
	public audio.jmikmod.MikMod.clMainBase m_;

	public String myerr;
	public String myerr_file;

	protected int _mm_iobase;

	public final int SEEK_SET = 0;
	public final int SEEK_CUR = 1;
        public final int SEEK_END = 2;

        public final int EOF = -1;

public MMIO(clMainBase theMain)
{
    m_ = theMain;
    myerr = new String();
    myerr_file = new String();
}


public int _mm_fseek(SimulatedRandomAccessFile stream, int offset, int whence) 
{
	try {
        if (whence == SEEK_SET)
            stream.seek(offset+_mm_iobase);
        else if (whence == SEEK_CUR)
            stream.seek(stream.getFilePointer()+offset);
        else  // SEEK_END
            stream.seek(stream.length()+offset);
        return 0;
	}
	catch(IOException ioe1)
	{
		return 0;
	}
	/*return fseek(stream,
				 (whence==SEEK_SET) ? offset+_mm_iobase : offset,
				 whence);*/
}

public int _mm_rewind(SimulatedRandomAccessFile  x)	 
{
    return _mm_fseek(x,0,SEEK_SET);
}

public int _mm_ftell(SimulatedRandomAccessFile stream)	 
{
	try {
		//return ftell(stream)-_mm_iobase;
		return (int)(stream.getFilePointer() - _mm_iobase);
	}
	catch(IOException ioe1)
	{
		return -1;
	}
}

public void _mm_setiobase(int iobase)
{
	_mm_iobase=iobase;
}

public void _mm_write_SBYTE(byte data,SimulatedRandomAccessFile fp)	 
{
	try {
        //fputc(data,fp);
        byte buf[] = new byte[1];
        buf[0] = data;
        fp.write(buf,0,1);
	}
	catch(IOException ioe1)
	{
	}
}

public void _mm_write_UBYTE(short data,SimulatedRandomAccessFile fp)	 
{
	try {
        //fputc(data,fp);
        byte buf[] = new byte[1];
        buf[0] = (data>127) ? ((byte)(data-256)) : ((byte)data);
        fp.write(buf,0,1);
	}
	catch(IOException ioe1)
	{
	}
}

public void _mm_write_M_UWORD(int data,SimulatedRandomAccessFile fp)
	 
{
	_mm_write_UBYTE((short)((data>>8)&0xff),fp);
	_mm_write_UBYTE((short)(data&0xff),fp);
}

public void _mm_write_I_UWORD(int data,SimulatedRandomAccessFile fp)
	 
{
	_mm_write_UBYTE((short)(data&0xff),fp);
	_mm_write_UBYTE((short)((data>>8)&0xff),fp);
}

public void _mm_write_M_SWORD(short data,SimulatedRandomAccessFile fp)
	 
{
        _mm_write_M_UWORD((data<0)?(((int)data)+0x10000):data,fp);
}

public void _mm_write_I_SWORD(short data,SimulatedRandomAccessFile fp)
	 
{
	_mm_write_I_UWORD((data<0)?(((int)data)+0x10000):data,fp);
}

public void _mm_write_M_ULONG(int data,SimulatedRandomAccessFile fp)
	 
{
	_mm_write_M_UWORD((data>>16)&0xffff,fp);
	_mm_write_M_UWORD(data&0xffff,fp);
}

public void _mm_write_I_ULONG(int data,SimulatedRandomAccessFile fp)
	 
{
	_mm_write_I_UWORD(data&0xffff,fp);
	_mm_write_I_UWORD((data>>16)&0xffff,fp);
}

public void _mm_write_M_SLONG(int data,SimulatedRandomAccessFile fp)
	 
{
	_mm_write_M_ULONG(data,fp);
}

public void _mm_write_I_SLONG(int data,SimulatedRandomAccessFile fp)
	 
{
	_mm_write_I_ULONG(data,fp);
}

public void _mm_write_SBYTES (byte buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){  _mm_write_SBYTE(buffer[pos++],fp); number--; } }
public void _mm_write_UBYTES2 (short buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_UBYTE(buffer[pos++],fp); number--; } }

public void _mm_write_M_SWORDS (short buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_M_SWORD(buffer[pos++],fp); number--; } }
public void _mm_write_M_UWORDS2 (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_M_UWORD(buffer[pos++],fp); number--; } }
public void _mm_write_I_SWORDS (short buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_I_SWORD(buffer[pos++],fp); number--; } }
public void _mm_write_I_UWORDS2 (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_I_UWORD(buffer[pos++],fp); number--; } }

public void _mm_write_M_SLONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_M_SLONG(buffer[pos++],fp); number--; } }
public void _mm_write_M_ULONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_M_ULONG(buffer[pos++],fp); number--; } }
public void _mm_write_I_SLONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_I_SLONG(buffer[pos++],fp); number--; } }
public void _mm_write_I_ULONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ _mm_write_I_ULONG(buffer[pos++],fp); number--; } }


public byte _mm_read_SBYTE(SimulatedRandomAccessFile fp)
{
	byte buf[] = new byte[1];
	fp.read(buf,0,1);
	return buf[0];
}

public short _mm_read_UBYTE(SimulatedRandomAccessFile fp)
	 
{
	//return(fgetc(fp));
    return (short)fp.read();
}

public int _mm_read_M_UWORD(SimulatedRandomAccessFile fp)
	 
{
	int result=((int)_mm_read_UBYTE(fp))<<8;
	result|=_mm_read_UBYTE(fp);
	return result;
}

public int _mm_read_I_UWORD(SimulatedRandomAccessFile fp)
	 
{
	int result=_mm_read_UBYTE(fp);
	result|=((int)_mm_read_UBYTE(fp))<<8;
	return result;
}

public short _mm_read_M_SWORD(SimulatedRandomAccessFile fp)
	 
{
	short result=(short)(_mm_read_UBYTE(fp)<<8);
    result|=_mm_read_UBYTE(fp);
    return result;
	//return((short)_mm_read_M_UWORD(fp));
}

public short _mm_read_I_SWORD(SimulatedRandomAccessFile fp)
	 
{
        short result = _mm_read_UBYTE(fp);
        result |= (short)(_mm_read_UBYTE(fp)<<8);
        return result;
	//return((short)_mm_read_I_UWORD(fp));
}

public int _mm_read_M_ULONG(SimulatedRandomAccessFile fp)
	 
{
	int result=((int)_mm_read_M_UWORD(fp))<<16;
	result|=_mm_read_M_UWORD(fp);
	return result;
}

public int _mm_read_I_ULONG(SimulatedRandomAccessFile fp)
	 
{
	int result=_mm_read_I_UWORD(fp);
	result|=((int)_mm_read_I_UWORD(fp))<<16;
	return result;
}

public int _mm_read_M_SLONG(SimulatedRandomAccessFile fp)
	 
{
	return((int)_mm_read_M_ULONG(fp));
}

public int _mm_read_I_SLONG(SimulatedRandomAccessFile fp)
	 
{
	return((int)_mm_read_I_ULONG(fp));
}

// isEOF is basically a utility function to catch all the
// IOExceptions from the dependandt functions.
// It's also make the code look more like the original
// C source because it corresponds to feof.
public boolean isEOF(SimulatedRandomAccessFile fp)
{
	try {
		return (fp.getFilePointer() < fp.length());
	}
	catch (IOException ioe1)
	{
		return true;
	}
}


public boolean _mm_read_str(byte buffer[],int number,SimulatedRandomAccessFile fp) 	 
{
	//fread(buffer,1,number,fp);
	fp.read(buffer,0,number);
	//return !feof(fp);
	return !isEOF(fp);
}

public boolean _mm_read_SBYTES (byte buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_SBYTE(fp); number--; } return !isEOF(fp); }
public boolean _mm_read_UBYTES2 (short buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_UBYTE(fp); number--; } return !isEOF(fp); }

public boolean _mm_read_M_SWORDS (short buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_M_SWORD(fp); number--; } return !isEOF(fp); }
public boolean _mm_read_M_UWORDS2 (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_M_UWORD(fp); number--; } return !isEOF(fp); }
public boolean _mm_read_I_SWORDS (short buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_I_SWORD(fp); number--; } return !isEOF(fp); }
public boolean _mm_read_I_UWORDS2 (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_I_UWORD(fp); number--; } return !isEOF(fp); }

public boolean _mm_read_M_SLONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_M_SLONG(fp); number--; } return !isEOF(fp); }
public boolean _mm_read_M_ULONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_M_ULONG(fp); number--; } return !isEOF(fp); }
public boolean _mm_read_I_SLONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_I_SLONG(fp); number--; } return !isEOF(fp); }
public boolean _mm_read_I_ULONGS (int buffer[], int number, SimulatedRandomAccessFile fp)  { int pos=0; while(number>0){ buffer[pos++]=_mm_read_I_ULONG(fp); number--; } return !isEOF(fp); }


}
