package com.careermetric.assessment.dto;

import com.careermetric.assessment.entity.AssessmentDifficulty;
import com.careermetric.assessment.entity.AssessmentStatus;

import java.time.LocalDateTime;

public record AssessmentResponse(

        Long id,

        Long technologyId,

        String technologyName,

        AssessmentDifficulty difficulty,

        AssessmentStatus status,

        Integer questionCount,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}