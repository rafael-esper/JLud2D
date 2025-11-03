function YM2413() {
	if (!this instanceof YM2413) return new YM2413();
	this.version = 0x100;
	this.start = 0;
	this.count = 0;
	this.chip = null;
}

(function(Y){
"use strict";

/**** CONFIG ****/
var cfg = {
	maxcalc:0,	// for logging, # total chan_calc ops to log
	debug:0,	// for logging
	debugLocal:0,
	debugArr:[],
	strict:0	// abort on bad input if true
};

/**** GLOBALS ****/
var _YM = {	//////////// old?
	"FREQ_SH":16,	/* 16.16 fixed point (frequency calculations) */
	"EG_SH":16,	/* 16.16 fixed point (EG timing) */
	"LFO_SH":24,	/*  8.24 fixed point (LFO calculations) */
	"TIMER_SH":16	// 16.16 fixed point (timers calcs)
};
_YM.FREQ_MASK = (1<<_YM.FREQ_SH)-1;

/* envelope output entries */
var _ENV = {
	"BITS":10,
	"MIN_ATT_INDEX":0
};
_ENV.LEN = 1<<_ENV.BITS;
_ENV.STEP = 128.0/_ENV.LEN;
_ENV.MAX_ATT_INDEX = (1<<(_ENV.BITS-2))-1;	/*255*/

/* sinwave entries */
var _SIN = {
	"BITS":10
};
_SIN.LEN = 1<<_SIN.BITS;
_SIN.MASK = _SIN.LEN-1;

var _TL = {
	"BITS":14
};
_TL.RES_LEN = 256;	/* 8 bits addressing (real chip) */
/*  TL_TAB_LEN is calculated as:
*  11 - sinus amplitude bits     (Y axis)
*  2  - sinus sign bit           (Y axis)
*  TL_RES_LEN - sinus resolution (X axis)
*/
_TL.TAB_LEN = 11*2*_TL.RES_LEN;
_TL.tab = new Array(_TL.TAB_LEN);

/* Envelope Generator phases */
var _EG = {
	'DMP':5,
	'ATT':4,
	'DEC':3,
	'SUS':2,
	'REL':1,
	'OFF':0
};

_ENV.QUIET = _TL.TAB_LEN>>5;

/* register number to channel number , slot offset */
var _SLOT = [0,1];


/* key scale level */
/* table is 3dB/octave, DV converts this into 6dB/octave */
/* 0.1875 is bit 0 weight of the envelope counter (volume) expressed in the 'decibel' scale */
_YM.ksl = (function(){
	var DV = 0.1875;
	return [
		/* OCT 0 */
		0.000/DV, 0.000/DV, 0.000/DV, 0.000/DV,
		0.000/DV, 0.000/DV, 0.000/DV, 0.000/DV,
		0.000/DV, 0.000/DV, 0.000/DV, 0.000/DV,
		0.000/DV, 0.000/DV, 0.000/DV, 0.000/DV,
		/* OCT 1 */
		0.000/DV, 0.000/DV, 0.000/DV, 0.000/DV,
		0.000/DV, 0.000/DV, 0.000/DV, 0.000/DV,
		0.000/DV, 0.750/DV, 1.125/DV, 1.500/DV,
		1.875/DV, 2.250/DV, 2.625/DV, 3.000/DV,
		/* OCT 2 */
		0.000/DV, 0.000/DV, 0.000/DV, 0.000/DV,
		0.000/DV, 1.125/DV, 1.875/DV, 2.625/DV,
		3.000/DV, 3.750/DV, 4.125/DV, 4.500/DV,
		4.875/DV, 5.250/DV, 5.625/DV, 6.000/DV,
		/* OCT 3 */
		0.000/DV, 0.000/DV, 0.000/DV, 1.875/DV,
		3.000/DV, 4.125/DV, 4.875/DV, 5.625/DV,
		6.000/DV, 6.750/DV, 7.125/DV, 7.500/DV,
		7.875/DV, 8.250/DV, 8.625/DV, 9.000/DV,
		/* OCT 4 */
		0.000/DV, 0.000/DV, 3.000/DV, 4.875/DV,
		6.000/DV, 7.125/DV, 7.875/DV, 8.625/DV,
		9.000/DV, 9.750/DV,10.125/DV,10.500/DV,
		10.875/DV,11.250/DV,11.625/DV,12.000/DV,
		/* OCT 5 */
		0.000/DV, 3.000/DV, 6.000/DV, 7.875/DV,
		9.000/DV,10.125/DV,10.875/DV,11.625/DV,
		12.000/DV,12.750/DV,13.125/DV,13.500/DV,
		13.875/DV,14.250/DV,14.625/DV,15.000/DV,
		/* OCT 6 */
		0.000/DV, 6.000/DV, 9.000/DV,10.875/DV,
		12.000/DV,13.125/DV,13.875/DV,14.625/DV,
		15.000/DV,15.750/DV,16.125/DV,16.500/DV,
		16.875/DV,17.250/DV,17.625/DV,18.000/DV,
		/* OCT 7 */
		0.000/DV, 9.000/DV,12.000/DV,13.875/DV,
		15.000/DV,16.125/DV,16.875/DV,17.625/DV,
		18.000/DV,18.750/DV,19.125/DV,19.500/DV,
		19.875/DV,20.250/DV,20.625/DV,21.000/DV
	];
})();

/* sustain level table (3dB per step) */
/* 0 - 15: 0, 3, 6, 9,12,15,18,21,24,27,30,33,36,39,42,45 (dB)*/
_YM.sl = (function(){
	var SC = function(db){return (db*1.0/_ENV.STEP)|0;};
	return [
		SC(0), SC(1), SC(2), SC(3), SC(4), SC(5), SC(6), SC(7),
		SC(8), SC(9), SC(10), SC(11), SC(12), SC(13), SC(14), SC(31)
	];
})();

_EG.RATE_STEPS = 8;
_EG.inc = [	// 15*_EG.RATE_STEPS
	/*cycle:0 1  2 3  4 5  6 7*/

	/* 0 */ 0,1, 0,1, 0,1, 0,1, /* rates 00..12 0 (increment by 0 or 1) */
	/* 1 */ 0,1, 0,1, 1,1, 0,1, /* rates 00..12 1 */
	/* 2 */ 0,1, 1,1, 0,1, 1,1, /* rates 00..12 2 */
	/* 3 */ 0,1, 1,1, 1,1, 1,1, /* rates 00..12 3 */

	/* 4 */ 1,1, 1,1, 1,1, 1,1, /* rate 13 0 (increment by 1) */
	/* 5 */ 1,1, 1,2, 1,1, 1,2, /* rate 13 1 */
	/* 6 */ 1,2, 1,2, 1,2, 1,2, /* rate 13 2 */
	/* 7 */ 1,2, 2,2, 1,2, 2,2, /* rate 13 3 */

	/* 8 */ 2,2, 2,2, 2,2, 2,2, /* rate 14 0 (increment by 2) */
	/* 9 */ 2,2, 2,4, 2,2, 2,4, /* rate 14 1 */
	/*10 */ 2,4, 2,4, 2,4, 2,4, /* rate 14 2 */
	/*11 */ 2,4, 4,4, 2,4, 4,4, /* rate 14 3 */

	/*12 */ 4,4, 4,4, 4,4, 4,4, /* rates 15 0, 15 1, 15 2, 15 3 (increment by 4) */
	/*13 */ 8,8, 8,8, 8,8, 8,8, /* rates 15 2, 15 3 for attack */
	/*14 */ 0,0, 0,0, 0,0, 0,0, /* infinity rates for attack and decay(s) */
];

/*note that there is no O(13) in this table - it's directly in the code */
_EG.rate_select = (function(){
	var O = function(a){return (a*_EG.RATE_STEPS)|0;};
	return [	/* Envelope Generator rates (16 + 64 rates + 16 RKS) */
		/* 16 infinite time rates */
		O(14),O(14),O(14),O(14),O(14),O(14),O(14),O(14),
		O(14),O(14),O(14),O(14),O(14),O(14),O(14),O(14),

		/* rates 00-12 */
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),
		O( 0),O( 1),O( 2),O( 3),

		/* rate 13 */
		O( 4),O( 5),O( 6),O( 7),

		/* rate 14 */
		O( 8),O( 9),O(10),O(11),

		/* rate 15 */
		O(12),O(12),O(12),O(12),

		/* 16 dummy rates (same as 15 3) */
		O(12),O(12),O(12),O(12),O(12),O(12),O(12),O(12),
		O(12),O(12),O(12),O(12),O(12),O(12),O(12),O(12)
	];
})();

/*rate  0,    1,    2,    3,    4,   5,   6,   7,  8,  9, 10, 11, 12, 13, 14, 15 */
/*shift 13,   12,   11,   10,   9,   8,   7,   6,  5,  4,  3,  2,  1,  0,  0,  0 */
/*mask  8191, 4095, 2047, 1023, 511, 255, 127, 63, 31, 15, 7,  3,  1,  0,  0,  0 */
_EG.rate_shift = (function(){
	var O = function(a){return (a)|0;};
	return [	/* Envelope Generator counter shifts (16 + 64 rates + 16 RKS) */
		/* 16 infinite time rates */
		O(0),O(0),O(0),O(0),O(0),O(0),O(0),O(0),
		O(0),O(0),O(0),O(0),O(0),O(0),O(0),O(0),

		/* rates 00-12 */
		O(13),O(13),O(13),O(13),
		O(12),O(12),O(12),O(12),
		O(11),O(11),O(11),O(11),
		O(10),O(10),O(10),O(10),
		O( 9),O( 9),O( 9),O( 9),
		O( 8),O( 8),O( 8),O( 8),
		O( 7),O( 7),O( 7),O( 7),
		O( 6),O( 6),O( 6),O( 6),
		O( 5),O( 5),O( 5),O( 5),
		O( 4),O( 4),O( 4),O( 4),
		O( 3),O( 3),O( 3),O( 3),
		O( 2),O( 2),O( 2),O( 2),
		O( 1),O( 1),O( 1),O( 1),

		/* rate 13 */
		O( 0),O( 0),O( 0),O( 0),

		/* rate 14 */
		O( 0),O( 0),O( 0),O( 0),

		/* rate 15 */
		O( 0),O( 0),O( 0),O( 0),

		/* 16 dummy rates (same as 15 3) */
		O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),
		O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0)
	];
})();

