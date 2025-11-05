(function(){
Function.prototype.method = function(name, func) {if (!this.prototype[name]) this.prototype[name] = func;};

/**** convert unicode string to array of bytes similar to a Sphere ByteArray ****/
String.method('toByteArray', function() {
	var isBigEndian = arguments.length>0?(arguments[0]?1:0):0;
	var r = [], i = -1, c; while (++i<this.length) {
		c = this.charCodeAt(i);
		if (c<256) r.push(c);
		else r.push((isBigEndian?c>>8:c)&0xff, (isBigEndian?c:c>>8)&0xff);
	}
	return r;
});
/**** convert array of bytes similar to a Sphere ByteArray to binary string ****/
String.method('fromByteArray', function(a) {
	/*var r = "", i = -1; while (++i<a.length) {
		r += ""+this.fromCharCode(a[i]);
	}*/
	var r = String.fromCharCode.apply(null, a);
	//console.log("fromByteArray r="+r);
	return r;
});
})();
function VGM(s) {
	if (!this instanceof VGM) return new VGM(s);
	var _ver = 0x00000100;
	this.__defineGetter__('id',function(){return "Vgm ";});
	this.__defineGetter__('ver',function(){return _ver;});
	this.__defineGetter__('version',function(){return (_ver>>8)+'.'+(_ver&0xff).toString(16);});
	this.offsets = {
		'eof':-1,
		'gd3':-1,
		'data':-1
	};
	this.loop = {
		'offset':-1,
		'length':0,
		'base':0,
		'mod':0
	};
	var _len = 0, _rate = 60, _sr = 44100;
	function _pad(n,z) {while(n.toString().length<z)n='0'+''+n;return n;}
	this.__defineGetter__('length',function(){return _len;});
	this.__defineGetter__('time',function(){
		var _s = Math.floor(_len/_sr), _p = _len%_sr;
		var _m = 0, _h = 0;
		if (_s>59) {
			_m = Math.floor(_s/60); _s = _s%60;
			if (_m>59) {
				_h = Math.floor(_m/60); _m = _m%60;
			}
		}
		return _h+":"+_pad(_m,2)+":"+_pad(_s,2)+"."+(_p/_sr).toFixed(3).substr(2);
	});
	this.__defineGetter__('rate',function(){return _rate;});
	var _vmod = 0;
	this.__defineGetter__('vol',function(){return _vmod;});
	this.__defineGetter__('volume',function(){return Math.pow(2, (_vmod>0xc1?_vmod-256:(_vmod===0xc1?-64:_vmod))/0x20);});
	this.clocks = {
		'sn76489':0,
		'ym2413':0,
		'ym2612':0,
		'ym2151':0,
		'pcm':0,
		'rf5c68':0,
		'ym2203':0,
		'ym2608':0,
		'ym2610':0,
		'ym3812':0,
		'ym3526':0,
		'y8950':0,
		'ymf262':0,
		'ymf278b':0,
		'ymf271':0,
		'ymz280b':0,
		'rf5c164':0,
		'pwm':0,
		'ay8910':0
	};
	this.psg = {
		'feedback':0,
		'shiftWidth':0,
		'flags':0
	};
	this.pcm = {
		'register':0
	};
	this.ay = {
		'type':0,
		'flags':{
			'all':0,
			'ym2203':0,
			'ym2608':0
		}
	};

	function _be32(t) {return (_be16(t.substr(0,2))<<16)+(_be16(t.substr(2,2)));}
	function _be16(t) {return _byte(t[1])+(_byte(t[0])<<8);}
	function _le32(t) {return (_le16(t.substr(0,2)))+(_le16(t.substr(2,2))<<16);}
	function _le16(t) {return _byte(t[0])+(_byte(t[1])<<8);}
	function _byte(t) {return t?(t.charCodeAt(0)&0xff):0;}
	function _u16ch(t) {var _t='"\\u'+_pad(_le16(t).toString(16),4)+'"'; /* console.log(_t); */ return eval(_t);}
	function _u16s(t) {
		var r = '', c, _nz = String.fromCharCode(0x0000);
		var i = 0; while (i<t.length) {
			c = _u16ch(t.substr(i,2));
			if (c!==_nz) r += ''+c;
			i += 2;
		}
		return r;
	}
	function _rd0(t,f) {f(t,1); return 1;}
	function _rd8(t,f) {f(t,2); return 2;}
	function _rd16(t,f) {f(t,3); return 3;}
	function _rd24(t,f) {f(t,4); return 4;}
	function _rd32(t,f) {f(t,5); return 5;}
	var _cmd = [];
	_cmd[0x4f] = _rd8;	// game gear psg stereo, write dd to port 0x06
	_cmd[0x50] = _rd8;
	_cmd[0x51] = _rd16;
	_cmd[0x52] = _rd16;
	_cmd[0x53] = _rd16;
	_cmd[0x54] = _rd16;
	_cmd[0x55] = _rd16;
	_cmd[0x56] = _rd16;
	_cmd[0x57] = _rd16;
	_cmd[0x58] = _rd16;
	_cmd[0x59] = _rd16;
	_cmd[0x5a] = _rd16;
	_cmd[0x5b] = _rd16;
	_cmd[0x5c] = _rd16;
	_cmd[0x5d] = _rd16;
	_cmd[0x5e] = _rd16;
	_cmd[0x5f] = _rd16;
	_cmd[0x61] = _rd16;
	_cmd[0x62] = _rd0;
	_cmd[0x63] = _rd0;
	_cmd[0x66] = _rd0;
	_cmd[0x67] = function(t,f) {f(t,7); return 7;};	//0x67	data block
	_cmd[0x68] = function(t,f) {f(t,9); return 9;}; //0x68	pcm ram write
	(function(){
		//0x7n	wait n+1 frames
		//0x8n	write to YM2612 0::0x2A, then wait n frames
		var _c = 0x6f; while (++_c<0x90) _cmd[_c] = _rd0;
	})();
	//0x90-0x95	dac stream control write
	_cmd[0x90] = _rd32;
	_cmd[0x91] = _rd32;
	_cmd[0x92] = _rd32;
	_cmd[0x93] = function(t,f) {f(t,11); return 11;};
	_cmd[0x94] = _rd8;
	_cmd[0x95] = _rd32;
	_cmd[0xa0] = _rd16;
	_cmd[0xb0] = _rd16;
	_cmd[0xb1] = _rd16;
	_cmd[0xb2] = _rd16;
	_cmd[0xc0] = _rd24;
	_cmd[0xc1] = _rd24;
	_cmd[0xc2] = _rd24;
	_cmd[0xd0] = _rd24;
	_cmd[0xd1] = _rd24;
	_cmd[0xe0] = _rd32;
/*
  0x4F dd    : Game Gear PSG stereo, write dd to port 0x06
  0x50 dd    : PSG (SN76489/SN76496) write value dd
  0x51 aa dd : YM2413, write value dd to register aa
  0x52 aa dd : YM2612 port 0, write value dd to register aa
  0x53 aa dd : YM2612 port 1, write value dd to register aa
  0x54 aa dd : YM2151, write value dd to register aa
  0x55 aa dd : YM2203, write value dd to register aa
  0x56 aa dd : YM2608 port 0, write value dd to register aa
  0x57 aa dd : YM2608 port 1, write value dd to register aa
  0x58 aa dd : YM2610 port 0, write value dd to register aa
  0x59 aa dd : YM2610 port 1, write value dd to register aa
  0x5A aa dd : YM3812, write value dd to register aa
  0x5B aa dd : YM3526, write value dd to register aa
  0x5C aa dd : Y8950, write value dd to register aa
  0x5D aa dd : YMZ280B, write value dd to register aa
  0x5E aa dd : YMF262 port 0, write value dd to register aa
  0x5F aa dd : YMF262 port 1, write value dd to register aa
  0x61 nn nn : Wait n samples, n can range from 0 to 65535 (approx 1.49
               seconds). Longer pauses than this are represented by multiple
               wait commands.
  0x62       : wait 735 samples (60th of a second), a shortcut for
               0x61 0xdf 0x02
  0x63       : wait 882 samples (50th of a second), a shortcut for
               0x61 0x72 0x03
  0x66       : end of sound data
  0x67 ...   : data block: see below
  0x68 ...   : PCM RAM write: see below
  0x7n       : wait n+1 samples, n can range from 0 to 15.
  0x8n       : YM2612 port 0 address 2A write from the data bank, then wait 
               n samples; n can range from 0 to 15. Note that the wait is n,
               NOT n+1.
  0x90-0x95  : DAC Stream Control Write: see below
  0xA0 aa dd : AY8910, write value dd to register aa
  0xB0 aa dd : RF5C68, write value dd to register aa
  0xB1 aa dd : RF5C164, write value dd to register aa
  0xB2 ad dd : PWM, write value ddd to register a (d is MSB, dd is LSB)
  0xC0 aaaa dd : Sega PCM, write value dd to memory offset aaaa
  0xC1 aaaa dd : RF5C68, write value dd to memory offset aaaa
  0xC2 aaaa dd : RF5C164, write value dd to memory offset aaaa
  0xD0 pp aa dd : YMF278B port pp, write value dd to register aa
  0xD1 pp aa dd : YMF271 port pp, write value dd to register aa
  0xE0 dddddddd : seek to offset dddddddd (Intel byte order) in PCM data bank

*/
	(function(){
		/*
		Some ranges are reserved for future use, with different numbers of operands:
		
		  0x30..0x4E dd          : one operand, reserved for future use
		  0xA1..0xAF dd dd       : two operands, reserved for future use
		  0xB3..0xBF dd dd       : two operands, reserved for future use
		  0xC3..0xCF dd dd dd    : three operands, reserved for future use
		  0xD2..0xDF dd dd dd    : three operands, reserved for future use
		  0xE1..0xFF dd dd dd dd : four operands, reserved for future use
		
		On encountering these, the correct number of bytes should be skipped.
		*/
		var _c = 0x2f; while (++_c<0x4f) _cmd[_c] = _rd8;
		_c = 0xa0; while (++_c<0xb0) _cmd[_c] = _rd16;
		_c = 0xb2; while (++_c<0xc0) _cmd[_c] = _rd16;
		_c = 0xc2; while (++_c<0xd0) _cmd[_c] = _rd24;
		_c = 0xd1; while (++_c<0xe0) _cmd[_c] = _rd24;
		_c = 0xe0; while (++_c<256) _cmd[_c] = _rd32;
	})();
	this._raw = null;
	this.data = null;
	this.gd3 = null;
	function _gd3(t) {
		var _magic = t.substr(0x00,4);
		var _gver = 0x00010000;
		var _g = {
			'name':{'en':'','jp':''},
			'game':{'en':'','jp':''},
			'system':{'en':'','jp':''},
			'composer':{'en':'','jp':''},
			'date':'',
			'converter':'',
			'notes':''
		};
		function _utok(s) {
			var i = 0, c; while (i<s.length) {
				c = _le16(s.substr(i,2));
				i += 2;
				if (!c) break;
			}
			return i;
		}
		if (_magic==="Gd3 ") {
			_gver = _be32(t.substr(0x04,4));
			var _glen = _le32(t.substr(0x08,4));
			var _nz = String.fromCharCode(0);
			var _t = t.substr(0x0c), j = 0, i = _utok(_t.substr(j));
			//console.log("j="+j+", i="+i+", t[j]="+_le16(_t.substr(j,2)));
			_g.name.en = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.name.jp = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.game.en = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.game.jp = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.system.en = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.system.jp = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.composer.en = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.composer.jp = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.date = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.converter = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			_g.notes = _u16s(_t.substr(j,i)); j += i; i = _utok(_t.substr(j));
			//// TODO: notes needs new-lines as 0x00 0x0A instead of 0x0A 0x00, find a vgm to test
			//console.log("j="+j+", i="+i);
			//console.log('num gd3 fields:'+_arr.length);
		}
		_g.__defineGetter__('version',function(){return (_gver>>16)+'.'+(_gver&0xffff).toString(16);});
		return _g;
	}
	this.init = function(d){
		if (d) {
			var _magic = d.substr(0x00,4);
			if (_magic===this.id) {
				this.offsets.eof = _le32(d.substr(0x04,4));
				_ver = _le32(d.substr(0x08,4));
				this.clocks.sn76489 = _le32(d.substr(0x0c,4));
				this.clocks.ym2413 = _le32(d.substr(0x10,4));
				this.offsets.gd3 = _le32(d.substr(0x14,4));
				_len = _le32(d.substr(0x18,4));	// length in audio frames
				this.loop.offset = _le32(d.substr(0x1c,4));
				this.loop.length = _le32(d.substr(0x20,4));
				_rate = _le32(d.substr(0x24,4));
				this.psg.feedback = _le16(d.substr(0x28,2));
				this.psg.shiftWidth = _byte(d.substr(0x2a,1));
				this.psg.flags = _byte(d.substr(0x2b,1));
				this.clocks.ym2612 = _le32(d.substr(0x2c,4));
				this.clocks.ym2151 = _le32(d.substr(0x30,4));
				this.offsets.data = _le32(d.substr(0x34,4));
				if (_ver>0x150) {
					this.clocks.pcm = _le32(d.substr(0x38,4));
					this.pcm['register'] = _le32(d.substr(0x3c,4));
					this.clocks.rf5c68 = _le32(d.substr(0x40,4));
					this.clocks.ym2203 = _le32(d.substr(0x44,4));
					this.clocks.ym2608 = _le32(d.substr(0x48,4));
					this.clocks.ym2610 = _le32(d.substr(0x4c,4));
					this.clocks.ym3812 = _le32(d.substr(0x50,4));
					this.clocks.ym3526 = _le32(d.substr(0x54,4));
					this.clocks.y8950 = _le32(d.substr(0x58,4));
					this.clocks.ymf262 = _le32(d.substr(0x5c,4));
					this.clocks.ymf278b = _le32(d.substr(0x60,4));
					this.clocks.ymf271 = _le32(d.substr(0x64,4));
					this.clocks.ymz280b = _le32(d.substr(0x68,4));
					this.clocks.rf5c164 = _le32(d.substr(0x6c,4));
					this.clocks.pwm = _le32(d.substr(0x70,4));
					this.clocks.ay8910 = _le32(d.substr(0x74,4));
					this.ay.type = _byte(d.substr(0x78,1));
					this.ay.flags.all = _byte(d.substr(0x79,1));
					this.ay.flags.ym2203 = _byte(d.substr(0x7a,1));
					this.ay.flags.ym2608 = _byte(d.substr(0x7b,1));
					if (_ver>0x151) {
						_vmod = _byte(d.substr(0x7c,1));
						//0x7d	reserved=0
						this.loop.base = _byte(d.substr(0x7e,1));
					}
					this.loop.mod = _byte(d.substr(0x7f,1));
					//0x80	reserved[n]
				}
				this._raw = d;
				this.data = d.substr(this.offsets.data?0x34+this.offsets.data:0x40);
				if (this.offsets.gd3) this.gd3 = _gd3(d.substr(0x14+this.offsets.gd3));
			}
			else throw new Error("VGM::init - not a valid VGM header");
		}
	};
	this.toText = function() {
		if (this.data) {
			function _html(s) {return "<li>"+s+"</li>\n";}
			var ret = "";
			var c, f, i = 0; while (i<this.data.length) {
				c = this.data.charCodeAt(i)&0xff, f = function(b,l){
					var _b = b.substr(i,l).toByteArray();
					_b.toString = function(){
						var r = "", _i = -1; while (++_i<this.length) r += (_i>0?",x":"x")+this[_i].toString(16);
						return r;
					};
					ret += _html("VGM::toText - data byte x"+i.toString(16).toUpperCase()+" ("+_b.toString()+")");
				};
				if (c===0x66) {ret += _html("VGM::toText - end of VGM data block found at x"+i.toString(16).toUpperCase()+"/x"+this.data.length.toString(16).toUpperCase()); break;}
				else if (c in _cmd) i += _cmd[c](this.data,f);
				else {ret += _html("VGM::toText(log) - unsupported VGM command x"+c.toString(16).toUpperCase()+" at x"+i.toString(16).toUpperCase()); ++i;}//throw new Error("VGM::toText - unsupported VGM command x"+c.toString(16).toUpperCase()+" at x"+i.toString(16).toUpperCase());
/*
  0x4F dd    : Game Gear PSG stereo, write dd to port 0x06
  0x50 dd    : PSG (SN76489/SN76496) write value dd
  0x51 aa dd : YM2413, write value dd to register aa
  0x52 aa dd : YM2612 port 0, write value dd to register aa
  0x53 aa dd : YM2612 port 1, write value dd to register aa
  0x54 aa dd : YM2151, write value dd to register aa
  0x55 aa dd : YM2203, write value dd to register aa
  0x56 aa dd : YM2608 port 0, write value dd to register aa
  0x57 aa dd : YM2608 port 1, write value dd to register aa
  0x58 aa dd : YM2610 port 0, write value dd to register aa
  0x59 aa dd : YM2610 port 1, write value dd to register aa
  0x5A aa dd : YM3812, write value dd to register aa
  0x5B aa dd : YM3526, write value dd to register aa
  0x5C aa dd : Y8950, write value dd to register aa
  0x5D aa dd : YMZ280B, write value dd to register aa
  0x5E aa dd : YMF262 port 0, write value dd to register aa
  0x5F aa dd : YMF262 port 1, write value dd to register aa
  0x61 nn nn : Wait n samples, n can range from 0 to 65535 (approx 1.49
               seconds). Longer pauses than this are represented by multiple
               wait commands.
  0x62       : wait 735 samples (60th of a second), a shortcut for
               0x61 0xdf 0x02
  0x63       : wait 882 samples (50th of a second), a shortcut for
               0x61 0x72 0x03
  0x66       : end of sound data
  0x67 ...   : data block: see below
  0x68 ...   : PCM RAM write: see below
  0x7n       : wait n+1 samples, n can range from 0 to 15.
  0x8n       : YM2612 port 0 address 2A write from the data bank, then wait 
               n samples; n can range from 0 to 15. Note that the wait is n,
               NOT n+1.
  0x90-0x95  : DAC Stream Control Write: see below
  0xA0 aa dd : AY8910, write value dd to register aa
  0xB0 aa dd : RF5C68, write value dd to register aa
  0xB1 aa dd : RF5C164, write value dd to register aa
  0xB2 ad dd : PWM, write value ddd to register a (d is MSB, dd is LSB)
  0xC0 aaaa dd : Sega PCM, write value dd to memory offset aaaa
  0xC1 aaaa dd : RF5C68, write value dd to memory offset aaaa
  0xC2 aaaa dd : RF5C164, write value dd to memory offset aaaa
  0xD0 pp aa dd : YMF278B port pp, write value dd to register aa
  0xD1 pp aa dd : YMF271 port pp, write value dd to register aa
  0xE0 dddddddd : seek to offset dddddddd (Intel byte order) in PCM data bank

Some ranges are reserved for future use, with different numbers of operands:

  0x30..0x4E dd          : one operand, reserved for future use
  0xA1..0xAF dd dd       : two operands, reserved for future use
  0xB3..0xBF dd dd       : two operands, reserved for future use
  0xC3..0xCF dd dd dd    : three operands, reserved for future use
  0xD2..0xDF dd dd dd    : three operands, reserved for future use
  0xE1..0xFF dd dd dd dd : four operands, reserved for future use

On encountering these, the correct number of bytes should be skipped.
*/
			}
			return ret;
		}
		else throw new Error("VGM::toText - no data to read");
	};
	this.init(s);
}