package com.careermetric.interview.dto;

import java.time.LocalDateTime;
import java.util.List;

public record InterviewResultResponse(

        Long interviewId,

        String technologyName,

        String difficulty,

        Integer score,

        Integer totalQuestions,

        Integer answeredQuestions,

        LocalDateTime startedAt,

        LocalDateTime completedAt,

        List<InterviewEvaluationResponse> evaluations

) {
}