_YM.mul = (function(){
	var O = function(a){return (2*a)|0;};
	return [
		/* 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,10,12,12,15,15 */
		O(0.5),O( 1),O( 2),O( 3), O( 4),O( 5),O( 6),O( 7),
		O( 8),O( 9),O(10),O(11), O(12),O(13),O(14),O(15)
	];
})();

/* sin waveform table in 'decibel' scale */
/* two waveforms on OPLL type chips */
_YM.sin = new Array(_SIN.LEN<<1);


/* LFO Amplitude Modulation table (verified on real YM3812)
   27 output levels (triangle waveform); 1 level takes one of: 192, 256 or 448 samples

   Length: 210 elements.

  Each of the elements has to be repeated
  exactly 64 times (on 64 consecutive samples).
  The whole table takes: 64 * 210 = 13440 samples.

We use data>>1, until we find what it really is on real chip...

*/
var _LFO = {
	"AM_TAB_LEN":210,
	"am_table":[
		0,0,0,0,0,0,0,
		1,1,1,1,
		2,2,2,2,
		3,3,3,3,
		4,4,4,4,
		5,5,5,5,
		6,6,6,6,
		7,7,7,7,
		8,8,8,8,
		9,9,9,9,
		10,10,10,10,
		11,11,11,11,
		12,12,12,12,
		13,13,13,13,
		14,14,14,14,
		15,15,15,15,
		16,16,16,16,
		17,17,17,17,
		18,18,18,18,
		19,19,19,19,
		20,20,20,20,
		21,21,21,21,
		22,22,22,22,
		23,23,23,23,
		24,24,24,24,
		25,25,25,25,
		26,26,26,
		25,25,25,25,
		24,24,24,24,
		23,23,23,23,
		22,22,22,22,
		21,21,21,21,
		20,20,20,20,
		19,19,19,19,
		18,18,18,18,
		17,17,17,17,
		16,16,16,16,
		15,15,15,15,
		14,14,14,14,
		13,13,13,13,
		12,12,12,12,
		11,11,11,11,
		10,10,10,10,
		9,9,9,9,
		8,8,8,8,
		7,7,7,7,
		6,6,6,6,
		5,5,5,5,
		4,4,4,4,
		3,3,3,3,
		2,2,2,2,
		1,1,1,1
	],
	"pm_table":[	/* LFO Phase Modulation table (verified on real YM2413) */
		/* FNUM2/FNUM = 0 00xxxxxx (0x0000) */
		0, 0, 0, 0, 0, 0, 0, 0,
		/* FNUM2/FNUM = 0 01xxxxxx (0x0040) */
		1, 0, 0, 0,-1, 0, 0, 0,
		/* FNUM2/FNUM = 0 10xxxxxx (0x0080) */
		2, 1, 0,-1,-2,-1, 0, 1,
		/* FNUM2/FNUM = 0 11xxxxxx (0x00C0) */
		3, 1, 0,-1,-3,-1, 0, 1,
		/* FNUM2/FNUM = 1 00xxxxxx (0x0100) */
		4, 2, 0,-2,-4,-2, 0, 2,
		/* FNUM2/FNUM = 1 01xxxxxx (0x0140) */
		5, 2, 0,-2,-5,-2, 0, 2,
		/* FNUM2/FNUM = 1 10xxxxxx (0x0180) */
		6, 3, 0,-3,-6,-3, 0, 3,
		/* FNUM2/FNUM = 1 11xxxxxx (0x01C0) */
		7, 3, 0,-3,-7,-3, 0, 3
	],
	"AM":0,	// UINT32
	"PM":0	// INT32
};

/* This is not 100% perfect yet but very close */
/*
 - multi parameters are 100% correct (instruments and drums)
 - LFO PM and AM enable are 100% correct
 - waveform DC and DM select are 100% correct
*/
_YM.table = [	// [19][8]
	/* MULT  MULT modTL DcDmFb AR/DR AR/DR SL/RR SL/RR */
	/*   0     1     2     3     4     5     6    7    */
	[0x49, 0x4c, 0x4c, 0x12, 0x00, 0x00, 0x00, 0x00 ],  /* 0 */
	[0x61, 0x61, 0x1e, 0x17, 0xf0, 0x78, 0x00, 0x17 ],  /* 1 */
/*	[0x13, 0x41, 0x16, 0x0e, 0xfd, 0xf4 ,0x23, 0x23,],*/  /* 2 */
	[0x13, 0x41, 0x1e, 0x0d, 0xd7, 0xf7, 0x13, 0x13 ],  /* 2 */
	[0x13, 0x01, 0x99, 0x04, 0xf2, 0xf4, 0x11, 0x23 ],  /* 3 */
	[0x21, 0x61, 0x1b, 0x07, 0xaf, 0x64, 0x40, 0x27 ],  /* 4 */
/*{0x22, 0x21, 0x1e, 0x09, 0xf0, 0x76, 0x08, 0x28 },  */ /* 5 */
	[0x22, 0x21, 0x1e, 0x06, 0xf0, 0x75, 0x08, 0x18 ],  /* 5 */
/*{0x31, 0x22, 0x16, 0x09, 0x90, 0x7f, 0x00, 0x08 },  */ /* 6 */
	[0x31, 0x22, 0x16, 0x05, 0x90, 0x71, 0x00, 0x13 ],  /* 6 */
	[0x21, 0x61, 0x1d, 0x07, 0x82, 0x80, 0x10, 0x17 ],  /* 7 */
	[0x23, 0x21, 0x2d, 0x16, 0xc0, 0x70, 0x07, 0x07 ],  /* 8 */
	[0x61, 0x61, 0x1b, 0x06, 0x64, 0x65, 0x10, 0x17 ],  /* 9 */
/* {0x61, 0x61, 0x0c, 0x08, 0x85, 0xa0, 0x79, 0x07 },  */ /* A */
	[0x61, 0x61, 0x0c, 0x18, 0x85, 0xf0, 0x70, 0x07 ],  /* A */
	[0x23, 0x01, 0x07, 0x11, 0xf0, 0xa4, 0x00, 0x22 ],  /* B */
	[0x97, 0xc1, 0x24, 0x07, 0xff, 0xf8, 0x22, 0x12 ],  /* C */
/* {0x61, 0x10, 0x0c, 0x08, 0xf2, 0xc4, 0x40, 0xc8 },  */ /* D */
	[0x61, 0x10, 0x0c, 0x05, 0xf2, 0xf4, 0x40, 0x44 ],  /* D */
	[0x01, 0x01, 0x55, 0x03, 0xf3, 0x92, 0xf3, 0xf3 ],  /* E */
	[0x61, 0x41, 0x89, 0x03, 0xf1, 0xf4, 0xf0, 0x13 ],  /* F */
	/* drum instruments definitions */
	/* MULTI MULTI modTL  xxx  AR/DR AR/DR SL/RR SL/RR */
	/*   0     1     2     3     4     5     6    7    */
	[0x01, 0x01, 0x16, 0x00, 0xfd, 0xf8, 0x2f, 0x6d ],/* BD(multi verified, modTL verified, mod env - verified(close), carr. env verifed) */
	[0x01, 0x01, 0x00, 0x00, 0xd8, 0xd8, 0xf9, 0xf8 ],/* HH(multi verified), SD(multi not used) */
	[0x05, 0x01, 0x00, 0x00, 0xf8, 0xba, 0x49, 0x55 ]/* TOM(multi,env verified), TOP CYM(multi verified, env verified) */
];

