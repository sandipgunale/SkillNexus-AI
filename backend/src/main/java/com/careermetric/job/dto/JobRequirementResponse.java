package com.careermetric.job.dto;

import com.careermetric.job.entity.JobRequirementType;

public record JobRequirementResponse(
        Long id,
        String requirement,
        JobRequirementType type
) {
}