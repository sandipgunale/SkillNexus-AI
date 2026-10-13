package com.careermetric.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitAnswerRequest(

        @NotNull(message = "Question ID is required")
        Long questionId,

        @NotBlank(message = "Selected answer is required")
        String selectedAnswer
) {
}