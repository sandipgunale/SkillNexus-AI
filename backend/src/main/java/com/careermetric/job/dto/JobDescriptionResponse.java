package com.careermetric.job.dto;

import com.careermetric.job.entity.JobDescriptionStatus;

import java.time.LocalDateTime;

public record JobDescriptionResponse(

        Long id,

        String title,

        String descriptionText,

        JobDescriptionStatus status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}