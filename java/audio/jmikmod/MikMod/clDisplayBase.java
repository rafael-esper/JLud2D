package audio.jmikmod.MikMod;

public class clDisplayBase extends Object
{
    public clMainBase m_;

    public clDisplayBase () {}
    public clDisplayBase (clMainBase theMain) {m_ = theMain;}
    
    public void display_version()        {}
    public void display_loadbanner()     {}
    public void display_extractbanner()  {}

};
