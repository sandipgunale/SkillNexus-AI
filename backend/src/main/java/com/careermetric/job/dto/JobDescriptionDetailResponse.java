package com.careermetric.job.dto;

import com.careermetric.job.entity.JobDescriptionStatus;

import java.time.LocalDateTime;
import java.util.List;

public record JobDescriptionDetailResponse(
        Long id,
        String title,
        String descriptionText,
        JobDescriptionStatus status,
        List<JobRequirementResponse> requirements,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}