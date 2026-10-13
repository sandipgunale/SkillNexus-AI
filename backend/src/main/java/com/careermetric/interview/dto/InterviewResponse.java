package com.careermetric.interview.dto;

import com.careermetric.interview.entity.InterviewDifficulty;
import com.careermetric.interview.entity.InterviewStatus;

import java.time.LocalDateTime;

public record InterviewResponse(

        Long id,

        Long technologyId,

        String technologyName,

        InterviewDifficulty difficulty,

        InterviewStatus status,

        Integer questionCount,

        Integer score,

        LocalDateTime startedAt,

        LocalDateTime completedAt
) {
}