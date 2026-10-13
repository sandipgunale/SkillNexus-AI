package com.careermetric.resume.scoring;

import com.careermetric.resume.dto.ScoreBreakdown;

public record ResumeScoringResult(
        Integer overallScore,
        ScoreBreakdown scoreBreakdown
) {
}