/**** END GLOBALS ****/

/**** FM STRUCTS based on genplus-gx ****/
function FM_SLOT() {
	this.KSR = 0;	/* key scale rate */
	function _rate() {
		this.ar = 0;	/* attack rate: AR<<2 */
		this.d1r = 0;	/* decay rate:  DR<<2 */
		//this.d2r = 0;
		this.rr = 0;	/* release rate:RR<<2 */
		this.ksr = 0;	/* key scale rate: kcode>>KSR */
		this.mul = 1;	/* multiple: mul_tab[ML] */
		this.init = function() {
			this.ar = 0;
			this.d1r = 0;
			//this.d2r = 0;
			this.rr = 0;
			this.ksr = 0;
			this.mul = 1;
		};
	}
	this.rate = new _rate;
	/* Phase Generator */
	this.phase = 0;
	this.freq = 0;
	this.fb_shift = 0;
	this.op1_out = [0,0];
	/* Envelope Generator */
	this.eg_type = 0;	/* percussive/nonpercussive mode  */
	this.state = 0;	/* phase type                     */
	this.tl = 0;	/* total level: TL << 2           */
	this.tll = 0;	/* adjusted now TL                */
	this.volume = 0;	/* envelope counter               */
	this.sl = 0;	/* sustain level: sl_tab[SL]      */
	function _eg() {
		this.dp=0;	// UINT8
		this.ar=0;	// UINT8
		this.d1r=0;	// UINT8
		//this.d2r=0;	// UINT8
		this.rr=0;	// UINT8
		this.rs=0;	// UINT8
		this.init = function(){
			this.dp=0;	// UINT8
			this.ar=0;	// UINT8
			this.d1r=0;	// UINT8
			//this.d2r=0;	// UINT8
			this.rr=0;	// UINT8
			this.rs=0;	// UINT8
		};
	}
	this.eg = {
		sh:new _eg,	// state
		sel:new _eg,
		init:function(){this.sh.init();this.sel.init();}
	};
	this.key = 0;	/* 0 = KEY OFF, >0 = KEY ON */
	this.AMmask = 0;	/* LFO Amplitude Modulation enable mask */
	this.vib = 0;	/* LFO Phase Modulation enable flag (active high)*/
	this.wavetable = 0;	/* waveform select */
}

function FM_CH() {
	this.SLOT = [
		new FM_SLOT(),
		new FM_SLOT()
	];
	this.block_fnum = 0;	/* block+fnum */
	this.fc = 0;	/* Freq. freqement base */
	this.ksl_base = 0;	/* KeyScaleLevel Base step  */
	this.kcode = 0;	/* key code (for key scaling) */
	this.sus = 0;	/* sus on/off (release speed in percussive mode)  */
	this.rhythmType = [0,0];	// to replace hardcoded rhythm; 0=n/a, 1=bd, 2=hh, 3=sn, 4=tt, 5=cy
	this.out = [0,0];	// replaces output[normal, rhythm]
	this.muted = 0;
}

function FM_OPLL(c, r) {
	function _timer() {
		this.cnt = 0;
		this.timer = 0;	// unused for lfo
		this.timer_add = 0;	// aka lfo_*_inc
		this.timer_overflow = 0;	// unused for lfo
		this.init = function() {
			this.cnt = 0;	/* global envelope generator counter  */
			this.timer = 0;	/* global envelope generator counter works at frequency = chipclock/72 */
			this.timer_add = 0;	/* step of eg_timer */
			this.timer_overflow = 0;	/* envelope generator timer overlfows every 1 sample (on real chip) */
		};
	}
	this.eg = new _timer();
	this.lfo = {};
	this.lfo.am = new _timer();	// lfo_am_*
	this.lfo.pm = new _timer();	// lfo_pm_*
	this.noise = {
		"rng":0,	/* 23 bit noise shift register  */
		"phase":0,	/* current noise 'phase' (formerly noise_p)  */
		"period":0	/* current noise period (formerly noise_f) */
	}
	this.address = 0;	/* address register */
	this.status = 0;	/* status flag       */
	this.clock = c||3579545;	/* master clock  (Hz) */
	this.rate = r||44100;	/* sampling rate (Hz)  */
}

function YMX(c,r) {
	this.CH = [
		new FM_CH, new FM_CH, new FM_CH,
		new FM_CH, new FM_CH, new FM_CH,
		new FM_CH, new FM_CH, new FM_CH
	];	/* OPLL chips have 9 channels */
	this.instvol_r = new Array(9);	/* instrument/volume (or volume/volume in percussive mode)  */
	this.rhythm = 0;	/* Rhythm mode  */
	/* instrument settings */
	/*
	  0-user instrument
	  1-15 - fixed instruments
	  16 -bass drum settings
	  17,18 - other percussion instruments
	*/
	this.inst_tab = new Array(19);	// UINT8[19][8]
	this.fn = {"table":new Array(1024)};	/* fnumber->increment counter  */
	this.OPLL = new FM_OPLL(c,r);
}
/**** END FM STRUCTS ****/

/**** FM DEFS based on genplus-gx ****/
_YM.output = [0,0];

/* advance LFO to next sample */
function advance_lfo(x) {
	x.OPLL.lfo.am.cnt += x.OPLL.lfo.am.timer_add;
	if (x.OPLL.lfo.am.cnt>=(_LFO.AM_TAB_LEN<<_YM.LFO_SH))	/* lfo_am_table is 210 elements long */
		x.OPLL.lfo.am.cnt -= (_LFO.AM_TAB_LEN<<_YM.LFO_SH);
	_LFO.AM = _LFO.am_table[x.OPLL.lfo.am.cnt>>_YM.LFO_SH]>>1;
	x.OPLL.lfo.pm.cnt += x.OPLL.lfo.pm.timer_add;
	_LFO.PM = (x.OPLL.lfo.pm.cnt>>_YM.LFO_SH)&7;
}


