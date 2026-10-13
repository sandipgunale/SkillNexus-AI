package com.careermetric.security.controller;

import com.careermetric.auth.entity.User;
import com.careermetric.common.dto.ApiResponse;
import com.careermetric.security.service.CurrentUserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/security")
@SecurityRequirement(name = "bearerAuth")
public class SecurityTestController {

    private final CurrentUserService currentUserService;

    public SecurityTestController(
            CurrentUserService currentUserService
    ) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me() {

        User user = currentUserService.getCurrentUser();

        UserProfileResponse response =
                new UserProfileResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name()
                );

        return ApiResponse.success(
                "Authenticated user retrieved successfully",
                response
        );
    }

    public record UserProfileResponse(
            Long userId,
            String name,
            String email,
            String role
    ) {
    }
}