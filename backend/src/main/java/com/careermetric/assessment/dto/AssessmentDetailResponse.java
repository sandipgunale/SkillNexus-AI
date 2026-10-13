package com.careermetric.assessment.dto;

import com.careermetric.assessment.entity.AssessmentDifficulty;
import com.careermetric.assessment.entity.AssessmentStatus;

import java.time.LocalDateTime;
import java.util.List;

public record AssessmentDetailResponse(

        Long id,

        Long technologyId,

        String technologyName,

        AssessmentDifficulty difficulty,

        AssessmentStatus status,

        Integer questionCount,

        List<QuestionResponse> questions,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}