FM_SLOT.prototype.advance_eg = function(eg_cnt, isCarrier, canRhythm, isRhythm, sus) {
	switch (this.state) {
		case _EG.DMP:	/* dump phase */
			/*dump phase is performed by both operators in each channel*/
			/*when CARRIER envelope gets down to zero level,
			**  phases in BOTH operators are reset (at the same time ?)
			*/
			if (!(eg_cnt&((1<<this.eg.sh.dp)-1))) {
				this.volume += _EG.inc[
					this.eg.sel.dp+
					((eg_cnt>>this.eg.sh.dp)&7)
				];
				if (this.volume>=_ENV.MAX_ATT_INDEX) {
					this.volume = _ENV.MAX_ATT_INDEX;
					this.state = _EG.ATT;
					this.phase = 0;	/* restart Phase Generator  */
				}
			}
			break;
		case _EG.ATT:	/* attack phase */
			if (!(eg_cnt&((1<<this.eg.sh.ar)-1))) {
				this.volume += (~this.volume*_EG.inc[
					this.eg.sel.ar+
					((eg_cnt>>this.eg.sh.ar)&7)
				])>>2;
				if (this.volume<=_ENV.MIN_ATT_INDEX) {
					this.volume = _ENV.MIN_ATT_INDEX;
					this.state = _EG.DEC;
				}
			}
			break;
		case _EG.DEC:	/* decay phase */
			if (!(eg_cnt&((1<<this.eg.sh.d1r)-1))) {
				this.volume += _EG.inc[
					this.eg.sel.d1r+
					((eg_cnt>>this.eg.sh.d1r)&7)
				];
				if (this.volume>=this.sl) {
					this.state = _EG.SUS;
				}
			}
			break;
		case _EG.SUS:	/* sustain phase */
			/* this is important behaviour:
			one can change percusive/non-percussive modes on the fly and
			the chip will remain in sustain phase - verified on real YM3812 */
			if (this.eg_type) {}	/* non-percussive mode (sustained tone), do nothing */
			else {	/* percussive mode */
				/* during sustain phase chip adds Release Rate (in percussive mode) */
				if (!(eg_cnt&((1<<this.eg.sh.rr)-1))) {
					this.volume += _EG.inc[
						this.eg.sel.rr+
						((eg_cnt>>this.eg.sh.rr)&7)
					];
					if (this.volume>=_ENV.MAX_ATT_INDEX) {
						this.volume = _ENV.MAX_ATT_INDEX;
					}
				}
				/* else do nothing in sustain phase */
			}
			break;
		case _EG.REL:	/* release phase */
			/* allowed are only carriers in melody mode and rhythm slots in rhythm mode */
			/*This table shows which operators and on what conditions are allowed to perform EG_REL:
			(a) - always perform EG_REL
			(n) - never perform EG_REL
			(r) - perform EG_REL in Rhythm mode ONLY
			  0: 0 (n),  1 (a)
			  1: 2 (n),  3 (a)
			  2: 4 (n),  5 (a)
			  3: 6 (n),  7 (a)
			  4: 8 (n),  9 (a)
			  5: 10(n),  11(a)
			  6: 12(r),  13(a)
			  7: 14(r),  15(a)
			  8: 16(r),  17(a)
			*/
			if (isCarrier||(canRhythm&&isRhythm)) {	/* exclude modulators in melody channels from performing anything in this mode*/
				if (this.eg_type) {	/* non-percussive mode (sustained tone) */
					if (sus) {	/*and use RS when SUS = ON*/
						if (!(eg_cnt&((1<<this.eg.sh.rs)-1))) {
							this.volume += _EG.inc[
								this.eg.sel.rs+
								((eg_cnt>>this.eg.sh.rs)&7)
							];
							if (this.volume>=_ENV.MAX_ATT_INDEX) {
								this.volume = _ENV.MAX_ATT_INDEX;
								this.state = _EG.OFF;
							}
						}
					}
					else {	/* use RR when SUS = OFF*/
						if (!(eg_cnt&((1<<this.eg.sh.rr)-1))) {
							this.volume += _EG.inc[
								this.eg.sel.rr+
								((eg_cnt>>this.eg.sh.rr)&7)
							];
							if (this.volume>=_ENV.MAX_ATT_INDEX) {
								this.volume = _ENV.MAX_ATT_INDEX;
								this.state = _EG.OFF;
							}
						}
					}
				}
				else {	/* percussive mode */
					if (!(eg_cnt&((1<<this.eg.sh.rs)-1))) {
						this.volume += _EG.inc[
							this.eg.sel.rs+
							((eg_cnt>>this.eg.sh.rs)&7)
						];
						if (this.volume>=_ENV.MAX_ATT_INDEX) {
							this.volume = _ENV.MAX_ATT_INDEX;
							this.state = _EG.OFF;
						}
					}
				}
			}
			break;
		default:
			if (cfg.strict) throw new Error("FM_SLOT::advance_eg("+eg_cnt+") - unsupported state ("+this.state+")");
			break;
	}
};
FM_CH.prototype.advance_eg = function(eg_cnt, canRhythm, isRhythm) {
	this.SLOT[_SLOT[0]].advance_eg(eg_cnt, 0, canRhythm, isRhythm, this.sus);
	this.SLOT[_SLOT[1]].advance_eg(eg_cnt, 1, canRhythm, isRhythm, this.sus);
};


FM_SLOT.prototype.advance_lfo = function(x, block_fnum) {
	var blk, fnum_lfo, offset;
	if (this.vib) {	/* Phase Generator */
		fnum_lfo = ((block_fnum&0x01c0)>>6)<<3;
		block_fnum = block_fnum<<1;
		offset = _LFO.pm_table[_LFO.PM+fnum_lfo];
		if (offset) {	/* LFO phase modulation active */
			block_fnum += offset;
			blk = (block_fnum&0x1c00)>>10;
			this.phase += (x.fn.table[block_fnum&0x03ff]>>(7-blk))*this.rate.mul;
		}
		else {	/* LFO phase modulation  = zero */
			this.phase += this.freq;
		}
	}
	else {	/* LFO phase modulation  = zero */
		this.phase += this.freq;
	}
};
FM_CH.prototype.advance_lfo = function(x) {
	this.SLOT[_SLOT[0]].advance_lfo(x, this.block_fnum);
	this.SLOT[_SLOT[1]].advance_lfo(x, this.block_fnum);
};
/* advance to next sample */
function advance(ym) {
	var i, r = !!(ym.rhythm&0x20);
	ym.OPLL.eg.timer += ym.OPLL.eg.timer_add;
	if (cfg.debug>10) console.log("advance",ym.OPLL.eg.timer,ym.OPLL.eg.timer_overflow);
	while (ym.OPLL.eg.timer>=ym.OPLL.eg.timer_overflow) {
		ym.OPLL.eg.timer -= ym.OPLL.eg.timer_overflow;
		++ym.OPLL.eg.cnt;
		for (i=0; i<9; ++i) {	//9ch*2op
			//_advance_slot_eg(ym, i, 0);
			//_advance_slot_eg(ym, i, 1);
			ym.CH[i].advance_eg(ym.OPLL.eg.cnt, r, i>=6);
		}
	}
	for (i=0; i<9; ++i) {	// 9ch*2op
		//_advance_slot_lfo(ym, i, 0);
		//_advance_slot_lfo(ym, i, 1);
		ym.CH[i].advance_lfo(ym);
	}
	/*  The Noise Generator of the YM3812 is 23-bit shift register.
	*  Period is equal to 2^23-2 samples.
	*  Register works at sampling frequency of the chip, so output
	*  can change on every sample.
	*
	*  Output of the register and input to the bit 22 is:
	*  bit0 XOR bit14 XOR bit15 XOR bit22
	*
	*  Simply use bit 22 as the noise output.
	*/
	ym.OPLL.noise.phase += ym.OPLL.noise.period;
	i = ym.OPLL.noise.phase>>_YM.FREQ_SH;	/* number of events (shifts of the shift register) */
	ym.OPLL.noise.phase &= _YM.FREQ_MASK;
	while (i) {
		/*
		  Instead of doing all the logic operations above, we
		  use a trick here (and use bit 0 as the noise output).
		  The difference is only that the noise bit changes one
		  step ahead. This doesn't matter since we don't know
		  what is real state of the noise_rng after the reset.
		*/
		if ((ym.OPLL.noise.rng&1)>0) ym.OPLL.noise.rng ^= 0x800302;
		ym.OPLL.noise.rng >>= 1;
		--i;
	}
}

function op_calc(phase, env, pm, tab, fb) {
	var p = (env<<5)+_YM.sin[tab+
		((((phase&~_YM.FREQ_MASK)+(pm<<(fb?0:17)))>>_YM.FREQ_SH)&_SIN.MASK)
	];
	if (p>=_TL.TAB_LEN) return 0;
	else return _TL.tab[p];
}

FM_SLOT.prototype.calcVol = function(){return this.tll+((this.volume|0)+(_LFO.AM&this.AMmask));};

/* calculate output */
FM_CH.prototype.calculate = function(){
	var env, out, pm, i = 0, s;
	/* SLOT 1 */
	s = _SLOT[i]; env = this.SLOT[s].calcVol();
	out = (this.SLOT[s].op1_out[0]+this.SLOT[s].op1_out[1])|0;
	this.SLOT[s].op1_out[0] = this.SLOT[s].op1_out[1]|0;
	pm = this.SLOT[s].op1_out[0];
	this.SLOT[s].op1_out[1] = 0;
	if (env<_ENV.QUIET) {
		if (!this.SLOT[s].fb_shift) out = 0;
		this.SLOT[s].op1_out[1] = op_calc(this.SLOT[s].phase, env, (out<<this.SLOT[s].fb_shift), this.SLOT[s].wavetable, 1);
	}
	/* SLOT 2 */
	s = _SLOT[++i]; env = this.SLOT[s].calcVol();
	if (env<_ENV.QUIET) {
		this.out[0] += op_calc(this.SLOT[s].phase, env, pm, this.SLOT[s].wavetable, 0);
		// TODO: replace _YM.output with FM_CH.out here
	}
};


