function Vgm(data) {
    this.sampleRate = 44100;
    this.data = data;
}

Vgm.prototype.getUInt8At = function(offset) {
    return this.data[offset];
};

Vgm.prototype.getUInt16At = function(offset) {
    return this.data[offset] + (this.data[offset + 1] << 8);
};

Vgm.prototype.getUInt32At = function(offset) {
    return this.data[offset] + (this.data[offset + 1] << 8) + (this.data[offset + 2] << 16) + (this.data[offset + 3] << 24);
};

Vgm.prototype.getVersion = function() {
    return this.getUInt8At(0x09).toString(16) + '.' + this.getUInt8At(0x08).toString(16);
};

Vgm.prototype.getSamplesCount = function() {
    return this.getUInt32At(0x18);
};

Vgm.prototype.getDataOffset = function() {
    return 0x34 + this.getUInt32At(0x34);
};

Vgm.prototype.getAY8910Clock = function() {
    return this.getUInt32At(0x74);
};

Vgm.prototype.fillBuffer = function(buffer, chip) {
    var offset = this.getDataOffset(),
        length = this.data.length,
        j = offset,
        command,
        i = 0,
        count;

    while (true) {
        if (j > length) {
            return;
        }

        command = this.data[j];

        if (command == 0x66) {
            return;
        } else if (command == 0x61) {
            count = this.getUInt16At(j + 1);
            chip.fillBuffer(buffer, i, count, this.sampleRate);
            j += 3;
            i += count;
        } else if (command == 0x62) {
            count = 735;
            chip.fillBuffer(buffer, i, count, this.sampleRate);
            j += 1;
            i += count;
        } else if (command == 0x63) {
            count = 882;
            chip.fillBuffer(buffer, i, count, this.sampleRate);
            j += 1;
            i += count;
        } else if (command == 0xA0) {
            chip.setRegister(this.getUInt8At(j + 1), this.getUInt8At(j + 2));
            j += 3;
        } else if (command >= 0x70 && command <= 0x7F) {
            count = command & 15;
            chip.fillBuffer(buffer, i, count, this.sampleRate);
            j += 1;
            i += count
        } else {
            console.log('Unknown command ' + command.toString(16) + ' at offset ' + j.toString(16));
        }
    }
};