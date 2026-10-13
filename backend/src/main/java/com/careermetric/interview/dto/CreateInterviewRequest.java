package com.careermetric.interview.dto;

import com.careermetric.interview.entity.InterviewDifficulty;
import jakarta.validation.constraints.NotNull;

public record CreateInterviewRequest(

        @NotNull(message = "Technology ID is required")
        Long technologyId,

        @NotNull(message = "Difficulty is required")
        InterviewDifficulty difficulty
) {
}