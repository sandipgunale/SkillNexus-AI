package com.careermetric.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateJobDescriptionRequest(

        @NotBlank(message = "Job title is required")
        @Size(
                max = 255,
                message = "Job title must not exceed 255 characters"
        )
        String title,

        @NotBlank(message = "Job description is required")
        @Size(
                min = 50,
                max = 20000,
                message = "Job description must be between 50 and 20000 characters"
        )
        String descriptionText
) {
}