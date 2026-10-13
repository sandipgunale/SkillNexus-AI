const GOOGLE_SCRIPT_URL =
  "https://accounts.google.com/gsi/client";

let googleScriptPromise = null;

export function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.accounts?.id) {
          resolve(window.google);
        } else {
          reject(
            new Error(
              "Google Identity Services loaded but is unavailable."
            )
          );
        }
      });

      existingScript.addEventListener("error", () => {
        reject(
          new Error("Failed to load Google Identity Services.")
        );
      });

      return;
    }

    const script = document.createElement("script");

    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
      } else {
        reject(
          new Error(
            "Google Identity Services loaded but is unavailable."
          )
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error("Failed to load Google Identity Services.")
      );
    };

    document.head.appendChild(script);
  });

  return googleScriptPromise;
}