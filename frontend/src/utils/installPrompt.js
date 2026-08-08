/**
 * App-wide PWA install prompt capture.
 *
 * Chrome/Edge fire the `beforeinstallprompt` event only ONCE per page
 * load. If the install button isn't mounted when it fires (e.g. the
 * user is on the login page, where the navbar — and therefore the
 * button — doesn't exist), the event is lost and the button can never
 * appear later in the session.
 *
 * By attaching the listener here at module scope, the event is captured
 * on every page as soon as the bundle loads. Components subscribe via
 * `subscribeInstallPrompt` and get notified whenever the prompt state
 * changes.
 */

let deferredPrompt = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(deferredPrompt));
}

export function subscribeInstallPrompt(fn) {
  listeners.add(fn);
  // Report the current value immediately on subscribe.
  fn(deferredPrompt);
  return () => {
    listeners.delete(fn);
  };
}

function captureInstallPrompt(event) {
  // Prevent Chrome's automatic mini-infobar so we control the prompt.
  event.preventDefault();
  deferredPrompt = event;
  notify();
}

export function consumeInstallPrompt() {
  const prompt = deferredPrompt;
  deferredPrompt = null;
  notify();
  return prompt;
}

function markAppInstalled() {
  deferredPrompt = null;
  notify();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", captureInstallPrompt);
  window.addEventListener("appinstalled", markAppInstalled);
}