/*
  operators used in the rhythm sounds generation process:

  Envelope Generator:

channel  operator  register number   Bass  High  Snare Tom  Top
/ slot   number    TL ARDR SLRR Wave Drum  Hat   Drum  Tom  Cymbal
 6 / 0   12        50  70   90   f0  +
 6 / 1   15        53  73   93   f3  +
 7 / 0   13        51  71   91   f1        +
 7 / 1   16        54  74   94   f4              +
 8 / 0   14        52  72   92   f2                    +
 8 / 1   17        55  75   95   f5                          +

  Phase Generator:

channel  operator  register number   Bass  High  Snare Tom  Top
/ slot   number    MULTIPLE          Drum  Hat   Drum  Tom  Cymbal
 6 / 0   12        30                +
 6 / 1   15        33                +
 7 / 0   13        31                      +     +           +
 7 / 1   16        34                -----  n o t  u s e d -----
 8 / 0   14        32                                  +
 8 / 1   17        35                      +                 +

channel  operator  register number   Bass  High  Snare Tom  Top
number   number    BLK/FNUM2 FNUM    Drum  Hat   Drum  Tom  Cymbal
   6     12,15     B6        A6      +

   7     13,16     B7        A7            +     +           +

   8     14,17     B8        A8            +           +     +

*/

/* calculate rhythm */
function calculateRhythm(x, n){
	if (cfg.debug>10) console.log("rhythm_calc",n);
	var out, env, pm;	/* pm = phase modulation input (SLOT 2) */
	var c, s;
	/* Bass Drum (verified on real YM3812):
	- depends on the channel 6 'connect' register:
	    when connect = 0 it works the same as in normal (non-rhythm) mode (op1->op2->out)
	    when connect = 1 _only_ operator 2 is present on output (op2->out), operator 1 is ignored
	- output sample always is multiplied by 2
	*/
	/* SLOT 1 */
	s = 0, c = 6;
	env = x.CH[c].SLOT[_SLOT[s]].calcVol();
	out =  x.CH[c].SLOT[_SLOT[s]].op1_out[0]+ x.CH[c].SLOT[_SLOT[s]].op1_out[1];
	x.CH[c].SLOT[_SLOT[s]].op1_out[0] =  x.CH[c].SLOT[_SLOT[s]].op1_out[1];
	pm =  x.CH[c].SLOT[_SLOT[s]].op1_out[0];
	x.CH[c].SLOT[_SLOT[s]].op1_out[1] = 0;
	if (env<_ENV.QUIET) {
		if (!x.CH[c].SLOT[_SLOT[s]].fb_shift) out = 0;
		x.CH[c].SLOT[_SLOT[s]].op1_out[1] = op_calc(x.CH[c].SLOT[_SLOT[s]].phase, env, out<<x.CH[c].SLOT[_SLOT[s]].fb_shift, x.CH[c].SLOT[_SLOT[s]].wavetable, 1);
	}
	/* SLOT 2 */
	++s; env = x.CH[c].SLOT[_SLOT[s]].calcVol();
	if (env<_ENV.QUIET) {
		x.CH[c].out[1] += op_calc(x.CH[c].SLOT[_SLOT[s]].phase, env, pm, x.CH[c].SLOT[_SLOT[s]].wavetable, 0);
		// TODO: replace _YM.output with FM_CH.out here
	}
	var p;
	var psh7 =  x.CH[7].SLOT[_SLOT[0]].phase>>_YM.FREQ_SH,
		/* base frequency derived from operator 1 in channel 7 */
		b7 = (psh7>>7)&1, b3 = (psh7>>3)&1, b2 = (psh7>>2)&1, r1 = (b2^b7)|b3;
	var psh8 = x.CH[8].SLOT[_SLOT[1]].phase>>_YM.FREQ_SH,
		/* enable gate based on frequency of operator 2 in channel 8 */
		b5e = (psh8>>5)&1, b3e = (psh8>>3)&1, r2 = (b5e|b3e);
	/* High Hat (verified on real YM3812) */
	s = 0, c = 7; env = x.CH[c].SLOT[_SLOT[s]].calcVol();
	if (env<_ENV.QUIET) {
		/* high hat phase generation:
		  phase = d0 or 234 (based on frequency only)
		  phase = 34 or 2d0 (based on noise)
		*/
		/* when res1 = 0 phase = 0x000 | 0xd0; */
		/* when res1 = 1 phase = 0x200 | (0xd0>>2); */
		p = r1?(0x200|(0xd0>>2)):0xd0;
		/* when res2 = 0 pass the phase from calculation above (res1); */
		/* when res2 = 1 phase = 0x200 | (0xd0>>2); */
		if (r2) p = (0x200|(0xd0>>2));
		if (p&0x200) {
			/* when phase & 0x200 is set and noise=1 then phase = 0x200|0xd0 */
			/* when phase & 0x200 is set and noise=0 then phase = 0x200|(0xd0>>2), ie no change */
			if (n) p = 0x200|0xd0;
		}
		else {
			/* when phase & 0x200 is clear and noise=1 then phase = 0xd0>>2 */
			/* when phase & 0x200 is clear and noise=0 then phase = 0xd0, ie no change */
			if (n) p = 0xd0>>2;
		}
		x.CH[c].out[1] += op_calc(p<<_YM.FREQ_SH, env, 0, x.CH[c].SLOT[_SLOT[s]].wavetable, 0);
		// TODO: replace _YM.output with FM_CH.out here
	}
	/* Snare Drum (verified on real YM3812) */
	++s; env = x.CH[c].SLOT[_SLOT[s]].calcVol();
	if (env<_ENV.QUIET) {
		/* base frequency derived from operator 1 in channel 7 */
		var b8 = ((x.CH[c].SLOT[_SLOT[0]].phase>>_YM.FREQ_SH)>>8)&1;
		/* when bit8 = 0 phase = 0x100; */
		/* when bit8 = 1 phase = 0x200; */
		p = b8?0x200:0x100;
		/* Noise bit XOR'es phase by 0x100 */
		/* when noisebit = 0 pass the phase from calculation above */
		/* when noisebit = 1 phase ^= 0x100; */
		/* in other words: phase ^= (noisebit<<8); */
		if (n) p ^= 0x100;
		x.CH[c].out[1] += op_calc(p<<_YM.FREQ_SH, env, 0, x.CH[c].SLOT[_SLOT[s]].wavetable, 0);
		// TODO: replace _YM.output with FM_CH.out here
	}
	/* Tom Tom (verified on real YM3812) */
	s = 0, c = 8; env = x.CH[c].SLOT[_SLOT[s]].calcVol();
	if (env<_ENV.QUIET) {
		x.CH[c].out[1] += op_calc(x.CH[c].SLOT[_SLOT[s]].phase, env, 0, x.CH[c].SLOT[_SLOT[s]].wavetable, 0);
		// TODO: replace _YM.output with FM_CH.out here
	}
	/* Top Cymbal (verified on real YM2413) */
	++s; env = x.CH[c].SLOT[_SLOT[s]].calcVol();
	if (env<_ENV.QUIET) {
		/* when res1 = 0 phase = 0x000 | 0x100; */
		/* when res1 = 1 phase = 0x200 | 0x100; */
		p = r1?0x300:0x100;
		/* when res2 = 0 pass the phase from calculation above (res1); */
		/* when res2 = 1 phase = 0x200 | 0x100; */
		if (r2) p = 0x300;
		x.CH[c].out[1] += op_calc(p<<_YM.FREQ_SH, env, 0, x.CH[c].SLOT[_SLOT[s]].wavetable, 0);
		// TODO: replace _YM.output with FM_CH.out here
	}
};

