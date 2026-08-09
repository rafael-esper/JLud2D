/**
 * PSCloudMenu - the in-canvas "Phantasy Cloud" menu.
 *
 * Everything the player reads is drawn by the normal PS menu system (red
 * cursor, circles, the same boxes as Save/Load); only the two moments that
 * genuinely need typing hand off to the DOM overlay in PSCloudForm. That split
 * is deliberate — an on-canvas keyboard would be slow on desktop and miserable
 * on a phone, while a fully DOM menu would look nothing like the game.
 *
 * Reachable from both the title screen and the in-game pause menu.
 */

import { PSMenu } from '../PSMenu';
import { PSGame } from '../PSGame';
import { PSCancellable } from '../menu/MenuStack';
import { SaveManager } from '../game/SaveManager';
import { PSCloudClient, type CloudSlot } from './PSCloudClient';
import { PSCloudForm } from './PSCloudForm';
import { PSCloudStats } from './PSCloudStats';

export class PSCloudMenu {
  /**
   * Open the menu and run it until the player backs out.
   *
   * The caller keeps ownership of its own menu boxes; this method always leaves
   * the stack exactly as it found it.
   */
  public static async open(): Promise<void> {
    if (!PSCloudClient.isConfigured()) {
      await PSMenu.Stext(PSGame.getString('Cloud_Unavailable'));
      return;
    }

    if (!PSCloudClient.isSessionChecked()) {
      await PSCloudClient.restoreSession();
    }

    while (true) {
      const signedIn = PSCloudClient.isSignedIn();
      const options = signedIn
        ? [
            PSGame.getString('Cloud_Upload'),
            PSGame.getString('Cloud_Download'),
            PSGame.getString('Cloud_Account'),
            PSGame.getString('Cloud_Signout')
          ]
        : [PSGame.getString('Cloud_Signin')];

      PSMenu.instance.push(PSMenu.instance.createPromptBox(70, 60, options, true));
      const opt = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
      PSMenu.instance.pop();

      if (opt === -1) return; // backed out

      if (!signedIn) {
        await PSCloudMenu.signInFlow();
        continue;
      }

      if (opt === 0) await PSCloudMenu.uploadFlow();
      if (opt === 1) await PSCloudMenu.downloadFlow();
      if (opt === 2) await PSCloudMenu.accountInfo();
      if (opt === 3) {
        if (await PSCloudMenu.signOutFlow()) continue;
      }
    }
  }

  // ------------------------------------------------------------- sign in

  /**
   * Email → code → session. The consent notice comes first: the account is
   * itself the opt-in for storing saves and play statistics, so the player has
   * to see what it means before an address is collected.
   */
  private static async signInFlow(): Promise<void> {
    const agreed = await PSMenu.Prompt(PSGame.getString('Cloud_Consent'), PSGame.getYesNo());
    PSMenu.instance.pop(); // Prompt leaves its text box on the stack
    if (agreed !== 1) return;

    const email = await PSCloudForm.promptEmail(async (value) => {
      const result = await PSCloudClient.requestCode(value);
      return result.ok ? null : PSGame.getString(result.error!);
    });
    if (!email) return; // cancelled

    while (true) {
      const outcome = await PSCloudForm.promptCode(email, async (code) => {
        const result = await PSCloudClient.verifyCode(email, code);
        return result.ok ? null : PSGame.getString(result.error!);
      });

      if (outcome.action === 'cancel') return;

      if (outcome.action === 'resend') {
        const resent = await PSCloudClient.requestCode(email);
        if (!resent.ok) {
          await PSMenu.Stext(PSGame.getString(resent.error!));
        }
        continue;
      }

      // Verified. Push whatever is already on this device so the account is
      // useful straight away rather than only from the next save onwards.
      await PSMenu.Stext(PSGame.getString('Cloud_Welcome', '<email>', email));
      const pushed = await PSCloudClient.pushAll();
      if (pushed.ok && (pushed.value ?? 0) > 0) {
        await PSMenu.Stext(
          PSGame.getString('Cloud_Uploaded', '<count>', String(pushed.value))
        );
      }
      void PSCloudStats.flush(true);
      return;
    }
  }

  private static async signOutFlow(): Promise<boolean> {
    const confirmed = await PSMenu.Prompt(PSGame.getString('Cloud_Signout_Confirm'), PSGame.getYesNo());
    PSMenu.instance.pop();
    if (confirmed !== 1) return false;

    // Flush before the session goes away, or this session's playtime is lost.
    await PSCloudStats.flush(true);
    await PSCloudClient.signOut();
    await PSMenu.Stext(PSGame.getString('Cloud_Signed_Out'));
    return true;
  }

  // -------------------------------------------------------------- saves

  private static async uploadFlow(): Promise<void> {
    if (!SaveManager.hasAnySave()) {
      await PSMenu.Stext(PSGame.getString('Menu_No_Saves'));
      return;
    }

    const result = await PSCloudClient.pushAll();
    if (!result.ok) {
      await PSMenu.Stext(PSGame.getString(result.error!));
      return;
    }
    await PSMenu.Stext(
      PSGame.getString('Cloud_Uploaded', '<count>', String(result.value ?? 0))
    );
    void PSCloudStats.flush(true);
  }

  /**
   * Pull a cloud save down into its original slot number. Keeping the slot
   * identity is the least surprising behaviour across devices, and the
   * downloaded save then shows up in the ordinary Load Game list — this is the
   * whole cross-device continue path.
   */
  private static async downloadFlow(): Promise<void> {
    const listed = await PSCloudClient.listCloudSlots();
    if (!listed.ok) {
      await PSMenu.Stext(PSGame.getString(listed.error!));
      return;
    }

    const slots = listed.value ?? [];
    if (slots.length === 0) {
      await PSMenu.Stext(PSGame.getString('Cloud_No_Saves'));
      return;
    }

    const labels = slots.map((entry) => PSCloudMenu.describe(entry));
    PSMenu.instance.push(PSMenu.instance.createPromptBox(10, 2, labels, true));
    const choice = await PSMenu.instance.waitOpt(PSCancellable.TRUE);
    PSMenu.instance.pop();
    if (choice < 0) return;

    const picked = slots[choice];

    if (SaveManager.getMeta(picked.slot)) {
      const confirmed = await PSMenu.Prompt(
        PSGame.getString('Menu_Overwrite_Prompt'),
        PSGame.getYesNo()
      );
      PSMenu.instance.pop();
      if (confirmed !== 1) return;
    }

    const pulled = await PSCloudClient.pullSlot(picked.slot);
    if (!pulled.ok || !pulled.value) {
      await PSMenu.Stext(PSGame.getString(pulled.error ?? 'Cloud_Err_Generic'));
      return;
    }

    const written = SaveManager.writeSlotData(picked.slot, pulled.value.data, pulled.value.meta);
    await PSMenu.Stext(PSGame.getString(written ? 'Cloud_Downloaded' : 'Menu_Save_Failed'));
  }

  /** "3. Naula, lvl 15, 16-set" — slot number plus the save's own label. */
  private static describe(entry: CloudSlot): string {
    const label = entry.meta?.label ?? PSGame.getString('Menu_Empty_Slot');
    return `${entry.slot + 1}. ${label}`;
  }

  // ------------------------------------------------------------ account

  private static async accountInfo(): Promise<void> {
    const email = PSCloudClient.getEmail() ?? '';
    await PSMenu.Stext(PSGame.getString('Cloud_Signedin_As', '<email>', email));
  }
}
