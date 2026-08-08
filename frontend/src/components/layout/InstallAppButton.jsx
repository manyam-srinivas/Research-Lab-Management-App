import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";

import {
  subscribeInstallPrompt,
  consumeInstallPrompt,
} from "../../utils/installPrompt";

/**
 * A button that prompts the user to install the app as a PWA.
 *
 * Chrome/Edge fire a `beforeinstallprompt` event when the app meets the
 * installability criteria. The event is captured app-wide (see
 * utils/installPrompt.js) so it isn't lost while the user is on pages
 * where this button isn't mounted (e.g. the login page). We re-trigger
 * the captured prompt on click, which is more reliable than relying on
 * the tiny install icon in the address bar.
 */
function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // iOS Safari does not support beforeinstallprompt — show a hint instead.
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    // Subscribe to the app-wide prompt state; receives the currently
    // captured prompt immediately, then again whenever it changes.
    const unsubscribe = subscribeInstallPrompt(setDeferredPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      unsubscribe();
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Take the captured prompt (hides the button immediately) and show
    // the browser's native install dialog.
    const prompt = consumeInstallPrompt();

    await prompt.prompt();
    await prompt.userChoice;
  };

  // Already installed, or not installable yet — hide the button.
  if (isInstalled || (!deferredPrompt && !isIOS)) {
    return null;
  }

  if (isIOS) {
    return (
      <button
        title="Install this app: tap Share, then 'Add to Home Screen'"
        className="text-lg text-slate-600 hover:text-blue-600 transition"
        onClick={() =>
          alert(
            "To install on iPhone/iPad: tap the Share button, then 'Add to Home Screen'."
          )
        }
      >
        <FaDownload />
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      title="Install RLMS as an app"
      className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
    >
      <FaDownload className="text-xs" />
      <span className="hidden md:inline">Install App</span>
    </button>
  );
}

export default InstallAppButton;