/* generic table initialize */
function init_tables(ym) {
	if (cfg.debug) console.log("init_tables",ym.CH.length);
	var d, i, x;	// signed int
	var n;	// signed int
	var o, m;	// double
	var q, z;
	/* build Linear Power Table */
	var tmp = (_ENV.STEP/32.0), sh = (1<<16), rl2 = _TL.RES_LEN<<1;
	for (x=0; x<_TL.RES_LEN; ++x) {
		m = sh/Math.pow(2, (x+1)*tmp);
		//m = m|0;	// m = Math.floor(m);	// extraneous, folded into next calculation +neo
		/* we never reach (1<<16) here due to the (x+1) */
		/* result fits within 16 bits at maximum */
		//n = m|0;	/* 16 bits here */
		//n >>= 4;	/* 12 bits here */
		n = (m|0)>>4;
		if (n&1) n = (n>>1)+1;	/* round to nearest */
		else n = n>>1;
		/* 11 bits here (rounded) */
		z = x<<1;
		_TL.tab[z+0] = n;
		_TL.tab[z+1] = -n;
		for (i=1; i<11; ++i) {
			q = (z+0+i*rl2)|0;
			_TL.tab[q] = _TL.tab[z]>>i;
			_TL.tab[q+1] = -_TL.tab[q];
		}
	}
	//console.log("TL_TABLE",_TL.tab.join(", "));
	/* build Logarithmic Sinus table */
	q = Math.PI/_SIN.LEN, z = 8.0/Math.log(2.0), tmp = 2.0/(_ENV.STEP*0.25), d = (1<<(_SIN.BITS-1));
	for (i=0; i<_SIN.LEN; ++i) {	/* non-standard sinus */
		m = Math.sin(((i<<1)+1)*q);	/* checked against the real chip */
		/* we never reach zero here due to ((i*2)+1) */
		/* convert to 'decibels' */
		if (m>0.0) o = Math.log(1.0/m)*z;
		else o = Math.log(-1.0/m)*z;
		//o = o/(_ENV.STEP/4);	// folded into next calculation +neo
		n = (o*tmp)|0; //n = (2.0*o)|0;
		if (n&1) n = (n>>1)+1;	/* round to nearest */
		else n = n>>1;
		/* waveform 0: standard sinus  */
		_YM.sin[i] = (n<<1)+(m>=0.0?0:1);
		/* waveform 1:  __      __     */
		/*             /  \____/  \____*/
		/* output only first half of the sinus waveform (positive one) */
		if ((i&d)>0) _YM.sin[_SIN.LEN+i] = _TL.TAB_LEN;
		else _YM.sin[_SIN.LEN+i] = _YM.sin[i];
	}
}

var OPLL = {};

OPLL.init = function(x, sc) {
	var i, fsh = 64.0*sc*(1<<(_YM.FREQ_SH-10)),	/* -10 because chip works with 10.10 fixed point, while we use 16.16 */
		lsh = sc*(1<<_YM.LFO_SH),
		esh = (1<<_YM.EG_SH);
	for (i=0; i<1024; ++i) {	/* make fnumber -> increment counter table */
		x.fn.table[i] = (i*fsh)|0;	/* OPLL (YM2413) phase increment counter = 18bit */
	}
	/* Amplitude modulation: 27 output levels (triangle waveform); 1 level takes one of: 192, 256 or 448 samples */
	x.OPLL.lfo.am.timer_add = (lsh/64.0)|0;	/* One entry from LFO_AM_TABLE lasts for 64 samples */
	x.OPLL.lfo.pm.timer_add = (lsh/1024.0)|0;	/* Vibrato: 8 output levels (triangle waveform); 1 level takes 1024 samples */
	x.OPLL.noise.period = ((1<<_YM.FREQ_SH)*sc/1.0)|0;	/* Noise generator: a step takes 1 sample */
	x.OPLL.eg.timer_add = (esh*sc/1.0)|0;
	x.OPLL.eg.timer_overflow = (esh)|0;
};

FM_SLOT.prototype.keyOn = function(ks) {
	if (!this.key) this.state = _EG.DMP;	/* do NOT restart Phase Generator (verified on real YM2413); phase -> Dump */
	this.key = (this.key|ks)|0;
};
FM_SLOT.prototype.keyOff = function(kc) {
	if (this.key) {
		this.key = (this.key&kc)|0;
		if (!this.key) {
			if (this.state>_EG.REL) this.state = _EG.REL;	/* phase -> Release */
		}
	}
};
FM_SLOT.prototype.calc_fc = function(fc, kc, sus) {
	var ksr, rs, dp, q;
	this.freq = fc*this.rate.mul;	/* (frequency) phase increment counter */
	ksr = (kc>>this.KSR)|0;
	if (this.rate.ksr!=ksr) {
		this.rate.ksr = ksr;
		q = this.rate.ar+ksr;
		if (q<78) {	/* calculate envelope generator rates */ // 16+62
			this.eg.sh.ar = _EG.rate_shift[q];
			this.eg.sel.ar = _EG.rate_select[q];
		}
		else {
			this.eg.sh.ar = 0;
			this.eg.sel.ar = 13*_EG.RATE_STEPS;
		}
		q = this.rate.d1r+ksr;
		this.eg.sh.d1r = _EG.rate_shift[q];
		this.eg.sel.d1r = _EG.rate_select[q];
		q = this.rate.rr+ksr;
		this.eg.sh.rr = _EG.rate_shift[q];
		this.eg.sel.rr = _EG.rate_select[q];
	}
	//if (sus) rs = 36;	// 16+(5<<2)
	//else rs = 44;	// 16+(7<<2)
	rs = 16+((sus?5:7)<<2);
	q = rs+ksr;
	this.eg.sh.rs = _EG.rate_shift[q];
	this.eg.sel.rs = _EG.rate_select[q];
	dp = 16+(13<<2);
	q = dp+ksr;
	this.eg.sh.dp = _EG.rate_shift[q];
	this.eg.sel.dp = _EG.rate_select[q];
};

/* set multi,am,vib,EG-TYP,KSR,mul */
FM_CH.prototype.set_mul = function(s, v) {
	this.SLOT[s].rate.mul = _YM.mul[v&0x0f];
	this.SLOT[s].KSR = ((v&0x10)>0)?0:2;
	this.SLOT[s].eg_type = (v&0x20)|0;
	this.SLOT[s].vib = (v&0x40)|0;
	this.SLOT[s].AMmask = ((v&0x80)>0)?~0:0;
	this.SLOT[s].calc_fc(this.fc, this.kcode, this.sus);
};

/* set ksl, tl */
FM_CH.prototype.set_ksl_tl = function(v) {	/* modulator */
	var ksl = (v>>6)|0;	/* 0 / 1.5 / 3.0 / 6.0 dB/OCT */
	this.SLOT[_SLOT[0]].rate.ksl = ksl>0?3-ksl:31;
	this.SLOT[_SLOT[0]].tl = (v&0x3f)<<(_ENV.BITS-2-7);	/* 7 bits TL (bit 6 = always 0) */
	this.SLOT[_SLOT[0]].tll = this.SLOT[_SLOT[0]].tl+(this.ksl_base>>this.SLOT[_SLOT[0]].rate.ksl);
};

/* set ksl , waveforms, feedback */
FM_CH.prototype.set_ksl_wave_fb = function(v) {
	/* modulator */
	this.SLOT[_SLOT[0]].wavetable = (((v&0x08)>>3)|0)*_SIN.LEN;
	this.SLOT[_SLOT[0]].fb_shift = ((v&7)|0)?(v&7)+8:0;
	/*carrier*/
	this.SLOT[_SLOT[1]].wavetable = (((v&0x10)>>4)|0)*_SIN.LEN;
	v = (v>>6)|0;	/* 0 / 1.5 / 3.0 / 6.0 dB/OCT */
	this.SLOT[_SLOT[1]].rate.ksl = v?3-v:31;
	this.SLOT[_SLOT[1]].tll = this.SLOT[_SLOT[1]].tl+(this.ksl_base>>this.SLOT[_SLOT[1]].rate.ksl);
};

/* set attack rate & decay rate  */
FM_SLOT.prototype.set_ar_dr = function(v) {
	this.rate.ar = (v>>4)>0?16+((v>>4)<<2):0;
	var q = this.rate.ar+this.rate.ksr;
	if (q<78) {	// 16+62
		this.eg.sh.ar = _EG.rate_shift[q];
		this.eg.sel.ar = _EG.rate_select[q];
	}
	else {
		this.eg.sh.ar = 0;
		this.eg.sel.ar = 13*_ENV.RATE_STEPS;
	}
	this.rate.d1r = (v&0x0f)>0?16+((v&0x0f)<<2):0;
	q = this.rate.d1r+this.rate.ksr;
	this.eg.sh.d1r = _EG.rate_shift[q];
	this.eg.sel.d1r = _EG.rate_select[q];
};

/* set sustain level & release rate */
FM_SLOT.prototype.set_sl_rr = function(v) {
	this.sl = _YM.sl[v>>4]|0;
	this.rate.rr = (v&0x0f)>0?16+((v&0x0f)<<2):0;
	var q = this.rate.rr+this.rate.ksr;
	this.eg.sh.rr = _EG.rate_shift[q];
	this.eg.sel.rr = _EG.rate_select[q];
};

