package com.careermetric.resume.dto;

import com.careermetric.ai.dto.ResumeSectionAnalysis;

import java.util.List;

public record ResumeAnalysisResponse(
        Long resumeId,
        Integer overallScore,
        ScoreBreakdown scoreBreakdown,
        String summary,
        List<String> strengths,
        List<String> weaknesses,
        List<String> missingElements,
        List<String> suggestions,
        List<ResumeRecommendationData> recommendations,
        ResumeSectionAnalysis sections
) {
}