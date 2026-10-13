package com.careermetric.security.service;

import com.careermetric.auth.entity.User;
import com.careermetric.auth.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserServiceImpl implements CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserServiceImpl(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Override
    public Long getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuthenticationToken)) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Authenticated JWT user not found"
            );
        }

        String subject =
                jwtAuthenticationToken
                        .getToken()
                        .getSubject();

        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Invalid user identifier in JWT"
            );
        }
    }

    @Override
    public User getCurrentUser() {

        Long userId = getCurrentUserId();

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new AuthenticationCredentialsNotFoundException(
                                "Authenticated user not found"
                        )
                );
    }
}