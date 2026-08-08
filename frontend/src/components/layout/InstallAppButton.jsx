import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";

/**
 * A button that prompts the user to install the app as a PWA.
 *
 * Chrome/Edge fire a `beforeinstallprompt` event when the app meets the
 * installability criteria. We capture it and re-trigger it on click, which
 * is more reliable (and more demo-friendly) than relying on the tiny
 * install icon in the address bar.
 */
function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // iOS Safari does not support beforeinstallprompt — show a hint instead.
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      // Prevent Chrome's automatic mini-infobar so we control the prompt.
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
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
