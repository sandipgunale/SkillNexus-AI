package com.careermetric.ai.dto;

import java.util.List;

import com.careermetric.resume.dto.ScoreBreakdown;

public record ResumeAnalysisResponse(
        Long resumeId,
        Integer overallScore,
        ScoreBreakdown scoreBreakdown,
        String summary,
        List<String> strengths,
        List<String> weaknesses,
        List<String> missingElements,
        List<String> suggestions,
        ResumeSectionAnalysis sections
) {
}