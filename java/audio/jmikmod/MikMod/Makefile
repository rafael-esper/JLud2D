# A GNU make makefile for MikMod for Java
# 
# May be compatible with other make programs too, but I cannot guarantee
# that
#

COMPILE = javac

CFLAGS = -g -sourcepath . -deprecation

LOADERS = MikMod/Loaders/MOD_Loader.class \
        MikMod/Loaders/S3M_Loader.class \
        MikMod/Loaders/M15_Loader.class \
        MikMod/Loaders/UNI_Loader.class \
        MikMod/Loaders/MTM_Loader.class \
        MikMod/Loaders/S69_Loader.class \
        MikMod/Loaders/ULT_Loader.class \
        MikMod/Loaders/XM_Loader.class \
        MikMod/Loaders/STM_Loader.class

DRIVERS = \
		MikMod/Drivers/JavaX_Driver.class  \
        MikMod/Drivers/NS_Driver.class  \
        MikMod/Drivers/Native_Driver.class \
		MikMod/Drivers/Raw_Driver.class  \
		MikMod/Drivers/Wav_Driver.class

OBJS =  MikMod/MMIO/MMIO.class \
        MikMod/clMainBase.class \
        MikMod/MUniTrk/clMUniTrk.class \
        MikMod/MLoader/clMLoader.class  \
        MikMod/clDisplayBase.class \
        MikMod/UNIMOD.class \
        MikMod/INSTRUMENT.class \
        MikMod/SAMPLE.class \
        MikMod/ENVPT.class \
        MikMod/curmod.class \
        MikMod/clLOADER.class \
        $(LOADERS)


MIKCVT_OBJS = MikMod/clMDriverBase.class \
        MikMod/clMikCvtMain.class \
        MikCvtApp.class



MIKMOD_OBJS = MikMod/ENVPR.class MikMod/AUDTMP.class MikMod/VINFO.class \
        MikMod/UI/myUI.class MikMod/MDriver/clMDriver.class MikMod/Display/clDisplay.class \
        MikMod/clMain.class MikMod/MPlayer/clMPlayer.class MikMod/Virtch/clVirtch.class \
        MikMod/clDRIVER.class \
        $(DRIVERS) \
        MikModApp.class


all: mikcvt mikmod

$(OBJS) $(MIKMOD_OBJS) $(MIKCVT_OBJS): %.class: %.java
	$(COMPILE) $(CFLAGS) $<

#$(MIKMOD_OBJS): %.class: %.java
#	$(COMPILE) $(CFLAGS) $<

#$(MIKCVT_OBJS): %.class: %.java
#	$(COMPILE) $(CFLAGS) $<

native_driver: dummy
	make -C dll/

dummy:


mikcvt: $(OBJS) $(MIKCVT_OBJS)

# mikmod: $(OBJS) $(MIKMOD_OBJS) native_driver
mikmod: $(OBJS) $(MIKMOD_OBJS)
