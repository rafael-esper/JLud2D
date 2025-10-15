package audio.jmikmod;
/*

Name:
MikCvtApp.java

Description:
The Applet class that creates an instance of clMikCvtMain and calls
clMikCvtMain.main() that operates all the runtime code. It calls it with the
necessary "char * argv[]"-like argument.

So far it's a console application (X-Windows need not be run on UNIXes) whose
output corresponds with the UNIX version.

Shlomi Fish <shlomif@ibm.net>

HISTORY   (DD/MM/YY)
=======

v1.00 (20/Dec/96) - first "versioned" version
v1.01 (03/Jan/96) - Removed argc passing, because Java can tell what is the length
of an array length.

 */

import java.applet.*;
import java.awt.*;
import java.net.URL;

import audio.jmikmod.MikMod.*;


public class MikModApp extends Applet implements Runnable
{

	Thread	 m_MikModApp = null;


	boolean m_fStandAlone = false;


	public URL url;


        public static String [] my_argv = null;


        // The main function of a standalone application.
        public static void main(String args[])
	{
		MikModApp applet_MikModApp = new MikModApp();

		applet_MikModApp.m_fStandAlone = true;
                {
                    my_argv = new String[args.length+1];
                    my_argv[0] = new String("mikmod");
                    int i;
                    for(i=0;i<args.length;i++)
                    {
                        my_argv[i+1] = new String(args[i]);
                    }
                }
		applet_MikModApp.init();
		applet_MikModApp.start();
	}

	public MikModApp()
	{
	}

        // Return some text that identifies us
	public String getAppletInfo()
	{
            return "Name: MikModApp: Java version of the mikmod MOD player\r\n" +
                "Original Code: Jean-Paul Mikkers and others\r\n" +
                "Java Porting: Shlomi Fish";
	}


        // init() is useful only for applets.
	public void init()
	{

	}


	public void destroy()
        {
            
	}

        // This function is only used for applets, so it's not implemented
        public void paint(Graphics g)
	{
	}

	public void start()
	{
		if (m_MikModApp == null)
		{
			m_MikModApp = new Thread(this);
			m_MikModApp.start();
		}
	}
	
	public void stop()
	{
		if (m_MikModApp != null)
		{
			m_MikModApp.stop();
			m_MikModApp = null;
		}

	}

	public void run()
        {

            
            audio.jmikmod.MikMod.clMain theMikMod = new audio.jmikmod.MikMod.clMain();
            
            theMikMod.main(my_argv, url);

            stop();

	}




}
