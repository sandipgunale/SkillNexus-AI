package com.careermetric.job.dto;

import jakarta.validation.constraints.NotNull;

public record JobMatchRequest(

        @NotNull(message = "Resume ID is required")
        Long resumeId,

        @NotNull(message = "Job description ID is required")
        Long jobDescriptionId
) {
}