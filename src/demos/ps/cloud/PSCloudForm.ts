/**
 * PSCloudForm - DOM text-entry overlay for Phantasy Cloud sign-in.
 *
 * The game has no text input of its own: InputManager is a polled bitfield of
 * game buttons, and nothing in the engine reads characters. Rendering the email
 * and code fields as real DOM <input> elements over the canvas is what buys the
 * native mobile keyboard, address autofill, and — critically — the OS
 * one-time-code suggestion (autocomplete="one-time-code"), none of which can be
 * reproduced by drawing a keyboard inside the canvas.
 *
 * Styled to match EmulatorUI's chrome (same palette and monospace face) so the
 * two overlays read as one piece of hardware around the game.
 *
 * Both prompts take a `submit` callback that does the network work and returns
 * a localized error message, or null on success. Keeping the request inside the
 * form means a wrong code or a rate-limit is corrected in place, with the typed
 * value still there, instead of bouncing back out to the canvas menu.
 */

import { PSMenu } from '../PSMenu';
import { PSGame } from '../PSGame';

const STYLE_ID = 'ps-cloud-style';
const ROOT_ID = 'ps-cloud-root';

/** Outcome of the code prompt. `resend` asks the caller to mail a new code. */
export type CodePromptResult =
  | { action: 'verified' }
  | { action: 'resend' }
  | { action: 'cancel' };

/** Returns a localized error message to display in place, or null on success. */
type SubmitFn = (value: string) => Promise<string | null>;

interface FieldSpec {
  title: string;
  hint: string;
  submitLabel: string;
  initialValue: string;
  /** Extra button rendered next to Cancel (used for "Send a new code"). */
  altLabel?: string;
  attrs: Record<string, string>;
}

export class PSCloudForm {
  private static root: HTMLDivElement | null = null;
  private static open = false;

  /** True while a form is on screen — the caller must not poll game input. */
  public static isOpen(): boolean {
    return PSCloudForm.open;
  }

  /**
   * Ask for an email address and hand it to `submit`.
   * @returns the accepted address, or null if the player backed out.
   */
  public static async promptEmail(submit: SubmitFn): Promise<string | null> {
    const result = await PSCloudForm.run(
      {
        title: PSGame.getString('Cloud_Title'),
        hint: PSGame.getString('Cloud_Email_Prompt'),
        submitLabel: PSGame.getString('Cloud_Send_Code'),
        initialValue: '',
        attrs: {
          type: 'email',
          inputmode: 'email',
          autocomplete: 'email',
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: 'false',
          enterkeyhint: 'send',
          placeholder: 'name@example.com',
          maxlength: '254'
        }
      },
      submit
    );
    return result.action === 'submitted' ? result.value : null;
  }

  /**
   * Ask for the 6-digit code mailed to `email`.
   *
   * `autocomplete="one-time-code"` plus a numeric inputmode is what makes iOS
   * and Android offer the code straight from the notification, turning the
   * slowest step of the flow into a single tap.
   */
  public static async promptCode(email: string, submit: SubmitFn): Promise<CodePromptResult> {
    const result = await PSCloudForm.run(
      {
        title: PSGame.getString('Cloud_Title'),
        hint: PSGame.getString('Cloud_Code_Prompt', '<email>', email),
        submitLabel: PSGame.getString('Cloud_Confirm'),
        initialValue: '',
        altLabel: PSGame.getString('Cloud_Resend'),
        attrs: {
          type: 'text',
          inputmode: 'numeric',
          pattern: '[0-9]*',
          autocomplete: 'one-time-code',
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: 'false',
          enterkeyhint: 'done',
          placeholder: '000000',
          maxlength: '6'
        }
      },
      submit
    );

    if (result.action === 'submitted') return { action: 'verified' };
    if (result.action === 'alt') return { action: 'resend' };
    return { action: 'cancel' };
  }

  // --------------------------------------------------------------- core

