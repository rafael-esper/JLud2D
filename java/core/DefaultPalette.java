package core;

import java.awt.Color;

public class DefaultPalette {

	class Palette {
		int r, g, b;
	}

	static Palette pal[] = new Palette[256];
	
	public DefaultPalette() {
		for(int i=0; i<pal.length; i++) {
			if(pal[i] == null) 
				pal[i] = new Palette();
		}
		this.buildPalette(pal);
	}
	
	public int getDefaultPaletteRedColor(int i) {
		return pal[i].r;
	}
	public int getDefaultPaletteGreenColor(int i) {
		return pal[i].g;
	}
	public int getDefaultPaletteBlueColor(int i) {
		return pal[i].b;
	}
	
	public Color getColor(int c, int lucent) {
		if(pal == null || pal.length < c || c < 0) {
			return Color.black;
		}
		Color color = new Color(pal[c].r, pal[c].g, pal[c].b, lucent);
		return color;
	}
	
		
	void buildPalette(Palette pal[])
	{
		pal[0].r=255;    pal[0].g=0;      pal[0].b=255;
		pal[1].r=8;      pal[1].g=8;      pal[1].b=8;
		pal[2].r=12;     pal[2].g=12;     pal[2].b=12;
		pal[3].r=20;     pal[3].g=20;     pal[3].b=20;
		pal[4].r=28;     pal[4].g=28;     pal[4].b=28;
		pal[5].r=36;     pal[5].g=36;     pal[5].b=36;
		pal[6].r=40;     pal[6].g=40;     pal[6].b=40;
		pal[7].r=48;     pal[7].g=48;     pal[7].b=48;
		pal[8].r=56;     pal[8].g=56;     pal[8].b=56;
		pal[9].r=60;     pal[9].g=60;     pal[9].b=60;
		pal[10].r=68;    pal[10].g=68;    pal[10].b=68;
		pal[11].r=76;    pal[11].g=76;    pal[11].b=76;
		pal[12].r=84;    pal[12].g=84;    pal[12].b=84;
		pal[13].r=88;    pal[13].g=88;    pal[13].b=88;
		pal[14].r=96;    pal[14].g=96;    pal[14].b=96;
		pal[15].r=104;   pal[15].g=104;   pal[15].b=104;
		pal[16].r=112;   pal[16].g=112;   pal[16].b=112;
		pal[17].r=116;   pal[17].g=116;   pal[17].b=116;
		pal[18].r=124;   pal[18].g=124;   pal[18].b=124;
		pal[19].r=132;   pal[19].g=132;   pal[19].b=132;
		pal[20].r=136;   pal[20].g=136;   pal[20].b=136;
		pal[21].r=144;   pal[21].g=144;   pal[21].b=144;
		pal[22].r=152;   pal[22].g=152;   pal[22].b=152;
		pal[23].r=160;   pal[23].g=160;   pal[23].b=160;
		pal[24].r=164;   pal[24].g=164;   pal[24].b=164;
		pal[25].r=172;   pal[25].g=172;   pal[25].b=172;
		pal[26].r=184;   pal[26].g=184;   pal[26].b=184;
		pal[27].r=196;   pal[27].g=196;   pal[27].b=196;
		pal[28].r=208;   pal[28].g=208;   pal[28].b=208;
		pal[29].r=216;   pal[29].g=216;   pal[29].b=216;
		pal[30].r=228;   pal[30].g=228;   pal[30].b=228;
		pal[31].r=240;   pal[31].g=240;   pal[31].b=240;
		pal[32].r=252;   pal[32].g=0;     pal[32].b=0;
		pal[33].r=236;   pal[33].g=0;     pal[33].b=0;
		pal[34].r=224;   pal[34].g=0;     pal[34].b=0;
		pal[35].r=212;   pal[35].g=0;     pal[35].b=0;
		pal[36].r=200;   pal[36].g=0;     pal[36].b=0;
		pal[37].r=188;   pal[37].g=0;     pal[37].b=0;
		pal[38].r=176;   pal[38].g=0;     pal[38].b=0;
		pal[39].r=164;   pal[39].g=0;     pal[39].b=0;
		pal[40].r=152;   pal[40].g=0;     pal[40].b=0;
		pal[41].r=136;   pal[41].g=0;     pal[41].b=0;
		pal[42].r=124;   pal[42].g=0;     pal[42].b=0;
		pal[43].r=112;   pal[43].g=0;     pal[43].b=0;
		pal[44].r=100;   pal[44].g=0;     pal[44].b=0;
		pal[45].r=88;    pal[45].g=0;     pal[45].b=0;
		pal[46].r=76;    pal[46].g=0;     pal[46].b=0;
		pal[47].r=64;    pal[47].g=0;     pal[47].b=0;
		pal[48].r=252;   pal[48].g=216;   pal[48].b=216;
		pal[49].r=252;   pal[49].g=184;   pal[49].b=184;
		pal[50].r=252;   pal[50].g=156;   pal[50].b=156;
		pal[51].r=252;   pal[51].g=124;   pal[51].b=124;
		pal[52].r=252;   pal[52].g=92;    pal[52].b=92;
		pal[53].r=252;   pal[53].g=64;    pal[53].b=64;
		pal[54].r=252;   pal[54].g=32;    pal[54].b=32;
		pal[55].r=252;   pal[55].g=0;     pal[55].b=0;
		pal[56].r=68;    pal[56].g=44;    pal[56].b=24;
		pal[57].r=76;    pal[57].g=52;    pal[57].b=28;
		pal[58].r=84;    pal[58].g=60;    pal[58].b=36;
		pal[59].r=92;    pal[59].g=68;    pal[59].b=40;
		pal[60].r=96;    pal[60].g=76;    pal[60].b=44;
		pal[61].r=104;   pal[61].g=84;    pal[61].b=48;
		pal[62].r=112;   pal[62].g=92;    pal[62].b=56;
		pal[63].r=120;   pal[63].g=100;   pal[63].b=60;
		pal[64].r=252;   pal[64].g=252;   pal[64].b=216;
		pal[65].r=252;   pal[65].g=252;   pal[65].b=184;
		pal[66].r=252;   pal[66].g=252;   pal[66].b=156;
		pal[67].r=252;   pal[67].g=252;   pal[67].b=124;
		pal[68].r=252;   pal[68].g=248;   pal[68].b=92;
		pal[69].r=252;   pal[69].g=244;   pal[69].b=64;
		pal[70].r=252;   pal[70].g=244;   pal[70].b=32;
		pal[71].r=252;   pal[71].g=244;   pal[71].b=0;
		pal[72].r=228;   pal[72].g=216;   pal[72].b=0;
		pal[73].r=204;   pal[73].g=196;   pal[73].b=0;
		pal[74].r=180;   pal[74].g=172;   pal[74].b=0;
		pal[75].r=156;   pal[75].g=156;   pal[75].b=0;
		pal[76].r=132;   pal[76].g=132;   pal[76].b=0;
		pal[77].r=112;   pal[77].g=108;   pal[77].b=0;
		pal[78].r=88;    pal[78].g=84;    pal[78].b=0;
		pal[79].r=64;    pal[79].g=64;    pal[79].b=0;
		pal[80].r=208;   pal[80].g=252;   pal[80].b=92;
		pal[81].r=196;   pal[81].g=252;   pal[81].b=64;
		pal[82].r=180;   pal[82].g=252;   pal[82].b=32;
		pal[83].r=160;   pal[83].g=252;   pal[83].b=0;
		pal[84].r=144;   pal[84].g=228;   pal[84].b=0;
		pal[85].r=128;   pal[85].g=204;   pal[85].b=0;
		pal[86].r=116;   pal[86].g=180;   pal[86].b=0;
		pal[87].r=96;    pal[87].g=156;   pal[87].b=0;
		pal[88].r=216;   pal[88].g=252;   pal[88].b=216;
		pal[89].r=184;   pal[89].g=244;   pal[89].b=184;
		pal[90].r=156;   pal[90].g=236;   pal[90].b=156;
		pal[91].r=124;   pal[91].g=228;   pal[91].b=124;
		pal[92].r=92;    pal[92].g=216;   pal[92].b=92;
		pal[93].r=60;    pal[93].g=208;   pal[93].b=60;
		pal[94].r=32;    pal[94].g=200;   pal[94].b=32;
		pal[95].r=0;     pal[95].g=192;   pal[95].b=0;
		pal[96].r=0;     pal[96].g=180;   pal[96].b=0;
		pal[97].r=0;     pal[97].g=172;   pal[97].b=0;
		pal[98].r=0;     pal[98].g=160;   pal[98].b=0;
		pal[99].r=0;     pal[99].g=152;   pal[99].b=0;
		pal[100].r=0;    pal[100].g=140;  pal[100].b=0;
		pal[101].r=0;    pal[101].g=132;  pal[101].b=0;
		pal[102].r=0;    pal[102].g=120;  pal[102].b=0;
		pal[103].r=0;    pal[103].g=112;  pal[103].b=0;
		pal[104].r=0;    pal[104].g=100;  pal[104].b=0;
		pal[105].r=0;    pal[105].g=92;   pal[105].b=0;
		pal[106].r=0;    pal[106].g=80;   pal[106].b=0;
		pal[107].r=0;    pal[107].g=72;   pal[107].b=0;
		pal[108].r=0;    pal[108].g=60;   pal[108].b=0;
		pal[109].r=8;    pal[109].g=52;   pal[109].b=8;
		pal[110].r=12;   pal[110].g=40;   pal[110].b=12;
		pal[111].r=20;   pal[111].g=32;   pal[111].b=20;
		pal[112].r=216;  pal[112].g=252;  pal[112].b=252;
		pal[113].r=184;  pal[113].g=252;  pal[113].b=252;
		pal[114].r=156;  pal[114].g=252;  pal[114].b=252;
		pal[115].r=124;  pal[115].g=252;  pal[115].b=252;
		pal[116].r=92;   pal[116].g=252;  pal[116].b=252;
		pal[117].r=60;   pal[117].g=252;  pal[117].b=252;
		pal[118].r=32;   pal[118].g=252;  pal[118].b=252;
		pal[119].r=0;    pal[119].g=252;  pal[119].b=252;
		pal[120].r=0;    pal[120].g=228;  pal[120].b=228;
		pal[121].r=0;    pal[121].g=204;  pal[121].b=204;
		pal[122].r=0;    pal[122].g=180;  pal[122].b=180;
		pal[123].r=0;    pal[123].g=156;  pal[123].b=156;
		pal[124].r=0;    pal[124].g=136;  pal[124].b=136;
		pal[125].r=0;    pal[125].g=112;  pal[125].b=112;
		pal[126].r=0;    pal[126].g=88;   pal[126].b=88;
		pal[127].r=0;    pal[127].g=64;   pal[127].b=64;
		pal[128].r=92;   pal[128].g=188;  pal[128].b=252;
		pal[129].r=64;   pal[129].g=176;  pal[129].b=252;
		pal[130].r=32;   pal[130].g=168;  pal[130].b=252;
		pal[131].r=0;    pal[131].g=156;  pal[131].b=252;
		pal[132].r=0;    pal[132].g=140;  pal[132].b=228;
		pal[133].r=0;    pal[133].g=124;  pal[133].b=204;
		pal[134].r=0;    pal[134].g=108;  pal[134].b=180;
		pal[135].r=0;    pal[135].g=92;   pal[135].b=156;
		pal[136].r=216;  pal[136].g=216;  pal[136].b=252;
		pal[137].r=184;  pal[137].g=188;  pal[137].b=252;
		pal[138].r=156;  pal[138].g=156;  pal[138].b=252;
		pal[139].r=124;  pal[139].g=128;  pal[139].b=252;
		pal[140].r=92;   pal[140].g=96;   pal[140].b=252;
		pal[141].r=64;   pal[141].g=64;   pal[141].b=252;
		pal[142].r=32;   pal[142].g=36;   pal[142].b=252;
		pal[143].r=0;    pal[143].g=4;    pal[143].b=252;
		pal[144].r=0;    pal[144].g=0;    pal[144].b=252;
		pal[145].r=0;    pal[145].g=0;    pal[145].b=236;
		pal[146].r=0;    pal[146].g=0;    pal[146].b=224;
		pal[147].r=0;    pal[147].g=0;    pal[147].b=212;
		pal[148].r=0;    pal[148].g=0;    pal[148].b=200;
		pal[149].r=0;    pal[149].g=0;    pal[149].b=188;
		pal[150].r=0;    pal[150].g=0;    pal[150].b=176;
		pal[151].r=0;    pal[151].g=0;    pal[151].b=164;
		pal[152].r=0;    pal[152].g=0;    pal[152].b=152;
		pal[153].r=0;    pal[153].g=0;    pal[153].b=136;
		pal[154].r=0;    pal[154].g=0;    pal[154].b=124;
		pal[155].r=0;    pal[155].g=0;    pal[155].b=112;
		pal[156].r=0;    pal[156].g=0;    pal[156].b=100;
		pal[157].r=0;    pal[157].g=0;    pal[157].b=88;
		pal[158].r=0;    pal[158].g=0;    pal[158].b=76;
		pal[159].r=0;    pal[159].g=0;    pal[159].b=64;
		pal[160].r=52;   pal[160].g=32;   pal[160].b=0;
		pal[161].r=60;   pal[161].g=36;   pal[161].b=0;
		pal[162].r=72;   pal[162].g=40;   pal[162].b=0;
		pal[163].r=80;   pal[163].g=44;   pal[163].b=0;
		pal[164].r=88;   pal[164].g=48;   pal[164].b=0;
		pal[165].r=100;  pal[165].g=52;   pal[165].b=0;
		pal[166].r=108;  pal[166].g=56;   pal[166].b=0;
		pal[167].r=120;  pal[167].g=60;   pal[167].b=0;
		pal[168].r=128;  pal[168].g=64;   pal[168].b=0;
		pal[169].r=136;  pal[169].g=68;   pal[169].b=0;
		pal[170].r=148;  pal[170].g=72;   pal[170].b=0;
		pal[171].r=160;  pal[171].g=84;   pal[171].b=12;
		pal[172].r=176;  pal[172].g=96;   pal[172].b=24;
		pal[173].r=188;  pal[173].g=108;  pal[173].b=36;
		pal[174].r=200;  pal[174].g=120;  pal[174].b=48;
		pal[175].r=212;  pal[175].g=132;  pal[175].b=56;
		pal[176].r=228;  pal[176].g=144;  pal[176].b=68;
		pal[177].r=240;  pal[177].g=156;  pal[177].b=80;
		pal[178].r=252;  pal[178].g=168;  pal[178].b=92;
		pal[179].r=252;  pal[179].g=184;  pal[179].b=112;
		pal[180].r=252;  pal[180].g=196;  pal[180].b=136;
		pal[181].r=252;  pal[181].g=212;  pal[181].b=156;
		pal[182].r=252;  pal[182].g=224;  pal[182].b=176;
		pal[183].r=136;  pal[183].g=112;  pal[183].b=72;
		pal[184].r=148;  pal[184].g=124;  pal[184].b=80;
		pal[185].r=164;  pal[185].g=136;  pal[185].b=92;
		pal[186].r=176;  pal[186].g=148;  pal[186].b=100;
		pal[187].r=188;  pal[187].g=160;  pal[187].b=112;
		pal[188].r=200;  pal[188].g=168;  pal[188].b=120;
		pal[189].r=216;  pal[189].g=180;  pal[189].b=128;
		pal[190].r=228;  pal[190].g=192;  pal[190].b=140;
		pal[191].r=240;  pal[191].g=204;  pal[191].b=148;
		pal[192].r=252;  pal[192].g=232;  pal[192].b=220;
		pal[193].r=252;  pal[193].g=224;  pal[193].b=208;
		pal[194].r=252;  pal[194].g=216;  pal[194].b=196;
		pal[195].r=252;  pal[195].g=212;  pal[195].b=188;
		pal[196].r=252;  pal[196].g=204;  pal[196].b=176;
		pal[197].r=252;  pal[197].g=196;  pal[197].b=164;
		pal[198].r=252;  pal[198].g=188;  pal[198].b=156;
		pal[199].r=252;  pal[199].g=184;  pal[199].b=144;
		pal[200].r=252;  pal[200].g=176;  pal[200].b=128;
		pal[201].r=252;  pal[201].g=164;  pal[201].b=112;
		pal[202].r=252;  pal[202].g=156;  pal[202].b=96;
		pal[203].r=240;  pal[203].g=148;  pal[203].b=92;
		pal[204].r=232;  pal[204].g=140;  pal[204].b=88;
		pal[205].r=220;  pal[205].g=136;  pal[205].b=84;
		pal[206].r=208;  pal[206].g=128;  pal[206].b=80;
		pal[207].r=200;  pal[207].g=124;  pal[207].b=76;
		pal[208].r=188;  pal[208].g=120;  pal[208].b=72;
		pal[209].r=180;  pal[209].g=112;  pal[209].b=68;
		pal[210].r=168;  pal[210].g=104;  pal[210].b=64;
		pal[211].r=160;  pal[211].g=100;  pal[211].b=60;
		pal[212].r=156;  pal[212].g=96;   pal[212].b=56;
		pal[213].r=144;  pal[213].g=92;   pal[213].b=52;
		pal[214].r=136;  pal[214].g=88;   pal[214].b=48;
		pal[215].r=128;  pal[215].g=80;   pal[215].b=44;
		pal[216].r=116;  pal[216].g=76;   pal[216].b=40;
		pal[217].r=108;  pal[217].g=72;   pal[217].b=36;
		pal[218].r=92;   pal[218].g=64;   pal[218].b=32;
		pal[219].r=84;   pal[219].g=60;   pal[219].b=28;
		pal[220].r=72;   pal[220].g=56;   pal[220].b=24;
		pal[221].r=64;   pal[221].g=48;   pal[221].b=24;
		pal[222].r=56;   pal[222].g=44;   pal[222].b=20;
		pal[223].r=40;   pal[223].g=32;   pal[223].b=12;
		pal[224].r=252;  pal[224].g=0;    pal[224].b=0;
		pal[225].r=252;  pal[225].g=16;   pal[225].b=0;
		pal[226].r=252;  pal[226].g=32;   pal[226].b=0;
		pal[227].r=252;  pal[227].g=52;   pal[227].b=0;
		pal[228].r=252;  pal[228].g=68;   pal[228].b=0;
		pal[229].r=252;  pal[229].g=84;   pal[229].b=0;
		pal[230].r=252;  pal[230].g=100;  pal[230].b=0;
		pal[231].r=252;  pal[231].g=116;  pal[231].b=0;
		pal[232].r=252;  pal[232].g=136;  pal[232].b=0;
		pal[233].r=252;  pal[233].g=152;  pal[233].b=0;
		pal[234].r=252;  pal[234].g=168;  pal[234].b=0;
		pal[235].r=252;  pal[235].g=184;  pal[235].b=0;
		pal[236].r=252;  pal[236].g=200;  pal[236].b=0;
		pal[237].r=252;  pal[237].g=220;  pal[237].b=0;
		pal[238].r=252;  pal[238].g=236;  pal[238].b=0;
		pal[239].r=252;  pal[239].g=252;  pal[239].b=0;
		pal[240].r=252;  pal[240].g=188;  pal[240].b=0;
		pal[241].r=216;  pal[241].g=160;  pal[241].b=0;
		pal[242].r=180;  pal[242].g=136;  pal[242].b=0;
		pal[243].r=144;  pal[243].g=108;  pal[243].b=0;
		pal[244].r=108;  pal[244].g=80;   pal[244].b=0;
		pal[245].r=72;   pal[245].g=52;   pal[245].b=0;
		pal[246].r=36;   pal[246].g=28;   pal[246].b=0;
		pal[247].r=0;    pal[247].g=0;    pal[247].b=0;
		pal[248].r=164;  pal[248].g=0;    pal[248].b=160;
		pal[249].r=140;  pal[249].g=0;    pal[249].b=172;
		pal[250].r=116;  pal[250].g=0;    pal[250].b=188;
		pal[251].r=92;   pal[251].g=0;    pal[251].b=200;
		pal[252].r=72;   pal[252].g=0;    pal[252].b=212;
		pal[253].r=48;   pal[253].g=0;    pal[253].b=224;
		pal[254].r=24;   pal[254].g=0;    pal[254].b=240;
		pal[255].r=252;  pal[255].g=252;  pal[255].b=252;
	}
	
}


