package com.careermetric.assessment.dto;

import com.careermetric.assessment.entity.AttemptStatus;

import java.time.LocalDateTime;

public record AssessmentAttemptResponse(

        Long id,

        Long assessmentId,

        String technologyName,

        AttemptStatus status,

        Integer score,

        Integer correctAnswers,

        Integer totalQuestions,

        LocalDateTime startedAt,

        LocalDateTime completedAt
) {
}