  /**
   * Build, show and drive one field. Resolves once the player submits
   * successfully, taps the alternate action, or cancels.
   */
  private static run(
    spec: FieldSpec,
    submit: SubmitFn
  ): Promise<{ action: 'submitted'; value: string } | { action: 'alt' } | { action: 'cancel' }> {
    PSCloudForm.injectStyle();

    return new Promise((resolve) => {
      const root = document.createElement('div');
      root.id = ROOT_ID;

      const panel = document.createElement('div');
      panel.className = 'ps-cloud-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');

      const title = document.createElement('h2');
      title.className = 'ps-cloud-title';
      title.textContent = spec.title;

      const hint = document.createElement('p');
      hint.className = 'ps-cloud-hint';
      hint.textContent = spec.hint;

      const input = document.createElement('input');
      input.className = 'ps-cloud-input';
      for (const [name, value] of Object.entries(spec.attrs)) {
        input.setAttribute(name, value);
      }
      input.value = spec.initialValue;

      const error = document.createElement('p');
      error.className = 'ps-cloud-error';
      error.setAttribute('role', 'alert');
      error.hidden = true;

      const actions = document.createElement('div');
      actions.className = 'ps-cloud-actions';

      const submitBtn = document.createElement('button');
      submitBtn.className = 'ps-cloud-btn ps-cloud-primary';
      submitBtn.type = 'button';
      submitBtn.textContent = spec.submitLabel;

      const altBtn = spec.altLabel ? document.createElement('button') : null;
      if (altBtn) {
        altBtn.className = 'ps-cloud-btn';
        altBtn.type = 'button';
        altBtn.textContent = spec.altLabel!;
      }

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'ps-cloud-btn';
      cancelBtn.type = 'button';
      cancelBtn.textContent = PSGame.getString('Cloud_Cancel');

      actions.append(submitBtn);
      if (altBtn) actions.append(altBtn);
      actions.append(cancelBtn);
      panel.append(title, hint, input, error, actions);
      root.append(panel);
      document.body.append(root);

      PSCloudForm.root = root;
      PSCloudForm.open = true;

      // Take the input lock so the menu/battle loop that is already polling
      // (each PS loop runs its own delayedCall poll) stops reacting while the
      // player types, and does not consume the button that closes this form.
      const inputLock = {};
      const inputManager = PSMenu.instance?.getInputManager() ?? null;
      inputManager?.lockInput(inputLock);

      // Phaser's keyboard manager calls preventDefault() on every key it has
      // captured — which is most of the alphabet here, because the control
      // bindings cover W/A/S/D/Z/X/C/I/J/K/L/... Left enabled, the player
      // simply could not type an email address. Suspending the manager for the
      // lifetime of the form is the only reliable fix; the input lock above
      // already stops the game reacting to anything in the meantime.
      PSCloudForm.setPhaserKeyboardEnabled(false);

      let busy = false;

      const setBusy = (value: boolean) => {
        busy = value;
        submitBtn.disabled = value;
        input.disabled = value;
        if (altBtn) altBtn.disabled = value;
        submitBtn.classList.toggle('ps-cloud-busy', value);
        submitBtn.textContent = value ? PSGame.getString('Cloud_Working') : spec.submitLabel;
      };

      const showError = (message: string) => {
        error.textContent = message;
        error.hidden = false;
      };

      const finish = (result: { action: 'submitted'; value: string } | { action: 'alt' } | { action: 'cancel' }) => {
        cleanup();
        resolve(result);
      };

      const cleanup = () => {
        PSCloudForm.open = false;
        PSCloudForm.root = null;
        window.removeEventListener('resize', reposition);
        window.visualViewport?.removeEventListener('resize', reposition);
        window.visualViewport?.removeEventListener('scroll', reposition);
        root.remove();

        PSCloudForm.setPhaserKeyboardEnabled(true);
        inputManager?.unlockInput(inputLock);
        inputManager?.clearInputs();
        PSCloudForm.clearHeldTouchButtons();
      };

      const onSubmit = async () => {
        if (busy) return;
        const value = input.value.trim();
        if (!value) {
          showError(PSGame.getString('Cloud_Err_Empty'));
          input.focus();
          return;
        }

        error.hidden = true;
        setBusy(true);
        let message: string | null;
        try {
          message = await submit(value);
        } catch (err) {
          console.error('PSCloudForm: submit handler threw', err);
          message = PSGame.getString('Cloud_Err_Generic');
        }
        // The player may have cancelled while the request was in flight.
        if (!PSCloudForm.open) return;
        setBusy(false);

        if (message) {
          showError(message);
          input.select();
          input.focus();
          return;
        }
        finish({ action: 'submitted', value });
      };

      submitBtn.addEventListener('click', onSubmit);
      altBtn?.addEventListener('click', () => { if (!busy) finish({ action: 'alt' }); });
      cancelBtn.addEventListener('click', () => finish({ action: 'cancel' }));

      // Tapping the backdrop cancels; taps inside the panel must not.
      root.addEventListener('pointerdown', (ev) => {
        if (ev.target === root && !busy) finish({ action: 'cancel' });
      });

      // Keystrokes must not escape to the document: EmulatorUI listens for
      // keydown in the capture phase (key rebinding / Escape), and Phaser's
      // keyboard plugin would otherwise see the typing as game input.
      panel.addEventListener('keydown', (ev) => {
        ev.stopPropagation();
        if (ev.key === 'Enter') {
          ev.preventDefault();
          void onSubmit();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          if (!busy) finish({ action: 'cancel' });
        }
      });

      // On phones the software keyboard shrinks the visual viewport; anchoring
      // the panel to visualViewport (rather than the layout viewport) keeps the
      // field above the keyboard instead of behind it.
      const reposition = () => {
        const vv = window.visualViewport;
        if (!vv) return;
        panel.style.setProperty('--ps-cloud-top', `${vv.offsetTop + vv.height / 2}px`);
        panel.style.setProperty('--ps-cloud-max-h', `${vv.height - 24}px`);
      };
      window.addEventListener('resize', reposition);
      window.visualViewport?.addEventListener('resize', reposition);
      window.visualViewport?.addEventListener('scroll', reposition);
      reposition();

      input.addEventListener('focus', () => {
        // Give the keyboard a moment to animate in before measuring.
        window.setTimeout(() => {
          reposition();
          input.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 250);
      });

      // Autofocus opens the keyboard immediately on mobile, which is what the
      // player wants here — this overlay exists only to be typed into.
      window.setTimeout(() => input.focus(), 0);
    });
  }

