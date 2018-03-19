package demos.ps.oo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import demos.ps.oo.PSEffect.Effect;
import demos.ps.oo.PSEffect.EffectOutcome;
import demos.ps.oo.PSEffect.EffectPlace;
import demos.ps.oo.PSEffect.EffectTarget;
import demos.ps.oo.PSLibSound.PS1Sound;
import demos.ps.oo.PSMenu.Cancellable;

public class PSLibSpell {

	private static final Logger log = LogManager.getLogger(PSLibSpell.class);

		public interface Spell {
			int getMpCost();
			Effect getEffect();
		}
		
		public enum PS1Spell implements Spell {
			REST	(2, "Spell_Heal", Effect.CURE),
			CURE	(6, "Spell_Cure", Effect.CURE),
			W_REST	(2, "Spell_Heal", Effect.WCURE),
			W_CURE	(6, "Spell_Cure", Effect.WCURE),
			REVIVE	(12, "Spell_Rebirth", Effect.REVIVE),
			F_REVIVE(30, "Spell_FullRebirth", Effect.F_REVIVE),

			FLY		(8, "Spell_Fly", Effect.FLY),
			EXIT	(4, "Spell_Bypass", Effect.EXIT),
			TRAP	(2, "Spell_Untrap", Effect.TRAP),
			OPEN	(4, "Spell_Open", Effect.OPEN),

			ESCAPE	(2, "Spell_Bye", Effect.ESCAPE),
			CHAT	(2, "Spell_Chat", Effect.CHAT),
			TELE	(4, "Spell_Telepathy", Effect.TELE),

			ROPE	(4, "Spell_Rope", Effect.ROPE),
			ROPE_ALL(20, "Spell_RopeAll", Effect.ROPE_ALL),
			FEAR	(2, "Spell_Terror", Effect.FEAR),
			FEAR_ALL(12, "Spell_TerrorAll", Effect.FEAR_ALL),
			WALL	(6, "Spell_Waller", Effect.WALL),
			FORCE	(10, "Spell_Power", Effect.FORCE),
			PROT	(8, "Spell_Magic_waller", Effect.PROT),

			FIRE	(4, "Spell_Fire", Effect.FIRE),
			GI_FIRE	(14, "Spell_GiFire", Effect.GIFIRE),
			WIND	(12, "Spell_Wind", Effect.WIND),
			THUNDER (18, "Spell_Thunder", Effect.THUNDER), // Changed to 18
			
			LIGHT		(2, "Spell_Light", Effect.LIGHT),
			POWER_CURE 	(12, "Spell_PowerCure", Effect.CURE)
			;
			
			private int mpCost;
			private Effect effect;
			private String nameString;

			PS1Spell(int mpCost, String name, Effect effect) {
				this.mpCost = mpCost;
				this.nameString = name;
				this.effect = effect;
			}
			
			public Effect getEffect() {
				return this.effect;
			}
			public int getMpCost() {
				return this.mpCost;
			}

			@Override
			public String toString() {
				return PSGame.getString(nameString);
			}
 	};
		
		
 	// Called when the spell is select
 	public static PSEffect prepareSpell(Spell spell, PartyMember caster) {
 		
 		if(caster.mp < spell.getMpCost()) {
 			PSMenu.Stext(PSGame.getString("Magic_Not_Enough"));
 			return null;
 		}

 		PSEffect effect = new PSEffect(spell.getEffect());
 		effect.setUser(caster);
 		
 		if(spell.getEffect().getTarget() == EffectTarget.MEMBER || spell.getEffect().getTarget() == EffectTarget.ALIVE_MEMBER) {
			int partySel = 1;
			if(PSGame.getParty().partySize() > 1) {
				PSMenu.instance.push(PSMenu.instance.createPromptBox(130, 70, PSGame.getParty().listMembers(), true));
				partySel = PSMenu.instance.waitOpt(Cancellable.TRUE) + 1;
				PSMenu.instance.pop();
			}
			
			if(partySel == 0) {
				return null;
			}
			PartyMember target = PSGame.getParty().getMember(partySel-1);
			if(spell.getEffect().getTarget() == EffectTarget.ALIVE_MEMBER && target.getHp() <= 0) {
				PSMenu.Stext(PSGame.getString("Battle_Player_Dead", "<player>", target.getName()));
				return null;
			}
			
			effect.setTarget(target);
 		}
 		
 		if(spell == PS1Spell.REST || spell == PS1Spell.W_REST) {
 			effect.setValue(20);
 		} else if (spell == PS1Spell.CURE || spell == PS1Spell.W_CURE) {
 			effect.setValue(80);
 		} else if (spell == PS1Spell.POWER_CURE) {
 			effect.setValue(200);
 		}
 		
 		
 		return effect;
 	}
 	
 	// Called when spell is issued (after prepareSpell in World or at the proper turn in Battle)
 	public static EffectOutcome castSpell(Spell spell, PSEffect effect) {
 		
 		PartyMember p = effect.getUser();
 		
 		if(p.mp < spell.getMpCost()) { // Validate again for battle purposes
 			PSMenu.Stext(PSGame.getString("Magic_Not_Enough"));
 			return EffectOutcome.NONE;
 		}

 		if(	spell.getEffect() != Effect.FIRE &&	spell.getEffect() != Effect.WIND &&	spell.getEffect() != Effect.THUNDER) {
			PSGame.playSound(PS1Sound.SPELL);
 		}
 		
 		p.mp -= spell.getMpCost();

 		if(p.textBox != null) { // in battle
 			p.textBox.updateText(2, PSGame.getString("Stats_MP") + ":" + PSGame.format(p.getMp(), 4));
 		}
 		
 		EffectOutcome callEffect = effect.callEffect();
 		if(callEffect == EffectOutcome.FAIL) {
			PSMenu.Stext(PSGame.getString("Magic_Player_Fail", "<player>", effect.getUser().getName())); 			
 		}
 		return callEffect;
 	}
 	
 	
	
}