FM_CH.prototype.load_instrument = function(inst) {
	this.set_mul(_SLOT[0], inst[0]);
	this.set_mul(_SLOT[1], inst[1]);
	this.set_ksl_tl(inst[2]);
	this.set_ksl_wave_fb(inst[3]);
	this.SLOT[_SLOT[0]].set_ar_dr(inst[4]);
	this.SLOT[_SLOT[1]].set_ar_dr(inst[5]);
	this.SLOT[_SLOT[0]].set_sl_rr(inst[6]);
	this.SLOT[_SLOT[1]].set_sl_rr(inst[7]);
};

function update_instrument_zero(ym, r) {
	var ch, ch_max = 9;
	if ((ym.rhythm&0x20)|0) ch_max = 6;
	var f = function(x,c,i){};
	switch (r&7) {
		case 0:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].set_mul(_SLOT[0], i[0]);};
			break;
		case 1:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].set_mul(_SLOT[1], i[1]);};
			break;
		case 2:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].set_ksl_tl(i[2]);};
			break;
		case 3:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].set_ksl_wave_fb(i[3]);};
			break;
		case 4:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].SLOT[_SLOT[0]].set_ar_dr(i[4]);};
			break;
		case 5:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].SLOT[_SLOT[1]].set_ar_dr(i[5]);};
			break;
		case 6:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].SLOT[_SLOT[0]].set_sl_rr(i[6]);};
			break;
		case 7:
			f = function(x,c,i) {if (!(x.instvol_r[c]&0xf0)) x.CH[c].SLOT[_SLOT[1]].set_sl_rr(i[7]);};
			break;
	}
	for (ch=0; ch<ch_max; ++ch) f(ym,ch,ym.inst_tab[0]);
}

/* write a value v to register r on chip chip */
OPLL.WriteReg = function(x, r, v) {
	var ch, block_fnum, blk;
	var eb = _ENV.BITS-2-7;
	r &= 0xff, v &= 0xff;	/* adjust bus to 8 bits */
	switch (r&0xf0) {
		case 0x00:	/* 00-0f:control */
			switch (r&0x0f) {
				case 0x00:	/* AM/VIB/EGTYP/KSR/MULTI (modulator) */
				case 0x01:	/* AM/VIB/EGTYP/KSR/MULTI (carrier) */
				case 0x02:	/* Key Scale Level, Total Level (modulator) */
				case 0x03:	/* Key Scale Level, carrier waveform, modulator waveform, Feedback */
				case 0x04:	/* Attack, Decay (modulator) */
				case 0x05:	/* Attack, Decay (carrier) */
				case 0x06:	/* Sustain, Release (modulator) */
				case 0x07:	/* Sustain, Release (carrier) */
					x.inst_tab[0][r] = v;
					update_instrument_zero(x, r);
					break;
				case 0x0e:	/* x, x, r,bd,sd,tom,tc,hh */
					if (v&0x20) {
						/* rhythm OFF to ON */
						if ((x.rhythm&0x20)===0) {
							/* Load instrument settings for channel seven(chan=6 since we're zero based).*/
							x.CH[6].load_instrument(x.inst_tab[16]);
							/* Load instrument settings for channel eight. (High hat and snare drum) */
							x.CH[7].load_instrument(x.inst_tab[17]);
							x.CH[7].SLOT[_SLOT[0]].tl = ((x.instvol_r[7]>>4)<<2)<<(eb);	/* 7 bits TL (bit 6 = always 0) */
							x.CH[7].SLOT[_SLOT[0]].tll = x.CH[7].SLOT[_SLOT[0]].tl+(x.CH[7].ksl_base>>x.CH[7].SLOT[_SLOT[0]].rate.ksl);
							/* Load instrument settings for channel nine. (Tom-tom and top cymbal) */
							x.CH[8].load_instrument(x.inst_tab[18]);	/* modulator envelope is TOM */
							x.CH[8].SLOT[_SLOT[0]].tl = ((x.instvol_r[8]>>4)<<2)<<(eb);	/* 7 bits TL (bit 6 = always 0) */
							x.CH[8].SLOT[_SLOT[0]].tll = x.CH[8].SLOT[_SLOT[0]].tl+(x.CH[8].ksl_base>>x.CH[8].SLOT[_SLOT[0]].rate.ksl);
						}
						/* BD key on/off */
						if ((v&0x10)>0) {
							x.CH[6].SLOT[_SLOT[0]].keyOn(2),
							x.CH[6].SLOT[_SLOT[1]].keyOn(2);
						}
						else {
							x.CH[6].SLOT[_SLOT[0]].keyOff(~2),
							x.CH[6].SLOT[_SLOT[1]].keyOff(~2);
						}
						/* HH key on/off */
						if ((v&0x01)>0) x.CH[7].SLOT[_SLOT[0]].keyOn(2);
						else x.CH[7].SLOT[_SLOT[0]].keyOff(~2);
						/* SD key on/off */
						if ((v&0x08)>0) x.CH[7].SLOT[_SLOT[1]].keyOn(2);
						else x.CH[7].SLOT[_SLOT[1]].keyOff(~2);
						/* TOM key on/off */
						if ((v&0x04)>0) x.CH[8].SLOT[_SLOT[0]].keyOn(2);
						else x.CH[8].SLOT[_SLOT[0]].keyOff(~2);
						/* TOP-CY key on/off */
						if ((v&0x02)>0) x.CH[8].SLOT[_SLOT[1]].keyOn(2);
						else x.CH[8].SLOT[_SLOT[1]].keyOff(~2);
					}
					else {
						/* rhythm ON to OFF */
						if ((x.rhythm&0x20)>0) {
							/* Load instrument settings for channel seven(chan=6 since we're zero based).*/
							x.CH[6].load_instrument(x.inst_tab[x.instvol_r[6]>>4]);
							/* Load instrument settings for channel eight.*/
							x.CH[7].load_instrument(x.inst_tab[x.instvol_r[7]>>4]);
							/* Load instrument settings for channel nine.*/
							x.CH[8].load_instrument(x.inst_tab[x.instvol_r[8]>>4]);
						}
						/* BD key off */
						x.CH[6].SLOT[_SLOT[0]].keyOff(~2);
						x.CH[6].SLOT[_SLOT[1]].keyOff(~2);
						/* HH key off */
						x.CH[7].SLOT[_SLOT[0]].keyOff(~2);
						/* SD key off */
						x.CH[7].SLOT[_SLOT[1]].keyOff(~2);
						/* TOM key off */
						x.CH[8].SLOT[_SLOT[0]].keyOff(~2);
						/* TOP-CY off */
						x.CH[8].SLOT[_SLOT[1]].keyOff(~2);
					}
					x.rhythm = (v&0x3f)|0;
					break;
				case 0x0f:	/* test reg */
					break;
			}
			break;
		case 0x10:
		case 0x20:
			//ch = r&0x0f; if (ch>=9) ch -= 9;	/* verified on real YM2413 */
			ch = (r&0x0f)%9;
			block_fnum = x.CH[ch].block_fnum;
			var msg = "write ch="+ch;
			if ((r&0x10)>0) {	/* 10-18: FNUM 0-7 */
				block_fnum = (x.CH[ch].block_fnum&0x0f00)|v;
				if (cfg.debug>2&&ch===0) msg += (" fnum-lsb="+(v&0xff));
			}
			else {	/* 20-28: suson, keyon, block, FNUM 8 */
				block_fnum = ((v&0x0f)<<8)|(x.CH[ch].block_fnum&0xff);
				if ((v&0x10)|0) {
					x.CH[ch].SLOT[_SLOT[0]].keyOn(1);
					x.CH[ch].SLOT[_SLOT[1]].keyOn(1);
				}
				else {
					x.CH[ch].SLOT[_SLOT[0]].keyOff(~1);
					x.CH[ch].SLOT[_SLOT[1]].keyOff(~1);
				}
				x.CH[ch].sus = (v&0x20)|0;
				if (cfg.debug>2&&ch===0) msg += (" fnum-msb="+(v&0x0f)+" sus="+(v&0x20)+" key="+(v&0x10));
			}
			if (x.CH[ch].block_fnum!=block_fnum) {	/* update */
				if (cfg.debug>2&&ch===0) msg += " update fnum=x"+block_fnum.toString(16);
				x.CH[ch].block_fnum = block_fnum|0;
				x.CH[ch].kcode = (block_fnum&0x0f00)>>8;	/* BLK 2,1,0 bits -> bits 3,2,1 of kcode, FNUM MSB -> kcode LSB */
				x.CH[ch].ksl_base = _YM.ksl[block_fnum>>5];
				block_fnum = block_fnum<<1;
				blk = (block_fnum&0x1c00)>>10;
				x.CH[ch].fc = x.fn.table[block_fnum&0x03ff]>>(7-blk);
				/* refresh Total Level in both SLOTs of this channel */
				x.CH[ch].SLOT[_SLOT[0]].tll = x.CH[ch].SLOT[_SLOT[0]].tl+(x.CH[ch].ksl_base>>x.CH[ch].SLOT[_SLOT[0]].rate.ksl);
				x.CH[ch].SLOT[_SLOT[1]].tll = x.CH[ch].SLOT[_SLOT[1]].tl+(x.CH[ch].ksl_base>>x.CH[ch].SLOT[_SLOT[1]].rate.ksl);
				/* refresh frequency counter in both SLOTs of this channel */
				x.CH[ch].SLOT[_SLOT[0]].calc_fc(x.CH[ch].fc|0, x.CH[ch].kcode|0, x.CH[ch].sus);
				x.CH[ch].SLOT[_SLOT[1]].calc_fc(x.CH[ch].fc|0, x.CH[ch].kcode|0, x.CH[ch].sus);
				if (cfg.debug>2&&ch===0) msg += (' kcode=x'+x.CH[ch].kcode.toString(16)+' fc=x'+x.CH[ch].fc.toString(16));
			}
			if (cfg.debug>2&&ch===0) console.log(msg);
			break;
		case 0x30:	/* inst 4 MSBs, VOL 4 LSBs */
			//ch = r&0x0f; if (ch>=9) ch -= 9;	/* verified on real YM2413 */
			ch = (r&0x0f)%9;
			x.CH[ch].SLOT[_SLOT[1]].tl = ((v&0x0f)<<2)<<(eb);	/* 7 bits TL (bit 6 = always 0) */
			x.CH[ch].SLOT[_SLOT[1]].tll = x.CH[ch].SLOT[_SLOT[1]].tl+(x.CH[ch].ksl_base>>x.CH[ch].SLOT[_SLOT[1]].rate.ksl);
			if (ch>=6&&(x.rhythm&0x20)>0) {	/* we're in rhythm mode*/
				if (ch>=7) {	/* only for channel 7 and 8 (channel 6 is handled in usual way)*/
					/* modulator envelope is HH(chan=7) or TOM(chan=8) */
					x.CH[ch].SLOT[_SLOT[0]].tl = ((v>>4)<<2)<<(eb);	/* 7 bits TL (bit 6 = always 0) */
					x.CH[ch].SLOT[_SLOT[0]].tll = x.CH[ch].SLOT[_SLOT[0]].tl+(x.CH[ch].ksl_base>>x.CH[ch].SLOT[_SLOT[0]].rate.ksl);
				}
			}
			else {
				if (cfg.debug>2&&ch===0) console.log("load_instrument",(v>>4));
				if ((x.instvol_r[ch]&0xf0)!==(v&0xf0)) {
					x.instvol_r[ch] = v;	/* store for later use */
					x.CH[ch].load_instrument(x.inst_tab[(v>>4)|0]);
				}
			}
			break;
		default:
			break;
	}
	// TODO
};
/**** END FM DEFS ****/

