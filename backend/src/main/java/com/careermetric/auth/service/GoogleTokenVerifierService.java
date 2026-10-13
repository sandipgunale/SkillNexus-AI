package com.careermetric.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleTokenVerifierService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService(
            @Value("${google.client-id}") String googleClientId
    ) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(
                        Collections.singletonList(googleClientId)
                )
                .build();
    }

    public GoogleIdToken.Payload verify(String idTokenString) {
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new IllegalArgumentException(
                    "Google ID token is required"
            );
        }

        try {
            GoogleIdToken idToken =
                    verifier.verify(idTokenString);

            if (idToken == null) {
                throw new IllegalArgumentException(
                        "Invalid Google ID token"
                );
            }

            GoogleIdToken.Payload payload =
                    idToken.getPayload();

            if (!Boolean.TRUE.equals(
                    payload.getEmailVerified()
            )) {
                throw new IllegalArgumentException(
                        "Google email is not verified"
                );
            }

            return payload;

        } catch (
                GeneralSecurityException |
                IOException exception
        ) {
            throw new IllegalArgumentException(
                    "Unable to verify Google ID token",
                    exception
            );
        }
    }
}