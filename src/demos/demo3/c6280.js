function C6280Channel() {
	this.frequency = 0;
	this.control = 0;
	this.balance = 0;
	this.waveform = new Array(32);//new Uint8Array(32);
	this.index = 0;
	this.dda = 0;
	this.noise_control = 0;
	this.noise_counter = 0;
	this.counter = 0;
	this.Muted = 0;

	this.reset = function() {
		this.frequency = 0;
		this.control = 0;
		this.balance = 0;
		var i = this.waveform.length; while (--i>-1) {
			this.waveform[i] = 0;
		}
		this.index = 0;
		this.dda = 0;
		this.noise_control = 0;
		this.noise_counter = 0;
		this.counter = 0;
	}
};

function C6280(clk, rate) {
	this.select = 0;
	this.balance = 0;
	this.lfo_frequency = 0;
	this.lfo_control = 0;
	this.channel = [];
	this.attenuation = 16386.0;
	this.version = 0x101;
	var i;
	for(i = 0; i < 8; i++) this.channel[i] = new C6280Channel();
	this.volume_table = new Int16Array(32);
	this.noise_freq_tab = new Uint32Array(32);
	this.wave_freq_tab = new Uint32Array(4096);

	this.init = function(c,r) {
		var div = ~~(c/r), i;
		//console.log('C6280::init',c,r,div);
		/* Make waveform frequency table */
		for(i = 1; i <= 4096; ++i) {
			this.wave_freq_tab[i & 0xFFF] = ((div*4096)/i)|0;//(((div) * 4096) / (i+1))|0;
		}

		/* Make noise frequency table */
		for(i = 0; i < 32; ++i) {
			this.noise_freq_tab[i] = ((div<<5)/(i+1))|0;//(((div) * 32) / (i+1))|0;
		}
	}
	this.init(clk,rate);

	/* Make volume table */
	/* PSG has 48dB volume range spread over 32 steps */
	var level = 65536.0 / 6.0 / 32.0,
		lv_div = 1.0/Math.pow(10.0, 48.0 / 32.0 / 20.0);
	for(i = 0; i < 31; i++) {
		this.volume_table[i] = ~~level;//((level)|0)-32768;
		level *= lv_div;
	}
	this.volume_table[31] = 0;
	console.log(this.volume_table);

	for(i = 0; i < 6; i++) {
		this.channel[i].Muted = 0x00;
	}

	this.reset = function() {
		this.select = 0x00;
		this.balance = 0x00;
		this.lfo_frequency = 0x00;
		this.lfo_control = 0x00;

		for(var i = 0; i < 6; i++) {
			this.channel[i].reset();
		}
	}

	this.data = 0; // static int
	var scale_tab = [
		0x00, 0x03, 0x05, 0x07, 0x09, 0x0B, 0x0D, 0x0F,
		0x10, 0x13, 0x15, 0x17, 0x19, 0x1B, 0x1D, 0x1F
	];
	this.update = function(outputs, samples) {
		var ch, i;
		var vll, vlr;

		var lmal = scale_tab[(this.balance >> 4) & 0x0F];
		var rmal = scale_tab[(this.balance >> 0) & 0x0F];

		/* Clear buffer */
		for(i = 0; i < samples; i++) {
			outputs[0][i] = 0;
			outputs[1][i] = 0;
		}

		for(ch = 0; ch < 6; ch++) {
			/* Only look at enabled channels */
			if((this.channel[ch].control & 0x80) && ! this.channel[ch].Muted) {
				var lal = (this.channel[ch].balance >> 4) & 0x0F;
				var ral = (this.channel[ch].balance >> 0) & 0x0F;
				var al  = this.channel[ch].control & 0x1F;

				lal = scale_tab[lal];
				ral = scale_tab[ral];

				/* Calculate volume just as the patent says */
				vll = (0x1F - lal) + (0x1F - al) + (0x1F - lmal);
				if(vll > 0x1F) vll = 0x1F;

				vlr = (0x1F - ral) + (0x1F - al) + (0x1F - rmal);
				if(vlr > 0x1F) vlr = 0x1F;

				vll = this.volume_table[vll];
				vlr = this.volume_table[vlr];

				/* Check channel mode */
				if((ch >= 4) && (this.channel[ch].noise_control & 0x80)) {
					/* Noise mode */
					var step = this.noise_freq_tab[(this.channel[ch].noise_control & 0x1F) ^ 0x1F];
					for(i = 0; i < samples; i += 1) {
						this.channel[ch].noise_counter += step;
						if(this.channel[ch].noise_counter >= 0x800) {
							this.data = (Math.random()>0.5) ? 0x1F : 0;
						}
						this.channel[ch].noise_counter &= 0x7FF;
						outputs[0][i] += (vll * (this.data - 16))|0;
						outputs[1][i] += (vlr * (this.data - 16))|0;
					}
				} else if(this.channel[ch].control & 0x40) {
					/* DDA mode */
					for(i = 0; i < samples; i++) {
						outputs[0][i] += (vll * (this.channel[ch].dda - 16))|0;
						outputs[1][i] += (vlr * (this.channel[ch].dda - 16))|0;
					}
				} else {
					/* Waveform mode */
					var step = this.wave_freq_tab[this.channel[ch].frequency];
					for(i = 0; i < samples; i += 1) {
						var offset = (this.channel[ch].counter >> 12) & 0x1F;
						this.channel[ch].counter += step;
						this.channel[ch].counter &= 0x1FFFF;
						var data = this.channel[ch].waveform[offset];
						outputs[0][i] += (vll * (data - 16))|0;
						outputs[1][i] += (vlr * (data - 16))|0;
					}
				}
			}
		}
		return outputs;
	}
	/** interleaved stereo mix +neo **/
	this.mixStereo = function(outputs, samples, z) {
		var _sc = 1.0/this.attenuation, n = z|0, outl, outr;
		var ch, i;
		var vll, vlr;

		var lmal = scale_tab[(this.balance >> 4) & 0x0F];
		var rmal = scale_tab[(this.balance >> 0) & 0x0F];

		/* Clear buffer */
		/*for(i = 0; i < samples; i++) {
			outputs[0][i] = 0;
			outputs[1][i] = 0;
		}*/

		//var dbg = [];
		for (i=0; i<samples; ++i) {
			outl = 0, outr = 0;
			ch = -1; while (++ch < 6) {
				/* Only look at enabled channels */
				if((this.channel[ch].control & 0x80)) {
					var lal = (this.channel[ch].balance >> 4) & 0x0F;
					var ral = (this.channel[ch].balance >> 0) & 0x0F;
					var al  = this.channel[ch].control & 0x1F;

					lal = scale_tab[lal];
					ral = scale_tab[ral];

					/* Calculate volume just as the patent says */
					vll = (0x1F - lal) + (0x1F - al) + (0x1F - lmal);
					if(vll > 0x1F) vll = 0x1F;

					vlr = (0x1F - ral) + (0x1F - al) + (0x1F - rmal);
					if(vlr > 0x1F) vlr = 0x1F;

					vll = this.volume_table[vll];
					vlr = this.volume_table[vlr];

					/* Check channel mode */
					if((ch >= 4) && (this.channel[ch].noise_control & 0x80)) {
						/* Noise mode */
						var step = this.noise_freq_tab[(this.channel[ch].noise_control & 0x1F) ^ 0x1F];
						//for(i = 0; i < samples; i += 1) {
							this.channel[ch].noise_counter += step;
							if(this.channel[ch].noise_counter >= 0x800) {
								this.data = (Math.random() & 1) ? 0x1F : 0;
							}
							this.channel[ch].noise_counter &= 0x7FF;
							if (! this.channel[ch].Muted)
								outl += ((vll * (this.data - 16)))|0,
								outr += ((vlr * (this.data - 16)))|0;
								//dbg.push(this.data-16);
						//}
					} else if(this.channel[ch].control & 0x40) {
						/* DDA mode */
						//for(i = 0; i < samples; i++) {
							if (! this.channel[ch].Muted)
								outl += ((vll * (this.channel[ch].dda - 16)))|0,
								outr += ((vlr * (this.channel[ch].dda - 16)))|0;
								//dbg.push(this.channel[ch].dda-16);
						//}
					} else {
						/* Waveform mode */
						var step = this.wave_freq_tab[this.channel[ch].frequency];
						//for(i = 0; i < samples; i += 1) {
							var offset = (this.channel[ch].counter >> 12) & 0x1F;
							this.channel[ch].counter += step;
							this.channel[ch].counter &= 0x1FFFF;
							var data = this.channel[ch].waveform[offset];
							if (! this.channel[ch].Muted)
								outl += ((vll * (data - 16)))|0,
								outr += ((vlr * (data - 16)))|0;
								//dbg.push(data-16);
						//}
					}
				}
			}
			outputs[n++] += (_sc*outl);// dbg.push(_sc*outl);
			outputs[n++] += (_sc*outr);
		}
		//console.log('upd',samples,dbg);
	}
	this.write = function(offset, data) {
		//var q = this.channel[this.select];

		(function(T,q){
			switch(offset & 0x0F) {
				case 0x00: /* Channel select */
					T.select = data & 0x07;// console.log("B9",offset,data.toString(16),"Select Channel",data&0x07);
					break;

				case 0x01: /* Global balance */
					T.balance  = data;// console.log("B9",offset,data.toString(16),"Global balance");
					break;

				case 0x02: /* Channel frequency (LSB) */
					q.frequency = (q.frequency & 0x0F00) | data;
					q.frequency &= 0x0FFF;
					break;

				case 0x03: /* Channel frequency (MSB) */
					q.frequency = (q.frequency & 0x00FF) | (data << 8);
					q.frequency &= 0x0FFF;
					break;

				case 0x04: /* Channel control (key-on, DDA mode, volume) */

					/* 1-to-0 transition of DDA bit resets waveform index */
					if((q.control & 0x40) && ((data & 0x40) == 0)) {
						q.index = 0;
					}
					q.control = data;
					break;

				case 0x05: /* Channel balance */
					q.balance = data;
					break;

				case 0x06: /* Channel waveform data */

					switch(q.control & 0xC0) {
						case 0x00:
							q.waveform[q.index & 0x1F] = data & 0x1F;
							q.index = (q.index + 1) & 0x1F;
							break;

						case 0x40:
							break;

						case 0x80:
							q.waveform[q.index & 0x1F] = data & 0x1F;
							q.index = (q.index + 1) & 0x1F;
							break;

						case 0xC0:
							q.dda = data & 0x1F;
							break;
					}
					//console.log("B9",offset,data.toString(16),"Channel Waveform Data",data.toString(16));

					break;

				case 0x07: /* Noise control (enable, frequency) */
					q.noise_control = data;
					break;

				case 0x08: /* LFO frequency */
					T.lfo_frequency = data;// console.log("B9",offset,data.toString(16),"LFO Frequency",data.toString(16));
					break;

				case 0x09: /* LFO control (enable, mode) */
					T.lfo_control = data;// console.log("B9",offset,data.toString(16),"LFO Control",data.toString(16));
					break;

				default:
					break;
			}
		})(this, this.channel[this.select]);

		//this.channel[this.select] = q;
	}
};