/**** YM2413 API based on genplus-gx ****/

Y.prototype.init = function(clock,rate){
	if (cfg.debug) console.log("OPLL::init("+clock+','+rate+")");
	if (!this.chip) this.chip = new YMX(clock, rate);
	else this.chip.OPLL.clock = clock||3579545, this.chip.OPLL.rate = rate||44100;
	this.ratio = 72;	/* chip is running a ZCLK / 72 = MCLK / 15 / 72 */
	this.scale = (this.chip.OPLL.clock/this.chip.OPLL.rate)/this.ratio;	/* YM2413 always running at original frequency */
	init_tables(this.chip);
	OPLL.init(this.chip, this.scale);
};
Y.prototype.reset = function(){
	if (cfg.debug) console.log("OPLL::reset");
	var c, s, i;
	this.chip.OPLL.eg.timer = 0;
	this.chip.OPLL.eg.cnt = 0;
	this.chip.OPLL.noise.rng = 1;	/* noise shift register */
	/* setup instruments table */
	for (i=0; i<19; ++i) {
		//if (!this.chip.inst_tab[i]) this.chip.inst_tab[i] = new Array(8);
		//else this.chip.inst_tab[i].length = 8;
		//for (c=0; c<8; ++c) this.chip.inst_tab[i][c] = _YM.table[i][c]|0;
		this.chip.inst_tab[i] = _YM.table[i].slice();
	}
	/* reset with register write */
	OPLL.WriteReg(this.chip, 0x0f, 0);	/*test reg*/
	for (i=0x3f; i>=0x10; --i) OPLL.WriteReg(this.chip, i, 0x00);
	for (c=0; c<9; ++c) {	/* reset operator parameters */
		//if (c!=0) this.chip.CH[c].muted = 1;
		for (s=0; s<2; ++s) {
			this.chip.CH[c].SLOT[_SLOT[s]].wavetable = 0;
			this.chip.CH[c].SLOT[_SLOT[s]].state = _EG.OFF;
			this.chip.CH[c].SLOT[_SLOT[s]].volume = _ENV.MAX_ATT_INDEX;
		}
	}
};
Y.prototype.update = function(len){
	//if(cfg.debug>1) console.log("==== YM::update","samples="+len);
	var out, tmp = [0,0], buf = [[],[]];
	cfg.debugArr.length = 0;
	var c, r, i = -1; while (++i<len) {
		//_YM.output[0] = 0, _YM.output[1] = 0;
		tmp[0] = 0, tmp[1] = 0;
		out = 0; r = !!(this.chip.rhythm&0x20);
		advance_lfo(this.chip);
		/* FM part */
		c = -1; while (++c<6) {
			this.chip.CH[c].out[0] = 0, this.chip.CH[c].out[1] = 0;
			this.chip.CH[c].calculate();
			if (!this.chip.CH[c].muted) tmp[0] += this.chip.CH[c].out[0];
			if (c===0&&(--cfg.debugLocal>0)) cfg.debugArr[cfg.debugArr.length] = this.chip.CH[c].out[0];
		}
		if (!r) {
			c = 6; while (c<9) {
				this.chip.CH[c].out[0] = 0, this.chip.CH[c].out[1] = 0;
				this.chip.CH[c].calculate();
				if (!this.chip.CH[c].muted) tmp[0] += this.chip.CH[c].out[0];
				++c;
			}
		}
		else {	/* Rhythm part */
			this.chip.CH[6].out[0] = 0, this.chip.CH[6].out[1] = 0;
			this.chip.CH[7].out[0] = 0, this.chip.CH[7].out[1] = 0;
			this.chip.CH[8].out[0] = 0, this.chip.CH[8].out[1] = 0;
			calculateRhythm(this.chip, (this.chip.OPLL.noise.rng>>0)&1);
			tmp[1] += (this.chip.CH[6].muted?0:this.chip.CH[6].out[1])+
				(this.chip.CH[7].muted?0:this.chip.CH[7].out[1])+
				(this.chip.CH[8].muted?0:this.chip.CH[8].out[1]);
		}
		/* Melody (MO) & Rhythm (RO) outputs mixing & amplification (latched bit controls FM output) */
		out = ((tmp[0]+(tmp[1]<<1))<<1)*this.chip.OPLL.status;
		/* Store to stereo sound buffer */
		buf[0][i] = out;
		buf[1][i] = out;
		advance(this.chip);
	}
	// if (cfg.debugLocal) console.log(cfg.debugArr.join(", "));
	return buf;
};

/* YM2413 I/O interface */
Y.prototype.write = function(a,v){
	if (cfg.debug>1) console.log("OPLL::write",a.toString(16),v.toString(16));
	//// simplified address write +neo
	v &= 0xff;	/* adjust to 8 bit bus */
	this.chip.OPLL.address = a&0xff;
	OPLL.WriteReg(this.chip, this.chip.OPLL.address, v);
	//if (!(a&2)) ;
	//else {
		this.chip.OPLL.status = 1;//v&0x01;	/* latched bit (Master System specific) */
	//}
};
Y.prototype.read = function(a){	/* D0=latched bit, D1-D2 need to be zero (Master System specific) */
	return 0xF8|this.chip.OPLL.status;
};
//Y.prototype.getContext = function(){};
})(YM2413);