  /**
   * Release any virtual-pad button still physically held when the overlay
   * closes. Without this the held button reads as a fresh press on the next
   * frame and instantly picks an entry in the menu underneath (same hazard
   * ConfirmDialog guards against).
   */
  private static clearHeldTouchButtons(): void {
    const mc = (window as any).mobileControls;
    if (mc && mc.buttonStates) {
      for (const key of Object.keys(mc.buttonStates)) {
        mc.buttonStates[key] = false;
      }
    }
  }

  /**
   * Suspend/resume Phaser's global keyboard handling.
   *
   * The game-level KeyboardManager (game.input.keyboard) is what preventDefault's
   * captured keys; the per-scene KeyboardPlugin (scene.input.keyboard) is what
   * updates Key objects. Both are flipped, and both lookups are defensive — a
   * missing plugin must never keep the form from opening.
   */
  private static setPhaserKeyboardEnabled(enabled: boolean): void {
    try {
      const scene: any = PSMenu.instance?.getScene();
      const manager = scene?.game?.input?.keyboard;
      if (manager) manager.enabled = enabled;
      const plugin = scene?.input?.keyboard;
      if (plugin) plugin.enabled = enabled;
    } catch (error) {
      console.error('PSCloudForm: could not toggle Phaser keyboard input', error);
    }
  }

  /** Force-close a form left open by a scene teardown. */
  public static forceClose(): void {
    PSCloudForm.root?.remove();
    PSCloudForm.root = null;
    PSCloudForm.open = false;
    PSCloudForm.setPhaserKeyboardEnabled(true);
  }

  private static injectStyle(): void {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID} {
  --ps-cloud-bg: rgba(10, 12, 26, 0.96);
  --ps-cloud-blue: #4a5ae8;
  --ps-cloud-edge: #262d54;
  --ps-cloud-text: #9aa3d0;
  --ps-cloud-white: #f2f4ff;
  --ps-cloud-red: #e03c30;
  --ps-cloud-top: 50%;
  --ps-cloud-max-h: 100vh;
  position: fixed;
  inset: 0;
  z-index: 2300;
  background: rgba(4, 5, 14, 0.72);
  font-family: ui-monospace, 'Cascadia Mono', 'Courier New', monospace;
  -webkit-tap-highlight-color: transparent;
}
.ps-cloud-panel {
  position: absolute;
  top: var(--ps-cloud-top);
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(340px, calc(100vw - 32px));
  max-height: var(--ps-cloud-max-h);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 18px 18px 16px;
  background: var(--ps-cloud-bg);
  border: 1px solid var(--ps-cloud-blue);
  box-shadow: 0 0 0 1px #090b1c, 0 10px 34px rgba(0, 0, 0, 0.6);
  border-radius: 3px;
}
.ps-cloud-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ps-cloud-white);
}
.ps-cloud-title::before {
  content: '\\25B6 ';
  color: var(--ps-cloud-red);
}
.ps-cloud-hint {
  margin: 0 0 12px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ps-cloud-text);
}
.ps-cloud-input {
  width: 100%;
  box-sizing: border-box;
  /* 16px keeps iOS Safari from zooming the page when the field is focused. */
  font: inherit;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 10px 12px;
  color: var(--ps-cloud-white);
  background: #06070f;
  border: 1px solid var(--ps-cloud-edge);
  border-radius: 2px;
}
.ps-cloud-input:focus {
  outline: none;
  border-color: var(--ps-cloud-blue);
  box-shadow: 0 0 0 1px var(--ps-cloud-blue);
}
.ps-cloud-input:disabled { opacity: 0.6; }
.ps-cloud-input[inputmode="numeric"] {
  text-align: center;
  letter-spacing: 8px;
  font-size: 22px;
}
.ps-cloud-error {
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--ps-cloud-red);
}
.ps-cloud-error[hidden] { display: none; }
.ps-cloud-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.ps-cloud-btn {
  flex: 1 1 auto;
  font: inherit;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  /* 44px tall: a comfortable touch target on a phone. */
  min-height: 44px;
  padding: 6px 12px;
  color: var(--ps-cloud-white);
  background: transparent;
  border: 1px solid var(--ps-cloud-edge);
  border-radius: 2px;
  cursor: pointer;
}
.ps-cloud-btn:hover:not(:disabled), .ps-cloud-btn:focus-visible {
  border-color: var(--ps-cloud-blue);
  background: rgba(74, 90, 232, 0.22);
}
.ps-cloud-primary { border-color: var(--ps-cloud-blue); }
.ps-cloud-btn:disabled { opacity: 0.5; cursor: default; }
.ps-cloud-busy { color: var(--ps-cloud-text); }
`;
    document.head.append(style);
  }
}
