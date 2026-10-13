package com.careermetric.assessment.dto;

import com.careermetric.assessment.entity.AssessmentDifficulty;
import jakarta.validation.constraints.NotNull;

public record CreateAssessmentRequest(

        @NotNull(message = "Technology ID is required")
        Long technologyId,

        @NotNull(message = "Difficulty is required")
        AssessmentDifficulty difficulty

) {
}