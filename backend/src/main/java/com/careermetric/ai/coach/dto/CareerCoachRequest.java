package com.careermetric.ai.coach.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CareerCoachRequest(

        @NotBlank(message = "Question is required")
        @Size(
                max = 2000,
                message = "Question must not exceed 2000 characters"
        )
        String question,

        @NotBlank(message = "Conversation ID is required")
        @Size(
                max = 100,
                message = "Conversation ID must not exceed 100 characters"
        )
        String conversationId
) {
}