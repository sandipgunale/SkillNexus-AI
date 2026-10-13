package com.careermetric.auth.service;

import com.careermetric.auth.dto.AuthResponse;
import com.careermetric.auth.dto.GoogleLoginRequest;
import com.careermetric.auth.dto.LoginRequest;
import com.careermetric.auth.dto.RegisterRequest;
import com.careermetric.auth.entity.Role;
import com.careermetric.auth.entity.User;
import com.careermetric.auth.repository.UserRepository;
import com.careermetric.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            GoogleTokenVerifierService googleTokenVerifierService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.googleTokenVerifierService = googleTokenVerifierService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists"
            );
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                null
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid credentials"
                        )
                );

        return createAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {

        GoogleIdToken.Payload payload =
                googleTokenVerifierService.verify(request.idToken());

        String googleSubject = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        if (googleSubject == null || googleSubject.isBlank()) {
            throw new IllegalArgumentException(
                    "Google account identifier is missing"
            );
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Google account email is missing"
            );
        }

        email = email.trim().toLowerCase();

        /*
         * First, find the user using Google's stable subject identifier.
         * This is the primary Google account lookup.
         */
        User user = userRepository
                .findByGoogleSubject(googleSubject)
                .orElse(null);

        if (user != null) {
            return createAuthResponse(user);
        }

        /*
         * A user may already have an email/password account with the
         * same email address.
         *
         * We do not automatically attach the Google identity to that
         * existing account. This avoids silently linking authentication
         * methods without an explicit account-linking flow.
         */
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists. " +
                    "Please log in with your password."
            );
        }

        /*
         * No existing account was found.
         * Create a new Google-authenticated user.
         *
         * Password remains null because this account authenticates
         * through Google.
         */
        User googleUser = new User();
        googleUser.setName(
                name != null && !name.isBlank()
                        ? name.trim()
                        : email
        );
        googleUser.setEmail(email);
        googleUser.setPassword(null);
        googleUser.setGoogleSubject(googleSubject);
        googleUser.setRole(Role.USER);

        User savedUser = userRepository.save(googleUser);

        return createAuthResponse(savedUser);
    }

    private AuthResponse createAuthResponse(User user) {
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                token
        );
    }
}