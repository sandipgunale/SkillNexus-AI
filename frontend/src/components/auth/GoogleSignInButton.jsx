import { useEffect, useRef, useState } from "react";

import { loadGoogleIdentityServices } from "../../services/auth/googleAuthService";

let googleInitialized = false;

function GoogleSignInButton({
  onSuccess,
  onError,
  text = "signin_with",
}) {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onSuccess);
  const errorRef = useRef(onError);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callbackRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;

    async function initializeGoogleSignIn() {
      try {
        const google = await loadGoogleIdentityServices();

        if (cancelled || !buttonRef.current) {
          return;
        }

        const clientId =
          import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
          throw new Error(
            "VITE_GOOGLE_CLIENT_ID is not configured."
          );
        }

        if (!googleInitialized) {
          google.accounts.id.initialize({
            client_id: clientId,

            callback: async (credentialResponse) => {
              if (!credentialResponse?.credential) {
                errorRef.current?.(
                  new Error(
                    "Google did not return an ID token."
                  )
                );

                return;
              }

              try {
                await callbackRef.current(
                  credentialResponse.credential
                );
              } catch (error) {
                errorRef.current?.(error);
              }
            },
          });

          googleInitialized = true;
        }

        if (buttonRef.current) {
          buttonRef.current.innerHTML = "";

          google.accounts.id.renderButton(
            buttonRef.current,
            {
              type: "standard",
              theme: "outline",
              size: "large",
              text,
              shape: "rectangular",
              logo_alignment: "left",
              width: 400,
            }
          );
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setLoading(false);
          errorRef.current?.(error);
        }
      }
    }

    initializeGoogleSignIn();

    return () => {
      cancelled = true;

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, [text]);

  return (
    <div className="flex w-full justify-center">
      {loading && (
        <div className="flex h-10 w-full max-w-[400px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white/50">
          Loading Google Sign-In...
        </div>
      )}

      <div
        ref={buttonRef}
        className={loading ? "hidden" : "block"}
      />
    </div>
  );
}

export default GoogleSignInButton;