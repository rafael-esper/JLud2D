package persist;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.EOFException;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;

/**
 * Based on SimulatedRandomAccessFile code
 * Added seek function
 * Idea to implement this way: 
 * http://stackoverflow.com/questions/4897599/SimulatedRandomAccessFile-like-api-for-in-memory-byte-array
 *
 */
public class SimulatedRandomAccessFile extends ByteArrayInputStream {

	static final Logger log = LogManager.getLogger(SimulatedRandomAccessFile.class);
	
	long filelength;
	long position;
	
	public SimulatedRandomAccessFile(byte[] buf) {
		super(buf);
		filelength = buf.length;
	}
	
	// Alternative using Apache IOUtils
	/*public SimulatedSimulatedRandomAccessFile(File file) throws FileNotFoundException, IOException {
		super(IOUtils.toByteArray(new FileInputStream(file)));
	}*/
	
	public SimulatedRandomAccessFile(File file) throws IOException {
		super(readFileAsByteArray(new FileInputStream(file)));
		this.filelength = file.length();
		log.info("Constructor: SimulatedRandomAccessFile(file). " + filelength);
	}
	
	public SimulatedRandomAccessFile(String filename) throws IOException {
		this(new File(filename));
		log.info("Constructor: SimulatedRandomAccessFile(String)");
	}

	public SimulatedRandomAccessFile(URL filename) throws IOException, URISyntaxException {
		super(readFileAsByteArray(filename.openStream()));
		this.filelength = readFileLength;
	}

	static int readFileLength;
	private static byte[] readFileAsByteArray(InputStream fin) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		int a = fin.read();
		while (a != -1) {
			out.write(a); //copy streams
			a = fin.read();
		}

		byte[] result = out.toByteArray();
		readFileLength = result.length;
		
		return result;
	}

	public void seek(long pos) {
		this.reset();
		this.skip(pos);
		position = pos;
	}
	
	public final int readInt() throws IOException {
		  int ch1 = this.read();
		  int ch2 = this.read();
		  int ch3 = this.read();
		  int ch4 = this.read();
		  position = position + 4;
		  if ((ch1 | ch2 | ch3 | ch4) < 0)
			  throw new EOFException();
		  return ((ch1 << 24) + (ch2 << 16) + (ch3 << 8) + (ch4 << 0));
	}
	
	public final char readChar() throws IOException {
		int ch1 = this.read();
		  int ch2 = this.read();
		  position = position + 2;
		  if ((ch1 | ch2) < 0)
			  throw new EOFException();
		  return (char)((ch1 << 8) + (ch2 << 0));
	}
	
	public int read(byte b[]) throws IOException {
		position = position + b.length;
		return super.read(b);
	}
	
	public int read(byte b[], int off, int len) {
		position = position + len;
		return super.read(b, off, len);
	}

	public int length() {
		return (int)filelength;
	}

	public int getFilePointer() throws IOException {
		return (int) position;
	}

	public void write(byte[] buf, int i, int j) throws IOException {
		// DO NOTHING
	}

	public void writeBytes(String string) throws IOException {
		// DO NOTHING
	}
	
	public static void main (String args[]) throws IOException {
		
		/*RandomAccessFile raf = new RandomAccessFile(new File("C:\\t.txt"), "rw");
		raf.writeInt(10);
		raf.writeInt(20);
		raf.writeInt(30);
		raf.writeInt(40);
		raf.writeChars("Random");
		raf.close();*/
		
		/*RandomAccessFile raf2 = new RandomAccessFile(new File("C:\\t.txt"), "rw");
		raf2.seek(8);
		log.info(raf2.readInt());
		log.info(raf2.readInt());
		log.info(raf2.readChar());
		log.info(raf2.readChar());
		raf2.close();*/
		
		
		SimulatedRandomAccessFile raf2 = new SimulatedRandomAccessFile(new File("C:\\t.txt"));
		raf2.seek(8);
		log.info(raf2.readInt());
		log.info(raf2.readInt());
		log.info(raf2.readChar());
		log.info(raf2.readChar());
		raf2.close();

	}	
	
	
}


