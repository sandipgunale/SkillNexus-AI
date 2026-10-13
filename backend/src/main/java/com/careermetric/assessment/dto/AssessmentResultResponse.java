package com.careermetric.assessment.dto;

import java.time.LocalDateTime;

public record AssessmentResultResponse(

        Long attemptId,

        Long assessmentId,

        String technologyName,

        String difficulty,

        Integer score,

        Integer correctAnswers,

        Integer totalQuestions,

        Integer answeredQuestions,

        LocalDateTime startedAt,

        LocalDateTime completedAt
) {
}