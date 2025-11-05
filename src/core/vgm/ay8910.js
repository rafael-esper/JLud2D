function AY8910(clock) {
    this.clock = clock;
    this.register = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.channelSignal = [0, 0, 0];
    this.channelPeriod = [0, 0, 0];
    this.channelCounter = [0, 0, 0];
    this.noiseSignal = 0;
    this.noisePeriod = 0;
    this.noiseCounter = 0;
    this.noisePhase = 0;
    this.channelEnable = [0, 0, 0];
    this.noiseEnable = [0, 0, 0];
    this.volumeTable = [0, 0.0078125, 0.0110485, 0.015625, 0.0220971, 0.03125, 0.0441942, 0.0625, 0.0883883, 0.125, 0.1767767, 0.25, 0.3535534, 0.5, 0.7071068, 1];
    this.randomSequence = 1;
}

AY8910.prototype.setRegister = function(num, value) {
    this.register[num] = value;

    if (num == 0 || num == 1) {
        this.channelPeriod[0] = ((this.register[1] << 8) + this.register[0]);
    }
    if (num == 2 || num == 3) {
        this.channelPeriod[1] = ((this.register[3] << 8) + this.register[2]);
    }
    if (num == 4 || num == 5) {
        this.channelPeriod[2] = ((this.register[5] << 8) + this.register[4]);
    }
    if (num == 6) {
        this.noisePeriod = this.register[6];
    }
    if (num == 7) {
        this.channelEnable[0] = this.register[7] & 1;
        this.channelEnable[1] = (this.register[7] >> 1) & 1;
        this.channelEnable[2] = (this.register[7] >> 2) & 1;
        this.noiseEnable[0] = (this.register[7] >> 3) & 1;
        this.noiseEnable[1] = (this.register[7] >> 4) & 1;
        this.noiseEnable[2] = (this.register[7] >> 5) & 1;
    }
};

AY8910.prototype.getTick = function() {
    var c, signal = [],
        result = 0;

    for (c = 0; c < 3; c++) {
        this.channelCounter[c]++;
        if (this.channelCounter[c] >= this.channelPeriod[c]) {
            this.channelSignal[c] ^= 1;
            this.channelCounter[c] = 0;
        }
    }

    this.noiseCounter++;
    if (this.noiseCounter >= this.noisePeriod) {
        this.noisePhase ^= 1;
        this.noiseCounter = 0;

        if (this.noisePhase) {
            this.randomSequence ^= (((this.randomSequence & 1) ^ ((this.randomSequence >> 3) & 1)) << 17);
            this.randomSequence >>= 1;
        }

        this.noiseSignal = this.randomSequence & 1;
    }

    for (c = 0; c < 3; c++) {
        signal[c] = (this.channelSignal[c] | this.channelEnable[c]) & (this.noiseSignal | this.noiseEnable[c]);
    }

    for (c = 0; c < 3; c++) {
        result += signal[c] * this.volumeTable[this.register[8 + c]];
    }

    return result / 3;
};

AY8910.prototype.fillBuffer = function(buffer, offset, length, sampleRate) {
    var ticks = this.clock / sampleRate / (16 / 2),
        volume = 0,
        i = 0,
        j = 0;

    while (j < length) {
        volume += this.getTick();
        i++;
        if (i >= ticks) {
            buffer[offset + j] = volume / i;
            volume = 0;
            i = 0;
            j++;
        }
    }

    return buffer;
};